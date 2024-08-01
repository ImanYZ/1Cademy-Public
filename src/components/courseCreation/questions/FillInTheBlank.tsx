import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, FilledInput, IconButton, Switch, Tooltip, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { QuestionProps } from "src/types";

import { Editor } from "@/components/Editor";
import { CustomButton } from "@/components/map/Buttons/Buttons";

type EditorOptions = "EDIT" | "PREVIEW";

type PossibleCorrectAnswersProps = {
  option: EditorOptions;
  possibleCorrectAnswers: string[];
  handlePossibleCorrectAnswer: (value: string, index: number) => void;
  handleDeletePossibleCorrectAnswer: (index: number) => void;
  sx?: SxProps<Theme>;
};

const PossibleCorrectAnswers = ({
  option,
  possibleCorrectAnswers,
  handlePossibleCorrectAnswer,
  handleDeletePossibleCorrectAnswer,
  sx,
}: PossibleCorrectAnswersProps) => {
  return (
    <Box sx={{ ...sx }}>
      {possibleCorrectAnswers?.map((answer: any, index: number) => {
        return (
          <Box key={index} sx={{ display: "flex", gap: "10px", mb: 3 }}>
            <Editor
              label={"Answer " + (index + 1)}
              value={answer}
              setValue={value => handlePossibleCorrectAnswer(value, index)}
              showEditPreviewSection={false}
              editOption={option}
              readOnly={option === "PREVIEW"}
            />
            {option === "EDIT" && (
              <Tooltip title="Remove Answer">
                <IconButton type="button" onClick={() => handleDeletePossibleCorrectAnswer(index)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

const FillInTheBlank = ({ idx, question, nodeId, sx, handleQuestion }: QuestionProps) => {
  const [questionS, setQuestionS] = useState<any>(question);
  const [option, setOption] = useState<EditorOptions>("EDIT");
  const [isCorrect, setIsCorrect] = useState<boolean>(true);
  const saveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      handleQuestion(questionS, idx, nodeId);
    }, 1000);
  }, [questionS]);

  const handleQuestionAnswer = (value: string) => {
    if (questionS?.possible_correct_answers?.includes(value)) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setQuestionS({ ...questionS, correct_answer: value });
  };

  const handleQuestionText = (value: string) => {
    setQuestionS({ ...questionS, question_text: value });
  };

  const handleFeedbackText = (value: string) => {
    setQuestionS({ ...questionS, feedback: value });
  };

  const handleAddPossibleCorrectAnswer = () => {
    const possibleCorrectAnswers = [...questionS?.possible_correct_answers];
    possibleCorrectAnswers.push("");
    setQuestionS({ ...questionS, possible_correct_answers: possibleCorrectAnswers });
  };

  const handlePossibleCorrectAnswer = (value: string, index: number) => {
    const possibleCorrectAnswers = [...questionS?.possible_correct_answers];
    possibleCorrectAnswers[index] = value;
    setQuestionS({ ...questionS, possible_correct_answers: possibleCorrectAnswers });
  };

  const handleDeletePossibleCorrectAnswer = (index: number) => {
    const possibleCorrectAnswers = [...questionS?.possible_correct_answers];
    possibleCorrectAnswers.splice(index, 1);
    setQuestionS({ ...questionS, possible_correct_answers: possibleCorrectAnswers });
  };

  const onChangeOption = useCallback(
    (newOption: boolean) => {
      setOption(newOption ? "PREVIEW" : "EDIT");
    },
    [setOption]
  );

  const QuestionWithDynamicInput = (question: string) => {
    const parts = question.split(/_{2,}/);

    return (
      <Box>
        <Typography variant="h4">
          {parts[0]}
          <FilledInput
            value={questionS?.correct_answer}
            id="filled-adornment-weight"
            onChange={e => handleQuestionAnswer(e.target.value)}
            aria-describedby="filled-weight-helper-text"
            inputProps={{
              "aria-label": "days",
            }}
            sx={{
              paddingBottom: "10px",
              height: "40px",
              width: "150px",
              //border: isCorrect ? "solid 1px green" : undefined,
            }}
            error={!isCorrect}
          />
          {parts[1]}
        </Typography>
      </Box>
    );
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
              (Fill-Blank):
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

        {option === "EDIT" && (
          <Editor
            label="Question Stem"
            value={questionS?.question_text}
            setValue={handleQuestionText}
            readOnly={false}
            sxPreview={{ fontSize: "25px", fontWeight: 300 }}
            showEditPreviewSection={false}
            editOption={option}
          />
        )}
        {option === "PREVIEW" && <>{QuestionWithDynamicInput(questionS?.question_text)}</>}
      </Box>

      <Box className="collapsible-body" sx={{ display: "block", width: "90%", mx: "auto", mt: 3 }}>
        <Editor
          label="Replace this with the feedback."
          value={questionS?.feedback}
          setValue={handleFeedbackText}
          readOnly={option === "PREVIEW"}
          showEditPreviewSection={false}
          editOption={option}
        />
      </Box>
      {option === "EDIT" && (
        <>
          <Typography variant="h4" sx={{ mt: 3 }}>
            Possible Correct Answers:
          </Typography>
          <PossibleCorrectAnswers
            option={option}
            possibleCorrectAnswers={questionS.possible_correct_answers}
            handlePossibleCorrectAnswer={handlePossibleCorrectAnswer}
            handleDeletePossibleCorrectAnswer={handleDeletePossibleCorrectAnswer}
            sx={{ mt: 3 }}
          />
        </>
      )}
      {option === "EDIT" && (
        <Box mt={1} sx={{ display: "flex", justifyContent: "center" }}>
          <CustomButton
            variant="contained"
            type="button"
            color="secondary"
            onClick={() => handleAddPossibleCorrectAnswer()}
          >
            Add Possible Answer <AddIcon />
          </CustomButton>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(FillInTheBlank);
