import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { FC } from "react";
import * as yup from "yup";

interface SignInFormValues {
  email: string;
  password: string;
}

type Props = {
  onSignIn: (email: string, password: string) => void;
  isLoading?: boolean;
};

export const SignInForm: FC<Props> = ({ onSignIn, isLoading }) => {
  const initialValues: SignInFormValues = {
    email: "",
    password: ""
  };

  const validationSchema = yup.object({
    email: yup.string().email("Enter a valid email").required("Required"),
    password: yup.string().required("Required")
  });

  const onSubmit = async (values: SignInFormValues) => {
    onSignIn(values.email, values.password);
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
          fullWidth
          sx={{ mb: "16px" }}
        />
        <TextField
          id="password"
          name="password"
          label="Password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          variant="outlined"
          error={Boolean(formik.errors.password) && Boolean(formik.touched.password)}
          fullWidth
        />

        <Button type="button" sx={{ my: "40px" }}>
          Forgot Password?
        </Button>
        <LoadingButton loading={isLoading} disabled={formik.isSubmitting} type="submit" variant="contained" fullWidth>
          LOG IN
        </LoadingButton>
      </form>
    </Box>
  );
};
