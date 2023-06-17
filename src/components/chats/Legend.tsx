import { Box, Stack, SxProps, Theme, Typography } from "@mui/material";
import React, { useMemo } from "react";

export type LegendOptions = { title: string; color: string };

type LegendProps = { title: string; options: LegendOptions[]; sx?: SxProps<Theme> };

const Legend = ({ title, options, sx }: LegendProps) => {
  const reverseOptions = useMemo(() => [...options].reverse(), [options]);

  return (
    <Box>
      <Typography sx={{ fontSize: "12px", mb: "6px" }}>{title}</Typography>
      <Box
        sx={{
          display: "grid",
          alignItems: "center",
          columnGap: "8px",
          rowGap: "8px",
          fontSize: "12px",
          ...sx,
        }}
      >
        {reverseOptions.map((cur, idx) => (
          <Stack direction={"row"} alignItems="center" spacing="6px" key={idx}>
            <Box width={"12px"} height={"12px"} borderRadius={"2px"} sx={{ backgroundColor: cur.color }}></Box>
            <span>{cur.title}</span>
          </Stack>
        ))}
      </Box>
    </Box>
  );
};

export const LegendMemoized = React.memo(Legend);
