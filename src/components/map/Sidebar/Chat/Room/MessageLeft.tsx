import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { collection, doc, updateDoc } from "firebase/firestore";
import moment from "moment";
import NextImage from "next/image";
import React, { useState } from "react";
import { IChannelMessage } from "src/chatTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { Emoticons } from "../Common/Emoticons";
import { MessageButtons } from "./MessageButtons";
import { MessageInput } from "./MessageInput";
type MessageLeftProps = {
  notebookRef: any;
  nodeBookDispatch: any;
  selectedMessage: any;
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
};
export const MessageLeft = ({
  notebookRef,
  nodeBookDispatch,
  selectedMessage,
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
}: MessageLeftProps) => {
  const { confirmIt, ConfirmDialog } = useConfirmDialog();
  const [openReplies, setOpenReplies] = useState<boolean>(false);

  const handleReplyMessage = () => {
    setReplyOnMessage(message);
  };

  const handleOpenReplies = () => setOpenReplies(prev => !prev);
  const handleDeleteMessage = async () => {
    if (
      await confirmIt(
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "10px",
          }}
        >
          <DeleteForeverIcon />
          <Typography sx={{ fontWeight: "bold" }}>Do you want to delete this message?</Typography>
          <Typography>Deleting a message will permanently remove it from this chat.</Typography>
        </Box>,
        "Delete Message",
        "Keep Message"
      )
    ) {
      let channelRef = doc(db, "channelMessages", message?.channelId);
      if (roomType === "direct") {
        channelRef = doc(db, "conversationMessages", message?.channelId);
      }
      const messageRef = doc(collection(channelRef, "messages"), message.id);
      await updateDoc(messageRef, {
        deleted: true,
      });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: "5px",
        pb: 4,
        pt: 2,
      }}
    >
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
              <Typography sx={{ color: "grey", ml: "auto" }}>{message.edited ? "(edited)" : ""}</Typography>
              <Box sx={{ pt: 1, display: "flex", gap: "5px" }}>
                {(message.imageUrls || []).map(imageUrl => (
                  <NextImage
                    width={"200px"}
                    height={"200px"}
                    style={{ borderRadius: "8px" }}
                    src={imageUrl}
                    alt="news image"
                    key={imageUrl}
                  />
                ))}
              </Box>
            </Box>
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
                  handleDeleteMessage={handleDeleteMessage}
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
                notebookRef={notebookRef}
                nodeBookDispatch={nodeBookDispatch}
                selectedMessage={selectedMessage}
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
              />
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
              />
            </Box>
          </Box>
        )}
      </Box>
      {ConfirmDialog}
    </Box>
  );
};
