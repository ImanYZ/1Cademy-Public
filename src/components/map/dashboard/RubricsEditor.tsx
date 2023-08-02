import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Divider, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { Question, Rubric, updateQuestion } from "src/client/firestore/questions.firestore";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { newId } from "@/lib/utils/newId";

import { RubricForm, RubricItem } from "./RubricItem";

type RubricsEditorProps = {
  question: Question;
  onSetQuestions: React.Dispatch<React.SetStateAction<Question | null>>;
  onReturnToQuestions: () => void;
};

const generateEmptyRubric = (): Rubric => ({ id: "", points: 1, prompts: [], downvotes: 0, upvotes: 0 });

export const RubricsEditor = ({ question, onReturnToQuestions, onSetQuestions }: RubricsEditorProps) => {
  const db = getFirestore();

  const [rubrics, setRubrics] = useState<Rubric[]>(question.rubrics);
  const [editedRubric, setEditedRubric] = useState<{ data: Rubric; isNew: boolean; isLoading: boolean } | null>(null);

  const onAddRubric = () => {
    const id = newId(db);
    const newRubric = { ...generateEmptyRubric(), id };
    setRubrics(prev => [...prev, newRubric]);
    setEditedRubric({ data: newRubric, isNew: true, isLoading: false });
  };

  const onSaveRubric = async (newRubric: Rubric) => {
    const newRubrics = question.rubrics.find(c => c.id === newRubric.id)
      ? question.rubrics.map(c => (c.id === newRubric.id ? newRubric : c))
      : [...question.rubrics, newRubric];

    setEditedRubric(prev => (prev ? { ...prev, isLoading: true } : null));
    await updateQuestion(db, question.id, { rubrics: newRubrics });
    setEditedRubric(null);
  };

  const newRubric = useMemo(() => {
    return rubrics.reduce((acu: Rubric | null, cur) => {
      if (acu) return acu;
      const founded = question.rubrics.find(c => c.id === cur.id);
      return founded ? null : cur;
    }, null);
  }, [question.rubrics, rubrics]);

  const onDisplayForm = (selectedRubric: Rubric) => {
    setEditedRubric({ data: selectedRubric, isLoading: false, isNew: false });

    const removeRubric = (rubrics: Rubric[], rubricToRemove: Rubric) => rubrics.filter(c => c.id !== rubricToRemove.id);
    if (newRubric) onSetQuestions(prev => (prev ? { ...prev, rubrics: removeRubric(prev.rubrics, newRubric) } : null));
  };

  const onCancelRubric = () => {
    const removeRubric = (rubrics: Rubric[], rubricToRemove: Rubric) => rubrics.filter(c => c.id !== rubricToRemove.id);
    if (newRubric) onSetQuestions(prev => (prev ? { ...prev, rubrics: removeRubric(prev.rubrics, newRubric) } : null));
    setEditedRubric(null);
  };

  useEffect(() => setRubrics(question.rubrics), [question.rubrics]);

  return (
    <Stack spacing={"16px"}>
      <Box
        sx={{
          p: "32px",
          backgroundColor: ({ palette }) =>
            palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h1">Questions</Typography>
          <Tooltip title="Return to Questions">
            <IconButton onClick={onReturnToQuestions}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Divider sx={{ my: "12px" }} />
        <Typography sx={{ fontWeight: 700, fontSize: "20px" }}>{question.title}</Typography>
        <Typography>{question.description}</Typography>
        {question.imageUrl && <img src={question.imageUrl} alt="question image" style={{ width: "100%" }} />}
      </Box>

      <Box
        sx={{
          p: "24px 32px",
          backgroundColor: ({ palette }) =>
            palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: "18px", mb: "32px" }}>Alternative rubrics</Typography>

        <Stack spacing={"28px"}>
          {rubrics.map(cur =>
            cur.id === editedRubric?.data.id ? (
              <RubricForm key={cur.id} rubric={editedRubric.data} onSave={onSaveRubric} cancelFn={onCancelRubric} />
            ) : (
              <RubricItem key={cur.id} onDisplayForm={() => onDisplayForm(cur)} rubric={cur} />
            )
          )}
        </Stack>

        <Divider sx={{ mt: "32px", mb: "36px" }} />

        {!newRubric && (
          <Stack direction={"row"} alignItems={"center"} spacing={"8px"}>
            <Typography
              sx={{
                color: theme => (theme.palette.mode === "light" ? DESIGN_SYSTEM_COLORS.gray900 : undefined),
                fontWeight: 500,
              }}
            >
              Propose a new alternative rubric
            </Typography>
            <IconButton
              onClick={onAddRubric}
              size="small"
              sx={{
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray700 : DESIGN_SYSTEM_COLORS.gray300,
                borderRadius: "6px",
                width: "20px",
                height: "20px",
                p: "0px",
              }}
            >
              <AddIcon sx={{ fontSize: "14px" }} />
            </IconButton>
          </Stack>
        )}
      </Box>
    </Stack>
  );
};
