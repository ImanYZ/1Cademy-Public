import { Box, Button, Stack, TextField } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import { Field, FieldArray, useFormik } from "formik";
import React /* , { useState } */ from "react";
import { addQuestion, AddQuestionInput, Rubrick } from "src/client/firestore/questions.firestore";
import * as yup from "yup";

// const initialErrorsState = {
//   startDate: false,
//   endDate: false,
//   nodeProposalStartDate: false,
//   nodeProposalEndDate: false,
//   questionProposalStartDate: false,
//   questionProposalEndDate: false,
//   dailyPracticeStartDate: false,
//   dailyPracticeEndDate: false,
//   errorText: "",
// };

type AssignmentsProps = {};

const INITIAL_VALUES: AddQuestionInput = {
  title: "",
  description: "",
  imageUrl: "",
  rubricks: [],
};

const EMPTY_RUBRICK: Rubrick = { prompt: "", upvotes: 0, downvotes: 0 };

export const Assignments = ({}: AssignmentsProps) => {
  //   const [displayQuestionForm, setDisplayQuestionForm] = useState<boolean>(false);
  //   const [isLoading, setIsLoading] = useState<boolean>(false);
  const db = getFirestore();
  //   const [open, setOpen] = React.useState(false);
  //   const [loaded, setLoaded] = useState(false);
  //   const [errorState, setErrorState] = useState(initialErrorsState);
  //   const [requestLoader, setRequestLoader] = useState(false);
  //   const [deleteLoader, setDeleteLoader] = useState(false);
  //   const [chapters, setChapters] = useState<any>([]);
  //   const [baseSemester, setBaseSemester] = useState<InstructorSemesterSettingPayload>(INITIAL_SEMESTER);
  //   const [semester, setSemester] = useState<ISemester | null>(null);

  const validationSchema = yup.object({
    title: yup.string().required("Required"),
    description: yup.string().required("Required"),
    imageUrl: yup.string().required("Required"),
    rubricks: yup.array(
      yup.object({
        prompt: yup.string().required(),
      })
    ),
  });
  const oneDisplayQuestionForm = () => {
    // setDisplayQuestionForm(true);
  };

  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    validationSchema,
    onSubmit: async values => {
      try {
        // sendFeedbackMutation.mutate({ ...values, pageURL: window.location.href });
        await addQuestion(db, values);
        // setIsLoading(false);
      } catch (err) {
        console.error(err);
      }
    },
  });
  return (
    <Box sx={{ px: { xs: "10px", md: "20px" }, py: "10px" }}>
      <Button onClick={oneDisplayQuestionForm}>Add Question</Button>
      <Stack
        component="form"
        onSubmit={formik.handleSubmit}
        direction="column"
        spacing={5}
        alignItems={"center"}
        my={2}
      >
        <TextField
          label="Title"
          id="title"
          name="title"
          fullWidth
          onChange={formik.handleChange}
          value={formik.values.title}
          error={formik.touched.title && Boolean(formik.errors.title)}
          helperText={formik.touched.title && formik.errors.title}
          onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
            formik.handleBlur(event);
          }}
        />
        <TextField
          label="Description"
          id="description"
          name="description"
          fullWidth
          onChange={formik.handleChange}
          value={formik.values.description}
          error={formik.touched.description && Boolean(formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
          onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
            formik.handleBlur(event);
          }}
        />
        <TextField
          label="ImageUrl"
          id="imageUrl"
          name="imageUrl"
          fullWidth
          onChange={formik.handleChange}
          value={formik.values.imageUrl}
          error={formik.touched.imageUrl && Boolean(formik.errors.imageUrl)}
          helperText={formik.touched.imageUrl && formik.errors.imageUrl}
          onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
            formik.handleBlur(event);
          }}
        />

        <FieldArray
          name="rubricks"
          render={(arrayHelpers: any) => (
            <div>
              {formik.values.rubricks.map((rubrick, index) => (
                <div key={index}>
                  {/** both these conventions do the same */}
                  <Field name={`promt`} />
                  <button type="button" onClick={() => arrayHelpers.remove(index)}>
                    -
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => arrayHelpers.push(EMPTY_RUBRICK)}>
                +
              </button>
            </div>
          )}
        />

        {/* <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <LoadingButton type="submit" color="primary" variant="contained" loading={isLoading}>
            Submit
            <ArrowForwardIcon sx={{ ml: "10px" }} />
          </LoadingButton>
        </Box> */}
      </Stack>
    </Box>
  );
};
