import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const DEFAULT_NUMBER_OF_TRIES = 5;

export type Step = {
  id: string;
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
  // const tooltipRef = useRef<HTMLDivElement | null>(null);
  const observeTries = useRef(0);

  useLayoutEffect(() => {
    // detect element mounted to get clientRect values
    if (!steps[currentStepIdx]) return;

    const targetId = steps[currentStepIdx].id;

    if (!targetId) {
      // NO target id => show tooltip in screen center
      return setTargetClientRect({ width: 0, height: 0, top: 0, left: 0 });
    }

    const intervalId = setInterval(() => {
      if (observeTries.current >= DEFAULT_NUMBER_OF_TRIES) {
        observeTries.current = 0;
        clearInterval(intervalId);
        return;
      }

      observeTries.current += 1;
      const element = document.getElementById(targetId);

      if (!element) return;

      setTargetClientRect({
        width: element.clientWidth,
        height: element.clientHeight,
        top: element.offsetTop,
        left: element.offsetLeft,
      });
      observeTries.current = 0;
      clearInterval(intervalId);
    }, 500);

    return () => {
      clearInterval(intervalId);

      return;
    };
  }, [currentStepIdx, steps]);

  const currentStep = useMemo(() => steps[currentStepIdx], [currentStepIdx, steps]);

  const disabledElements = useMemo(() => currentStep?.disabledElements ?? [], [currentStep?.disabledElements]);

  useEffect(() => {
    if (!currentStep) return;
    currentStep.callback && currentStep.callback();
  }, [currentStep]);

  const onStart = useCallback(() => setCurrentStepIdx(0), []);

  const onNextStep = useCallback(() => {
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

  // const tooltipClientRect = useMemo(() => {
  //   if (!tooltipRef.current) return { top: 0, left: 0 };
  //   let top = 0;
  //   let left = 0;

  //   const pos = steps[currentStepIdx].tooltipPos;

  //   if (pos === "top") {
  //     top = 0 - tooltipRef.current.clientHeight - TOOLTIP_OFFSET;
  //     left = targetClientRect.width / 2 - tooltipRef.current.clientWidth / 2;
  //   }
  //   if (pos === "bottom") {
  //     top = targetClientRect.height + TOOLTIP_OFFSET;
  //     left = targetClientRect.width / 2 - tooltipRef.current.clientWidth / 2;
  //   }
  //   if (pos === "left") {
  //     top = targetClientRect.height / 2 - tooltipRef.current.clientHeight / 2;
  //     left = 0 - tooltipRef.current.clientWidth - TOOLTIP_OFFSET;
  //   }
  //   if (pos === "right") {
  //     top = targetClientRect.height / 2 - tooltipRef.current.clientHeight / 2;
  //     left = targetClientRect.width + TOOLTIP_OFFSET;
  //   }
  //   return { top, left };
  // }, [currentStepIdx, steps, targetClientRect.height, targetClientRect.width]);

  // const tutorialComponent = useMemo(() => {
  //   if (currentStepIdx < 0 || currentStepIdx >= steps.length) return null;
  //   return (
  //     <div
  //       style={{
  //         position: "absolute",
  //         top: `${targetClientRect.top}px`,
  //         left: `${targetClientRect.left}px`,
  //         width: `${targetClientRect.width}px`,
  //         height: `${targetClientRect.height}px`,
  //         backgroundColor: "transparent",
  //         outline: "5000px solid #5555552d",
  //         transition: "top 1s ease-out,left 1s ease-out",
  //         borderRadius: "1px",
  //         outlineOffset: "10px",
  //         boxSizing: "border-box",
  //         // pointerEvents: "none",
  //         zIndex: 999,
  //       }}
  //     >
  //       <div
  //         ref={tooltipRef}
  //         className={`tooltip tooltip-${currentStep.tooltipPos}`}
  //         style={{
  //           position: "absolute",
  //           top: `${tooltipClientRect.top}px`,
  //           left: `${tooltipClientRect.left}px`,
  //           transition: "top 1s ease-out,left 1s ease-out",
  //           width: "200px",
  //           backgroundColor: "#3a3838",
  //           padding: "8px",
  //           borderRadius: "8px",
  //           color: "white",
  //         }}
  //       >
  //         <h2>{currentStep.title}</h2>
  //         <p>{currentStep.description}</p>
  //         <button onClick={onPreviousStep}>{"<<"}</button>

  //         {currentStepIdx < steps.length - 1 && (
  //           <button onClick={onNextStep} style={{ zIndex: 898999 }}>
  //             {">>"}
  //           </button>
  //         )}
  //         {currentStepIdx === steps.length - 1 && <button onClick={onNextStep}>{"Finalize"}</button>}
  //       </div>
  //     </div>
  //   );
  // }, [
  //   currentStep.description,
  //   currentStep.title,
  //   currentStep.tooltipPos,
  //   currentStepIdx,
  //   onNextStep,
  //   onPreviousStep,
  //   steps.length,
  //   targetClientRect.height,
  //   targetClientRect.left,
  //   targetClientRect.top,
  //   targetClientRect.width,
  //   tooltipClientRect.left,
  //   tooltipClientRect.top,
  // ]);

  return {
    targetClientRect,
    currentStepIdx,
    onStart,
    onNextStep,
    onPreviousStep,
    disabledElements,
    currentStep,
    // tutorialComponent,
    anchorTutorial,
  };
};
