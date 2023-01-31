import LaunchIcon from "@mui/icons-material/Launch";
import { Box, Button, Stack, Typography, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";

import { useWindowSize } from "../../../hooks/useWindowSize";
import { getStats } from "../../../lib/knowledgeApi";
import { RE_DETECT_NUMBERS_WITH_COMMAS } from "../../../lib/utils/RE";
import { gray03 } from "../../../pages";
import { RiveComponentMemoized } from "../components/temporals/RiveComponentExtended";
import { wrapStringWithBoldTag } from "./HowItWorks";
import whichItems from "./whichValues";

const GoalsAnimationWidth = 950;
const GoalsAnimationHeight = 380;
const Which = () => {
  const theme = useTheme();

  const [canvasDimension, setCanvasDimension] = useState({ width: 0, height: 0 });
  const { width } = useWindowSize();

  const { data: stats } = useQuery("stats", getStats);

  useEffect(() => {
    let newWidth = width / 2;
    if (width >= 1536) newWidth = 750;
    else if (width >= 1200) newWidth = 600;
    else if (width >= 900) newWidth = 450;
    else if (width >= 600) newWidth = 540;
    else if (width >= 375) newWidth = 370;
    else if (width >= 0) newWidth = width - 40;

    const newHeight = getHeight(newWidth);
    setCanvasDimension({ width: newWidth, height: newHeight });
  }, [width]);

  const getGrayColorText = useCallback(
    () => (theme.palette.mode === "dark" ? gray03 : theme.palette.common.darkBackground2),
    [theme.palette.common.darkBackground2, theme.palette.mode]
  );

  const AnimationSections = useMemo(() => {
    return whichItems.map((whichItem, idx: number, src: any[]) => (
      <Stack
        // ref={refs[idx]}
        key={whichItem.id}
        direction={"column"}
        spacing={"20px"}
        alignItems={width < 900 ? "center" : "stretch"}
        sx={{ position: "relative", minHeight: "500px" /* , border: `2px dashed red` */ }}
      >
        <Typography gutterBottom variant="h3" component="h3" sx={{ fontSize: "32px", textAlign: "center" }}>
          {whichItem.name}
        </Typography>
        <Box sx={{ position: "relative", alignSelf: "center" }}>
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            {idx === 0 && (
              <Box
                component={"a"}
                href={whichItem.link}
                target="_blank"
                rel="noreferrer"
                sx={{ width: canvasDimension.width, height: canvasDimension.height }}
              >
                <RiveComponentMemoized
                  src="rive/notebook.riv"
                  artboard={"artboard-6"}
                  animations={["Timeline 1", theme.palette.mode]}
                  autoplay={true}
                />
              </Box>
            )}
            {idx === 1 && (
              <Box
                sx={{
                  width: width < 900 ? canvasDimension.width : GoalsAnimationWidth,
                  height: width < 900 ? canvasDimension.height : GoalsAnimationHeight,
                }}
              >
                <RiveComponentMemoized
                  src="rive-assistant/goals.riv"
                  artboard={"artboard-3"}
                  animations={["Timeline 1", theme.palette.mode]}
                  autoplay={true}
                />
              </Box>
            )}
            {idx === 2 && (
              <Box sx={{ width: canvasDimension.width, height: canvasDimension.height }}>
                <RiveComponentMemoized
                  src="rive/extension.riv"
                  artboard={"extension"}
                  animations={["Timeline 1", theme.palette.mode]}
                  autoplay={true}
                />
              </Box>
            )}
          </Box>
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
            pb: idx < src.length - 1 ? "100px" : "0px",
          }}
        >
          {(whichItem.getBody && stats ? whichItem.getBody(stats) : whichItem.body)
            .split("\n")
            .map((paragraph: string, idx: number) => (
              <Typography
                key={idx}
                variant="body2"
                sx={{
                  textAlign: "left",
                  color: getGrayColorText(),
                  fontSize: "16px",
                }}
              >
                {wrapStringWithBoldTag(paragraph, RE_DETECT_NUMBERS_WITH_COMMAS)}
                {/* {paragraph} */}
              </Typography>
            ))}
          <Box>
            {whichItem.link && (
              <Button variant="outlined" href={whichItem.link} target="_blank" rel="noreferrer">
                Visit
                <LaunchIcon fontSize={"small"} sx={{ ml: "10px" }} />
              </Button>
            )}
            {!whichItem.link && (
              <Button variant="outlined" disabled>
                Coming Soon
                <LaunchIcon fontSize={"small"} sx={{ ml: "10px" }} />
              </Button>
            )}
          </Box>
        </Box>
      </Stack>
    ));
  }, [canvasDimension.height, canvasDimension.width, getGrayColorText, stats, theme.palette.mode, width]);

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // overflowX: "hidden",
      }}
    >
      {AnimationSections}
      {/* <Stack direction={"column"} spacing={isMobile ? "60px" : "100px"}>
        {WhichSections}
      </Stack> */}
    </Box>
  );
};

const getHeight = (width: number) => (300 * width) / 500;

export default Which;
