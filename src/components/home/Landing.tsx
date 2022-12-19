import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import React, { useEffect,useState } from "react";

import Button from "./Button";
import LandingLayout from "./LandingLayout";
import Typography from "./Typography";

export default function Landing() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  return (
    <LandingLayout
      sxBackground={{
        backgroundImage: `url(/LibraryBackground.jpg)`,
        backgroundColor: "primary.light", // Average color of the background image.
        backgroundPosition: "center",
      }}
    >
      {/* Increase the network loading priority of the background image. */}
      <img style={{ display: "none" }} src={"/LibraryBackground.jpg"} alt="increase priority" />
      <img src={"/AnimatediconLoop.gif"} alt="Animated Logo" width="190px" />
      <Typography color="inherit" align="center" variant="h2" marked="center" />
      <Box sx={{ mb: 4, mt: 4 }}>
        <Collapse in={checked} timeout={1000}>
          <Typography color="inherit" variant="h5">
            We Visualize Learning Pathways from Books &amp; Research Papers.
          </Typography>
        </Collapse>
      </Box>
      <Button
        color="secondary"
        variant="contained"
        size="large"
        component="a"
        href="#JoinUsSection"
        sx={{
          minWidth: 200,
          background: "rgb(255, 138, 51)",
          color: "common.white",
          lineHeight: 1.75,
          textTransform: "uppercase",
          transition:
            "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
          ":hover": {
            textDecoration: "none",
            backgroundColor: "rgb(255, 109, 0)",
            boxShadow:
              "rgb(0 0 0 / 20%) 0px 2px 4px -1px, rgb(0 0 0 / 14%) 0px 4px 5px 0px, rgb(0 0 0 / 12%) 0px 1px 10px 0px",
          },
        }}
      >
        Apply to Join Us!
      </Button>
    </LandingLayout>
  );
}
