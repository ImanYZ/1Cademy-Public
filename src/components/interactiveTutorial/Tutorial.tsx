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
    // Get the parent container element
    // const parent = document.querySelector('#parent');
    // // Get the child element with relative position
    // const child = parent.querySelector('#child');
    // // Get the position of the child element relative to the viewport
    // const childRect = child.getBoundingClientRect();
    // // Get the position of the parent element relative to the viewport
    // const parentRect = parent.getBoundingClientRect();
    // // Calculate the position of the child element relative to the parent element
    // const childPos = {
    //   x: childRect.left - parentRect.left,
    //   y: childRect.top - parentRect.top
    // };
    // console.log(childPos);
    if (!tooltipRef.current) return { top: 0, left: 0 };
    if (!currentStep) return { top: 0, left: 0 };

    console.log("first measure ", currentStep, tooltipRef.current);
    console.log("rect", { top1: targetClientRect.top, theight: tooltipRef.current.clientHeight, TOOLTIP_OFFSET });
    let top = 0;
    let left = 0;
    const pos = currentStep.tooltipPos;
    if (pos === "top") {
      top = targetClientRect.top - tooltipRef.current.clientHeight - TOOLTIP_OFFSET;
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
    console.log("first new top left", { top: top + targetClientRect.top, left: left + targetClientRect.left });
    return { top: top + targetClientRect.top, left: left + targetClientRect.left };
  }, [currentStep, targetClientRect.height, targetClientRect.left, targetClientRect.top, targetClientRect.width]);

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
            border: "1px solid #f77e0c",
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
        backgroundColor: "#3a3938",
        border: "1px solid #f77e0c",
        padding: "8px",
        borderRadius: "8px",
        color: "white",
        zIndex: 20,
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
