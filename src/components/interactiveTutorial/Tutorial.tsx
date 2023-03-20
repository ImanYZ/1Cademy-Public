import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import { Box, Button, Stack, Typography } from "@mui/material";
import React, { useMemo, useRef } from "react";

import { gray50, gray200, gray700, gray800 } from "@/pages/home";

import { TargetClientRect, Tutorial } from "../../hooks/useInteractiveTutorial3";
import { FullNodeData, TutorialStep } from "../../nodeBookTypes";

const TOOLTIP_OFFSET = 40;

type TutorialProps = {
  tutorial: Tutorial;
  tutorialStep: TutorialStep | null;
  onNextStep: () => void;
  onPreviousStep: () => void;
  targetClientRect: TargetClientRect;
  handleCloseProgressBarMenu: () => void;
  onSkip: () => void;
  onFinalize: () => void;
  stepsLength: number;
  node: FullNodeData;
};

export const TooltipTutorial = ({
  // tutorial,// TODO: remove
  tutorialStep,
  targetClientRect,
  onNextStep,
  onPreviousStep,
  handleCloseProgressBarMenu,
  onSkip,
  onFinalize,
  stepsLength,
  node,
}: TutorialProps) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // console.log({ tutorialStep, tutorial });
  const tooltipClientRect = useMemo(() => {
    if (!tooltipRef.current) return { top: 0, left: 0 };
    if (!tutorialStep) return { top: 0, left: 0 };

    const { height: tooltipHeight } = tooltipRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;
    const pos = tutorialStep.tooltipPosition;
    if (pos === "top") {
      top = targetClientRect.top - tooltipHeight - TOOLTIP_OFFSET;
      left = targetClientRect.left + targetClientRect.width / 2 - tooltipRef.current.clientWidth / 2;
    }
    if (pos === "bottom") {
      top = targetClientRect.top + targetClientRect.height + TOOLTIP_OFFSET;
      left = targetClientRect.left + targetClientRect.width / 2 - tooltipRef.current.clientWidth / 2;
    }
    if (pos === "left") {
      top = targetClientRect.top + targetClientRect.height / 2 - tooltipRef.current.clientHeight / 2;
      left = targetClientRect.left - tooltipRef.current.clientWidth - TOOLTIP_OFFSET;
    }
    TooltipTutorial;
    if (pos === "right") {
      top = targetClientRect.top + targetClientRect.height / 2 - tooltipRef.current.clientHeight / 2;
      left = targetClientRect.left + targetClientRect.width + TOOLTIP_OFFSET;
    }

    return { top, left };
  }, [targetClientRect, tutorialStep]);

  if (!tutorialStep) return null;
  if (!tutorialStep.currentStepName) return null;

  let location = { top: "10px", bottom: "10px", left: "10px", right: "10px" };

  if (tutorialStep.tooltipPosition === "topLeft") location = { ...location, bottom: "", right: "" };
  else if (tutorialStep.tooltipPosition === "topRight") location = { ...location, bottom: "", left: "" };
  else if (tutorialStep.tooltipPosition === "bottomLeft") location = { ...location, top: "", right: "" };
  else if (tutorialStep.tooltipPosition === "bottomRight") location = { ...location, top: "", left: "" };

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
          ...location,
          backgroundColor: "#55555500",
          height: "auto",
          transition: "top 1s ease-out,bottom 1s ease-out,left 1s ease-out,rigth 1s ease-out,height 1s ease-out",
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
            backgroundColor: theme => (theme.palette.mode === "dark" ? "#4B535C" : "#C5D0DF"),
            p: "24px 32px",
            borderRadius: "8px",
            color: theme => (theme.palette.mode === "dark" ? gray50 : gray800),
            zIndex: 99999,
          }}
        >
          <Stack direction={"row"} justifyContent="space-between" sx={{ mb: "12px" }}>
            <Stack direction={"row"} alignItems="center" spacing={"8px"}>
              <Typography component={"h2"} sx={{ fontSize: "18px", fontWeight: "bold", display: "inline-block" }}>
                {tutorialStep.title}
              </Typography>
              <LiveHelpIcon />
            </Stack>
            {stepsLength <= 1 || (
              <Typography sx={{ display: "inline-block", color: "#818181" }}>
                {tutorialStep.currentStepName} / {stepsLength}
              </Typography>
            )}
          </Stack>

          {typeof tutorialStep.description === "function" ? tutorialStep.description(node) : tutorialStep.description}

          {/* INFO: reversed used for showing buttons always to right no matter the number of buttons */}
          <Stack direction={"row-reverse"} justifyContent={"space-between"} alignItems={"center"} sx={{ mt: "16px" }}>
            <Box>
              {tutorialStep.currentStepName > 1 && (
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

              {tutorialStep.currentStepName < stepsLength && (
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
                  disabled={tutorialStep.isClickeable}
                >
                  Next
                </Button>
              )}
              {tutorialStep.currentStepName === stepsLength && (
                <Button
                  variant="contained"
                  onClick={() => {
                    handleCloseProgressBarMenu();
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
                  Got It
                </Button>
              )}
            </Box>
            {tutorialStep.currentStepName !== stepsLength && (
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
            )}
          </Stack>
        </Box>
      </div>
    );

  return (
    <Box
      ref={tooltipRef}
      className={`tooltip tooltip-${tutorialStep.tooltipPosition}`}
      sx={{
        position: "absolute",
        top: `${tooltipClientRect.top}px`,
        left: `${tooltipClientRect.left}px`,
        transition: "top 1s ease-out,left 1s ease-out",
        width: "450px",
        backgroundColor: theme => (theme.palette.mode === "dark" ? "#4B535C" : "#C5D0DF"),
        borderColor: theme => (theme.palette.mode === "dark" ? "#4B535C" : "#C5D0DF") /* this is used in tooltip */,
        p: "24px 32px",
        borderRadius: "8px",
        color: theme => (theme.palette.mode === "dark" ? gray50 : gray800),
        zIndex: 99999,
      }}
    >
      <Stack direction={"row"} justifyContent="space-between" sx={{ mb: "12px" }}>
        <Stack direction={"row"} alignItems="center" spacing={"8px"}>
          <Typography component={"h2"} sx={{ fontSize: "18px", fontWeight: "bold", display: "inline-block" }}>
            {tutorialStep.title}
          </Typography>
          <LiveHelpIcon />
        </Stack>
        {stepsLength <= 1 || (
          <Typography sx={{ display: "inline-block", color: "inherit" }}>
            {tutorialStep.currentStepName} / {stepsLength}
          </Typography>
        )}
      </Stack>

      {typeof tutorialStep.description === "function" ? tutorialStep.description(node) : tutorialStep.description}

      {/* INFO: reversed used for showing buttons always to right no matter the number of elements */}
      <Stack direction={"row-reverse"} justifyContent={"space-between"} alignItems={"center"} sx={{ mt: "16px" }}>
        <Box>
          {tutorialStep.currentStepName > 1 && (
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

          {tutorialStep.currentStepName < stepsLength && (
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
            >
              Next
            </Button>
          )}
          {tutorialStep.currentStepName === stepsLength && (
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
              Got it
            </Button>
          )}
        </Box>
        {tutorialStep.currentStepName !== stepsLength && (
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
        )}
      </Stack>
    </Box>
  );
};
