import { TextField } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { startTransition, useState } from "react";

type ReferenceLabelInputProps = {
  reference: any;
  referenceLabelChangeHandler: (newLabel: string) => void;
  inputProperties: { id: string; name: string };
  sx?: SxProps<Theme>;
};

export const ReferenceLabelInput = ({
  reference,
  referenceLabelChangeHandler,
  inputProperties,
  sx,
}: ReferenceLabelInputProps) => {
  const [labelCopy, setLabelCopy] = useState(reference.label);

  const onChange = (e: any) => {
    setLabelCopy(e.target.value);
    startTransition(() => referenceLabelChangeHandler(e.target.value));
  };

  return (
    <>
      <TextField
        id={inputProperties.id}
        name={inputProperties.name}
        variant="standard"
        placeholder="Enter page # or voice/video time"
        type="text"
        value={labelCopy}
        onChange={onChange}
        fullWidth
        size="small"
        sx={sx}
      />
    </>
  );
};
