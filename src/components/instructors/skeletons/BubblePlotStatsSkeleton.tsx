import { Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

export const BubblePlotStatsSkeleton = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "56px", justifyContent: "space-between" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Skeleton
          variant="rectangular"
          sx={{ width: "100px", height: "20px", borderRadius: "20px", justifySelf: "end" }}
        />
        <Skeleton
          variant="rectangular"
          sx={{ width: "100px", height: "40px", borderRadius: "20px", justifySelf: "end" }}
        />
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr",
          justifyContent: "center",
          alignItems: "end",
        }}
      >
        <Skeleton
          variant="rectangular"
          sx={{
            width: "100%",
            height: "350px",
            borderRadius: "5px",
            marginY: "16px",
            justifySelf: "end",
            marginBottom: "2px",
          }}
        />
      </Box>
    </Box>
  );
};
