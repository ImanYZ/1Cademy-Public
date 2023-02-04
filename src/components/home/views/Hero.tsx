import { Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";

import backgroundImageDarkMode from "../../../../public/darkModeLibraryBackground.jpg";
import { useWindowSize } from "../../../hooks/useWindowSize";
import Button from "../components/Button";
import { RiveComponentMemoized } from "../components/temporals/RiveComponentExtended";

type HeroProps = { headerHeight: number; headerHeightMobile: number };

const Hero = ({ headerHeight, headerHeightMobile }: HeroProps) => {
  // const isMobile = useMediaQuery("(max-width:600px)");

  const { width } = useWindowSize({ initialHeight: 1000, initialWidth: 0 });

  // const heroCanvasDimensions = useMemo(() => {
  //   // const min = width > height ? height : width;
  //   // if (width < 600) return min - 20;
  //   // if (width < 900) return min - 40;
  //   // return min - 100;
  //   return 128;
  // }, [width, height]);

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
          We Synthesize books & Research papers together
        </Typography>
        <Typography color="white" variant="h5" sx={{ textAlign: "center", fontSize: { xs: "18px", md: "20px" } }}>
          We are a large community of researchers, students, and instructors dedicated to enhancing the standards of
          research and education.
        </Typography>
        <Button
          variant="contained"
          size={width < 900 ? "small" : "large"}
          component="a"
          target="_blank"
          href="https://1cademy.us/#JoinUsSection"
          sx={{ textTransform: "capitalize" }}
        >
          Apply
        </Button>
      </Box>
    </Stack>
  );
};

export const HeroMemoized = React.memo(Hero);
