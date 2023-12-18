import LinkIcon from "@mui/icons-material/Link";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
type MessageRightProps = {
  message: any;
  reactionsMap: { [key: string]: string[] };
};
export const NodeLink = ({ message }: MessageRightProps) => {
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
              theme.palette.mode === "dark"
                ? message.sender === "You"
                  ? DESIGN_SYSTEM_COLORS.notebookG700
                  : DESIGN_SYSTEM_COLORS.notebookO900
                : message.sender === "You"
                ? DESIGN_SYSTEM_COLORS.gray200
                : DESIGN_SYSTEM_COLORS.orange100,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              p: "10px",
              borderRadius: "8px",
              background: theme =>
                theme.palette.mode === "dark"
                  ? message.sender === "You"
                    ? DESIGN_SYSTEM_COLORS.notebookG600
                    : DESIGN_SYSTEM_COLORS.notebookO800
                  : message.sender === "You"
                  ? DESIGN_SYSTEM_COLORS.gray100
                  : DESIGN_SYSTEM_COLORS.orange50,
              mb: "10px",
            }}
          >
            <Box
              sx={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: DESIGN_SYSTEM_COLORS.primary600,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LinkIcon
                sx={{
                  color: DESIGN_SYSTEM_COLORS.gray25,
                }}
              />
            </Box>
            <Typography sx={{ fontWeight: "500" }}>Idea Nodes on 1Cademy</Typography>
          </Box>
          {message.message}
        </Typography>
      </Box>
    </Box>
  );
};
