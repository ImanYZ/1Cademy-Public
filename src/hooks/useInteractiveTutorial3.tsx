import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { NAVIGATION_STEPS_COMPLETE } from "@/lib/utils/tutorials/navigationTutorialSteps";
import { NODE_CONCEPT_COMPLETE } from "@/lib/utils/tutorials/nodetypeTutorialSteps";
import { PROPOSAL_STEPS_COMPLETE } from "@/lib/utils/tutorials/proposalSteps";
import {
  PROPOSING_CODE_EDIT_COMPLETE,
  PROPOSING_CONCEPT_EDIT_COMPLETE,
  PROPOSING_IDEA_EDIT_COMPLETE,
  PROPOSING_QUESTION_EDIT_COMPLETE,
  PROPOSING_REFERENCE_EDIT_COMPLETE,
  PROPOSING_RELATION_EDIT_COMPLETE,
} from "@/lib/utils/tutorials/proposalTutorialSteps";
import { SEARCHER_STEPS_COMPLETE } from "@/lib/utils/tutorials/searcherTutorialSteps";

import { NODES_STEPS_COMPLETE } from "../lib/utils/tutorials/nodeTutorialSteps";
import { TutorialStep } from "../nodeBookTypes";
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
};

export const useInteractiveTutorial = ({}: useInteractiveTutorialProps) => {
  const isPlayingTheTutorialRef = useRef(false);
  const idxCurrentStepRef = useRef(-1);
  const [stateNodeTutorial, setStateNodeTutorial] = useState<TutorialStep | null>(null);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [currentTutorial, setCurrentTutorial] = useState<TutorialType>(null);
  const [targetId, setTargetId] = useState("");

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
      console.log("NAVIGATION");
      newSteps = NAVIGATION_STEPS_COMPLETE;
      //  setSteps(SEARCHER_STEPS_COMPLETE);
    }
    if (currentTutorial === "NODES") {
      console.log("FILL NODES");
      newSteps = NODES_STEPS_COMPLETE;
    }
    if (currentTutorial === "SEARCHER") {
      newSteps = SEARCHER_STEPS_COMPLETE;
      setTargetId("");
    }
    if (currentTutorial === "CONCEPT") {
      newSteps = NODE_CONCEPT_COMPLETE;
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
    console.log({ newSteps });
    idxCurrentStepRef.current = 0;
    const selectedStep = newSteps[idxCurrentStepRef.current];
    setStateNodeTutorial(selectedStep);
    isPlayingTheTutorialRef.current = true;
    setSteps(newSteps);
  }, [currentTutorial, removeStyleFromTarget]);

  const onNextStep = useCallback(() => {
    if (idxCurrentStepRef.current === steps.length - 1) {
      idxCurrentStepRef.current = -1;
      setStateNodeTutorial(prev => {
        console.log("sssssssssrrr", { prev });

        if (prev?.childTargetId) {
          removeStyleFromTarget(prev.childTargetId);
        }
        return null;
      });
      isPlayingTheTutorialRef.current = false;
      setCurrentTutorial(null);
    } else {
      idxCurrentStepRef.current += 1;
      const selectedStep = steps[idxCurrentStepRef.current];
      setStateNodeTutorial(prev => {
        console.log("sssssssss", { prev, selectedStep });
        if (prev?.childTargetId) {
          removeStyleFromTarget(prev.childTargetId);
        }
        return selectedStep;
      });
      isPlayingTheTutorialRef.current = true;
    }
  }, [removeStyleFromTarget, steps]);

  const onPreviousStep = useCallback(() => {
    if (idxCurrentStepRef.current === 0) return;

    idxCurrentStepRef.current -= 1;
    const selectedStep = steps[idxCurrentStepRef.current];
    setStateNodeTutorial(prev => {
      if (prev?.childTargetId) {
        removeStyleFromTarget(prev.childTargetId);
      }
      return selectedStep;
    });
    isPlayingTheTutorialRef.current = true;
  }, [removeStyleFromTarget, steps]);

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
  };
};

export const STEPS_NODE_TUTORIAL = [];
