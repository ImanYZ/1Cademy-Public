import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

type CookiePolicyProps = {
  open: boolean;
  handleClose: () => void;
};

export const CookiePolicy = ({ open, handleClose }: CookiePolicyProps) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll={"paper"}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
    >
      <DialogTitle id="scroll-dialog-title">1Cademy Cookie Policy</DialogTitle>
      <DialogContent dividers>
        <DialogContentText id="scroll-dialog-description" tabIndex={-1} component={"div"}>
          <CookiePolicyContent />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CookiePolicy;

const CookiePolicyContent = () => {
  return (
    <Box>
      <p>
        A <b>cookie</b> is a small piece of text that enables websites to remember your device and maintain a consistent
        experience throughout different times the website is used. Using 1Cademy will result in both 1Cademy and third
        parties using <b>Cookies</b> or <b>JSON Web Tokens</b> to track and monitor some of your activities on and off
        the website, and store and access data about you, your browsing history, and usage of 1Cademy. While it is
        possible to control and limit the use of cookies, keep in mind that this may alter your user experience with
        1Cademy, and may limit certain features.
      </p>

      <p>
        Companies and other organizations that advertise pages on 1Cademy may use cookies or other technology to learn
        more about your interests in their services and potentially to tailor services to you.
      </p>

      <p>
        If you don't want cookies to be used when you visit 1Cademy, you can adjust the settings on your internet
        browser to one that best suits your preferences. Keep in mind that 1Cademy does not work to its full potential
        if you do choose to opt-out. In your browser settings, you can typically choose to reject all or some cookies,
        or instead receive a notification when a cookie is being placed on your device. You can also manually delete
        cookies at any time, but this does not prevent the site from setting future cookies on your device if you don't
        adjust your browser settings.
      </p>
    </Box>
  );
};
