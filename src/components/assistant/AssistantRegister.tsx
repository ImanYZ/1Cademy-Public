import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Button, Stack, SxProps, TextField, Theme, Typography } from "@mui/material";
import { collection, doc, getFirestore, setDoc } from "firebase/firestore";
import { useFormik } from "formik";
import React, { forwardRef, useState } from "react";
import * as yup from "yup";

interface FeedbackFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

type Ref = {
  viewState: HTMLElement;
};

interface FeedbackProps {
  onSuccessFeedback: () => void;
  sx?: SxProps<Theme>;
}

const validationSchema = yup.object({
  firstName: yup.string().required("Required"),
  lastName: yup.string().required("Required"),
  email: yup.string().email("Enter a valid email").required("Required"),
  phoneNumber: yup
    .string()
    .matches(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/)
    .required("Required"),
});

const AssistantForm = forwardRef<Ref, FeedbackProps>(({ onSuccessFeedback, sx }, ref) => {
  const db = getFirestore();

  const [isLoading, setIsLoading] = useState(false);
  const [registerWasComplete, setRegisterWasComplete] = useState(false);

  // const sendFeedbackMutation = useMutation(sendFeedback, {
  //   onSuccess: () => {
  //     localStorage.setItem("assistantRegisterName", "");
  //     localStorage.setItem("assistantRegisterEmail", "");
  //     localStorage.setItem("assistantRegisterPhoneNumber", "");
  //   },
  // });

  const initialValues: FeedbackFormValues = {
    firstName: localStorage.getItem("assistantRegisterFirstName") || "",
    lastName: localStorage.getItem("assistantRegisterLastName") || "",
    email: localStorage.getItem("assistantRegisterEmail") || "",
    phoneNumber: localStorage.getItem("assistantRegisterPhoneNumber") || "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async values => {
      try {
        // sendFeedbackMutation.mutate({ ...values, pageURL: window.location.href });
        const assistantRegisterRef = collection(db, "assistantRegister");
        setIsLoading(true);
        await setDoc(doc(assistantRegisterRef), {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phoneNumber: values.phoneNumber,
        });
        setIsLoading(false);
        setRegisterWasComplete(true);

        localStorage.setItem("assistantRegisterFirstName", "");
        localStorage.setItem("assistantRegisterLastName", "");
        localStorage.setItem("assistantRegisterEmail", "");
        localStorage.setItem("assistantRegisterPhoneNumber", "");
      } catch (err) {
        console.log(err);
      }
    },
  });

  return (
    // <ThemeProvider theme={brandingDarkTheme}>
    <Box
      ref={ref}
      sx={{
        width: "100%",
        // height: "545px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        ...sx,
      }}
    >
      {registerWasComplete && (
        <>
          <Typography variant="h5" textAlign={"center"} sx={{ color: theme => theme.palette.common.orange }}>
            Thank you for your interest in the 1Cademy Assistant!
          </Typography>
          <Box textAlign="center" sx={{ width: "80%", margin: "auto" }}>
            <CheckCircleOutlineIcon sx={{ color: theme => theme.palette.common.orange, fontSize: "80px" }} />
            <Typography
              variant="body1"
              component="p"
              textAlign="center"
              sx={{ color: theme => theme.palette.common.white }}
            >
              Our team will be in touch with you as soon as the 1Cademy Personal Assistant becomes available to use. We
              will email you with instructions on how to download and set up the assistant, as well as information about
              its features and capabilities.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button onClick={onSuccessFeedback} color="success" variant="contained">
              Thank you
              <CheckIcon sx={{ ml: "10px" }} />
            </Button>
          </Box>
        </>
      )}
      {!registerWasComplete && (
        <>
          <Typography variant="h5" sx={{ color: theme => theme.palette.common.orange }}>
            If you are interested in using the 1Cademy AI Assistant, please follow these instructions to sign up and be
            notified when the service becomes available:
          </Typography>
          <ol>
            <li>
              Fill out the form below with your personal information, including your name, email address, and phone
              number.
            </li>
            <li>
              In the "Interests" section, select the areas in which you would like to use the assistant, such as time
              management, study habits, personal development, etc.
            </li>
            <li>Click the "Submit" button to complete the form.</li>
          </ol>
          <Typography component="p" sx={{ color: theme => theme.palette.common.white }}>
            Once you have filled out the form, our team will be in touch with you as soon as the 1Cademy Personal
            Assistant becomes available to use. We will email you with instructions on how to set up the assistant, as
            well as information about its features and capabilities.
          </Typography>

          <Stack component="form" onSubmit={formik.handleSubmit} direction="column" spacing={5} my={2}>
            <TextField
              label="First Name"
              id="firstName"
              name="firstName"
              fullWidth
              onChange={formik.handleChange}
              value={formik.values.firstName}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
              onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                localStorage.setItem("assistantRegisterFirstName", event.target.value);
                formik.handleBlur(event);
              }}
            />
            <TextField
              label="Last Name"
              id="lastName"
              name="lastName"
              fullWidth
              onChange={formik.handleChange}
              value={formik.values.lastName}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
              onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                localStorage.setItem("assistantRegisterLastName", event.target.value);
                formik.handleBlur(event);
              }}
            />
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
                localStorage.setItem("assistantRegisterEmail", event.target.value);
                formik.handleBlur(event);
              }}
            />
            <TextField
              label="Your Phone Number"
              id="phoneNumber"
              name="phoneNumber"
              fullWidth
              onChange={formik.handleChange}
              value={formik.values.phoneNumber}
              error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
              helperText={formik.touched.phoneNumber && "Phone number is invalid write in this format XXX-XXX-XXXX"}
              // rows={3}
              // multiline
              onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                localStorage.setItem("assistantRegisterPhoneNumber", event.target.value);
                formik.handleBlur(event);
              }}
            />

            <LoadingButton type="submit" color="primary" variant="contained" fullWidth loading={isLoading}>
              Submit
              <ArrowForwardIcon sx={{ ml: "10px" }} />
            </LoadingButton>
          </Stack>

          <Typography component="p" sx={{ color: theme => theme.palette.common.white }}>
            Please make sure to provide correct and accurate information, as we will use this to contact you and send
            you updates.
          </Typography>
        </>
      )}
    </Box>
    // </ThemeProvider>
  );
});

AssistantForm.displayName = "Feedback";

export default AssistantForm;
