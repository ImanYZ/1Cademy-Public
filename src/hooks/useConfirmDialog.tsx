import { Button, Dialog, DialogActions, DialogContent, DialogContentText, TextField } from "@mui/material";
import React, { useCallback, useState } from "react";

const useDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isPrompt, setIsPrompt] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const resolveRef = React.useRef<any>(null);
  const [confirmation, setConfirmation] = useState(false);

  const showDialog = useCallback((message: string, prompt = false, confirmation = false) => {
    setDialogMessage(message);
    setIsOpen(true);
    setIsPrompt(prompt);
    setConfirmation(confirmation);

    return new Promise(resolve => {
      resolveRef.current = resolve;
    });
  }, []);

  const closeDialog = useCallback(
    (confirmed: any) => {
      setIsOpen(false);
      setDialogMessage("");
      setInputValue("");

      if (resolveRef.current) {
        resolveRef.current(isPrompt ? inputValue : confirmed);
      }
    },
    [isPrompt, inputValue]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const ConfirmDialog = (
    <Dialog open={isOpen} onClose={() => closeDialog(false)}>
      <DialogContent>
        <DialogContentText>{dialogMessage}</DialogContentText>
        {isPrompt && (
          <TextField
            autoFocus
            margin="dense"
            id="prompt-input"
            type="text"
            value={inputValue}
            placeholder="Full name"
            onChange={handleInputChange}
            fullWidth
            sx={{
              mt: 3,
              mx: "auto",
              display: "block",
              textAlign: "center",
              width: "60%",
            }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button onClick={() => closeDialog(true)} color="primary">
          {isPrompt || !confirmation ? "OK" : "Yes"}
        </Button>
        {!isPrompt && confirmation && (
          <Button onClick={() => closeDialog(false)} color="primary">
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  const promptIt = useCallback((message: string) => showDialog(message, true), [showDialog]);
  const confirmIt = useCallback(
    (message: string, confirmation = true) => showDialog(message, false, confirmation),
    [showDialog]
  );

  return { promptIt, confirmIt, ConfirmDialog };
};

export default useDialog;
