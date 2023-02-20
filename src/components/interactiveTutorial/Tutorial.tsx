import { Box, Button, Stack, Typography } from "@mui/material";
import React, { useMemo, useRef } from "react";

import { Step, TargetClientRect } from "../../hooks/useInteractiveTutorial";

const TOOLTIP_OFFSET = 40;

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

    console.log("rect", {
      targetClientRect,
      tooltipRef: tooltipRef.current.clientHeight,
      tooltipGetClientRects: tooltipRef.current.getClientRects(),
      tooltipGETVoundClientReact: tooltipRef.current.getBoundingClientRect(),
    });
    const { height: tooltipHeight } = tooltipRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;
    const pos = currentStep.tooltipPos;
    if (pos === "top") {
      top = targetClientRect.top - tooltipHeight - TOOLTIP_OFFSET;
      left = targetClientRect.left + targetClientRect.width / 2 - tooltipRef.current.clientWidth / 2;
    }
    if (pos === "bottom") {
      top = targetClientRect.top + targetClientRect.height + TOOLTIP_OFFSET;
      left = targetClientRect.left + targetClientRect.width / 2 - tooltipRef.current.clientWidth / 2;
    }
    if (pos === "left") {
      top = targetClientRect.height + targetClientRect.height / 2 - tooltipRef.current.clientHeight / 2;
      left = targetClientRect.left - tooltipRef.current.clientWidth - TOOLTIP_OFFSET;
    }
    if (pos === "right") {
      top = targetClientRect.top + targetClientRect.height / 2 - tooltipRef.current.clientHeight / 2;
      left = targetClientRect.left + targetClientRect.width + TOOLTIP_OFFSET;
    }
    console.log("first new top left", { top, left });

    return { top, left };
  }, [currentStep, targetClientRect]);

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
          display: "grid",
          placeItems: "center",
          zIndex: 99999,
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

          {currentStepIdx < stepsLength - 1 && <button onClick={onNextStep}>{">>"}</button>}
          {currentStepIdx === stepsLength - 1 && <button onClick={onNextStep}>{"Finalize"}</button>}
        </div>
      </div>
    );

  return (
    <Box
      ref={tooltipRef}
      className={`tooltip tooltip-${currentStep.tooltipPos}`}
      sx={{
        position: "absolute",
        top: `${tooltipClientRect.top}px`,
        left: `${tooltipClientRect.left}px`,
        transition: "top 1s ease-out,left 1s ease-out",
        width: "450px",
        backgroundColor: theme => (theme.palette.mode === "dark" ? "#3F3E3E" : "#f8f8f8"),
        border: `2px solid #FF6D00`,
        p: "24px 32px",
        borderRadius: "8px",
        color: "white",
        zIndex: 99999,
        //   pointerEvents: "none",
      }}
    >
      <Typography component={"h2"} sx={{ fontSize: "18px", fontWeight: "bold", mb: "8px" }}>
        {currentStep.title}
      </Typography>
      {currentStep.description}
      <Stack direction={"row"} alignItems="center" justifyContent={"space-between"} spacing={"16px"}>
        <Typography sx={{ fontWeight: 300 }}>
          {currentStepIdx + 1} / {stepsLength}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={onPreviousStep}
            sx={{
              borderRadius: "32px",
              mr: "16px",

              borderColor: theme => (theme.palette.mode === "dark" ? "white" : "black"),
              color: theme => (theme.palette.mode === "dark" ? "white" : "black"),
              ":hover": {
                borderColor: theme => (theme.palette.mode === "dark" ? "white" : "black"),
                color: theme => (theme.palette.mode === "dark" ? "white" : "black"),
              },
              p: "8px 32px",
            }}
          >
            Prev
          </Button>

          {currentStepIdx < stepsLength - 1 && (
            <Button
              variant="contained"
              onClick={onNextStep}
              style={{ zIndex: 898999 }}
              sx={{
                borderRadius: "32px",
                p: "8px 32px",
                backgroundColor: "#FF6D00",
                ":hover": { backgroundColor: "#f57a1c" },
              }}
            >
              Next
            </Button>
          )}
          {currentStepIdx === stepsLength - 1 && (
            <Button
              variant="contained"
              onClick={onNextStep}
              sx={{
                borderRadius: "32px",
                p: "8px 32px",
                backgroundColor: "#FF6D00",
                ":hover": { backgroundColor: "#f57a1c" },
              }}
            >
              {"Finalize"}
            </Button>
          )}
        </Box>
      </Stack>
    </Box>
  );
};
