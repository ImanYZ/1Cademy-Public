import { Box, IconButton, SxProps, Theme, Tooltip } from "@mui/material";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

type MessageButtonProps = {
  message: any;
  sx?: SxProps<Theme>;
  handleEditMessage: any;
  setInputMessage?: any;
  handleDeleteMessage?: any;
  user: any;
  mode: string;
};
const MessageButtons = ({ message, sx, handleEditMessage, handleDeleteMessage, user, mode }: MessageButtonProps) => {
  const isSender = user.uid === message.user.uid;
  const editMessage = () => {
    handleEditMessage();
  };
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "end",
        background: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
        right: "20px",
        borderRadius: "8px",
        p: "3px",
        ...sx,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
        {isSender && (
          <Tooltip title={"Edit"}>
            <IconButton
              sx={{
                p: "0px",
                ":hover": {
                  background: "transparent",
                },
              }}
              onClick={editMessage}
            >
              <EditIcon
                sx={{
                  color: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : undefined,
                }}
              />
            </IconButton>
          </Tooltip>
        )}
        {handleDeleteMessage && isSender && (
          <Tooltip title={"Delete"}>
            <IconButton
              sx={{
                p: "0px",
                ":hover": {
                  background: "transparent",
                },
              }}
              onClick={handleDeleteMessage}
            >
              <DeleteIcon
                sx={{
                  color: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : undefined,
                }}
              />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};
export default MessageButtons;
