import { Box, Button, Stack, Typography } from "@mui/material";
import React, { useMemo, useRef } from "react";

import { gray50, gray200, gray700, gray800 } from "@/pages/home";

import { TargetClientRect } from "../../hooks/useInteractiveTutorial";
import { TutorialState } from "../../nodeBookTypes";

const TOOLTIP_OFFSET = 40;

type TutorialProps = {
  tutorialState: TutorialState;

  // dispatchNodeTutorial: Dispatch<SetStep>;
  // onChangeStep: (step: SetStepType) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  targetClientRect: TargetClientRect;
  handleCloseProgressBarMenu: () => void;
  // onUpdateNode: (tutorialKey: TutorialType, tutorialUpdated: UserTutorial) => void;
  onSkip: () => void;
  onFinalize: () => void;
  stepsLength: number;
};

export const Tutorial = ({
  tutorialState,
  targetClientRect,
  onNextStep,
  onPreviousStep,
  handleCloseProgressBarMenu,
  // onSkipTutorial,
  // onUpdateNode,
  onSkip,
  onFinalize,
  stepsLength,
}: TutorialProps) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const tooltipClientRect = useMemo(() => {
    if (!tooltipRef.current) return { top: 0, left: 0 };
    if (!tutorialState) return { top: 0, left: 0 };

    // console.log("rect", {
    //   targetClientRect,
    //   tooltipRef: tooltipRef.current.clientHeight,
    //   tooltipGetClientRects: tooltipRef.current.getClientRects(),
    //   tooltipGETVoundClientReact: tooltipRef.current.getBoundingClientRect(),
    // });
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
    // console.log("first new top left", { top, left });

    return { top, left };
  }, [targetClientRect, tutorialState]);

  console.log({ tutorialState, tooltipClientRect, targetClientRect });
  if (!tutorialState) return null;
  console.log(1);
  if (!tutorialState.currentStepName) return null;
  console.log(2);

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
          top: "10px",
          bottom: tutorialState.tooltipPosition === "topLeft" ? undefined : "10px",
          left: "10px",
          right: tutorialState.tooltipPosition === "topLeft" ? undefined : "10px",
          backgroundColor: "#55555500",
          transition: "top 1s ease-out,left 1s ease-out",
          boxSizing: "border-box",
          display: "grid",
          placeItems: "center",
          zIndex: 99999,
        }}
      >
        <Box
          ref={tooltipRef}
          sx={{
            transition: "top 1s ease-out,left 1s ease-out",
            width: "450px",
            backgroundColor: "#4B535C",
            p: "24px 32px",
            borderRadius: "8px",
            color: "white",
            zIndex: 99999,
          }}
        >
          <Stack direction={"row"} justifyContent="space-between" sx={{ mb: "12px" }}>
            <Typography component={"h2"} sx={{ fontSize: "18px", fontWeight: "bold", display: "inline-block" }}>
              {tutorialState.title}
            </Typography>
            <Typography sx={{ display: "inline-block", color: "#818181" }}>
              {tutorialState.currentStepName} / {stepsLength}
            </Typography>
          </Stack>

          {tutorialState.description}

          <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} sx={{ mt: "16px" }}>
            <Button
              variant="text"
              onClick={() => {
                handleCloseProgressBarMenu();
                // onChangeStep(null);
                // onUpdateNode("nodes", tutorialState.currentStepName, {});
                onSkip();
              }}
              sx={{
                p: "8px 0px",
              }}
            >
              Skip
            </Button>
            <Box>
              {tutorialState.currentStepName > 1 && (
                <Button
                  variant="outlined"
                  onClick={onPreviousStep}
                  sx={{
                    borderRadius: "32px",
                    mr: "16px",

                    p: "8px 32px",
                  }}
                >
                  Prev
                </Button>
              )}

              {tutorialState.currentStepName < stepsLength && (
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
                  disabled={tutorialState.isClickeable}
                >
                  Next
                </Button>
              )}
              {tutorialState.currentStepName === stepsLength && (
                <Button
                  variant="contained"
                  onClick={() => {
                    handleCloseProgressBarMenu();
                    // onNextStep();
                    onFinalize();
                  }}
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
      </div>
    );

  console.log(3);
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
        backgroundColor: theme => (theme.palette.mode === "dark" ? "#4B535C" : "#C5D0DF"),
        borderColor: theme => (theme.palette.mode === "dark" ? "#4B535C" : "#C5D0DF"),
        p: "24px 32px",
        borderRadius: "8px",
        color: theme => (theme.palette.mode === "dark" ? gray50 : gray800),
        zIndex: 99999,
      }}
    >
      <Stack direction={"row"} justifyContent="space-between" sx={{ mb: "12px" }}>
        <Typography component={"h2"} sx={{ fontSize: "18px", fontWeight: "bold", display: "inline-block" }}>
          {tutorialState.title}
        </Typography>
        <Typography sx={{ display: "inline-block", color: "inherit" }}>
          {tutorialState.currentStepName} / {stepsLength}
        </Typography>
      </Stack>

      {tutorialState.description}

      <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} sx={{ mt: "16px" }}>
        <Button
          variant="text"
          onClick={() => {
            handleCloseProgressBarMenu();
            // onChangeStep(null);
            // onUpdateNode("nodes", tutorialState.currentStepName, {});
            onSkip();
          }}
          sx={{
            color: "inherit",
            p: "8px 0px",
            ":hover": { backgroundColor: theme => (theme.palette.mode === "dark" ? "#575f68" : "#d7dee6") },
          }}
        >
          Skip
        </Button>
        <Box>
          {tutorialState.currentStepName > 1 && (
            <Button
              variant="outlined"
              onClick={onPreviousStep}
              sx={{
                borderRadius: "32px",
                mr: "16px",
                p: "8px 32px",
                color: "inherit",
                borderColor: theme => (theme.palette.mode === "dark" ? gray50 : gray800),
                ":hover": {
                  borderColor: "inherit",
                  color: "inherit",
                  backgroundColor: theme => (theme.palette.mode === "dark" ? "#575f68" : "#d7dee6"),
                },
              }}
            >
              Prev
            </Button>
          )}

          {tutorialState.currentStepName < stepsLength && (
            <Button
              variant="contained"
              onClick={onNextStep}
              style={{ zIndex: 898999 }}
              sx={{
                borderRadius: "32px",
                p: "8px 32px",
                color: theme => (theme.palette.mode === "dark" ? gray800 : gray50),
                backgroundColor: theme => (theme.palette.mode === "dark" ? gray50 : gray800),
                ":hover": {
                  backgroundColor: theme => (theme.palette.mode === "dark" ? gray200 : gray700),
                },
              }}
              disabled={tutorialState.isClickeable}
            >
              Next
            </Button>
          )}
          {tutorialState.currentStepName === stepsLength && (
            <Button
              variant="contained"
              onClick={() => {
                handleCloseProgressBarMenu();
                // onNextStep();
                onFinalize();
              }}
              sx={{
                borderRadius: "32px",
                p: "8px 32px",
                color: theme => (theme.palette.mode === "dark" ? gray800 : gray50),
                backgroundColor: theme => (theme.palette.mode === "dark" ? gray50 : gray800),
                ":hover": {
                  backgroundColor: theme => (theme.palette.mode === "dark" ? gray200 : gray700),
                },
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
