import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { Accordion, AccordionDetails, AccordionSummary, IconButton, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import React, { useState } from "react";

import { GroupTutorial } from "./TutorialTableOfContent";

type CustomAcordionProps = { tutorials: GroupTutorial[]; level?: number };

const CustomAcordion = ({ tutorials, level = 0 }: CustomAcordionProps) => {
  const [expanded, setExpanded] = useState<string>("");

  // const onExpandTutorial = (option: string,  newExpanded: boolean) => {
  //   setExpanded(newExpanded ? option : false);
  // };

  // const handleChange =
  //   (option: string, stage: keyof GroupTutorials) => (event: React.SyntheticEvent, newExpanded: boolean) => {
  //     onExpandTutorial(option, stage, newExpanded);
  //   };

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
            expanded={expanded === currentTutorial.title}
            onChange={(e, newExpand) => {
              setExpanded(newExpand ? currentTutorial.title : "");
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
                  pl: `${24 + level * 12}px`,
                  // borderBottom: "solid 1px #707070",
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
                    {/* {tutorials[keyTutorial].title.slice(0, 20)}
                {tutorials[keyTutorial].title.length > 20 && "..."} */}
                    {currentTutorial.title}
                  </Typography>
                  <ArrowForwardIosSharpIcon
                    fontSize="small"
                    sx={{
                      transform: `rotate(${expanded === `Option${tutorialIdx + 1}` ? "-90deg" : "90deg"})`,
                      transition: "transform 100ms linear",
                    }}
                  />
                </Box>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ p: "0px" }}>
              {currentTutorial.tutorialSteps &&
                currentTutorial.tutorialSteps.steps.map((curStep, idx) => (
                  <Stack
                    key={`${curStep.title}-${idx}`}
                    component={"li"}
                    direction={"row"}
                    alignItems="center"
                    spacing={"8px"}
                    sx={{ p: "12px 24px", border: "solid 1px pink" }}
                  >
                    {userTutorialState[currentTutorial.tutorialSteps.tutorialKey].currentStep >= idx + 1 && (
                      <CheckCircleIcon fontSize="small" color={"success"} />
                    )}
                    <Typography
                      sx={{
                        display: "inline-block",
                        color: theme => (theme.palette.mode === "light" ? "#1d2229" : "#EAECF0"),
                        opacity: "0.5",
                        //  ml: userTutorialState[currentTutorial.tutorialKey].currentStep > idx + 1 ? "0px" : "28px",
                      }}
                      fontSize={"16px"}
                    >
                      {curStep.title}
                    </Typography>
                  </Stack>
                ))}
              {<CustomAcordion tutorials={currentTutorial.tutorials} level={level + 1} />}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </>
  );
};

export default CustomAcordion;
