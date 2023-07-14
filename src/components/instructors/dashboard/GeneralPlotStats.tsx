import { Divider, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { GeneralSemesterStudentsStats } from "src/instructorsTypes";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { formatNumber } from "../../../lib/utils/number.utils";

type GeneralPlotStatsProps = {
  maxSemesterStats: GeneralSemesterStudentsStats | null;
  studentStats?: GeneralSemesterStudentsStats | null;
};

export const GeneralPlotStats = ({ maxSemesterStats, studentStats }: GeneralPlotStatsProps) => {
  const {
    palette: { mode },
  } = useTheme();

  // const totalDaysAllowedToPractice = useMemo(() => {
  //   if (!semesterConfig || !semesterConfig.dailyPractice) return 0;
  //   const startDate = semesterConfig.dailyPractice.startDate.toDate();
  //   const endDate = semesterConfig.dailyPractice.endDate.toDate();

  //   const diffInMs = Math.abs(startDate.getTime() - endDate.getTime());
  //   const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  //   return diffInDays;
  // }, [semesterConfig]);

  return (
    <Box>
      <Typography component={"h3"} fontSize={"36px"} fontWeight={"600"}>
        Numbers
      </Typography>
      <Divider
        sx={{
          borderColor: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray400,
          my: "12px",
        }}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(150px,max-content) max-content ",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "right",
          rowGap: "12px",
          "& span:nth-of-type(odd)": {
            fontWeight: "600",
            textAlign: "left",
          },
        }}
      >
        <span></span>
        <span
          style={{
            fontSize: "12px",
            color: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray500,
          }}
        >
          Numbers
        </span>
        <span>Child Proposals</span>
        <span>
          {studentStats ? `${formatNumber(studentStats.childProposals)} / ` : ""}
          {formatNumber(maxSemesterStats?.childProposals)}
        </span>
        <span>Edit Proposals</span>
        <span>
          {studentStats ? `${formatNumber(studentStats.editProposals)} / ` : ""}
          {formatNumber(maxSemesterStats?.editProposals)}
        </span>
        <span>Links</span>
        <span>
          {studentStats ? `${formatNumber(studentStats.links)} / ` : ""}
          {formatNumber(maxSemesterStats?.links)}
        </span>
        <span>Nodes</span>
        <span>
          {studentStats ? `${formatNumber(studentStats.nodes)} / ` : ""}
          {formatNumber(maxSemesterStats?.nodes)}
        </span>
        <span>Votes</span>
        <span>
          {studentStats ? `${formatNumber(studentStats.votes)} / ` : ""}
          {formatNumber(maxSemesterStats?.votes)}
        </span>
        <span>Questions</span>
        <span>
          {studentStats ? `${formatNumber(studentStats.questions)} / ` : ""}
          {formatNumber(maxSemesterStats?.questions)}
        </span>
        <span>Practices</span>
        <span>
          {studentStats ? `${formatNumber(studentStats.correctPractices)} / ` : ""}
          {formatNumber(maxSemesterStats?.correctPractices)}
        </span>
      </Box>
    </Box>
  );
};
