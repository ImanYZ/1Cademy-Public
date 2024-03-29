import CloseIcon from "@mui/icons-material/Close";
import ReplyIcon from "@mui/icons-material/Reply";
import { Divider, IconButton, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import { Box } from "@mui/system";
import React from "react";

type ReplyProps = {
  message: any;
  sx?: SxProps<Theme>;
  close: () => void;
};
export const Reply = ({ message, sx, close }: ReplyProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px",
        ...sx,
      }}
    >
      <Box sx={{ pl: 3 }}>
        <ReplyIcon color="primary" />
      </Box>

      <Divider
        sx={{
          borderColor: "#f99346",
        }}
        orientation="vertical"
        flexItem
      />
      <Box sx={{ width: "70%" }}>
        <Typography
          sx={{
            fontSize: "15px",
            fontWeight: "500",
            lineHeight: "24px",
          }}
        >
          Reply to {message?.sender}
        </Typography>

        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: "bold",
            lineHeight: "24px",
          }}
        >
          {message?.message.substr(0, 40)}
        </Typography>
      </Box>
      <IconButton onClick={() => close()}>
        <CloseIcon color="secondary" />
      </IconButton>
    </Box>
  );
};
