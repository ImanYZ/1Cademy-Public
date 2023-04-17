import { Button, Stack, TextField } from "@mui/material";
import { FirebaseError } from "firebase/app";
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { FormikConfig, useFormik } from "formik";
import Link from "next/link";
import React from "react";
import * as yup from "yup";

// import { useAuth } from "@/context/AuthContext";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { getFirebaseFriendlyError } from "@/lib/utils/firebaseErrors";
import ROUTES from "@/lib/utils/routes";
type ResetPasswordProps = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ResetPasswordForm = () => {
  // const [, { handleError }] = useAuth();
  const initialPasswordValue: ResetPasswordProps = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const onSubmitChangePassword: FormikConfig<ResetPasswordProps>["onSubmit"] = async (
    { currentPassword, newPassword, confirmPassword },
    { setErrors }
  ) => {
    try {
      const { currentUser } = getAuth();
      if (!currentUser || !currentUser.email) return;
      if (newPassword !== confirmPassword) return;

      const credential = EmailAuthProvider.credential(currentUser?.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
    } catch (error) {
      const errorMessage = getFirebaseFriendlyError(error as FirebaseError);
      setErrors({ currentPassword: errorMessage });
      console.error(error);
      return;
    }
  };

  const validationSchema = yup.object({
    newPassword: yup.string().min(8, "New password must be at least 8 characters long").required(""),
    confirmPassword: yup
      .string()
      .required("Confirm password is required")
      .oneOf([yup.ref("newPassword"), null], "Both Password must match"),
  });

  const formik = useFormik({ initialValues: initialPasswordValue, validationSchema, onSubmit: onSubmitChangePassword });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack>
        <TextField
          id="Your current password"
          name="currentPassword"
          label="Your current password"
          type="password"
          value={formik.values.currentPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(formik.errors.currentPassword) && Boolean(formik.touched.currentPassword)}
          helperText={formik.errors.currentPassword}
          fullWidth
        />
        <Link href={ROUTES.forgotpassword} passHref>
          <Button sx={{ my: "4px", alignSelf: "flex-end" }}>Forgot Password?</Button>
        </Link>
      </Stack>
      <TextField
        id="new-password"
        name="newPassword"
        label="At least 8 characters"
        type="password"
        value={formik.values.newPassword}
        onChange={formik.handleChange}
        error={Boolean(formik.errors.newPassword) && Boolean(formik.touched.newPassword)}
        helperText={formik.errors.newPassword}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <TextField
        id="confirm-password"
        name="confirmPassword"
        label="Confirm the password"
        type="password"
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        error={Boolean(formik.errors.confirmPassword) && Boolean(formik.touched.confirmPassword)}
        helperText={formik.errors.confirmPassword}
        fullWidth
      />
      <Button
        variant="contained"
        fullWidth
        type="submit"
        sx={{
          backgroundColor: DESIGN_SYSTEM_COLORS.primary800,
          borderRadius: "32px",
          mt: "24px",
          py: "10px",
        }}
      >
        Update Password
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
