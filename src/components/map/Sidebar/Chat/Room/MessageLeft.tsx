import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { Button, CircularProgress, Typography } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import React, { Dispatch, Fragment, SetStateAction } from "react";
import { IChannelMessage } from "src/chatTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { Emoticons } from "../Common/Emoticons";
import { MessageButtons } from "./MessageButtons";
import { MessageInput } from "./MessageInput";
import { NodeLink } from "./NodeLink";
type MessageLeftProps = {
  type?: string;
  messageRefs: any;
  notebookRef: any;
  nodeBookDispatch: any;
  selectedMessage: any;
  parentMessage?: IChannelMessage;
  message: IChannelMessage;
  toggleEmojiPicker: (event: any, message?: IChannelMessage) => void;
  toggleReaction: (message: IChannelMessage, emoji: string) => void;
  forwardMessage: (message: any) => void;
  membersInfo: any;
  setReplyOnMessage: any;
  channelUsers: any;
  replyOnMessage: any;
  user: any;
  db: any;
  editingMessage: any;
  setEditingMessage: any;
  roomType: string;
  leading: boolean;
  getMessageRef: any;
  selectedChannel: any;
  setMessages?: any;
  onlineUsers: any;
  openLinkedNode?: any;
  handleDeleteMessage?: any;
  handleDeleteReply?: any;
  isDeleting?: IChannelMessage | null;
  sendMessage: any;
  sendReplyOnMessage: any;
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
export const MessageLeft = ({
  type,
  messageRefs,
  notebookRef,
  nodeBookDispatch,
  selectedMessage,
  parentMessage,
  message,
  toggleEmojiPicker,
  toggleReaction,
  forwardMessage,
  membersInfo,
  setReplyOnMessage,
  channelUsers,
  replyOnMessage,
  user,
  db,
  editingMessage,
  setEditingMessage,
  roomType,
  leading,
  getMessageRef,
  selectedChannel,
  setMessages,
  onlineUsers,
  openLinkedNode,
  handleDeleteMessage,
  handleDeleteReply,
  isDeleting,
  sendMessage,
  sendReplyOnMessage,
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
}: MessageLeftProps) => {
  const handleReplyMessage = () => {
    setOpenReplies(message);
    setReplyOnMessage(message);
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
          gap: "5px",
          pb: 4,
          pt: 2,
          opacity: isDeleting?.id === message?.id ? 0.5 : undefined,
        }}
      >
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
              fontSize: "1px",
            }}
            className={
              onlineUsers[membersInfo[message.sender]?.uname] ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"
            }
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
                  notebookRef={notebookRef}
                  nodeBookDispatch={nodeBookDispatch}
                  db={db}
                  theme={"Dark"}
                  placeholder={"Type your reply..."}
                  channelUsers={channelUsers}
                  sendMessageType={"edit"}
                  toggleEmojiPicker={toggleEmojiPicker}
                  editingMessage={editingMessage}
                  setEditingMessage={setEditingMessage}
                  leading={leading}
                  getMessageRef={getMessageRef}
                  selectedChannel={selectedChannel}
                  replyOnMessage={replyOnMessage}
                  setReplyOnMessage={setReplyOnMessage}
                  user={user}
                  parentMessage={parentMessage}
                  sendMessage={sendMessage}
                  sendReplyOnMessage={sendReplyOnMessage}
                  setOpenMedia={setOpenMedia}
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
                <MarkdownRender text={message.message || ""} handleLinkClick={handleMentionUserOpenRoom} />
                <Typography sx={{ color: "grey", ml: "auto" }}>{message.edited ? "(edited)" : ""}</Typography>
                <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(message.imageUrls || []).map(imageUrl => (
                    <img
                      width={"100%"}
                      style={{ borderRadius: "8px", objectFit: "contain" }}
                      src={imageUrl}
                      alt="news image"
                      key={imageUrl}
                      onClick={() => setOpenMedia(imageUrl)}
                    />
                  ))}
                </Box>
              </Box>
            )}
            {(message?.totalReplies || 0) > 0 && editingMessage?.id !== message.id && (
              <Button onClick={handleOpenReplies} style={{ border: "none" }}>
                {openReplies?.id === message?.id ? "Hide" : message?.totalReplies}{" "}
                {message?.totalReplies || 0 > 1 ? "Replies" : "Reply"}
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
                    handleDeleteMessage={() =>
                      type === "reply" ? handleDeleteReply(parentMessage, message) : handleDeleteMessage(message)
                    }
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
                <Fragment key={reply?.id}>
                  {reply?.node?.id ? (
                    <NodeLink
                      db={db}
                      type="reply"
                      messageRefs={messageRefs}
                      notebookRef={notebookRef}
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
                </Fragment>
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
                  setOpenMedia={setOpenMedia}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};
