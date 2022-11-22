import { Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

export type UserProfileSkeletonProps = {
  mobile?: boolean;
};

export const UserProfileSkeleton = ({ mobile }: UserProfileSkeletonProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: mobile ? "column-reverse" : "row",
        alignItems: "center",
        gap: mobile ? "16px" : "8px",
      }}
    >
      <Skeleton
        variant="rectangular"
        sx={{
          width: "75px",
          height: "16px",
          borderRadius: "10px",
        }}
      />
      <Skeleton
        variant="circular"
        sx={{
          width: "55px",
          height: "55px",
          justifySelf: "center",
          margin: "2px",
        }}
      />
    </Box>
  );
};
