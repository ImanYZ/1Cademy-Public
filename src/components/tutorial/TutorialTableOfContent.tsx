import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import React, { Dispatch, SetStateAction, useState } from "react";

import { TutorialStep, TutorialTypeKeys, UserTutorials } from "../../nodeBookTypes";
import { TutorialType } from "../../pages/notebook";
// type TutorialStage = {
//   title: string;
//   completed: boolean;
// };
// type TutorialProgess = {
//   [key: string]: TutorialStage[];
// };

// const stages: TutorialProgess = {
//   "Node tutorial": [
//     {
//       title: "step 1a",
//       completed: true,
//     },
//     {
//       title: "step 2a",
//       completed: true,
//     },
//     {
//       title: "step 3a",
//       completed: false,
//     },
//   ],
//   "Sidebar tutorial": [
//     {
//       title: "step 1",
//       completed: false,
//     },
//     {
//       title: "step 2",
//       completed: false,
//     },
//     {
//       title: "step 3",
//       completed: false,
//     },
//   ],
// };

type Tutorials = { [key in TutorialTypeKeys]: TutorialStep[] };

type TutorialTableOfContentProps = {
  open: boolean;
  handleCloseProgressBar: () => void;
  tutorials: Tutorials;
  userTutorialState: UserTutorials;
  setCurrentTutorial: (newTutorial: TutorialType) => void;
  setUserTutorialState: Dispatch<SetStateAction<UserTutorials>>;
};

const TutorialTableOfContent = ({
  open,
  handleCloseProgressBar,
  tutorials,
  userTutorialState,
  setCurrentTutorial,
  setUserTutorialState,
}: TutorialTableOfContentProps) => {
  // const { height } = useWindowSize();
  const [expanded, setExpanded] = useState<string | false>("Option1");
  const [, /* selectedTutorial */ setSelectedTutorial] = useState<TutorialTypeKeys>(
    Object.keys(tutorials)[0] as TutorialTypeKeys
  );

  const handleChange =
    (option: string, stage: keyof Tutorials) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? option : false);
      setSelectedTutorial(stage);
    };

  return (
    <Box
      id="progress-bar"
      sx={{
        position: "fixed",
        top: "0px",
        backgroundColor: theme => (theme.palette.mode === "dark" ? "rgb(31,31,31)" : "rgb(240,240,240)"),
        width: "300px",
        bottom: "0px",
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
        <Typography fontSize={"16px"}>Notebook tutorial</Typography>
        <IconButton onClick={handleCloseProgressBar}>
          <CloseIcon fontSize="medium" />
        </IconButton>
      </Box>
      <Box>
        {(Object.keys(tutorials) as Array<TutorialTypeKeys>).map((keyTutorial, idx) => (
          <Accordion
            key={keyTutorial}
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
            onChange={handleChange(`Option${idx + 1}`, keyTutorial)}
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
                  {keyTutorial}
                </Typography>
                <IconButton
                  onClick={e => {
                    e.stopPropagation();
                    console.log("force tutorial", keyTutorial);
                    setUserTutorialState(pre => {
                      const tt = (Object.keys(pre) as Array<TutorialTypeKeys>).reduce((acu, cur) => {
                        return { ...acu, [cur]: { ...pre[cur], forceTutorial: cur === keyTutorial ? true : false } };
                      }, {}) as UserTutorials;

                      return tt;
                    });
                    setCurrentTutorial(null);
                  }}
                >
                  <PlayArrowIcon />
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack component={"ul"} spacing="19px" m={0} p={"0 0 0 28px"} sx={{ listStyle: "none" }}>
                {tutorials[keyTutorial].map((cur, idx) => (
                  <Stack
                    key={cur.title}
                    component={"li"}
                    direction={"row"}
                    alignItems="center"
                    spacing={"8px"}
                    // onClick={() => {
                    //   set
                    // }}
                  >
                    {userTutorialState[keyTutorial].currentStep > idx + 1 && <DoneIcon fontSize="small" />}
                    <Typography
                      sx={{
                        display: "inline-block",
                        color: theme => (theme.palette.mode === "light" ? "#475467" : "#EAECF0"),
                        opacity: "0.5",
                        ml: userTutorialState[keyTutorial].currentStep > idx + 1 ? "0px" : "28px",
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

export const MemoizedTutorialTableOfContent = React.memo(TutorialTableOfContent);
