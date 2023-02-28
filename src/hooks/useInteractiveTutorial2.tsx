import { MutableRefObject, ReactNode, useCallback, useEffect, useReducer, useRef } from "react";

import { useNodeBook } from "@/context/NodeBookContext";

import { INITIAL_NODE_TUTORIAL_STATE, nodeTutorialReducer } from "../lib/reducers/nodeTutorial";
import { StepReducerPayload, TNodeBookState } from "../nodeBookTypes";
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
  const defaultSelectedNode = useRef<string | null>(null);

  useEffect(() => {
    if (!defaultSelectedNode.current) defaultSelectedNode.current = notebookRef.current.selectedNode;
  }, [notebookRef]);

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
      if (step === 10)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "00";
            nodeBookDispatch({ type: "setSelectedNode", payload: "00" });
          },
        };
      if (step === 11)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "01";
            nodeBookDispatch({ type: "setSelectedNode", payload: "01" });
          },
        };
      if (step === 14)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "02";
            nodeBookDispatch({ type: "setSelectedNode", payload: "02" });
          },
        };
      if (step === 18)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "03";
            nodeBookDispatch({ type: "setSelectedNode", payload: "03" });
          },
        };

      if (step === 20)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "04";
            nodeBookDispatch({ type: "setSelectedNode", payload: "04" });
          },
        };
      if (step === 22)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "04";
            nodeBookDispatch({ type: "setSelectedNode", payload: "04" });
          },
        };
      if (step === 23)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "01";
            nodeBookDispatch({ type: "setSelectedNode", payload: "01" });
          },
        };
      if (step === 27)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "01";
            nodeBookDispatch({ type: "setSelectedNode", payload: "01" });
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

      if (step === 32)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "07";
            nodeBookDispatch({ type: "setSelectedNode", payload: "07" });
          },
        };
      if (step === 36)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "01";
            nodeBookDispatch({ type: "setSelectedNode", payload: "01" });
          },
        };
      if (step === 39)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "01";
            nodeBookDispatch({ type: "setSelectedNode", payload: "01" });
          },
        };
      if (step === 40)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "00";
            nodeBookDispatch({ type: "setSelectedNode", payload: "00" });
          },
        };
      if (step === 41)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "01";
            nodeBookDispatch({ type: "setSelectedNode", payload: "01" });
          },
        };
      if (step === 42)
        payload = {
          callback: () => {
            notebookRef.current.selectedNode = "08";
            nodeBookDispatch({ type: "setSelectedNode", payload: "08" });
          },
        };
      if (step === 43)
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
    onChangeStep(null); //64
  }, [onChangeStep]);

  useEventListener({
    stepId: stateNodeTutorial?.childTargetId ?? stateNodeTutorial?.targetId,
    cb: stateNodeTutorial?.isClickeable ? () => onChangeStep(stateNodeTutorial.nextStepName) : undefined,
  });

  return { stateNodeTutorial, onChangeStep, isPlayingTheTutorialRef };
};
