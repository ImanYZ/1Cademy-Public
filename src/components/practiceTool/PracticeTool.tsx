import { Box } from "@mui/material";
import React, { useState } from "react";

import CourseDetail from "./CourseDetail";
import { PracticeQuestion } from "./PracticeQuestion";

type PracticeToolProps = {
  onClose: () => void;
};

export const PracticeTool = ({ onClose }: PracticeToolProps) => {
  const [startPractice, setStartPractice] = useState(false);
  return startPractice ? (
    <Box
      sx={{
        position: "absolute",
        inset: "0px",
        background: theme =>
          theme.palette.mode === "dark" ? theme.palette.common.notebookG900 : theme.palette.common.notebookG900,
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <PracticeQuestion onClose={onClose} />
    </Box>
  ) : (
    <CourseDetail onStartPractice={() => setStartPractice(true)} />
  );
};
