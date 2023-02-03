import { Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

const Join = () => {
  return (
    <Box
      sx={{
        background: theme => (theme.palette.mode === "dark" ? "#000000" : "#F9FAFB"),
        p: "64px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Typography component={"h2"} sx={{ fontSize: "30px", mb: "16px" }}>
        Join our massive collaboration to create a lasting impact.
      </Typography>
      <Typography sx={{ fontSize: "20px", mb: "32px", maxWidth: "768px" }}>
        We are a large community of researchers, students, and instructors dedicated to enhancing the standards of
        research and education.
      </Typography>
      <Button variant="contained">Apply to join</Button>
    </Box>
  );
};

export default Join;
