import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
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
import { MessageLeft } from "./MessageLeft";

type NewsCardProps = {
  notebookRef: any;
  messageRefs: any;
  nodeBookDispatch: any;
  message: IChannelMessage;
  membersInfo: any;
  toggleEmojiPicker: any;
  replyOnMessage: any;
  channelUsers: any;
  toggleReaction: any;
  forwardMessage: any;
  editingMessage: any;
  setEditingMessage: any;
  user: any;
  setReplyOnMessage: any;
  selectedMessage: any;
  db: any;
  roomType: any;
  leading: boolean;
  getMessageRef: any;
  selectedChannel: any;
  onlineUsers: any;
  sendMessage: any;
  sendReplyOnMessage: any;
  isLoadingReaction: IChannelMessage | null;
  makeMessageUnread: (message: IChannelMessage) => void;
};
export const NewsCard = ({
  notebookRef,
  messageRefs,
  nodeBookDispatch,
  message,
  membersInfo,
  toggleEmojiPicker,
  channelUsers,
  toggleReaction,
  forwardMessage,
  editingMessage,
  setEditingMessage,
  user,
  setReplyOnMessage,
  selectedMessage,
  db,
  roomType,
  leading,
  replyOnMessage,
  getMessageRef,
  selectedChannel,
  onlineUsers,
  sendMessage,
  sendReplyOnMessage,
  isLoadingReaction,
  makeMessageUnread,
}: NewsCardProps) => {
  const [openReplies, setOpenReplies] = useState<boolean>(false);
  const handleOpenReplies = () => setOpenReplies(prev => !prev);

  const handleReplyOnMessage = () => {
    setReplyOnMessage(message);
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
        <Box
          sx={{
            background: onlineUsers.includes(membersInfo[message.sender]?.uname) ? "#12B76A" : "grey",
            fontSize: "1px",
          }}
          className="UserStatusOnlineIcon"
        />
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
                notebookRef={notebookRef}
                nodeBookDispatch={nodeBookDispatch}
                db={db}
                user={user}
                theme={"Dark"}
                placeholder={"Type your reply..."}
                channelUsers={channelUsers}
                sendMessageType={"reply"}
                toggleEmojiPicker={toggleEmojiPicker}
                leading={leading}
                getMessageRef={getMessageRef}
                selectedChannel={selectedChannel}
                replyOnMessage={replyOnMessage}
                setReplyOnMessage={setReplyOnMessage}
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
                sendMessage={sendMessage}
                sendReplyOnMessage={sendReplyOnMessage}
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
                  <img
                    width={"100%"}
                    style={{ borderRadius: "8px", objectFit: "contain" }}
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
                  user={user}
                  makeMessageUnread={makeMessageUnread}
                />
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5px" }}>
                <Emoticons
                  message={message}
                  reactionsMap={message.reactions}
                  toggleEmojiPicker={toggleEmojiPicker}
                  toggleReaction={toggleReaction}
                  user={user}
                  isLoadingReaction={isLoadingReaction}
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
                notebookRef={notebookRef}
                messageRefs={messageRefs}
                nodeBookDispatch={nodeBookDispatch}
                key={idx}
                selectedMessage={selectedMessage}
                message={reply}
                toggleEmojiPicker={toggleEmojiPicker}
                toggleReaction={toggleReaction}
                forwardMessage={forwardMessage}
                membersInfo={membersInfo}
                user={user}
                replyOnMessage={replyOnMessage}
                setReplyOnMessage={setReplyOnMessage}
                channelUsers={channelUsers}
                db={db}
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
                roomType={roomType}
                leading={leading}
                selectedChannel={selectedChannel}
                getMessageRef={getMessageRef}
                onlineUsers={onlineUsers}
                sendMessage={sendMessage}
                sendReplyOnMessage={sendReplyOnMessage}
                isLoadingReaction={isLoadingReaction}
                makeMessageUnread={makeMessageUnread}
              />
            ))}

            <Box sx={{ ml: "37px", mt: "13px" }}>
              <MessageInput
                notebookRef={notebookRef}
                nodeBookDispatch={nodeBookDispatch}
                db={db}
                user={user}
                theme={"Dark"}
                placeholder={"Type your reply..."}
                channelUsers={channelUsers}
                sendMessageType={"reply"}
                toggleEmojiPicker={toggleEmojiPicker}
                leading={leading}
                getMessageRef={getMessageRef}
                selectedChannel={selectedChannel}
                replyOnMessage={message}
                setReplyOnMessage={setReplyOnMessage}
                sendMessage={sendMessage}
                sendReplyOnMessage={sendReplyOnMessage}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
