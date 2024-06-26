import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { LoadingButton } from "@mui/lab";
import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import { FirebaseError } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { useFormik } from "formik";
import NextLink from "next/link";
import React, { ReactNode, useState } from "react";
import { NextPageWithLayout } from "src/knowledgeTypes";
import * as yup from "yup";

import AuthLayout from "@/components/layouts/AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { signIn } from "@/lib/firestoreClient/auth";
import { Post } from "@/lib/mapApi";
import { getFirebaseFriendlyError } from "@/lib/utils/firebaseErrors";
import ROUTES from "@/lib/utils/routes";
interface SignInFormValues {
  email: string;
  password: string;
}

const SignInPage: NextPageWithLayout = () => {
  const [, { handleError }] = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailToken, setEmailToken] = useState("");

  const initialValues: SignInFormValues = {
    email: "",
    password: "",
  };

  const validationSchema = yup.object({
    email: yup
      .string()
      .email("Invalid email address!")
      .required("Your email address provided by your academic/research institutions is required!"),
    password: yup.string().required("A secure password is required!"),
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

  const loginWithToken = async () => {
    const { customToken }: any = await Post("/getCostumToken", { emailORuname: emailToken });
    if (customToken) {
      await signInWithCustomToken(getAuth(), customToken);
    }
  };
  return (
    <Box sx={{ p: { xs: "8px", md: "24px", width: "100%" }, my: "92px" }}>
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
          type={showPassword ? "text" : "password"}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          variant="outlined"
          error={Boolean(formik.errors.password) && Boolean(formik.touched.password)}
          helperText={formik.errors.password}
          fullWidth
          InputProps={{
            sx: {
              color: "white",
            },
            endAdornment: (
              <InputAdornment position="end">
                {formik.values.password.trim() ? (
                  !showPassword ? (
                    <VisibilityOffIcon
                      onClick={() => {
                        setShowPassword(prev => !prev);
                      }}
                      sx={{
                        cursor: "pointer",
                        color: "white",
                        fontSize: "20px",
                      }}
                    />
                  ) : (
                    <VisibilityIcon
                      onClick={() => {
                        setShowPassword(prev => !prev);
                      }}
                      sx={{
                        cursor: "pointer",
                        color: "white",
                        fontSize: "20px",
                      }}
                    />
                  )
                ) : (
                  <></>
                )}
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", my: "32px" }}>
          <LoadingButton
            aria-label="submit"
            loading={isLoading}
            disabled={formik.isSubmitting}
            type="submit"
            variant="contained"
            fullWidth
            sx={{ borderRadius: "26px", width: "90px" }}
          >
            LOG IN
          </LoadingButton>
          <NextLink href={ROUTES.forgotpassword} passHref>
            <Button sx={{ my: "20px" }}>Forgot Password?</Button>
          </NextLink>
        </Box>
        {/* 
        this should only be visible in the local host */}
        {process.env.NODE_ENV === "development" && (
          <Box>
            <TextField
              value={emailToken}
              onChange={e => {
                setEmailToken(e.target.value);
              }}
            />
            <Button
              aria-label="submit"
              type="submit"
              variant="contained"
              fullWidth
              sx={{ borderRadius: "26px", width: "90px", ml: "15px" }}
              onClick={loginWithToken}
            >
              LOG IN
            </Button>
          </Box>
        )}
        {/* 
        this should only be visible in the local host */}
      </form>
    </Box>
  );
};

SignInPage.getLayout = (page: ReactNode) => {
  return <AuthLayout>{page}</AuthLayout>;
};

export default SignInPage;
