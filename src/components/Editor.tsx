import { Button, TextField } from '@mui/material'
import { Box } from '@mui/system';
import React, { useState } from 'react'

export const Editor = () => {

  const [value, setValue] = React.useState('Controlled');
  const [canEdit, setCanEdit] = useState(true)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleMouseDown = (event: any) => {
    console.log('click in input', event)
    // event.target.focus()
    // event.target.select()
    if (event && event.button == 2) {
      event.preventDefault();
      event.stopPropagation();
      event.codemirrorIgnore = true;
      return false;
    } /*else if (this.props.readOnly) {
      setTimeout(() => {
        const content = this.getValue();
        if (content) {
          this.props.onChange(content);
        }
      }, 700);
    }*/
  }

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
        <Button>Preview</Button>
      </Box>
      <TextField
        id="outlined-multiline-flexible"
        label="Multiline"
        multiline
        maxRows={4}
        value={value}
        onChange={handleChange}
        onMouseDown={handleMouseDown}
      // onClick="this.select()"
      />
    </div>
  )
}
