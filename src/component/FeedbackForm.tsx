import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Button, Stack, SxProps, TextField, Theme, Typography } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import { useFormik } from "formik";
import React, { forwardRef, useMemo } from "react";
import { useMutation } from "react-query";
import { getDesignTokens, getThemedComponents } from "src/brandingTheme";
import * as yup from "yup";

import { sendFeedback } from "../lib/knowledgeApi";

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

const validationSchema = yup.object({
  email: yup.string().email("Enter a valid email").required("Required"),
  name: yup.string().required("Required"),
  feedback: yup.string().required("Required")
});

const FeedbackForm = forwardRef<Ref, FeedbackProps>(({ onSuccessFeedback, sx }, ref) => {
  const sendFeedbackMutation = useMutation(sendFeedback, {
    onSuccess: () => {
      localStorage.setItem("feedbackName", "");
      localStorage.setItem("feedbackEmail", "");
      localStorage.setItem("feedbackFeedback", "");
    }
  });
  const theme = useMemo(() => {
    const brandingDesignTokens = getDesignTokens("dark");
    let nextTheme = createTheme({
      ...brandingDesignTokens,
      palette: {
        ...brandingDesignTokens.palette,
        mode: "dark"
      }
    });

    nextTheme = deepmerge(nextTheme, getThemedComponents());
    return nextTheme;
  }, []);

  const initialValues: FeedbackFormValues = {
    name: localStorage.getItem("feedbackName") || "",
    email: localStorage.getItem("feedbackEmail") || "",
    feedback: localStorage.getItem("feedbackFeedback") || ""
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: values => {
      sendFeedbackMutation.mutate({ ...values, pageURL: window.location.href });
    }
  });

  return (
    <ThemeProvider theme={theme}>
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
        {sendFeedbackMutation.isSuccess && (
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
            <Button onClick={onSuccessFeedback} color="success" variant="contained" fullWidth>
              Thank you
              <CheckIcon sx={{ ml: "10px" }} />
            </Button>
          </>
        )}
        {!sendFeedbackMutation.isSuccess && (
          <>
            <Typography variant="h5" sx={{ color: theme => theme.palette.common.orange }}>
              Share Your Question/Feedback
            </Typography>
            <Typography component="p" sx={{ color: theme => theme.palette.common.white }}>
              Hi, thank you for using our website :)
              <br />
              We’d love to hear your feedback and comments on anything on this website!
            </Typography>

            <Stack component="form" onSubmit={formik.handleSubmit} direction="column" spacing={5} mt={2}>
              <TextField
                label="Email"
                id="email"
                name="email"
                fullWidth
                onChange={formik.handleChange}
                value={formik.values.email}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                  localStorage.setItem("feedbackEmail", event.target.value);
                  formik.handleBlur(event);
                }}
              />
              <TextField
                label="Name"
                id="name"
                name="name"
                fullWidth
                onChange={formik.handleChange}
                value={formik.values.name}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                  localStorage.setItem("feedbackName", event.target.value);
                  formik.handleBlur(event);
                }}
              />
              <TextField
                label="Your Feedback"
                id="feedback"
                name="feedback"
                fullWidth
                onChange={formik.handleChange}
                value={formik.values.feedback}
                error={formik.touched.feedback && Boolean(formik.errors.feedback)}
                helperText={formik.touched.feedback && formik.errors.feedback}
                rows={3}
                multiline
                onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                  localStorage.setItem("feedbackFeedback", event.target.value);
                  formik.handleBlur(event);
                }}
              />

              <LoadingButton
                type="submit"
                color="primary"
                variant="contained"
                fullWidth
                loading={sendFeedbackMutation.isLoading}
              >
                Submit
                <ArrowForwardIcon sx={{ ml: "10px" }} />
              </LoadingButton>
            </Stack>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
});

FeedbackForm.displayName = "Feedback";

export default FeedbackForm;
