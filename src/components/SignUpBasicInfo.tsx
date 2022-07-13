import { TextField } from "@mui/material";
import { FormikProps } from "formik";
import React from "react";

import { SignUpFormValues } from "../pages/signup";

export type SignUpBasicInformationProps = {
  formikProps: FormikProps<SignUpFormValues>;
};

export const SignUpBasicInfo = ({ formikProps }: SignUpBasicInformationProps) => {
  const { values, errors, touched, handleChange, handleBlur } = formikProps;
  return (
    <>
      <TextField
        id="firstName"
        name="firstName"
        label="First Name"
        value={values.firstName}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        error={Boolean(errors.firstName) && Boolean(touched.firstName)}
        helperText={errors.firstName}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <TextField
        id="lastName"
        name="lastName"
        label="Last Name"
        value={values.lastName}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        error={Boolean(errors.lastName) && Boolean(touched.lastName)}
        helperText={errors.lastName}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <TextField
        id="email"
        name="email"
        label="Email"
        type="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        error={Boolean(errors.email) && Boolean(touched.email)}
        helperText={errors.email}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <TextField
        id="username"
        name="username"
        label="Username"
        value={values.username}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        error={Boolean(errors.username) && Boolean(touched.username)}
        helperText={errors.username}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <TextField
        id="password"
        name="password"
        label="Password"
        type="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        error={Boolean(errors.password) && Boolean(touched.password)}
        helperText={errors.password}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <TextField
        id="passwordConfirmation"
        name="passwordConfirmation"
        label="Re-enter Password"
        type="password"
        value={values.passwordConfirmation}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        error={Boolean(errors.passwordConfirmation) && Boolean(touched.passwordConfirmation)}
        helperText={errors.passwordConfirmation}
        fullWidth
        sx={{ mb: "16px" }}
      />
    </>
  );
};
