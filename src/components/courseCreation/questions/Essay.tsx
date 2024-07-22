import { Box, Divider, Switch, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Editor } from "@/components/Editor";

import RubricItems from "./RubricItems";

type EditorOptions = "EDIT" | "PREVIEW";
type EssayProps = {
  question: any;
  idx: number;
  nodeId: number;
  sx?: SxProps<Theme>;
  handleQuestion: (question: any, idx: number, nodeId: number) => void;
};

const Essay = ({ idx, nodeId, question, sx, handleQuestion }: EssayProps) => {
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

  const handleQuestionText = (value: string) => {
    setQuestionS({ ...questionS, question_text: value });
  };

  const handleAddRubric = () => {
    setQuestionS({
      ...questionS,
      rubric_items: [
        ...questionS.rubric_items,
        {
          items: "",
          points: 0,
        },
      ],
    });
  };

  const handleDeleteRubric = (idx: number) => {
    const prevRubrics = [...questionS?.rubric_items];
    prevRubrics.splice(idx, 1);
    setQuestionS({ ...questionS, rubric_items: prevRubrics });
  };

  const handleRubricItem = (value: string, idx: number) => {
    const prevRubrics = [...questionS?.rubric_items];
    prevRubrics[idx].item = value;
    setQuestionS({ ...questionS, rubric_items: prevRubrics });
  };

  const handleRubricPoints = (value: string, idx: number) => {
    const prevRubrics = [...questionS?.rubric_items];
    prevRubrics[idx].points = value ? parseInt(value) : 0;
    setQuestionS({ ...questionS, rubric_items: prevRubrics });
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
            Essay Question {(idx || 0) + 1}:
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
      <RubricItems
        key={idx}
        rubrics={questionS?.rubric_items}
        handleAddRubric={handleAddRubric}
        handleDeleteRubric={handleDeleteRubric}
        handleRubricItem={handleRubricItem}
        handleRubricPoints={handleRubricPoints}
        option={option}
      />
      <Divider sx={{ borderColor: "gray", my: 3 }} />
    </Box>
  );
};

export default React.memo(Essay);
