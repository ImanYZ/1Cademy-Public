import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import DoneIcon from "@mui/icons-material/Done";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { Button, ClickAwayListener, Divider, IconButton, ListItem, Skeleton, Tooltip, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { SimpleQuestionNode } from "../../instructorsTypes";
import { Post } from "../../lib/mapApi";
import { DESIGN_SYSTEM_COLORS } from "../../lib/theme/colors";
import shortenNumber from "../../lib/utils/shortenNumber";
import { OpenRightSidebar } from "../../pages/notebook";
import { doNeedToDeleteNode } from "../../utils/helpers";
import { CustomCircularProgress } from "../CustomCircularProgress";
import { CustomWrapperButton } from "../map/Buttons/Buttons";
import { PracticeInfo } from "./PracticeTool";

type NodeQuestionProps = {
  node: SimpleQuestionNode;
  selectedAnswers: boolean[];
  setSelectedIdxAnswer: (newValue: number) => void;
  submitAnswer: boolean;
  narratedAnswerIdx: number;
};

const NodeQuestion = ({
  node,
  selectedAnswers,
  setSelectedIdxAnswer,
  submitAnswer,
  narratedAnswerIdx,
}: NodeQuestionProps) => {
  const [displayTags, setDisplayTags] = useState(false);
  const [nodeCopy, setNodeCopy] = useState<SimpleQuestionNode>(node);

  useEffect(() => {
    setNodeCopy(node);
  }, [node]);

  const otherTags = useMemo(() => {
    return nodeCopy.tags.splice(0, nodeCopy.tags.length - 2);
  }, [nodeCopy.tags]);

  const onSelectAnswer = (idx: number) => {
    if (submitAnswer) return;
    setSelectedIdxAnswer(idx);
  };

  const onCorrectNode = async (nodeId: string) => {
    setNodeCopy(prev => {
      const correct = prev.correct;
      const wrong = prev.wrong;

      const correctChange = correct ? -1 : 1;
      const wrongChange = !correct && wrong ? -1 : 0;
      const corrects = prev.corrects + correctChange;
      const wrongs = prev.wrongs + wrongChange;
      return { ...prev, correct: !correct, wrong: false, corrects, wrongs, disableVotes: true };
    });
    await Post(`/correctNode/${nodeId}`);
    setNodeCopy(prev => ({ ...prev, disableVotes: false }));
  };

  const onWrongNode = async (thisNode: SimpleQuestionNode) => {
    if (thisNode?.locked) return;
    const correctChange = !thisNode.wrong && thisNode.correct ? -1 : 0;
    const wrongChange = thisNode.wrong ? -1 : 1;
    const _corrects = thisNode.corrects + correctChange;
    const _wrongs = thisNode.wrongs + wrongChange;
    const willRemoveNode = doNeedToDeleteNode(_corrects, _wrongs, thisNode.locked);
    let deleteOK = willRemoveNode ? false : true;
    // INFO: is not required to validate children, because a question shoould not have childs
    if (willRemoveNode) {
      deleteOK = window.confirm("You are going to permanently delete this node by downvoting it. Are you sure?");
    }

    if (!deleteOK) return;
    setNodeCopy(prev => {
      return {
        ...prev,
        wrong: !thisNode.wrong,
        correct: false,
        wrongs: _wrongs,
        corrects: _corrects,
        disableVotes: true,
      };
    });
    await Post(`/wrongNode/${thisNode.id}`);
    setNodeCopy(prev => ({ ...prev, disableVotes: false }));
  };

  return (
    <Box
      sx={{
        p: "32px",
        border: "2px solid #FD7373",
        borderRadius: "8px",
        background: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray100,
      }}
    >
      <Typography
        id={"question-title"}
        component={"h1"}
        sx={{
          fontSize: "30px",
          borderRadius: "8px",
          ...(narratedAnswerIdx === -10 && {
            backgroundColor: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookO900 : DESIGN_SYSTEM_COLORS.primary50,
          }),
        }}
      >
        {nodeCopy.title}
      </Typography>
      <Stack component={"ul"} spacing="16px" sx={{ p: "0px" }}>
        {nodeCopy.choices.map((cur, idx) => (
          <Box key={idx}>
            <ListItem
              id={`question-choice-${idx}`}
              onClick={() => onSelectAnswer(idx)}
              sx={{
                p: "18px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "18px",
                background: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray50,
                borderRadius: "8px",
                border: theme =>
                  `solid 1px ${
                    theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray50
                  }`,
                boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)",
                ":hover": {
                  ...(!submitAnswer && {
                    cursor: "pointer",
                    background: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.notebookG500 : theme.palette.common.gray200,
                    border: theme =>
                      `solid 1px ${
                        theme.palette.mode === "dark" ? theme.palette.common.notebookG300 : theme.palette.common.gray300
                      }`,
                    "& .check-box": {
                      backgroundColor: theme =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.notebookG600
                          : theme.palette.common.gray100,
                      border: theme =>
                        `solid 1px ${
                          theme.palette.mode === "dark"
                            ? theme.palette.common.notebookG400
                            : theme.palette.common.gray300
                        }`,
                    },
                  }),
                },
                ...(narratedAnswerIdx === idx && {
                  cursor: "pointer",
                  background: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.notebookG500 : theme.palette.common.gray200,
                  border: theme =>
                    `solid 1px ${
                      theme.palette.mode === "dark" ? theme.palette.common.notebookG300 : theme.palette.common.gray300
                    }`,
                  "& .check-box": {
                    backgroundColor: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray100,
                    border: theme =>
                      `solid 1px ${
                        theme.palette.mode === "dark" ? theme.palette.common.notebookG400 : theme.palette.common.gray300
                      }`,
                  },
                }),
                ...(selectedAnswers[idx] && {
                  background: theme =>
                    submitAnswer
                      ? theme.palette.mode === "dark"
                        ? cur.correct
                          ? theme.palette.common.success1000
                          : theme.palette.common.notebookRed3
                        : cur.correct
                        ? theme.palette.common.success50
                        : "#FCEDEC"
                      : theme.palette.mode === "dark"
                      ? DESIGN_SYSTEM_COLORS.notebookO900
                      : DESIGN_SYSTEM_COLORS.primary50,
                  border: theme =>
                    `solid 1px ${
                      submitAnswer
                        ? theme.palette.mode === "dark"
                          ? cur.correct
                            ? theme.palette.common.teal700
                            : theme.palette.common.notebookRed2
                          : cur.correct
                          ? theme.palette.common.teal700
                          : theme.palette.common.notebookRed2
                        : theme.palette.mode === "dark"
                        ? DESIGN_SYSTEM_COLORS.primary800
                        : DESIGN_SYSTEM_COLORS.primary600
                    }`,

                  ":hover": {
                    background: theme =>
                      submitAnswer
                        ? theme.palette.mode === "dark"
                          ? cur.correct
                            ? theme.palette.common.success1000
                            : theme.palette.common.notebookRed3
                          : cur.correct
                          ? theme.palette.common.success50
                          : "#FCEDEC"
                        : theme.palette.mode === "dark"
                        ? DESIGN_SYSTEM_COLORS.notebookO900
                        : DESIGN_SYSTEM_COLORS.primary50,
                    border: theme =>
                      `solid 1px ${
                        submitAnswer
                          ? theme.palette.mode === "dark"
                            ? cur.correct
                              ? theme.palette.common.teal700
                              : theme.palette.common.notebookRed2
                            : cur.correct
                            ? theme.palette.common.teal700
                            : theme.palette.common.notebookRed2
                          : theme.palette.mode === "dark"
                          ? DESIGN_SYSTEM_COLORS.primary800
                          : DESIGN_SYSTEM_COLORS.primary600
                      }`,
                  },
                }),
              }}
            >
              {cur.choice}
              <Box
                className="check-box"
                sx={{
                  minWidth: "24px",
                  minHeight: "24px",
                  width: "24px",
                  height: "24px",
                  borderRadius: "8px",
                  display: "grid",
                  placeItems: "center",
                  color: DESIGN_SYSTEM_COLORS.baseWhite,
                  backgroundColor: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.notebookG700 : theme.palette.common.gray100,
                  border: theme =>
                    `solid 1px ${
                      theme.palette.mode === "dark" ? theme.palette.common.notebookG500 : theme.palette.common.gray300
                    }`,
                  ...(selectedAnswers[idx] && {
                    backgroundColor: theme =>
                      submitAnswer
                        ? cur.correct
                          ? theme.palette.common.teal700
                          : theme.palette.common.notebookRed2
                        : theme.palette.mode === "dark"
                        ? DESIGN_SYSTEM_COLORS.primary800
                        : DESIGN_SYSTEM_COLORS.primary600,
                    border: theme =>
                      `solid 1px ${
                        submitAnswer
                          ? cur.correct
                            ? theme.palette.common.teal700
                            : theme.palette.common.notebookRed2
                          : undefined
                      }`,
                  }),
                }}
              >
                {submitAnswer && selectedAnswers[idx] && cur.correct && <CheckIcon sx={{ fontSize: "12px" }} />}
                {submitAnswer && selectedAnswers[idx] && !cur.correct && <CloseIcon sx={{ fontSize: "12px" }} />}
                {!submitAnswer && selectedAnswers[idx] && <CheckIcon sx={{ fontSize: "12px" }} />}
              </Box>
            </ListItem>
            {submitAnswer && <Typography sx={{ mt: "8px" }}>{cur.feedback}</Typography>}
          </Box>
        ))}
      </Stack>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction={"row"} alignItems="center" spacing={"10px"} sx={{ position: "relative" }}>
          <LocalOfferIcon sx={{ mr: "10px", color: theme => theme.palette.common.notebookO100 }} />
          <Typography>{nodeCopy.tags[nodeCopy.tags.length - 1] ?? ""} </Typography>
          {otherTags.length > 0 && (
            <Typography
              onClick={() => setDisplayTags(true)}
              sx={{ ml: "8px", color: theme => theme.palette.common.primary800, cursor: "pointer" }}
            >
              + {otherTags.length} more tags
            </Typography>
          )}
          {displayTags && (
            <ClickAwayListener onClickAway={() => setDisplayTags(false)}>
              <Box
                sx={{
                  position: "absolute",
                  bottom: "35px",
                  borderRadius: "8px",
                  background: theme =>
                    theme.palette.mode === "dark"
                      ? theme.palette.common.notebookMainBlack
                      : theme.palette.common.gray50,
                  boxShadow: " 0px 4px 4px rgba(0, 0, 0, 0.25), 0px 8px 8px -4px rgba(0, 0, 0, 0.03)",
                }}
              >
                <Typography sx={{ p: "12px 16px 6px 16px" }}>+ {otherTags.length} more tags</Typography>
                <Box className="scroll-styled" sx={{ maxHeight: "250px", width: "242px", overflowY: "auto" }}>
                  {otherTags.map((cur, idx) => (
                    <Box key={idx} sx={{ p: "8px 16px" }}>
                      <Box sx={{ p: "6px 8px", display: "flex" }}>
                        <LocalOfferIcon sx={{ mr: "10px", color: theme => theme.palette.common.notebookO100 }} />
                        <Typography>{cur}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </ClickAwayListener>
          )}
        </Stack>
        <CustomWrapperButton id={`${nodeCopy.id}-node-footer-votes`} disabled={nodeCopy?.disableVotes}>
          <Stack direction={"row"} alignItems={"center"}>
            <Tooltip title={"Vote to prevent further changes."} placement={"top"}>
              <Button
                onClick={() => onCorrectNode(nodeCopy.id)}
                disabled={nodeCopy?.disableVotes}
                sx={{
                  padding: "5px 5px 5px 10px",
                  color: "inherit",
                  minWidth: "0px",
                  borderRadius: "16px 0px 0px 16px",
                  ":hover": {
                    backgroundColor: ({ palette }) =>
                      palette.mode === "dark" ? palette.common.notebookG400 : palette.common.lightBackground2,
                  },
                }}
              >
                <Box sx={{ display: "flex", fontSize: "14px", alignItems: "center" }}>
                  <DoneIcon sx={{ fontSize: "18px", color: nodeCopy.correct ? "#00E676" : undefined }} />
                  <span style={{ marginLeft: "2px" }}>{shortenNumber(nodeCopy.corrects, 2, false)}</span>
                </Box>
              </Button>
            </Tooltip>
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{
                borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : DESIGN_SYSTEM_COLORS.gray300),
              }}
            />
            <Tooltip title={"Vote to delete node."} placement={"top"}>
              <Button
                onClick={() => onWrongNode(nodeCopy)}
                disabled={nodeCopy?.disableVotes}
                sx={{
                  padding: "5px 10px 5px 5px",
                  color: "inherit",
                  minWidth: "0px",
                  borderRadius: "0px 16px 16px 0px",
                  ":hover": {
                    backgroundColor: ({ palette }) =>
                      palette.mode === "dark" ? palette.common.notebookG400 : palette.common.lightBackground2,
                  },
                }}
              >
                <Box sx={{ display: "flex", fontSize: "14px", alignItems: "center" }}>
                  <CloseIcon sx={{ fontSize: "18px", color: nodeCopy.wrong ? "red" : undefined }} />
                  <span style={{ marginLeft: "2px" }}>{shortenNumber(nodeCopy.wrongs, 2, false)}</span>
                </Box>
              </Button>
            </Tooltip>
          </Stack>
        </CustomWrapperButton>
      </Box>
    </Box>
  );
};

type PracticeQuestionProps = {
  question: SimpleQuestionNode | null;
  practiceIsCompleted: boolean;
  onClose: () => void;
  onViewNodeOnNodeBook: (nodeId: string) => void;
  onSaveAnswer: (answers: boolean[]) => Promise<void>;
  onGetNextQuestion: () => Promise<void>;
  practiceInfo: PracticeInfo;
  submitAnswer: boolean;
  setSubmitAnswer: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAnswers: boolean[];
  setSelectedAnswers: React.Dispatch<React.SetStateAction<boolean[]>>;
  enabledAssistant: boolean;
  onToggleAssistant: () => void;
  narratedAnswerIdx: number;
  setDisplayRightSidebar: (newValue: OpenRightSidebar) => void;
  loading: boolean;
  // setLoading: (newValue: boolean) => void;
};
export const PracticeQuestion = ({
  question,
  practiceIsCompleted,
  onClose,
  onViewNodeOnNodeBook,
  onSaveAnswer,
  onGetNextQuestion,
  practiceInfo,
  submitAnswer,
  setSubmitAnswer,
  selectedAnswers,
  setSelectedAnswers,
  enabledAssistant,
  onToggleAssistant,
  narratedAnswerIdx,
  setDisplayRightSidebar,
  loading,
}: // setLoading,
PracticeQuestionProps) => {
  console.log("------>", { loading });
  const onSubmitAnswer = useCallback(() => {
    onSaveAnswer(selectedAnswers);
  }, [onSaveAnswer, selectedAnswers]);

  const onNextQuestion = useCallback(async () => {
    setSubmitAnswer(false);
    await onGetNextQuestion();
  }, [onGetNextQuestion, setSubmitAnswer]);

  const onSelectAnswer = (answerIdx: number) => {
    setSelectedAnswers(prev => prev.map((c, i) => (answerIdx === i ? !c : c)));
  };

  useEffect(() => {
    if (!question) return;
    setSelectedAnswers(new Array(question.choices.length).fill(false));
  }, [question, setSelectedAnswers]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr minmax(0px,820px) 1fr",
      }}
    >
      {/* left options */}
      <Box>
        <IconButton
          onClick={onClose}
          sx={{ color: theme => theme.palette.common.primary800, position: "sticky", top: "50px", left: "63px" }}
        >
          <CloseFullscreenIcon sx={{ fontSize: "32px" }} />
        </IconButton>
      </Box>

      {/* question node */}
      <Box sx={{ py: "45px" }}>
        {practiceIsCompleted && (
          <Box sx={{ mt: "50px" }}>
            <QuestionMessage
              messages={[
                `Daily practice has been completed.`,
                `You have completed ${practiceInfo.completedDays} days out of ${practiceInfo.totalDays} days of your review practice.`,
                `${practiceInfo.remainingDays} days are remaining to the end of the semester.`,
              ]}
              totalQuestions={practiceInfo.totalQuestions}
              questionsCompleted={practiceInfo.totalQuestions - practiceInfo.questionsLeft}
            />
          </Box>
        )}
        {loading && (
          <Box sx={{ width: "100%" }}>
            <Skeleton variant="rectangular" height={112} sx={{ mb: "12px" }} />

            <Box
              sx={{
                p: "32px",
                border: "2px solid #FD7373",
                borderRadius: "8px",
                background: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray100,
              }}
            >
              <Skeleton variant="rectangular" height={50} width={350} sx={{ mb: "20px" }} />
              <Skeleton variant="rectangular" height={80} sx={{ mb: "10px" }} />
              <Skeleton variant="rectangular" height={80} sx={{ mb: "10px" }} />
              <Skeleton variant="rectangular" height={80} sx={{ mb: "10px" }} />
              <Skeleton variant="rectangular" height={80} />
            </Box>
          </Box>
        )}

        {!loading && question && !practiceIsCompleted && (
          <Box sx={{ maxWidth: "820px", m: "auto" }}>
            <QuestionMessage
              messages={[
                practiceInfo.questionsLeft > 0
                  ? `${practiceInfo.questionsLeft}
                  question${practiceInfo.questionsLeft > 1 ? "s" : ""} left to get today’s point.`
                  : "You've got today's practice point!",
                `You have completed ${practiceInfo.completedDays} day${
                  practiceInfo.completedDays > 1 ? "s" : ""
                } out of ${practiceInfo.totalDays} day${
                  practiceInfo.totalDays > 1 ? "s" : ""
                } of your review practice.`,
                `${practiceInfo.remainingDays} day${
                  practiceInfo.remainingDays > 1 ? "s" : ""
                } are remaining to the end of the semester.`,
              ]}
              totalQuestions={practiceInfo.totalQuestions}
              questionsCompleted={practiceInfo.totalQuestions - practiceInfo.questionsLeft}
            />
            <NodeQuestion
              node={question}
              selectedAnswers={selectedAnswers}
              setSelectedIdxAnswer={onSelectAnswer}
              submitAnswer={submitAnswer}
              narratedAnswerIdx={narratedAnswerIdx}
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: "32px" }}>
              <Button
                variant="contained"
                onClick={() => onViewNodeOnNodeBook(question.id)}
                sx={{
                  borderRadius: "26px",
                  minWidth: "180px",
                  fontSize: "16px",
                  backgroundColor: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.baseWhite : theme.palette.common.baseWhite,
                  color: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.gray700 : theme.palette.common.gray700,
                  ":hover": {
                    backgroundColor: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.baseWhite : theme.palette.common.baseWhite,
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.gray700 : theme.palette.common.gray700,
                  },
                }}
              >
                Open this in Notebook
              </Button>
              {!submitAnswer && (
                <Button
                  variant="contained"
                  onClick={onSubmitAnswer}
                  disabled={!selectedAnswers.some(c => c)}
                  sx={{ borderRadius: "26px", minWidth: "180px", fontSize: "16px" }}
                >
                  Submit
                </Button>
              )}
              {submitAnswer && (
                <Button
                  variant="contained"
                  onClick={onNextQuestion}
                  disabled={!selectedAnswers.length}
                  sx={{ borderRadius: "26px", minWidth: "180px", fontSize: "16px" }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* right options */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "end" }}>
        {question && !practiceIsCompleted && (
          <>
            {/* options */}
            <IconButton
              onClick={() => setDisplayRightSidebar("USER_STATUS")}
              sx={{
                width: "56px",
                height: "56px",
                position: "sticky",
                right: "12px",
                top: "8px",
                fill: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray500,
                borderRadius: "8px",
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
              }}
            >
              <svg width="29" height="23" viewBox="0 0 29 23" fill="inherit" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.5001 23H4.61759L0 9.27492L8.24261 12.5906L14.5001 0L20.7576 12.5906L29 9.27492L24.3826 23H14.5001Z" />
              </svg>
            </IconButton>

            <IconButton
              onClick={() => setDisplayRightSidebar("LEADERBOARD")}
              sx={{
                width: "56px",
                height: "56px",
                position: "sticky",
                right: "12px",
                top: "72px",
                color: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray500,
                borderRadius: "8px",
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
              }}
            >
              <LeaderboardIcon />
            </IconButton>

            <Tooltip title="Voice-based practice" placement="left">
              <IconButton
                onClick={onToggleAssistant}
                sx={{
                  width: "56px",
                  height: "56px",
                  position: "sticky",
                  right: "12px",
                  top: "136px",
                  color: theme =>
                    enabledAssistant
                      ? DESIGN_SYSTEM_COLORS.primary600
                      : theme.palette.mode === "dark"
                      ? DESIGN_SYSTEM_COLORS.notebookG200
                      : DESIGN_SYSTEM_COLORS.gray500,
                  borderRadius: "8px",
                  backgroundColor: theme =>
                    theme.palette.mode === "dark"
                      ? DESIGN_SYSTEM_COLORS.notebookMainBlack
                      : DESIGN_SYSTEM_COLORS.gray50,
                }}
              >
                <VolumeUpIcon sx={{ fontSize: "28px" }} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
  );
};

type CustomTextProps = { children: ReactNode };

const CustomText = ({ children }: CustomTextProps) => (
  <Typography
    sx={{
      color: theme =>
        theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.yellow100 : DESIGN_SYSTEM_COLORS.notebookO900,
      fontWeight: 400,
    }}
  >
    {children}
  </Typography>
);

type QuestionMessageProps = {
  messages: string[];
  totalQuestions: number;
  questionsCompleted: number;
};
const QuestionMessage = ({ messages, questionsCompleted, totalQuestions }: QuestionMessageProps) => {
  return (
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      sx={{
        p: "20px 24px",
        mb: "12px",
        border: "26px",
        backgroundColor: theme => (theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.yellow1000 : "#FFF3E5"),
        borderRadius: "12px",
      }}
    >
      <Box>
        {messages.map((c, i) => (
          <CustomText key={i}>{c}</CustomText>
        ))}
      </Box>
      <CustomCircularProgress
        variant="determinate"
        value={(100 * (questionsCompleted > totalQuestions ? totalQuestions : questionsCompleted)) / totalQuestions}
        realValue={questionsCompleted}
      />
    </Stack>
  );
};
