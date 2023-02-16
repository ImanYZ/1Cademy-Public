import {
  Autocomplete,
  Backdrop,
  Checkbox,
  CircularProgress,
  createFilterOptions,
  FormHelperText,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { collection, getDocs, getFirestore, query } from "firebase/firestore";
import { FormikProps } from "formik";
import { HTMLAttributes, lazy, Suspense, useEffect, useState } from "react";
import { Institution, Major, SignUpFormValues } from "src/knowledgeTypes";

import { EDUCATION_VALUES } from "../lib/utils/constants";
import OptimizedAvatar from "./OptimizedAvatar";

const CookiePolicy = lazy(() => import("./modals/CookiePolicy"));
const GDPRPolicy = lazy(() => import("./modals/GDPRPolicy"));
const PrivacyPolicy = lazy(() => import("./modals/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./modals/TermsOfUse"));
const InformedConsent = lazy(() => import("./modals/InformedConsent"));

type SignUpBasicInformationProps = {
  formikProps: FormikProps<SignUpFormValues>;
};

export const SignUpProfessionalInfo = ({ formikProps }: SignUpBasicInformationProps) => {
  const [openInformedConsent, setOpenInformedConsent] = useState(false);
  const [openGDPRPolicy, setOpenGDPRPolicy] = useState(false);
  const [openTermOfUse, setOpenTermsOfUse] = useState(false);
  const [openPrivacyPolicy, setOpenPrivacyPolicy] = useState(false);
  const [openCookiePolicy, setOpenCookiePolicy] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  //const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);

  const { values, errors, touched, handleChange, handleBlur, setFieldValue, setTouched } = formikProps;

  useEffect(() => {
    const retrieveMajors = async () => {
      if (majors.length) return;

      const majorsObj = await import("../../public/edited_majors.json");
      const majorsList = [...majorsObj.default, { Major: "Prefer not to say", Major_Category: "Prefer not to say" }]
        .sort((l1, l2) => (l1.Major < l2.Major ? -1 : 1))
        .sort((l1, l2) => (l1.Major_Category < l2.Major_Category ? -1 : 1));
      setMajors(majorsList);
    };

    retrieveMajors();
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const retrieveInstitutions = async () => {
      const db = getFirestore();
      const institutionsRef = collection(db, "institutions");
      const q = query(institutionsRef);

      const querySnapshot = await getDocs(q);
      let institutions: Institution[] = [];
      querySnapshot.forEach(doc => {
        institutions.push({ id: doc.id, ...doc.data() } as Institution);
      });

      const institutionSorted = institutions
        .sort((l1, l2) => (l1.name < l2.name ? -1 : 1))
        .sort((l1, l2) => (l1.country < l2.country ? -1 : 1));
      //setAllInstitutions(institutionSorted);

      setInstitutions(institutionSorted);
    };
    retrieveInstitutions();
  }, []);

  const getNameFromInstitutionSelected = () => {
    if (!values.institution) return null;
    const foundInstitution = institutions.find(cur => cur.name === values.institution);
    if (!foundInstitution) return null;
    return foundInstitution;
  };
  // const onChangeInstitution = (value: string) => {
  //   const foundInstitution: Institution[] = allInstitutions.reduce((acu: Institution[], cur) => {
  //     if (acu.length < 10) {
  //       if (cur.name.includes(value)) {
  //         return [...acu, cur];
  //       } else {
  //         return acu;
  //       }
  //     }
  //     return acu;
  //   }, []);
  //   setInstitutions(foundInstitution);
  // };

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
      <Autocomplete
        id="institution"
        loading={institutions.length === 0}
        filterOptions={createFilterOptions({
          matchFrom: "any",
          limit: 20,
        })}
        value={getNameFromInstitutionSelected()}
        onChange={(_, value) => setFieldValue("institution", value?.name || null)}
        // onInputChange={(_, value) => {
        //   onChangeInstitution(value);
        // }}
        onBlur={() => setTouched({ ...touched, institution: true })}
        options={institutions}
        getOptionLabel={option => option.name}
        renderInput={params => (
          <TextField
            {...params}
            label="Institution"
            error={Boolean(errors.institution) && Boolean(touched.institution)}
            helperText={touched.institution && errors.institution}
          />
        )}
        renderOption={(props: HTMLAttributes<HTMLLIElement>, option: Institution) => (
          <li {...props} key={option.id}>
            <OptimizedAvatar name={option.name} imageUrl={option.logoURL} contained renderAsAvatar={false} />
            <div style={{ paddingLeft: "7px" }}>{option.name}</div>
          </li>
        )}
        isOptionEqualToValue={(option: Institution, value: Institution) => option.id === value.id}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <Autocomplete
        id="major"
        value={majors.find(cur => cur.Major === values.major) || null}
        onChange={(_, value) => setFieldValue("major", value?.Major || null)}
        onBlur={() => setTouched({ ...touched, major: true })}
        options={majors}
        getOptionLabel={option => option.Major}
        groupBy={option => option.Major_Category}
        renderInput={params => (
          <TextField
            {...params}
            label="Major"
            error={Boolean(errors.major) && Boolean(touched.major)}
            helperText={touched.major && errors.major}
          />
        )}
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

      {/* <Box></Box> */}
      <Box sx={{ mb: "16px", display: "flex", alignItems: "center" }}>
        <Checkbox checked={values.signUpAgreement} onChange={(_, value) => setFieldValue("signUpAgreement", value)} />
        <Box>
          <Box>
            <Typography>
              I acknowledge and agree that any data generated from my use of 1Cademy may be utilized for research
              purposes by the investigators at 1Cademy, the University of Michigan School of Information, and Honor
              Education.
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

      <Box sx={{ mb: "16px", display: "flex", alignItems: "center" }}>
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
      </Box>

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
