import { Avatar, Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import React, { useState } from "react";
import { IChannelMessage } from "src/chatTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { Emoticons } from "../Common/Emoticons";
import { MessageButtons } from "./MessageButtons";
import { MessageInput } from "./MessageInput";
import { Replies } from "./Replies";
type MessageLeftProps = {
  selectedMessage: any;
  message: any;
  reply: boolean;
  toggleEmojiPicker: (event: any, message?: IChannelMessage) => void;
  toggleReaction: (message: IChannelMessage, emoji: string) => void;
  replyMessage: (message: any) => void;
  forwardMessage: (message: any) => void;
  handleTyping: any;
  membersInfo: any;
};
export const MessageLeft = ({
  message,
  // reply,
  toggleEmojiPicker,
  toggleReaction,
  handleTyping,
  forwardMessage,
  membersInfo,
  replyMessage,
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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "500",
              lineHeight: "24px",
            }}
          >
            {membersInfo[message.sender]?.fullname || "Haroon Waheed"}
          </Typography>
          <Typography sx={{ fontSize: "12px" }}>
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
            <Button onClick={() => setOpenReplies(!openReplies)} style={{ border: "none" }}>
              {openReplies ? "Hide" : message.replies.length} {message.replies.length > 1 ? "Replies" : "Reply"}
            </Button>
          )}
          <Box className="message-buttons" sx={{ display: "none" }}>
            <MessageButtons
              message={message}
              toggleEmojiPicker={toggleEmojiPicker}
              replyMessage={replyMessage}
              forwardMessage={forwardMessage}
            />
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5px" }}>
            <Emoticons
              message={message}
              reactionsMap={message.reactions}
              toggleEmojiPicker={toggleEmojiPicker}
              toggleReaction={toggleReaction}
            />
          </Box>
        </Box>
        {openReplies && (
          <Box
            sx={{
              transition: "ease-in",
              ml: "25px",
            }}
          >
            {message.replies.length > 0 &&
              message.replies.map((reply: any, idx: number) => (
                <Replies
                  key={idx}
                  reply={reply}
                  toggleEmojiPicker={toggleEmojiPicker}
                  toggleReaction={toggleReaction}
                  forwardMessage={forwardMessage}
                />
              ))}
            <Box sx={{ ml: "37px" }}>
              <MessageInput
                theme={"Dark"}
                placeholder={"Type your reply..."}
                channelUsers={[]}
                sendMessage={() => {}}
                handleTyping={handleTyping}
                handleKeyPress={() => {}}
                inputValue={""}
                toggleEmojiPicker={toggleEmojiPicker}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
