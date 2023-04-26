import { Box, SxProps, Theme } from "@mui/material";
import React from "react";

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
    <Box sx={{ ...sx, p: "100px", display: "grid", gridTemplateColumns: "200px auto", border: "solid 2px yellow" }}>
      <div>toolbar</div>
      <Box sx={{ width: "100%", border: "solid 2px royalBlue" }}>
        <Box>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima adipisci, amet quidem et nulla quas omnis
          corrupti, deserunt soluta repellat ex, fugit molestias dolor doloribus quis. Eos modi voluptates iure!
          <button onClick={onClose}>......................Close</button>
        </Box>
      </Box>
    </Box>
  );
};
