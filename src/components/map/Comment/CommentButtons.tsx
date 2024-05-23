import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, IconButton, SxProps, Theme, Tooltip } from "@mui/material";
import React from "react";
import { IUser } from "src/types/IUser";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

type CommentButtonsProps = {
  message: any;
  sx?: SxProps<Theme>;
  handleEditMessage: any;
  setInputMessage?: any;
  handleDeleteMessage?: any;
  user: IUser;
  mode: string;
};
const CommentButtons = ({ message, sx, handleEditMessage, handleDeleteMessage, user, mode }: CommentButtonsProps) => {
  const isSender = user.uname === message.user.uname;
  const editMessage = () => {
    handleEditMessage();
  };
  return (
    <Box
      sx={{
        position: "absolute",
        background: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
        right: "20px",
        borderRadius: "8px",
        p: "3px",
        ...sx,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {isSender && (
          <Tooltip title={"edit"}>
            <IconButton onClick={editMessage}>
              <EditIcon
                sx={{
                  color: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : undefined,
                }}
              />
            </IconButton>
          </Tooltip>
        )}
        {handleDeleteMessage && isSender && (
          <Tooltip title={"delete"}>
            <IconButton onClick={handleDeleteMessage}>
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
export default CommentButtons;
