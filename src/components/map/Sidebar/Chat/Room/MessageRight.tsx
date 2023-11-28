import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
type MessageRightProps = {
  message: any;
  reactionsMap: { [key: string]: string[] };
};
export const MessageRight = ({ message }: MessageRightProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "end",
        gap: "10px",
      }}
    >
      <Box sx={{ marginTop: "45px", width: "90%" }}>
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: "500",
            lineHeight: "24px",
          }}
        >
          {message.sender}
        </Typography>

        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: "400",
            lineHeight: "24px",
            p: "10px 14px",
            background: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookO900 : DESIGN_SYSTEM_COLORS.orange100,
          }}
        >
          {message.message}
        </Typography>
      </Box>
    </Box>
  );
};
