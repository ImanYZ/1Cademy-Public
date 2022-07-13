import { Box, Button, TextField, Typography } from "@mui/material";
import { FormikHelpers, useFormik } from "formik";
import React, { ReactNode } from "react";
import * as yup from "yup";

import { signIn } from "@/lib/firestoreClient/auth";

import { AuthLayout } from "../components/layouts/AuthLayout";

interface SignInFormValues {
  email: string;
  password: string;
}

const SignIn = () => {
  const initialValues: SignInFormValues = {
    email: "",
    password: ""
  };

  const validationSchema = yup.object({
    email: yup.string().email("Enter a valid email").required("Required"),
    password: yup.string().required("Required")
  });

  const onSubmit = async (values: SignInFormValues, { setSubmitting }: FormikHelpers<SignInFormValues>) => {
    // await sendFeedback({ ...values, pageURL: url });
    // setSuccessFeedback(true);
    console.log("values", values);
    const res = await signIn(values.email, values.password);
    console.log("res", res);
    setSubmitting(false);
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit });

  return (
    <Box sx={{ my: "92px" }}>
      <Typography variant="h5" color={"white"} sx={{ mb: "40px" }}>
        You can follow/pin nodes and earn points after logging in
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          variant="outlined"
          error={Boolean(formik.errors.email) && Boolean(formik.touched.email)}
          helperText={formik.errors.email}
          fullWidth
          sx={{ mb: "16px" }}
        />
        <TextField
          id="password"
          name="password"
          label="Password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          variant="outlined"
          error={Boolean(formik.errors.password) && Boolean(formik.touched.password)}
          helperText={formik.errors.password}
          fullWidth
        />

        <Button type="button" sx={{ my: "40px" }}>
          Forgot Password?
        </Button>
        <Button disabled={formik.isSubmitting} type="submit" variant="contained" fullWidth>
          LOG IN
        </Button>
        {/* <LoadingButton type="submit" color="primary" variant="contained" fullWidth loading={isSubmitting}>
              Submit
            </LoadingButton> */}
        {/* <ArrowForwardIcon sx={{ ml: "10px" }} /> */}
      </form>
    </Box>
  );
};

SignIn.getLayout = (page: ReactNode) => {
  return <AuthLayout>{page}</AuthLayout>;
};

export default SignIn;
