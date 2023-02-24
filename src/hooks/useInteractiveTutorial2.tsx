import { MutableRefObject, ReactNode, useCallback, useEffect, useReducer, useRef } from "react";

import { useNodeBook } from "@/context/NodeBookContext";

import { INITIAL_NODE_TUTORIAL_STATE, nodeTutorialReducer } from "../lib/reducers/nodeTutorial";
import { SetStepType, StepReducerPayload, TNodeBookState } from "../nodeBookTypes";
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
  notebookRef: MutableRefObject<TNodeBookState>;
};

export const useInteractiveTutorial = ({ notebookRef }: useInteractiveTutorialProps) => {
  const [stateNodeTutorial, dispatchNodeTutorial] = useReducer(nodeTutorialReducer, INITIAL_NODE_TUTORIAL_STATE);
  const isPlayingTheTutorialRef = useRef(false);
  const { nodeBookDispatch } = useNodeBook();

  const onChangeStep = useCallback(
    (step: SetStepType) => {
      console.log("onchange step", step);
      let payload: StepReducerPayload = {};
      if (step === 1)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "01";
            nodeBookDispatch({ type: "setSelectedNode", payload: "01" });
          },
        };
      if (step === 14)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "00";
            nodeBookDispatch({ type: "setSelectedNode", payload: "00" });
          },
        };
      if (step === 15)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "01";
            nodeBookDispatch({ type: "setSelectedNode", payload: "01" });
          },
        };
      if (step === 16)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "02";
            nodeBookDispatch({ type: "setSelectedNode", payload: "02" });
          },
        };

      // ---------- Nodes
      if (step === 50)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "103";
            nodeBookDispatch({ type: "setSelectedNode", payload: "103" });
          },
        };
      dispatchNodeTutorial({ type: step, payload });
      isPlayingTheTutorialRef.current = step ? true : false;

      if (step === 53)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "101";
            nodeBookDispatch({ type: "setSelectedNode", payload: "101" });
          },
        };
      if (step === 57)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "101";
            nodeBookDispatch({ type: "setSelectedNode", payload: "101" });
          },
        };
      if (step === 64)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "104";
            nodeBookDispatch({ type: "setSelectedNode", payload: "104" });
          },
        };
      if (step === 65)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "101";
            nodeBookDispatch({ type: "setSelectedNode", payload: "101" });
          },
        };
      dispatchNodeTutorial({ type: step, payload });
      isPlayingTheTutorialRef.current = step ? true : false;
    },
    [nodeBookDispatch, notebookRef]
  );

  useEffect(() => {
    onChangeStep(50); //64
  }, [onChangeStep]);

  useEventListener({
    stepId: stateNodeTutorial?.childTargetId ?? stateNodeTutorial?.targetId,
    cb: stateNodeTutorial?.isClickeable ? () => onChangeStep(stateNodeTutorial.nextStepName) : undefined,
  });

  return { stateNodeTutorial, onChangeStep, isPlayingTheTutorialRef };
};
