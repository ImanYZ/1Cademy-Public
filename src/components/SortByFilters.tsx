import { Grid, MenuItem, Select, SelectChangeEvent, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { Box } from "@mui/system";
import { FC } from "react";

import { SortedByTimeOptions } from "@/lib/utils/utils";

import { SortTypeWindowOption, TimeWindowOption } from "../knowledgeTypes";
import { ShareButtons } from "./ShareButtons";

type Props = {
  sortedByType: SortTypeWindowOption;
  handleByType: (val: SortTypeWindowOption) => void;
  timeWindow: string;
  onTimeWindowChanged: (val: TimeWindowOption) => void;
};

const SortByFilters: FC<Props> = ({ sortedByType, handleByType, timeWindow, onTimeWindowChanged }) => {
  const handleSortByTime = (event: SelectChangeEvent<string>) => {
    onTimeWindowChanged(event.target.value as TimeWindowOption);
  };

  const handleSortByType = (event: React.MouseEvent<HTMLElement>, newAlignment: SortTypeWindowOption | null) => {
    handleByType(newAlignment || SortTypeWindowOption.NONE);
  };

  return (
    <Box sx={{ flexGrow: 1, mx: { md: "10px" } }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4} lg={3}>
          <ToggleButtonGroup value={sortedByType} exclusive onChange={handleSortByType} aria-label="Sort options">
            <ToggleButton size="large" value={SortTypeWindowOption.MOST_RECENT} aria-label="sort by the most recent">
              Most Recent
            </ToggleButton>
            <ToggleButton size="large" value={SortTypeWindowOption.UPVOTES_DOWNVOTES} aria-label="sort by upvotes">
              Most Helpful
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <Select
            variant="standard"
            value={timeWindow}
            onChange={handleSortByTime}
            sx={{ pr: "0px" }}
            renderValue={value => (
              <Tooltip
                title="Only show the nodes that were updated in this last period."
                placement="top"
                leaveDelay={0}
                disableFocusListener={false}
                disableTouchListener={true}
              >
                <Box>{value}</Box>
              </Tooltip>
            )}
          >
            {SortedByTimeOptions.map((sortedByTimeOption, idx) => (
              <MenuItem value={sortedByTimeOption} key={idx}>
                {sortedByTimeOption}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={6} md={4} lg={6} sx={{ display: "flex", justifyContent: "end" }}>
          <ShareButtons showHelp responsive />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SortByFilters;
