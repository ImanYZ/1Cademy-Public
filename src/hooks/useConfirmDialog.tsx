import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import React, { useCallback, useState } from "react";

const useConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const resolveRef = React.useRef<any>(null);

  const confirmIt = useCallback((message: string) => {
    setConfirmationMessage(message);
    setIsOpen(true);

    return new Promise(resolve => {
      resolveRef.current = resolve;
    });
  }, []);

  const closeDialog = useCallback((confirmed: any) => {
    setIsOpen(false);
    setConfirmationMessage("");

    if (resolveRef.current) {
      resolveRef.current(confirmed);
    }
  }, []);

  const ConfirmDialog = (
    <Dialog open={isOpen} onClose={() => closeDialog(false)}>
      <DialogContent>
        <DialogContentText>{confirmationMessage}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button onClick={() => closeDialog(true)} color="primary">
          Yes
        </Button>
        <Button onClick={() => closeDialog(false)} color="primary">
          No
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { confirmIt, ConfirmDialog };
};

export default useConfirmationDialog;
