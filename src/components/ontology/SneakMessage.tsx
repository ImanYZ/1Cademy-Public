import Snackbar from "@mui/material/Snackbar";
import React, { useEffect, useState } from "react";

type ISneakMessageProps = {
  newMessage: string;
  setNewMessage: (message: string) => void;
};

const SneakMessage = (props: ISneakMessageProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(props.newMessage);

  useEffect(() => {
    if (props.newMessage) {
      setOpen(true);
      setMessage(props.newMessage);
      props.setNewMessage("");
    }
  }, [props.newMessage]);

  const close = (event: any, reason: any) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return <Snackbar open={open} autoHideDuration={4000} onClose={close} message={message} />;
};

export default SneakMessage;
