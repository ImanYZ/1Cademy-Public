import { ReactNode, useCallback, useEffect, useReducer, useRef } from "react";

import { INITIAL_NODE_TUTORIAL_STATE, nodeTutorialReducer } from "../lib/reducers/nodeTutorial";
import { SetStepType } from "../nodeBookTypes";
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

export const useInteractiveTutorial = () => {
  const [stateNodeTutorial, dispatchNodeTutorial] = useReducer(nodeTutorialReducer, INITIAL_NODE_TUTORIAL_STATE);
  const isPlayingTheTutorialRef = useRef(false);

  const onChangeStep = useCallback((step: SetStepType) => {
    console.log("onchange step", step);
    dispatchNodeTutorial({ type: step });
    isPlayingTheTutorialRef.current = step ? true : false;
  }, []);

  useEffect(() => {
    onChangeStep(22);
  }, [onChangeStep]);

  useEventListener({
    stepId: stateNodeTutorial?.childTargetId ?? stateNodeTutorial?.targetId,
    cb: stateNodeTutorial?.isClickeable
      ? () => {
          dispatchNodeTutorial({ type: stateNodeTutorial?.nextStepName ?? null });
          isPlayingTheTutorialRef.current = Boolean(stateNodeTutorial?.nextStepName);
        }
      : undefined,
  });

  return { stateNodeTutorial, onChangeStep, isPlayingTheTutorialRef };
};
