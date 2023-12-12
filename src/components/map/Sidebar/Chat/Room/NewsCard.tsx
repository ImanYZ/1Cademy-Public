import { Avatar, Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import NextImage from "next/image";
import React, { useState } from "react";
import { IChannelMessage } from "src/chatTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { Emoticons } from "../Common/Emoticons";
import { MessageButtons } from "./MessageButtons";
import { MessageInput } from "./MessageInput";
import { Replies } from "./Replies";
type NewsCardProps = {
  message: IChannelMessage;
  membersInfo: any;
  toggleEmojiPicker: any;
  sendReplyOnMessage: any;
  channelUsers: any;
  toggleReaction: any;
  forwardMessage: any;
  editingMessage: any;
  setEditingMessage: any;
  user: any;
};
export const NewsCard = ({
  message,
  membersInfo,
  toggleEmojiPicker,
  sendReplyOnMessage,
  channelUsers,
  toggleReaction,
  forwardMessage,
  editingMessage,
  setEditingMessage,
  user,
}: NewsCardProps) => {
  const [openReplies, setOpenReplies] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState("");
  const handleOpenReplies = () => setOpenReplies(prev => !prev);
  const handleSendReply = () => {
    if (!inputMessage) return;
    sendReplyOnMessage(message, inputMessage);
    setInputMessage("");
  };
  const handleTyping = async (e: any) => {
    setInputMessage(e.target.value);
  };
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
            {membersInfo[message.sender]?.fullname}
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
            gap: "5px",
            background: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray200,
          }}
        >
          <Typography
            sx={{
              fontSize: "25px",
              fontWeight: "500",
              lineHeight: "24px",
              textTransform: "capitalize",
              p: "14px",
              pl: 0,
            }}
          >
            {message.heading}
          </Typography>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "400",
              lineHeight: "24px",
              display: "flex",
              mb: "9px",
            }}
          >
            <MarkdownRender text={message.message || ""} />
            <Typography sx={{ color: "grey", ml: 1 }}>{message.edited ? "(edited)" : ""}</Typography>
          </Typography>
          {message.imageUrl && (
            <NextImage
              width={"500px"}
              height={"300px"}
              style={{ borderRadius: "8px" }}
              src={message.imageUrl}
              alt="news image"
            />
          )}
          {message?.replies?.length > 0 && editingMessage?.id !== message.id && (
            <Button onClick={handleOpenReplies} style={{ border: "none" }}>
              {openReplies ? "Hide" : message.replies.length} {message.replies.length > 1 ? "Replies" : "Reply"}
            </Button>
          )}
          {editingMessage?.id !== message.id && (
            <>
              <Box className="message-buttons" sx={{ display: "none" }}>
                <MessageButtons
                  message={message}
                  toggleEmojiPicker={toggleEmojiPicker}
                  replyMessage={() => {}}
                  forwardMessage={forwardMessage}
                  setEditingMessage={setEditingMessage}
                  setInputMessage={setInputMessage}
                  user={user}
                />
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5px" }}>
                <Emoticons
                  message={message}
                  reactionsMap={message.reactions}
                  toggleEmojiPicker={toggleEmojiPicker}
                  toggleReaction={toggleReaction}
                  user={user}
                />
              </Box>
            </>
          )}
          {openReplies && (
            <Box
              sx={{
                transition: "ease-in",
                ml: "25px",
              }}
            >
              {(message.replies || []).map((reply: any, idx: number) => (
                <Replies
                  key={idx}
                  reply={{ ...reply, fullname: membersInfo[reply.sender].fullname }}
                  toggleEmojiPicker={toggleEmojiPicker}
                  toggleReaction={toggleReaction}
                  forwardMessage={forwardMessage}
                  user={user}
                  membersInfo={membersInfo}
                />
              ))}
              <Box sx={{ ml: "37px" }}>
                <MessageInput
                  theme={"Dark"}
                  placeholder={"Type your reply..."}
                  channelUsers={channelUsers}
                  sendMessage={handleSendReply}
                  handleTyping={handleTyping}
                  handleKeyPress={() => {}}
                  inputValue={inputMessage}
                  toggleEmojiPicker={toggleEmojiPicker}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
