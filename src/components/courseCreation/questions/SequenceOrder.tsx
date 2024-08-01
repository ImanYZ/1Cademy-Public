import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Box, Switch, Typography } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { QuestionProps } from "src/types";

import { Editor } from "@/components/Editor";
import { CustomButton } from "@/components/map/Buttons/Buttons";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

type EditorOptions = "EDIT" | "PREVIEW";

const SequenceOrder = ({ idx, nodeId, question, sx, handleQuestion }: QuestionProps) => {
  const [questionS, setQuestionS] = useState<any>(question);
  const [option, setOption] = useState<EditorOptions>("EDIT");
  const [dragOverItemPointer, setDragOverItemPointer] = useState<any>(null);
  const saveTimeoutRef = useRef<any>(null);
  const dragItem = useRef<any>(null);
  const dragOverItem = useRef<any>(null);

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

  const handleStep = (value: string, index: number) => {
    const steps = [...questionS.steps];
    steps[index].step = value;
    setQuestionS({ ...questionS, steps });
  };

  const handleStepFeedback = (value: string, index: number) => {
    const steps = [...questionS.steps];
    steps[index].feedback = parseInt(value);
    setQuestionS({ ...questionS, steps });
  };

  const onChangeOption = useCallback(
    (newOption: boolean) => {
      setOption(newOption ? "PREVIEW" : "EDIT");
    },
    [setOption]
  );

  const handleDragEnd = () => {
    const steps = [...questionS.steps];
    const fromStep = steps[dragItem.current];
    const toTopic = steps[dragOverItem.current];
    steps[dragItem.current].order = dragOverItem.current + 1;
    steps[dragItem.current] = toTopic;
    steps[dragOverItem.current].order = dragItem.current + 1;
    steps[dragOverItem.current] = fromStep;
    setQuestionS({ ...questionS, steps });
    setDragOverItemPointer(null);
  };

  const handleAddItem = () => {
    setQuestionS({
      ...questionS,
      steps: [
        ...questionS.steps,
        {
          step: `Step ${questionS.steps.length + 1}`,
          feedback: `Feedback ${questionS.steps.length + 1}`,
          order: questionS.steps.length + 1,
        },
      ],
    });
  };

  const handleDeleteItem = (index: number) => {
    const steps = [...questionS.steps];
    steps.splice(index, 1);
    setQuestionS({ ...questionS, steps });
  };

  return (
    <Box sx={{ ...sx }}>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <Typography mb={4} variant="h3" fontWeight={"bold"}>
              Question {(idx || 0) + 1}
            </Typography>
            <Typography mb={4} sx={{ fontSize: "13px" }}>
              (Sequence-Ordering):
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              top: "-8px",
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
      <Box sx={{ my: 3 }}>
        {questionS?.steps
          .sort((a: any, b: any) => a.order - b.order)
          .map((step: any, index: number) => {
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  mb: 3,
                  p: 2,
                  background: theme =>
                    theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray100,
                  borderLeft:
                    dragOverItemPointer === index ? `solid 4px ${DESIGN_SYSTEM_COLORS.success400}` : undefined,
                  ...(option === "PREVIEW" && {
                    gap: "5px",
                  }),
                }}
                draggable
                onDragStart={() => {
                  dragItem.current = index;
                }}
                onDragEnter={() => {
                  dragOverItem.current = index;
                  setDragOverItemPointer(index);
                }}
                onDragEnd={handleDragEnd}
              >
                <DragIndicatorIcon />
                <Box sx={{ display: "flex", flexDirection: "column", gap: "15px", width: "90%" }}>
                  <Editor
                    label="Step"
                    value={step?.step}
                    setValue={value => handleStep(value, index)}
                    readOnly={option === "PREVIEW"}
                    showEditPreviewSection={false}
                    editOption={option}
                  />
                  {option === "EDIT" && (
                    <Editor
                      label="Feedback"
                      value={step?.feedback}
                      setValue={value => handleStepFeedback(value, index)}
                      readOnly={false}
                      showEditPreviewSection={false}
                      editOption={option}
                    />
                  )}
                  <CustomButton variant="outlined" type="button" color="error" onClick={() => handleDeleteItem(index)}>
                    Delete Item
                    <DeleteIcon sx={{ ml: 1 }} />
                  </CustomButton>
                </Box>
              </Box>
            );
          })}
      </Box>
      {option === "EDIT" && (
        <Box mt={1} sx={{ display: "flex", justifyContent: "center" }}>
          <CustomButton variant="contained" type="button" color="secondary" onClick={() => handleAddItem()}>
            Add Item <AddIcon />
          </CustomButton>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(SequenceOrder);
