import { Stack, useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useCallback, useMemo } from "react";

import { gray03 } from "@/pages/index";

import { RiveComponentMemoized } from "../components/temporals/RiveComponentExtended";
import Typography from "../components/Typography copy";

const HowItWorks = (props: any) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const theme = useTheme();

  const getHeightSection = () => props.artboards.reduce((a: number, c: any) => a + c.getHeight(), 0);
  const getGrayColorText = useCallback(
    () => (theme.palette.mode === "dark" ? gray03 : theme.palette.common.darkBackground2),
    [theme.palette.common.darkBackground2, theme.palette.mode]
  );
  const AnimationSections = useMemo(() => {
    return props.artboards.map((artboard: any, idx: number) => (
      <Stack
        // ref={idx === 0 ? ref4 : undefined}
        key={artboard.name}
        direction={isMobile ? "column" : idx % 2 === 0 ? "row" : "row-reverse"}
        spacing={isMobile ? "0px" : "40px"}
        alignItems={"stretch"}
        alignSelf={idx % 2 === 0 ? "flex-end" : "flex-start"}
        sx={{ position: "relative", height: "900px" /* , border: `2px dashed red` */ }}
      >
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              width: "800px",
              height: "800px",
              position: "absolute",
              top: "calc(50% - 400px)",
              left: idx % 2 === 0 ? undefined : "0",
              right: idx % 2 === 1 ? undefined : "0",
            }}
          >
            <RiveComponentMemoized
              src="rive/notebook.riv"
              artboard={artboard.artoboard}
              animations={["Timeline 1", theme.palette.mode]}
              autoplay={true}
            />
          </Box>
        </Box>

        <Box
          sx={{
            maxWidth: "400px",
            p: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            "& > *:not(:last-child)": {
              mb: "12px",
            },
          }}
        >
          <Typography
            gutterBottom
            variant="h3"
            component="h3"
            sx={{ fontSize: "32px", textAlign: isMobile ? "center" : "start" }}
          >
            {artboard.name}
          </Typography>
          {artboard.description.split("\n").map((paragraph: string, idx: number) => (
            <Typography
              key={idx}
              variant="body2"
              sx={{
                textAlign: "left",
                color: getGrayColorText(),
                fontSize: "16px",
              }}
            >
              {paragraph}
            </Typography>
          ))}
        </Box>
      </Stack>
    ));
  }, [getGrayColorText, isMobile, props.artboards, theme.palette.mode]);

  return (
    <Box
      component="section"
      sx={{
        height: getHeightSection(),
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {AnimationSections}
    </Box>
  );
};

export default HowItWorks;
