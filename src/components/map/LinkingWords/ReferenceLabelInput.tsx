import { TextField } from "@mui/material";
import React, { useState } from "react";

type ReferenceLabelInputProps = {
  reference: any;
  referenceLabelChangeHandler: any;
  inputProperties: { id: string; name: string };
};

export const ReferenceLabelInput = ({
  reference,
  referenceLabelChangeHandler,
  inputProperties,
}: ReferenceLabelInputProps) => {
  const [labelCopy, setLabelCopy] = useState(reference.label);

  return (
    <TextField
      id={inputProperties.id}
      name={inputProperties.name}
      type="text"
      value={labelCopy}
      onChange={e => setLabelCopy(e.target.value)}
      onBlur={referenceLabelChangeHandler}
      label="Enter page # or voice/video time"
      size="small"
    />
  );
};
