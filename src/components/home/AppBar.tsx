import MuiAppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
// import useScrollTrigger from "@mui/material/useScrollTrigger";
import React from "react";

function AppBar(props: any) {
  return (
    <>
      <CssBaseline />
      <MuiAppBar {...props} elevation={4} />
    </>
  );
}

export default AppBar;
