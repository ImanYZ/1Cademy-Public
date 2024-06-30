import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { Button, CircularProgress, Typography } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import React, { Dispatch, Fragment, SetStateAction } from "react";
import { IChannelMessage } from "src/chatTypes";
import { UserTheme } from "src/knowledgeTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { Emoticons } from "../Common/Emoticons";
import { MessageButtons } from "./MessageButtons";
import { MessageInput } from "./MessageInput";
import { NodeLink } from "./NodeLink";

type NewsCardProps = {
  type?: string;
  theme: UserTheme;
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
  handleDeleteMessage: any;
  handleDeleteReply: any;
  parentMessage?: IChannelMessage;
  openReplies?: IChannelMessage | null;
  setOpenReplies?: any;
  replies?: IChannelMessage[];
  setReplies?: any;
  isRepliesLoaded?: boolean;
  setOpenMedia: Dispatch<SetStateAction<string | null>>;
  handleMentionUserOpenRoom: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, uname: string) => void;
  openDMChannel: (user2: any) => void;
  isDeleting?: IChannelMessage | null;
  setMessages?: any;
  openLinkedNode?: any;
};
export const NewsCard = ({
  type,
  theme,
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
  handleDeleteMessage,
  handleDeleteReply,
  parentMessage,
  openReplies,
  setOpenReplies,
  replies,
  setReplies,
  isRepliesLoaded,
  setOpenMedia,
  handleMentionUserOpenRoom,
  openDMChannel,
  isDeleting,
  setMessages,
  openLinkedNode,
}: NewsCardProps) => {
  const handleReplyOnMessage = () => {
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
      {selectedChannel?.membersInfo[user.uname]?.unreadNewsMessageId === message?.id && (
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
          // pb: 3,
          mt: 2,
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

          {onlineUsers[membersInfo[message.sender]?.uname] && (
            <Box
              sx={{
                fontSize: "1px",
              }}
              className="UserStatusOnlineIcon"
            />
          )}
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
                  theme={theme}
                  placeholder={"Type your reply..."}
                  channelUsers={channelUsers}
                  sendMessageType={"edit"}
                  toggleEmojiPicker={toggleEmojiPicker}
                  leading={leading}
                  getMessageRef={getMessageRef}
                  selectedChannel={selectedChannel}
                  replyOnMessage={replyOnMessage}
                  setReplyOnMessage={setReplyOnMessage}
                  editingMessage={editingMessage}
                  setEditingMessage={setEditingMessage}
                  sendMessage={sendMessage}
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
                <Typography sx={{ color: "grey", ml: 1 }}>{message.edited ? "(edited)" : ""}</Typography>
                <Box sx={{ display: "flex" }}>
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
                    handleDeleteMessage={() =>
                      type === "reply" ? handleDeleteReply(parentMessage, message) : handleDeleteMessage(message)
                    }
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

            {(message?.totalReplies || 0) > 0 && editingMessage?.id !== message.id && (
              <Button onClick={handleOpenReplies} style={{ border: "none" }}>
                {openReplies?.id === message?.id ? "Hide" : message?.totalReplies}{" "}
                {message?.totalReplies || 0 > 1 ? "Replies" : "Reply"}
              </Button>
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
                      theme={theme}
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
                    <NewsCard
                      type="reply"
                      theme={theme}
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
                      handleDeleteMessage={handleDeleteMessage}
                      handleDeleteReply={handleDeleteReply}
                      parentMessage={message}
                      setOpenMedia={setOpenMedia}
                      handleMentionUserOpenRoom={handleMentionUserOpenRoom}
                      openDMChannel={openDMChannel}
                    />
                  )}
                </Fragment>
              ))}

              <Box sx={{ ml: "37px", mt: "13px" }}>
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
    </>
  );
};
