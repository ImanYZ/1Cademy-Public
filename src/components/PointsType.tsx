import { Box, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

import { DESIGN_SYSTEM_COLORS } from "../lib/theme/colors";

export const PointsType = ({
  points,
  children,
  fontWeight = 600,
  fontSize = "16px",
}: {
  points: number;
  children: ReactNode;
  fontSize?: string;
  fontWeight?: number;
}) => {
  const { notebookG700, notebookG50 } = DESIGN_SYSTEM_COLORS;
  return (
    <Stack direction={"row"} alignItems={"center"} spacing={"6px"}>
      <Typography sx={{ fontWeight, fontSize }}>{points}</Typography>
      <Box
        sx={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          backgroundColor: theme => (theme.palette.mode === "dark" ? notebookG700 : notebookG50),
        }}
      >
        {children}
      </Box>
    </Stack>
  );
};
