import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";

export const DeleteButton = ({ deleteRow }: any) => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleDeleteRow = () => {
    deleteRow();
    setOpenDeleteModal(false);
  };
  return (
    <>
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>
          <Typography variant="h3" fontWeight={"bold"} component="h2">
            Are you sure you want to remove this student from this course
          </Typography>
        </DialogTitle>
        <DialogActions>
          <Button variant="contained" onClick={handleDeleteRow}>
            Yes
          </Button>
          <Button variant="contained" onClick={() => setOpenDeleteModal(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <IconButton onClick={() => setOpenDeleteModal(true)}>
        <DeleteIcon
          color="error"
          sx={{
            borderRadius: "50%",
          }}
        />
      </IconButton>
    </>
  );
};

export default DeleteButton;
