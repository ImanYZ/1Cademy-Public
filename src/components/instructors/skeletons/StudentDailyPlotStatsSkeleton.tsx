import { Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

type StudentDailyPlotStatsSkeletonProps = {
  isMovil: boolean;
  isTablet: boolean;
};

export const StudentDailyPlotStatsSkeleton = ({ isMovil, isTablet }: StudentDailyPlotStatsSkeletonProps) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr",
          justifyContent: "center",
          alignItems: "end",
          gap: "8px",
        }}
      >
        <Skeleton
          variant="rectangular"
          sx={{
            width: isMovil ? "300px" : isTablet ? "600px" : "1045px",
            height: isMovil ? "120px" : isTablet ? "250px" : "354px",
            borderRadius: "5px",
            justifySelf: "center",
            margin: "0",
          }}
        />
        <Skeleton
          variant="rectangular"
          sx={{
            width: "30px",
            height: "16px",
            borderRadius: "15px",
            justifySelf: "center",
            margin: "2px",
          }}
        />
        <Skeleton
          variant="rectangular"
          sx={{
            width: isMovil ? "300px" : isTablet ? "600px" : "1045px",
            height: isMovil ? "50px" : isTablet ? "120px" : "160px",
            borderRadius: "5px",
            justifySelf: "center",
            marginBottom: "0",
          }}
        />
      </Box>
    </Box>
  );
};
