import React from 'react'
import { Box, TextareaAutosize } from '@mui/material'

const IdeateComp = () => {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Let's Ideate Together!
      </Box>
      <Box>
        First, tell me whatever you'd like to have, not to have in your writing.
      </Box>
      <TextareaAutosize
        aria-label="Ideas Textarea"
        minRows={4}
        placeholder="Write your ideas here"
        style={{
          width: '100%',
          padding: '10px',
          marginTop: '10px',
        }}
      />
    </Box>
  )
}

export default IdeateComp
