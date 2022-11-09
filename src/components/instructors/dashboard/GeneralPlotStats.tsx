import { Divider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

import { formatNumber } from "../../../lib/utils/number.utils";

type GeneralPlotStatsProps = {
  courseTitle: string;
  semesterTitle: string;
  programTitle: string;
  studentsCounter: number;
  semesterStats: any;
};

export const GeneralPlotStats = ({
  semesterStats,
  semesterTitle,
  studentsCounter,
  programTitle,
  courseTitle,
}: GeneralPlotStatsProps) => {
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
          gridTemplateColumns: "1fr 64px",
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
          gridTemplateColumns: "1fr 64px",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          columnGap: "16px",
          rowGap: "24px",
        }}
      >
        <span style={{ textAlign: "left" }}>New Node Proposals</span>
        <span>{formatNumber(semesterStats?.newNodeProposals)}</span>
        <span style={{ textAlign: "left" }}>Edit Proposals</span>
        <span>{formatNumber(semesterStats?.editProposals)}</span>
        <span style={{ textAlign: "left" }}>Links</span>
        <span>{formatNumber(semesterStats?.links)}</span>
        <span style={{ textAlign: "left" }}>Nodes</span>
        <span>{formatNumber(semesterStats?.nodes)}</span>
        <span style={{ textAlign: "left" }}>Votes</span>
        <span>{formatNumber(semesterStats?.votes)}</span>
        <span style={{ textAlign: "left" }}>Questions</span>
        <span>{formatNumber(semesterStats?.questions)}</span>
      </Box>
    </Box>
  );
};
