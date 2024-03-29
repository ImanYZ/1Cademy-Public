import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Stack } from "@mui/system";
import React, { useCallback, useState } from "react";

import { Z_INDEX } from "@/lib/utils/constants";
import { gray50, gray100, gray200, gray300, gray500, gray600, gray700 } from "@/pages/home";

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
  tutorialProgress: { tutorialsComplete: number; totalTutorials: number };
};

const TutorialTableOfContent = ({
  open,
  handleCloseProgressBar,
  groupTutorials,
  userTutorialState,
  onCancelTutorial,
  onForceTutorial,
  reloadPermanentGraph,
  tutorialProgress,
}: TutorialTableOfContentProps) => {
  const theme = useTheme();
  const onlySmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [expanded, setExpanded] = useState<string>("");

  const onStartTutorial = useCallback(
    (keyTutorial: TutorialTypeKeys) => {
      reloadPermanentGraph();
      onForceTutorial(keyTutorial);
      onCancelTutorial();
      if (onlySmallScreen) {
        handleCloseProgressBar();
      }
    },
    [handleCloseProgressBar, onCancelTutorial, onForceTutorial, onlySmallScreen, reloadPermanentGraph]
  );

  const onChangeExpanded = useCallback(
    (currentTutorialTitle: string) => (e: any, newExpand: boolean) => {
      setExpanded(newExpand ? currentTutorialTitle : "");
    },
    []
  );

  const tutorialsCompletePercentage = Math.round(
    (tutorialProgress.tutorialsComplete * 100) / tutorialProgress.totalTutorials
  );

  return (
    <Box
      id="progress-bar"
      sx={{
        position: "fixed",
        top: "75px",
        display: "grid",
        gridTemplateRows: "auto auto 1fr",
        background: theme => (theme.palette.mode === "dark" ? "#1B1A1A" : gray50),
        borderRadius: "8px",
        width: "350px",
        bottom: "7px",
        right: `${open ? "7px" : "-400px"}`,
        transition: "right 300ms ease-out",
        zIndex: Z_INDEX.tutorialTableOfContent,
      }}
    >
      <Box
        sx={{
          p: "32px 24px",
          backgroundColor: theme => (theme.palette.mode === "dark" ? "#1F1F1F" : gray100),
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: "18px",
          }}
        >
          <Stack direction="row" alignItems="center" spacing="6px">
            <Typography fontSize={"24px"} fontWeight="600">
              Notebook Tutorial
            </Typography>
          </Stack>
          <IconButton onClick={handleCloseProgressBar} size={"small"}>
            <CloseIcon fontSize="medium" />
          </IconButton>
        </Box>

        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={"space-between"}
            spacing="6px"
            sx={{ color: theme => (theme.palette.mode === "dark" ? gray300 : gray500) }}
          >
            <Typography>Tutorials</Typography>
            <Typography>
              {tutorialProgress.tutorialsComplete}/{tutorialProgress.totalTutorials}
            </Typography>
          </Stack>
          <Box
            sx={{
              height: "4px",
              width: "100%",
              borderRadius: "3px",
              backgroundColor: theme => (theme.palette.mode === "dark" ? "rgba(208, 213, 221, 0.3)" : "#6C74824D"),
            }}
          >
            <Box
              sx={{
                height: "4px",
                width: `${tutorialsCompletePercentage}%`,
                borderRadius: "3px",
                backgroundColor: theme => (theme.palette.mode === "dark" ? "#A4FD96" : "#52AE43"),
              }}
            ></Box>
          </Box>
        </Box>
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
                        fontWeight: "600",
                        fontSize: "18px",
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
                          <PlayCircleRoundedIcon
                            sx={{ color: theme => (theme.palette.mode === "dark" ? gray300 : gray600) }}
                          />
                        </IconButton>
                      )}
                      <Box
                        onClick={e => {
                          e.stopPropagation();
                          if (currentTutorial.tutorialSteps) {
                            onStartTutorial(currentTutorial.tutorialSteps.tutorialKey);
                          }
                        }}
                        sx={{ display: "flex", flexGrow: 1, alignItems: "center", justifyContent: "space-between" }}
                      >
                        <Typography
                          component={"h4"}
                          variant={"h4"}
                          sx={{
                            fontSize: "18px",
                            cursor: "pointer",
                            color: theme => (theme.palette.mode === "dark" ? gray200 : gray700),
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
