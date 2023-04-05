import React, { useState, useEffect, useCallback } from "react";

import { TextField } from "@mui/material";

const ValidatedInput = (props: any) => {
  const [touched, setTouched] = useState(false);
  const [enterred, setEnterred] = useState(false);
  useEffect(() => {
    if ("value" in props && props.value !== "") {
      setEnterred(true);
    }
  }, [props.value]);

  const textFieldFocus = useCallback(() => {
    setEnterred(true);
  }, []);

  const blurred = useCallback(() => {
    if (!("value" in props) || props.value === "") {
      setEnterred(false);
    }
    if (!touched) setTouched(true);
    if ("onBlur" in props && props.onBlur) {
      props.onBlur();
    }
  }, [props.value, props.onBlur]);

  return (
    <TextField
      variant="outlined"
      label={props.label}
      helperText={props.errorMessage && touched && <span>{props.errorMessage}</span>}
      id={props.identification}
      name={props.name}
      type={props.type}
      className={
        "validated validatedInput input " +
        props.className +
        " " +
        (props.errorMessage && touched ? "invalid" : "validate")
      }
      onFocus={textFieldFocus}
      onBlur={blurred}
      {...(props.onChange && { onChange: props.onChange })}
      {...(props.onKeyPress && { onKeyPress: props.onKeyPress })}
      {...((props.value || props.value === "") && { value: props.value })}
      {...(props.autocomplete && { autocomplete: props.autocomplete })}
      {...(props.disabled && { disabled: props.disabled })}
      // {...props.input}
      inputProps={props.inputProps}
      InputProps={props.InputProps}
      defaultValue={props.defaultValue}
    />
  );
};

export default React.memo(ValidatedInput as any);
