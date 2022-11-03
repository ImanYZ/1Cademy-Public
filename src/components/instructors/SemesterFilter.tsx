import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

type SemesterFilterProps = {
  semesters: string[];
  selectedSemester: string | undefined;
  setSelectedSemester: any;
  courses: string[];
  selectedCourse: string | undefined;
  setSelectedCourse: any;
};

export const SemesterFilter = ({
  semesters,
  selectedSemester,
  setSelectedSemester,
  courses,
  selectedCourse,
  setSelectedCourse,
}: SemesterFilterProps) => {
  const onChangeSemester = (event: SelectChangeEvent) => {
    setSelectedSemester(event.target.value as string);
  };

  const onChangeCourse = (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    setSelectedCourse(newAlignment);
  };

  return (
    <Box sx={{ display: "flex", gap: "16px" }}>
      <FormControl>
        <InputLabel id="semester-filter-label">Semester</InputLabel>
        <Select
          labelId="semester-filter-label"
          id="semester-filter"
          value={selectedSemester}
          label="Semester"
          onChange={onChangeSemester}
          sx={{ width: "140px" }}
        >
          {semesters.map((cur, idx) => (
            <MenuItem key={idx} value={cur}>
              {cur}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ToggleButtonGroup value={selectedCourse} exclusive onChange={onChangeCourse} aria-label="text alignment">
        {courses.map((cur, idx) => (
          <ToggleButton key={idx} value={cur} aria-label="left aligned">
            {cur}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};
