import { Avatar, Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { arrayUnion, collection, doc, updateDoc } from "firebase/firestore";
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
  toggleEmojiPicker: (event: any, message?: IChannelMessage) => void;
  toggleReaction: (message: IChannelMessage, emoji: string) => void;
  forwardMessage: (message: any) => void;
  membersInfo: any;
  setReplyOnMessage: any;
  channelUsers: any;
  sendReplyOnMessage: (message: IChannelMessage, inputMessage: string) => void;
  user: any;
  db: any;
  editingMessage: any;
  setEditingMessage: any;
  saveMessageEdit?: any;
};
export const MessageLeft = ({
  message,
  toggleEmojiPicker,
  toggleReaction,
  forwardMessage,
  membersInfo,
  setReplyOnMessage,
  channelUsers,
  sendReplyOnMessage,
  user,
  db,
  editingMessage,
  setEditingMessage,
  saveMessageEdit,
}: MessageLeftProps) => {
  const [openReplies, setOpenReplies] = useState<boolean>(false);

  const [inputMessage, setInputMessage] = useState("");

  const handleReplyMessage = () => {
    setReplyOnMessage(message);
  };

  const handleSendReply = () => {
    if (!inputMessage) return;
    sendReplyOnMessage(message, inputMessage);
    setInputMessage("");
  };
  const handleTyping = async (e: any) => {
    setInputMessage(e.target.value);
    const channelRef = doc(collection(db, "channels"), message.channelId);
    if (user.uname)
      await updateDoc(channelRef, {
        typing: arrayUnion(user.uname),
      });
    setTimeout(async () => {
      await updateDoc(channelRef, {
        typing: [],
      });
    }, 10000);
  };

  const handleOpenReplies = () => setOpenReplies(prev => !prev);
  const handleEditMessage = () => {
    saveMessageEdit(inputMessage);
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
                handleKeyPress={() => {}}
                inputValue={inputMessage}
                toggleEmojiPicker={toggleEmojiPicker}
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
              />
            </Box>
          ) : (
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: "400",
                lineHeight: "24px",
                display: "flex",
              }}
            >
              <MarkdownRender text={message.message || ""} />
              <Typography sx={{ color: "grey", ml: 1 }}>{message.edited ? "(edited)" : ""}</Typography>
            </Typography>
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
                  replyMessage={handleReplyMessage}
                  forwardMessage={forwardMessage}
                  setEditingMessage={setEditingMessage}
                  setInputMessage={setInputMessage}
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
            </>
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
              <Replies
                key={idx}
                reply={{ ...reply, fullname: membersInfo[reply.sender].fullname }}
                toggleEmojiPicker={toggleEmojiPicker}
                toggleReaction={toggleReaction}
                forwardMessage={forwardMessage}
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
  );
};
