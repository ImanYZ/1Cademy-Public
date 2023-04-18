import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  IconButton,
  InputAdornment,
  Snackbar,
  SnackbarContent,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { FirebaseError } from "firebase/app";
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { FormikConfig, useFormik } from "formik";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import * as yup from "yup";

// import { useAuth } from "@/context/AuthContext";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { getFirebaseFriendlyError } from "@/lib/utils/firebaseErrors";
import ROUTES from "@/lib/utils/routes";

import KeyGrayIcon from "../../public/icons/key-gray-icon.svg";
import KeyIcon from "../../public/icons/key-icon.svg";

type ResetPasswordProps = {
  currentPassword: string;
  showcurrentPassword: boolean;
  newPassword: string;
  showNewPassword: boolean;
  confirmPassword: string;
  showConfirmPassword: boolean;
};

const ResetPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const initialPasswordValue: ResetPasswordProps = {
    currentPassword: "",
    showcurrentPassword: false,
    newPassword: "",
    showNewPassword: false,
    confirmPassword: "",
    showConfirmPassword: false,
  };

  const onSubmitChangePassword: FormikConfig<ResetPasswordProps>["onSubmit"] = async (
    { currentPassword, newPassword, confirmPassword },
    { setErrors, resetForm, setStatus }
  ) => {
    try {
      setIsLoading(true);
      const { currentUser } = getAuth();
      if (!currentUser || !currentUser.email) return setErrors({ currentPassword: "Wrong password" });
      if (newPassword !== confirmPassword)
        return setErrors({ currentPassword: "Both paswords must match", confirmPassword: "Both paswords must match" });

      const credential = EmailAuthProvider.credential(currentUser?.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      resetForm();
      setStatus("Password was successfully updated");
      setIsLoading(false);
    } catch (error) {
      const errorMessage = getFirebaseFriendlyError(error as FirebaseError);
      setErrors({ currentPassword: errorMessage });
      setIsLoading(false);
      console.error(error);
      return;
    }
  };

  const validationSchema = yup.object({
    currentPassword: yup.string().required("Current password is required"),
    newPassword: yup
      .string()
      .min(8, "New password must be at least 8 characters long")
      .required("New password is required"),

    confirmPassword: yup.string().when("newPassword", {
      is: (value: string) => value && value.length > 0,
      then: yup
        .string()
        .required("Confirm password is required")
        .oneOf([yup.ref("newPassword"), null], "Both password must match"),
      otherwise: yup.string().min(8, "Confirm password must have at least 8 characters long"),
    }),
  });

  const formik = useFormik({
    initialValues: initialPasswordValue,
    validationSchema,
    onSubmit: onSubmitChangePassword,
    validateOnChange: true,
  });

  const handleClickShowPassword = (param: keyof ResetPasswordProps) => {
    const prevValue = formik.values[param];

    formik.setFieldValue(param, !prevValue);
  };
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack>
        {/* <CustomPasswordInput />
        <CustomPasswordInput /> */}
      </Stack>
      <Stack>
        <TextField
          id="currentPassword"
          name="currentPassword"
          label="Your current password"
          type={formik.values.showcurrentPassword ? "text" : "password"}
          value={formik.values.currentPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(formik.errors.currentPassword) && Boolean(formik.touched.currentPassword)}
          helperText={formik.errors.currentPassword}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => handleClickShowPassword("showcurrentPassword")}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {formik.values.showcurrentPassword ? (
                    <VisibilityOff color="primary" />
                  ) : (
                    <Visibility color="primary" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Link href={ROUTES.forgotpassword} passHref>
          <Button sx={{ my: "4px", alignSelf: "flex-end" }}>Forgot Password?</Button>
        </Link>
      </Stack>
      <TextField
        id="newPassword"
        name="newPassword"
        label="At least 8 characters"
        type={formik.values.showNewPassword ? "text" : "password"}
        value={formik.values.newPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
        helperText={formik.errors.newPassword}
        fullWidth
        autoComplete="new-password"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => handleClickShowPassword("showNewPassword")}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {formik.values.showNewPassword ? <VisibilityOff color="primary" /> : <Visibility color="primary" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: "16px" }}
      />
      <TextField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm the password"
        type={formik.values.showConfirmPassword ? "text" : "password"}
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={Boolean(formik.errors.confirmPassword) && Boolean(formik.touched.confirmPassword)}
        helperText={formik.errors.confirmPassword}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => handleClickShowPassword("showConfirmPassword")}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {formik.values.showConfirmPassword ? <VisibilityOff color="primary" /> : <Visibility color="primary" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <LoadingButton
        loading={isLoading}
        disabled={formik.isSubmitting}
        type="submit"
        variant="contained"
        fullWidth
        sx={{
          backgroundColor: DESIGN_SYSTEM_COLORS.primary800,
          borderRadius: "32px",
          mt: "24px",
          py: "10px",
        }}
      >
        Update Password
      </LoadingButton>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        open={Boolean(formik.status)}
        onClose={() => formik.setStatus(null)}
        sx={{
          "& 	.MuiSnackbarContent-action": {
            m: 0,
            mr: "16px",
            p: 0,
          },
        }}
      >
        <SnackbarContent
          elevation={1}
          action={
            <Image
              src={theme.palette.mode === "dark" ? KeyIcon : KeyGrayIcon}
              width={18}
              height={18}
              alt={"key icon"}
            />
          }
          message={formik.status}
          sx={{
            flexDirection: "row-reverse",
            justifyContent: "flex-end",
            backgroundColor: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray200,
            border: theme =>
              `1px solid ${
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray300
              }`,
            color: theme =>
              theme.palette.mode === "light" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray200,
            fontSize: "12px",
            borderRadius: "8px",
            p: "8px 22px",
          }}
        />
      </Snackbar>
    </form>
  );
};

export default ResetPasswordForm;
