import { LoadingButton } from "@mui/lab";
import { Box, Button, TextField, Typography } from "@mui/material";
import { FirebaseError } from "firebase/app";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import React, { ReactNode, useState } from "react";
import * as yup from "yup";

import { useAuth } from "@/context/AuthContext";
import { signIn } from "@/lib/firestoreClient/auth";

import { AuthLayout } from "../components/layouts/AuthLayout";
import ROUTES from "../lib/utils/routes";

interface SignInFormValues {
  email: string;
  password: string;
}

const SignIn = () => {
  const [, { handleError }] = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const initialValues: SignInFormValues = {
    email: "",
    password: ""
  };

  const validationSchema = yup.object({
    email: yup
      .string()
      .email("Invalid email address!")
      .required("Your email address provided by your academic/research institutions is required!"),
    password: yup.string().required("A secure password is required!")
  });
  const handleSignIn = async ({ email, password }: SignInFormValues) => {
    try {
      setIsLoading(true);
      await signIn(email, password);
      enqueueSnackbar("User authenticated", { variant: "success" });
      router.push(ROUTES.home);
    } catch (error) {
      setIsLoading(false);
      handleError({ error, errorMessage: (error as FirebaseError).message });
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit: handleSignIn });

  return (
    <Box sx={{ my: "92px" }}>
      <Typography variant="h5" color={"white"} sx={{ mb: "40px" }}>
        You can follow/pin nodes and earn points after logging in
      </Typography>
      <form data-testid="signin-form" onSubmit={formik.handleSubmit}>
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
        <LoadingButton
          aria-label="submit"
          loading={isLoading}
          disabled={formik.isSubmitting}
          type="submit"
          variant="contained"
          fullWidth
        >
          LOG IN
        </LoadingButton>
      </form>
    </Box>
  );
};

SignIn.getLayout = (page: ReactNode) => {
  return <AuthLayout>{page}</AuthLayout>;
};

export default SignIn;
