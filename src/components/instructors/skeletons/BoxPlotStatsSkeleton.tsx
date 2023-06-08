import { Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

type BoxPlotSkeletonProps = {
  width: number;
  boxes: number;
};
export const BoxPlotStatsSkeleton = ({ width, boxes }: BoxPlotSkeletonProps) => {
  return (
    <Box sx={{ display: "flex" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${boxes},1fr)`,
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
