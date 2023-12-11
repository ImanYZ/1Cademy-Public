import AddReactionIcon from "@mui/icons-material/AddReaction";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReplyIcon from "@mui/icons-material/Reply";
import { IconButton } from "@mui/material";
import { Box, SxProps, Theme } from "@mui/system";
import React from "react";
import { IChannelMessage } from "src/chatTypes";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
type MessageButtonProps = {
  message: any;
  sx?: SxProps<Theme>;
  replyMessage?: (message: any) => void;
  forwardMessage: (message: any) => void;
  toggleEmojiPicker: (event: any, message?: IChannelMessage) => void;
  setEditingMessage?: any;
  setInputMessage?: any;
};
export const MessageButtons = ({
  message,
  sx,
  replyMessage,
  toggleEmojiPicker,
  forwardMessage,
  setEditingMessage,
  setInputMessage,
}: MessageButtonProps) => {
  const handleForwardMessage = () => {
    forwardMessage(message);
  };

  const handleEditMessage = () => {
    setEditingMessage(message);
    setInputMessage(message.message);
  };
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        position: "absolute",
        background: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
        top: "-46px",
        right: "20px",
        borderRadius: "8px",
        p: "3px",
        ...sx,
      }}
    >
      {replyMessage && (
        <IconButton onClick={replyMessage}>
          <ReplyIcon />
        </IconButton>
      )}
      <IconButton>
        <AddReactionIcon color="secondary" onClick={(e: any) => toggleEmojiPicker(e, message)} />
      </IconButton>
      <IconButton onClick={handleForwardMessage}>
        <ReplyIcon sx={{ transform: "scaleX(-1)" }} />
      </IconButton>
      <IconButton onClick={handleEditMessage}>
        <EditIcon />
      </IconButton>
      <IconButton>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};
