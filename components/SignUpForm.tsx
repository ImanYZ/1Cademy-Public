import { LoadingButton } from '@mui/lab';
import { Box, Button, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import { Formik, FormikErrors, FormikHelpers } from 'formik'
import React, { useState } from 'react'

import { signIn, signUp } from '../lib/firestoreClient/auth';
import { RE_EMAIL } from '../src/constants';

interface SignUpFormValues {
  name: string,
  email: string;
  password: string;
}

export const SignUpForm = () => {

  const steps = ['Account', 'Personal', 'Education'];

  const [activeStep, setActiveStep] = useState(0);




  const initialValues: SignUpFormValues = {
    name: '',
    email: '',
    password: ''
  }

  const validate = (values: SignUpFormValues) => {
    let errors: FormikErrors<SignUpFormValues> = {};
    if (!values.email) errors.email = "Required"
    if (values.email && !RE_EMAIL.test(values.email)) errors.email = "Invalid email address"
    if (!values.password) errors.password = "Required"
    return errors;
  };
  const onSubmit = async (values: SignUpFormValues, { setSubmitting }: FormikHelpers<SignUpFormValues>) => {
    console.log('values sing up', values)
    // const res = await signIn(values.email, values.password)
    await signUp(values.name, values.email, values.password)
    // console.log('res', res)
    setSubmitting(false);
  };

  return (
    <Box sx={{ my: '92px' }}>

      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          // if (isStepOptional(index)) {
          //   labelProps.optional = (
          //     <Typography variant="caption">Optional</Typography>
          //   );
          // }
          // if (isStepSkipped(index)) {
          //   stepProps.completed = false;
          // }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {/* {activeStep === steps.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </React.Fragment>
      )} */}

      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={onSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <TextField
              id="name"
              name="name"
              label="Name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              variant="outlined"
              error={Boolean(errors.name) && Boolean(touched.name)}
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
            />

            <Button type='button' sx={{ my: '40px' }}>Forgot Password?</Button>
            <Button disabled={isSubmitting} type='submit' variant='contained' fullWidth>LOG IN</Button>
            {/* <LoadingButton type="submit" color="primary" variant="contained" fullWidth loading={isSubmitting}>
              Submit
            </LoadingButton> */}
            {/* <ArrowForwardIcon sx={{ ml: "10px" }} /> */}
          </form>
        )}
      </Formik>
    </Box>
  )
}
