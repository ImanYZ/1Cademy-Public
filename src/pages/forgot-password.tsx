import { LoadingButton } from "@mui/lab";
import { Box, Card, CardContent, CardHeader, Container, Link, Stack, TextField } from "@mui/material";
import { FirebaseError } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useFormik } from "formik";
import { NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { useState } from "react";
import * as yup from "yup";

import LibraryFullBackgroundLayout from "@/components/layouts/LibraryBackgroundLayout";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseFriendlyError } from "@/lib/utils/firebaseErrors";
import ROUTES from "@/lib/utils/routes";

const validationSchema = yup.object({
  email: yup.string().email("Enter a valid email").required("Required")
});

const initialValues = {
  email: ""
};

const ForgotPasswordPage: NextPage = () => {
  const [, { handleError }] = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const handleResetPassword = async ({ email }: { email: string }) => {
    try {
      setIsLoading(true);
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      enqueueSnackbar("We have sent a reset link to your email address.", {
        variant: "info",
        autoHideDuration: 8000
      });
      router.replace(ROUTES.signIn);
    } catch (error) {
      const err = error as FirebaseError;
      const errorStrig = getFirebaseFriendlyError(err);
      handleError({ error, errorMessage: `${errorStrig} Check if your email address is correct. ` });
    }
    setIsLoading(false);
  };
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: values => {
      handleResetPassword(values);
    }
  });

  return (
    <LibraryFullBackgroundLayout>
      <Container
        maxWidth="sm"
        sx={{
          py: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Card>
          <CardHeader title="Forgot Password?" />
          <CardContent sx={{ mb: 4 }}>
            <Box>Enter your account email below and we'll send you a password reset link</Box>
            <Stack onSubmit={formik.handleSubmit} sx={{ my: 6 }} component="form" spacing={5}>
              <TextField
                label="Email"
                id="email"
                name="email"
                fullWidth
                onChange={formik.handleChange}
                value={formik.values.email}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              ></TextField>
              <LoadingButton loading={isLoading} type="submit" fullWidth variant="contained">
                Reset
              </LoadingButton>
            </Stack>
            <NextLink href={ROUTES.signIn} passHref>
              <Link>Sign in</Link>
            </NextLink>
          </CardContent>
        </Card>
      </Container>
    </LibraryFullBackgroundLayout>
  );
};

export default ForgotPasswordPage;
