import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import * as React from "react";

const ExtensioDialog = (props: any) => {
  const handleClose = () => {
    window.localStorage.setItem("extension-preference", "true");
    props.setOpenInstallExtensionDialog(false);
  };
  const handleCloseOn = () => {
    props.setOpenInstallExtensionDialog(false);
  };
  const installExtension = () => {
    window.open(
      "https://chrome.google.com/webstore/detail/1cademy-assistant/jdlbjglnnjcjigpodegggihmcaoikeob/related",
      "_blank"
    );
    props.setOpenInstallExtensionDialog(false);
  };

  return (
    <div>
      <Dialog
        open={props.openInstallExtensionDialog}
        onClose={handleCloseOn}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"We recommend 1Cademy Assistant extension"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You don't have the 1Cademy Assistant extension installed. Please install it to use more integrated features.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Don't show this again.</Button>
          <Button onClick={installExtension} autoFocus>
            Install
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExtensioDialog;
