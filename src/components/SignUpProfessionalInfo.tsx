import {
  Autocomplete,
  Backdrop,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  TextField,
  Typography
} from "@mui/material";
import { Box } from "@mui/system";
import { FormikProps } from "formik";
import { lazy, Suspense, useState } from "react";
import { SignUpFormValues } from "src/knowledgeTypes";

import { EDUCATION_VALUES } from "../lib/utils/constants";

const CookiePolicy = lazy(() => import("./modals/CookiePolicy"));
const PrivacyPolicy = lazy(() => import("./modals/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./modals/TermsOfUse"));

// import { CookiePolicy } from "./modals/CookiePolicy";
// import { PrivacyPolicy } from "./modals/PrivacyPolicy";
// import { TermsOfUse } from "./modals/TermsOfUse";

type SignUpBasicInformationProps = {
  formikProps: FormikProps<SignUpFormValues>;
};

export const SignUpProfessionalInfo = ({ formikProps }: SignUpBasicInformationProps) => {
  const [openTermOfUse, setOpenTermsOfUse] = useState(false);
  const [openPrivacyPolicy, setOpenPrivacyPolicy] = useState(false);
  const [openCookiePolicy, setOpenCookiePolicy] = useState(false);
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
        helperText={touched.occupation && errors.occupation}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <Autocomplete
        id="education"
        value={values.education}
        onChange={(_, value) => setFieldValue("education", value)}
        onBlur={() => setTouched({ ...touched, education: true })}
        options={EDUCATION_VALUES}
        renderInput={params => (
          <TextField
            {...params}
            label="Education Level"
            error={Boolean(errors.education) && Boolean(touched.education)}
            helperText={touched.education && errors.education}
          />
        )}
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
        helperText={touched.institution && errors.institution}
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
        helperText={touched.major && errors.major}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <TextField
        id="fieldOfInterest"
        name="fieldOfInterest"
        label="Research field of interest (if any)"
        value={values.fieldOfInterest}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        error={Boolean(errors.fieldOfInterest) && Boolean(touched.fieldOfInterest)}
        helperText={touched.fieldOfInterest && errors.fieldOfInterest}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <FormControlLabel
        control={
          <Checkbox checked={values.signUpAgreement} onChange={(_, value) => setFieldValue("signUpAgreement", value)} />
        }
        label={
          <>
            <Typography color={theme => theme.palette.text.primary}>
              By clicking “Sign up”, you acknowledge that you agree to 1Cademy’s Terms of Use, Privacy Policy, and
              Cookie Policy
            </Typography>
            {Boolean(errors.signUpAgreement) && Boolean(touched.signUpAgreement) && (
              <FormHelperText sx={{ color: theme => theme.palette.error.main }}>
                {touched.signUpAgreement && errors.signUpAgreement}
              </FormHelperText>
            )}
          </>
        }
        sx={{ mb: "16px" }}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button type="button" onClick={() => setOpenTermsOfUse(true)}>
          Terms of Use
        </Button>
        <Button type="button" onClick={() => setOpenPrivacyPolicy(true)}>
          Privacy Policy
        </Button>
        <Button type="button" onClick={() => setOpenCookiePolicy(true)}>
          Cookie Policy
        </Button>
      </Box>

      <Suspense
        fallback={
          <Backdrop sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 1 }} open={true}>
            <CircularProgress color="inherit" />
          </Backdrop>
        }
      >
        <>
          <CookiePolicy open={openCookiePolicy} handleClose={() => setOpenCookiePolicy(false)} />
          <PrivacyPolicy open={openPrivacyPolicy} handleClose={() => setOpenPrivacyPolicy(false)} />
          <TermsOfUse open={openTermOfUse} handleClose={() => setOpenTermsOfUse(false)} />
        </>
      </Suspense>
    </>
  );
};
