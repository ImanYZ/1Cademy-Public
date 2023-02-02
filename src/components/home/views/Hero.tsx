import { Stack, Typography, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useMemo } from "react";

import backgroundImageDarkMode from "../../../../public/darkModeLibraryBackground.jpg";
import { useWindowSize } from "../../../hooks/useWindowSize";
import Button from "../components/Button";
import { RiveComponentMemoized } from "../components/temporals/RiveComponentExtended";

type HeroProps = { headerHeight: number };

const Hero = ({ headerHeight }: HeroProps) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const { height, width } = useWindowSize({ initialHeight: 1000, initialWidth: 0 });

  const heroCanvasDimensions = useMemo(() => {
    const min = width > height ? height : width;
    if (width < 600) return min - 20;
    if (width < 900) return min - 40;
    return min - 100;
  }, [width, height]);

  return (
    <Stack
      spacing={width < 900 ? "10px" : "20px"}
      direction={"column"}
      alignItems={"center"}
      justifyContent="flex-end"
      sx={{
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
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pb: "20px" }}>
        <Box sx={{ width: heroCanvasDimensions, height: heroCanvasDimensions }}>
          <RiveComponentMemoized
            src="rive/artboard-1.riv"
            animations={["Timeline 1", "dark", "light"]}
            artboard={"artboard-1"}
            autoplay={true}
          />
        </Box>
        <Typography
          color="white"
          variant="h5"
          sx={{ textAlign: "center", width: isMobile ? "300px" : "auto", mb: "20px" }}
        >
          WE TAKE NOTES <b>TOGETHER</b>.
        </Typography>
        <Button
          variant="contained"
          size={width < 900 ? "small" : "large"}
          component="a"
          target="_blank"
          href="https://1cademy.us/#JoinUsSection"
          sx={{ minWidth: 200, zIndex: 13, textTransform: "uppercase" }}
        >
          Apply to Join Us!
        </Button>
      </Box>
    </Stack>
  );
};

export const HeroMemoized = React.memo(Hero);
