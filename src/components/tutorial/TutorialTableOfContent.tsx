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
  const [expanded, setExpanded] = useState<string>("");

  const onChangeExpanded = useCallback(
    (currentTutorialTitle: string) => (e: any, newExpand: boolean) => {
      setExpanded(newExpand ? currentTutorialTitle : "");
    },
    []
  );

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
        width: "350px",
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
        {groupTutorials.map(currentTutorial => {
          return (
            <Accordion
              key={currentTutorial.title}
              disableGutters
              sx={{
                backgroundColor: "inherit",
                boxShadow: "none",
                "&:before": {
                  display: "none",
                },
              }}
              expanded={expanded === currentTutorial.title}
              onChange={onChangeExpanded(currentTutorial.title)}
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
                  <Box sx={{ display: "flex", flexGrow: 1, alignItems: "center", justifyContent: "space-between" }}>
                    <Typography
                      component={"h4"}
                      variant={"h4"}
                      sx={{
                        cursor: "pointer",
                      }}
                    >
                      {currentTutorial.title}
                    </Typography>

                    {currentTutorial.tutorials.length > 0 && (
                      <ArrowForwardIosSharpIcon
                        sx={{
                          transform: `rotate(${expanded === currentTutorial.title ? "-90deg" : "90deg"})`,
                          transition: "transform 100ms linear",
                          fontSize: "14px",
                        }}
                      />
                    )}
                  </Box>
                </Stack>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  p: "0px",
                }}
              >
                {currentTutorial.tutorials.map((currentTutorial, idx) => {
                  return (
                    <Stack
                      key={idx}
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
                            if (currentTutorial.tutorialSteps) {
                              onStartTutorial(currentTutorial.tutorialSteps.tutorialKey);
                            }
                          }}
                          size={"small"}
                          sx={{ p: "0px" }}
                        >
                          <PlayCircleIcon />{" "}
                          {/* TODO: find a way to change DB also when is forced to have changes in TOC */}
                        </IconButton>
                      )}
                      <Box sx={{ display: "flex", flexGrow: 1, alignItems: "center", justifyContent: "space-between" }}>
                        <Typography
                          component={"h4"}
                          variant={"h4"}
                          sx={{
                            cursor: "pointer",
                          }}
                        >
                          {currentTutorial.title}
                        </Typography>

                        {currentTutorial.tutorials.length > 0 && (
                          <ArrowForwardIosSharpIcon
                            sx={{
                              transform: `rotate(${expanded === currentTutorial.title ? "-90deg" : "90deg"})`,
                              transition: "transform 100ms linear",
                              fontSize: "14px",
                            }}
                          />
                        )}

                        {currentTutorial.tutorialSteps &&
                          (userTutorialState[currentTutorial.tutorialSteps.tutorialKey].done ||
                            userTutorialState[currentTutorial.tutorialSteps.tutorialKey].skipped) && (
                            <CheckCircleIcon fontSize="small" color={"success"} />
                          )}
                      </Box>
                    </Stack>
                  );
                })}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
};

export const MemoizedTutorialTableOfContent = React.memo(TutorialTableOfContent);
