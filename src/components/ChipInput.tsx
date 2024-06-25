import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { makeStyles } from "@mui/styles";
import Downshift from "downshift";
import PropTypes from "prop-types";
import React, { useEffect } from "react";

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
  const { selectedTags, placeholder, tags, readOnly, itemId, ...other } = props;
  const [inputValue, setInputValue] = React.useState("");
  const [selectedItem, setSelectedItem] = React.useState([]);

  useEffect(() => {
    setSelectedItem(tags);
  }, [tags]);

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      let newSelectedItem: any = [...selectedItem];
      const duplicatedValues = newSelectedItem.indexOf(event.target.value.trim());

      if (duplicatedValues !== -1) {
        setInputValue("");
        return;
      }
      if (!event.target.value.replace(/\s/g, "").length) return;
      const altrs = event.target.value
        .split(" ")
        .map(x => x.trim())
        .filter(x => x !== "");
      newSelectedItem = [...newSelectedItem, ...altrs];
      setSelectedItem(newSelectedItem);
      selectedTags(newSelectedItem, itemId);
      setInputValue("");
    }
    if (selectedItem.length && !inputValue.length && event.key === "Backspace") {
      setSelectedItem(selectedItem.slice(0, selectedItem.length - 1));
      selectedTags(selectedItem.slice(0, selectedItem.length - 1), itemId);
    }
  };

  const handleChange = (item: any) => {
    let newSelectedItem: any = [...selectedItem];
    if (newSelectedItem.indexOf(item) === -1) {
      newSelectedItem = [...newSelectedItem, item];
    }
    setInputValue("");
    setSelectedItem(newSelectedItem);
    selectedTags(newSelectedItem, itemId);
  };

  const handleDelete = (item: any) => () => {
    const newSelectedItem: any = [...selectedItem];
    newSelectedItem.splice(newSelectedItem.indexOf(item), 1);
    setSelectedItem(newSelectedItem);
    selectedTags(newSelectedItem, itemId);
  };

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  return (
    <React.Fragment>
      <Downshift id="downshift-multiple" inputValue={inputValue} onChange={handleChange} selectedItem={selectedItem}>
        {({ getInputProps }) => {
          const { onBlur, onChange, ...inputProps }: any = getInputProps({
            onKeyDown: handleKeyDown,
            placeholder,
          });
          return (
            <div className="">
              {(selectedItem.length > 0 || !readOnly) && (
                <TextField
                  className={classes.inputChip}
                  InputProps={{
                    startAdornment: selectedItem.map(item => (
                      <>
                        {readOnly ? (
                          <Chip key={item} tabIndex={-1} label={item} className={classes.innerChip} />
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
                    )),
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
