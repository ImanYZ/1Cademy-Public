import { Box, Button, Step, StepLabel, Stepper } from "@mui/material";
import { useFormik } from "formik";
import React, { ReactNode, useState } from "react";
import { useMutation } from "react-query";
import * as yup from "yup";

import { AuthLayout } from "../components/layouts/AuthLayout";
import { SignUpBasicInfo } from "../components/SignUpBasicInfo";
import { SignUpPersonalInfo } from "../components/SignUpPersonalInfo";
import { SignUpProfessionalInfo } from "../components/SignUpProfessionalInfo";
import { SignUpFormValues } from "../knowledgeTypes";
import { validateEmail, validateUsername } from "../lib/knowledgeApi";

const SignUpPage = () => {
  const steps = ["Account", "Personal", "Education"];

  const [activeStep, setActiveStep] = useState(1);

  const mutationValidateEmail = useMutation(validateEmail);
  const mutationValidateUserName = useMutation(validateUsername);

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
    ethnicityOtherValue: "",
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
    firstName: yup.string().required("Please enter your first name!"),
    lastName: yup.string().required("Please enter your last name!"),
    email: yup
      .string()
      .email("Invalid email address!")
      .required("Your email address provided by your academic/research institutions is required!"),
    username: yup
      .string()
      .required("Your desired username is required!")
      .min(4, "A username with at least 4 characters is required!")
      .matches(/^((?!(__.*__)|\.|\/).)*$/, "Usernames should not contain . or / or __!"),
    password: yup.string().min(7, "Password must be at least 7 characters!").required("A secure password is required!"),
    passwordConfirmation: yup
      .string()
      .oneOf([yup.ref("password"), null], "Password must match re-entered password!")
      .required("Re-enter password is required!"),
    language: yup.string().required("Please enter your language!"),
    age: yup
      .number()
      .min(10, "Age should be greater than or equal to 10")
      .max(100, "Age should be less than or equal to 100")
      .required("Required"),
    gender: yup.string().required("Please enter your gender!").nullable(true),
    genderOtherValue: yup.string().when("gender", {
      is: (genderValue: string) => genderValue === "Not listed (Please specify)",
      then: yup.string().required("Required")
    }),
    ethnicity: yup.array().min(1).of(yup.string().required("Please enter your ethnicity!")),
    ethnicityOtherValue: yup.string().when("ethnicity", {
      is: (ethnicityValue: string[]) => ethnicityValue.includes("Not listed (Please specify)"),
      then: yup.string().required("Required")
    }),
    country: yup.string().required("Please enter your country!").nullable(true),
    state: yup.string().required("Please enter your state!").nullable(true),
    city: yup.string().required("Please enter your city!").nullable(true),
    reason: yup.string().required("Please enter your reason for joining 1Cademy!"),
    foundFrom: yup.string().required("Please enter how you heard about us!").nullable(true),
    foundFromOtherValue: yup.string().when("foundFrom", {
      is: (foundFromValue: string) => foundFromValue === "Not listed (Please specify)",
      then: yup.string().required("Required")
    }),
    occupation: yup.string().required("Please enter your occupation!"),
    education: yup.string().required("Please enter your educational status!").nullable(true),
    institution: yup.string().required("Please enter your institution!"),
    major: yup.string().required("Required"),
    fieldOfInterest: yup.string().required("Required"),
    signUpAgreement: yup.boolean().isTrue("Please accept terms to continue")
  });

  const handleSignUp = (values: SignUpFormValues) => {
    console.log("Should handle signup", values);
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit: handleSignUp });

  const onPreviousStep = () => {
    if (activeStep < 2) return;
    setActiveStep(step => step - 1);
  };

  const validateEmailByServer = async (): Promise<Boolean> => {
    const data = await mutationValidateEmail.mutateAsync({ email: formik.values.email });
    const institutionByEmail = data?.results?.institution || null;

    if (!institutionByEmail) {
      formik.setErrors({ ...formik.errors, email: "This email address is already in use!" });
      return false;
    }

    if (institutionByEmail === "Not Found!") {
      // "At this point, only members of academic/research institutions can join us. If you've enterred the email address provided by your academic/research institution, but you see this message, contact oneweb@umich.edu";
      formik.setErrors({
        ...formik.errors,
        email:
          "At this point, only members of academic/research institutions can join us. If you've enterred the email address provided by your academic/research institution, but you see this message, contact oneweb@umich.edu"
      });
      return false;
    }

    // email is from a valid institution
    formik.setFieldValue("institution", institutionByEmail);
    return true;
  };

  const validateUsernameByServer = async (): Promise<Boolean> => {
    const data = await mutationValidateUserName.mutateAsync({ username: formik.values.username });
    const usernameValid = Boolean(data.results?.valid);
    if (!usernameValid) {
      formik.setErrors({ ...formik.errors, username: "This username is already in use!" });
      return false;
    }
    return true;
  };

  const onNextStep = async () => {
    if (activeStep > steps.length - 1) return;
    if (activeStep === 1) {
      console.log(1);
      touchFirstStep();
      console.log(2);
      if (isInvalidFirstStep()) return;

      console.log(3);
      const isValidEmail = await validateEmailByServer();
      if (!isValidEmail) return;

      const isValidUsername = await validateUsernameByServer();
      if (!isValidUsername) return;

      setActiveStep(step => step + 1);
    }
    if (activeStep === 2) {
      touchSecondStep();
      if (isInvalidSecondStep()) return;
      setActiveStep(step => step + 1);
    }
  };

  const isInvalidFirstStep = () => {
    return (
      Boolean(formik.errors.firstName) ||
      Boolean(formik.errors.lastName) ||
      Boolean(formik.errors.email) ||
      Boolean(formik.errors.username) ||
      Boolean(formik.errors.password) ||
      Boolean(formik.errors.passwordConfirmation)
    );
  };

  const isInvalidSecondStep = () => {
    return (
      Boolean(formik.errors.language) ||
      Boolean(formik.errors.age) ||
      Boolean(formik.errors.gender) ||
      Boolean(formik.errors.genderOtherValue) ||
      Boolean(formik.errors.ethnicity) ||
      Boolean(formik.errors.country) ||
      Boolean(formik.errors.state) ||
      Boolean(formik.errors.city) ||
      Boolean(formik.errors.reason) ||
      Boolean(formik.errors.foundFrom) ||
      Boolean(formik.errors.foundFromOtherValue)
    );
  };

  const touchFirstStep = () => {
    formik.setTouched({
      ...formik.touched,
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      password: true,
      passwordConfirmation: true
    });
  };

  const touchSecondStep = () => {
    formik.setTouched({
      ...formik.touched,
      language: true,
      age: true,
      gender: true,
      genderOtherValue: true,
      ethnicity: true,
      country: true,
      state: true,
      city: true,
      reason: true,
      foundFrom: true,
      foundFromOtherValue: true
    });
  };

  return (
    <Box>
      <Stepper activeStep={activeStep - 1} sx={{ mt: "26px", mb: "46px", mx: "19px" }}>
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
        <Button onClick={() => console.log(formik.values, formik.errors)}>
          Get VALUES [{formik.isValid ? "ok" : "X"}] [{activeStep}]
        </Button>
        {activeStep === 1 && <SignUpBasicInfo formikProps={formik} />}
        {activeStep === 2 && <SignUpPersonalInfo formikProps={formik} />}
        {activeStep === 3 && <SignUpProfessionalInfo formikProps={formik} />}

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: "16px" }}>
          {activeStep === 1 && (
            <>
              <div></div>
              <Button disabled={formik.isSubmitting} variant="contained" onClick={onNextStep}>
                Next
              </Button>
            </>
          )}
          {activeStep === 2 && (
            <>
              <Button disabled={formik.isSubmitting} variant="outlined" onClick={onPreviousStep} color="secondary">
                Prev
              </Button>
              <Button disabled={formik.isSubmitting} variant="contained" onClick={onNextStep}>
                Next
              </Button>
            </>
          )}
          {activeStep === 3 && (
            <>
              <Button disabled={formik.isSubmitting} variant="outlined" onClick={onPreviousStep} color="secondary">
                Prev
              </Button>
            </>
          )}
        </Box>
        {activeStep === 3 && (
          <Button type="submit" disabled={formik.isSubmitting} variant="contained" fullWidth>
            Sign up
          </Button>
        )}
      </form>
    </Box>
  );
};

SignUpPage.getLayout = (page: ReactNode) => {
  return <AuthLayout>{page}</AuthLayout>;
};

export default SignUpPage;
