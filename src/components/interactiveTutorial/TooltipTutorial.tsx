import { Box, Button, Stack, Typography, useMediaQuery } from "@mui/material";
import React, { ReactNode, useCallback, useMemo, useRef } from "react";

import { useWindowSize } from "@/hooks/useWindowSize";
import { Z_INDEX } from "@/lib/utils/constants";
import { gray50, gray200, gray400, gray500, gray700, gray800 } from "@/pages/home";

import { Tutorial } from "../../hooks/useInteractiveTutorial3";
import { FullNodeData, TOOLTIP_SIZE, TutorialStep, TutorialTypeKeys } from "../../nodeBookTypes";
import { GroupTutorial } from "../tutorial/TutorialTableOfContent";

const TOOLTIP_OFFSET = 20;
const TOOLTIP_TALE_SIZE = 10;
const TOOLTIP_WIDTH: { [key in TOOLTIP_SIZE]: number } = {
  md: 450,
  lg: 600,
};

export type TargetClientRect = { width: number; height: number; top: number; left: number };

type TutorialProps = {
  tutorial: Tutorial;
  tutorialStep: TutorialStep | null;
  onNextStep: () => void;
  onPreviousStep: () => void;
  targetClientRect: TargetClientRect;
  // handleCloseProgressBarMenu: () => void;
  onSkip: () => void;
  onFinalize: () => void;
  stepsLength: number;
  node: FullNodeData;
  forcedTutorial: TutorialTypeKeys | null;
  groupTutorials: GroupTutorial[];
  onForceTutorial: (keyTutorial: TutorialTypeKeys) => void;
  tutorialProgress: { tutorialsComplete: number; totalTutorials: number };
  showNextTutorialStep: boolean;
  setShowNextTutorialStep: (newValue: boolean) => void;
  isOnPortal?: boolean;
  parent?: FullNodeData;
  child?: FullNodeData;
};

