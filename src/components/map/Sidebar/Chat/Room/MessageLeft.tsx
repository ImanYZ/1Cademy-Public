import { Avatar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import React, { useState } from "react";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { Emoticons } from "../Common/Emoticons";
import { MessageButtons } from "./MessageButtons";
type MessageLeftProps = {
  message: any;
  reactionsMap: { [key: string]: string[] };
  setReactionsMap: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
  toggleEmojiPicker: (event: any, messageId?: string) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
  setReply: React.Dispatch<React.SetStateAction<{ id: string | null; message: string | null }>>;
  membersInfo: any;
};
export const MessageLeft = ({
  message,
  reactionsMap,
  toggleEmojiPicker,
  toggleReaction,
  setReply,
  membersInfo,
}: MessageLeftProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  return (
    <Box
      sx={{
        display: "flex",
        gap: "5px",
      }}
    >
      <Box sx={{ mt: "45px" }}>
        <Avatar src={membersInfo[message.sender].imageUrl} />
      </Box>

      <Box sx={{ marginTop: "45px", width: "90%" }}>
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: "500",
            lineHeight: "24px",
          }}
        >
          {membersInfo[message.sender].fullname}
        </Typography>
        <Typography sx={{ ml: "4px", fontSize: "12px" }}>
          {moment(message.createdAt.toDate().getTime()).format("h:mm:ss A MMM D, YYYY")}
        </Typography>
        <Box
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{
            position: "relative",
            fontSize: "16px",
            fontWeight: "400",
            lineHeight: "24px",
            p: "10px 14px",
            background: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray200,
          }}
        >
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "400",
              lineHeight: "24px",
            }}
          >
            <MarkdownRender text={message.message || ""} />
          </Typography>
          {isHovered && <MessageButtons message={message} setReply={setReply} />}
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5px" }}>
            <Emoticons
              messageId={message.id}
              reactionsMap={reactionsMap}
              toggleEmojiPicker={toggleEmojiPicker}
              toggleReaction={toggleReaction}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
