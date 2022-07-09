import { Autocomplete, TextField } from '@mui/material'
import { Box, display } from '@mui/system'
import { FormikProps } from 'formik'
import React from 'react'

import { SignUpFormValues } from './SignUpForm'

type SignUpBasicInformationProps = {
  formikProps: FormikProps<SignUpFormValues>
}

export const SignUpPersonalInfo = ({ formikProps }: SignUpBasicInformationProps) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue, setTouched } = formikProps
  return (<>
    <Autocomplete
      id="language"
      value={values.language}
      onChange={(_, value) => setFieldValue('language', value)}
      onBlur={() => setTouched({ ...touched, language: true })}
      options={['a', 'b']}
      renderInput={(params) => <TextField {...params} label="Language" />}
      fullWidth
      sx={{ mb: '16px' }}
    />
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <Autocomplete
        id="age"
        value={values.age}
        onChange={(_, value) => setFieldValue('age', value)}
        onBlur={() => setTouched({ ...touched, age: true })}
        options={['1', '2']}
        renderInput={(params) => <TextField {...params} label="Age" />}
        fullWidth
        sx={{ mb: '16px' }}
      />
      <Autocomplete
        id="gender"
        value={values.gender}
        onChange={(_, value) => setFieldValue('gender', value)}
        onBlur={() => setTouched({ ...touched, gender: true })}
        options={['a', 'b']}
        renderInput={(params) => <TextField {...params} label="gender" />}
        fullWidth
        sx={{ mb: '16px' }}
      />
    </Box>
    <Autocomplete
      id="ethnicity"
      value={values.ethnicity}
      onChange={(_, value) => setFieldValue('ethnicity', value)}
      onBlur={() => setTouched({ ...touched, ethnicity: true })}
      options={['a', 'b']}
      renderInput={(params) => <TextField {...params} label="Ethnicity" />}
      fullWidth
      sx={{ mb: '16px' }}
    />
    <Autocomplete
      id="country"
      value={values.country}
      onChange={(_, value) => setFieldValue('country', value)}
      onBlur={() => setTouched({ ...touched, country: true })}
      options={['a', 'b']}
      renderInput={(params) => <TextField {...params} label="Country" />}
      fullWidth
      sx={{ mb: '16px' }}
    />
    <Autocomplete
      id="country"
      value={values.country}
      onChange={(_, value) => setFieldValue('country', value)}
      onBlur={() => setTouched({ ...touched, country: true })}
      options={['a', 'b']}
      renderInput={(params) => <TextField {...params} label="Country" />}
      fullWidth
      sx={{ mb: '16px' }}
    />
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <Autocomplete
        id="state"
        value={values.state}
        onChange={(_, value) => setFieldValue('state', value)}
        onBlur={() => setTouched({ ...touched, state: true })}
        options={['a', 'b']}
        renderInput={(params) => <TextField {...params} label="State" />}
        fullWidth
        sx={{ mb: '16px' }}
      />
      <Autocomplete
        id="city"
        value={values.city}
        onChange={(_, value) => setFieldValue('city', value)}
        onBlur={() => setTouched({ ...touched, city: true })}
        options={['a', 'b']}
        renderInput={(params) => <TextField {...params} label="City" />}
        fullWidth
        sx={{ mb: '16px' }}
      />
    </Box>
    <TextField
      id="reason"
      name='reason'
      label="Reason for Joining "
      value={values.reason}
      onChange={handleChange}
      onBlur={handleBlur}
      variant="outlined"
      error={Boolean(errors.reason) && Boolean(touched.reason)}
      fullWidth
      sx={{ mb: '16px' }}
    />
    <Autocomplete
      id="foundFrom"
      value={values.foundFrom}
      onChange={(_, value) => setFieldValue('foundFrom', value)}
      onBlur={() => setTouched({ ...touched, foundFrom: true })}
      options={['a', 'b']}
      renderInput={(params) => <TextField {...params} label="How did you hear about us? " />}
      fullWidth
      sx={{ mb: '16px' }}
    />
  </>)
}
