import { Box, Button, Stack, Typography } from "@mui/material";
import React, { useMemo, useRef } from "react";

import { TargetClientRect } from "../../hooks/useInteractiveTutorial";
import { SetStepType, TutorialState } from "../../nodeBookTypes";

const TOOLTIP_OFFSET = 40;

type TutorialProps = {
  tutorialState: TutorialState;
  // dispatchNodeTutorial: Dispatch<SetStep>;
  onChangeStep: (step: SetStepType) => void;
  // onNextStep: () => void;
  // onPreviousStep: () => void;
  targetClientRect: TargetClientRect;
};

export const Tutorial = ({ tutorialState, targetClientRect, onChangeStep }: TutorialProps) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const tooltipClientRect = useMemo(() => {
    if (!tooltipRef.current) return { top: 0, left: 0 };
    if (!tutorialState) return { top: 0, left: 0 };

    console.log("rect", {
      targetClientRect,
      tooltipRef: tooltipRef.current.clientHeight,
      tooltipGetClientRects: tooltipRef.current.getClientRects(),
      tooltipGETVoundClientReact: tooltipRef.current.getBoundingClientRect(),
    });
    const { height: tooltipHeight } = tooltipRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;
    const pos = tutorialState.tooltipPosition;
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
  }, [targetClientRect, tutorialState]);

  if (!tutorialState) return null;

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
          <h2>{tutorialState.title}</h2>
          <p>{tutorialState.description}</p>
          <button onClick={() => onChangeStep(tutorialState.previosStepName)}>{"<<"}</button>

          {tutorialState.stepNumber < tutorialState.stepLenght && (
            <button onClick={() => onChangeStep(tutorialState.nextStepName)}>{">>"}</button>
          )}
          {tutorialState.stepNumber === tutorialState.stepLenght && (
            <button onClick={() => onChangeStep(tutorialState.previosStepName)}>{"Finalize"}</button>
          )}
        </div>
      </div>
    );

  return (
    <Box
      ref={tooltipRef}
      className={`tooltip tooltip-${tutorialState.tooltipPosition}`}
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
        {tutorialState.title}
      </Typography>
      {tutorialState.description}
      <Stack direction={"row"} alignItems="center" justifyContent={"space-between"} spacing={"16px"}>
        <Typography sx={{ fontWeight: 300 }}>
          {tutorialState.stepNumber} / {tutorialState.stepLenght}
        </Typography>
        <Box>
          <Button
            variant="contained"
            onClick={() => onChangeStep(null)}
            sx={{
              borderRadius: "32px",
              p: "8px 32px",
              mr: "16px",
              backgroundColor: "#FF6D00",
              ":hover": { backgroundColor: "#f57a1c" },
            }}
          >
            Skip
          </Button>
          <Button
            variant="outlined"
            onClick={() => onChangeStep(tutorialState.previosStepName)}
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

          {tutorialState.stepNumber < tutorialState.stepLenght && (
            <Button
              variant="contained"
              onClick={() => onChangeStep(tutorialState.nextStepName)}
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
          {tutorialState.stepNumber === tutorialState.stepLenght && (
            <Button
              variant="contained"
              onClick={() => onChangeStep(tutorialState.nextStepName)}
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
