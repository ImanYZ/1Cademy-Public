import { doc, getDoc, getFirestore } from "firebase/firestore";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { capitalizeFirstLetter } from "../lib/utils/string.utils";
import { NODES_STEPS_COMPLETE } from "../lib/utils/tutorials/nodeTutorialSteps";
import { TutorialStep, TutorialTypeKeys, UserTutorials } from "../nodeBookTypes";
import { TutorialType } from "../pages/notebook";
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
  // notebookRef: MutableRefObject<TNodeBookState>;
  user: User | null;
};

export const useInteractiveTutorial = ({ user }: useInteractiveTutorialProps) => {
  const db = getFirestore();
  const isPlayingTheTutorialRef = useRef(false);
  // const idxCurrentStepRef = useRef(-1);
  const [stateNodeTutorial, setStateNodeTutorial] = useState<TutorialStep | null>(null);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [currentTutorial, setCurrentTutorial] = useState<TutorialType>(null);
  const [targetId, setTargetId] = useState("");

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
  });

  // flag for whether tutorial state was loaded
  const [userTutorialLoaded, setUserTutorialLoaded] = useState(false);

  useEffect(() => {
    // fetch user tutorial state first time

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

  const removeStyleFromTarget = useCallback(
    (childTargetId: string) => {
      if (childTargetId) {
        const elementId = targetId ? `${targetId}-${childTargetId}` : childTargetId;
        const element = document.getElementById(elementId);
        if (element) {
          element.classList.remove("tutorial-target");
          element.classList.remove("tutorial-target-large");
          element.classList.remove("tutorial-target-pulse");
        }
      }
    },
    [targetId]
  );

  const keyTutorial = useMemo(() => {
    if (!currentTutorial) return null;

    const keyTutorial: TutorialTypeKeys = currentTutorial
      .split("_")
      .map((el, idx) => (idx > 0 ? capitalizeFirstLetter(el.toLocaleLowerCase()) : el.toLowerCase()))
      .join("") as TutorialTypeKeys;

    return keyTutorial;
  }, [currentTutorial]);

  useEffect(() => {
    if (!currentTutorial) {
      setStateNodeTutorial(prev => {
        if (prev?.childTargetId) {
          removeStyleFromTarget(prev.childTargetId);
        }

        return null;
      });
      isPlayingTheTutorialRef.current = false;
      return setSteps([]);
    }

    let newSteps: TutorialStep[] = [];
    if (currentTutorial === "NAVIGATION") {
      // console.log("NAVIGATION");
      newSteps = NAVIGATION_STEPS_COMPLETE;
    }
    if (currentTutorial === "NODES") {
      // console.log("FILL NODES");
      newSteps = NODES_STEPS_COMPLETE;
    }
    if (currentTutorial === "SEARCHER") {
      newSteps = SEARCHER_STEPS_COMPLETE;
      setTargetId("");
    }
    if (currentTutorial === "CONCEPT") {
      newSteps = NODE_CONCEPT_COMPLETE;
    }
    if (currentTutorial === "RELATION") {
      newSteps = NODE_RELATION_COMPLETE;
    }
    if (currentTutorial === "REFERENCE") {
      newSteps = NODE_REFERENCE_COMPLETE;
    }
    if (currentTutorial === "QUESTION") {
      newSteps = NODE_QUESTION_COMPLETE;
    }
    if (currentTutorial === "IDEA") {
      newSteps = NODE_IDEA_COMPLETE;
    }
    if (currentTutorial === "CODE") {
      newSteps = NODE_CODE_COMPLETE;
    }
    if (currentTutorial === "PROPOSAL") {
      newSteps = PROPOSAL_STEPS_COMPLETE;
    }
    if (currentTutorial === "PROPOSAL_CONCEPT") {
      newSteps = PROPOSING_CONCEPT_EDIT_COMPLETE;
    }
    if (currentTutorial === "PROPOSAL_REFERENCE") {
      newSteps = PROPOSING_REFERENCE_EDIT_COMPLETE;
    }
    if (currentTutorial === "PROPOSAL_RELATION") {
      newSteps = PROPOSING_RELATION_EDIT_COMPLETE;
    }
    if (currentTutorial === "PROPOSAL_IDEA") {
      newSteps = PROPOSING_IDEA_EDIT_COMPLETE;
    }
    if (currentTutorial === "PROPOSAL_QUESTION") {
      newSteps = PROPOSING_QUESTION_EDIT_COMPLETE;
    }
    if (currentTutorial === "PROPOSAL_CODE") {
      newSteps = PROPOSING_CODE_EDIT_COMPLETE;
    }
    if (currentTutorial === "RECONCILING_ACCEPTED_PROPOSAL") {
      newSteps = RECONCILING_ACCEPTED_PROPOSALS_STEPS_COMPLETE;
    }
    if (currentTutorial === "RECONCILING_NOT_ACCEPTED_PROPOSAL") {
      newSteps = RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS_COMPLETE;
    }

    const selectedStep = newSteps[0];
    setStateNodeTutorial(selectedStep);
    isPlayingTheTutorialRef.current = true;
    setSteps(newSteps);
    if (!keyTutorial) return;
    setUserTutorial(prev => ({
      ...prev,
      [keyTutorial]: { ...prev[keyTutorial], currentStep: 1 },
    }));
  }, [currentTutorial, keyTutorial, removeStyleFromTarget]);

  const onNextStep = useCallback(() => {
    // console.log("ccc: on Next Step");
    if (!keyTutorial) return;

    setStateNodeTutorial(prev => {
      // console.log("ccc: nextStepName", prev, prev?.nextStepName);
      if (!prev) return null;
      if (!prev.nextStepName) {
        isPlayingTheTutorialRef.current = false;
        setCurrentTutorial(null);
        return null;
      }

      if (prev?.childTargetId) {
        removeStyleFromTarget(prev.childTargetId);
      }
      setUserTutorial(prevUserTutorial => ({
        ...prevUserTutorial,
        [keyTutorial]: { ...prevUserTutorial[keyTutorial], currentStep: prev.nextStepName },
      }));
      return steps[prev.nextStepName - 1];
    });
  }, [keyTutorial, removeStyleFromTarget, steps]);

  const onPreviousStep = useCallback(() => {
    if (!keyTutorial) return;

    setStateNodeTutorial(prev => {
      // console.log("ccc: nextStepName", prev, prev?.previosStepName);
      if (!prev) return null;
      if (!prev.previosStepName) {
        isPlayingTheTutorialRef.current = false;
        setCurrentTutorial(null);
        return null;
      }

      if (prev?.childTargetId) {
        removeStyleFromTarget(prev.childTargetId);
      }
      setUserTutorial(prevUserTutorial => ({
        ...prevUserTutorial,
        [keyTutorial]: { ...prevUserTutorial[keyTutorial], currentStep: prev.previosStepName },
      }));
      isPlayingTheTutorialRef.current = true;
      return steps[prev.previosStepName - 1];
    });
  }, [keyTutorial, removeStyleFromTarget, steps]);

  useEventListener({
    stepId: stateNodeTutorial?.childTargetId ?? stateNodeTutorial?.targetId,
    cb: stateNodeTutorial?.isClickeable ? onNextStep : undefined,
  });

  return {
    setCurrentTutorial,
    currentTutorial,
    stateNodeTutorial,
    onNextStep,
    onPreviousStep,
    isPlayingTheTutorialRef,
    stepsLength: steps.length,
    setTargetId,
    targetId,
    userTutorial,
    userTutorialLoaded,
    setUserTutorial,
    keyTutorial,
  };
};

export const STEPS_NODE_TUTORIAL = [];
