import { Box, SxProps, Theme } from "@mui/material";
import React, { useState } from "react";

import { User } from "../../../knowledgeTypes";
import { DESIGN_SYSTEM_COLORS } from "../../../lib/theme/colors";
import { ICourseTag } from "../../../types/ICourse";
import { NoDataMessage } from "../../instructors/NoDataMessage";
import { Dashboard } from "./Dashboard";

// import { Semester } from "../../instructorsTypes";
// import { ICourseTag } from "../../types/ICourse";
// import { CoursesResult } from "../layouts/StudentsLayout";

type DashboardWrapperProps = {
  user: User;
  onClose: () => void;
  sx?: SxProps<Theme>;
};

export const DashboardWrapper = ({ user, onClose, sx }: DashboardWrapperProps) => {
  //   const [allCourses, setAllCourses] = useState<CoursesResult>({});
  //   const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  //   const [courses, setCourses] = useState<any[]>([]);
  //   const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [currentSemester /* setCurrentSemester */] = useState<ICourseTag | null>({
    cTagId: "27bDHjvlG9aJTO0NNKF5",
    cTitle: "CS105",
    pTagId: "1YS1DzzS3vKW5yZ3Rsot",
    pTitle: "B.S. in Computer Science",
    tagId: "uKI3kMAhMllXyahRayEO",
    title: "Fall 2022",
    uTagId: "13LYVLypMpxl3BBCbNjg",
    uTitle: "University of Michigan - Ann Arbor",
  });
  //   const [allSemesters, setAllSemesters] = useState<Semester[]>([]);

  return (
    <Box
      sx={{
        ...sx,
        display: "grid",
        gridTemplateColumns: "200px auto",
        gridTemplateRows: "100%",
        border: "solid 2px yellow",
        background: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray100,
      }}
    >
      <div>
        toolbar
        <button onClick={onClose}>......................Close</button>
      </div>
      <Box sx={{ width: "100%", height: "100%", border: "solid 2px royalBlue", overflowY: "auto", p: "40px 32px" }}>
        {currentSemester ? (
          <Dashboard user={user} currentSemester={currentSemester} />
        ) : (
          <NoDataMessage message="No data in this semester" />
        )}
      </Box>
    </Box>
  );
};
