import { MutableRefObject, ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { useNodeBook } from "@/context/NodeBookContext";
import { SEARCHER_STEPS_COMPLETE } from "@/lib/reducers/searcherTutorial";

import { NODES_STEPS_COMPLETE } from "../lib/reducers/nodeTutorial2";
import { PROPOSAL_STEPS_COMPLETE } from "../lib/utils/tutorials/proposalSteps";
import { NodeTutorialState, TNodeBookState } from "../nodeBookTypes";
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
  notebookRef: MutableRefObject<TNodeBookState>;
  // tutorialSteps: NodeTutorialState[];
  // currentTutorial: TutorialType;
};

export const useInteractiveTutorial = ({ notebookRef }: useInteractiveTutorialProps) => {
  // const [stateNodeTutorial, dispatchNodeTutorial] = useReducer(nodeTutorialReducer, INITIAL_NODE_TUTORIAL_STATE);
  const isPlayingTheTutorialRef = useRef(false);
  const idxCurrentStepRef = useRef(-1);
  const { nodeBookDispatch } = useNodeBook();
  const defaultSelectedNode = useRef<string | null>(null);
  const [stateNodeTutorial, setStateNodeTutorial] = useState<NodeTutorialState | null>(null);
  const [steps, setSteps] = useState<NodeTutorialState[]>([]);
  const [currentTutorial, setCurrentTutorial] = useState<TutorialType>(null);

  console.log({ steps });

  const removeStyleFromTarget = (childTargetId: string) => {
    if (childTargetId) {
      const element = document.getElementById(childTargetId);
      if (element) {
        element.classList.remove("tutorial-target");
        element.classList.remove("tutorial-target-pulse");
      }
    }
  };

  // useEffect(() => {

  // }, [currentTutorial]);

  // const onStart = useCallback(() => {
  //   console.log("onStart", steps);
  //   idxCurrentStepRef.current = 45;
  //   const selectedStep = steps[idxCurrentStepRef.current];
  //   setStateNodeTutorial(selectedStep);
  //   isPlayingTheTutorialRef.current = true;
  //   notebookRef.current.selectedNode = selectedStep.targetId;
  //   nodeBookDispatch({ type: "setSelectedNode", payload: selectedStep.targetId });
  // }, [nodeBookDispatch, notebookRef, steps]);

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

    console.log("==> call NODES2");
    let newSteps: NodeTutorialState[] = [];
    console.log({ currentTutorial, NODES_STEPS_COMPLETE });
    if (currentTutorial === "NODES") {
      console.log("FILL NODES");
      newSteps = NODES_STEPS_COMPLETE;
      //  setSteps(NODES_STEPS_COMPLETE);
    }
    if (currentTutorial === "SEARCHER") {
      console.log("FILL SEARCHER");
      newSteps = SEARCHER_STEPS_COMPLETE;
      //  setSteps(SEARCHER_STEPS_COMPLETE);
    }
    if (currentTutorial === "PROPOSAL") {
      console.log("FILL PROPOSAL");
      newSteps = PROPOSAL_STEPS_COMPLETE;
      //  setSteps(SEARCHER_STEPS_COMPLETE);
    }

    console.log({ newSteps });
    idxCurrentStepRef.current = 0;
    const selectedStep = newSteps[idxCurrentStepRef.current];
    setStateNodeTutorial(selectedStep);
    isPlayingTheTutorialRef.current = true;
    notebookRef.current.selectedNode = selectedStep.targetId;
    nodeBookDispatch({ type: "setSelectedNode", payload: selectedStep.targetId });
    setSteps(newSteps);
  }, [currentTutorial, nodeBookDispatch, notebookRef, steps.length]);

  useEffect(() => {
    if (!defaultSelectedNode.current) defaultSelectedNode.current = notebookRef.current.selectedNode;
  }, [notebookRef]);

  const onNextStep = useCallback(() => {
    if (idxCurrentStepRef.current === steps.length - 1) {
      idxCurrentStepRef.current = -1;
      setStateNodeTutorial(prev => {
        if (prev?.childTargetId) {
          removeStyleFromTarget(prev.childTargetId);
        }
        return null;
      });
      isPlayingTheTutorialRef.current = false;
      setCurrentTutorial(null);
      // notebookRef.current.selectedNode = selectedStep.targetId;
      // nodeBookDispatch({ type: "setSelectedNode", payload: selectedStep.targetId });
    } else {
      idxCurrentStepRef.current += 1;
      const selectedStep = steps[idxCurrentStepRef.current];
      setStateNodeTutorial(prev => {
        if (prev?.childTargetId) {
          removeStyleFromTarget(prev.childTargetId);
        }
        return selectedStep;
      });
      isPlayingTheTutorialRef.current = true;

      notebookRef.current.selectedNode = selectedStep.targetId;
      nodeBookDispatch({ type: "setSelectedNode", payload: selectedStep.targetId });
    }
  }, [nodeBookDispatch, notebookRef, steps]);

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

    notebookRef.current.selectedNode = selectedStep.targetId;
    nodeBookDispatch({ type: "setSelectedNode", payload: selectedStep.targetId });
  }, [nodeBookDispatch, notebookRef, steps]);

  // const onChangeStep = useCallback((idxStep:number) => {
  //   if(idxStep<0) return
  //   if(idxStep>=steps.length) return

  //   idxCurrentStepRef.current = idxStep

  // }, []);

  // useEffect(() => {
  //   onChangeStep(null); //64
  // }, [onChangeStep]);

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
  };
};

export const STEPS_NODE_TUTORIAL = [];
