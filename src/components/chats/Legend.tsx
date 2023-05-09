import { Box, SxProps, Theme, Typography } from "@mui/material";
import React, { Fragment } from "react";

type LegendProps = { title: string; options: { title: string; color: string }[]; sx?: SxProps<Theme> };

export const Legend = ({ title, options, sx }: LegendProps) => {
  return (
    <Box>
      <Typography sx={{ fontSize: "12px", mb: "6px" }}>{title}</Typography>
      <Box
        sx={{
          display: "grid",
          alignItems: "center",
          columnGap: "6px",
          rowGap: "6px",
          fontSize: "12px",
          ...sx,
        }}
      >
        {options.map((cur, idx) => (
          <Fragment key={idx}>
            <Box width={"12px"} height={"12px"} borderRadius={"2px"} sx={{ backgroundColor: cur.color }}></Box>
            <span>{cur.title}</span>
          </Fragment>
        ))}
      </Box>
    </Box>
  );
};
