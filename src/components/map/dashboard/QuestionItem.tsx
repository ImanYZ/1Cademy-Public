import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import SortIcon from "@mui/icons-material/Sort";
import { Box, Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useState } from "react";
import { Question } from "src/client/firestore/questions.firestore";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

type QuestionItemProps = { question: Question; onSelectQuestion: (selectedQuestion: Question) => void };

export const QuestionItem = ({ question, onSelectQuestion }: QuestionItemProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      sx={{
        p: "32px",
        backgroundColor: ({ palette }) =>
          palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
        borderRadius: "8px",
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: "20px" }}>{question.title}</Typography>
      {expanded && <Typography>{question.description}</Typography>}
      {expanded && question.imageUrl && <img src={question.imageUrl} alt="question image" style={{ width: "100%" }} />}
      <Button onClick={() => setExpanded(prev => !prev)}>
        {expanded ? "Show less" : "Show more"}
        <KeyboardArrowDownIcon sx={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }} />
      </Button>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Stack direction="row" alignItems={"center"}>
          <SortIcon sx={{ mr: "8px", color: DESIGN_SYSTEM_COLORS.primary600 }} />
          <Typography>
            {dayjs(question.createdAt).fromNow().includes("NaN")
              ? "a few minutes ago"
              : `${dayjs(question.createdAt).fromNow()}`}
          </Typography>
        </Stack>
        <Stack direction={"row"}>
          <Tooltip title="Rubric settings">
            <IconButton onClick={() => onSelectQuestion(question)}>
              <ReadMoreIcon />
            </IconButton>
          </Tooltip>
          {/* <IconButton>
            <DeleteIcon />
          </IconButton> */}
        </Stack>
      </Stack>
    </Box>
  );
};
