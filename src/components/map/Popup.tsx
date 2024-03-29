import CloseIcon from "@mui/icons-material/Close";
import { IconButton, Typography } from "@mui/material";
import { Box, SxProps, Theme } from "@mui/system";
import NextImage from "next/image";
import IdeaIcon from "public/idea.svg";
import React, { ReactNode } from "react";

type NotebookPopupProps = {
  children: ReactNode;
  showIcon?: boolean;
  onClose?: () => void;
  sx?: SxProps<Theme>;
};

export const NotebookPopup = ({ children, showIcon = true, onClose, sx }: NotebookPopupProps) => {
  return (
    <Box
      sx={{
        position: "absolute",
        width: "auto",
        top: "30px",
        left: "50%",
        padding: "13px",
        background: ({ palette }) =>
          palette.mode === "dark" ? palette.common.notebookMainBlack : palette.common.gray50,
        borderRadius: "5px",
        color: "#e5e5e5",
        zIndex: 4,
        textAlign: "center",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        transform: "translateX(-50%)",
        ...sx,
      }}
    >
      {showIcon && <NextImage width={"20px"} src={IdeaIcon} alt="previous node icon" />}
      <Typography
        sx={{
          marginX: "10px",
        }}
        fontSize={"inherit"}
      >
        {children}
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
