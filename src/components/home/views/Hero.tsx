import { Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useMemo } from "react";

import backgroundImageDarkMode from "../../../../public/darkModeLibraryBackground.jpg";
import { useWindowSize } from "../../../hooks/useWindowSize";
import Button from "../components/Button";
import { RiveComponentMemoized } from "../components/temporals/RiveComponentExtended";

type HeroProps = { headerHeight: number };

const Hero = ({ headerHeight }: HeroProps) => {
  // const isMobile = useMediaQuery("(max-width:600px)");

  const { height, width } = useWindowSize({ initialHeight: 1000, initialWidth: 0 });

  // const heroCanvasDimensions = useMemo(() => {
  //   // const min = width > height ? height : width;
  //   // if (width < 600) return min - 20;
  //   // if (width < 900) return min - 40;
  //   // return min - 100;
  //   return 128;
  // }, [width, height]);

  const getVirtualHeight = useMemo(() => {
    let pos = 0;
    const percentage = 30.75;
    const imageWidth = 1920;
    const imageHeight = 1450;

    // const ratio = imageWidth / imageHeight;

    if (width >= height) {
      const virtualHeight = (width * imageHeight) / imageWidth;
      console.log({ virtualHeight });
      const offset = (virtualHeight - height) / 2;
      console.log({ offset });
      pos = (virtualHeight * percentage) / 100;

      const tt = pos - offset;
      pos = tt;
      console.log(tt);
    } else {
      pos = 100;
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
        height: `calc(100vh - ${headerHeight}px)`,
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
          maxWidth: "730px",
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pb: "20px",
        }}
      >
        <Box sx={{ width: "128px", height: "128px", mb: "32px" }}>
          <RiveComponentMemoized
            src="rive/artboard-1.riv"
            animations={["Timeline 1", "dark", "light"]}
            artboard={"artboard-1"}
            autoplay={true}
          />
        </Box>
        <Typography color="white" variant="h2" sx={{ textAlign: "center", fontSize: "60px", mb: "24px" }}>
          We Synthesize books & Research papers together
        </Typography>
        <Typography color="white" variant="h5" sx={{ textAlign: "center", fontSize: "20px" }}>
          We are a large community of researchers, students, and instructors dedicated to enhancing the standards of
          research and education.
        </Typography>
      </Box>
      <Button
        variant="contained"
        size={width < 900 ? "small" : "large"}
        component="a"
        target="_blank"
        href="https://1cademy.us/#JoinUsSection"
        sx={{ textTransform: "capitalize", position: "absolute", bottom: `${getVirtualHeight - 36}px`, m: "0px" }}
      >
        Apply
      </Button>
    </Stack>
  );
};

export const HeroMemoized = React.memo(Hero);
