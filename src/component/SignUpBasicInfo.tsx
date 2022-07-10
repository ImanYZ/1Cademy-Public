import { TextField } from '@mui/material'
import { FormikProps } from 'formik'
import React from 'react'

import { SignUpFormValues } from './SignUpForm'

type SignUpBasicInformationProps = {
  formikProps: FormikProps<SignUpFormValues>
}

export const SignUpBasicInfo = ({ formikProps }: SignUpBasicInformationProps) => {
  const { values, errors, touched, handleChange, handleBlur } = formikProps
  return (<>
    <TextField
      id="firstName"
      name="firstName"
      label="First Name"
      value={values.firstName}
      onChange={handleChange}
      onBlur={handleBlur}
      variant="outlined"
      error={Boolean(errors.firstName) && Boolean(touched.firstName)}
      fullWidth
      sx={{ mb: '16px' }}
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
      fullWidth
      sx={{ mb: '16px' }}
    />
    <TextField
      id="email"
      name="email"
      label="Email"
      type='email'
      value={values.email}
      onChange={handleChange}
      onBlur={handleBlur}
      variant="outlined"
      error={Boolean(errors.email) && Boolean(touched.email)}
      fullWidth
      sx={{ mb: '16px' }}
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
      fullWidth
      sx={{ mb: '16px' }}
    />
    <TextField
      id="password"
      name='password'
      label="Password"
      type='password'
      value={values.password}
      onChange={handleChange}
      onBlur={handleBlur}
      variant="outlined"
      error={Boolean(errors.password) && Boolean(touched.password)}
      fullWidth
      sx={{ mb: '16px' }}
    />
    <TextField
      id="passwordConfirmation"
      name='passwordConfirmation'
      label="Re-enter Password"
      type='password'
      value={values.passwordConfirmation}
      onChange={handleChange}
      onBlur={handleBlur}
      variant="outlined"
      error={Boolean(errors.passwordConfirmation) && Boolean(touched.passwordConfirmation)}
      fullWidth
      sx={{ mb: '16px' }}
    />
  </>)
}
