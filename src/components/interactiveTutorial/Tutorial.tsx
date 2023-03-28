import { Box, Button, Stack, Typography, useMediaQuery } from "@mui/material";
import React, { useCallback, useMemo, useRef } from "react";

import { useWindowSize } from "@/hooks/useWindowSize";
import { gray50, gray200, gray400, gray500, gray700, gray800 } from "@/pages/home";

import { TargetClientRect, Tutorial } from "../../hooks/useInteractiveTutorial3";
import { FullNodeData, TutorialStep } from "../../nodeBookTypes";

const TOOLTIP_OFFSET = 20;
const TOOLTIP_TALE_SIZE = 10;
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
  isOnPortal?: boolean;
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
  isOnPortal,
}: TutorialProps) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const isMobile = useMediaQuery("(max-width:600px)");

  // console.log({ tutorialStep, tutorial });

  const calcWithExceed = useCallback(
    (top: number, left: number) => {
      if (!tooltipRef.current) return { top, left };

      //if the width of tooltip exceeds the winwow heigth
      const exceedBottom = top + tooltipRef.current.clientHeight - windowHeight;
      top = exceedBottom > 0 ? top - exceedBottom - 4 : top;

      //if the top of the tooltip is less than - 0
      top = top < 0 ? 10 : top;

      //if the width of tooltip exceeds the winwow width
      const exceedRight = left + tooltipRef.current.clientWidth - windowWidth;
      left = exceedRight > 0 ? left - exceedRight - 4 : left;

      //if the left of the tooltip is less than - 0
      left = left < 0 ? 10 : left;
      return { top, left };
    },
    [windowHeight, windowWidth]
  );

  const tooltipRect = useMemo(() => {
    let top = 0;
    let left = 0;
    let exceedTop = 0;
    let exceedLeft = 0;
    console.log("TOOLTIP_CLIENT_RECT", { tutorialStep });

    if (!tooltipRef.current) return { top, left, exceedTop, exceedLeft };
    if (!tutorialStep) return { top, left, exceedTop, exceedLeft };

    // const { height: tooltipHeight } = tooltipRef.current.getBoundingClientRect();
    const pos = tutorialStep.tooltipPosition;
    if (pos === "top") {
      top = targetClientRect.top - tooltipRef.current.clientHeight - TOOLTIP_OFFSET;
      left = targetClientRect.left + targetClientRect.width / 2 - tooltipRef.current.clientWidth / 2;

      if (tutorialStep.anchor === "Portal") {
        const { top: newTop, left: newLeft } = calcWithExceed(top, left);
        exceedLeft = left - newLeft;
        top = newTop;
        left = newLeft;
      }
    }
    if (pos === "bottom") {
      top = targetClientRect.top + targetClientRect.height + TOOLTIP_OFFSET;
      left = targetClientRect.left + targetClientRect.width / 2 - tooltipRef.current.clientWidth / 2;
      if (tutorialStep.anchor === "Portal") {
        const { top: newTop, left: newLeft } = calcWithExceed(top, left);
        exceedLeft = left - newLeft;
        top = newTop;
        left = newLeft;
      }
    }
    if (pos === "left") {
      top =
        targetClientRect.top + targetClientRect.height / 2 - tooltipRef.current.clientHeight / 2 + TOOLTIP_TALE_SIZE;
      left = targetClientRect.left - tooltipRef.current.clientWidth - TOOLTIP_OFFSET;
      if (tutorialStep.anchor === "Portal") {
        const { top: newTop, left: newLeft } = calcWithExceed(top, left);
        exceedTop = top - newTop;
        top = newTop;
        left = newLeft;
      }
    }

    if (pos === "right") {
      top =
        targetClientRect.top + targetClientRect.height / 2 - tooltipRef.current.clientHeight / 2 + TOOLTIP_TALE_SIZE;
      left = targetClientRect.left + targetClientRect.width + TOOLTIP_OFFSET;
      if (tutorialStep.anchor === "Portal") {
        const { top: newTop, left: newLeft } = calcWithExceed(top, left);
        exceedTop = top - newTop;
        top = newTop;
        left = newLeft;
      }
    }
    return { top, left, exceedTop, exceedLeft };
    //INFO: Keep targetClientRect, render does not work if we listen to targetClientRect.props
  }, [calcWithExceed, targetClientRect, tutorialStep]);

  const taleRect = useMemo(() => {
    let top = undefined;
    let left = undefined;
    let right = undefined;
    let bottom = undefined;
    if (!tooltipRef.current) return { top, left, right, bottom };
    if (!tutorialStep) return { top, left, right, bottom };

    //keep for recalc memo, otherwise will catch wrong prev  position
    if (!targetClientRect) return { top, left, right, bottom };

    const pos = tutorialStep.tooltipPosition;

    if (pos === "top") {
      bottom = -TOOLTIP_TALE_SIZE;
      left = tooltipRef.current.clientWidth / 2 - TOOLTIP_TALE_SIZE;
    }
    if (pos === "bottom") {
      top = -TOOLTIP_TALE_SIZE;
      left = tooltipRef.current.clientWidth / 2 - TOOLTIP_TALE_SIZE;
    }
    if (pos === "left") {
      top = tooltipRef.current.clientHeight / 2 - TOOLTIP_TALE_SIZE;
      right = -TOOLTIP_TALE_SIZE;
    }
    if (pos === "right") {
      top = tooltipRef.current.clientHeight / 2 - TOOLTIP_TALE_SIZE;
      left = -TOOLTIP_TALE_SIZE;
    }

    return { top, left, right, bottom };
  }, [targetClientRect, tutorialStep]);

  // if (!node) return null;
  if (!tutorialStep) return null;
  if (!tutorialStep.currentStepName) return null;

  const OFFSET = isMobile ? "5px" : "10px";
  let location = { top: OFFSET, bottom: OFFSET, left: OFFSET, right: OFFSET };

  if (tutorialStep.tooltipPosition === "topLeft") location = { ...location, bottom: "", right: isMobile ? "5px" : "" };
  else if (tutorialStep.tooltipPosition === "topRight")
    location = { ...location, bottom: "", left: isMobile ? "5px" : "" };
  else if (tutorialStep.tooltipPosition === "bottomLeft")
    location = { ...location, top: "", right: isMobile ? "5px" : "" };
  else if (tutorialStep.tooltipPosition === "bottomRight")
    location = { ...location, top: "", left: isMobile ? "5px" : "" };

  if (
    targetClientRect.top === 0 &&
    targetClientRect.left === 0 &&
    targetClientRect.width === 0 &&
    targetClientRect.height === 0
  )
    return (
      <Box
        sx={{
          boxSizing: "border-box",
          position: "absolute",
          ...location,
          width: isOnPortal ? "auto" : "450px",
          height: "auto",
          maxWidth: "450px",
          backgroundColor: "#55555500",

          transition: "top 1s ease-out,bottom 1s ease-out,left 1s ease-out,rigth 1s ease-out,height 1s ease-out",
          zIndex: 99999,
        }}
      >
        <Box
          ref={tooltipRef}
          sx={{
            width: "100%",
            p: "24px 32px",
            backgroundColor: theme => (theme.palette.mode === "dark" ? gray500 : "#C5D0DF"),
            border: theme => `2px solid ${theme.palette.mode === "dark" ? "#667085" : gray400}`,
            color: theme => (theme.palette.mode === "dark" ? gray50 : gray800),
            borderRadius: "12px",

            transition: "top 1s ease-out,left 1s ease-out",
            zIndex: 99999,
          }}
        >
          <Stack direction={"row"} justifyContent="space-between" sx={{ mb: "12px" }}>
            <Typography component={"h2"} sx={{ fontSize: "18px", fontWeight: "bold", display: "inline-block" }}>
              {tutorialStep.title}
            </Typography>
            {stepsLength <= 1 || (
              <Typography sx={{ display: "inline-block", color: "inherit" }}>
                {tutorialStep.currentStepName} / {stepsLength}
              </Typography>
            )}
          </Stack>

          {typeof tutorialStep.description === "function"
            ? node
              ? tutorialStep.description(node)
              : ""
            : tutorialStep.description}

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
                  disabled={tutorialStep.isClickable}
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
                Close
              </Button>
            )}
          </Stack>
        </Box>
      </Box>
    );

  return (
    <Box
      ref={tooltipRef}
      sx={{
        position: "absolute",
        top: `${tooltipRect.top}px`,
        left: isOnPortal && isMobile ? "5px" : `${tooltipRect.left}px`,
        right: isMobile ? "5px" : undefined,
        transition: "top 750ms ease-out,left 750ms ease-out, border-color 1s linear",
        maxWidth: "450px",
        width: isOnPortal ? (isMobile ? "auto" : "100%") : "450px",
        backgroundColor: theme => (theme.palette.mode === "dark" ? gray500 : "#C5D0DF"),
        p: "24px 32px",
        borderRadius: "12px",
        border: theme => `2px solid ${theme.palette.mode === "dark" ? "#667085" : gray400}`,
        color: theme => (theme.palette.mode === "dark" ? gray50 : gray800),
        zIndex: 99999,

        ":after": {
          position: "absolute",
          content: "''",
          border: "solid 10px transparent",
          //tale onto TOP
          borderBottomWidth: `${tutorialStep.tooltipPosition === "top" ? 0 : undefined}`,
          borderTopColor:
            tutorialStep.tooltipPosition === "top"
              ? theme => (theme.palette.mode === "dark" ? "#667085" : gray400)
              : undefined,
          //tale onto BOTTOM
          borderTopWidth: `${tutorialStep.tooltipPosition === "bottom" ? 0 : undefined}`,
          borderBottomColor:
            tutorialStep.tooltipPosition === "bottom"
              ? theme => (theme.palette.mode === "dark" ? "#667085" : gray400)
              : undefined,
          //tale onto LEFT
          borderRightWidth: `${tutorialStep.tooltipPosition === "left" ? 0 : undefined}`,
          borderLeftColor:
            tutorialStep.tooltipPosition === "left"
              ? theme => (theme.palette.mode === "dark" ? "#667085" : gray400)
              : undefined,
          //tale onto RIGHT
          borderLeftWidth: `${tutorialStep.tooltipPosition === "right" ? 0 : undefined}`,
          borderRightColor:
            tutorialStep.tooltipPosition === "right"
              ? theme => (theme.palette.mode === "dark" ? "#667085" : gray400)
              : undefined,
          top: taleRect.top ? `${taleRect.top + tooltipRect.exceedTop}px` : undefined,
          bottom: taleRect.bottom ? `${taleRect.bottom}px` : undefined,
          left: taleRect.left ? `${taleRect.left + tooltipRect.exceedLeft}px` : undefined,
          right: taleRect.right ? `${taleRect.right}px` : undefined,
        },
      }}
    >
      <Stack direction={"row"} alignItems="center" justifyContent="space-between" mb="16px">
        <Typography component={"h2"} sx={{ fontSize: "18px", fontWeight: "bold", display: "inline-block" }}>
          {tutorialStep.title}
        </Typography>
        {stepsLength <= 1 || (
          <Typography sx={{ display: "inline-block", color: "inherit" }}>
            {tutorialStep.currentStepName} / {stepsLength}
          </Typography>
        )}
      </Stack>

      <Box sx={{ fontSize: "14px" }}>
        {typeof tutorialStep.description === "function"
          ? node
            ? tutorialStep.description(node)
            : ""
          : tutorialStep.description}
      </Box>

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
            Close
          </Button>
        )}
      </Stack>
    </Box>
  );
};
