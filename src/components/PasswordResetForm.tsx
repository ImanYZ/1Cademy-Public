import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { LoadingButton } from "@mui/lab";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import { FirebaseError } from "firebase/app";
import { confirmPasswordReset, getAuth } from "firebase/auth";
import { useFormik } from "formik";
import NextLink from "next/link";
import { FC, useState } from "react";
import * as yup from "yup";

import { getFirebaseFriendlyError } from "@/lib/utils/firebaseErrors";
import ROUTES from "@/lib/utils/routes";

type Props = {
  email: string;
  actionCode: string;
};

const validationSchema = yup.object({
  password: yup.string().required("Required")
  //   password: yup.string().min(6, "Must be at least 6 characters long").required("Required")
});

const initialValues = {
  password: ""
};

const PasswordResetForm: FC<Props> = ({ email, actionCode }) => {
  const [isResetingPassword, setIsRessetingPassword] = useState(false);
  const [passwordRessetedSuccess, setPasswordRessetedSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: values => {
      handleSubmitResetPassord(values.password);
    }
  });

  const handleSubmitResetPassord = async (newPassword: string) => {
    try {
      setIsRessetingPassword(true);
      await confirmPasswordReset(getAuth(), actionCode, newPassword);
      setPasswordRessetedSuccess(true);
    } catch (error) {
      const err = error as FirebaseError;
      const errorString = getFirebaseFriendlyError(err);
      formik.setErrors({ password: errorString });
      setIsRessetingPassword(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(val => !val);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  if (passwordRessetedSuccess) {
    return (
      <Card>
        <CardHeader sx={{ textAlign: "center" }} title="Password changed" />
        <CardContent sx={{ textAlign: "center", mb: 5 }}>
          <Box sx={{ mb: 5 }}>You can now sign in with your new password</Box>
          <NextLink href={ROUTES.signIn} passHref>
            <Link>Go to sign in page</Link>
          </NextLink>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Reset your password" />
      <CardContent sx={{ mb: 5 }}>
        <Box>
          for <strong>{email}</strong>
        </Box>
        <Stack component="form" sx={{ mt: 5 }} spacing={5} onSubmit={formik.handleSubmit}>
          <FormControl variant="outlined" error={formik.touched.password && Boolean(formik.errors.password)}>
            <InputLabel htmlFor="password">New Password</InputLabel>
            <OutlinedInput
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="New Password"
            />
            <FormHelperText error={formik.touched.password}>{formik.errors.password}</FormHelperText>
          </FormControl>

          <LoadingButton type="submit" variant="contained" loading={isResetingPassword}>
            Save
          </LoadingButton>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PasswordResetForm;
