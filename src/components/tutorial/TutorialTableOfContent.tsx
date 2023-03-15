import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import React, { useState } from "react";

import { TutorialStep, TutorialTypeKeys, UserTutorials } from "../../nodeBookTypes";

type Tutorials = { [key in TutorialTypeKeys]: { title: string; steps: TutorialStep[]; hide: boolean } };

type TutorialTableOfContentProps = {
  open: boolean;
  handleCloseProgressBar: () => void;
  tutorials: Tutorials;
  userTutorialState: UserTutorials;
  onCancelTutorial: () => void;
  onForceTutorial: (keyTutorial: TutorialTypeKeys) => void;
  reloadPermanentGraph: () => void;
};

const TutorialTableOfContent = ({
  open,
  handleCloseProgressBar,
  tutorials,
  userTutorialState,
  onCancelTutorial,
  onForceTutorial,
  reloadPermanentGraph,
}: TutorialTableOfContentProps) => {
  const [expanded, setExpanded] = useState<string | false>("Option1");
  const [, /* selectedTutorial */ setSelectedTutorial] = useState<TutorialTypeKeys>(
    Object.keys(tutorials)[0] as TutorialTypeKeys
  );

  const onExpandTutorial = (option: string, stage: keyof Tutorials, newExpanded: boolean) => {
    setExpanded(newExpanded ? option : false);
    setSelectedTutorial(stage);
  };

  const handleChange =
    (option: string, stage: keyof Tutorials) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      onExpandTutorial(option, stage, newExpanded);
    };

  const onStartTutorial = (keyTutorial: TutorialTypeKeys, tutorialIdx: number) => {
    reloadPermanentGraph();
    onForceTutorial(keyTutorial);
    onExpandTutorial(`Option${tutorialIdx + 1}`, keyTutorial, true);
    onCancelTutorial();
  };

  return (
    <Box
      id="progress-bar"
      sx={{
        position: "fixed",
        top: "0px",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        background: theme => (theme.palette.mode === "dark" ? "rgb(31,31,31)" : "rgb(240,240,240)"),
        width: "300px",
        bottom: "0px",
        right: `${open ? "0px" : "-400px"}`,
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
        {(Object.keys(tutorials) as Array<TutorialTypeKeys>)
          .filter(keyTutorial => !tutorials[keyTutorial].hide)
          .map((keyTutorial, tutorialIdx) => (
            <Accordion
              key={keyTutorial}
              disableGutters
              elevation={0}
              square
              sx={{
                border: "none",
                background: theme => (theme.palette.mode === "dark" ? "rgb(31,31,31)" : "rgb(240,240,240)"),
                "&:before": {
                  display: "none",
                },
              }}
              expanded={expanded === `Option${tutorialIdx + 1}`}
              onChange={handleChange(`Option${tutorialIdx + 1}`, keyTutorial)}
            >
              <AccordionSummary
                sx={{
                  p: "0px",
                  "& .MuiAccordionSummary-content": { m: "0px" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    p: "18px 24px",
                  }}
                >
                  <Typography
                    component={"h4"}
                    variant={"h4"}
                    sx={{
                      cursor: "pointer",
                    }}
                  >
                    {tutorials[keyTutorial].title.slice(0, 20)}
                    {tutorials[keyTutorial].title.length > 20 && "..."}
                  </Typography>
                  <ArrowForwardIosSharpIcon
                    fontSize="small"
                    sx={{
                      transform: `rotate(${expanded === `Option${tutorialIdx + 1}` ? "-90deg" : "90deg"})`,
                      transition: "transform 100ms linear",
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: "0px" }}>
                <Stack component={"ul"} m={0} p={"0px"} sx={{ listStyle: "none" }}>
                  {tutorials[keyTutorial].steps.map((cur, idx) => (
                    <Stack
                      key={`${cur.title}-${idx}`}
                      component={"li"}
                      direction={"row"}
                      alignItems="center"
                      justifyContent={"space-between"}
                      spacing={"8px"}
                      sx={{ p: "12px 24px" }}
                    >
                      <Stack key={cur.title} component={"li"} direction={"row"} alignItems="center" spacing={"8px"}>
                        {userTutorialState[keyTutorial].currentStep >= idx + 1 && (
                          <CheckCircleIcon fontSize="small" color={"success"} />
                        )}

                        <Typography
                          sx={{
                            display: "inline-block",
                            color: theme => (theme.palette.mode === "light" ? "#1d2229" : "#EAECF0"),
                            opacity: "0.5",
                            ml: userTutorialState[keyTutorial].currentStep > idx + 1 ? "0px" : "28px",
                          }}
                          fontSize={"16px"}
                        >
                          {cur.title}
                        </Typography>
                      </Stack>

                      <IconButton
                        onClick={e => {
                          e.stopPropagation();
                          onStartTutorial(keyTutorial, tutorialIdx);
                        }}
                        size={"small"}
                        sx={{ p: "0px" }}
                      >
                        <PlayCircleIcon />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
      </Box>
    </Box>
  );
};

export const MemoizedTutorialTableOfContent = React.memo(TutorialTableOfContent);
