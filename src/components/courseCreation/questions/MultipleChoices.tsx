// import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import { Box, IconButton, Switch, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { KnowledgeChoice } from "src/knowledgeTypes";
import { QuestionProps } from "src/types";

import { Editor } from "@/components/Editor";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

type EditorOptions = "EDIT" | "PREVIEW";

type ChoiceProps = {
  idx: number;
  choices: KnowledgeChoice[];
  choice: KnowledgeChoice;
  handleChoiceText: (value: string, idx: number) => void;
  handleCorrect: (value: boolean, idx: number) => void;
  handleFeedbackText: (value: string, idx: number) => void;
  deleteChoice: (idx: number) => void;
  option: EditorOptions;
};

const Choice = ({
  idx,
  choices,
  choice,
  handleChoiceText,
  handleCorrect,
  handleFeedbackText,
  deleteChoice,
  option,
}: ChoiceProps) => {
  return (
    <Box>
      <Box style={{ display: "flex", alignItems: "center" }}>
        <Box>
          {choice?.correct ? (
            <IconButton onClick={() => handleCorrect(false, idx)}>
              <DoneIcon className="green-text" sx={{ fontSize: "28px" }} />
            </IconButton>
          ) : (
            <IconButton onClick={() => handleCorrect(true, idx)}>
              <CloseIcon className="red-text" sx={{ fontSize: "28px" }} />
            </IconButton>
          )}
        </Box>
        {/* TODO: Keep the state of readonly after render */}
        <Editor
          label="Replace this with the choice."
          value={choice?.choice}
          setValue={value => handleChoiceText(value, idx)}
          readOnly={option === "PREVIEW"}
          sxPreview={{ fontSize: "15px", fontWeight: 300 }}
          showEditPreviewSection={false}
          editOption={option}
        />
        {option === "EDIT" && choices.length > 1 && (
          <Box>
            <Tooltip title={"Delete this choice from this question."}>
              <IconButton onClick={() => deleteChoice(idx)}>
                <DeleteForeverIcon className="red-text" sx={{ fontSize: "28px" }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
      <Box className="collapsible-body" sx={{ display: "block", width: "90%", mx: "auto", mt: 3 }}>
        <Editor
          label="Replace this with the choice-specific feedback."
          value={choice?.feedback}
          setValue={value => handleFeedbackText(value, idx)}
          readOnly={false}
          showEditPreviewSection={false}
          editOption={option}
        />
      </Box>
    </Box>
  );
};

const MultipleChoices = ({ idx, nodeId, question, sx, handleQuestion }: QuestionProps) => {
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

  const handleChoiceText = (value: string, idx: number) => {
    const prevChoices = [...questionS?.choices];
    prevChoices[idx].choice = value;
    setQuestionS({ ...questionS, choices: prevChoices });
  };

  const handleFeedbackText = (value: string, idx: number) => {
    const prevChoices = [...questionS?.choices];
    prevChoices[idx].feedback = value;
    setQuestionS({ ...questionS, choices: prevChoices });
  };

  const handleCorrect = (value: boolean, idx: number) => {
    const prevChoices = [...questionS?.choices];
    prevChoices[idx].correct = value;
    setQuestionS({ ...questionS, choices: prevChoices });
  };

  // const addChoice = () => {
  //   setQuestionS({
  //     ...questionS,
  //     choices: [
  //       ...questionS.choices,
  //       {
  //         choice: "",
  //         correct: true,
  //         feedback: "",
  //       },
  //     ],
  //   });
  // };

  const deleteChoice = (idx: number) => {
    const prevChoices = [...questionS?.choices];
    prevChoices.splice(idx, 1);
    setQuestionS({ ...questionS, choices: prevChoices });
  };

  const handleQuestionText = (e: any) => {
    setQuestionS({ ...questionS, question_text: e.target.value });
  };

  const onChangeOption = useCallback(
    (newOption: boolean) => {
      setOption(newOption ? "PREVIEW" : "EDIT");
    },
    [setOption]
  );

  return (
    <Box sx={{ ...sx }}>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <Typography mb={4} variant="h3" fontWeight={"bold"}>
              Question {(idx || 0) + 1}
            </Typography>
            <Typography mb={4} sx={{ fontSize: "13px" }}>
              (Multiple-Choice):
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
      {questionS?.choices.map((choice: KnowledgeChoice, idx: number) => {
        return (
          <Box
            key={idx}
            sx={{
              background: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray100,
              p: 3,
              mt: 2,
            }}
          >
            <Choice
              idx={idx}
              choices={questionS?.choices}
              choice={choice}
              handleChoiceText={handleChoiceText}
              handleCorrect={handleCorrect}
              handleFeedbackText={handleFeedbackText}
              deleteChoice={deleteChoice}
              option={option}
            />
          </Box>
        );
      })}
      {/* <Box sx={{ alignSelf: "flex-end" }}>
        <Button onClick={() => addChoice()}>
          <AddIcon className="green-text" sx={{ fontSize: "16px" }} />
          <span>Add Choice</span>
        </Button>
      </Box> */}
    </Box>
  );
};

export default React.memo(MultipleChoices);
