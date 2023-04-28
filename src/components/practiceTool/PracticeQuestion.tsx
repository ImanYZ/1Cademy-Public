import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import DoneIcon from "@mui/icons-material/Done";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Button, ClickAwayListener, Divider, IconButton, ListItem, Tooltip, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { getFirestore } from "firebase/firestore";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { getRootQuestionDescendants } from "../../client/services/nodes.sercice";
import { DESIGN_SYSTEM_COLORS } from "../../lib/theme/colors";
import shortenNumber from "../../lib/utils/shortenNumber";
import { Node } from "../../nodeBookTypes";
import { CustomWrapperButton } from "../map/Buttons/Buttons";
import Leaderboard from "./Leaderboard";
import { UserStatus } from "./UserStatus";

type NodeQuestionProps = {
  node: Node;
  selectedIdxAnswer: number;
  setSelectedIdxAnswer: (newValue: number) => void;
};

const NodeQuestion = ({ node, selectedIdxAnswer, setSelectedIdxAnswer }: NodeQuestionProps) => {
  const [displayTags, setDisplayTags] = useState(false);

  const otherTags = useMemo(() => {
    return node.tags.splice(0, node.tags.length - 2);
  }, [node.tags]);

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
        {node.title}
      </Typography>
      <Stack component={"ul"} spacing="16px" sx={{ p: "0px" }}>
        {node.choices.map((cur, idx) => (
          <Box key={idx}>
            <ListItem
              onClick={() => setSelectedIdxAnswer(idx)}
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
                cursor: "pointer",
                ":hover": {
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
                },
                ...(selectedIdxAnswer === idx && {
                  background: theme =>
                    theme.palette.mode === "dark"
                      ? cur.correct
                        ? theme.palette.common.success1000
                        : theme.palette.common.notebookRed3
                      : cur.correct
                      ? theme.palette.common.success50
                      : "#FCEDEC",
                  border: theme =>
                    `solid 1px ${
                      theme.palette.mode === "dark"
                        ? cur.correct
                          ? theme.palette.common.teal700
                          : theme.palette.common.teal600
                        : cur.correct
                        ? theme.palette.common.teal700
                        : theme.palette.common.notebookRed2
                    }`,

                  ":hover": {
                    background: theme =>
                      theme.palette.mode === "dark"
                        ? cur.correct
                          ? theme.palette.common.success1000
                          : theme.palette.common.notebookRed3
                        : cur.correct
                        ? theme.palette.common.success50
                        : "#FCEDEC",
                    border: theme =>
                      `solid 1px ${
                        theme.palette.mode === "dark"
                          ? cur.correct
                            ? theme.palette.common.teal700
                            : theme.palette.common.notebookRed2
                          : cur.correct
                          ? theme.palette.common.teal700
                          : theme.palette.common.notebookRed2
                      }`,
                  },
                }),
              }}
            >
              {cur.choice}

              <Box
                className="check-box"
                sx={{
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
                  ...(selectedIdxAnswer === idx && {
                    backgroundColor: theme =>
                      cur.correct ? theme.palette.common.teal700 : theme.palette.common.notebookRed2,
                    border: theme =>
                      `solid 1px ${cur.correct ? theme.palette.common.teal700 : theme.palette.common.notebookRed2}`,
                  }),
                }}
              >
                {selectedIdxAnswer === idx && cur.correct && <CheckIcon sx={{ fontSize: "12px" }} />}
                {selectedIdxAnswer === idx && !cur.correct && <CloseIcon sx={{ fontSize: "12px" }} />}
              </Box>
            </ListItem>
            {selectedIdxAnswer === idx && <Typography sx={{ mt: "8px" }}>{cur.feedback}</Typography>}
          </Box>
        ))}
      </Stack>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction={"row"} alignItems="center" spacing={"10px"} sx={{ position: "relative" }}>
          <LocalOfferIcon sx={{ mr: "10px", color: theme => theme.palette.common.notebookO100 }} />
          <Typography>{node.tags[node.tags.length - 1] ?? ""} </Typography>
          {node.tags.length > 1 && (
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
                  // p: "8px 16px",
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
        <CustomWrapperButton id={`${node.id}-node-footer-votes`}>
          <Stack direction={"row"} alignItems={"center"}>
            <Tooltip title={"Vote to prevent further changes."} placement={"top"}>
              <Button
                // id={downvoteButtonId}
                // disabled={disableUpvoteButton}
                onClick={() => console.log("upvote")}
                sx={{ padding: "0px", color: "inherit", minWidth: "0px" }}
              >
                <Box sx={{ display: "flex", fontSize: "14px", alignItems: "center" }}>
                  <DoneIcon sx={{ fontSize: "18px" }} />
                  <span style={{ marginLeft: "2px" }}>{shortenNumber(node.corrects, 2, false)}</span>
                </Box>
              </Button>
            </Tooltip>
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{
                borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit"),
                mx: "4px",
              }} /* sx={{ borderColor: "#6A6A6A" }}  */
            />
            <Tooltip title={"Vote to delete node."} placement={"top"}>
              <Button
                // id={upvoteButtonId}
                // disabled={disableDownvoteButton}
                onClick={() => console.log("downvote")}
                sx={{ padding: "0px", color: "inherit", minWidth: "0px" }}
              >
                <Box sx={{ display: "flex", fontSize: "14px", alignItems: "center" }}>
                  <CloseIcon sx={{ fontSize: "18px" }} />
                  <span style={{ marginLeft: "2px" }}>{shortenNumber(node.wrongs, 2, false)}</span>
                </Box>
              </Button>
            </Tooltip>
          </Stack>
        </CustomWrapperButton>
      </Box>
    </Box>
  );
};

