import { Box, SxProps, Theme } from "@mui/material";
import React, { useState } from "react";

import { User } from "../../../knowledgeTypes";
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
    <Box sx={{ ...sx, p: "100px", display: "grid", gridTemplateColumns: "200px auto", border: "solid 2px yellow" }}>
      <div>toolbar</div>
      <Box sx={{ width: "100%", border: "solid 2px royalBlue" }}>
        {currentSemester ? (
          <Dashboard user={user} currentSemester={currentSemester} />
        ) : (
          <NoDataMessage message="No data in this semester" />
        )}
        <Box>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima adipisci, amet quidem et nulla quas omnis
          corrupti, deserunt soluta repellat ex, fugit molestias dolor doloribus quis. Eos modi voluptates iure!
          <button onClick={onClose}>......................Close</button>
        </Box>
      </Box>
    </Box>
  );
};
