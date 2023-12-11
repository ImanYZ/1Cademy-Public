import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import NextImage from "next/image";
import React from "react";
import { IChannelMessage } from "src/chatTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
type NewsCardProps = {
  message: IChannelMessage;
};
export const NewsCard = ({ message }: NewsCardProps) => {
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "end" }}>
        <Typography sx={{ fontSize: "12px" }}>
          {moment(message.createdAt.toDate().getTime()).format("h:mm a")}
        </Typography>
      </Box>
      <Box
        sx={{
          mb: "40px",
          p: 5,
          borderRadius: "5px",
          background: theme =>
            theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray200,
        }}
      >
        {message.imageUrl && (
          <NextImage
            width={"500px"}
            height={"300px"}
            style={{ borderRadius: "8px" }}
            src={message.imageUrl}
            alt="news image"
          />
        )}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "500",
              lineHeight: "24px",
            }}
          >
            {message.heading}
          </Typography>
        </Box>
        <MarkdownRender text={message.message || ""} />
      </Box>
    </Box>
  );
};
