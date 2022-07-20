import { LoadingButton } from "@mui/lab";
import { Box, Button, TextField, Typography } from "@mui/material";
import { FirebaseError } from "firebase/app";
import { useFormik } from "formik";
import NextLink from "next/link";
import React, { ReactNode, useState } from "react";
import { NextPageWithLayout } from "src/knowledgeTypes";
import * as yup from "yup";

import AuthLayout from "@/components/layouts/AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { signIn } from "@/lib/firestoreClient/auth";
import { getFirebaseFriendlyError } from "@/lib/utils/firebaseErrors";
import ROUTES from "@/lib/utils/routes";

interface SignInFormValues {
  email: string;
  password: string;
}

const SignInPage: NextPageWithLayout = () => {
  const [, { handleError }] = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (error) {
      const errorMessage = getFirebaseFriendlyError(error as FirebaseError);
      setIsLoading(false);
      handleError({ error, errorMessage });
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit: handleSignIn });

  return (
    <Box sx={{ my: "92px" }}>
      <Typography variant="h1" sx={{ mb: "8px" }}>
        Log in
      </Typography>
      <Typography variant="body1" sx={{ mb: "32px" }}>
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
          sx={{ mb: "24px" }}
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
        <NextLink href={ROUTES.forgotpassword} passHref>
          <Button sx={{ my: "32px" }}>Forgot Password?</Button>
        </NextLink>
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

SignInPage.getLayout = (page: ReactNode) => {
  return <AuthLayout>{page}</AuthLayout>;
};

export default SignInPage;
