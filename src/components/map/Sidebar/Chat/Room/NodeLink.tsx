import LinkIcon from "@mui/icons-material/Link";
import { Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import { IChannelMessage, MembersInfo } from "src/chatTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { Emoticons } from "../Common/Emoticons";
import { MessageButtons } from "./MessageButtons";
import { MessageInput } from "./MessageInput";
import { MessageLeft } from "./MessageLeft";
type MessageRightProps = {
  type?: string;
  notebookRef: any;
  messageRefs: any;
  nodeBookDispatch: any;
  user: any;
  parentMessage?: IChannelMessage;
  message: IChannelMessage;
  membersInfo: MembersInfo;
  openLinkedNode: any;
  toggleEmojiPicker: (event: any, message?: IChannelMessage) => void;
  toggleReaction: (message: IChannelMessage, emoji: string) => void;
  roomType: any;
  db: any;
  selectedChannel: any;
  onlineUsers: any;
  setReplyOnMessage: any;
  editingMessage: any;
  setEditingMessage: any;
  leading: any;
  getMessageRef: any;
  handleDeleteReply: any;
  isDeleting: any;
  sendMessage: any;
  replyOnMessage: any;
  forwardMessage: (message: any) => void;
  channelUsers: any;
  sendReplyOnMessage: (
    curMessage: IChannelMessage | null,
    inputMessage: string,
    imageUrls: string[],
    important: boolean,
    node: any
  ) => Promise<void>;
  setMessages: any;
  selectedMessage: { id: string | null; message: string | null } | {};
  handleDeleteMessage: (message: IChannelMessage) => void;
  isLoadingReaction: IChannelMessage | null;
  makeMessageUnread: (message: IChannelMessage) => void;
};
export const NodeLink = ({
  db,
  messageRefs,
  parentMessage,
  user,
  type,
  message,
  membersInfo,
  openLinkedNode,
  onlineUsers,
  toggleEmojiPicker,
  toggleReaction,
  roomType,
  notebookRef,
  nodeBookDispatch,
  leading,
  getMessageRef,
  handleDeleteReply,
  sendMessage,
  replyOnMessage,
  forwardMessage,
  channelUsers,
  sendReplyOnMessage,
  setReplyOnMessage,
  editingMessage,
  setEditingMessage,
  selectedChannel,
  setMessages,
  selectedMessage,
  handleDeleteMessage,
  isDeleting,
  isLoadingReaction,
  makeMessageUnread,
}: MessageRightProps) => {
  const [openReplies, setOpenReplies] = useState<boolean>(false);

  const handleOpenReplies = () => {
    setOpenReplies(prev => !prev);
  };

  const handleReplyMessage = () => {
    setReplyOnMessage(message);
  };
  return (
    <Box
      ref={el => (messageRefs.current[message?.id || 0] = el)}
      sx={{
        display: "flex",
        justifyContent: "end",
        gap: "10px",
        cursor: "pointer",
        pb: 4,
        pt: 2,
        opacity: isDeleting?.id === message?.id ? 0.5 : undefined,
      }}
    >
      <Box sx={{ display: "flex", gap: "5px", position: "relative" }}>
        <Box
          sx={{
            width: `${!message.parentMessage ? 40 : 30}px`,
            height: `${!message.parentMessage ? 40 : 30}px`,
            cursor: "pointer",
            transition: "all 0.2s 0s ease",
            background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
            borderRadius: "50%",
            "& > .user-image": {
              borderRadius: "50%",
              overflow: "hidden",
              width: "30px",
              height: "30px",
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
          <OptimizedAvatar2
            alt={membersInfo[message.sender]?.fullname || ""}
            imageUrl={membersInfo[message.sender]?.imageUrl || ""}
            size={!message.parentMessage ? 40 : 30}
            sx={{ border: "none" }}
          />

          <Box
            sx={{
              background: onlineUsers.includes(membersInfo[message.sender]?.uname) ? "#12B76A" : "grey",
              fontSize: "1px",
            }}
            className="UserStatusOnlineIcon"
          />
        </Box>
        <Box>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "500",
              lineHeight: "24px",
            }}
          >
            {membersInfo[message.sender]?.fullname || ""}
          </Typography>

          <Box
            className="reply-box"
            sx={{
              position: "relative",

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
                p: "10px",
                borderRadius: "8px",
                background: theme =>
                  theme.palette.mode === "dark"
                    ? message.sender === "You"
                      ? DESIGN_SYSTEM_COLORS.notebookG600
                      : DESIGN_SYSTEM_COLORS.notebookO800
                    : message.sender === "You"
                    ? DESIGN_SYSTEM_COLORS.gray100
                    : DESIGN_SYSTEM_COLORS.orange50,
                mb: "10px",
              }}
              onClick={() => openLinkedNode(message?.node?.id)}
            >
              <Box
                sx={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: DESIGN_SYSTEM_COLORS.primary600,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <LinkIcon
                  sx={{
                    color: DESIGN_SYSTEM_COLORS.gray25,
                  }}
                />
              </Box>
              <Typography sx={{ fontWeight: "500" }}>
                {message?.node?.title?.substr(0, 40)}
                {message?.node?.title?.length || 0 > 40 ? "..." : ""}
              </Typography>
            </Box>
            <MarkdownRender text={message?.node?.content || ""} />
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
            {message?.replies?.length > 0 && editingMessage?.id !== message.id && (
              <Button onClick={handleOpenReplies} style={{ border: "none" }}>
                {openReplies ? "Hide" : message.replies.length} {message.replies.length > 1 ? "Replies" : "Reply"}
              </Button>
            )}
            {isDeleting?.id !== message?.id && (
              <Box className="message-buttons" sx={{ display: "none" }}>
                <MessageButtons
                  message={message}
                  replyMessage={handleReplyMessage}
                  toggleEmojiPicker={toggleEmojiPicker}
                  handleDeleteMessage={() =>
                    type === "reply" ? handleDeleteReply(parentMessage, message) : handleDeleteMessage(message)
                  }
                  user={user}
                  makeMessageUnread={makeMessageUnread}
                />
              </Box>
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
                <>
                  {reply?.node?.id ? (
                    <NodeLink
                      db={db}
                      type="reply"
                      notebookRef={notebookRef}
                      messageRefs={messageRefs}
                      nodeBookDispatch={nodeBookDispatch}
                      replyOnMessage={replyOnMessage}
                      forwardMessage={forwardMessage}
                      user={user}
                      parentMessage={message}
                      message={reply}
                      membersInfo={selectedChannel.membersInfo}
                      openLinkedNode={openLinkedNode}
                      onlineUsers={onlineUsers}
                      toggleEmojiPicker={toggleEmojiPicker}
                      toggleReaction={toggleReaction}
                      roomType={roomType}
                      selectedChannel={selectedChannel}
                      channelUsers={channelUsers}
                      editingMessage={editingMessage}
                      setEditingMessage={setEditingMessage}
                      leading={leading}
                      getMessageRef={getMessageRef}
                      handleDeleteReply={handleDeleteReply}
                      isDeleting={isDeleting}
                      sendMessage={sendMessage}
                      sendReplyOnMessage={sendReplyOnMessage}
                      setReplyOnMessage={setReplyOnMessage}
                      setMessages={setMessages}
                      selectedMessage={selectedMessage}
                      handleDeleteMessage={handleDeleteMessage}
                      isLoadingReaction={isLoadingReaction}
                      makeMessageUnread={makeMessageUnread}
                    />
                  ) : (
                    <MessageLeft
                      key={idx}
                      type={"reply"}
                      messageRefs={messageRefs}
                      notebookRef={notebookRef}
                      nodeBookDispatch={nodeBookDispatch}
                      selectedMessage={selectedMessage}
                      parentMessage={message}
                      message={reply}
                      toggleEmojiPicker={toggleEmojiPicker}
                      toggleReaction={toggleReaction}
                      forwardMessage={forwardMessage}
                      membersInfo={membersInfo}
                      user={user}
                      setReplyOnMessage={setReplyOnMessage}
                      channelUsers={channelUsers}
                      replyOnMessage={replyOnMessage}
                      db={db}
                      editingMessage={editingMessage}
                      setEditingMessage={setEditingMessage}
                      roomType={roomType}
                      leading={leading}
                      getMessageRef={getMessageRef}
                      selectedChannel={selectedChannel}
                      onlineUsers={onlineUsers}
                      handleDeleteMessage={handleDeleteMessage}
                      handleDeleteReply={handleDeleteReply}
                      isDeleting={isDeleting}
                      sendMessage={sendMessage}
                      sendReplyOnMessage={sendReplyOnMessage}
                      isLoadingReaction={isLoadingReaction}
                      makeMessageUnread={makeMessageUnread}
                    />
                  )}
                </>
              ))}
              <Box sx={{ ml: "37px", mt: 2 }}>
                <MessageInput
                  notebookRef={notebookRef}
                  nodeBookDispatch={nodeBookDispatch}
                  db={db}
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
                  user={user}
                  setMessages={setMessages}
                  roomType={roomType}
                  sendMessage={sendMessage}
                  sendReplyOnMessage={sendReplyOnMessage}
                  parentMessage={message}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
