import { FormControl, FormControlLabel, ListItemText, MenuItem, Radio, Select, SelectChangeEvent } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

dayjs.extend(relativeTime);

const TIME_OPTIONS: any[] = [
  {
    name: "Last Day",
    value: "LAST_DAY",
  },
  {
    name: "Last 15 days",
    value: "LAST_15_DAYS",
  },
  {
    name: "Last 30 days",
    value: "LAST_30_DAYS",
  },
  {
    name: "Last quarter",
    value: "LAST_QUARTER",
  },
  {
    name: "Last year",
    value: "LAST_YEAR",
  },
  {
    name: "All time",
    value: "ALL_TIME",
  },
];

type TimeFilterProps = {
  id: string;
  setTimeFilter: any;
  timeFilter: any;
  disabled?: boolean;
};
const TimeFilter = (props: TimeFilterProps) => {
  const onChangeTimeFilter = (event: SelectChangeEvent) => {
    props.setTimeFilter(event.target.value);
  };

  return (
    <>
      <FormControl
        id={props.id}
        disabled={props.disabled}
        sx={{
          width: "120px",
        }}
      >
        <Select
          placeholder="Select Time"
          MenuProps={{
            sx: {
              "& .MuiMenu-paper": {
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookMainBlack : theme.palette.common.gray50,
                color: "text.white",
                width: "200px",
                borderRadius: "4px",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 8px 8px -4px rgba(0, 0, 0, 0.03)",
                border: theme =>
                  `1px solid ${
                    theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray300
                  }`,
              },
              "& .MuiMenuItem-root:hover": {
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
                color: "text.white",
              },
              "& .MuiMenuItem-root": {
                padding: "3px 0px 3px 0px",
              },
              "& .Mui-selected": {
                backgroundColor: "transparent!important",
                color: theme => theme.palette.common.primary600,
              },
              "& .Mui-selected:hover": {
                backgroundColor: "transparent",
              },
            },
          }}
          sx={{
            height: "35px",
            "&> fieldset": {
              borderColor: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG500 : theme.palette.common.gray300,
              borderWidth: "1px",
              borderRadius: "4px",
            },
          }}
          value={props.timeFilter}
          variant="outlined"
          onChange={onChangeTimeFilter}
          renderValue={() => TIME_OPTIONS.filter(option => option.value === props.timeFilter)[0]?.name}
        >
          {TIME_OPTIONS.map(cur => {
            const isSelected = props.timeFilter === cur.value;
            return (
              <MenuItem key={cur.name} value={cur.value} sx={{ display: "flex", justifyContent: "space-between" }}>
                <FormControlLabel
                  className={isSelected ? "selected" : ""}
                  control={<Radio className="searchCheckbox" checked={isSelected} />}
                  label=""
                  sx={{ p: "0px", marginX: "0px" }}
                />
                <ListItemText
                  sx={{
                    fontSize: "10px ",
                  }}
                  className={isSelected ? "selected" : ""}
                  primary={cur.name}
                />
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </>
  );
};

export default React.memo(TimeFilter);
