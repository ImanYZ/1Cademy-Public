import { Button, Dialog, DialogActions, DialogContent, DialogContentText, TextField } from "@mui/material";
import React, { useCallback, useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

const useDialog = (mode: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isPrompt, setIsPrompt] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const resolveRef = React.useRef<any>(null);
  const [confirmation, setConfirmation] = useState("");
  const [cancel, setCancel] = useState("");

  const showDialog = useCallback((message: string, prompt = false, confirmation: string, cancel: string) => {
    setDialogMessage(message);
    setIsOpen(true);
    setIsPrompt(prompt);
    setConfirmation(confirmation);
    setCancel(cancel);

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
      <DialogContent
        sx={{
          backgroundColor: mode === "light" ? DESIGN_SYSTEM_COLORS.gray100 : DESIGN_SYSTEM_COLORS.notebookG800,
        }}
      >
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
      <DialogActions
        sx={{
          justifyContent: "center",
          backgroundColor: mode === "light" ? DESIGN_SYSTEM_COLORS.gray100 : DESIGN_SYSTEM_COLORS.notebookG800,
        }}
      >
        <Button
          onClick={() => closeDialog(true)}
          variant="contained"
          sx={{
            borderRadius: "26px",
            cursor: "pointer",
          }}
        >
          {confirmation}
        </Button>
        {!isPrompt && cancel && (
          <Button
            onClick={() => closeDialog(false)}
            color="primary"
            variant="outlined"
            sx={{
              cursor: "pointer",
              borderRadius: "26px",
              backgroundColor: mode === "light" ? DESIGN_SYSTEM_COLORS.gray100 : DESIGN_SYSTEM_COLORS.notebookG800,
            }}
          >
            {cancel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  const promptIt = useCallback(
    (message: string, confirmation: string, cancel: string) => showDialog(message, true, confirmation, cancel),
    [showDialog]
  );
  const confirmIt = useCallback(
    (message: any, confirmation: string, cancel: string) => showDialog(message, false, confirmation, cancel),
    [showDialog]
  );

  return { promptIt, confirmIt, ConfirmDialog };
};

export default useDialog;
