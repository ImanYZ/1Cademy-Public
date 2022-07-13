import { Autocomplete, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { ICity, ICountry, IState } from "country-state-city/dist/lib/interface";
import { FormikProps } from "formik";
import { useEffect, useState } from "react";
import { SignUpFormValues } from "src/knowledgeTypes";

import { ETHNICITY_VALUES, FOUND_FROM_VALUES, GENDER_VALUES } from "../lib/utils/constants";

type SignUpBasicInformationProps = {
  formikProps: FormikProps<SignUpFormValues>;
};

export const SignUpPersonalInfo = ({ formikProps }: SignUpBasicInformationProps) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue, setTouched } = formikProps;
  const [languages, setLanguages] = useState<string[]>([]);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);

  const [CSCByGeolocation, setCSCByGeolocation] = useState<{ country: string; state: string; city: string } | null>(
    null
  );

  useEffect(() => {
    const getLanguages = async () => {
      const ISO6391Obj = await import("iso-639-1");
      const allLanguages = [
        ...ISO6391Obj.default.getAllNames().sort((l1, l2) => (l1 < l2 ? -1 : 1)),
        "Prefer not to say"
      ];
      setLanguages(allLanguages);
    };
    getLanguages();
  }, []);

  useEffect(() => {
    const getCountries = async () => {
      const defaultCountry: ICountry = {
        name: "Prefer not to say",
        isoCode: "",
        phonecode: "",
        flag: "",
        currency: "",
        latitude: "",
        longitude: ""
      };
      const { Country } = await import("country-state-city");
      setCountries([...Country.getAllCountries(), defaultCountry]);
    };
    getCountries();
  }, []);

  useEffect(() => {
    if (values.country) return;
    if (CSCByGeolocation) return;

    const getCSCByGeolocation = async () => {
      const res = await axios.get("https://api.ipgeolocation.io/ipgeo?apiKey=4ddb5d78eaf24b12875c0eb5f790e495");
      if (!res.data) return;

      const { country_name, state_prov, city } = res.data;
      setCSCByGeolocation({ country: country_name, state: state_prov, city });
      if (!countries.filter(cur => cur.name === country_name)) return;

      setFieldValue("country", country_name);
      setFieldValue("state", state_prov);
      setFieldValue("city", city);
    };

    getCSCByGeolocation();
  }, [CSCByGeolocation, countries, setFieldValue, touched.country, values.country]);

  const updateStatesByCountry = async (currentCountry: string | null) => {
    if (!currentCountry) return [];

    const countryObject = countries.find(cur => cur.name === currentCountry);
    if (!countryObject) return [];

    const defaultState: IState = { name: "Prefer not to say", countryCode: "", isoCode: "" };
    const { State } = await import("country-state-city");
    setStates([...State.getStatesOfCountry(countryObject.isoCode), defaultState]);
  };

  const updateCitiesByState = async (currentState: string | null) => {
    if (!values.country) return [];
    if (!currentState) return [];

    const currentCountry = countries.find(cur => cur.name === values.country);
    if (!currentCountry) return [];

    const stateObject = states.find(cur => cur.name === currentState);
    if (!stateObject) return [];

    const defaultCountry: ICity = { name: "Prefer not to say", countryCode: "", stateCode: "" };
    const { City } = await import("country-state-city");
    setCities([...City.getCitiesOfState(currentCountry.isoCode, stateObject.isoCode), defaultCountry]);
  };

  const onChangeCountry = async (_: any, value: string | null) => {
    setFieldValue("country", value);
    setFieldValue("state", null);
    setFieldValue("city", null);

    await updateStatesByCountry(value);
  };

  const onChangeState = async (_: any, value: string | null) => {
    setFieldValue("state", value);
    setFieldValue("city", null);

    await updateCitiesByState(value);
  };

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
          type={"number"}
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
          renderInput={params => <TextField {...params} label="Gender" />}
          fullWidth
          sx={{ mb: "16px" }}
        />
      </Box>
      {values.gender === "Not listed (Please specify)" && (
        <TextField
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
      )}
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
      {values.ethnicity.includes("Not listed (Please specify)") && (
        <TextField
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
      )}
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
          options={states.map(cur => cur.name)}
          renderInput={params => <TextField {...params} label="State" />}
          fullWidth
          sx={{ mb: "16px" }}
        />
        <Autocomplete
          id="city"
          value={values.city}
          onChange={(_, value) => setFieldValue("city", value)}
          onBlur={() => setTouched({ ...touched, city: true })}
          options={cities.map(cur => cur.name)}
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
        renderInput={params => <TextField {...params} label="How did you hear about us?" />}
        fullWidth
        sx={{ mb: "16px" }}
      />
      {values.foundFrom === "Not listed (Please specify)" && (
        <TextField
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
      )}
    </>
  );
};
