import { InputLabel, Switch, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { SxProps, Theme } from "@mui/system";
import React, { useCallback, useMemo, useState } from "react";

import MarkdownRender from "./Markdown/MarkdownRender";

type EditorProps = {
  label: string;
  value: string;
  focus?: boolean;
  readOnly: boolean;
  setValue: (value: string) => void;
  sxPreview?: SxProps<Theme>;
  onBlurCallback?: (value: string) => void;
  error?: boolean;
  helperText?: String;
};

type EditorOptions = "EDIT" | "PREVIEW";

export const Editor = ({
  label,
  value,
  setValue,
  readOnly,
  sxPreview,
  onBlurCallback,
  focus = false,
  error = false,
  helperText,
}: EditorProps) => {
  // const [value, setValue] = React.useState<string>('');
  // const [canEdit, setCanEdit] = useState(true);
  // const inputRef = useRef<HTMLElement>(null);
  const [option, setOption] = useState<EditorOptions>("EDIT");
  const [focused, setFocused] = useState(false);
  // const inputRef = useRef(null);
  const onChangeOption = (newOption: boolean) => {
    setOption(newOption ? "PREVIEW" : "EDIT");
  };
  const onKeyEnter = (e: any) => {
    if (e.keyCode === 13) {
      onChangeOption(option === "EDIT");
    }
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

  const titleFocus = useCallback(
    (inputTitle: HTMLElement) => {
      if (!focus) return;
      if (focused) return;
      if (!inputTitle) return;
      inputTitle.focus();
      setFocused(true);
    },
    [focus, focused]
  );

  const moveToEnd = useCallback((e: any) => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  }, []);

  return (
    <Box className={readOnly ? "HyperEditor ReadOnlyEditor" : "HyperEditor"} sx={{ width: "100%" }}>
      {!readOnly && (
        <InputLabel htmlFor={inputId} sx={{ fontWeight: 490 }}>
          {label}
        </InputLabel>
      )}
      <Box sx={{ display: "flex", flexDirection: "column-reverse" }}>
        <Box>
          {option === "EDIT" && !readOnly ? (
            <TextField
              variant="standard"
              id={inputId}
              inputRef={titleFocus}
              fullWidth
              multiline
              value={value}
              onChange={e => setValue(e.target.value)}
              onBlur={onBlurCallback ? e => onBlurCallback(e.target.value) : undefined}
              onFocus={moveToEnd}
              sx={{ p: "0px", m: "0px", fontWeight: 400, lineHeight: "24px" }}
              error={error}
              helperText={helperText}
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
        {!readOnly && (
          <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
            <Typography
              onClick={() => setOption("PREVIEW")}
              sx={{ cursor: "pointer", fontSize: "14px", fontWeight: 490, color: "inherit" }}
            >
              Preview
            </Typography>
            <Switch
              checked={option === "EDIT"}
              onClick={() => onChangeOption(option === "EDIT")}
              size="small"
              onKeyDown={onKeyEnter}
            />
            <Typography
              onClick={() => setOption("EDIT")}
              sx={{ cursor: "pointer", fontSize: "14px", fontWeight: 490, color: "inherit" }}
            >
              Edit
            </Typography>
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
