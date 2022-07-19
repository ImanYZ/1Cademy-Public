import { FormControlLabel, FormGroup, Switch, TextField, Typography } from "@mui/material";
import { FormikProps } from "formik";
import React, { useEffect } from "react";
import { SignUpFormValues } from "src/knowledgeTypes";

import { use1AcademyTheme } from "../context/ThemeContext";
import { useTagsTreeView } from "../hooks/useTagsTreeView";
import { useAuthLayout } from "./layouts/AuthLayout";
import { MemoizedTagsExploratorySearcher } from "./TagsExploratorySearcher";

export type SignUpBasicInformationProps = {
  formikProps: FormikProps<SignUpFormValues>;
};

export const SignUpBasicInfo = ({ formikProps }: SignUpBasicInformationProps) => {
  const [setBackground] = useAuthLayout();
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formikProps;
  const [allTags, setAllTags] = useTagsTreeView(values.tagId ? [values.tagId] : []);
  const [res] = use1AcademyTheme();

  useEffect(() => {
    const getFirstTagChecked = () => {
      const tagSelected = Object.values(allTags).find(cur => cur.checked);
      if (!tagSelected) return;

      setFieldValue("tagId", tagSelected.nodeId);
      setFieldValue("tag", tagSelected.title);
    };

    getFirstTagChecked();
  }, [allTags, setFieldValue]);

  const getDisplayNameValue = () => {
    if (values.chooseUname) return values.username || "Your Username";
    return values.firstName || values.lastName ? values.firstName + " " + values.lastName : "Your Full Name";
  };

  return (
    <>
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
              checked={values.theme === "Light"}
              onChange={() => {
                setFieldValue("theme", values.theme === "Light" ? "Dark" : "Light");
                res.setThemeMode(values.theme === "Light" ? "dark" : "light");
              }}
            />
          }
          label={`Theme: ${values.theme === "Light" ? "🌞" : "🌜"}`}
        />
      </FormGroup>

      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={values.background === "Color"}
              onChange={() => {
                setFieldValue("background", values.background === "Color" ? "Image" : "Color");
                setBackground(values.background);
              }}
            />
          }
          label={`Background: ${values.background === "Color" ? "Color" : "Image"}`}
        />
      </FormGroup>

      <FormGroup>
        <FormControlLabel
          control={
            <Switch checked={values.chooseUname} onChange={() => setFieldValue("chooseUname", !values.chooseUname)} />
          }
          label={`Display name: ${getDisplayNameValue()}`}
        />
      </FormGroup>

      <FormGroup sx={{ mt: "20px" }}>
        <MemoizedTagsExploratorySearcher allTags={allTags} setAllTags={setAllTags} sx={{ maxHeight: "200px" }} />
        <Typography sx={{ mt: "20px", color: theme => theme.palette.common.white }}>
          You're going to be a member of: <b>{values.tag}</b>
        </Typography>
      </FormGroup>
    </>
  );
};
