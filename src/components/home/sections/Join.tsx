import { Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

import ROUTES from "../../../lib/utils/routes";

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
      <Typography component={"h2"} sx={{ fontSize: { xs: "24px", md: "30px" }, fontWeight: 600, mb: "16px" }}>
        Join our massive collaboration to create a lasting impact.
      </Typography>
      <Typography sx={{ fontSize: { xs: "18px", md: "20px" }, mb: "32px", maxWidth: "768px" }}>
        We are a large community of researchers, students, and instructors dedicated to enhancing the standards of
        research and education.
      </Typography>
      <Button href={ROUTES.apply} target="_blank" rel="noopener" variant="contained">
        Apply to join
      </Button>
    </Box>
  );
};

export default Join;
