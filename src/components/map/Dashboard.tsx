import { Box, SxProps, Theme } from "@mui/material";
import React from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { DashboradToolbar } from "./Dashobard/DashboradToolbar";

// import { Semester } from "../../instructorsTypes";
// import { ICourseTag } from "../../types/ICourse";
// import { CoursesResult } from "../layouts/StudentsLayout";

type DashboardProps = {
  onClose: () => void;
  sx?: SxProps<Theme>;
};

export const Dashboard = ({ sx, onClose }: DashboardProps) => {
  //   const [allCourses, setAllCourses] = useState<CoursesResult>({});
  //   const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  //   const [courses, setCourses] = useState<any[]>([]);
  //   const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  //   const [currentSemester, setCurrentSemester] = useState<ICourseTag | null>(null);
  //   const [allSemesters, setAllSemesters] = useState<Semester[]>([]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        backgroundColor: ({ palette: { mode } }) =>
          mode === "dark" ? DESIGN_SYSTEM_COLORS.baseBlack : DESIGN_SYSTEM_COLORS.gray200,
        ...sx,

        zIndex: 99999,
      }}
    >
      <DashboradToolbar />
      <div>selected page</div>
      <button onClick={onClose}>......................Close</button>
    </Box>
  );
};
