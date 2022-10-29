// import "./InputSave.css";

import DoneIcon from "@mui/icons-material/Done";
import SaveIcon from "@mui/icons-material/Save";
import { InputAdornment } from "@mui/material";
// import InputAdornment from "@material-ui/core/InputAdornment";
// import DoneIcon from "@material-ui/icons/Done";
// import SaveIcon from "@material-ui/icons/Save";
import React, { useCallback, useEffect, useState } from "react";

import { MemoizedMetaButton } from "./MetaButton";
import ValidatedInput from "./ValidatedInput";

// import MetaButton from "../../Map/MetaButton/MetaButton";
// import ValidatedInput from "../ValidatedInput/ValidatedInput";

type InputSaveProps = {
  identification: string;
  initialValue: string;
  onSubmit: any;
  setState: any;
  label: string;
};
const InputSave = (props: InputSaveProps) => {
  const [value, setValue] = useState(props.initialValue);
  const [valueChanging, setValueChanging] = useState(false);

  useEffect(() => {
    setValue(props.initialValue);
  }, [props.initialValue]);

  const handleChange = useCallback((event: any) => {
    event.persist();
    setValue(event.target.value);
  }, []);

  const onSubmit = useCallback(async () => {
    setValueChanging(true);
    await props.onSubmit(value);
    props.setState(value);
    setValueChanging(false);
  }, [props, value]);

  const onEnter = useCallback(
    (event: any) => {
      if (event.key === "Enter") {
        onSubmit();
      }
    },
    [onSubmit]
  );

  return (
    <div id={props.identification + "Container"} className="InputSaveContainer">
      <ValidatedInput
        identification={props.identification}
        name="InputSave"
        type="text"
        placeholder={props.label}
        label={props.label}
        onChange={handleChange}
        onKeyPress={onEnter}
        value={value}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <MemoizedMetaButton onClick={onSubmit} tooltip="Save the change." tooltipPosition="bottom-start">
                {props.initialValue !== value ? <SaveIcon className="SaveIcon" /> : <DoneIcon className="DoneIcon" />}
              </MemoizedMetaButton>
              {valueChanging && (
                <div className="preloader-wrapper active small ImageUploadButtonLoader">
                  <div className="spinner-layer spinner-yellow-only">
                    <div className="circle-clipper left">
                      <div className="circle"></div>
                    </div>
                  </div>
                </div>
              )}
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};

// export default React.memo(InputSave);
export const MemoizedInputSave = React.memo(InputSave);
