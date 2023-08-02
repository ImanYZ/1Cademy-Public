import AddIcon from "@mui/icons-material/Add";
import ImageIcon from "@mui/icons-material/Image";
import { Box, Divider, Stack, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Formik, FormikHelpers } from "formik";
import React, { useCallback, useEffect, useRef, useState /* , { useState } */ } from "react";
import {
  addQuestion,
  AddQuestionInput,
  getQuestionSnapshot,
  Question,
  QuestionChanges,
} from "src/client/firestore/questions.firestore";
import * as yup from "yup";

import { useUploadImage } from "@/hooks/useUploadImage";
import { isValidHttpUrl } from "@/lib/utils/utils";

import { CustomButton } from "../Buttons/Buttons";
import { QuestionItem } from "./QuestionItem";
import { RubricsEditor } from "./RubricsEditor";

dayjs.extend(relativeTime);

type AssignmentsProps = { username: string };

type QuestionForm = Omit<AddQuestionInput, "user">;

const INITIAL_VALUES: QuestionForm = {
  title: "",
  description: "",
  imageUrl: "",
  rubrics: [],
};

// const EMPTY_RUBRIC: Rubrics = { prompt: "", upvotes: 0, downvotes: 0 };

export const Assignments = ({ username }: AssignmentsProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [displayQuestionForm, setDisplayQuestionForm] = useState<boolean>(false);

  const db = getFirestore();

  const validationSchema = yup.object({
    title: yup.string().required("Required"),
    description: yup.string().required("Required"),
    imageUrl: yup.string(),
    rubrics: yup.array(yup.object({ prompt: yup.string().required() })),
  });
  const onToggleQuestionForm = () => setDisplayQuestionForm(prev => !prev);

  const onSubmit = async (values: QuestionForm, { setSubmitting, setTouched }: FormikHelpers<QuestionForm>) => {
    setSubmitting(true);
    setTouched({
      title: true,
      description: true,
    });
    await addQuestion(db, { ...values, user: username });
    setSubmitting(false);
    setDisplayQuestionForm(false);
  };

  const syncQuestions = (questionChanges: QuestionChanges[]) => {
    setQuestions(prev => {
      const tt = questionChanges.reduce((acu: Question[], cur) => {
        if (cur.type === "added") return [...acu, cur.data];
        if (cur.type === "modified") return acu.map(c => (c.id === cur.data.id ? cur.data : c));
        if (cur.type === "removed") return acu.filter(c => c.id !== cur.data.id);
        return acu;
      }, prev);
      setSelectedQuestion(prev => (prev ? tt.find(c => c.id === prev.id) ?? null : null));
      return tt;
    });
  };

  useEffect(() => {
    getQuestionSnapshot(db, { username }, syncQuestions);
  }, [db, username]);

  if (selectedQuestion) {
    return (
      <RubricsEditor
        question={selectedQuestion}
        onReturnToQuestions={() => setSelectedQuestion(null)}
        onSetQuestions={setSelectedQuestion}
      />
    );
  }

  return (
    <Box sx={{ px: { xs: "10px", md: "20px" }, py: "10px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h1">Questions</Typography>
        <CustomButton variant="contained" onClick={onToggleQuestionForm}>
          {displayQuestionForm ? (
            "Show Questions"
          ) : (
            <>
              {"Add Question"} <AddIcon />
            </>
          )}
        </CustomButton>
      </Box>

      <Divider sx={{ my: "12px" }} />

      {!displayQuestionForm && (
        <Stack spacing={"16px"}>
          {questions.map(cur => (
            <QuestionItem key={cur.id} question={cur} onSelectQuestion={setSelectedQuestion} />
          ))}
        </Stack>
      )}

      {displayQuestionForm && (
        <Formik initialValues={INITIAL_VALUES} validationSchema={validationSchema} onSubmit={onSubmit}>
          {formik => {
            return (
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
                <ImageInput
                  imageUrl={formik.values.imageUrl}
                  updateImageUrl={url => formik.setFieldValue("imageUrl", url)}
                />
                <CustomButton variant="contained" type="submit" disabled={formik.isSubmitting}>
                  {formik.isSubmitting ? "Saving ..." : "Save"}
                </CustomButton>
              </Stack>
            );
          }}
        </Formik>
      )}
    </Box>
  );
};

type ImageInputProps = {
  imageUrl: string;
  updateImageUrl: (url: string) => void;
};
const ImageInput = ({ updateImageUrl, imageUrl }: ImageInputProps) => {
  const storage = getStorage();
  const inputEl = useRef<HTMLInputElement>(null);
  const { isUploading, percentageUploaded, uploadImage } = useUploadImage({ storage });
  const uploadImageClicked = useCallback(() => {
    inputEl?.current?.click();
  }, [inputEl]);

  const onUploadImage = (event: any) => {
    let bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? "onecademy-dev.appspot.com";
    if (isValidHttpUrl(bucket)) {
      const { hostname } = new URL(bucket);
      bucket = hostname;
    }
    const path = "https://storage.googleapis.com/" + bucket + "/questions";
    let imageFileName = new Date().toUTCString();
    uploadImage({ event, path, imageFileName }).then(url => updateImageUrl(url));
  };

  return (
    <Box
      id={"question-image"}
      onClick={() => uploadImageClicked()}
      sx={{
        // background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
        color: "inherit",
        fontWeight: 400,
        // border: "solid 1px pink",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <>
        <input type="file" ref={inputEl} onChange={onUploadImage} hidden />

        {isUploading && (
          <span style={{ width: "100%", fontSize: "24px", textAlign: "center", padding: "12px" }}>
            {percentageUploaded + "%"}
          </span>
        )}

        {!isUploading && imageUrl && <img src={imageUrl} alt="question image" width={"100%"} />}
        {!isUploading && !imageUrl && (
          <Stack
            alignItems={"center"}
            justifyContent={"center"}
            sx={{
              p: "10px",
              borderRadius: "8px",
              ":hover": {
                background: (theme: any) =>
                  theme.palette.mode === "dark"
                    ? theme.palette.common.darkBackground2
                    : theme.palette.common.lightBackground2,
              },
            }}
          >
            <Typography>Choose an Image</Typography>
            <ImageIcon sx={{ fontSize: "32px" }} />
          </Stack>
        )}
      </>
    </Box>
  );
};
