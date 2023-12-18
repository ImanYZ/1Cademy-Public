import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
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
import { MessageLeft } from "./MessageLeft";

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
  setReplyOnMessage: any;
  selectedMessage: any;
  saveMessageEdit: any;
  db: any;
  roomType: any;
  leading: boolean;
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
  setReplyOnMessage,
  selectedMessage,
  saveMessageEdit,
  db,
  roomType,
  leading,
}: NewsCardProps) => {
  const [openReplies, setOpenReplies] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState("");
  const handleOpenReplies = () => setOpenReplies(prev => !prev);
  const handleSendReply = (imageUrls: string[], important = false) => {
    if (!inputMessage) return;
    sendReplyOnMessage(message, inputMessage, imageUrls, important);
    setInputMessage("");
  };
  const handleTyping = async (e: any) => {
    setInputMessage(e.target.value);
  };
  const handleReplyOnMessage = () => {
    setReplyOnMessage(message);
  };
  const handleEditMessage = () => {
    saveMessageEdit(inputMessage);
  };
  return (
    <Box
      sx={{
        display: "flex",
        gap: "5px",
        // pb: 3,
        mt: 2,
      }}
    >
      <Box sx={{ pt: 1 }}>
        <Avatar src={membersInfo[message.sender]?.imageUrl} />
      </Box>

      <Box sx={{ width: "90%" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex" }}>
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: "500",
                lineHeight: "24px",
              }}
            >
              {membersInfo[message.sender]?.fullname}
            </Typography>
            {message.important && (
              <Box sx={{ display: "flex", ml: 2 }}>
                {" "}
                <Typography sx={{ fontWeight: "bold", color: "red" }}>IMPORTANT</Typography>
                <PriorityHighIcon sx={{ color: "red", p: 0 }} />
              </Box>
            )}
          </Box>

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
          {editingMessage?.id === message.id ? (
            <Box>
              {" "}
              <MessageInput
                theme={"Dark"}
                placeholder={"Type your reply..."}
                channelUsers={channelUsers}
                sendMessage={handleEditMessage}
                handleTyping={handleTyping}
                inputValue={inputMessage}
                toggleEmojiPicker={toggleEmojiPicker}
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
                leading={leading}
              />
            </Box>
          ) : (
            <Box
              sx={{
                fontSize: "16px",
                fontWeight: "400",
                lineHeight: "24px",
              }}
            >
              <MarkdownRender text={message.message || ""} />
              <Typography sx={{ color: "grey", ml: 1 }}>{message.edited ? "(edited)" : ""}</Typography>
              <Box sx={{ display: "flex" }}>
                {(message.imageUrls || []).map(imageUrl => (
                  <NextImage
                    width={"500px"}
                    height={"300px"}
                    style={{ borderRadius: "8px" }}
                    src={imageUrl}
                    alt="news image"
                    key={imageUrl}
                  />
                ))}
              </Box>
            </Box>
          )}

          {editingMessage?.id !== message.id && (
            <>
              <Box className="message-buttons" sx={{ display: "none" }}>
                <MessageButtons
                  message={message}
                  toggleEmojiPicker={toggleEmojiPicker}
                  replyMessage={handleReplyOnMessage}
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
          {message?.replies?.length > 0 && editingMessage?.id !== message.id && (
            <Button onClick={handleOpenReplies} style={{ border: "none" }}>
              {openReplies ? "Hide" : message.replies.length} {message.replies.length > 1 ? "Replies" : "Reply"}
            </Button>
          )}
        </Box>

        {openReplies && (
          <Box
            sx={{
              transition: "ease-in",
              ml: "25px",
            }}
          >
            {(message.replies || []).map((reply: any, idx: number) => (
              <MessageLeft
                key={idx}
                selectedMessage={selectedMessage}
                message={reply}
                toggleEmojiPicker={toggleEmojiPicker}
                toggleReaction={toggleReaction}
                forwardMessage={forwardMessage}
                membersInfo={membersInfo}
                user={user}
                setReplyOnMessage={setReplyOnMessage}
                channelUsers={channelUsers}
                sendReplyOnMessage={sendReplyOnMessage}
                saveMessageEdit={saveMessageEdit}
                db={db}
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
                roomType={roomType}
                leading={leading}
              />
            ))}

            <Box sx={{ ml: "37px", mt: "13px" }}>
              <MessageInput
                theme={"Dark"}
                placeholder={"Type your reply..."}
                channelUsers={channelUsers}
                sendMessage={handleSendReply}
                handleTyping={handleTyping}
                inputValue={inputMessage}
                toggleEmojiPicker={toggleEmojiPicker}
                leading={leading}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
