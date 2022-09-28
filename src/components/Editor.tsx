import { Button, TextField } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";

import MarkdownRender from "./Markdown/MarkdownRender";

type EditorProps = {
  label: string;
  value: string;
  setValue: (value: string) => void;
  readOnly?: boolean;
  fontSize?: string;
};

export const Editor = ({ label, value, setValue, readOnly = true, fontSize = "16px" }: EditorProps) => {
  // const [value, setValue] = React.useState<string>('');
  const [canEdit, setCanEdit] = useState(true);

  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setValue(event.target.value);
  // };

  // const handleMouseDown = (event: any) => {
  //   console.log('click in input', event)
  //   // event.target.focus()
  //   // event.target.select()
  //   if (event && event.button == 2) {
  //     event.preventDefault();
  //     event.stopPropagation();
  //     event.codemirrorIgnore = true;
  //     return false;
  //   } /*else if (this.props.readOnly) {
  //     setTimeout(() => {
  //       const content = this.getValue();
  //       if (content) {
  //         this.props.onChange(content);
  //       }
  //     }, 700);
  //   }*/
  // }

  return (
    <Box className={readOnly ? "HyperEditor ReadOnlyEditor" : "HyperEditor"} sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "end" }}>
        {!readOnly && <Button onClick={() => setCanEdit(!canEdit)}>Preview/Edit</Button>}
      </Box>
      {canEdit && !readOnly ? (
        <TextField
          id="editor-text-field"
          label={label}
          fullWidth
          multiline
          // maxRows={4}
          value={value}
          onChange={e => setValue(e.target.value)}
          className="EditableTextarea"
          // onMouseDown={handleMouseDown}
        />
      ) : (
        <Box sx={{ p: canEdit ? "0px" : "16px 14px" }}>
          <MarkdownRender fontSize={fontSize} text={value} />
        </Box>
      )}
    </Box>
  );
};

// CHECK: we can improve this, to only recalculate his size
// if previous height is different from current height,
// Because in every key down is recalculating all

// or maybe not call the worker and make a copy from title and content
// and change only that state and configure with z index
// to be in top, so if the content is height is always visible
