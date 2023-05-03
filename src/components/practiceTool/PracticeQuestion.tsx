import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import DoneIcon from "@mui/icons-material/Done";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Button, ClickAwayListener, Divider, IconButton, ListItem, Skeleton, Tooltip, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { SimpleQuestionNode } from "../../instructorsTypes";
import { Post } from "../../lib/mapApi";
import { DESIGN_SYSTEM_COLORS } from "../../lib/theme/colors";
import shortenNumber from "../../lib/utils/shortenNumber";
import { doNeedToDeleteNode } from "../../utils/helpers";
import { CustomWrapperButton } from "../map/Buttons/Buttons";
import { PracticeInfo } from "./PracticeTool";

type NodeQuestionProps = {
  node: SimpleQuestionNode;
  selectedAnswers: boolean[];
  setSelectedIdxAnswer: (newValue: number) => void;
  submitAnswer: boolean;
};

const NodeQuestion = ({ node, selectedAnswers, setSelectedIdxAnswer, submitAnswer }: NodeQuestionProps) => {
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
      <Typography component={"h1"} sx={{ fontSize: "30px" }}>
        {nodeCopy.title}
      </Typography>
      <Stack component={"ul"} spacing="16px" sx={{ p: "0px" }}>
        {nodeCopy.choices.map((cur, idx) => (
          <Box key={idx}>
            <ListItem
              onClick={() => onSelectAnswer(idx)}
              sx={{
                p: "24px 16px",
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
                  padding: "3px 2px 3px 8px",
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
                borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit"),
                mx: "0px",
              }}
            />
            <Tooltip title={"Vote to delete node."} placement={"top"}>
              <Button
                onClick={() => onWrongNode(nodeCopy)}
                disabled={nodeCopy?.disableVotes}
                sx={{
                  padding: "3px 8px 3px 2px",
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
  leaderboard: ReactNode;
  userStatus: ReactNode;
  onViewNodeOnNodeBook: (nodeId: string) => void;
  onSaveAnswer: (answers: boolean[]) => Promise<void>;
  onGetNextQuestion: () => Promise<void>;
  practiceInfo: PracticeInfo;
};
export const PracticeQuestion = ({
  question,
  practiceIsCompleted,
  onClose,
  leaderboard,
  userStatus,
  onViewNodeOnNodeBook,
  onSaveAnswer,
  onGetNextQuestion,
  practiceInfo,
}: PracticeQuestionProps) => {
  const [selectedAnswers, setSelectedAnswers] = useState<boolean[]>([]);
  const [displaySidebar, setDisplaySidebar] = useState<"LEADERBOARD" | "USER_STATUS" | null>(null);
  const [submitAnswer, setSubmitAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  const onSubmitAnswer = useCallback(() => {
    setSubmitAnswer(true);
    onSaveAnswer(selectedAnswers);
  }, [onSaveAnswer, selectedAnswers]);

  const onNextQuestion = useCallback(async () => {
    setLoading(true);
    setSubmitAnswer(false);
    await onGetNextQuestion();
    setLoading(false);
  }, [onGetNextQuestion]);

  const onSelectAnswer = (answerIdx: number) => {
    setSelectedAnswers(prev => prev.map((c, i) => (answerIdx === i ? !c : c)));
  };

  useEffect(() => {
    if (!question) return;
    setSelectedAnswers(new Array(question.choices.length).fill(false));
    setLoading(false);
  }, [question]);

  return (
    <Box
      sx={{
        p: "45px 64px",
        width: "100%",
        minHeight: "100%",
        position: "relative",
      }}
    >
      <IconButton onClick={onClose} sx={{ color: theme => theme.palette.common.primary800, position: "absolute" }}>
        <CloseFullscreenIcon />
      </IconButton>

      {practiceIsCompleted && (
        <Box sx={{ mt: "50px" }}>
          <QuestionMessage
            messages={[
              `Daily practice has been completed.`,
              `You have completed ${practiceInfo.completedDays} days out of ${practiceInfo.totalDays} days of your review practice.`,
              `${practiceInfo.remainingDays} days are remaining to the end of the semester.`,
            ]}
          />
        </Box>
      )}

      {/* {!question && !practiceIsCompleted && <Typography>Can't get question</Typography>} */}

      {question && !practiceIsCompleted && (
        <>
          {/* options */}
          <Stack spacing={"8px"} sx={{ position: "absolute", right: "12px", top: "8px" }}>
            <IconButton
              onClick={() => setDisplaySidebar("USER_STATUS")}
              sx={{
                width: "56px",
                height: "56px",
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
              onClick={() => setDisplaySidebar("LEADERBOARD")}
              sx={{
                width: "56px",
                height: "56px",
                color: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray500,
                borderRadius: "8px",
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
              }}
            >
              <LeaderboardIcon />
            </IconButton>
          </Stack>

          {/* node question */}
          <Box sx={{ maxWidth: "820px", m: "auto" }}>
            <QuestionMessage
              messages={[
                practiceInfo.questionsLeft > 0
                  ? `${practiceInfo.questionsLeft} questions left to get today’s point.`
                  : "You've got today's practice point!",
                `You have completed ${practiceInfo.completedDays} days out of ${practiceInfo.totalDays} days of your review practice.`,
                `${practiceInfo.remainingDays} days are remaining to the end of the semester.`,
              ]}
            />
            {loading && (
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
            )}
            {!loading && (
              <NodeQuestion
                node={question}
                selectedAnswers={selectedAnswers}
                setSelectedIdxAnswer={onSelectAnswer}
                submitAnswer={submitAnswer}
              />
            )}

            {!loading && (
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
                  View Node Tree
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
            )}
          </Box>

          {/* leaderBoard */}
          <Box
            sx={{
              position: "absolute",
              width: "350px",
              top: "0px",
              bottom: "0px",
              right: displaySidebar === "LEADERBOARD" ? "0px" : "-350px",
              backgroundColor: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
              transition: "right 0.4s",
            }}
          >
            <IconButton
              sx={{ position: "absolute", top: "17px", right: "17px", p: "4px" }}
              onClick={() => setDisplaySidebar(null)}
            >
              <CloseIcon />
            </IconButton>
            {leaderboard}
          </Box>

          {/* userStatus */}
          <Box
            sx={{
              position: "absolute",
              width: "350px",
              top: "0px",
              bottom: "0px",
              right: displaySidebar === "USER_STATUS" ? "0px" : "-350px",
              backgroundColor: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
              transition: "right 0.4s",
            }}
          >
            <IconButton
              sx={{ position: "absolute", top: "17px", right: "17px", p: "4px" }}
              onClick={() => setDisplaySidebar(null)}
            >
              <CloseIcon />
            </IconButton>
            {userStatus}
          </Box>
        </>
      )}
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
};
const QuestionMessage = ({ messages }: QuestionMessageProps) => {
  return (
    <Box
      sx={{
        p: "20px 24px",
        mb: "12px",
        border: "26px",
        backgroundColor: theme => (theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.yellow1000 : "#FFF3E5"),
      }}
    >
      {messages.map((c, i) => (
        <CustomText key={i}>{c}</CustomText>
      ))}
    </Box>
  );
};
