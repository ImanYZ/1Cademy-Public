import { Autocomplete, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { State } from 'country-state-city';
import { FormikProps } from "formik";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ETHNICITY_VALUES, GENDER_VALUES } from "../lib/utils/constants";
import { SignUpFormValues } from "./SignUpForm";




type SignUpBasicInformationProps = {
  formikProps: FormikProps<SignUpFormValues>;
};

export const SignUpPersonalInfo = ({ formikProps }: SignUpBasicInformationProps) => {

  const { values, errors, touched, handleChange, handleBlur, setFieldValue, setTouched } = formikProps;
  const [languages, setLanguages] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])


  useEffect(() => {
    const getLanguages = async () => {
      const ISO6391Obj = await import("iso-639-1");
      const allLanguages = [
        ...ISO6391Obj.default.getAllNames().sort((l1, l2) => (l1 < l2 ? -1 : 1)),
        "Prefer not to say",
      ]
      setLanguages(allLanguages)
    }

    const getCountries = async () => {
      const cscObj = await import("country-state-city");
      const allCountries = cscObj.Country.getAllCountries().map(cur => cur.name)
      setCountries(allCountries)
    }
    getLanguages()
    getCountries()
  }, [])

  // const getStateOfCountry = useCallback(() => {
  //   console.log('will get country')
  //   if (!values.country) return []
  //   console.log(1)
  //   const allStates = State.getStatesOfCountry(values.country).map(cur => cur.name)
  //   console.log(2, allStates)
  //   return allStates
  //   // return []
  // }, [values.country])

  const statesOfCountry = useMemo(() => {
    console.log('will get country')
    if (!values.country) return []
    // const countryCode = countries.find(cur => cur.)
    console.log(1)
    const allStates = State.getStatesOfCountry(values.country).map(cur => cur.name)
    console.log(2, allStates)
    return allStates
    // return []
  }, [values.country])

  return (
    <>
      <Autocomplete
        id="language"
        value={values.language}
        onChange={(_, value) => setFieldValue("language", value)}
        onBlur={() => setTouched({ ...touched, language: true })}
        options={languages}
        renderInput={params => <TextField {...params} label="Language" />}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <TextField
          id="age"
          name="age"
          label="Age"
          type={'number'}
          value={values.age}
          onChange={handleChange}
          onBlur={handleBlur}
          variant="outlined"
          error={Boolean(errors.age) && Boolean(touched.age)}
          fullWidth
          sx={{ mb: "16px" }}
        />
        <Autocomplete
          id="gender"
          value={values.gender}
          onChange={(_, value) => setFieldValue("gender", value)}
          onBlur={() => setTouched({ ...touched, gender: true })}
          options={GENDER_VALUES}
          renderInput={params => <TextField {...params} label="gender" />}
          fullWidth
          sx={{ mb: "16px" }}
        />
      </Box>
      {values.gender === 'Not listed (Please specify)' &&
        < TextField
          id="genderOtherValue"
          name="genderOtherValue"
          label="Please specify your gender."
          value={values.genderOtherValue}
          onChange={handleChange}
          onBlur={handleBlur}
          variant="outlined"
          error={Boolean(errors.genderOtherValue) && Boolean(touched.genderOtherValue)}
          fullWidth
          sx={{ mb: "16px" }}
        />
      }
      <Autocomplete
        id="ethnicity"
        value={values.ethnicity}
        onChange={(_, value) => setFieldValue("ethnicity", value)}
        onBlur={() => setTouched({ ...touched, ethnicity: true })}
        // structure based from https://blog.hubspot.com/service/survey-demographic-questions
        options={ETHNICITY_VALUES}
        renderInput={params => <TextField {...params} label="Ethnicity" />}
        fullWidth
        multiple
        sx={{ mb: "16px" }}
      />
      {values.ethnicity.includes('Not listed (Please specify)') &&
        < TextField
          id="genderOtherValue"
          name="genderOtherValue"
          label="Please specify your gender."
          value={values.genderOtherValue}
          onChange={handleChange}
          onBlur={handleBlur}
          variant="outlined"
          error={Boolean(errors.genderOtherValue) && Boolean(touched.genderOtherValue)}
          fullWidth
          sx={{ mb: "16px" }}
        />
      }
      <Autocomplete
        id="country"
        value={values.country}
        onChange={(_, value) => setFieldValue("country", value)}
        onBlur={() => setTouched({ ...touched, country: true })}
        options={countries}
        renderInput={params => <TextField {...params} label="Country" />}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Autocomplete
          id="state"
          value={values.state}
          onChange={(_, value) => setFieldValue("state", value)}
          onBlur={() => setTouched({ ...touched, state: true })}
          options={statesOfCountry}
          renderInput={params => <TextField {...params} label="State" />}
          fullWidth
          sx={{ mb: "16px" }}
        />
        <Autocomplete
          id="city"
          value={values.city}
          onChange={(_, value) => setFieldValue("city", value)}
          onBlur={() => setTouched({ ...touched, city: true })}
          options={["a", "b"]}
          renderInput={params => <TextField {...params} label="City" />}
          fullWidth
          sx={{ mb: "16px" }}
        />
      </Box>
      <TextField
        id="reason"
        name="reason"
        label="Reason for Joining "
        value={values.reason}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        error={Boolean(errors.reason) && Boolean(touched.reason)}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <Autocomplete
        id="foundFrom"
        value={values.foundFrom}
        onChange={(_, value) => setFieldValue("foundFrom", value)}
        onBlur={() => setTouched({ ...touched, foundFrom: true })}
        options={["a", "b"]}
        renderInput={params => <TextField {...params} label="How did you hear about us? " />}
        fullWidth
        sx={{ mb: "16px" }}
      />
    </>
  );
};
