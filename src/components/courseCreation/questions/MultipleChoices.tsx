import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import { Box, Button, Card, CardHeader, IconButton, TextField, Tooltip } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { useState } from "react";
import { KnowledgeChoice } from "src/knowledgeTypes";

import TypographyUnderlined from "@/components/TypographyUnderlined";

type QuestionChoicesProps = {
  choices: KnowledgeChoice[];
  idx?: number;
  choicesNum?: any;
  choice?: KnowledgeChoice;
  deleteChoice?: any;
  switchChoice?: any;
  changeChoice?: any;
  changeFeedback?: any;
  sx?: SxProps<Theme>;
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
        <Box className="collapsible-body" style={{ display: "block" }}>
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

const MultipleChoices = ({ choices, sx }: QuestionChoicesProps) => {
  const [choicesS, setChoicesS] = useState<KnowledgeChoice[]>(choices);

  const handleChoiceText = (value: string, idx: number) => {
    const prevChoices = [...choicesS];
    prevChoices[idx].choice = value;
    setChoicesS(prevChoices);
  };

  const handleFeedbackText = (value: string, idx: number) => {
    const prevChoices = [...choicesS];
    prevChoices[idx].feedback = value;
    setChoicesS(prevChoices);
  };

  const handleCorrect = (value: boolean, idx: number) => {
    const prevChoices = [...choicesS];
    prevChoices[idx].correct = value;
    setChoicesS(prevChoices);
  };

  const addChoice = () => {
    setChoicesS([
      ...choicesS,
      {
        choice: "",
        correct: true,
        feedback: "",
      },
    ]);
  };

  const deleteChoice = (idx: number) => {
    const prevChoices = [...choicesS];
    prevChoices.splice(idx, 1);
    setChoicesS(prevChoices);
  };

  return (
    <Card sx={{ ...sx }}>
      <CardHeader
        sx={{
          backgroundColor: theme =>
            theme.palette.mode === "light" ? theme.palette.common.darkGrayBackground : theme.palette.common.black,
          // color: theme => theme.palette.common.white,
        }}
        title={
          <Box sx={{ textAlign: "center", color: "inherit" }}>
            <TypographyUnderlined
              variant="h6"
              fontWeight="300"
              gutterBottom
              align="center"
              sx={{ color: theme => theme.palette.common.white }}
            >
              Knowledge Checks
            </TypographyUnderlined>
          </Box>
        }
      ></CardHeader>
      {choicesS.map((choice: KnowledgeChoice, idx: number) => {
        return (
          <Choice
            key={idx}
            idx={idx}
            choices={choicesS}
            choice={choice}
            handleChoiceText={handleChoiceText}
            handleCorrect={handleCorrect}
            handleFeedbackText={handleFeedbackText}
            deleteChoice={deleteChoice}
          />
        );
      })}
      <Box sx={{ alignSelf: "flex-end" }}>
        <Button onClick={() => addChoice()}>
          <AddIcon className="green-text" sx={{ fontSize: "16px" }} />
          <span>Add Choice</span>
        </Button>
      </Box>
    </Card>
  );
};

export default React.memo(MultipleChoices);
