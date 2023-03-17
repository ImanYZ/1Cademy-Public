import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import React, { useCallback, useState } from "react";

import { TutorialStep, TutorialTypeKeys, UserTutorials } from "../../nodeBookTypes";

export type GroupTutorial = {
  title: string;
  tutorials: GroupTutorial[];
  tutorialSteps?: { tutorialKey: TutorialTypeKeys; steps: TutorialStep[] };
};

type TutorialTableOfContentProps = {
  open: boolean;
  handleCloseProgressBar: () => void;
  groupTutorials: GroupTutorial[];
  userTutorialState: UserTutorials;
  onCancelTutorial: () => void;
  onForceTutorial: (keyTutorial: TutorialTypeKeys) => void;
  reloadPermanentGraph: () => void;
};

const TutorialTableOfContent = ({
  open,
  handleCloseProgressBar,
  groupTutorials,
  userTutorialState,
  onCancelTutorial,
  onForceTutorial,
  reloadPermanentGraph,
}: TutorialTableOfContentProps) => {
  const onStartTutorial = useCallback(
    (keyTutorial: TutorialTypeKeys) => {
      reloadPermanentGraph();
      onForceTutorial(keyTutorial);
      onCancelTutorial();
    },
    [onCancelTutorial, onForceTutorial, reloadPermanentGraph]
  );
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const CustomAccordion = ({ tutorials, level = 0 }: { tutorials: GroupTutorial[]; level?: number }) => {
    return (
      <>
        {tutorials.map((currentTutorial, tutorialIdx) => {
          return (
            <Accordion
              key={currentTutorial.title}
              disableGutters
              sx={{
                border: "none",
                background: theme => (theme.palette.mode === "dark" ? "rgb(31,31,31)" : "rgb(240,240,240)"),
                "&:before": {
                  display: "none",
                },
              }}
              expanded={expanded[currentTutorial.title]}
              onChange={(e, newExpand) => {
                setExpanded(expanded => ({ ...expanded, [currentTutorial.title]: newExpand ? true : false }));
              }}
            >
              <AccordionSummary
                sx={{
                  p: "0px",
                  "& .MuiAccordionSummary-content": { m: "0px" },
                }}
              >
                <Stack
                  direction={"row"}
                  alignItems={"center"}
                  spacing={"10px"}
                  sx={{
                    width: "100%",
                    p: "18px 24px",
                  }}
                >
                  {currentTutorial.tutorialSteps && (
                    <IconButton
                      onClick={e => {
                        e.stopPropagation();
                        onStartTutorial(currentTutorial.tutorialSteps.tutorialKey, tutorialIdx);
                      }}
                      size={"small"}
                      sx={{ p: "0px" }}
                    >
                      <PlayCircleIcon />
                    </IconButton>
                  )}
                  <Box sx={{ display: "flex", flexGrow: 1, alignItems: "center", justifyContent: "space-between" }}>
                    <Typography
                      component={"h4"}
                      variant={"h4"}
                      sx={{
                        cursor: "pointer",
                        fontSize: level > 0 ? "16px" : undefined,
                      }}
                    >
                      {currentTutorial.title}
                    </Typography>
                    {((currentTutorial.tutorialSteps && currentTutorial.tutorialSteps.steps.length > 1) ||
                      (currentTutorial.tutorials && currentTutorial.tutorials.length > 1)) && (
                      <ArrowForwardIosSharpIcon
                        fontSize="small"
                        sx={{
                          transform: `rotate(${expanded[currentTutorial.title] ? "-90deg" : "90deg"})`,
                          transition: "transform 100ms linear",
                        }}
                      />
                    )}
                  </Box>
                </Stack>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  p: "0px",
                  pl: level > 0 ? "12px" : "0px",
                  background: theme => (theme.palette.mode === "dark" ? "rgb(39, 39, 39)" : "rgb(230, 230, 230)"),
                }}
              >
                {currentTutorial.tutorialSteps &&
                  currentTutorial.tutorialSteps.steps.length > 1 &&
                  currentTutorial.tutorialSteps.steps.map((curStep, idx) => (
                    <Stack
                      key={`${curStep.title}-${idx}`}
                      component={"li"}
                      direction={"row"}
                      alignItems="center"
                      spacing={"8px"}
                      sx={{ p: "12px 24px" }}
                    >
                      {userTutorialState[currentTutorial.tutorialSteps.tutorialKey].currentStep >= idx + 1 ? (
                        <CheckCircleIcon fontSize="small" color={"success"} />
                      ) : (
                        <Box sx={{ width: "20px", height: "20px" }} />
                      )}
                      <Typography
                        sx={{
                          display: "inline-block",
                          color: theme => (theme.palette.mode === "light" ? "#1d2229" : "#EAECF0"),
                          opacity: "0.5",
                        }}
                        fontSize={"16px"}
                      >
                        {curStep.title}
                      </Typography>
                    </Stack>
                  ))}

                <CustomAccordion tutorials={currentTutorial.tutorials} level={level + 1} />
              </AccordionDetails>
            </Accordion>
          );
        })}
      </>
    );
  };

  return (
    <Box
      id="progress-bar"
      sx={{
        position: "fixed",
        top: "75px",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        background: theme => (theme.palette.mode === "dark" ? "#2f2f2f" : "#f2f4f7"),
        borderRadius: "8px",
        width: "348px",
        bottom: "7px",
        right: `${open ? "7px" : "-400px"}`,
        transition: "right 300ms ease-out",
        zIndex: 99999,
      }}
    >
      <Box
        sx={{
          p: "32px 24px",
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography fontSize={"24px"}>Notebook Tutorial</Typography>
        <IconButton onClick={handleCloseProgressBar} size={"small"}>
          <CloseIcon fontSize="medium" />
        </IconButton>
      </Box>
      <Box className="scroll-styled" sx={{ overflowY: "auto" }}>
        <CustomAccordion tutorials={groupTutorials} />
      </Box>
    </Box>
  );
};

export const MemoizedTutorialTableOfContent = React.memo(TutorialTableOfContent, (prev, next) => {
  return prev.open === next.open && prev.userTutorialState === next.userTutorialState;
});
