import LinkIcon from "@mui/icons-material/Link";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { Button, CircularProgress, Typography } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import React, { Dispatch, SetStateAction } from "react";
import { IChannelMessage, MembersInfo } from "src/chatTypes";
import { UserTheme } from "src/knowledgeTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { Emoticons } from "../Common/Emoticons";
import { MessageButtons } from "./MessageButtons";
import { MessageInput } from "./MessageInput";
import { MessageLeft } from "./MessageLeft";
type MessageRightProps = {
  type?: string;
  theme: UserTheme;
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
  openReplies?: IChannelMessage | null;
  setOpenReplies?: any;
  replies?: IChannelMessage[];
  setReplies?: any;
  isRepliesLoaded?: boolean;
  setOpenMedia: Dispatch<SetStateAction<string | null>>;
  handleMentionUserOpenRoom: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, uname: string) => void;
  openDMChannel: (user2: any) => void;
};
export const NodeLink = ({
  db,
  theme,
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
  openReplies,
  setOpenReplies,
  replies,
  setReplies,
  isRepliesLoaded,
  setOpenMedia,
  handleMentionUserOpenRoom,
  openDMChannel,
}: MessageRightProps) => {
  const handleReplyMessage = () => {
    setOpenReplies(message);
  };

  const handleOpenReplies = () => {
    setReplies([]);
    if (openReplies?.id !== message?.id) {
      setOpenReplies(message);
    } else {
      setOpenReplies(null);
    }
  };

  return (
    <>
      {selectedChannel?.membersInfo[user.uname]?.unreadMessageId === message?.id && (
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box mt={2} sx={{ borderTop: "solid 1px red", width: "90%", mt: "11.5px" }} />
          <Typography color="error">New</Typography>
        </Box>
      )}
      <Box
        ref={el => (messageRefs.current[message?.id || 0] = el)}
        sx={{
          display: "flex",
          justifyContent: "start",
          gap: "10px",
          cursor: "pointer",
          pb: 4,
          pt: 2,
          opacity: isDeleting?.id === message?.id ? 0.5 : undefined,
          borderRadius: "8px",
        }}
      >
        <Box sx={{ display: "flex", gap: "5px", position: "relative" }}>
          <Box
            sx={{
              width: `${!message.parentMessage ? 40 : 30}px`,
              height: `${!message.parentMessage ? 40 : 30}px`,
              cursor: "pointer",
              borderRadius: "50%",
            }}
            onClick={() => {
              if (roomType === "direct") return;
              openDMChannel(membersInfo[message.sender]);
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
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex" }}>
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: "500",
                    lineHeight: "24px",
                  }}
                >
                  {membersInfo[message.sender]?.fullname || ""}
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
                {moment(message?.createdAt?.toDate()?.getTime())?.format("h:mm a")}
              </Typography>
            </Box>
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
                borderRadius: "8px",
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
              <MarkdownRender text={message?.node?.content || ""} handleLinkClick={handleMentionUserOpenRoom} />
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

              {(message?.totalReplies || 0) > 0 && editingMessage?.id !== message.id && (
                <Button onClick={handleOpenReplies} style={{ border: "none" }}>
                  {openReplies?.id === message?.id ? "Hide" : message?.totalReplies}{" "}
                  {message?.totalReplies || 0 > 1 ? "Replies" : "Reply"}
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

            {openReplies?.id === message?.id && (
              <Box
                sx={{
                  transition: "ease-in",
                  ml: "25px",
                }}
              >
                {!isRepliesLoaded && replies?.length === 0 && (
                  <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                    <CircularProgress />
                  </Box>
                )}
                {replies?.map((reply: any, idx: number) => (
                  <>
                    {reply?.node?.id ? (
                      <NodeLink
                        db={db}
                        type="reply"
                        theme={theme}
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
                        setOpenMedia={setOpenMedia}
                        handleMentionUserOpenRoom={handleMentionUserOpenRoom}
                        openDMChannel={openDMChannel}
                      />
                    ) : (
                      <MessageLeft
                        key={idx}
                        type={"reply"}
                        theme={theme}
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
                        setOpenMedia={setOpenMedia}
                        handleMentionUserOpenRoom={handleMentionUserOpenRoom}
                        openDMChannel={openDMChannel}
                      />
                    )}
                  </>
                ))}
                <Box sx={{ ml: "37px", mt: 2 }}>
                  <MessageInput
                    notebookRef={notebookRef}
                    nodeBookDispatch={nodeBookDispatch}
                    db={db}
                    theme={theme}
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
                    sendMessage={sendReplyOnMessage}
                    parentMessage={message}
                    setOpenMedia={setOpenMedia}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};
