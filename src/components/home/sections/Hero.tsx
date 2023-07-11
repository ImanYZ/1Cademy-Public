import { Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useMemo } from "react";

import { orange900, orangeDark } from "@/pages/home";

import backgroundImageDarkMode from "../../../../public/darkModeLibraryBackground.jpg";
import { useWindowSize } from "../../../hooks/useWindowSize";
import Button from "../components/Button";
import { RiveComponentMemoized } from "../components/temporals/RiveComponentExtended";

type HeroProps = { headerHeight: number; headerHeightMobile: number; onApply: () => void };

const Hero = ({ headerHeight, headerHeightMobile, onApply }: HeroProps) => {
  const { height, width } = useWindowSize({ initialHeight: 1000, initialWidth: 0 });

  const getVirtualHeight = useMemo(() => {
    let pos = 0;
    const percentage = 27;
    const imageWidth = 1920;
    const imageHeight = 1450;

    if (width >= height) {
      const virtualHeight = (width * imageHeight) / imageWidth;
      const offset = (virtualHeight - height) / 2;
      pos = (virtualHeight * percentage) / 100;

      const tt = pos - offset;
      const desplazamiento = (0.5 * virtualHeight) / 100;
      pos = tt - desplazamiento - 36;
    } else {
      pos = 80;
    }

    return pos;
  }, [height, width]);

  return (
    <Stack
      spacing={width < 900 ? "10px" : "20px"}
      direction={"column"}
      alignItems={"center"}
      justifyContent="flex-end"
      sx={{
        position: "relative",
        height: { xs: `calc(100vh - ${headerHeightMobile}px)`, md: `calc(100vh - ${headerHeight}px)` },
        width: "100%",
        padding: width < 900 ? "10px" : "20px",
        backgroundColor: "#1d1102",
        backgroundImage: `url(${backgroundImageDarkMode.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: { xs: "50px", lg: "70px", xl: "100px" },
          maxWidth: { xs: "343px", sm: "730px" },
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pb: "20px",
        }}
      >
        <Box sx={{ width: "128px", height: "128px", mb: { xs: "64px", sm: "32px" } }}>
          <RiveComponentMemoized
            src="rive/logo.riv"
            animations={["Timeline 1", "dark", "light"]}
            artboard={"artboard-1"}
            autoplay={true}
          />
        </Box>
        <Typography
          color="white"
          variant="h2"
          sx={{ textAlign: "center", fontSize: { xs: "36px", md: "60px" }, fontWeight: 600, mb: "24px" }}
        >
          Optimize Scalable Learning and Teaching
        </Typography>
        <Typography color="white" variant="h5" sx={{ textAlign: "center", fontSize: { xs: "18px", md: "20px" } }}>
          &#x2022; Motivating to space out practice over many days
          &#x2022; AI-enhanced grading all types of questions
          &#x2022; AI-driven question-answering only based on course content
          &#x2022; Visualizing prerequisite learning pathways
          &#x2022; Learning analytics of micro learning activities
          &#x2022; Positive reinforcement of learning
        </Typography>
      </Box>
      <Button
        variant="contained"
        onClick={onApply}
        sx={{
          textTransform: "capitalize",
          bottom: `${getVirtualHeight}px`,
          m: "0px",
          width: { xs: "100%", md: "107px" },
          maxWidth: { xs: "343px" },
          height: "60px",
          background: orangeDark,
          fontSize: "18px",
          borderRadius: "26px",
          ":hover": {
            background: orange900,
          },
        }}
      >
        Apply
      </Button>
    </Stack>
  );
};

export const HeroMemoized = React.memo(Hero);
