import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { collection, getDocs, getFirestore, query } from "firebase/firestore";
import { FormikProps } from "formik";
import { HTMLAttributes, useEffect, useState } from "react";
import { Institution, Major, SignUpFormValues } from "src/knowledgeTypes";

import { EDUCATION_VALUES } from "../lib/utils/constants";
import OptimizedAvatar from "./OptimizedAvatar";

type SignUpBasicInformationProps = {
  formikProps: FormikProps<SignUpFormValues>;
};

export const SignUpProfessionalInfo = ({ formikProps }: SignUpBasicInformationProps) => {
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
    </Box>
  );
};
