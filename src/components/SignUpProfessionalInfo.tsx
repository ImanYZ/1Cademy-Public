import { Autocomplete, Backdrop, Checkbox, CircularProgress, FormHelperText, Link, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { FormikProps } from "formik";
import { lazy, Suspense, useState } from "react";
import { SignUpFormValues } from "src/knowledgeTypes";

import { EDUCATION_VALUES } from "../lib/utils/constants";

const CookiePolicy = lazy(() => import("./modals/CookiePolicy"));
const PrivacyPolicy = lazy(() => import("./modals/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./modals/TermsOfUse"));
const InformedConsent = lazy(() => import("./modals/InformedConsent"));

type SignUpBasicInformationProps = {
  formikProps: FormikProps<SignUpFormValues>;
};

export const SignUpProfessionalInfo = ({ formikProps }: SignUpBasicInformationProps) => {
  const [openInformedConsent, setOpenInformedConsent] = useState(false);
  const [openTermOfUse, setOpenTermsOfUse] = useState(false);
  const [openPrivacyPolicy, setOpenPrivacyPolicy] = useState(false);
  const [openCookiePolicy, setOpenCookiePolicy] = useState(false);
  const { values, errors, touched, handleChange, handleBlur, setFieldValue, setTouched } = formikProps;
  return (
    <Box data-testid="signup-form-step-3">
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

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Checkbox checked={values.signUpAgreement} onChange={(_, value) => setFieldValue("signUpAgreement", value)} />
        <Box sx={{ mb: "16px" }}>
          <Box>
            The data that is generated when you participate in 1Cademy will be used for research by investigators at the
            University of Michigan School of Information. For more information, please read this <b>Informed Consent</b>
            . By clicking "Sign Up," you acknowledge that you agree to 1Cademy's{" "}
            <Link
              onClick={() => {
                setFieldValue("clickedTOS", true);
                setOpenTermsOfUse(true);
              }}
              sx={{ cursor: "pointer", textDecoration: "none" }}
            >
              Terms of Use
            </Link>
            ,{" "}
            <Link
              onClick={() => {
                setFieldValue("clickedPP", true);
                setOpenPrivacyPolicy(true);
              }}
              sx={{ cursor: "pointer", textDecoration: "none" }}
            >
              Privacy Policy
            </Link>
            ,{" "}
            <Link
              onClick={() => {
                setFieldValue("clickedCP", true);
                setOpenCookiePolicy(true);
              }}
              sx={{ cursor: "pointer", textDecoration: "none" }}
            >
              Cookie Policy
            </Link>{" "}
            and{" "}
            <Link
              onClick={() => {
                setFieldValue("clickedConsent", true);
                setOpenInformedConsent(true);
              }}
              sx={{ cursor: "pointer", textDecoration: "none" }}
            >
              the Informed Consent
            </Link>
            .
          </Box>
          {Boolean(errors.signUpAgreement) && Boolean(touched.signUpAgreement) && (
            <FormHelperText sx={{ color: theme => theme.palette.error.main }}>
              {touched.signUpAgreement && errors.signUpAgreement}
            </FormHelperText>
          )}
        </Box>
      </Box>

      <Suspense
        fallback={
          <Backdrop sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 1 }} open={true}>
            <CircularProgress color="inherit" />
          </Backdrop>
        }
      >
        <>
          <InformedConsent open={openInformedConsent} handleClose={() => setOpenInformedConsent(false)} />
          <CookiePolicy open={openCookiePolicy} handleClose={() => setOpenCookiePolicy(false)} />
          <PrivacyPolicy open={openPrivacyPolicy} handleClose={() => setOpenPrivacyPolicy(false)} />
          <TermsOfUse open={openTermOfUse} handleClose={() => setOpenTermsOfUse(false)} />
        </>
      </Suspense>
    </Box>
  );
};
