import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import React, { useEffect, useState } from "react";

const SnackbarComp = ({ newMessage, setNewMessage }: any) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(newMessage);

  useEffect(() => {
    if (newMessage) {
      setOpen(true);
      setMessage(newMessage);
      setNewMessage("");
    }
  }, [newMessage]);

  const close = (event: any, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={close}
      message={message}
      action={
        <IconButton size="small" color="inherit" onClick={close}>
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    />
  );
};

export default SnackbarComp;
