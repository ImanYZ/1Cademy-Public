import { LoadingButton } from "@mui/lab";
import { Box, Card, CardContent, CardHeader, Container, Stack, TextField } from "@mui/material";
import { FirebaseError } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useFormik } from "formik";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { ReactNode, useState } from "react";
import { NextPageWithLayout } from "src/knowledgeTypes";
import * as yup from "yup";

import AuthLayout from "@/components/layouts/AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseFriendlyError } from "@/lib/utils/firebaseErrors";
import ROUTES from "@/lib/utils/routes";

import libraryImage from "../../public/darkModeLibraryBackground.jpg";

const validationSchema = yup.object({
  email: yup.string().email("Enter a valid email").required("Required"),
});

const initialValues = {
  email: "",
};

const ForgotPasswordPage: NextPageWithLayout = () => {
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
        autoHideDuration: 8000,
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
    },
  });

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <Box
        data-testid="library-background-layout"
        sx={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          // filter: "brightness(0.25)",
          zIndex: -2,
        }}
      >
        <Image alt="Library" src={libraryImage} layout="fill" objectFit="cover" priority />
      </Box>
      <Container
        maxWidth="sm"
        sx={{
          py: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

ForgotPasswordPage.getLayout = (page: ReactNode) => {
  return <AuthLayout>{page}</AuthLayout>;
};

export default ForgotPasswordPage;
