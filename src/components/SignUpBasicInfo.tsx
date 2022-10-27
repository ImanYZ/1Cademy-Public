import { Box, FormControlLabel, FormGroup, Switch, TextField, Typography } from "@mui/material";
import { FormikProps } from "formik";
import React, { useEffect, useState } from "react";
import { SignUpFormValues } from "src/knowledgeTypes";

import { useAuth } from "../context/AuthContext";
import { useTagsTreeView } from "../hooks/useTagsTreeView";
import { ToUpperCaseEveryWord } from "../lib/utils/utils";
import { ChosenTag, MemoizedTagsSearcher } from "./TagsSearcher";

export type SignUpBasicInformationProps = {
  formikProps: FormikProps<SignUpFormValues>;
};

export const SignUpBasicInfo = ({ formikProps }: SignUpBasicInformationProps) => {
  const [, { dispatch }] = useAuth();
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
    </Box>
  );
};
