import { Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

type BoxPlotSkeletonProps = {
  width: number;
  mobile?: boolean;
};
export const BoxPlotStatsSkeleton = ({ width, mobile }: BoxPlotSkeletonProps) => {
  const boxes = mobile ? 1 : 3;
  return (
    <Box sx={{ display: "flex", gap: "8px" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          justifyContent: "space-evenly",
        }}
      >
        {new Array(6).fill(1).map((x, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            sx={{ width: "120px", height: "16px", borderRadius: "20px", justifySelf: "end" }}
          />
        ))}
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          justifyContent: "center",
          alignItems: "end",
          gap: "20px",
        }}
      >
        {new Array(boxes).fill(1).map((x, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            sx={{
              width: `${width}px`,
              height: "300px",
              borderRadius: "5px",
              marginY: "16px",
              justifySelf: "end",
              marginBottom: "2px",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};
