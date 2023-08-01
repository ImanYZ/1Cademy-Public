import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Divider, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import { useFormik } from "formik";
import React, { useState } from "react";
import { Question, Rubric, updateQuestion } from "src/client/firestore/questions.firestore";
import * as yup from "yup";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { newId } from "@/lib/utils/newid";

import { CustomButton } from "../Buttons/Buttons";

type RubricsEditorProps = {
  question: Question;
  onReturnToQuestions: () => void;
};

const generateEmptyRubric = (): Rubric => ({ id: "", prompt: "", downvotes: 0, upvotes: 0 });

export const RubricsEditor = ({ question, onReturnToQuestions }: RubricsEditorProps) => {
  const db = getFirestore();

  const [editedRubric, setEditedRubric] = useState<{ data: Rubric; isNew: boolean; isLoading: boolean } | null>(null);

  const validationSchema = yup.array(yup.object({ prompt: yup.string().required() }));

  const onSaveRubric = async (idx: number) => {
    const newRubrics =
      idx < question.rubrics.length
        ? question.rubrics.map((c, i) => (i === idx ? formik.values.rubrics[idx] : c))
        : [...question.rubrics, formik.values.rubrics[idx]];
    setEditedRubric(prev => (prev ? { ...prev, isLoading: true } : null));
    await updateQuestion(db, question.id, { rubrics: newRubrics });
    setEditedRubric(null);
  };

  const formik = useFormik({
    initialValues: { rubrics: question.rubrics },
    validationSchema,
    onSubmit: () => {},
  });

  const onAddRubric = () => {
    const id = newId(db);
    // setNewRubricId(id);
    const newRubric = { ...generateEmptyRubric(), id };
    const rubricsUpdated = [...formik.values.rubrics, newRubric];
    setEditedRubric({ data: newRubric, isNew: true, isLoading: false });
    formik.setValues({ rubrics: rubricsUpdated });
  };

  const onEditRubric = (rubric: Rubric) => {
    if (editedRubric?.isNew) {
      // if previous was new, we remove it
      formik.setValues({ rubrics: formik.values.rubrics.filter(c => c.id !== editedRubric.data.id) });
    }
    if (editedRubric) {
      formik.setValues({
        rubrics: formik.values.rubrics.map(c => (c.id === editedRubric.data.id ? editedRubric.data : c)),
      });
    }
    setEditedRubric({ data: rubric, isNew: false, isLoading: false });
  };

  const onCancelRubric = () => {
    // is new ? remove : revert changes
    if (!editedRubric) return;

    const rubricsProcessed = editedRubric.isNew
      ? formik.values.rubrics.filter(c => c.id !== editedRubric.data.id)
      : formik.values.rubrics.map(c => (c.id === editedRubric.data.id ? editedRubric.data : c));
    formik.setValues({ rubrics: rubricsProcessed });
    setEditedRubric(null);
  };

  // const onSaveRubric = (idx: number) => {
  //   const rubric = formik.values.rubrics[idx];
  //   if (!rubric) return;
  // };

  // const onCancelQuestionEditor = (questionModified: Question) => {
  //   if (!questionModified.id) questions.filter(c => !c.id);
  //   setSelectedQuestion(null);
  // };

  return (
    // Writing Question
    <Box sx={{ px: { xs: "10px", md: "20px" }, py: "10px" }}>
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

      <Stack
        component="form"
        onSubmit={formik.handleSubmit}
        direction="column"
        spacing={5}
        alignItems={"center"}
        my={2}
        sx={{
          p: "32px",
          backgroundColor: ({ palette }) =>
            palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
        }}
      >
        {formik.values.rubrics.map((cur, idx) => {
          return (
            <>
              {editedRubric?.data.id === cur.id && editedRubric.isNew && (
                <>
                  <Box sx={{ width: "100%" }}>
                    <Typography sx={{ fontWeight: 500, mb: "20px" }}>Propose a new alternative rubric</Typography>
                    <Typography>Write you prompt</Typography>
                  </Box>
                </>
              )}
              <TextField
                key={idx}
                // label={`Rubric ${idx + 1}`}
                // id="friends[0]"
                name={`rubrics[${idx}].prompt`}
                placeholder="e.g. Check the text for spelling and rate it from 1 to 10"
                fullWidth
                multiline
                minRows={4}
                onChange={formik.handleChange}
                value={cur.prompt}
                // error={Boolean(formik.touched?.rubrics[idx]) && Boolean(formik.errors.rubrics[idx])}
                // helperText={Boolean(formik.touched[idx]) && (formik.errors[idx] ?? "")}
                onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                  formik.handleBlur(event);
                }}
                disabled={editedRubric?.data.id !== cur.id}
              />
              {editedRubric?.data.id !== cur.id && (
                <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} sx={{ width: "100%" }}>
                  <Stack direction={"row"} alignItems={"center"} spacing={"8px"}>
                    <CustomButton variant="contained" color="secondary">
                      Choose it
                    </CustomButton>
                    <CustomButton variant="contained">Try it</CustomButton>
                  </Stack>
                  <Tooltip title="Edit Rubric" onClick={() => onEditRubric(cur)}>
                    <IconButton>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}

              {editedRubric?.data.id === cur.id && (
                <Stack direction={"row"} justifyContent={"right"} spacing={"8px"} sx={{ width: "100%" }}>
                  <CustomButton
                    variant="contained"
                    color="secondary"
                    onClick={onCancelRubric}
                    disabled={editedRubric.isLoading}
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    variant="contained"
                    onClick={() => onSaveRubric(idx)}
                    disabled={editedRubric.isLoading}
                  >
                    {editedRubric.isLoading ? "Proposing ..." : "Propose"}
                  </CustomButton>
                </Stack>
              )}
            </>
          );
        })}

        {!editedRubric?.isNew && (
          <Stack sx={{ width: "100%" }}>
            <Divider sx={{ mb: "36px" }} />
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
          </Stack>
        )}
      </Stack>
    </Box>
  );
};
