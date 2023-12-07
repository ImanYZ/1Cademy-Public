import { Avatar, Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import React, { useState } from "react";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { Emoticons } from "../Common/Emoticons";
import { MessageButtons } from "./MessageButtons";
import { Replies } from "./Replies";
type MessageLeftProps = {
  message: any;
  reactionsMap: { [key: string]: string[] };
  setReactionsMap: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
  toggleEmojiPicker: (event: any, messageId?: string) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
  setReply?: React.Dispatch<React.SetStateAction<{ id: string | null; message: string | null }>>;
  membersInfo: any;
};
export const MessageLeft = ({
  message,
  reactionsMap,
  toggleEmojiPicker,
  toggleReaction,

  membersInfo,
}: MessageLeftProps) => {
  const [openReplies, setOpenReplies] = useState<boolean>(false);

  return (
    <Box
      sx={{
        display: "flex",
        gap: "5px",
        pb: 3,
      }}
    >
      <Box sx={{ pt: 1 }}>
        <Avatar src={membersInfo[message.sender]?.imageUrl} />
      </Box>

      <Box sx={{ width: "90%" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "500",
              lineHeight: "24px",
            }}
          >
            {membersInfo[message.sender]?.fullname || "Haroon Waheed"}
          </Typography>
          <Typography sx={{ ml: "4px", fontSize: "12px" }}>
            {moment(message.createdAt.toDate().getTime()).format("h:mm a")}
          </Typography>
        </Box>
        <Box
          className="reply-box"
          sx={{
            position: "relative",
            fontSize: "16px",
            fontWeight: "400",
            lineHeight: "24px",
            p: "10px 14px",
            borderRadius: "9px",
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
          {message?.replies?.length > 0 && (
            <Button onClick={() => setOpenReplies(!openReplies)}>
              {message.replies.length} {message.replies.length > 1 ? "Replies" : "Reply"}
            </Button>
          )}
          <Box className="message-buttons" sx={{ display: "none" }}>
            <MessageButtons message={message} />
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5px" }}>
            <Emoticons
              messageId={message.id}
              reactionsMap={reactionsMap}
              toggleEmojiPicker={toggleEmojiPicker}
              toggleReaction={toggleReaction}
            />
          </Box>
        </Box>
        {openReplies && (
          <Box
            sx={{
              transition: "ease-in",
            }}
          >
            {message.replies.length > 0 &&
              message.replies.map((reply: any, idx: number) => (
                <Replies
                  key={idx}
                  reply={reply}
                  reactionsMap={reactionsMap}
                  toggleEmojiPicker={toggleEmojiPicker}
                  toggleReaction={toggleReaction}
                />
              ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
