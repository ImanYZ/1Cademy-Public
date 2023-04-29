import { Divider, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import React, { useMemo } from "react";
import { GeneralSemesterStudentsStats } from "src/instructorsTypes";
import { ISemester } from "src/types/ICourse";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { formatNumber } from "../../../lib/utils/number.utils";

type GeneralPlotStatsProps = {
  semesterStats: GeneralSemesterStudentsStats | null;
  semesterConfig: ISemester | null;
  student?: GeneralSemesterStudentsStats | null;
};

export const GeneralPlotStats = ({ semesterConfig, semesterStats, student }: GeneralPlotStatsProps) => {
  console.log("semesterStats", semesterStats);
  const {
    palette: { mode },
  } = useTheme();

  const totalDaysAllowedToPractice = useMemo(() => {
    if (!semesterConfig || !semesterConfig.dailyPractice) return 0;
    const startDate = semesterConfig.dailyPractice.startDate.toDate();
    const endDate = semesterConfig.dailyPractice.endDate.toDate();

    const diffInMs = Math.abs(startDate.getTime() - endDate.getTime());
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    return diffInDays;
  }, [semesterConfig]);

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
          "& span:nth-child(odd)": {
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
          {student ? `${formatNumber(student.childProposals)} / ` : ""}
          {formatNumber(semesterStats?.childProposals)}
        </span>
        <span>Edit Proposals</span>
        <span>
          {student ? `${formatNumber(student.editProposals)} / ` : ""}
          {formatNumber(semesterStats?.editProposals)}
        </span>
        <span>Links</span>
        <span>
          {student ? `${formatNumber(student.links)} / ` : ""}
          {formatNumber(semesterStats?.links)}
        </span>
        <span>Nodes</span>
        <span>
          {student ? `${formatNumber(student.nodes)} / ` : ""}
          {formatNumber(semesterStats?.nodes)}
        </span>
        <span>Votes</span>
        <span>
          {student ? `${formatNumber(student.votes)} / ` : ""}
          {formatNumber(semesterStats?.votes)}
        </span>
        <span>Questions</span>
        <span>
          {student ? `${formatNumber(student.questions)} / ` : ""}
          {formatNumber(semesterStats?.questions)}
        </span>
        <span>Days to complete the practice</span>
        <span>
          {student ? `${formatNumber(student.correctPractices)} / ` : ""}
          {formatNumber(totalDaysAllowedToPractice)}
        </span>
      </Box>
    </Box>
  );
};
