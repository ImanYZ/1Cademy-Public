import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import CircularProgress, { CircularProgressProps } from "@mui/material/CircularProgress";
import * as React from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

// Inspired by the former Facebook spinners.
type CustomCircularProgressProps = {
  realValue: number;
};

export const CustomCircularProgress = (props: CircularProgressProps & CustomCircularProgressProps) => {
  return (
    <Box sx={{ position: "relative", height: "100%", alignSelf: "center" }}>
      <CircularProgress
        variant="determinate"
        sx={{
          "& .MuiCircularProgress-circle": {
            stroke: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG450 : DESIGN_SYSTEM_COLORS.orange200,
          },
        }}
        thickness={4}
        size={60}
        value={100}
      />
      <CircularProgress
        variant="determinate"
        sx={{
          color: DESIGN_SYSTEM_COLORS.success500,
          position: "absolute",
          left: 0,
        }}
        thickness={4}
        size={60}
        {...props}
      />
      <Box
        sx={{
          inset: 0,
          top: -4,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ fontSize: "18px", fontWeight: "600" }}>{`${Math.round(props.realValue)}`}</Typography>
      </Box>
    </Box>
  );
};
