// import { TextField } from "@material-ui/core";
// import "./ValidatedInput.css";

import { TextField } from "@mui/material";
import React, { useCallback, useState } from "react";

const ValidatedInput = (props: any) => {
  // true if user has clicked on the input component,
  // set to false only when user has never clicked on component or if user refreshes the page
  const [touched, setTouched] = useState(false);
  // true if the user typed any text in the field,
  // false if user has clicked away from input field and nothing exists in it.
  const [, /*enterred*/ setEnterred] = useState(false);

  // useEffect(() => {
  //   if ("value" in props && props.value !== "") {
  //     setEnterred(true);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [props.value]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value, props.onBlur]);

  return (
    // <div
    //   // className={props.inline ? "input-field inline" : "input-field"}
    //   id="input"
    // >

    // touched - set to true if you have clicked the textfield
    <TextField
      disable={props.disabled}
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
      // {...(props.placeholder && { placeholder: props.placeholder })}
      // this syntax is so that if the parent component passes in these props then
      // it initializes the components accordingly
      // otherwise the attribute is not available
      {...(props.onChange && { onChange: props.onChange })}
      {...(props.onKeyPress && { onKeyPress: props.onKeyPress })}
      {...((props.value || props.value === "") && { value: props.value })}
      {...(props.autocomplete && { autocomplete: props.autocomplete })}
      {...(props.disabled && { disabled: props.disabled })}
      // {...props.input}
      inputProps={props.inputProps}
      InputProps={props.InputProps}
      defaultValue={props.defaultValue}
      sx={{ width: "100%", ...props.sx }}
    />

    // {/* {props.label && (
    //   <label
    //     htmlFor={props.identification}
    //     className={enterred ? "active" : undefined}
    //   >
    //     {props.label}
    //   </label>
    // )}  */}
    // {/* {props.errorMessage && (
    //   <span className="helper-text" data-error={props.errorMessage} />
    // )} */}
    // </div>
  );
};

export default React.memo(ValidatedInput);
