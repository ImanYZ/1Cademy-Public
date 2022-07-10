import { Box, Button, Step, StepLabel, Stepper } from "@mui/material";
import { Formik, FormikErrors, FormikHelpers } from "formik";
import React, { useState } from "react";

import { RE_EMAIL } from "@/lib/utils/constants";

import { signUp } from "../lib/firestoreClient/auth";
import { SignUpBasicInfo } from "./SignUpBasicInfo";
import { SignUpPersonalInfo } from "./SignUpPersonalInfo";
import { SignUpProfessionalInfo } from "./SignUpProfessionalInfo";

export interface SignUpFormValues {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  passwordConfirmation: string;
  // -----------------------
  language: string;
  age: string;
  gender: string;
  ethnicity: string;
  country: string;
  state: string;
  city: string;
  reason: string;
  foundFrom: string;
  // -----------------------
  occupation: string;
  education: string;
  institution: string;
  major: string;
  fieldOfInterest: string;
}

export const SignUpForm = () => {
  const steps = ["Account", "Personal", "Education"];

  const [activeStep, setActiveStep] = useState(0);

  const initialValues: SignUpFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    passwordConfirmation: "",
    language: "",
    age: "",
    gender: "",
    ethnicity: "",
    country: "",
    state: "",
    city: "",
    reason: "",
    foundFrom: "",
    occupation: "",
    education: "",
    institution: "",
    major: "",
    fieldOfInterest: ""
  };

  const validate = (values: SignUpFormValues) => {
    let errors: FormikErrors<SignUpFormValues> = {};
    if (!values.email) errors.email = "Required";
    if (values.email && !RE_EMAIL.test(values.email)) errors.email = "Invalid email address";
    if (!values.password) errors.password = "Required";
    return errors;
  };
  const onSubmit = async (values: SignUpFormValues, { setSubmitting }: FormikHelpers<SignUpFormValues>) => {
    console.log("values sing up", values);
    // const res = await signIn(values.email, values.password)
    await signUp(values.username, values.email, values.password);
    // console.log('res', res)
    setSubmitting(false);
  };

  const onPrevioustStep = () => {
    if (activeStep < 1) return;
    setActiveStep(step => step - 1);
  };

  const onNextStep = () => {
    if (activeStep > steps.length - 2) return;
    setActiveStep(step => step + 1);
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mt: "26px", mb: "46px", mx: "19px" }}>
        {steps.map(label => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: { optional?: React.ReactNode } = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <Formik initialValues={initialValues} validate={validate} onSubmit={onSubmit}>
        {formikProps => {
          const { values, handleSubmit, isSubmitting } = formikProps;
          return (
            <form onSubmit={handleSubmit}>
              <Button onClick={() => console.log(values)}>Get VALUES</Button>
              {activeStep === 0 && <SignUpBasicInfo formikProps={formikProps} />}
              {activeStep === 1 && <SignUpPersonalInfo formikProps={formikProps} />}
              {activeStep === 2 && <SignUpProfessionalInfo formikProps={formikProps} />}

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button disabled={isSubmitting} variant="contained" onClick={onPrevioustStep}>
                  Prev
                </Button>
                <Button disabled={isSubmitting} variant="contained" onClick={onNextStep}>
                  Next
                </Button>
              </Box>
            </form>
          );
        }}
      </Formik>
    </Box>
  );
};
