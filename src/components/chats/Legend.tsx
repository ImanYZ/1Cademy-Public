import SquareIcon from "@mui/icons-material/Square";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { Fragment } from "react";

type LegendProps = { title: string; options: { title: string; color: string }[] };

export const Legend = ({ title, options }: LegendProps) => {
  return (
    <Box>
      <Typography sx={{ fontSize: "12px" }}>{title}</Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "15px 1fr 15px 1fr",
          alignItems: "center",
          columnGap: "2px",
          fontSize: "12px",
        }}
      >
        {options.map((cur, idx) => (
          <Fragment key={idx}>
            <SquareIcon fontSize="inherit" sx={{ fill: cur.color }} />
            <span>{cur.title}</span>
          </Fragment>
        ))}
      </Box>
    </Box>
  );
};
