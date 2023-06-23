import { Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

export const SankeyChartSkeleton = () => {
  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: "56px", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Skeleton variant="rectangular" sx={{ width: "100px", height: "40px" }} />
        <Skeleton variant="rectangular" sx={{ width: "100px", height: "20px" }} />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Skeleton variant="rectangular" sx={{ width: "100px", height: "50px" }} />
        <Skeleton variant="rectangular" sx={{ width: "100px", height: "40px" }} />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Skeleton variant="rectangular" sx={{ width: "100px", height: "30px" }} />
        <Skeleton variant="rectangular" sx={{ width: "100px", height: "40px" }} />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Skeleton variant="rectangular" sx={{ width: "100px", height: "50px" }} />
        <Skeleton variant="rectangular" sx={{ width: "100px", height: "60px" }} />
      </Box>
    </Box>
  );
};
