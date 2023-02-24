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
  // useEventListener({
  //   stepId: stateNodeTutorial?.childTargetId ?? stateNodeTutorial?.targetId,
  //   cb: stateNodeTutorial?.isClickeable
  //     ? () => {
  //         console.log("Callback use Event listener", stateNodeTutorial?.nextStepName);
  //         const stepId = stateNodeTutorial?.childTargetId ?? stateNodeTutorial?.targetId;
  //         let payload: StepReducerPayload = {};
  //         // if (stepId === "6") () => {
  //         //   dispatchNodeTutorial({ type: 7, payload })
  //         // }
  //         if (stepId === "42")
  //           payload = { callback: () => nodeBookDispatch({ type: "setSelectedNode", payload: "01" }) };
  //         if (stepId === "43")
  //           payload = { callback: () => nodeBookDispatch({ type: "setSelectedNode", payload: "02" }) };
  //         if (stepId === "47")
  //           payload = { callback: () => nodeBookDispatch({ type: "setSelectedNode", payload: "02" }) };
  //         if (stepId === "48")
  //           payload = { callback: () => nodeBookDispatch({ type: "setSelectedNode", payload: "03" }) };
  //         if (stepId === "53")
  //           payload = { callback: () => nodeBookDispatch({ type: "setSelectedNode", payload: "03" }) };
  //         if (stepId === "54")
  //           payload = { callback: () => nodeBookDispatch({ type: "setSelectedNode", payload: "04" }) };
  //         if (stepId === "57")
  //           payload = { callback: () => nodeBookDispatch({ type: "setSelectedNode", payload: "04" }) };
  //         if (stepId === "58")
  //           payload = { callback: () => nodeBookDispatch({ type: "setSelectedNode", payload: "05" }) };
  //         if (stepId === "59")
  //           payload = { callback: () => nodeBookDispatch({ type: "setSelectedNode", payload: "05" }) };
  //         if (stepId === "60")
  //           payload = { callback: () => nodeBookDispatch({ type: "setSelectedNode", payload: "06" }) };
  //         if (stepId === "62")
  //           payload = { callback: () => nodeBookDispatch({ type: "setSelectedNode", payload: "06" }) };
  //         if (stepId === "63")
  //           payload = { callback: () => nodeBookDispatch({ type: "setSelectedNode", payload: "07" }) };
  //         dispatchNodeTutorial({ type: stateNodeTutorial?.nextStepName ?? null, payload });
  //         isPlayingTheTutorialRef.current = Boolean(stateNodeTutorial?.nextStepName);
  //       }
  //     : undefined,
  // });

  return { stateNodeTutorial, onChangeStep, isPlayingTheTutorialRef };
};
