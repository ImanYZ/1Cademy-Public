import { Divider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
type MessageRightProps = {
  message: any;
  reply: string;
};
export const MessageReply = ({ reply, message }: MessageRightProps) => {
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
              marginBottom: "10px",
            }}
          >
            <Divider
              sx={{
                borderColor: "#f99346",
              }}
              orientation="vertical"
              flexItem
            />
            <Box>
              <Typography sx={{ fontWeight: "500" }}>Olivia</Typography>
              <Typography sx={{ fontWeight: "400", color: DESIGN_SYSTEM_COLORS.notebookG200 }}>
                {reply.substring(0, 50)}
              </Typography>
            </Box>
          </Box>
          {message.message}
        </Typography>
      </Box>
    </Box>
  );
};
