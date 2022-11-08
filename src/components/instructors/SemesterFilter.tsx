import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import { useRouter } from "next/router";
import React from "react";

import { UserRole } from "../../knowledgeTypes";
import ROUTES from "../../lib/utils/routes";

type SemesterFilterProps = {
  semesters: string[];
  selectedSemester: string | null;
  setSelectedSemester: any;
  courses: string[];
  selectedCourse: string | null;
  setSelectedCourse: any;
  isMovil: boolean;
  role: UserRole;
};

export const SemesterFilter = ({
  semesters,
  selectedSemester,
  setSelectedSemester,
  courses,
  selectedCourse,
  setSelectedCourse,
  isMovil,
  role,
}: SemesterFilterProps) => {
  console.log("selectedSemester", selectedSemester);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();

  const onChangeSemester = (event: SelectChangeEvent) => {
    setSelectedSemester(event.target.value as string);
  };

  const onChangeCourse2 = (event: SelectChangeEvent) => {
    setSelectedCourse(event.target.value as string);
  };

  const onChangeCourse = (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    setSelectedCourse(newAlignment);
  };

  const onNewCourse = () => {
    setSelectedCourse(null);
    router.push(ROUTES.instructorsSettings);
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: { xs: "6px", md: "16px" },
        justifyContent: { xs: "center", md: "space-between" },
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ display: "flex", gap: { xs: "6px", md: "16px" } }}>
        <FormControl size={matches ? "small" : "medium"}>
          <InputLabel id="semester-filter-label">Semester</InputLabel>
          <Select
            labelId="semester-filter-label"
            id="semester-filter"
            value={selectedSemester ?? ""}
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

        {!isMovil && (
          <ToggleButtonGroup value={selectedCourse} exclusive onChange={onChangeCourse} aria-label="text alignment">
            {courses.map((cur, idx) => (
              <ToggleButton key={idx} value={cur} aria-label="left aligned">
                {cur}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
        {isMovil && (
          <FormControl size={matches ? "small" : "medium"}>
            <InputLabel id="course-filter-label">Courses</InputLabel>
            <Select
              labelId="course-filter-label"
              id="course-filter"
              value={selectedCourse ?? ""}
              label="Course"
              onChange={onChangeCourse2}
              sx={{ width: "140px" }}
            >
              {courses.map((cur, idx) => (
                <MenuItem key={idx} value={cur}>
                  {cur}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {role === "INSTRUCTOR" && (
        <Button onClick={() => onNewCourse()} variant={"contained"} size={matches ? "small" : "medium"}>
          New Course
        </Button>
      )}
    </Box>
  );
};
