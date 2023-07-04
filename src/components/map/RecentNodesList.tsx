import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import {
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

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { SortDirection, SortValues } from "../../nodeBookTypes";

// import { SortDirection, SortValues } from "../../noteBookTypes";

type SortOptions = { name: string; value: SortValues };

// const sortByTypeClick = (setSortByType: any) => /*(event: any) =>*/ setSortByType(prevValue => !prevValue);

dayjs.extend(relativeTime);

const SORT_OPTIONS: SortOptions[] = [
  {
    name: "Last Viewed",
    value: "LAST_VIEWED",
  },
  {
    name: "Date Modified",
    value: "DATE_MODIFIED",
  },
  {
    name: "Proposals",
    value: "PROPOSALS",
  },
  {
    name: "Upvotes",
    value: "UP_VOTES",
  },
  {
    name: "Downvotes",
    value: "DOWN_VOTES",
  },
  {
    name: "Net Votes",
    value: "NET_NOTES",
  },
];

type RecentNodesListProps = {
  id: string;
  // recentNodes: any;
  // setRecentNodes: any;
  // onlyTags: any;
  disabled?: boolean;
  sortDirection: any;
  setSortDirection: any;
  sortOption: SortValues;
  setSortOption: (newSortOption: SortValues) => void;
};

const RecentNodesList = (props: RecentNodesListProps) => {
  const onChangeSortOption = (event: SelectChangeEvent) => {
    const newValue = event.target.value as SortValues;
    props.setSortOption(newValue);
  };

  const onChangeSortDirection = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setSortDirection((event.target as HTMLInputElement).value as SortDirection);
  };

  return (
    <>
      <FormControl id={props.id} disabled={props.disabled}>
        <Select
          placeholder="Sort"
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
              // maxWidth: "200px",
              // width: "200px",
              borderWidth: "1px",
              borderRadius: "4px",
              borderColor: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG500 : theme.palette.common.gray300,
            },
          }}
          value={props.sortOption}
          variant="outlined"
          onChange={onChangeSortOption}
          native={false}
          renderValue={() => {
            const option = SORT_OPTIONS.filter(option => option.value === props.sortOption)[0];
            console.log("sssss1", { option });
            return option?.name || "Sort by";
          }}
        >
          {SORT_OPTIONS.map(cur => {
            const isSelected = props.sortOption === cur.value;
            return (
              <MenuItem key={cur.name} value={cur.value} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    className={isSelected ? "selected" : ""}
                    control={<Radio className="searchCheckbox" checked={isSelected} />}
                    label=""
                    sx={{ p: "0px", marginX: "0px" }}
                  />
                  <ListItemText
                    sx={{
                      fontSize: "10px!important",
                    }}
                    className={isSelected ? "selected" : ""}
                    primary={cur.name}
                  />
                </Box>

                {cur.name !== "Relevance" && (
                  <RadioGroup
                    value={props.sortDirection}
                    onChange={onChangeSortDirection}
                    sx={{ display: "flex", flexDirection: "row", mr: "5px" }}
                  >
                    <Radio
                      className={"searchIcon " + (isSelected && props.sortDirection === "ASCENDING" ? "selected" : "")}
                      icon={
                        <ArrowDownward
                          sx={{
                            fontSize: "12px!important",
                          }}
                        />
                      }
                      checkedIcon={
                        <ArrowDownward
                          sx={{
                            fontSize: "12px!important",
                          }}
                        />
                      }
                      sx={{
                        mr: "5px",
                        p: "0px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: theme =>
                          theme.palette.mode === "dark"
                            ? theme.palette.common.notebookG600
                            : theme.palette.common.gray200,
                        color: theme =>
                          theme.palette.mode === "dark"
                            ? `${theme.palette.common.gray25}!important`
                            : `${theme.palette.common.gray800}!important`,

                        ...(isSelected &&
                          props.sortDirection === "ASCENDING" && {
                            background: theme =>
                              theme.palette.mode === "dark"
                                ? theme.palette.common.notebookO900
                                : theme.palette.common.orange200,
                            color: theme => theme.palette.common.primary800,
                          }),
                        ":hover": {
                          background: "transparent",
                        },
                      }}
                      value={"ASCENDING"}
                    />
                    <Radio
                      className={"searchIcon " + (isSelected && props.sortDirection === "DESCENDING" ? "selected" : "")}
                      icon={
                        <ArrowUpward
                          sx={{
                            fontSize: "12px!important",
                          }}
                        />
                      }
                      checkedIcon={
                        <ArrowUpward
                          sx={{
                            fontSize: "12px!important",
                          }}
                        />
                      }
                      sx={{
                        p: "0px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: theme =>
                          theme.palette.mode === "dark"
                            ? theme.palette.common.notebookG600
                            : theme.palette.common.gray200,
                        color: theme =>
                          theme.palette.mode === "dark"
                            ? `${theme.palette.common.gray25}!important`
                            : `${theme.palette.common.gray800}!important`,

                        ...(isSelected &&
                          props.sortDirection === "DESCENDING" && {
                            background: theme =>
                              theme.palette.mode === "dark"
                                ? theme.palette.common.notebookO900
                                : theme.palette.common.orange200,
                            color: theme => theme.palette.common.primary800,
                          }),
                        ":hover": {
                          background: "transparent",
                        },
                      }}
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
