import CloseIcon from "@mui/icons-material/Close";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Slide from "@mui/material/Slide";
import Toolbar from "@mui/material/Toolbar";
import { TransitionProps } from "@mui/material/transitions";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import React, { FC } from "react";

type Props = {
  onClose: () => void;
  open: boolean;
  src: string;
  alt: string;
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FullScreenImage: FC<Props> = ({ src, open, onClose, alt }) => {
  return (
    <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon sx={{ color: theme => theme.palette.common.white }} />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1, color: "white" }} variant="h6" component="div">
            Full-screen View
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
        <Image alt={alt} src={src} layout="fill" objectFit="contain" quality={100} />
      </Box>
    </Dialog>
  );
};

export default FullScreenImage;
