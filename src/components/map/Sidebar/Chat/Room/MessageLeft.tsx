import AddReactionIcon from "@mui/icons-material/AddReaction";
import { IconButton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
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
};
export const MessageLeft = ({
  message,
  reactionsMap,
  toggleEmojiPicker,
  toggleReaction,
  setReply,
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
        gap: "10px",
      }}
    >
      <Box
        sx={{
          marginTop: "45px",
          width: `${40}px`,
          height: `${40}px`,
          cursor: "pointer",
          transition: "all 0.2s 0s ease",
          background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
          borderRadius: "50%",
          "& > .user-image": {
            borderRadius: "50%",
            overflow: "hidden",
            width: "40px",
            height: "40px",
          },
          "@keyframes slidein": {
            from: {
              transform: "translateY(0%)",
            },
            to: {
              transform: "translateY(100%)",
            },
          },
        }}
      >
        <Box className="user-image">
          <OptimizedAvatar2 alt={"Haroon Waheed"} imageUrl={message?.imageUrl} size={40} sx={{ border: "none" }} />
        </Box>
        <Box sx={{ background: "#12B76A" }} className="UserStatusOnlineIcon" />
      </Box>
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
          {!reactionsMap[message.id]?.length && (
            <IconButton
              sx={{ position: "absolute", left: "0px" }}
              onClick={(e: any) => toggleEmojiPicker(e, message.id)}
            >
              <AddReactionIcon color="secondary" />
            </IconButton>
          )}
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
