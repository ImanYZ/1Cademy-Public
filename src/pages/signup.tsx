import { LoadingButton } from "@mui/lab";
import { Box, Button, Step, StepLabel, Stepper } from "@mui/material";
import { FirebaseError } from "firebase/app";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import React, { ReactNode, useState } from "react";
import { useMutation } from "react-query";
import * as yup from "yup";

import { useAuth } from "@/context/AuthContext";
import { sendVerificationEmail, signIn } from "@/lib/firestoreClient/auth";
import { signUp as signUpApi, validateSignUp as validateSignUpApi } from "@/lib/knowledgeApi";

import AuthLayout from "../components/layouts/AuthLayout";
import { SignUpBasicInfo } from "../components/SignUpBasicInfo";
import { SignUpPersonalInfo } from "../components/SignUpPersonalInfo";
import { SignUpProfessionalInfo } from "../components/SignUpProfessionalInfo";
import { NextPageWithLayout, SignUpData, SignUpFormValues, User } from "../knowledgeTypes";

const getDateBySubstractYears = (years: number, date = new Date()) => {
  date.setFullYear(date.getFullYear() - years);
  return date;
};

const SignUpPage: NextPageWithLayout = () => {
  const [, { handleError }] = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const minDate = getDateBySubstractYears(100);
  const maxDate = getDateBySubstractYears(10);
  const steps = ["Account", "Personal", "Education"];
  const mutateSignUp = useMutation<User, unknown, SignUpData>(signUpApi, {
    onSuccess: async (data, variables) => {
      try {
        await signIn(variables.email, variables.password);
        await sendVerificationEmail();
        enqueueSnackbar(
          "We have sent an email with a confirmation link to your email address. Please verify it to start contributing.",
          {
            variant: "success",
            autoHideDuration: 10000,
          }
        );
      } catch (error) {
        console.log(error);
        handleError({ error, showErrorToast: false });
      }
    },
    onError: error => {
      if (error instanceof FirebaseError) {
        handleError({ error, errorMessage: (error as FirebaseError).message });
        return;
      }
      handleError({ error, errorMessage: error as string });
    },
  });

  const [activeStep, setActiveStep] = useState(1);

  const initialValues: SignUpFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    passwordConfirmation: "",
    theme: "Dark",
    background: "Image",
    chooseUname: false,
    tagId: "r98BjyFDCe4YyLA3U8ZE",
    tag: "1Cademy",
    language: "English",
    birthDate: "",
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
    institution: null,
    major: null,
    fieldOfInterest: "",
    signUpAgreement: false,
    clickedConsent: false,
    clickedTOS: false,
    clickedPP: false,
    clickedCP: false,
  };

  const validationSchema = yup.object({
    firstName: yup.string().required("Please enter your first name"),
    lastName: yup.string().required("Please enter your last name"),
    email: yup
      .string()
      .email("Invalid email address")
      .required("Your email address provided by your academic/research institutions is required"),
    username: yup
      .string()
      .required("Your desired username is required")
      .min(4, "A username with at least 4 characters is required")
      .matches(/^((?!(__.*__)|\.|\/).)*$/, "Usernames should not contain . or / or __"),
    password: yup.string().min(7, "Password must be at least 7 characters").required("A secure password is required"),
    passwordConfirmation: yup
      .string()
      .oneOf([yup.ref("password"), null], "Password must match re-entered password")
      .required("Re-enter password is required"),
    language: yup.string().required("Please enter your language").nullable(true),
    birthDate: yup
      .date()
      .min(minDate, "Your age should be less than or equal to 100 years")
      .max(maxDate, "Your age should be greater than or equal to 10 years")
      .required("Please enter your birth date")
      .nullable(),
    gender: yup.string().required("Please enter your gender").nullable(true),
    genderOtherValue: yup.string().when("gender", {
      is: (genderValue: string) => genderValue === "Not listed (Please specify)",
      then: yup.string().required("Required"),
    }),
    ethnicity: yup
      .array()
      .min(1, "Please select at least 1 option")
      .of(yup.string().required("Please enter your ethnicity")),
    ethnicityOtherValue: yup.string().when("ethnicity", {
      is: (ethnicityValue: string[]) => ethnicityValue.includes("Not listed (Please specify)"),
      then: yup.string().required("Required"),
    }),
    country: yup.string().required("Please enter your country").nullable(true),
    state: yup.string().required("Please enter your state").nullable(true),
    city: yup.string().required("Please enter your city").nullable(true),
    reason: yup.string().required("Please enter your reason for joining 1Cademy"),
    foundFrom: yup.string().required("Please enter how you heard about us").nullable(true),
    foundFromOtherValue: yup.string().when("foundFrom", {
      is: (foundFromValue: string) => foundFromValue === "Not listed (Please specify)",
      then: yup.string().required("Required"),
    }),
    occupation: yup.string().required("Please enter your occupation"),
    education: yup.string().required("Please enter your educational status").nullable(true),
    institution: yup.string().required("Please enter your institution").nullable(),
    major: yup.string().required("Please enter your major").nullable(),
    fieldOfInterest: yup.string().required("Please enter your field of interest"),
    signUpAgreement: yup.boolean().isTrue("Please accept the Informed Consent to continue"),
  });

  const handleSignUp = async (values: SignUpFormValues) => {
    const user: SignUpData = {
      uname: values.username,
      email: values.email,
      fName: values.firstName,
      lName: values.lastName,
      password: values.password,
      lang: values.language,
      country: values.country as string,
      state: values.state as string,
      city: values.city as string,
      gender: values.gender as string,
      birthDate: values.birthDate,
      foundFrom: values.foundFrom as string,
      education: values.education as string,
      occupation: values.occupation as string,
      ethnicity: values.ethnicity as string[],
      reason: values.reason as string,
      chooseUname: values.chooseUname,
      clickedConsent: values.clickedConsent,
      clickedTOS: values.clickedTOS,
      clickedPP: values.clickedPP,
      clickedCP: values.clickedCP,
      tag: values.tag,
      tagId: values.tagId,
      deMajor: values.major as string,
      deInstit: values.institution as string,
      theme: values.theme,
      background: values.background,
      consented: values.signUpAgreement,
      fieldOfInterest: values.fieldOfInterest,
    };
    mutateSignUp.mutate(user);
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit: handleSignUp });

  const onPreviousStep = () => {
    if (activeStep < 2) return;
    setActiveStep(step => step - 1);
  };

  const validateSignUp = async (): Promise<Boolean> => {
    const data = await validateSignUpApi({ uname: formik.values.username, email: formik.values.email });
    let isValid = true;
    const formikErrors = { ...formik.errors };
    if (data.results?.email) {
      formikErrors.email = data.results?.email;
      isValid = false;
    }
    if (data.results?.uname) {
      formikErrors.username = data.results?.uname;
      isValid = false;
    }

    if (!isValid) {
      formik.setErrors(formikErrors);
    }

    if (isValid && data.results?.institutionName) {
      formik.setFieldValue("institution", data.results.institutionName);
    }
    // if(isValid){
    //   const domain = formik.values.email.split('@')[1]
    //   formik.setFieldValue('institution',)
    // }
    return isValid;
  };

  const onNextStep = async () => {
    if (activeStep > steps.length - 1) return;
    if (activeStep === 1) {
      touchFirstStep();
      if (isInvalidFirstStep()) return;

      const isValidSignUpFormData = await validateSignUp();
      if (!isValidSignUpFormData) return;

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
      Boolean(formik.errors.birthDate) ||
      Boolean(formik.errors.gender) ||
      Boolean(formik.errors.genderOtherValue) ||
      Boolean(formik.errors.ethnicity) ||
      Boolean(formik.errors.ethnicityOtherValue) ||
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
      passwordConfirmation: true,
    });
  };

  const touchSecondStep = () => {
    formik.setTouched({
      ...formik.touched,
      language: true,
      birthDate: true,
      gender: true,
      genderOtherValue: true,
      ethnicity: true,
      ethnicityOtherValue: true,
      country: true,
      state: true,
      city: true,
      reason: true,
      foundFrom: true,
      foundFromOtherValue: true,
    });
  };

  return (
    <Box sx={{ p: { xs: "8px", md: "24px", width: "100%" } }}>
      <Stepper activeStep={activeStep - 1} sx={{ mt: "0px", mb: "16px" }}>
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
      <form data-testid="signup-form" onSubmit={formik.handleSubmit}>
        {/* <Button onClick={() => console.log(formik.values, formik.errors, formik.touched)}>Show: Values, Errors</Button> */}
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
          <LoadingButton
            loading={mutateSignUp.isLoading}
            type="submit"
            disabled={formik.isSubmitting}
            variant="contained"
            fullWidth
          >
            Sign up
          </LoadingButton>
        )}
      </form>
    </Box>
  );
};

SignUpPage.getLayout = (page: ReactNode) => {
  return <AuthLayout>{page}</AuthLayout>;
};

export default SignUpPage;
