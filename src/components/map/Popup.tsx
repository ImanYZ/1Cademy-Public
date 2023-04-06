import CloseIcon from "@mui/icons-material/Close";
import { IconButton, Typography } from "@mui/material";
import { Box, SxProps, Theme } from "@mui/system";
import NextImage from "next/image";
import IdeaIcon from "public/idea.svg";
import React from "react";

type NotebookPopupProps = {
  onClose?: () => void;
  sx?: SxProps<Theme>;
};

export const NotebookPopup = ({ onClose, sx }: NotebookPopupProps) => {
  return (
    <Box
      id="ChoosingNodeMessage"
      sx={{
        display: "flex",
        alignItems: "center",
        ...sx,
      }}
    >
      <NextImage width={"20px"} src={IdeaIcon} alt="previous node icon" />
      <Typography
        sx={{
          marginX: "10px",
        }}
        fontSize={"inherit"}
      >
        Click the node you'd like to link to...
      </Typography>
      {onClose && (
        <IconButton onClick={onClose}>
          <CloseIcon
            sx={{
              color: "#A4A4A4",
            }}
            fontSize="small"
          />
        </IconButton>
      )}
    </Box>
  );
};