type PracticeQuestionProps = { onClose: () => void };
export const PracticeQuestion = ({ onClose }: PracticeQuestionProps) => {
  const db = getFirestore();
  const [questions, setQuestions] = useState<Node[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<{ question: Node; idx: number } | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number>(-1);
  const [displaySidebar, setDisplaySidebar] = useState<"LEADERBOARD" | "USER_STATUS" | null>(null);

  useEffect(() => {
    if (!selectedQuestion) return;
    setSelectedAnswers(-1);
  }, [selectedQuestion]);

  const onNextQuestion = useCallback(() => {
    console.log("onNextQuestion");
    setSelectedQuestion(pre => {
      if (!pre) return pre;
      if (pre.idx >= questions.length - 1) return pre;
      const newIdx = pre.idx + 1;
      return { question: questions[newIdx], idx: newIdx };
    });
  }, [questions]);

  const onSelectAnswer = (answerIdx: number) => {
    setSelectedAnswers(answerIdx);
  };

  useEffect(() => {
    const getUserInfo = async () => {
      const rootInfo = await getRootQuestionDescendants(db, "ib25pTDmuDtnR0SJbccT");
      if (!rootInfo) return;
      console.log({ rootInfo });
      setQuestions(rootInfo.descendants);
      if (rootInfo.descendants.length > 0) {
        setSelectedQuestion({ question: rootInfo.descendants[0], idx: 0 });
      }
    };
    getUserInfo();
  }, [db]);

  if (!selectedQuestion)
    return (
      <Box
        sx={{
          position: "absolute",
          inset: "0px",
          background: theme =>
            theme.palette.mode === "dark" ? theme.palette.common.notebookG900 : theme.palette.common.notebookG900,
          zIndex: 1,
          p: "45px 64px",
        }}
      ></Box>
    );

  return (
    <Box
      sx={{
        p: "45px 64px",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <IconButton onClick={onClose} sx={{ color: theme => theme.palette.common.primary800, position: "absolute" }}>
        <CloseFullscreenIcon />
      </IconButton>

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

      <Box sx={{ maxWidth: "820px", m: "auto" }}>
        <QuestionMessage
          messages={[
            `7 questions left to get today’s point.`,
            `You have completed 19 days out of 45 days of your review practice.`,
            `24 days are remaining to the end of the semester.`,
          ]}
        />
        <NodeQuestion
          node={selectedQuestion.question}
          selectedIdxAnswer={selectedAnswers}
          setSelectedIdxAnswer={onSelectAnswer}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: "32px" }}>
          <Button
            variant="contained"
            onClick={onNextQuestion}
            sx={{
              borderRadius: "26px",
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
          <Button
            variant="contained"
            onClick={onNextQuestion}
            disabled={!(selectedAnswers >= 0)}
            sx={{ borderRadius: "26px" }}
          >
            Claim my point
          </Button>
        </Box>
      </Box>

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
        <Leaderboard />
      </Box>

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
        <UserStatus />
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
