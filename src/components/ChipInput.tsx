import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { makeStyles } from "@mui/styles";
import Downshift from "downshift";
import PropTypes from "prop-types";
import React from "react";

const useStyles: any = makeStyles(() => ({
  inputChip: {
    "& .MuiOutlinedInput-root": {
      display: "block",
    },
  },
  innerChip: {
    margin: "15px 10px 0px 0",
  },
}));

const ChipInput = ({ ...props }) => {
  const classes = useStyles();
  const {
    selectedTags,
    placeholder,
    tags,
    readOnly,
    itemId,
    setTags,
    label,
    added = [],
    removed = [],
    ...other
  }: any = props;
  const [inputValue, setInputValue] = React.useState("");

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      let newSelectedItem: any = [...tags];
      const duplicatedValues = newSelectedItem.indexOf(event.target.value.trim());

      if (duplicatedValues !== -1) {
        setInputValue("");
        return;
      }
      if (!event.target.value.replace(/\s/g, "").length) return;
      const altrs = event.target.value
        .split(",")
        .map((x: any) => x.trim())
        .filter((x: any) => x !== "");
      newSelectedItem = [...newSelectedItem, ...altrs];
      setTags(newSelectedItem);
      selectedTags(newSelectedItem, itemId);
      setInputValue("");
    }
    if (tags.length && !inputValue.length && event.key === "Backspace") {
      setTags(tags.slice(0, tags.length - 1));
      selectedTags(tags.slice(0, tags.length - 1), itemId);
    }
  };

  const handleChange = (item: any) => {
    let newSelectedItem: any = [...tags];
    if (newSelectedItem.indexOf(item) === -1) {
      newSelectedItem = [...newSelectedItem, item];
    }
    setInputValue("");
    setTags(newSelectedItem);
    selectedTags(newSelectedItem, itemId);
  };

  const handleDelete = (item: any) => () => {
    const newSelectedItem: any = [...tags];
    newSelectedItem.splice(newSelectedItem.indexOf(item), 1);
    setTags(newSelectedItem);
    selectedTags(newSelectedItem, itemId);
  };

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  return (
    <React.Fragment>
      <Downshift id="downshift-multiple" inputValue={inputValue} onChange={handleChange}>
        {({ getInputProps }) => {
          const { onBlur, onChange, ...inputProps }: any = getInputProps({
            onKeyDown: handleKeyDown,
            placeholder,
          });
          return (
            <div className="">
              {(tags.length > 0 || !readOnly) && (
                <TextField
                  label={label || ""}
                  className={classes.inputChip}
                  InputProps={{
                    startAdornment: tags.map((item: any) => {
                      const color = added.includes(item) ? "green" : removed.includes(item) ? "red" : "";
                      return (
                        <>
                          {readOnly ? (
                            <Chip
                              sx={{
                                backgroundColor: color,
                              }}
                              key={item}
                              tabIndex={-1}
                              label={item}
                              className={classes.innerChip}
                            />
                          ) : (
                            <Chip
                              key={item}
                              tabIndex={-1}
                              label={item}
                              disabled={readOnly}
                              className={classes.innerChip}
                              onDelete={handleDelete(item)}
                            />
                          )}
                        </>
                      );
                    }),
                    onBlur,
                    onChange: event => {
                      handleInputChange(event);
                      onChange(event);
                    },
                  }}
                  {...other}
                  {...inputProps}
                  disabled={props.readOnly}
                />
              )}
            </div>
          );
        }}
      </Downshift>
    </React.Fragment>
  );
};

export default React.memo(ChipInput);

ChipInput.defaultProps = {
  tags: [],
};
ChipInput.propTypes = {
  selectedTags: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
};
