import { Autocomplete, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { City, Country, State } from 'country-state-city';
import { ICity, ICountry, IState } from "country-state-city/dist/lib/interface";
import { FormikProps } from "formik";
import { useEffect, useMemo, useState } from "react";
import { ETHNICITY_VALUES, FOUND_FROM_VALUES, GENDER_VALUES } from "../lib/utils/constants";
import { SignUpFormValues } from "./SignUpForm";













type SignUpBasicInformationProps = {
  formikProps: FormikProps<SignUpFormValues>;
};

export const SignUpPersonalInfo = ({ formikProps }: SignUpBasicInformationProps) => {

  const { values, errors, touched, handleChange, handleBlur, setFieldValue, setTouched } = formikProps;
  const [languages, setLanguages] = useState<string[]>([])


  useEffect(() => {
    const getLanguages = async () => {
      const ISO6391Obj = await import("iso-639-1");
      const allLanguages = [
        ...ISO6391Obj.default.getAllNames().sort((l1, l2) => (l1 < l2 ? -1 : 1)),
        "Prefer not to say",
      ]
      setLanguages(allLanguages)
    }
    getLanguages()
  }, [])

  const countries = useMemo(() => {
    const defaultCountry: ICountry = {
      name: "Prefer not to say", isoCode: '', phonecode: '', flag: '', currency: '', latitude: '', longitude: ''
    }
    return [...Country.getAllCountries(), defaultCountry]
  }, [])

  const statesOfCountry = useMemo((): IState[] => {
    if (!values.country) return []

    const currentCountry = countries.find(cur => cur.name === values.country)
    if (!currentCountry) return []

    const defaultState: IState = { name: "Prefer not to say", countryCode: '', isoCode: '' }
    return [...State.getStatesOfCountry(currentCountry.isoCode), defaultState]
  }, [countries, values.country])

  const citiesOfState = useMemo(() => {
    if (!values.state) return []

    const currentCountry = countries.find(cur => cur.name === values.country)
    if (!currentCountry) return []

    const currentState = statesOfCountry.find(cur => cur.name === values.state)
    if (!currentState) return []

    const defaultCountry: ICity = { name: "Prefer not to say", countryCode: '', stateCode: '', isoCode: '' }
    return [...City.getCitiesOfState(currentCountry.isoCode, currentState.isoCode), defaultCountry]
  }, [values.state, values.country, countries, statesOfCountry])

  const onChangeCountry = (_: any, value: string | null) => {
    setFieldValue("country", value)
    setFieldValue("state", null)
    setFieldValue("city", null)
  }

  const onChangeState = (_: any, value: string | null) => {
    setFieldValue("state", value)
    setFieldValue("city", null)
  }

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
          id="ethnicityOtherValue"
          name="ethnicityOtherValue"
          label="Please specify your ethnicity."
          value={values.ethnicityOtherValue}
          onChange={handleChange}
          onBlur={handleBlur}
          variant="outlined"
          error={Boolean(errors.ethnicityOtherValue) && Boolean(touched.ethnicityOtherValue)}
          fullWidth
          sx={{ mb: "16px" }}
        />
      }
      <Autocomplete
        id="country"
        value={values.country}
        onChange={onChangeCountry}
        onBlur={() => setTouched({ ...touched, country: true })}
        options={countries.map(cur => cur.name)}
        renderInput={params => <TextField {...params} label="Country" />}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Autocomplete
          id="state"
          value={values.state}
          onChange={onChangeState}
          onBlur={() => setTouched({ ...touched, state: true })}
          options={statesOfCountry.map(cur => cur.name)}
          renderInput={params => <TextField {...params} label="State" />}
          fullWidth
          sx={{ mb: "16px" }}
        />
        <Autocomplete
          id="city"
          value={values.city}
          onChange={(_, value) => setFieldValue("city", value)}
          onBlur={() => setTouched({ ...touched, city: true })}
          options={citiesOfState.map(cur => cur.name)}
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
        options={FOUND_FROM_VALUES}
        renderInput={params => <TextField {...params} label="How did you hear about us? " />}
        fullWidth
        sx={{ mb: "16px" }}
      />
      {values.foundFrom === 'Not listed (Please specify)' &&
        < TextField
          id="foundFromOtherValue"
          name="foundFromOtherValue"
          label="Please specify"
          value={values.foundFromOtherValue}
          onChange={handleChange}
          onBlur={handleBlur}
          variant="outlined"
          error={Boolean(errors.foundFromOtherValue) && Boolean(touched.foundFromOtherValue)}
          fullWidth
          sx={{ mb: "16px" }}
        />
      }
    </>
  );
};
