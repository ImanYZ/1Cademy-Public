import { Box, Stack, Typography } from "@mui/material";
import React from "react";

import backgroundImageDarkMode from "../../../public/darkModeLibraryBackground.jpg";
import { RiveComponentMemoized } from "../home/components/temporals/RiveComponentExtended";

const Hero = () => {
  return (
    <Stack
      spacing={{ xs: "10px", md: "20px" }}
      direction={"column"}
      alignItems={"center"}
      justifyContent="center"
      sx={{
        height: "calc(100vh - 70px)",
        width: "100%",
        backgroundColor: "#1d1102",
        backgroundImage: `url(${backgroundImageDarkMode.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Box sx={{ width: "300px", height: "300px", mb: { xs: "64px", sm: "32px" } }}>
        <RiveComponentMemoized
          src="rive-assistant/assistant-0.riv"
          artboard="New Artboard"
          animations={["Timeline 1", "eyes", "1cademy"]}
          autoplay={true}
        />
      </Box>
      <Typography
        color="white"
        variant="h5"
        sx={{ textAlign: "center", fontSize: { xs: "36px", md: "40px" }, fontWeight: 600, mb: "24px" }}
      >
        Helps you optimize your life
      </Typography>
    </Stack>
  );
};

export const AssistantHeroMemoized = React.memo(Hero);
