import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { useState } from "react";
import { KnowledgeChoice } from "src/knowledgeTypes";

type TrueFalseProps = {
  question: any;
  idx?: number;
  nodeId?: number;
  choicesNum?: any;
  choice?: KnowledgeChoice;
  deleteChoice?: any;
  switchChoice?: any;
  changeChoice?: any;
  changeFeedback?: any;
  sx?: SxProps<Theme>;
  handleQuestion: (question: any, idx: number, nodeId: number) => void;
};

const TrueFalse = ({ idx, question, sx }: TrueFalseProps) => {
  const [questionS, setQuestionS] = useState<any>(question);

  // useEffect(() => {
  //   handleQuestions(idx, )
  // }, [choicesS]);

  const handleCorrect = (value: string) => {
    setQuestionS({ ...questionS, correct_answer: value });
  };

  const handleQuestionText = (e: any) => {
    setQuestionS({ ...questionS, question_text: e.target.value });
  };

  const handleFeedbackText = (value: string) => {
    setQuestionS({ ...questionS, feedback: value });
  };
  return (
    <Box sx={{ ...sx }}>
      <Box mt={2} mb={2}>
        <Typography mb={4} variant="h3" fontWeight={"bold"}>
          True-False Question {(idx || 0) + 1}:
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
      <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
        <IconButton
          sx={{
            border: questionS.correct_answer === "True" ? "solid 1px green" : undefined,
          }}
          onClick={() => handleCorrect("True")}
        >
          <DoneIcon className="green-text" sx={{ fontSize: "28px" }} />
        </IconButton>

        <IconButton
          sx={{
            border: questionS.correct_answer === "False" ? "solid 1px red" : undefined,
          }}
          onClick={() => handleCorrect("False")}
        >
          <CloseIcon className="red-text" sx={{ fontSize: "28px" }} />
        </IconButton>
      </Box>
      <Box className="collapsible-body" sx={{ display: "block", width: "90%", mx: "auto" }}>
        <TextField
          label="Replace this with the choice-specific feedback."
          fullWidth
          value={questionS.feedback}
          onChange={e => handleFeedbackText(e.target.value)}
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

      <Box sx={{ mt: 2, pb: 2, borderTop: "solid 2px gray" }} />
    </Box>
  );
};

export default React.memo(TrueFalse);
