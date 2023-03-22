import { doc, getDoc, getFirestore } from "firebase/firestore";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { NAVIGATION_STEPS_COMPLETE } from "@/lib/utils/tutorials/navigationTutorialSteps";
import { PROPOSAL_STEPS_COMPLETE } from "@/lib/utils/tutorials/proposalTutorialSteps";
import {
  RECONCILING_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
  RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
} from "@/lib/utils/tutorials/reconcilingProposalsTutorialSteps";
import { SEARCHER_STEPS_COMPLETE } from "@/lib/utils/tutorials/searcherTutorialSteps";
import {
  FOCUS_MODE_STEPS,
  REDRAW_GRAPH_STEPS,
  SCROLL_TO_NODE_STEPS,
  TABLE_CONTENT_STEPS,
} from "@/lib/utils/tutorials/toolbooxTutorialSteps";

import { User } from "../knowledgeTypes";
import { devLog } from "../lib/utils/develop.util";
import {
  CHILD_CODE_PROPOSAL_COMPLETE,
  CHILD_CONCEPT_PROPOSAL_COMPLETE,
  CHILD_IDEA_PROPOSAL_COMPLETE,
  CHILD_PROPOSAL_COMPLETE,
  CHILD_QUESTION_PROPOSAL_COMPLETE,
  CHILD_REFERENCE_PROPOSAL_COMPLETE,
  CHILD_RELATION_PROPOSAL_COMPLETE,
} from "../lib/utils/tutorials/childrenProposalTutorialStep";
import { DOWNVOTE_STEPS_COMPLETE, UPTOVE_STEPS_COMPLETE } from "../lib/utils/tutorials/nodeActionsTutorialStep";
import { NODE_CODE } from "../lib/utils/tutorials/nodeCodeTutorialSteps";
import { NODE_CONCEPT } from "../lib/utils/tutorials/nodeConceptTutorialStep";
import { NODE_IDEA } from "../lib/utils/tutorials/nodeIdeaTutorialSteps";
import { NODE_QUESTION } from "../lib/utils/tutorials/nodeQuestionStepTutorialStep";
import { NODE_REFERENCE } from "../lib/utils/tutorials/nodeReferenceTutorialSteps";
import { NODE_RELATION } from "../lib/utils/tutorials/nodeRelationTutorialSteps";
import { NODES_STEPS_COMPLETE } from "../lib/utils/tutorials/nodeTutorialSteps";
import { PROPOSING_CODE_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalCodeTutorialStep";
import { PROPOSING_CONCEPT_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalConceptTutorialStep";
import { PROPOSING_IDEA_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalIdeaTutorialSteps";
import { PROPOSING_QUESTION_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalQuestionTutorialSteps";
import { PROPOSING_REFERENCE_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalReferenceTutorialSteps";
import { PROPOSING_RELATION_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalRelationTutorialSteps";
import {
  TMP_EDIT_NODE,
  TMP_PROPOSE_CHILD_CODE,
  TMP_PROPOSE_CHILD_CONCEPT,
  TMP_PROPOSE_CHILD_IDEA,
  TMP_PROPOSE_CHILD_QUESTION,
  TMP_PROPOSE_CHILD_REFERENCE,
  TMP_PROPOSE_CHILD_RELATION,
} from "../lib/utils/tutorials/temporalTutorialSteps";
import { TutorialStep, TutorialTypeKeys, UserTutorials } from "../nodeBookTypes";

export const DEFAULT_NUMBER_OF_TRIES = 5;

export type Step = {
  targetId: string;
  childTargetId?: string;
  title: string;
  description: ReactNode;
  tooltipPos: "top" | "bottom" | "left" | "right";
  anchor: string;
  callback?: () => void;
  disabledElements: string[];
};

export type TargetClientRect = { width: number; height: number; top: number; left: number };

type useInteractiveTutorialProps = {
  user: User | null;
};

export type Tutorial = { name: TutorialTypeKeys; steps: TutorialStep[]; step: number } | null;

export const useInteractiveTutorial = ({ user }: useInteractiveTutorialProps) => {
  const db = getFirestore();
  const isPlayingTheTutorialRef = useRef(false);
  // const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null);
  const [tutorial, setTutorial] = useState<Tutorial>(null);
  const [targetId, setTargetId] = useState("");
  // const [initialStep, setInitialStep] = useState(0);

  const [userTutorial, setUserTutorial] = useState<UserTutorials>({
    navigation: { currentStep: -1, done: false, skipped: false },
    nodes: { currentStep: -1, done: false, skipped: false },
    searcher: { currentStep: -1, done: false, skipped: false },
    concept: { currentStep: -1, done: false, skipped: false },
    relation: { currentStep: -1, done: false, skipped: false },
    reference: { currentStep: -1, done: false, skipped: false },
    question: { currentStep: -1, done: false, skipped: false },
    idea: { currentStep: -1, done: false, skipped: false },
    code: { currentStep: -1, done: false, skipped: false },
    proposal: { currentStep: -1, done: false, skipped: false },
    proposalConcept: { currentStep: -1, done: false, skipped: false },
    proposalRelation: { currentStep: -1, done: false, skipped: false },
    proposalReference: { currentStep: -1, done: false, skipped: false },
    proposalIdea: { currentStep: -1, done: false, skipped: false },
    proposalQuestion: { currentStep: -1, done: false, skipped: false },
    proposalCode: { currentStep: -1, done: false, skipped: false },
    reconcilingAcceptedProposal: { currentStep: -1, done: false, skipped: false },
    reconcilingNotAcceptedProposal: { currentStep: -1, done: false, skipped: false },
    childProposal: { currentStep: -1, done: false, skipped: false },
    childConcept: { currentStep: -1, done: false, skipped: false },
    childRelation: { currentStep: -1, done: false, skipped: false },
    childReference: { currentStep: -1, done: false, skipped: false },
    childQuestion: { currentStep: -1, done: false, skipped: false },
    childIdea: { currentStep: -1, done: false, skipped: false },
    childCode: { currentStep: -1, done: false, skipped: false },
    tmpEditNode: { currentStep: -1, done: false, skipped: false },
    tmpProposalConceptChild: { currentStep: -1, done: false, skipped: false },
    tmpProposalRelationChild: { currentStep: -1, done: false, skipped: false },
    tmpProposalReferenceChild: { currentStep: -1, done: false, skipped: false },
    tmpProposalQuestionChild: { currentStep: -1, done: false, skipped: false },
    tmpProposalIdeaChild: { currentStep: -1, done: false, skipped: false },
    tmpProposalCodeChild: { currentStep: -1, done: false, skipped: false },
    tableOfContents: { currentStep: -1, done: false, skipped: false },
    focusMode: { currentStep: -1, done: false, skipped: false },
    redrawGraph: { currentStep: -1, done: false, skipped: false },
    scrollToNode: { currentStep: -1, done: false, skipped: false },
    upVote: { currentStep: -1, done: false, skipped: false },
    downVote: { currentStep: -1, done: false, skipped: false },
  });

  // flag for whether tutorial state was loaded
  const [userTutorialLoaded, setUserTutorialLoaded] = useState(false);

  useEffect(() => {
    /**
     * fetch user tutorial state first time
     */
    if (!user) return;
    if (userTutorialLoaded) return;

    devLog("USE_EFFECT: FETCH_USER_TUTORIAL", { userTutorialLoaded, user });
    const getTutorialState = async () => {
      const tutorialRef = doc(db, "userTutorial", user.uname);
      const tutorialDoc = await getDoc(tutorialRef);

      if (tutorialDoc.exists()) {
        const tutorial = tutorialDoc.data() as UserTutorials;
        setUserTutorial(prev => ({ ...prev, ...tutorial }));
      }

      setUserTutorialLoaded(true);
    };

    getTutorialState();
  }, [db, user, userTutorialLoaded]);

  const startTutorial = useCallback((newTutorial: TutorialTypeKeys) => {
    setTutorial(prevTutorial => {
      console.log({ prevTutorial });

      let newSteps: TutorialStep[] = [];
      if (newTutorial === "navigation") {
        newSteps = NAVIGATION_STEPS_COMPLETE;
      }
      if (newTutorial === "nodes") {
        newSteps = NODES_STEPS_COMPLETE;
      }
      if (newTutorial === "searcher") {
        newSteps = SEARCHER_STEPS_COMPLETE;
        setTargetId("");
      }
      if (newTutorial === "concept") {
        newSteps = NODE_CONCEPT;
      }
      if (newTutorial === "relation") {
        newSteps = NODE_RELATION;
      }
      if (newTutorial === "reference") {
        newSteps = NODE_REFERENCE;
      }
      if (newTutorial === "question") {
        newSteps = NODE_QUESTION;
      }
      if (newTutorial === "idea") {
        newSteps = NODE_IDEA;
      }
      if (newTutorial === "code") {
        newSteps = NODE_CODE;
      }
      if (newTutorial === "proposal") {
        newSteps = PROPOSAL_STEPS_COMPLETE;
      }
      if (newTutorial === "proposalConcept") {
        newSteps = PROPOSING_CONCEPT_EDIT_COMPLETE;
      }
      if (newTutorial === "proposalReference") {
        newSteps = PROPOSING_REFERENCE_EDIT_COMPLETE;
      }
      if (newTutorial === "proposalRelation") {
        newSteps = PROPOSING_RELATION_EDIT_COMPLETE;
      }
      if (newTutorial === "proposalIdea") {
        newSteps = PROPOSING_IDEA_EDIT_COMPLETE;
      }
      if (newTutorial === "proposalQuestion") {
        newSteps = PROPOSING_QUESTION_EDIT_COMPLETE;
      }
      if (newTutorial === "proposalCode") {
        newSteps = PROPOSING_CODE_EDIT_COMPLETE;
      }
      if (newTutorial === "reconcilingAcceptedProposal") {
        newSteps = RECONCILING_ACCEPTED_PROPOSALS_STEPS_COMPLETE;
      }
      if (newTutorial === "reconcilingNotAcceptedProposal") {
        newSteps = RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS_COMPLETE;
      }
      if (newTutorial === "childProposal") {
        newSteps = CHILD_PROPOSAL_COMPLETE;
      }
      if (newTutorial === "childConcept") {
        newSteps = CHILD_CONCEPT_PROPOSAL_COMPLETE;
      }
      if (newTutorial === "childRelation") {
        newSteps = CHILD_RELATION_PROPOSAL_COMPLETE;
      }
      if (newTutorial === "childReference") {
        newSteps = CHILD_REFERENCE_PROPOSAL_COMPLETE;
      }
      if (newTutorial === "childQuestion") {
        newSteps = CHILD_QUESTION_PROPOSAL_COMPLETE;
      }
      if (newTutorial === "childIdea") {
        newSteps = CHILD_IDEA_PROPOSAL_COMPLETE;
      }
      if (newTutorial === "childCode") {
        newSteps = CHILD_CODE_PROPOSAL_COMPLETE;
      }
      if (newTutorial === "tableOfContents") {
        newSteps = TABLE_CONTENT_STEPS;
      }
      if (newTutorial === "focusMode") {
        newSteps = FOCUS_MODE_STEPS;
      }
      if (newTutorial === "redrawGraph") {
        newSteps = REDRAW_GRAPH_STEPS;
      }
      if (newTutorial === "scrollToNode") {
        newSteps = SCROLL_TO_NODE_STEPS;
      }

      // node actions

      if (newTutorial === "upVote") {
        newSteps = UPTOVE_STEPS_COMPLETE;
      }

      if (newTutorial === "downVote") {
        newSteps = DOWNVOTE_STEPS_COMPLETE;
      }

      //----------------- tmp nodes

      if (newTutorial === "tmpEditNode") {
        newSteps = TMP_EDIT_NODE;
      }

      if (newTutorial === "tmpProposalConceptChild") {
        newSteps = TMP_PROPOSE_CHILD_CONCEPT;
      }
      if (newTutorial === "tmpProposalRelationChild") {
        newSteps = TMP_PROPOSE_CHILD_RELATION;
      }
      if (newTutorial === "tmpProposalReferenceChild") {
        newSteps = TMP_PROPOSE_CHILD_REFERENCE;
      }
      if (newTutorial === "tmpProposalQuestionChild") {
        newSteps = TMP_PROPOSE_CHILD_QUESTION;
      }
      if (newTutorial === "tmpProposalIdeaChild") {
        newSteps = TMP_PROPOSE_CHILD_IDEA;
      }
      if (newTutorial === "tmpProposalCodeChild") {
        newSteps = TMP_PROPOSE_CHILD_CODE;
      }

      setUserTutorial(prev => ({
        ...prev,
        [newTutorial]: { ...prev[newTutorial], currentStep: /*  initialStep || */ 1 },
      }));

      return { name: newTutorial, steps: newSteps, step: /*  initialStep || */ 1 };
    });
  }, []);

  const currentStep = useMemo(() => getTutorialStep(tutorial), [tutorial]);

  const onNextStep = useCallback(() => {
    setTutorial(prevTutorial => {
      if (!prevTutorial) return null;
      if (!currentStep) return null;
      if (prevTutorial.step >= prevTutorial.steps.length) return prevTutorial;

      if (currentStep?.childTargetId) removeStyleFromTarget(currentStep.childTargetId, targetId);
      const newStep = prevTutorial.step + 1;
      setUserTutorial(prevUserTutorial => ({
        ...prevUserTutorial,
        [prevTutorial.name]: { ...prevUserTutorial[prevTutorial.name], currentStep: newStep },
      }));
      return { ...prevTutorial, step: newStep };
    });
  }, [currentStep, targetId]);

  const onPreviousStep = useCallback(() => {
    setTutorial(prevTutorial => {
      if (!prevTutorial) return null;
      if (!currentStep) return null;
      if (prevTutorial.step <= 1) return prevTutorial;

      if (currentStep?.childTargetId) removeStyleFromTarget(currentStep.childTargetId, targetId);
      const newStep = prevTutorial.step - 1;
      setUserTutorial(prevUserTutorial => ({
        ...prevUserTutorial,
        [prevTutorial.name]: { ...prevUserTutorial[prevTutorial.name], currentStep: newStep },
      }));
      return { ...prevTutorial, step: newStep };
    });
  }, [currentStep, targetId]);

  return {
    startTutorial,
    tutorial,
    setTutorial,
    currentStep,
    onNextStep,
    onPreviousStep,
    isPlayingTheTutorialRef,
    setTargetId,
    targetId,
    userTutorial,
    userTutorialLoaded,
    setUserTutorial,
  };
};

export const STEPS_NODE_TUTORIAL = [];

export const removeStyleFromTarget = (childTargetId: string, targetId?: string) => {
  if (childTargetId) {
    const elementId = targetId ? `${targetId}-${childTargetId}` : childTargetId;
    console.log({ elementId });
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove("tutorial-target");
      element.classList.remove("tutorial-target-shallow");
      element.classList.remove("tutorial-target-outside");
      element.classList.remove("tutorial-target-inside");
      element.classList.remove("tutorial-target-pulse");
    }
  }
};

export const getTutorialStep = (tutorial: Tutorial) => {
  if (!tutorial) return null;
  return tutorial.steps[tutorial.step - 1];
};
