import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  alpha,
  Box,
  Button,
  FormControl,
  InputBase,
  InputLabel,
  styled,
  SxProps,
  Theme,
  Typography
} from "@mui/material";
import { red } from "@mui/material/colors";
import { Formik, FormikErrors, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import React, { forwardRef, useEffect, useState } from "react";

import { sendFeedback } from "../lib/knowledgeApi";

const RE_EMAIL =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/im;

interface FeedbackFormValues {
  email: string;
  name: string;
  feedback: string;
}

type Ref = {
  viewState: HTMLElement;
};

interface FeedbackProps {
  onSuccessFeedback: () => void;
  sx?: SxProps<Theme>;
}

export const Feedback = forwardRef<Ref, FeedbackProps>(({ onSuccessFeedback, sx }, ref) => {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [successFeedback, setSuccessFeedback] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, [router]);

  const saveFeedbackInLocalStorage = (values: FeedbackFormValues) => {
    localStorage.setItem("feedbackName", values.name);
    localStorage.setItem("feedbackEmail", values.email);
    localStorage.setItem("feedbackFeedback", values.feedback);
  };

  const initialValues: FeedbackFormValues = {
    name: localStorage.getItem("feedbackName") || "",
    email: localStorage.getItem("feedbackEmail") || "",
    feedback: localStorage.getItem("feedbackFeedback") || ""
  };

  const validate = (values: FeedbackFormValues) => {
    saveFeedbackInLocalStorage(values);
    let errors: FormikErrors<FeedbackFormValues> = {};
    if (!values.email) {
      errors.email = "Required";
    }
    if (values.email && !RE_EMAIL.test(values.email)) {
      errors.email = "Invalid email address";
    }
    if (!values.name) {
      errors.name = "Required";
    }
    if (!values.feedback) {
      errors.feedback = "Required";
    }
    return errors;
  };
  const onSubmit = async (values: FeedbackFormValues, { setSubmitting }: FormikHelpers<FeedbackFormValues>) => {
    await sendFeedback({ ...values, pageURL: url });
    setSuccessFeedback(true);
    setSubmitting(false);
  };

  const getErrorMessage = (error?: string, touched?: boolean) => (
    <Typography component="span" sx={{ color: red[500], pl: "10px" }}>
      {error && touched && error}
    </Typography>
  );

  const onThankYou = () => {
    onSuccessFeedback();
    localStorage.setItem("feedbackName", "");
    localStorage.setItem("feedbackEmail", "");
    localStorage.setItem("feedbackFeedback", "");
  };

  const SuccessFeedback = () => {
    return (
      <>
        <Typography variant="h5" sx={{ color: theme => theme.palette.common.orange }}>
          Share Your Question/Feedback
        </Typography>
        <Box textAlign="center" sx={{ width: "240px", margin: "auto" }}>
          <CheckCircleOutlineIcon sx={{ color: theme => theme.palette.common.orange, fontSize: "80px" }} />
          <Typography
            variant="body1"
            component="p"
            textAlign="center"
            sx={{ color: theme => theme.palette.common.white }}
          >
            We have received your feedback. Thank you!
          </Typography>
        </Box>
        <Button onClick={onThankYou} color="success" variant="contained" fullWidth>
          Thank you
          <CheckIcon sx={{ ml: "10px" }} />
        </Button>
      </>
    );
  };

  const FormFeedback = () => {
    return (
      <>
        <Typography variant="h5" sx={{ color: theme => theme.palette.common.orange }}>
          Share Your Question/Feedback
        </Typography>
        <Typography component="p" sx={{ color: theme => theme.palette.common.white }}>
          Hi, thank you for using our website :)
          <br />
          We’d love to hear your feedback and comments on anything on this website!
        </Typography>
        <Formik initialValues={initialValues} validate={validate} onSubmit={onSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <form onSubmit={handleSubmit}>
              <FormControl variant="standard" fullWidth sx={{ mb: "20px" }}>
                <InputLabel shrink htmlFor="email-input" sx={{ color: theme => theme.palette.common.white }}>
                  Email* {getErrorMessage(errors.email, touched.email)}
                </InputLabel>
                <CustomInput
                  id="email-input"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.email) && Boolean(touched.email)}
                />
              </FormControl>

              <FormControl variant="standard" fullWidth sx={{ mb: "20px" }}>
                <InputLabel shrink htmlFor="name-input" sx={{ color: theme => theme.palette.common.white }}>
                  Name* {getErrorMessage(errors.name, touched.name)}
                </InputLabel>
                <CustomInput
                  id="name-input"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.name) && Boolean(touched.name)}
                />
              </FormControl>

              <FormControl variant="standard" fullWidth sx={{ mb: "20px" }}>
                <InputLabel shrink htmlFor="feedback-input" sx={{ color: theme => theme.palette.common.white }}>
                  Your Feedback* {getErrorMessage(errors.feedback, touched.feedback)}
                </InputLabel>
                <CustomInput
                  id="feedback-input"
                  name="feedback"
                  value={values.feedback}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={3}
                  multiline
                  error={Boolean(errors.feedback) && Boolean(touched.feedback)}
                />
              </FormControl>
              <LoadingButton type="submit" color="primary" variant="contained" fullWidth loading={isSubmitting}>
                Submit
                <ArrowForwardIcon sx={{ ml: "10px" }} />
              </LoadingButton>
            </form>
          )}
        </Formik>
      </>
    );
  };

  return (
    <Box
      ref={ref}
      sx={{
        width: "100%",
        height: "545px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        ...sx
      }}
    >
      {successFeedback ? <SuccessFeedback /> : <FormFeedback />}
    </Box>
  );
});

Feedback.displayName = "Feedback";

const CustomInput = styled(InputBase)<{ error: boolean }>(({ theme, error }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
    color: theme.palette.common.white
  },
  "& .MuiInputBase-input": {
    borderRadius: 4,
    position: "relative",
    backgroundColor: error ? "#FF000080" : "#515153",
    border: "solid 1px",
    borderColor: error ? "#FF0000" : "#515153",
    fontSize: 16,
    width: "100%",
    padding: "10px 12px",
    transition: theme.transitions.create(["border-color", "background-color", "box-shadow"]),
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(","),
    "&:focus": {
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.primary.main
    }
  }
}));
