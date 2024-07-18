// import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import { Box, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { useEffect, useRef, useState } from "react";
import { KnowledgeChoice } from "src/knowledgeTypes";

type QuestionChoicesProps = {
  question: any;
  idx: number;
  nodeId: number;
  sx?: SxProps<Theme>;
  handleQuestion: (question: any, idx: number, nodeId: number) => void;
};

type ChoiceProps = {
  idx: number;
  choices: KnowledgeChoice[];
  choice: KnowledgeChoice;
  handleChoiceText: (value: string, idx: number) => void;
  handleCorrect: (value: boolean, idx: number) => void;
  handleFeedbackText: (value: string, idx: number) => void;
  deleteChoice: (idx: number) => void;
};

const Choice = ({
  idx,
  choices,
  choice,
  handleChoiceText,
  handleCorrect,
  handleFeedbackText,
  deleteChoice,
}: ChoiceProps) => {
  return (
    <Box>
      <li className="QuestionChoices">
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
          <TextField
            label="Replace this with the choice."
            fullWidth
            value={choice.choice}
            onChange={e => handleChoiceText(e.target.value, idx)}
            margin="normal"
            variant="outlined"
            sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
            InputLabelProps={{
              style: {
                color: "gray",
              },
            }}
          />
          {choices.length > 1 && (
            <Box>
              <Tooltip title={"Delete this choice from this question."}>
                <IconButton onClick={() => deleteChoice(idx)}>
                  <DeleteForeverIcon className="red-text" sx={{ fontSize: "28px" }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
        <Box className="collapsible-body" sx={{ display: "block", width: "90%", mx: "auto" }}>
          <TextField
            label="Replace this with the choice-specific feedback."
            fullWidth
            value={choice.feedback}
            onChange={e => handleFeedbackText(e.target.value, idx)}
            margin="normal"
            variant="outlined"
            sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
            InputLabelProps={{
              style: {
                color: "gray",
              },
            }}
          />
        </Box>
      </li>
    </Box>
  );
};

const MultipleChoices = ({ idx, nodeId, question, sx, handleQuestion }: QuestionChoicesProps) => {
  const [questionS, setQuestionS] = useState<any>(question);
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

  return (
    <Box sx={{ ...sx }}>
      <Box mt={2} mb={2}>
        <Typography mb={4} variant="h3" fontWeight={"bold"}>
          Multiple-Choice Question {(idx || 0) + 1}:
        </Typography>
        <TextField
          multiline
          label="Question Stem"
          variant="outlined"
          fullWidth
          value={questionS?.question_text}
          onChange={handleQuestionText}
          InputLabelProps={{
            style: {
              color: "gray",
            },
          }}
        />
      </Box>
      {questionS?.choices.map((choice: KnowledgeChoice, idx: number) => {
        return (
          <Choice
            key={idx}
            idx={idx}
            choices={questionS?.choices}
            choice={choice}
            handleChoiceText={handleChoiceText}
            handleCorrect={handleCorrect}
            handleFeedbackText={handleFeedbackText}
            deleteChoice={deleteChoice}
          />
        );
      })}
      {/* <Box sx={{ alignSelf: "flex-end" }}>
        <Button onClick={() => addChoice()}>
          <AddIcon className="green-text" sx={{ fontSize: "16px" }} />
          <span>Add Choice</span>
        </Button>
      </Box> */}
      {/* <Divider variant="fullWidth" orientation="horizontal" /> */}
      <Box sx={{ mt: 2, pb: 2, borderTop: "solid 2px gray" }} />
    </Box>
  );
};

export default React.memo(MultipleChoices);
