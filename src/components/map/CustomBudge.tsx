import { Box, SxProps, Theme } from "@mui/material";
import React from "react";

type CustomBadgeProps = { value: number; sx?: SxProps<Theme> };

export const CustomBadge = ({ value, sx }: CustomBadgeProps) => {
  if (value === 0) return null;

  return (
    <Box
      sx={{
        minWidth: "24px",
        height: "24px",
        p: "6px 4px",
        borderRadius: "28px",
        background: "#E34848",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...sx,
      }}
    >
      {value > 99 ? "99+" : value}
    </Box>
  );
};

type CustomSmallBadgeProps = { value: number };

export const CustomSmallBadge = ({ value }: CustomSmallBadgeProps) => {
  if (!value) return null;
  return <Box sx={{ width: "6px", height: "6px", borderRadius: "50%", background: "#E34848" }} />;
};
