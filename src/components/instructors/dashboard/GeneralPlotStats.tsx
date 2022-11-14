import { Divider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { SemesterStudentVoteStat } from "src/instructorsTypes";

import { formatNumber } from "../../../lib/utils/number.utils";

type GeneralPlotStatsProps = {
  courseTitle: string;
  semesterTitle: string;
  programTitle: string;
  studentsCounter: number;
  semesterStats: any;
  student?: SemesterStudentVoteStat | null;
};

export const GeneralPlotStats = ({
  semesterStats,
  semesterTitle,
  studentsCounter,
  programTitle,
  courseTitle,
  student,
}: GeneralPlotStatsProps) => {
  console.log("semesterStats", semesterStats);
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          columnGap: "8px",
          color: "white",
        }}
      >
        <Typography sx={{ color: "#EC7115", fontSize: "36px" }}>{courseTitle} </Typography>
        <Typography>{semesterTitle}</Typography>
        <Typography> {!studentsCounter ? `Students: ${studentsCounter}` : ""}</Typography>
      </Box>
      <Typography>{programTitle}</Typography>
      <Divider />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 72px",
          justifyContent: "center",
          alignItems: "end",
          py: "12px",
          textAlign: "center",
          columnGap: "16px",
        }}
      >
        <Typography style={{ color: "#303134" }}></Typography>
        <span>Numbers</span>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 100px",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          columnGap: "16px",
          rowGap: "24px",
        }}
      >
        <span style={{ textAlign: "left" }}>Child Proposals</span>
        <span>
          {student ? `${formatNumber(student.newNodes)} / ` : ""}
          {formatNumber(semesterStats?.newNodeProposals)}
        </span>
        <span style={{ textAlign: "left" }}>Edit Proposals</span>
        <span>
          {student ? `${formatNumber(student.improvements)} / ` : ""}
          {formatNumber(semesterStats?.editProposals)}
        </span>
        <span style={{ textAlign: "left" }}>Links</span>
        <span>
          {student ? `${formatNumber(student.links)} / ` : ""}
          {formatNumber(semesterStats?.links)}
        </span>
        <span style={{ textAlign: "left" }}>Nodes</span>
        <span>
          {student ? `${formatNumber(student.newNodes + student.improvements)} / ` : ""}
          {formatNumber(semesterStats?.nodes)}
        </span>
        <span style={{ textAlign: "left" }}>Votes</span>
        <span>
          {student ? `${formatNumber(student.votes)} / ` : ""}
          {formatNumber(semesterStats?.votes)}
        </span>
        <span style={{ textAlign: "left" }}>Questions</span>
        <span>
          {student ? `${formatNumber(student.questions)} / ` : ""}
          {formatNumber(semesterStats?.questions)}
        </span>
      </Box>
    </Box>
  );
};
