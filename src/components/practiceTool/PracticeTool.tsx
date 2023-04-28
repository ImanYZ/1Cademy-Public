import { Box } from "@mui/material";
import React, { useState } from "react";

import { CourseTag } from "../../instructorsTypes";
import CourseDetail from "./CourseDetail";
import { PracticeQuestion } from "./PracticeQuestion";

type PracticeToolProps = {
  currentSemester: CourseTag;
  onClose: () => void;
};

export const PracticeTool = ({ currentSemester, onClose }: PracticeToolProps) => {
  const [startPractice, setStartPractice] = useState(false);
  return startPractice ? (
    <Box
      sx={{
        position: "absolute",
        inset: "0px",
        background: theme =>
          theme.palette.mode === "dark" ? theme.palette.common.notebookG900 : theme.palette.common.notebookBl1,
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <PracticeQuestion courseId={currentSemester.tagId} onClose={onClose} />
    </Box>
  ) : (
    <CourseDetail onStartPractice={() => setStartPractice(true)} />
  );
};
