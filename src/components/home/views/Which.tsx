import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useWindowSize } from "../../../hooks/useWindowSize";
import { gray03 } from "../../../pages";
import { RiveComponentMemoized } from "../components/temporals/RiveComponentExtended";
import whichItems from "./whichValues";

const Which = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery("(max-width:600px)");
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
        direction={width < 900 ? "column" : idx % 2 === 0 ? "row" : "row-reverse"}
        spacing={width < 900 ? "20px" : "40px"}
        alignItems={width < 900 ? "center" : "stretch"}
        alignSelf={width < 900 ? "center" : idx % 2 === 0 ? "flex-end" : "flex-start"}
        sx={{ position: "relative", minHeight: "500px" /* , border: `2px dashed red` */ }}
      >
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              position: width < 900 ? "relative" : "absolute",

              left: idx % 2 === 0 ? undefined : "0",
              right: idx % 2 === 1 ? undefined : "0",
              /* border: "solid 1px royalBlue", */
              top: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* <Box sx={{ width: `${canvasDimension.width}px`, height: `${canvasDimension.height}px` }}>
              <RiveComponentMemoized
                src="rive/notebook.riv"
                artboard={artboard.artoboard}
                animations={["Timeline 1", theme.palette.mode]}
                autoplay={true}
              />
            </Box> */}
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
            maxWidth: width < 900 ? "600px" : "400px",
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
          <Typography
            gutterBottom
            variant="h3"
            component="h3"
            sx={{ fontSize: "32px", textAlign: isMobile ? "center" : "start" }}
          >
            {whichItem.name}
          </Typography>
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
  }, [canvasDimension.height, canvasDimension.width, getGrayColorText, isMobile, theme.palette.mode, width]);

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
