import React, { useMemo, useRef } from "react";

import { Step, TargetClientRect } from "../../hooks/useInteractiveTutorial";

const TOOLTIP_OFFSET = 20;

type TutorialProps = {
  currentStep?: Step;
  currentStepIdx: number;
  onNextStep: () => void;
  onPreviousStep: () => void;
  stepsLength: number;
  targetClientRect: TargetClientRect;
};

export const Tutorial = ({
  currentStep,
  targetClientRect,
  currentStepIdx,
  stepsLength,
  onNextStep,
  onPreviousStep,
}: TutorialProps) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const tooltipClientRect = useMemo(() => {
    if (!tooltipRef.current) return { top: 0, left: 0 };
    if (!currentStep) return { top: 0, left: 0 };

    let top = 0;
    let left = 0;
    const pos = currentStep.tooltipPos;
    if (pos === "top") {
      top = 0 - tooltipRef.current.clientHeight - TOOLTIP_OFFSET;
      left = targetClientRect.width / 2 - tooltipRef.current.clientWidth / 2;
    }
    if (pos === "bottom") {
      top = targetClientRect.height + TOOLTIP_OFFSET;
      left = targetClientRect.width / 2 - tooltipRef.current.clientWidth / 2;
    }
    if (pos === "left") {
      top = targetClientRect.height / 2 - tooltipRef.current.clientHeight / 2;
      left = 0 - tooltipRef.current.clientWidth - TOOLTIP_OFFSET;
    }
    if (pos === "right") {
      top = targetClientRect.height / 2 - tooltipRef.current.clientHeight / 2;
      left = targetClientRect.width + TOOLTIP_OFFSET;
    }
    return { top, left };
  }, [currentStep, targetClientRect.height, targetClientRect.width]);

  if (!currentStep) return null;

  if (
    targetClientRect.top === 0 &&
    targetClientRect.left === 0 &&
    targetClientRect.width === 0 &&
    targetClientRect.height === 0
  )
    return (
      <div
        style={{
          position: "absolute",
          top: "0px",
          bottom: "0px",
          left: "0px",
          right: "0px",
          backgroundColor: "#555555a9",
          transition: "top 1s ease-out,left 1s ease-out",
          boxSizing: "border-box",
          zIndex: 999,
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          ref={tooltipRef}
          style={{
            transition: "top 1s ease-out,left 1s ease-out",
            width: "200px",
            backgroundColor: "#3a3838",
            padding: "8px",
            borderRadius: "8px",
            color: "white",
          }}
        >
          <h2>{currentStep.title}</h2>
          <p>{currentStep.description}</p>
          <button onClick={onPreviousStep}>{"<<"}</button>

          {currentStepIdx < stepsLength - 1 && (
            <button onClick={onNextStep} style={{ zIndex: 898999 }}>
              {">>"}
            </button>
          )}
          {currentStepIdx === stepsLength - 1 && <button onClick={onNextStep}>{"Finalize"}</button>}
        </div>
      </div>
    );

  return (
    <div
      ref={tooltipRef}
      className={`tooltip tooltip-${currentStep.tooltipPos}`}
      style={{
        position: "absolute",
        top: `${tooltipClientRect.top}px`,
        left: `${tooltipClientRect.left}px`,
        transition: "top 1s ease-out,left 1s ease-out",
        width: "350px",
        backgroundColor: "#3a3838",
        padding: "8px",
        borderRadius: "8px",
        color: "white",
        //   pointerEvents: "none",
      }}
    >
      <h2>{currentStep.title}</h2>
      <p>{currentStep.description}</p>
      <button onClick={onPreviousStep}>{"<<"}</button>

      {currentStepIdx < stepsLength - 1 && (
        <button onClick={onNextStep} style={{ zIndex: 898999 }}>
          {">>"}
        </button>
      )}
      {currentStepIdx === stepsLength - 1 && <button onClick={onNextStep}>{"Finalize"}</button>}
    </div>
    // <div
    //   style={{
    //     position: "absolute",
    //     top: `${targetClientRect.top}px`,
    //     left: `${targetClientRect.left}px`,
    //     width: `${targetClientRect.width}px`,
    //     height: `${targetClientRect.height}px`,
    //     backgroundColor: "transparent",
    //     outline: "5000px solid #181818d0",
    //     transition: "top 1s ease-out,left 1s ease-out",
    //     borderRadius: "1px",
    //     outlineOffset: "10px",
    //     boxSizing: "border-box",

    //     zIndex: 999,
    //   }}
    // >
    //   <div
    //     ref={tooltipRef}
    //     className={`tooltip tooltip-${currentStep.tooltipPos}`}
    //     style={{
    //       position: "absolute",
    //       top: `${tooltipClientRect.top}px`,
    //       left: `${tooltipClientRect.left}px`,
    //       transition: "top 1s ease-out,left 1s ease-out",
    //       width: "350px",
    //       backgroundColor: "#3a3838",
    //       padding: "8px",
    //       borderRadius: "8px",
    //       color: "white",
    //       //   pointerEvents: "none",
    //     }}
    //   >
    //     <h2>{currentStep.title}</h2>
    //     <p>{currentStep.description}</p>
    //     <button onClick={onPreviousStep}>{"<<"}</button>

    //     {currentStepIdx < stepsLength - 1 && (
    //       <button onClick={onNextStep} style={{ zIndex: 898999 }}>
    //         {">>"}
    //       </button>
    //     )}
    //     {currentStepIdx === stepsLength - 1 && <button onClick={onNextStep}>{"Finalize"}</button>}
    //   </div>
    // </div>
  );
};
