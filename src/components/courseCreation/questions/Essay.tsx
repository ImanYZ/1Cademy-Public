import { Box, TextField, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { useEffect, useState } from "react";

import RubricItems from "./RubricItems";

type EssayProps = {
  question: any;
  idx?: number;
  nodeId?: number;
  sx?: SxProps<Theme>;
  handleQuestion: (question: any, idx: number, nodeId: number) => void;
};

const Essay = ({ idx, question, sx }: EssayProps) => {
  const [questionS, setQuestionS] = useState<any>(question);
  useEffect(() => {
    //handleQuestions(idx, )
    //console.log(questionS, "questionS--questionS");
  }, [questionS]);

  const handleQuestionText = (e: any) => {
    setQuestionS({ ...questionS, question_text: e.target.value });
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
    prevRubrics[idx].points = parseInt(value);
    setQuestionS({ ...questionS, rubric_items: prevRubrics });
  };

  return (
    <Box sx={{ ...sx }}>
      <Box mt={2} mb={2}>
        <Typography mb={4} variant="h3" fontWeight={"bold"}>
          Essay Question {(idx || 0) + 1}:
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
      <RubricItems
        key={idx}
        rubrics={questionS?.rubric_items}
        handleAddRubric={handleAddRubric}
        handleDeleteRubric={handleDeleteRubric}
        handleRubricItem={handleRubricItem}
        handleRubricPoints={handleRubricPoints}
      />
      {/* <Divider variant="fullWidth" orientation="horizontal" /> */}
      <Box sx={{ mt: 2, pb: 2, borderTop: "solid 2px gray" }} />
    </Box>
  );
};

export default React.memo(Essay);
