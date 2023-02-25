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
      if (step === 18)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "02";
            nodeBookDispatch({ type: "setSelectedNode", payload: "02" });
          },
        };
      if (step === 22)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "03";
            nodeBookDispatch({ type: "setSelectedNode", payload: "03" });
          },
        };
      if (step === 24)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "04";
            nodeBookDispatch({ type: "setSelectedNode", payload: "04" });
          },
        };
      if (step === 27)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "03";
            nodeBookDispatch({ type: "setSelectedNode", payload: "03" });
          },
        };
      // ---------- Nodes
      if (step === 28)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "06";
            nodeBookDispatch({ type: "setSelectedNode", payload: "06" });
          },
        };

      if (step === 31)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "01";
            nodeBookDispatch({ type: "setSelectedNode", payload: "01" });
          },
        };
      if (step === 35)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "01";
            nodeBookDispatch({ type: "setSelectedNode", payload: "01" });
          },
        };
      if (step === 42)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "07";
            nodeBookDispatch({ type: "setSelectedNode", payload: "07" });
          },
        };
      if (step === 44)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "01";
            nodeBookDispatch({ type: "setSelectedNode", payload: "01" });
          },
        };
      dispatchNodeTutorial({ type: step, payload });
      isPlayingTheTutorialRef.current = step ? true : false;
    },
    [nodeBookDispatch, notebookRef]
  );

  useEffect(() => {
    onChangeStep(1); //64
  }, [onChangeStep]);

  useEventListener({
    stepId: stateNodeTutorial?.childTargetId ?? stateNodeTutorial?.targetId,
    cb: stateNodeTutorial?.isClickeable ? () => onChangeStep(stateNodeTutorial.nextStepName) : undefined,
  });

  return { stateNodeTutorial, onChangeStep, isPlayingTheTutorialRef };
};
