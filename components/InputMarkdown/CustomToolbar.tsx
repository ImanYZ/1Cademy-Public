import FormatBoldIcon from "@mui/icons-material/FormatBold";
import { IconButton, Toolbar } from "@mui/material";
import React from "react";
import { useSlate } from "slate-react";

import { toggleMark } from "./utils";

export const CustomToolbar = () => {
  const editor = useSlate();

  // console.log('editor', editor)

  const onToggleBold = () => {
    toggleMark(editor, "bold");
    // console.log('Value', Value)
    // Editor.addMark(editor, 'bold', true)
    // toggleMark(editorSlate, format);
  };

  return (
    <Toolbar variant="dense">
      <IconButton aria-label="menu" onClick={onToggleBold}>
        <FormatBoldIcon />
      </IconButton>
    </Toolbar>
  );
};
