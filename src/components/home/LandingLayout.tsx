import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import * as React from "react";

const LandingLayoutRoot = styled("section")(({ theme }) => ({
  color: theme.palette.common.white,
  position: "relative",
  display: "flex",
  alignItems: "center",
  [theme.breakpoints.up("sm")]: {
    height: "80vh",
    minHeight: 500,
    maxHeight: 1300,
  },
}));

const Background = styled(Box)({
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  zIndex: -2,
});

function LandingLayout(props: any) {
  const { sxBackground, children } = props;

  return (
    <LandingLayoutRoot id="LandingSection">
      <Container
        sx={{
          mt: 3,
          mb: 14,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {children}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: "common.black",
            opacity: 0.5,
            zIndex: -1,
          }}
        />
        <Background sx={sxBackground} />
        <Box
          component="img"
          src="/static/LandingArrowDown.png"
          height="16"
          width="12"
          alt="arrow down"
          sx={{ position: "absolute", bottom: 32 }}
        />
      </Container>
    </LandingLayoutRoot>
  );
}

export default LandingLayout;
