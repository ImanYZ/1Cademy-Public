import { Modal, Paper } from "@mui/material";
import React, { ReactNode } from "react";

import { DESIGN_SYSTEM_COLORS } from "../lib/theme/colors";

type ModalWrapperProps = {
  open: boolean;
  handleClose: () => void;
  children: ReactNode;
};

const ModalWrapper = ({ children, open, handleClose }: ModalWrapperProps) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{
        display: "grid",
        placeItems: "center",
        p: "16px",
      }}
    >
      <Paper
        sx={{
          backgroundColor: theme =>
            theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
          p: "24px 42px",
          borderRadius: "8px",
          maxWidth: "380px",
        }}
      >
        {children}
      </Paper>
    </Modal>
  );
};

export default ModalWrapper;
