import SquareRoundedIcon from "@mui/icons-material/SquareRounded";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { Fragment } from "react";

type LegendProps = { title: string; options: { title: string; color: string }[] };

export const Legend = ({ title, options }: LegendProps) => {
  return (
    <Box>
      <Typography sx={{ fontSize: "12px", mb: "6px" }}>{title}</Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "16px 1fr 15px 1fr",
          alignItems: "center",
          columnGap: "6px",
          rowGap: "6px",
          fontSize: "12px",
        }}
      >
        {options.map((cur, idx) => (
          <Fragment key={idx}>
            <SquareRoundedIcon sx={{ fill: cur.color, fontSize: "18.5px" }} />
            <span>{cur.title}</span>
          </Fragment>
        ))}
      </Box>
    </Box>
  );
};
