import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import React, { useState } from "react";

import { useWindowSize } from "@/hooks/useWindowSize";
type TutorialStage = {
  title: string;
  completed: boolean;
};
type TutorialProgess = {
  [key: string]: TutorialStage[];
};

const stages: TutorialProgess = {
  "Node tutorial": [
    {
      title: "step 1a",
      completed: true,
    },
    {
      title: "step 2a",
      completed: true,
    },
    {
      title: "step 3a",
      completed: false,
    },
  ],
  "Sidebar tutorial": [
    {
      title: "step 1",
      completed: false,
    },
    {
      title: "step 2",
      completed: false,
    },
    {
      title: "step 3",
      completed: false,
    },
  ],
};

type ProgressBarTutorial = {
  open: boolean;
  handleCloseProgressBar: any;
};

const ProgressBar = ({ open, handleCloseProgressBar }: ProgressBarTutorial) => {
  const { height } = useWindowSize();
  const [expanded, setExpanded] = useState<string | false>("Option1");
  const [selectedState, setSelectedStage] = useState<keyof TutorialProgess>(Object.keys(stages)[0]);

  const handleChange =
    (option: string, stage: keyof TutorialProgess) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? option : false);
      setSelectedStage(stage);
    };
  return (
    <Box
      id="progress-bar"
      sx={{
        position: "fixed",
        top: 0,
        backgroundColor: theme => (theme.palette.mode === "dark" ? "rgb(31,31,31)" : "rgb(240,240,240)"),
        width: "300px",
        height,
        maxHeight: `${height}px`,
        right: `${open ? "0px" : "-400px"}`,
        transition: "right 300ms ease-out",
        zIndex: 99999,
      }}
    >
      <Box
        sx={{
          backgroundColor: theme => (theme.palette.mode === "dark" ? "#3F3E3E" : "rgb(212, 212, 212)"),
          p: "10px",
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography fontSize={"16px"}>Welcome to {selectedState}!</Typography>
        <IconButton onClick={handleCloseProgressBar}>
          <CloseIcon fontSize="medium" />
        </IconButton>
      </Box>
      <Box>
        {Object.keys(stages).map((stage, idx) => (
          <Accordion
            key={stage}
            disableGutters
            elevation={0}
            square
            sx={{
              border: "none",
              "&:before": {
                display: "none",
              },
            }}
            expanded={expanded === `Option${idx + 1}`}
            onChange={handleChange(`Option${idx + 1}`, stage)}
          >
            <AccordionSummary>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ArrowForwardIosSharpIcon
                  fontSize="small"
                  sx={{
                    transform: `rotate(${expanded === `Option${idx + 1}` ? "-90deg" : "90deg"})`,
                    transition: "transform 100ms linear",
                    mr: "8px",
                  }}
                />
                <Typography
                  component={"h4"}
                  variant={"h4"}
                  sx={{
                    cursor: "pointer",
                  }}
                >
                  {stage}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack component={"ul"} spacing="19px" m={0} p={"0 0 0 28px"} sx={{ listStyle: "none" }}>
                {stages[stage].map(cur => (
                  <Stack key={cur.title} component={"li"} direction={"row"} alignItems="center" spacing={"8px"}>
                    {cur.completed && <DoneIcon fontSize="small" />}
                    <Typography
                      sx={{
                        display: "inline-block",
                        color: theme => (theme.palette.mode === "light" ? "#475467" : "#EAECF0"),
                        opacity: "0.5",
                        ml: cur.completed ? "0" : "28px",
                      }}
                      fontSize={"16px"}
                    >
                      {cur.title}
                    </Typography>
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

export const MemoizedProgressBar = React.memo(ProgressBar);
