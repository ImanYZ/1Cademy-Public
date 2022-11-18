import { Box, Skeleton } from "@mui/material";
import React from "react";

export const StackedBarPlotStatsSkeleton = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Skeleton variant="rectangular" sx={{ width: "100px", height: "20px", borderRadius: "20px" }} />
        <Skeleton
          variant="rectangular"
          sx={{ width: "100px", height: "20px", borderRadius: "20px", justifySelf: "end" }}
        />
        <Skeleton variant="rectangular" sx={{ width: "100px", height: "20px", borderRadius: "20px" }} />
        <Skeleton
          variant="rectangular"
          sx={{ width: "100px", height: "40px", borderRadius: "20px", justifySelf: "end" }}
        />
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr ",
          justifyContent: "center",
          alignItems: "end",
          gap: "20px",
        }}
      >
        <Skeleton
          variant="rectangular"
          sx={{
            width: "90px",
            height: "350px",
            borderRadius: "2px",
            marginY: "16px",
            justifySelf: "end",
            alignSelf: "start",
          }}
        />
        <Skeleton
          variant="rectangular"
          sx={{
            width: "90px",
            height: "350px",
            borderRadius: "2px",
            marginY: "16px",
            justifySelf: "start",
            alignSelf: "start",
          }}
        />
      </Box>
    </Box>
  );
};
