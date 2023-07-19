import {
  Backdrop,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Link,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { FormikProps } from "formik";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { SignUpFormValues } from "src/knowledgeTypes";

import { useAuth } from "../context/AuthContext";
import { useTagsTreeView } from "../hooks/useTagsTreeView";
import { ToUpperCaseEveryWord } from "../lib/utils/utils";
import { ChosenTag, MemoizedTagsSearcher } from "./TagsSearcher";

const CookiePolicy = lazy(() => import("./modals/CookiePolicy"));
const GDPRPolicy = lazy(() => import("./modals/GDPRPolicy"));
const PrivacyPolicy = lazy(() => import("./modals/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./modals/TermsOfUse"));
const InformedConsent = lazy(() => import("./modals/InformedConsent"));
export type SignUpBasicInformationProps = {
  formikProps: FormikProps<SignUpFormValues>;
};

export const SignUpBasicInfo = ({ formikProps }: SignUpBasicInformationProps) => {
  const [, { dispatch }] = useAuth();
  const [openInformedConsent, setOpenInformedConsent] = useState(false);
  const [openGDPRPolicy, setOpenGDPRPolicy] = useState(false);
  const [openTermOfUse, setOpenTermsOfUse] = useState(false);
  const [openPrivacyPolicy, setOpenPrivacyPolicy] = useState(false);
  const [openCookiePolicy, setOpenCookiePolicy] = useState(false);
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formikProps;
  const { allTags, setAllTags } = useTagsTreeView(values.tagId ? [values.tagId] : []);

  const [chosenTags, setChosenTags] = useState<ChosenTag[]>([]);

  // useEffect(() => {
  //   const getFirstTagChecked = () => {
  //     const tagSelected = Object.values(allTags).find(cur => cur.checked);
  //     if (!tagSelected) return;

  //     setFieldValue("tagId", tagSelected.nodeId);
  //     setFieldValue("tag", tagSelected.title);
  //   };

  //   getFirstTagChecked();
  // }, [allTags, setFieldValue]);

  useEffect(() => {
    if (!chosenTags.length) return;

    const tagSelected = chosenTags[0];
    setFieldValue("tagId", tagSelected.id);
    setFieldValue("tag", tagSelected.title);
  }, [chosenTags, setFieldValue]);

  const getDisplayNameValue = () => {
    if (values.chooseUname) return values.username || "Your Username";
    return values.firstName || values.lastName
      ? ToUpperCaseEveryWord(values.firstName + " " + values.lastName)
      : "Your Full Name";
  };

  return (
    <Box data-testid="signup-form-step-1">
      <TextField
        id="firstName"
        name="firstName"
        label="First Name"
        value={values.firstName}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        error={Boolean(errors.firstName) && Boolean(touched.firstName)}
        helperText={touched.firstName && errors.firstName}
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
        helperText={touched.lastName && errors.lastName}
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
        helperText={touched.email && errors.email}
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
        helperText={touched.username && errors.username}
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
        helperText={touched.password && errors.password}
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
        helperText={touched.passwordConfirmation && errors.passwordConfirmation}
        fullWidth
        sx={{ mb: "16px" }}
      />

      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={values.theme === "Dark"}
              onChange={() => {
                setFieldValue("theme", values.theme === "Light" ? "Dark" : "Light");
                dispatch({ type: "setTheme", payload: values.theme === "Light" ? "Dark" : "Light" });
                // themeActions.setThemeMode(values.theme === "Light" ? "dark" : "light");
              }}
            />
          }
          label={`Theme: ${values.theme === "Dark" ? "🌜" : "🌞"}`}
        />
      </FormGroup>

      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={values.background === "Image"}
              onChange={() => {
                setFieldValue("background", values.background === "Color" ? "Image" : "Color");
                dispatch({ type: "setBackground", payload: values.background === "Color" ? "Image" : "Color" });
                // setBackground(values.background === "Color" ? "Image" : "Color");
              }}
            />
          }
          label={`Background: ${values.background === "Color" ? "Color" : "Image"}`}
        />
      </FormGroup>

      <FormGroup>
        <FormControlLabel
          control={
            <Switch checked={!values.chooseUname} onChange={() => setFieldValue("chooseUname", !values.chooseUname)} />
          }
          label={`Display name: ${getDisplayNameValue()}`}
        />
      </FormGroup>
      <Typography sx={{ mt: "20px", color: theme => theme.palette.common.white }}>
        You're going to be a member of: {values.tag}
      </Typography>
      <FormGroup sx={{ mt: "8px", mb: "8px" }}>
        <MemoizedTagsSearcher
          allTags={allTags}
          setAllTags={setAllTags}
          chosenTags={chosenTags}
          setChosenTags={setChosenTags}
          sx={{ maxHeight: "200px", height: "200px" }}
        />
      </FormGroup>
      <Box sx={{ mb: "16px", display: "flex", alignItems: "center" }}>
        <Checkbox checked={values.signUpAgreement} onChange={(_, value) => setFieldValue("signUpAgreement", value)} />
        <Box>
          <Box>
            <Typography>
              I acknowledge and agree that any data generated from my use of 1Cademy may be utilized for research
              purposes by the investigators at 1Cademy, the University of Michigan School of Information.
            </Typography>
          </Box>
          {Boolean(errors.signUpAgreement) && Boolean(touched.signUpAgreement) && (
            <FormHelperText sx={{ color: theme => theme.palette.error.main }}>
              {touched.signUpAgreement && errors.signUpAgreement}
            </FormHelperText>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: "16px", display: "flex", alignItems: "center" }}>
        <Checkbox
          checked={values.GDPRPolicyAgreement}
          onChange={(_, value) => setFieldValue("GDPRPolicyAgreement", value)}
        />
        <Box>
          <Box>
            <Typography>I acknowledge and agree to</Typography>
            <Link
              onClick={() => {
                setFieldValue("clickedGDPR", true);
                setOpenGDPRPolicy(true);
              }}
              sx={{ cursor: "pointer", textDecoration: "none" }}
            >
              1Cademy's General Data Protection Regulation (GDPR) Policy.
            </Link>
          </Box>
          {Boolean(errors.GDPRPolicyAgreement) && Boolean(touched.GDPRPolicyAgreement) && (
            <FormHelperText sx={{ color: theme => theme.palette.error.main }}>
              {touched.GDPRPolicyAgreement && errors.GDPRPolicyAgreement}
            </FormHelperText>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: "16px", display: "flex", alignItems: "center" }}>
        <Checkbox
          checked={values.termsOfServiceAgreement}
          onChange={(_, value) => setFieldValue("termsOfServiceAgreement", value)}
        />
        <Box>
          <Box>
            <Typography>I acknowledge and agree to</Typography>
            <Link
              onClick={() => {
                setFieldValue("clickedTOS", true);
                setOpenTermsOfUse(true);
              }}
              sx={{ cursor: "pointer", textDecoration: "none" }}
            >
              1Cademy's Terms of Service.
            </Link>
          </Box>
          {Boolean(errors.termsOfServiceAgreement) && Boolean(touched.termsOfServiceAgreement) && (
            <FormHelperText sx={{ color: theme => theme.palette.error.main }}>
              {touched.termsOfServiceAgreement && errors.termsOfServiceAgreement}
            </FormHelperText>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: "16px", display: "flex", alignItems: "center" }}>
        <Checkbox
          checked={values.privacyPolicyAgreement}
          onChange={(_, value) => setFieldValue("privacyPolicyAgreement", value)}
        />
        <Box>
          <Box>
            <Typography>I acknowledge and agree to</Typography>
            <Link
              onClick={() => {
                setFieldValue("clickedPP", true);
                setOpenPrivacyPolicy(true);
              }}
              sx={{ cursor: "pointer", textDecoration: "none" }}
            >
              1Cademy's Privacy Policy.
            </Link>
          </Box>
          {Boolean(errors.privacyPolicyAgreement) && Boolean(touched.privacyPolicyAgreement) && (
            <FormHelperText sx={{ color: theme => theme.palette.error.main }}>
              {touched.privacyPolicyAgreement && errors.privacyPolicyAgreement}
            </FormHelperText>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: "16px", display: "flex", alignItems: "center" }}>
        <Checkbox checked={values.cookiesAgreement} onChange={(_, value) => setFieldValue("cookiesAgreement", value)} />
        <Box>
          <Box>
            <Typography>I acknowledge and agree to</Typography>
            <Link
              onClick={() => {
                setFieldValue("clickedCP", true);
                setOpenCookiePolicy(true);
              }}
              sx={{ cursor: "pointer", textDecoration: "none" }}
            >
              1Cademy's Cookies Policy.
            </Link>
          </Box>
          {Boolean(errors.cookiesAgreement) && Boolean(touched.cookiesAgreement) && (
            <FormHelperText sx={{ color: theme => theme.palette.error.main }}>
              {touched.cookiesAgreement && errors.cookiesAgreement}
            </FormHelperText>
          )}
        </Box>
      </Box>

      {/* <Box sx={{ mb: "16px", display: "flex", alignItems: "center" }}>
        <Checkbox checked={values.ageAgreement} onChange={(_, value) => setFieldValue("ageAgreement", value)} />
        <Box>
          <Box>
            <Typography>I confirm that I am 18 years of age or older.</Typography>
          </Box>
          {Boolean(errors.ageAgreement) && Boolean(touched.ageAgreement) && (
            <FormHelperText sx={{ color: theme => theme.palette.error.main }}>
              {touched.ageAgreement && errors.ageAgreement}
            </FormHelperText>
          )}
        </Box>
      </Box> */}

      {/* <Box sx={{ mb: "16px" }}>
        <Typography>By clicking "Sign Up," you acknowledge that you agree to 1Cademy's </Typography>
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
        </Link>{" "}
        and{" "}
        <Link
          onClick={() => {
            setFieldValue("clickedCP", true);
            setOpenCookiePolicy(true);
          }}
          sx={{ cursor: "pointer", textDecoration: "none" }}
        >
          Cookie Policy
        </Link>
        .
      </Box> */}

      <Suspense
        fallback={
          <Backdrop sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 1 }} open={true}>
            <CircularProgress color="inherit" />
          </Backdrop>
        }
      >
        <>
          <InformedConsent open={openInformedConsent} handleClose={() => setOpenInformedConsent(false)} />
          <GDPRPolicy open={openGDPRPolicy} handleClose={() => setOpenGDPRPolicy(false)} />
          <CookiePolicy open={openCookiePolicy} handleClose={() => setOpenCookiePolicy(false)} />
          <PrivacyPolicy open={openPrivacyPolicy} handleClose={() => setOpenPrivacyPolicy(false)} />
          <TermsOfUse open={openTermOfUse} handleClose={() => setOpenTermsOfUse(false)} />
        </>
      </Suspense>
    </Box>
  );
};
