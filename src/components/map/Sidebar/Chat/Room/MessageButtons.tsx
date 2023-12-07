import AddReactionIcon from "@mui/icons-material/AddReaction";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReplyIcon from "@mui/icons-material/Reply";
import { IconButton } from "@mui/material";
import { Box, SxProps, Theme } from "@mui/system";
import React from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
type MessageButtonProps = {
  message: any;
  sx?: SxProps<Theme>;
  setReply?: React.Dispatch<React.SetStateAction<{ id: string | null; message: string | null }>>;
};
export const MessageButtons = ({ message, sx, setReply }: MessageButtonProps) => {
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
      {setReply && (
        <IconButton onClick={() => setReply({ id: message.id, message: message.message })}>
          <ReplyIcon />
        </IconButton>
      )}
      <IconButton>
        <AddReactionIcon color="secondary" />
      </IconButton>
      <IconButton>
        <ReplyIcon sx={{ transform: "scaleX(-1)" }} />
      </IconButton>
      <IconButton>
        <EditIcon />
      </IconButton>
      <IconButton>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};
