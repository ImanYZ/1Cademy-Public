import LaunchIcon from "@mui/icons-material/Launch";
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";

import { useWindowSize } from "../../../hooks/useWindowSize";
import { gray03 } from "../../../pages";
import { RiveComponentMemoized } from "../components/temporals/RiveComponentExtended";
import whichItems from "./whichValues";

const Which = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(min-width:900px)");
  const [canvasDimension, setCanvasDimension] = useState({ width: 0, height: 0 });
  const { width } = useWindowSize();

  useEffect(() => {
    let newWidth = width / 2;
    if (width > 1536) newWidth = 400;
    else if (width > 1200) newWidth = 400;
    else if (width > 900) newWidth = width / 2 - 100;
    else if (width > 600) newWidth = width / 2 - 60;
    else if (width > 0) newWidth = width - 40;

    const newHeight = getHeight(newWidth);

    setCanvasDimension({ width: newWidth, height: newHeight });
  }, [width]);

  // const { inViewOnce: paper1ViewOnce, ref: paper1Ref } = useInView();
  // const { inViewOnce: paper2ViewOnce, ref: paper2Ref } = useInView();
  // const { inViewOnce: paper3ViewOnce, ref: paper3Ref } = useInView();
  const getGrayColorText = () => (theme.palette.mode === "dark" ? gray03 : theme.palette.common.darkBackground2);

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowX: "hidden",
      }}
    >
      <Stack direction={"column"} spacing={isMobile ? "60px" : "100px"}>
        {whichItems.map((whichSubsection, idx) => (
          <Stack
            // ref={refs[idx]}
            key={idx}
            direction={isMobile ? "column" : idx % 2 === 0 ? "row" : "row-reverse"}
            spacing={isMobile ? "0px" : "40px"}
            // alignItems={"center"}
            alignItems={"stretch"}
            // alignSelf={"stretch"}
          >
            <Box
              component={"picture"}
              sx={{
                // border: "solid 2px orange",
                minWidth: isTablet ? "350px" : "300px",
                height: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: isMobile ? "center" : idx % 2 === 0 ? "flex-start" : "flex-end",
              }}
              // className={inViewOnces[idx] ? (idx % 2 === 0 ? "slide-left-to-right" : "slide-right-to-left") : "hide"}
            >
              {idx === 0 && (
                <Box sx={{ width: canvasDimension.width, height: canvasDimension.height }}>
                  <RiveComponentMemoized
                    src="rive/notebook.riv"
                    artboard={"artboard-6"}
                    animations={["Timeline 1", theme.palette.mode]}
                    autoplay={true}
                  />
                </Box>
              )}
              {idx === 1 && (
                <Box sx={{ width: canvasDimension.width, height: canvasDimension.height }}>
                  <RiveComponentMemoized
                    src="rive-assistant/assistant-1.riv"
                    artboard={"artboard-1"}
                    animations={["Timeline 1", theme.palette.mode]}
                    autoplay={true}
                  />
                </Box>
              )}
              {idx === 2 && (
                <Box sx={{ width: canvasDimension.width, height: canvasDimension.height }}>
                  <RiveComponentMemoized
                    src="rive/notebook.riv"
                    artboard={"artboard-6"}
                    animations={["Timeline 1", theme.palette.mode]}
                    autoplay={true}
                  />
                </Box>
              )}
              {/* {idx !== 0 && (
                <img
                  alt={whichSubsection.name}
                  src={
                    theme.palette.mode === "light"
                      ? "/static/" + whichSubsection.image
                      : "/static/" + whichSubsection.imageDark
                  }
                  style={{ flex: 1, width: "100%" }}
                />
              )} */}
            </Box>
            <Box
              sx={{
                p: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                "& > *:not(:last-child)": {
                  mb: "12px",
                },
              }}
              // className={inViewOnces[idx] ? (idx % 2 !== 0 ? "slide-left-to-right" : "slide-right-to-left") : "hide"}
            >
              <Typography
                gutterBottom
                variant="h3"
                component="h3"
                sx={{ fontSize: "24px", textAlign: isMobile ? "center" : "start" }}
              >
                {whichSubsection.name}
              </Typography>
              {whichSubsection.body.split("\n").map((paragraph, idx) => (
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
              <Box>
                {/* <Link>Visit</Link> */}
                {whichSubsection.link && (
                  <Button variant="outlined" href={whichSubsection.link} target="_blank" rel="noreferrer">
                    Visit
                    <LaunchIcon fontSize={"small"} sx={{ ml: "10px" }} />
                  </Button>
                )}
                {!whichSubsection.link && (
                  <Button variant="outlined" disabled>
                    Coming Soon
                    <LaunchIcon fontSize={"small"} sx={{ ml: "10px" }} />
                  </Button>
                )}
              </Box>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

const getHeight = (width: number) => (300 * width) / 500;

export default Which;
