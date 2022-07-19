import { useFormik } from "formik";
import * as yup from "yup";

import { SignUpFormValues } from "../../src/knowledgeTypes";

export const useSignUpFormData = () => {
  const initialValues: SignUpFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    passwordConfirmation: "",
    theme: "Light",
    background: "Color",
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
    institution: "",
    major: "",
    fieldOfInterest: "",
    signUpAgreement: false,
    clickedConsent: false,
    clickedTOS: false,
    clickedPP: false,
    clickedCP: false
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
    passwordConfirmation: yup.string().oneOf([yup.ref("password"), null], "Password must match re-entered password!"),
    language: yup.string().required("Please enter your language!"),
    age: yup
      .number()
      .min(10, "Age should be greater than or equal to 10")
      .max(100, "Age should be less than or equal to 100")
      .required("Required"),
    gender: yup.string().required("Please enter your gender!"),
    genderOtherValue: yup.string().when("gender", {
      is: (genderValue: string) => genderValue === "Not listed (Please specify)",
      then: yup.string().required("Required")
    }),
    ethnicity: yup.array().min(1).of(yup.string().required("Please enter your ethnicity!")),
    ethnicityOtherValue: yup.string().when("ethnicity", {
      is: (ethnicityValue: string[]) => ethnicityValue.includes("Not listed (Please specify)"),
      then: yup.string().required("Required")
    }),
    country: yup.string().required("Please enter your country!"),
    state: yup.string().required("Please enter your state!"),
    city: yup.string().required("Please enter your city!"),
    reason: yup.string().required("Please enter your reason for joining 1Cademy!"),
    foundFrom: yup.string().required("Please enter how you heard about us!"),
    foundFromOtherValue: yup.string().when("foundFrom", {
      is: (foundFromValue: string) => foundFromValue === "Not listed (Please specify)",
      then: yup.string().required("Required")
    }),
    occupation: yup.string().required("Please enter your occupation!"),
    education: yup.string().required("Please enter your educational status!"),
    institution: yup.string().required("Please enter your institution!"),
    major: yup.string().required("Required"),
    fieldOfInterest: yup.string().required("Required"),
    signUpAgreement: yup.boolean().isTrue()
  });

  const onSubmit = async () => {
    console.log("submit function");
  };

  const signUpFormik = useFormik({ initialValues, validationSchema, onSubmit });

  return { signUpFormik };
};
