import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { Box, Divider, IconButton, Switch, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Editor } from "@/components/Editor";

type EditorOptions = "EDIT" | "PREVIEW";
type TrueFalseProps = {
  question: any;
  idx: number;
  nodeId: number;
  sx?: SxProps<Theme>;
  handleQuestion: (question: any, idx: number, nodeId: number) => void;
};

const TrueFalse = ({ idx, question, nodeId, sx, handleQuestion }: TrueFalseProps) => {
  const [questionS, setQuestionS] = useState<any>(question);
  const [option, setOption] = useState<EditorOptions>("EDIT");
  const saveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      handleQuestion(questionS, idx, nodeId);
    }, 1000);
  }, [questionS]);

  const handleCorrect = (value: string) => {
    setQuestionS({ ...questionS, correct_answer: value });
  };

  const handleQuestionText = (value: string) => {
    setQuestionS({ ...questionS, question_text: value });
  };

  const handleFeedbackText = (value: string) => {
    setQuestionS({ ...questionS, feedback: value });
  };

  const onChangeOption = useCallback(
    (newOption: boolean) => {
      setOption(newOption ? "PREVIEW" : "EDIT");
    },
    [setOption]
  );
  return (
    <Box sx={{ ...sx }}>
      <Box mt={2} mb={2}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography mb={4} variant="h3" fontWeight={"bold"}>
            True-False Question {(idx || 0) + 1}:
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              top: "-5px",
              borderRadius: "10px",
            }}
          >
            <Typography
              onClick={() => setOption("PREVIEW")}
              sx={{ cursor: "pointer", fontSize: "14px", fontWeight: 490, color: "inherit" }}
            >
              Preview
            </Typography>
            <Switch checked={option === "EDIT"} onClick={() => onChangeOption(option === "EDIT")} size="small" />
            <Typography
              onClick={() => setOption("EDIT")}
              sx={{ cursor: "pointer", fontSize: "14px", fontWeight: 490, color: "inherit" }}
            >
              Edit
            </Typography>
          </Box>
        </Box>

        <Editor
          label="Question Stem"
          value={questionS?.question_text}
          setValue={handleQuestionText}
          readOnly={option === "PREVIEW"}
          sxPreview={{ fontSize: "25px", fontWeight: 300 }}
          showEditPreviewSection={false}
          editOption={option}
        />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <IconButton
            sx={{
              border: questionS.correct_answer === "True" ? "solid 1px green" : undefined,
            }}
            onClick={() => handleCorrect("True")}
          >
            <DoneIcon className="green-text" sx={{ fontSize: "28px" }} />
          </IconButton>
          <Typography fontWeight="bold">True</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <IconButton
            sx={{
              border: questionS.correct_answer === "False" ? "solid 1px red" : undefined,
            }}
            onClick={() => handleCorrect("False")}
          >
            <CloseIcon className="red-text" sx={{ fontSize: "28px" }} />
          </IconButton>
          <Typography fontWeight="bold">False</Typography>
        </Box>
      </Box>
      <Box className="collapsible-body" sx={{ display: "block", width: "90%", mx: "auto", mt: 2 }}>
        <Editor
          label="Replace this with the choice-specific feedback."
          value={questionS?.feedback}
          setValue={handleFeedbackText}
          readOnly={option === "PREVIEW"}
          showEditPreviewSection={false}
          editOption={option}
        />
      </Box>

      <Divider sx={{ borderColor: "gray", my: 3 }} />
    </Box>
  );
};

export default React.memo(TrueFalse);
