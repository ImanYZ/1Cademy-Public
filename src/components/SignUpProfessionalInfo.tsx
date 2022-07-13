import { Autocomplete, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { FormikProps } from "formik";

import { SignUpFormValues } from "../knowledgeTypes";
import { EDUCATION_VALUES } from "../lib/utils/constants";

type SignUpBasicInformationProps = {
  formikProps: FormikProps<SignUpFormValues>;
};

export const SignUpProfessionalInfo = ({ formikProps }: SignUpBasicInformationProps) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue, setTouched } = formikProps;
  return (
    <>
      <TextField
        id="occupation"
        name="occupation"
        label="Occupation"
        value={values.occupation}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        error={Boolean(errors.occupation) && Boolean(touched.occupation)}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <Autocomplete
        id="education"
        value={values.education}
        onChange={(_, value) => setFieldValue("education", value)}
        onBlur={() => setTouched({ ...touched, education: true })}
        options={EDUCATION_VALUES}
        renderInput={params => <TextField {...params} label="Education Level" />}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <TextField
        id="institution"
        name="institution"
        label="Institution"
        value={values.institution}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        error={Boolean(errors.institution) && Boolean(touched.institution)}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <TextField
        id="major"
        name="major"
        label="Major"
        value={values.major}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        error={Boolean(errors.major) && Boolean(touched.major)}
        fullWidth
        sx={{ mb: "16px" }}
      />
      {/* <Autocomplete
        id="major"
        value={values.major}
        onChange={(_, value) => setFieldValue("major", value)}
        onBlur={() => setTouched({ ...touched, major: true })}
        options={MAJORS}
        renderInput={params => <TextField {...params} label="Education Level" />}
        fullWidth
        sx={{ mb: "16px" }}
      /> */}
      <TextField
        id="fieldOfInterest"
        name="fieldOfInterest"
        label="Research field of interest (if any)"
        value={values.fieldOfInterest}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        error={Boolean(errors.fieldOfInterest) && Boolean(touched.fieldOfInterest)}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <FormControlLabel
        control={
          <Checkbox checked={values.signUpAgreement} onChange={(_, value) => setFieldValue("signUpAgreement", value)} />
        }
        label="By clicking “Sign up”, you acknowledge that you agree to 1Cademy’s Terms of Use, Privacy Policy, and Cookie Policy"
        sx={{ mb: "16px" }}
      />
    </>
  );
};
