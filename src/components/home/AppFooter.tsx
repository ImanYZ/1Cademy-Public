import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import * as React from "react";

import Typography from "./Typography";

function Copyright() {
  return (
    <React.Fragment>
      {"© "}
      1Cademy
      {new Date().getFullYear()}
    </React.Fragment>
  );
}

export default function AppFooter() {
  return (
    <Typography component="footer" sx={{ display: "flex", bgcolor: "secondary.light" }}>
      <Container sx={{ my: 4, display: "flex" }}>
        <Grid container spacing={5}>
          <Grid item xs={6} sm={3}>
            <Copyright />
          </Grid>
          <Grid item xs={6} sm={2}>
            <Link target="_blank" href="/terms">
              Terms
            </Link>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Link target="_blank" href="/privacy">
              Privacy
            </Link>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Link target="_blank" href="/cookie">
              Cookie
            </Link>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box component="a" target="_blank" href="https://www.youtube.com/channel/UCKBqMjvnUrxOhfbH1F1VIdQ/">
              <img src="/YouTube_Logo_2017.svg" alt="1Cademy YouTube Channel" width="100px" />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Typography>
  );
}
