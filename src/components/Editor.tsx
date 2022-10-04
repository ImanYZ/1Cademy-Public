import { Input, InputLabel, Switch, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { SxProps, Theme } from "@mui/system";
import React, { useMemo, useRef, useState } from "react";

import MarkdownRender from "./Markdown/MarkdownRender";

type EditorProps = {
  label: string;
  value: string;
  readOnly: boolean;
  setValue: (value: string) => void;
  sxPreview?: SxProps<Theme>;
  onBlurCallback?: (value: string) => void;
};

type EditorOptions = "EDIT" | "PREVIEW";

export const Editor = ({ label, value, setValue, readOnly, sxPreview, onBlurCallback }: EditorProps) => {
  // const [value, setValue] = React.useState<string>('');
  // const [canEdit, setCanEdit] = useState(true);
  const inputRef = useRef(null);
  const [option, setOption] = useState<EditorOptions>("EDIT");

  const onChangeOption = (newOption: boolean) => {
    setOption(newOption ? "PREVIEW" : "EDIT");
  };
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

  const inputId = useMemo(
    () =>
      `editor-text-field-${label
        .replace(/[^A-Za-z]/g, "")
        .split(" ")
        .join("-")}`,
    [label]
  );

  return (
    <Box className={readOnly ? "HyperEditor ReadOnlyEditor" : "HyperEditor"} sx={{ width: "100%" }}>
      {!readOnly && (
        <InputLabel htmlFor={inputId} sx={{ fontWeight: 490 }}>
          {label}
        </InputLabel>
      )}

      {!readOnly && (
        <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
          <Typography onClick={() => setOption("PREVIEW")} sx={{ cursor: "pointer", fontSize: "14px" }}>
            Preview
          </Typography>
          <Switch checked={option === "EDIT"} onClick={() => onChangeOption(option === "EDIT")} size="small" />
          <Typography onClick={() => setOption("EDIT")} sx={{ cursor: "pointer", fontSize: "14px" }}>
            Edit
          </Typography>

          {/* <Button
            color={"secondary"}
            variant={option === "EDIT" ? "contained" : "outlined"}
            onClick={() => setOption("EDIT")}
            size="small"
            sx={{ py: "0px" }}
          >
            Edit
          </Button>
          <Button
            color={"secondary"}
            variant={option === "PREVIEW" ? "contained" : "outlined"}
            onClick={() => setOption("PREVIEW")}
            size="small"
            sx={{ py: "0px" }}
          >
            Preview
          </Button> */}
        </Box>
      )}

      {/* {!readOnly && <hr />} */}
      {/* sx={{ border: readOnly ? undefined : "solid 2px gray" }} */}
      <Box>
        {option === "EDIT" && !readOnly ? (
          <Input
            id={inputId}
            ref={inputRef}
            fullWidth
            multiline
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={onBlurCallback ? e => onBlurCallback(e.target.value) : undefined}
            // onBlur={onBlurCallback ? e => onBlurCallback(e.target.value) : undefined}
            sx={{ p: "0px", m: "0px", fontWeight: 400, lineHeight: "24px" }}
          />
        ) : (
          <Box>
            <MarkdownRender
              text={value}
              customClass={"custom-react-markdown"}
              sx={{ ...sxPreview, fontWeight: 400, letterSpacing: "inherit" }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

// CHECK: we can improve this, to only recalculate his size
// if previous height is different from current height,
// Because in every key down is recalculating all

// or maybe not call the worker and make a copy from title and content
// and change only that state and configure with z index
// to be in top, so if the content is height is always visible
