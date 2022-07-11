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
  foundFromOtherValue: string;
  // -----------------------
  occupation: string;
  education: string | null;
  institution: string;
  major: string;
  fieldOfInterest: string;
  signUpAgreement: boolean;
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
    foundFromOtherValue: "",
    occupation: "",
    education: null,
    institution: "",
    major: "",
    fieldOfInterest: "",
    signUpAgreement: false
  };

  const validationSchema = yup.object({
    firstName: yup.string().required('Required'),
    lastName: yup.string().required('Required'),
    email: yup.string().email('Enter a valid email').required('Required'),
    username: yup.string().required('Required'),
    password: yup.string().required('Required'),
    passwordConfirmation: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
    language: yup.string().required('Required'),
    age: yup.number().min(10, 'Age should be greater than or equal to 10').max(100, 'Age should be less than or equal to 100').required('Required'),
    gender: yup.string().required('Required'),
    genderOtherValue: yup.string().when('gender', {
      is: (genderValue: string) => genderValue === 'Not listed (Please specify)',
      then: yup.string().required('Required')
    }),
    ethnicity: yup.array().min(1).of(yup.string().required('Required')),
    ethnicityOtherValue: yup.string().when('ethnicity', {
      is: (ethnicityValue: string[]) => ethnicityValue.includes('Not listed (Please specify)'),
      then: yup.string().required('Required')
    }),
    country: yup.string().required('Required'),
    state: yup.string().required('Required'),
    city: yup.string().required('Required'),
    reason: yup.string().required('Required'),
    foundFrom: yup.string().required('Required'),
    foundFromOtherValue: yup.string().when('foundFrom', {
      is: (foundFromValue: string) => foundFromValue === 'Not listed (Please specify)',
      then: yup.string().required('Required')
    }),
    occupation: yup.string().required('Required'),
    education: yup.string().required('Required'),
    institution: yup.string().required('Required'),
    major: yup.string().required('Required'),
    fieldOfInterest: yup.string().required('Required'),
    signUpAgreement: yup.boolean().isTrue(),
  })

  const onSubmit = async (values: SignUpFormValues, { setSubmitting }: FormikHelpers<SignUpFormValues>) => {
    console.log("values sing up", values);
    // const res = await signIn(values.email, values.password)
    await signUp(values.username, values.email, values.password);
    // console.log('res', res)
    setSubmitting(false);
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit })

  const onPreviousStep = () => {
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

      <form onSubmit={formik.handleSubmit}>
        <Button onClick={() => console.log(formik.values, formik.errors)}>Get VALUES [{formik.isValid ? 'ok' : 'X'}]</Button>
        {activeStep === 0 && <SignUpBasicInfo formikProps={formik} />}
        {activeStep === 1 && <SignUpPersonalInfo formikProps={formik} />}
        {activeStep === 2 && <SignUpProfessionalInfo formikProps={formik} />}

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: '16px' }}>
          {
            activeStep > 0
              ? <Button
                disabled={formik.isSubmitting}
                variant="outlined"
                onClick={onPreviousStep}
                color='secondary'
              >
                Prev
              </Button>
              : <div></div>
          }
          {
            activeStep < 2
              ? <Button
                disabled={formik.isSubmitting}
                variant="contained"
                onClick={onNextStep}
              >
                Next
              </Button>
              : <div></div>
          }
        </Box>
        {activeStep === 2 && <Button disabled={formik.isSubmitting || !formik.isValid} variant="contained" onClick={onNextStep} fullWidth>
          Sign up
        </Button>}
      </form >
      );
    </Box >
  );
};
