import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/Done";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import RemoveIcon from "@mui/icons-material/Remove";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";

import { SortDirection, SortValues } from "../../noteBookTypes";

type SortOptions = { name: string; icon: JSX.Element; value: SortValues };

// const sortByTypeClick = (setSortByType: any) => /*(event: any) =>*/ setSortByType(prevValue => !prevValue);

dayjs.extend(relativeTime);

const SORT_OPTIONS: SortOptions[] = [
  {
    name: "Last Viewed",
    icon: <VisibilityIcon key={"Last Viewed icon"} />,
    value: "LAST_VIEWED",
  },
  {
    name: "Date Modified",
    icon: <EventAvailableIcon key={"Date Modified icon"} />,
    value: "DATE_MODIFIED",
  },
  {
    name: "Proposals",
    icon: <CreateIcon key={"Proposals icon"} />,
    value: "PROPOSALS",
  },
  {
    name: "Upvotes",
    icon: <DoneIcon key={"Upvotes icon"} />,
    value: "UP_VOTES",
  },
  {
    name: "Downvotes",
    icon: <CloseIcon key={"Downvotes icon"} />,
    value: "DOWN_VOTES",
  },
  {
    name: "Net Votes",
    icon: (
      <>
        <DoneIcon />
        <RemoveIcon />
        <CloseIcon />
      </>
    ),
    value: "NET_NOTES",
  },
];

const RecentNodesList = (props: any) => {
  const onChangeSortOption = (event: SelectChangeEvent) => {
    props.setSortOption(event.target.value as SortValues);
  };

  const onChangeSortDirection = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setSortDirection((event.target as HTMLInputElement).value as SortDirection);
  };

  return (
    <>
      <FormControl id={props.id}>
        <Select
          MenuProps={{ id: "sortFilterMenu" }}
          // multiple
          value={props.sortOption}
          variant="outlined"
          onChange={onChangeSortOption}
          displayEmpty
          renderValue={() => "Sort"}
        >
          {SORT_OPTIONS.map(cur => {
            const isSelected = props.sortOption === cur.value;
            return (
              <MenuItem
                className="searchSelect"
                key={cur.name}
                value={cur.value}
                sx={{ p: "0px", display: "flex", justifyContent: "space-between" }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    className={isSelected ? "selected" : ""}
                    control={<Checkbox className="searchCheckbox" checked={isSelected} />}
                    label=""
                    sx={{ p: "0px" }}
                  />

                  <Box className={"searchIcon " + (isSelected ? "selected" : "")} sx={{ mr: "5px" }}>
                    {cur.icon}
                  </Box>
                  <ListItemText className={isSelected ? "selected" : ""} primary={cur.name} />
                </Box>

                {cur.name !== "Relevance" && (
                  <RadioGroup
                    value={props.sortDirection}
                    onChange={onChangeSortDirection}
                    sx={{ display: "flex", flexDirection: "row", mr: "5px" }}
                  >
                    <Radio
                      className={"searchIcon " + (isSelected && props.sortDirection === "ASCENDING" ? "selected" : "")}
                      icon={<ArrowDownward />}
                      checkedIcon={<ArrowDownward />}
                      sx={{ p: "1px" }}
                      value={"ASCENDING"}
                    />
                    <Radio
                      className={"searchIcon " + (isSelected && props.sortDirection === "DESCENDING" ? "selected" : "")}
                      icon={<ArrowUpward />}
                      checkedIcon={<ArrowUpward />}
                      sx={{ p: "1px" }}
                      value={"DESCENDING"}
                    />
                  </RadioGroup>
                )}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </>
  );
};

export default React.memo(RecentNodesList);