export const TooltipTutorial = ({
  tutorial, // TODO: remove
  tutorialStep,
  targetClientRect,
  onNextStep,
  onPreviousStep,
  // handleCloseProgressBarMenu,
  onSkip,
  onFinalize,
  stepsLength,
  node,
  forcedTutorial,
  groupTutorials,
  showNextTutorialStep,
  setShowNextTutorialStep,
  isOnPortal,
  onForceTutorial,
  tutorialProgress,
  parent,
  child,
}: TutorialProps) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const isMobile = useMediaQuery("(max-width:600px)");

  const nextTutorial = useMemo(() => {
    const tutorialsSorted = groupTutorials
      .flatMap(cur => cur.tutorials)
      .reduce((acu: { title: string; key: TutorialTypeKeys }[], cur) => {
        if (!cur.tutorialSteps?.tutorialKey) return acu;
        return [...acu, { title: cur.title, key: cur.tutorialSteps.tutorialKey }];
      }, []);

    const idx = tutorialsSorted.findIndex(cur => cur.key === forcedTutorial);
    const res = tutorialsSorted[idx + 1];
    return res;
  }, [forcedTutorial, groupTutorials]);

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

    if (!tooltipRef.current) return { top, left, exceedTop, exceedLeft };
    if (!tutorialStep) return { top, left, exceedTop, exceedLeft };

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

  const currentTutorialIsTemporal = useMemo(() => {
    const temporalTutorials: TutorialTypeKeys[] = [
      "tmpParentsChildrenList",
      "tmpEditNode",
      "tmpProposalConceptChild",
      "tmpProposalQuestionChild",
      "tmpProposalRelationChild",
      "tmpProposalReferenceChild",
      "tmpProposalIdeaChild",
      "tmpProposalCodeChild",
      "tmpTagsReferences",
      "tmpPathways",
    ];
    const currentTutorialName = tutorial?.name;
    if (!currentTutorialName) return false;
    return temporalTutorials.includes(currentTutorialName);
  }, [tutorial?.name]);

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
  // let location = { top: '0px', bottom: '0px', left: '0px', right: '0px' };
  let location: { top?: string; bottom?: string; left?: string; right?: string } = {
    top: OFFSET,
    bottom: OFFSET,
    left: OFFSET,
    right: OFFSET,
  };

  if (tutorialStep.tooltipPosition === "topLeft") location = { ...location, bottom: "", right: isMobile ? "5px" : "" };
  else if (tutorialStep.tooltipPosition === "topRight")
    location = { ...location, bottom: "", left: isMobile ? "5px" : "" };
  else if (tutorialStep.tooltipPosition === "bottomLeft")
    location = { ...location, top: "", right: isMobile ? "5px" : "" };
  else if (tutorialStep.tooltipPosition === "bottomRight")
    location = { ...location, top: "", left: isMobile ? "5px" : "" };
  else location = { ...location, top: undefined, right: undefined };

  const tutorialsCompletePercentage = Math.round(
    (tutorialProgress.tutorialsComplete * 100) / tutorialProgress.totalTutorials
  );
  const wrapper = (children: ReactNode) => {
    if (
      targetClientRect.top === 0 &&
      targetClientRect.left === 0 &&
      targetClientRect.width === 0 &&
      targetClientRect.height === 0
    ) {
      //  target is on portal
      return (
        <Box
          sx={{
            boxSizing: "border-box",
            position: "absolute",
            ...location,
            width: TOOLTIP_WIDTH[tutorialStep.tooltipSize],
            height: "auto",
            maxWidth: TOOLTIP_WIDTH[tutorialStep.tooltipSize],
            backgroundColor: "#55555500",
            transition: "top 1s ease-out,bottom 1s ease-out,left 1s ease-out,right 1s ease-out,height 1s ease-out",
            zIndex: Z_INDEX.tutorials,
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
              zIndex: Z_INDEX.tutorials,
            }}
          >
            {children}
          </Box>
        </Box>
      );
    }

    return (
      <Box
        ref={tooltipRef}
        sx={{
          position: "absolute",
          top: `${tooltipRect.top}px`,
          left: isOnPortal && isMobile ? "5px" : `${tooltipRect.left}px`,
          right: isMobile ? "5px" : undefined,
          transition: "top 750ms ease-out,left 750ms ease-out, border-color 1s linear",
          maxWidth: TOOLTIP_WIDTH[tutorialStep.tooltipSize],
          width: isOnPortal ? (isMobile ? "auto" : "100%") : TOOLTIP_WIDTH[tutorialStep.tooltipSize],
          backgroundColor: theme => (theme.palette.mode === "dark" ? gray500 : "#C5D0DF"),
          p: "24px 32px",
          borderRadius: "12px",
          border: theme => `2px solid ${theme.palette.mode === "dark" ? "#667085" : gray400}`,
          color: theme => (theme.palette.mode === "dark" ? gray50 : gray800),
          zIndex: Z_INDEX.tutorials,

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
        {children}
      </Box>
    );
  };

  return wrapper(
    <>
      {/* display message to go to next tutorial */}
      {showNextTutorialStep && nextTutorial && !currentTutorialIsTemporal && (
        <Stack alignItems={"center"}>
          {/* <HelpIcon sx={{ mb: "12px", fontSize: "32px" }} /> */}

          <Box
            sx={{
              width: "60px",
              height: "60px",
              mb: "12px",
              display: "grid",
              placeContent: "center",
              borderRadius: "50%",
              background: theme =>
                `conic-gradient(${theme.palette.mode === "dark" ? "#A4FD96" : "#52AE43"}, ${
                  (tutorialsCompletePercentage * 360) / 100
                }deg, ${theme.palette.mode === "dark" ? "#868686" : "#6C74824D"} 0deg)`,
            }}
          >
            <Box
              sx={{
                width: "45px",
                height: "45px",
                display: "grid",
                placeContent: "center",
                borderRadius: "50%",
                background: theme => (theme.palette.mode === "dark" ? gray500 : "#C5D0DF"),
              }}
            >
              <Typography>{`${tutorialsCompletePercentage}%`}</Typography>
            </Box>
          </Box>

          <Typography
            component={"h2"}
            sx={{ fontSize: "18px", fontWeight: "bold", display: "inline-block", mb: "10px" }}
          >
            {`You have completed ${tutorialProgress.tutorialsComplete} out of ${tutorialProgress.totalTutorials} tutorials!`}
          </Typography>
          <Typography>{`Would you like to proceed to the next tutorial about `}</Typography>
          <Typography sx={{ mb: "16px" }}>
            <Typography component={"b"} sx={{ fontWeight: "bold" }}>
              {nextTutorial.title}
            </Typography>
            ?
          </Typography>

          <Stack direction={"row"} spacing="8px">
            <Button
              variant="outlined"
              onClick={() => {
                // handleCloseProgressBarMenu();
                onFinalize();
                setShowNextTutorialStep(false);
              }}
              sx={{
                borderRadius: "32px",
                borderColor: theme => (theme.palette.mode === "dark" ? gray50 : gray800),
                p: "8px 32px",
                color: "inherit",
                ":hover": {
                  borderColor: theme => (theme.palette.mode === "dark" ? gray50 : gray800),
                },
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                // handleCloseProgressBarMenu();
                onFinalize();
                setShowNextTutorialStep(false);
                onForceTutorial(nextTutorial.key);
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
              Proceed
            </Button>
          </Stack>
        </Stack>
      )}
      {/* display steps from a tutorial */}
      {(!showNextTutorialStep || !nextTutorial) && (
        <>
          {" "}
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
                ? tutorialStep.description(node, parent, child)
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
                    // handleCloseProgressBarMenu();
                    forcedTutorial && nextTutorial && !currentTutorialIsTemporal
                      ? setShowNextTutorialStep(true)
                      : onFinalize();
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
                  // handleCloseProgressBarMenu();
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
        </>
      )}
    </>
  );
};
