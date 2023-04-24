import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Button, Checkbox, ListItem, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { getFirestore } from "firebase/firestore";
import React, { useEffect, useState } from "react";

import { getRootQuestionDescendants } from "../client/services/nodes.sercice";
import { Node } from "../nodeBookTypes";

type PracticeQuestionProps = {
  title: string;
  questions: { text: string; feedback: string; isCorrect: boolean }[];
  tag: string;
};

const PracticeQuestion = ({ title, questions, tag }: PracticeQuestionProps) => {
  return (
    <>
      <Box sx={{ p: "32px", border: "2px solid #FD7373", borderRadius: "8px" }}>
        <Typography>{title}</Typography>
        <Stack component={"ul"} spacing="16px" sx={{ p: "0px" }}>
          {questions.map((cur, idx) => (
            <ListItem
              key={idx}
              secondaryAction={
                <Checkbox
                  edge="end"
                  // onChange={handleToggle(value)}
                  // checked={checked.indexOf(value) !== -1}
                  // inputProps={{ "aria-labelledby": labelId }}
                />
              }
              sx={{
                p: "24px 16px",
                background: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.notebookG900,
                borderRadius: "8px",
              }}
            >
              {cur.text}
            </ListItem>
          ))}
        </Stack>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LocalOfferIcon sx={{ mr: "10px", color: theme => theme.palette.common.notebookO100 }} />
            <Typography>{tag}</Typography>
          </Box>
          <Box>1 | 0</Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "right" }}>
        <Button variant="contained">Next</Button>
      </Box>
    </>
  );
};

export const PracticeTool = () => {
  const db = getFirestore();
  const [, /* questions */ setQuestions] = useState<Node[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<{ question: Node; idx: number } | null>(null);

  useEffect(() => {
    const getUserInfo = async () => {
      const rootInfo = await getRootQuestionDescendants(db, "ib25pTDmuDtnR0SJbccT");
      if (!rootInfo) return;
      setQuestions(rootInfo.descendants);
      if (rootInfo.descendants.length > 0) {
        setSelectedQuestion({ question: rootInfo.descendants[0], idx: 0 });
      }
    };
    getUserInfo;
  }, [db]);

  return (
    <Box
      sx={{
        position: "absolute",
        inset: "0px",
        background: theme =>
          theme.palette.mode === "dark" ? theme.palette.common.notebookG900 : theme.palette.common.notebookG900,
        zIndex: 1,
      }}
    >
      <Typography>Practice tool</Typography>
      {!selectedQuestion && <Typography>There is no questions</Typography>}
      {selectedQuestion && (
        <Box sx={{ maxWidth: "820px", m: "auto" }}>
          <PracticeQuestion
            title={selectedQuestion.question.title}
            questions={selectedQuestion.question.choices.map(c => ({
              feedback: c.feedback,
              isCorrect: c.correct,
              text: c.choice,
            }))}
            tag="tag"
          />
        </Box>
      )}
    </Box>
  );
};
