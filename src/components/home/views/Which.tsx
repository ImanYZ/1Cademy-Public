import { Box, Stack, Typography, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useWindowSize } from "../../../hooks/useWindowSize";
import { gray03 } from "../../../pages";
import { RiveComponentMemoized } from "../components/temporals/RiveComponentExtended";
import whichItems from "./whichValues";

const GoalsAnimationWidth = 950;
const GoalsAnimationHeight = 380;
const Which = () => {
  const theme = useTheme();

  const [canvasDimension, setCanvasDimension] = useState({ width: 0, height: 0 });
  const { width } = useWindowSize();

  useEffect(() => {
    let newWidth = width / 2;
    if (width > 1536) newWidth = 750;
    else if (width > 1200) newWidth = 600;
    else if (width > 900) newWidth = width / 2;
    else if (width > 600) newWidth = width - 60;
    else if (width > 0) newWidth = width - 40;

    const newHeight = getHeight(newWidth);
    setCanvasDimension({ width: newWidth, height: newHeight });
  }, [width]);

  // const { inViewOnce: paper1ViewOnce, ref: paper1Ref } = useInView();
  // const { inViewOnce: paper2ViewOnce, ref: paper2Ref } = useInView();
  // const { inViewOnce: paper3ViewOnce, ref: paper3Ref } = useInView();
  const getGrayColorText = useCallback(
    () => (theme.palette.mode === "dark" ? gray03 : theme.palette.common.darkBackground2),
    [theme.palette.common.darkBackground2, theme.palette.mode]
  );

  // const WhichSections = useMemo(() => {
  //   return whichItems.map((whichSubsection, idx) => (
  //     <Stack
  //       key={idx}
  //       direction={isMobile ? "column" : idx % 2 === 0 ? "row" : "row-reverse"}
  //       spacing={isMobile ? "0px" : "40px"}
  //       alignItems={"stretch"}
  //     >
  //       <Box
  //         component={"picture"}
  //         sx={{
  //           // border: "solid 2px orange",
  //           minWidth: isTablet ? "350px" : "300px",
  //           height: "auto",
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: isMobile ? "center" : idx % 2 === 0 ? "flex-start" : "flex-end",
  //         }}
  //       >
  //         {idx === 0 && (
  //           <Box sx={{ width: canvasDimension.width, height: canvasDimension.height }}>
  //             <RiveComponentMemoized
  //               src="rive/notebook.riv"
  //               artboard={"artboard-6"}
  //               animations={["Timeline 1", theme.palette.mode]}
  //               autoplay={true}
  //             />
  //           </Box>
  //         )}
  //         {idx === 1 && (
  //           <Box sx={{ width: canvasDimension.width, height: canvasDimension.height }}>
  //             <RiveComponentMemoized
  //               src="rive-assistant/goals.riv"
  //               artboard={"artboard-3"}
  //               animations={["Timeline 1", theme.palette.mode]}
  //               autoplay={true}
  //             />
  //           </Box>
  //         )}
  //         {idx === 2 && (
  //           <Box sx={{ width: canvasDimension.width, height: canvasDimension.height }}>
  //             <RiveComponentMemoized
  //               src="rive/extension.riv"
  //               artboard={"extension"}
  //               animations={["Timeline 1", theme.palette.mode]}
  //               autoplay={true}
  //             />
  //           </Box>
  //         )}
  //       </Box>
  //       <Box
  //         sx={{
  //           p: "10px",
  //           display: "flex",
  //           flexDirection: "column",
  //           justifyContent: "center",
  //           "& > *:not(:last-child)": {
  //             mb: "12px",
  //           },
  //         }}
  //       >
  //         <Typography
  //           gutterBottom
  //           variant="h3"
  //           component="h3"
  //           sx={{ fontSize: "24px", textAlign: isMobile ? "center" : "start" }}
  //         >
  //           {whichSubsection.name}
  //         </Typography>
  //         {whichSubsection.body.split("\n").map((paragraph, idx) => (
  //           <Typography
  //             key={idx}
  //             variant="body2"
  //             sx={{
  //               textAlign: "left",
  //               color: getGrayColorText(),
  //               fontSize: "16px",
  //             }}
  //           >
  //             {paragraph}
  //           </Typography>
  //         ))}
  //         <Box>
  //           {whichSubsection.link && (
  //             <Button variant="outlined" href={whichSubsection.link} target="_blank" rel="noreferrer">
  //               Visit
  //               <LaunchIcon fontSize={"small"} sx={{ ml: "10px" }} />
  //             </Button>
  //           )}
  //           {!whichSubsection.link && (
  //             <Button variant="outlined" disabled>
  //               Coming Soon
  //               <LaunchIcon fontSize={"small"} sx={{ ml: "10px" }} />
  //             </Button>
  //           )}
  //         </Box>
  //       </Box>
  //     </Stack>
  //   ));
  // }, [canvasDimension.height, canvasDimension.width, getGrayColorText, isMobile, isTablet, theme.palette.mode]);

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
          {whichItem.body.split("\n").map((paragraph: string, idx: number) => (
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
  }, [canvasDimension.height, canvasDimension.width, getGrayColorText, theme.palette.mode, width]);

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
