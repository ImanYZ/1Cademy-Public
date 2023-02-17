import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const DEFAULT_NUMBER_OF_TRIES = 5;

export type Step = {
  targetId: string;
  childTargetId?: string;
  title: string;
  description: string;
  tooltipPos: "top" | "bottom" | "left" | "right";
  anchor: string;
  callback?: () => void;
  disabledElements: string[];
};

export type TargetClientRect = { width: number; height: number; top: number; left: number };

type UseInteractiveTutorialProps = { steps: Step[] };

export const useInteractiveTutorial = ({ steps }: UseInteractiveTutorialProps) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  /** when targetClientReact = {0,0,0,0} draw in center of screen */
  const [targetClientRect, setTargetClientRect] = useState<TargetClientRect>({ width: 0, height: 0, top: 0, left: 0 });

  const isPlayingTheTutorialRef = useRef(false);

  const currentStep = useMemo(() => steps[currentStepIdx], [currentStepIdx, steps]);

  const isPlayingTheTutorial = useMemo(() => {
    const newValue = currentStep ? true : false;
    isPlayingTheTutorialRef.current = newValue;
    console.log({ isPlayingTheTutorialRef: isPlayingTheTutorialRef.current, newValue });
    return newValue;
  }, [currentStep]);

  const disabledElements = useMemo(() => currentStep?.disabledElements ?? [], [currentStep?.disabledElements]);

  useEffect(() => {
    if (!currentStep) return;
    currentStep.callback && currentStep.callback();
  }, [currentStep]);

  const onStart = useCallback(() => setCurrentStepIdx(0), []);

  const onNextStep = useCallback(() => {
    console.log({ currentStepIdx });
    if (currentStepIdx < 0) return;
    if (currentStepIdx === steps.length - 1) return setCurrentStepIdx(-1);

    setCurrentStepIdx(prev => prev + 1);
  }, [currentStepIdx, steps.length]);

  const onPreviousStep = useCallback(() => {
    if (currentStepIdx <= 0) return;
    setCurrentStepIdx(prev => prev - 1);
  }, [currentStepIdx]);

  const anchorTutorial = useMemo(() => {
    return currentStep?.anchor ?? "";
  }, [currentStep?.anchor]);

  return {
    setTargetClientRect,

    isPlayingTheTutorial,
    isPlayingTheTutorialRef,
    targetClientRect,
    currentStepIdx,
    onStart,
    onNextStep,
    onPreviousStep,
    disabledElements,
    currentStep,
    anchorTutorial,
  };
};
