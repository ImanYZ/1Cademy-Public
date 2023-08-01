import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, Divider, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import { useFormik } from "formik";
import React, { useState } from "react";
import { Question, Rubric, updateQuestion } from "src/client/firestore/questions.firestore";
import * as yup from "yup";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { newId } from "@/lib/utils/newid";

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
    if (idx < question.rubrics.length) {
    }
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
      <Box sx={{ p: "32px", backgroundColor: DESIGN_SYSTEM_COLORS.gray50 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h1">Questions</Typography>
          <Tooltip title="Return to Questions">
            <IconButton onClick={onReturnToQuestions}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
          {/* <Button variant="contained" onClick={oneDisplayQuestionForm}>
          {displayQuestionForm ? (
            "Show Questions"
          ) : (
            <>
              {"Add Question"} <AddIcon />
            </>
          )}
        </Button> */}
        </Box>
        <Divider sx={{ my: "12px" }} />
        {/* {!displayQuestionForm && (
        <Stack spacing={"16px"}>
          {question.map(cur => (
            <QuestionItem key={cur.id} question={cur} />
          ))}
        </Stack>
      )} */}
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
        sx={{ p: "32px", backgroundColor: DESIGN_SYSTEM_COLORS.gray50 }}
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
                    <Button variant="contained">Choose it</Button>
                    <Button variant="contained">Try it</Button>
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
                  <Button
                    variant="contained"
                    onClick={onCancelRubric}
                    disabled={editedRubric.isLoading}
                    sx={{
                      border: `solid 1px ${DESIGN_SYSTEM_COLORS.gray300}`,
                      borderRadius: "26px",
                      backgroundColor: theme =>
                        theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray800 : DESIGN_SYSTEM_COLORS.baseWhite,
                      color: theme =>
                        theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray700 : DESIGN_SYSTEM_COLORS.gray700,
                      ":hover": {
                        backgroundColor: theme =>
                          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray700 : DESIGN_SYSTEM_COLORS.gray300,
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    onClick={() => onSaveRubric(idx)}
                    disabled={editedRubric.isLoading}
                    sx={{
                      borderRadius: "26px",
                      backgroundColor: DESIGN_SYSTEM_COLORS.primary800,
                      ":hover": {
                        backgroundColor: theme =>
                          theme.palette.mode === "dark"
                            ? DESIGN_SYSTEM_COLORS.primary900
                            : DESIGN_SYSTEM_COLORS.primary900,
                      },
                    }}
                  >
                    {editedRubric.isLoading ? "Proposing ..." : "Propose"}
                  </Button>
                </Stack>
              )}
            </>
          );
        })}

        {!editedRubric?.isNew && (
          <Button type="button" variant="contained" onClick={onAddRubric}>
            Add Rubric <AddIcon />
          </Button>
        )}
      </Stack>
    </Box>
  );
};

// return (
//   <Stack
//     component="form"
//     onSubmit={formik.handleSubmit}
//     direction="column"
//     spacing={5}
//     alignItems={"center"}
//     my={2}
//   >
//     <TextField
//       label="Title"
//       id="title"
//       name="title"
//       fullWidth
//       onChange={formik.handleChange}
//       value={formik.values.title}
//       error={formik.touched.title && Boolean(formik.errors.title)}
//       helperText={formik.touched.title && formik.errors.title}
//       onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
//         formik.handleBlur(event);
//       }}
//     />
//     <ImageInput
//       imageUrl={formik.values.imageUrl}
//       updateImageUrl={url => formik.setFieldValue("imageUrl", url)}
//     />
//     <Button variant="contained" type="submit" disabled={formik.isSubmitting}>
//       {formik.isSubmitting ? "Saving ..." : "Save"}
//     </Button>

//     {/* <FieldArray
//       // name="rubrics"
//       render={(arrayHelpers: any) => (
//         <Stack spacing={"8px"} sx={{ width: "100%" }}>
//           {formik.values.rubrics.map((rubric, index) => (
//             <Stack key={index} direction={"row"}>
//               <TextField
//                 label={`Rubric ${index + 1}`}
//                 // id="imageUrl"
//                 name={`rubrics[${index}].prompt`}
//                 fullWidth
//                 multiline
//                 minRows={3}
//                 onChange={formik.handleChange}
//                 value={rubric.prompt}
//                 error={
//                   formik.touched.rubrics &&
//                   formik.touched.rubrics[index].prompt &&
//                   Boolean(formik.errors.rubrics && formik.errors.rubrics[index])
//                 }
//                 // helperText={formik.touched.imageUrl && formik.errors.imageUrl}
//                 // onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
//                 //   formik.handleBlur(event);
//                 // }}
//               />

//               <Stack>
//                 <IconButton type="button" onClick={() => arrayHelpers.remove(index)}>
//                   <DeleteIcon />
//                 </IconButton>
//               </Stack>
//             </Stack>
//           ))}
//           <Box sx={{ display: "flex", justifyContent: "center" }}>
//             <Button type="button" variant="contained" onClick={() => arrayHelpers.push(EMPTY_RUBRIC)}>
//               Add Rubric <AddIcon />
//             </Button>
//           </Box>
//         </Stack>
//       )}
//     />
//     */}

//     <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
//       <LoadingButton type="submit" color="primary" variant="contained" loading={false}>
//         Submit
//         {/* <ArrowForwardIcon sx={{ ml: "10px" }} /> */}
//       </LoadingButton>
//     </Box>
//   </Stack>
// );
