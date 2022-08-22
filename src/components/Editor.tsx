import { Button, TextField } from '@mui/material'
import { Box } from '@mui/system';
import React, { useState } from 'react'

import MarkdownRender from './Markdown/MarkdownRender';

type EditorProps = {
  label: string,
  content: string,
  onChangeContent: (content: string) => void,
  readonly?: boolean,
}

export const Editor = ({ label, content, onChangeContent, readonly = true }: EditorProps) => {

  // const [value, setValue] = React.useState<string>('');
  const [canEdit, setCanEdit] = useState(true)

  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setValue(event.target.value);
  // };

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
    <Box sx={{ with: '100%', border: 'solid 2px royalBlue' }}>
      <Box sx={{ display: 'flex', justifyContent: 'end', border: 'dashed 2px royalBlue' }}>
        {!readonly && <Button onClick={() => setCanEdit(!canEdit)}>Preview/Edit</Button>}
      </Box>
      {
        (canEdit && !readonly)
          ? <TextField
            id="editor-text-field"
            label={label}
            fullWidth
            multiline
            maxRows={4}
            value={content}
            onChange={e => onChangeContent(e.target.value)}
            onMouseDown={handleMouseDown}
          />
          : <MarkdownRender fontSize="30px" text={content} />
      }
    </Box>
  )
}
