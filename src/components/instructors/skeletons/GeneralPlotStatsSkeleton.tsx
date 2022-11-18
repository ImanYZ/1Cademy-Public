import { Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

export const GeneralPlotStatsSkeleton = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton variant="rectangular" sx={{ width: "100px", height: "32px", borderRadius: "20px" }} />
        <Skeleton variant="rectangular" sx={{ width: "50px", height: "20px", borderRadius: "20px" }} />
        <Skeleton variant="rectangular" sx={{ width: "70px", height: "20px", borderRadius: "20px" }} />
      </Box>
      <Skeleton variant="rectangular" sx={{ width: "100%", height: "16px", borderRadius: "20px", marginY: "16px" }} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr ",
          justifyContent: "space-between",
          alignItems: "end",
          gap: "40px",
        }}
      >
        {new Array(12).fill(0).map((x, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            sx={{
              width: i % 2 === 0 ? "150px" : "30px",
              height: "20px",
              borderRadius: "20px",
              justifySelf: i % 2 === 0 ? "start" : "end",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};
