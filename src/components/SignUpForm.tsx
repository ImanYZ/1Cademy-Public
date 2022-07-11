import { Box, Button, Step, StepLabel, Stepper } from "@mui/material";
import { FormikHelpers, useFormik } from "formik";
import React, { useState } from "react";
import * as yup from "yup";
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
  gender: string | null;
  genderOtherValue: string;
  ethnicity: string[];
  ethnicityOtherValue: string;
  country: string | null;
  state: string | null;
  city: string | null;
  reason: string;
  foundFrom: string | null;
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
    language: "English",
    age: "",
    gender: null,
    genderOtherValue: "",
    ethnicity: [],
    ethnicityOtherValue: '',
    country: null,
    state: null,
    city: null,
    reason: "",
    foundFrom: null,
    occupation: "",
    education: "",
    institution: "",
    major: "",
    fieldOfInterest: ""
  };

  const validationSchema = yup.object({
    firstName: yup.string().required('Required'),
    lastName: yup.string().required('Required'),
    email: yup.string().email('Enter a valid email').required('Required'),
    username: yup.string().required('Required'),
    password: yup.string().required('Required'),
    passwordConfirmation: yup.string().required('Required'),
    language: yup.string().required('Required'),
    age: yup.number().min(10, 'Age should be greater than or equal to 10').max(100, 'Age should be less than or equal to 100').required('Required'),
    gender: yup.string().required('Required'),
    genderOtherValue: yup.string(),
    ethnicity: yup.array().of(yup.string().required('Required')),
    ethnicityOtherValue: yup.string().required('Required'),
    country: yup.string().required('Required'),
    state: yup.string().required('Required'),
    city: yup.string().required('Required'),
    reason: yup.string().required('Required'),
    foundFrom: yup.string().required('Required'),
    occupation: yup.string().required('Required'),
    education: yup.string().required('Required'),
    institution: yup.string().required('Required'),
    major: yup.string().required('Required'),
    fieldOfInterest: yup.string().required('Required'),
  })

  const onSubmit = async (values: SignUpFormValues, { setSubmitting }: FormikHelpers<SignUpFormValues>) => {
    console.log("values sing up", values);
    // const res = await signIn(values.email, values.password)
    await signUp(values.username, values.email, values.password);
    // console.log('res', res)
    setSubmitting(false);
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit })

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

      return (
      <form onSubmit={formik.handleSubmit}>
        <Button onClick={() => console.log(formik.values)}>Get VALUES</Button>
        {activeStep === 0 && <SignUpBasicInfo formikProps={formik} />}
        {activeStep === 1 && <SignUpPersonalInfo formikProps={formik} />}
        {activeStep === 2 && <SignUpProfessionalInfo formikProps={formik} />}

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button disabled={formik.isSubmitting} variant="contained" onClick={onPrevioustStep}>
            Prev
          </Button>
          <Button disabled={formik.isSubmitting} variant="contained" onClick={onNextStep}>
            Next
          </Button>
        </Box>
      </form>
      );
    </Box>
  );
};
