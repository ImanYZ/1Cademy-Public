import { Box, Button, Tab, Tabs, TextField, Typography } from '@mui/material'
import { brown } from '@mui/material/colors'
import React from 'react'

import { SignInForm } from '../components/SignInForm';


const AuthPage = () => {

  const [value, setValue] = React.useState(0);

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      ':before': {
        content: '""',
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        background: brown[700],
        backgroundImage: `url(${'/LibraryBackground.jpg'})`,
        backgroundPosition: 'center',
        filter: "brightness(0.25)"
      }
    }}>

      <Box sx={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Box sx={{
          width: '1300px',
          height: '800px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr'
        }}>
          <Box sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: theme => theme.palette.common.white,

            ':before': {
              content: '""',
              width: '100%',
              height: '100%',
              position: 'absolute',
              background: brown[700],
              backgroundImage: `url(${'/LibraryBackground.jpg'})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              filter: "brightness(0.6)",
            }
          }}>
            <Box sx={{ zIndex: 1 }}>
              <Typography textAlign={'center'} variant='h4'>Welcome to 1Cademy</Typography>
              <Typography textAlign={'center'} variant='subtitle1'>We Visualize Learning Pathways from Books & Research Papers.</Typography>
            </Box>
          </Box>
          <Box sx={{
            width: '650px',
            height: '100%',
            p: '63px 125px',
            background: theme => theme.palette.common.darkGrayBackground
          }}>
            <Box sx={{ border: 'dashed 2px royalBlue' }} >
              <Tabs
                value={value}
                onChange={(event: React.SyntheticEvent, newValue: number) => { setValue(newValue) }}
                aria-label="basic tabs example"
                sx={{
                  "& .MuiTab-root": {
                    color: "common.white"
                  },
                  "& .MuiTab-root.Mui-selected": {
                    backgroundColor: 'common.white',
                    color: "common.darkGrayBackground"
                  },
                  "& .MuiTabs-indicator": {
                    display: 'none'
                  }
                }}
              >
                <Tab label="LOG IN" sx={{ width: '50%', }} />
                <Tab disabled={true} label="SIGN UP" sx={{ width: '50%', }} />
              </Tabs>
              {value === 0 && <SignInForm />}
              {value === 1 && <Box>

              </Box>}
            </Box>
          </Box>

        </Box>
      </Box>
    </Box >
  )
}

export default AuthPage