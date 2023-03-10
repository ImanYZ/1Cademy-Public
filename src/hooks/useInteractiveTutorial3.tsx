import { doc, getDoc, getFirestore } from "firebase/firestore";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { NAVIGATION_STEPS_COMPLETE } from "@/lib/utils/tutorials/navigationTutorialSteps";
import {
  NODE_CODE_COMPLETE,
  NODE_CONCEPT_COMPLETE,
  NODE_IDEA_COMPLETE,
  NODE_QUESTION_COMPLETE,
  NODE_REFERENCE_COMPLETE,
  NODE_RELATION_COMPLETE,
} from "@/lib/utils/tutorials/nodetypeTutorialSteps";
import {
  PROPOSAL_STEPS_COMPLETE,
  PROPOSING_CODE_EDIT_COMPLETE,
  PROPOSING_CONCEPT_EDIT_COMPLETE,
  PROPOSING_IDEA_EDIT_COMPLETE,
  PROPOSING_QUESTION_EDIT_COMPLETE,
  PROPOSING_REFERENCE_EDIT_COMPLETE,
  PROPOSING_RELATION_EDIT_COMPLETE,
} from "@/lib/utils/tutorials/proposalTutorialSteps";
import {
  RECONCILING_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
  RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
} from "@/lib/utils/tutorials/reconcilingProposalsTutorialSteps";
import { SEARCHER_STEPS_COMPLETE } from "@/lib/utils/tutorials/searcherTutorialSteps";

import { User } from "../knowledgeTypes";
import { devLog } from "../lib/utils/develop.util";
import {
  CHILD_CONCEPT_PROPOSAL_COMPLETE,
  CHILD_PROPOSAL_COMPLETE,
} from "../lib/utils/tutorials/childrenProposalTutorialStep";
import { NODES_STEPS_COMPLETE } from "../lib/utils/tutorials/nodeTutorialSteps";
import { TutorialStep, TutorialTypeKeys, UserTutorials } from "../nodeBookTypes";
import useEventListener from "./useEventListener";

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
  const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null);
  const [tutorial, setTutorial] = useState<Tutorial>(null);
  const [targetId, setTargetId] = useState("");
  const [initialStep, setInitialStep] = useState(0);

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

  useEffect(() => {
    const fillTutorialData = () => {
      if (!tutorial) {
        setCurrentStep(prev => {
          if (prev?.childTargetId) removeStyleFromTarget(prev.childTargetId, prev.targetId);
          return null;
        });
        return null;
      }

      let newSteps: TutorialStep[] = [];
      if (tutorial.name === "navigation") {
        newSteps = NAVIGATION_STEPS_COMPLETE;
      }
      if (tutorial.name === "nodes") {
        // console.log("FILL NODES");
        newSteps = NODES_STEPS_COMPLETE;
      }
      if (tutorial.name === "searcher") {
        newSteps = SEARCHER_STEPS_COMPLETE;
        setTargetId("");
      }
      if (tutorial.name === "concept") {
        newSteps = NODE_CONCEPT_COMPLETE;
      }
      if (tutorial.name === "relation") {
        newSteps = NODE_RELATION_COMPLETE;
      }
      if (tutorial.name === "reference") {
        newSteps = NODE_REFERENCE_COMPLETE;
      }
      if (tutorial.name === "question") {
        newSteps = NODE_QUESTION_COMPLETE;
      }
      if (tutorial.name === "idea") {
        newSteps = NODE_IDEA_COMPLETE;
      }
      if (tutorial.name === "code") {
        newSteps = NODE_CODE_COMPLETE;
      }
      if (tutorial.name === "proposal") {
        newSteps = PROPOSAL_STEPS_COMPLETE;
      }
      if (tutorial.name === "proposalConcept") {
        newSteps = PROPOSING_CONCEPT_EDIT_COMPLETE;
      }
      if (tutorial.name === "proposalReference") {
        newSteps = PROPOSING_REFERENCE_EDIT_COMPLETE;
      }
      if (tutorial.name === "proposalRelation") {
        newSteps = PROPOSING_RELATION_EDIT_COMPLETE;
      }
      if (tutorial.name === "proposalIdea") {
        newSteps = PROPOSING_IDEA_EDIT_COMPLETE;
      }
      if (tutorial.name === "proposalQuestion") {
        newSteps = PROPOSING_QUESTION_EDIT_COMPLETE;
      }
      if (tutorial.name === "proposalCode") {
        newSteps = PROPOSING_CODE_EDIT_COMPLETE;
      }
      if (tutorial.name === "reconcilingAcceptedProposal") {
        newSteps = RECONCILING_ACCEPTED_PROPOSALS_STEPS_COMPLETE;
      }
      if (tutorial.name === "reconcilingNotAcceptedProposal") {
        newSteps = RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS_COMPLETE;
      }
      if (tutorial.name === "childProposal") {
        newSteps = CHILD_PROPOSAL_COMPLETE;
      }
      if (tutorial.name === "childConcept") {
        newSteps = CHILD_CONCEPT_PROPOSAL_COMPLETE;
      }

      setTutorial(prev => (prev ? { ...prev, steps: newSteps, step: 1 } : null));

      if (!tutorial.name) return;
      setUserTutorial(prev => ({
        ...prev,
        [tutorial.name]: { ...prev[tutorial.name], currentStep: initialStep || 1 },
      }));
    };

    fillTutorialData();
  }, [initialStep, tutorial]);

  const onNextStep = useCallback(() => {
    if (!tutorial) return;

    setCurrentStep(prev => {
      if (!prev) return null;
      if (tutorial.step >= tutorial.steps.length) {
        isPlayingTheTutorialRef.current = false;
        setTutorial(null);
        return null;
      }

      if (prev?.childTargetId) removeStyleFromTarget(prev.childTargetId, prev.targetId);
      const newStep = tutorial.step < tutorial.steps.length ? tutorial.step + 1 : tutorial.step;
      setUserTutorial(prevUserTutorial => ({
        ...prevUserTutorial,
        [tutorial.name]: {
          ...prevUserTutorial[tutorial.name],
          currentStep: newStep,
        },
      }));
      return tutorial.steps[newStep - 1];
    });
  }, [tutorial]);

  const onPreviousStep = useCallback(() => {
    if (!tutorial) return;

    setCurrentStep(prev => {
      if (!prev) return null;
      if (tutorial.step === 1) {
        isPlayingTheTutorialRef.current = false;
        setTutorial(null);
        return null;
      }

      if (prev?.childTargetId) removeStyleFromTarget(prev.childTargetId, prev.targetId);
      const newStep = tutorial.step > 1 ? tutorial.step - 1 : tutorial.step;
      setUserTutorial(prevUserTutorial => ({
        ...prevUserTutorial,
        [tutorial.name]: { ...prevUserTutorial[tutorial.name], currentStep: newStep },
      }));
      return tutorial.steps[newStep - 1];
    });
  }, [tutorial]);

  useEventListener({
    stepId: currentStep?.childTargetId ?? currentStep?.targetId,
    cb: currentStep?.isClickeable ? onNextStep : undefined,
  });

  return {
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
    setInitialStep,
  };
};

export const STEPS_NODE_TUTORIAL = [];

const removeStyleFromTarget = (childTargetId: string, targetId?: string) => {
  if (childTargetId) {
    const elementId = targetId ? `${targetId}-${childTargetId}` : childTargetId;
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove("tutorial-target");
      element.classList.remove("tutorial-target-large");
      element.classList.remove("tutorial-target-pulse");
    }
  }
};
