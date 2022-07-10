import { Autocomplete, Checkbox, FormControlLabel, TextField } from '@mui/material'
import { Box, display } from '@mui/system'
import { FormikProps } from 'formik'
import React from 'react'

import { SignUpFormValues } from './SignUpForm'

type SignUpBasicInformationProps = {
  formikProps: FormikProps<SignUpFormValues>
}

export const SignUpProfessionalInfo = ({ formikProps }: SignUpBasicInformationProps) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue, setTouched } = formikProps
  return (<>
    <TextField
      id="occupation"
      name='occupation'
      label="Occupation"
      value={values.occupation}
      onChange={handleChange}
      onBlur={handleBlur}
      variant="outlined"
      error={Boolean(errors.occupation) && Boolean(touched.occupation)}
      fullWidth
      sx={{ mb: '16px' }}
    />
    <Autocomplete
      id="education"
      value={values.education}
      onChange={(_, value) => setFieldValue('education', value)}
      onBlur={() => setTouched({ ...touched, education: true })}
      options={['a', 'b']}
      renderInput={(params) => <TextField {...params} label="Education Level" />}
      fullWidth
      sx={{ mb: '16px' }}
    />
    <TextField
      id="institution"
      name='institution'
      label="Institution"
      value={values.institution}
      onChange={handleChange}
      onBlur={handleBlur}
      variant="outlined"
      error={Boolean(errors.institution) && Boolean(touched.institution)}
      fullWidth
      sx={{ mb: '16px' }}
    />
    <TextField
      id="major"
      name='major'
      label="Major"
      value={values.major}
      onChange={handleChange}
      onBlur={handleBlur}
      variant="outlined"
      error={Boolean(errors.major) && Boolean(touched.major)}
      fullWidth
      sx={{ mb: '16px' }}
    />
    <TextField
      id="fieldOfInterest"
      name='fieldOfInterest'
      label="Research field of interest (if any)"
      value={values.fieldOfInterest}
      onChange={handleChange}
      onBlur={handleBlur}
      variant="outlined"
      error={Boolean(errors.fieldOfInterest) && Boolean(touched.fieldOfInterest)}
      fullWidth
      sx={{ mb: '16px' }}
    />
    <FormControlLabel
      control={<Checkbox defaultChecked />}
      label="By clicking “Sign up”, you acknowledge that you agree to 1Cademy’s Terms of Use, Privacy Policy, and Cookie Policy"
      sx={{ mb: '16px' }}
    />
  </>)
}
