import { Box, Button, TextField, Typography } from "@mui/material";
import { FormikHelpers, useFormik } from "formik";
import { FC } from "react";
import * as yup from "yup";

interface SignInFormValues {
  email: string;
  password: string;
}

type Props = {
  onSignIn: (email: string, password: string) => void;
};

export const SignInForm: FC<Props> = ({ onSignIn }) => {
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
    onSignIn(values.email, values.password);

    // const res = await signIn(values.email, values.password);
    // await resetPassword("two@umich.edu");
    // const res = await signUp("hodacho", "hodacho@gmail.com", "Pa$$w0rd");
    // console.log("res", res);
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
