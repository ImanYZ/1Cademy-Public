import { Button, Input, InputLabel } from "@mui/material";
import { Box } from "@mui/system";
import { SxProps, Theme } from "@mui/system";
import React, { useMemo, useRef, useState } from "react";

import MarkdownRender from "./Markdown/MarkdownRender";

type EditorProps = {
  label: string;
  value: string;
  setValue: (value: string) => void;
  sxPreview?: SxProps<Theme>;
  readOnly?: boolean;
};

type EditorOptions = "EDIT" | "PREVIEW";

export const Editor = ({ label, value, setValue, readOnly = true, sxPreview }: EditorProps) => {
  // const [value, setValue] = React.useState<string>('');
  // const [canEdit, setCanEdit] = useState(true);
  const inputRef = useRef(null);
  const [option, setOption] = useState<EditorOptions>(readOnly ? "PREVIEW" : "EDIT");

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
      {!readOnly && <InputLabel htmlFor={inputId}>{label}</InputLabel>}

      <Box sx={{ p: "0px 0px 5px 0px", display: "flex", justifyContent: "end", gap: "5px" }}>
        {
          !readOnly && (
            // <Tabs value={option} onChange={onChangeOption} aria-label="Editor options">
            //   <Tab label="Edit" sx={{ p: "0px" }} />
            //   <Tab label="Preview" sx={{ p: "0px" }} />
            // </Tabs>
            // <ToggleButtonGroup value={option} onChange={onChangeOption} aria-label="text alignment">
            //   <ToggleButton value="EDIT" size="small" aria-label="left aligned">
            //     {/* <FormatAlignLeftIcon /> */}
            //     Edit
            //   </ToggleButton>
            //   <ToggleButton value="PREVIEW" size="small" aria-label="centered">
            //     {/* <FormatAlignCenterIcon /> */}
            //     Preview
            //   </ToggleButton>
            // </ToggleButtonGroup>
            // <ButtonGroup size="small" aria-label="small button group">
            <>
              <Button
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
              </Button>
            </>
            // </ButtonGroup>
          )
          // (
          //   canEdit ? (
          //     <Button variant="outlined" size="small" onClick={() => setCanEdit(false)}>
          //       Preview
          //     </Button>
          //   ) : (
          //     <Button variant="outlined" size="small" onClick={() => setCanEdit(true)}>
          //       Edit
          //     </Button>
          //   )
          // )
        }
      </Box>

      {/* {!readOnly && <hr />} */}
      <Box sx={{ border: readOnly ? undefined : "solid 2px gray" }}>
        {option === "EDIT" && !readOnly ? (
          <Input
            id={inputId}
            ref={inputRef}
            fullWidth
            multiline
            value={value}
            onChange={e => setValue(e.target.value)}
            sx={{ p: "0px", m: "0px", fontWeight: 250 }}
          />
        ) : (
          <Box sx={{ p: readOnly ? "0px" : "0px" }}>
            <MarkdownRender
              text={value}
              customClass={"custom-react-markdown"}
              sx={{ ...sxPreview, fontWeight: readOnly ? 300 : 250, letterSpacing: "inherit" }}
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
