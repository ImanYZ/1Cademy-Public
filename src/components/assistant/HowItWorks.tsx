import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import { useWindowSize } from "@/hooks/useWindowSize";

import { gray03 } from "../../pages";
import { RiveComponentMemoized } from "../home/components/temporals/RiveComponentExtended";

// import { useWindowSize } from "../../hooks/useWindowSize";
// import Collapse from "@mui/material/Collapse";
// import { CardActionArea } from "@mui/material";
// import Typography from "../components/Typography";
// import CustomTypography from "../components/Typography";
// import { sectionsOrder } from "../sectionsOrder";
// import { sectionsOrder } from "../sectionsOrder";
// // import sectionsOrder from "./sectionsOrder";

// const sectionIdx = sectionsOrder.findIndex(sect => sect.id === "HowItWorksSection");
type HowItWorksProps = { artboards: any[] };

const HowItWorks = ({ artboards }: HowItWorksProps, ref: any) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const [canvasDimension, setCanvasDimension] = useState({ width: 0, height: 0 });
  const ref1 = useRef<any | null>(null);
  const ref2 = useRef<any | null>(null);
  const ref3 = useRef<any | null>(null);
  // const ref4 = useRef<any | null>(null);
  // const ref5 = useRef<any | null>(null);

  const refs = useMemo(() => [ref1, ref2, ref3 /* , ref4, ref5 */], []);

  useImperativeHandle(ref, () => ({
    getHeight1: () => (ref1?.current ? ref1.current.clientHeight : 0),
    getHeight2: () => (ref2?.current ? ref2.current.clientHeight : 0),
    getHeight3: () => (ref3?.current ? ref3.current.clientHeight : 0),
    // getHeight4: () => (ref4?.current ? ref4.current.clientHeight : 0),
    // getHeight5: () => (ref5?.current ? ref5.current.clientHeight : 0),
  }));

  const { width } = useWindowSize({ initialHeight: 1000, initialWidth: 0 });
  const theme = useTheme();

  const getGrayColorText = useCallback(
    () => (theme.palette.mode === "dark" ? gray03 : theme.palette.common.darkBackground2),
    [theme.palette.common.darkBackground2, theme.palette.mode]
  );

  useEffect(() => {
    let newWidth = width / 2;
    if (width > 1536) newWidth = 700;
    else if (width > 1200) newWidth = 500;
    else if (width > 900) newWidth = width / 2;
    else if (width > 600) newWidth = width - 60;
    else if (width > 0) newWidth = width - 40;

    const newHeight = getHeight(newWidth);
    setCanvasDimension({ width: newWidth, height: newHeight });
  }, [width]);

  // const boxLarge = useMemo(() => {
  //   const offset = width < 600 ? 32 : width < 900 ? 70 : 100;
  //   if (height < width) return height - offset;
  //   return width - offset;
  // }, [height, width]);

  // const topCenteredPosition = height / 2 - boxLarge / 2 + 35;

  // const getHeightSection = () => props.artboards.reduce((a: number, c: any) => a + c.getHeight(height), 0);

  // const processedArtboard = useMemo(
  //   () =>
  //     props.artboards.reduce((acu: any[], cur: any) => {
  //       const newHeight = cur.getHeight(height);
  //       return [
  //         ...acu,
  //         { ...cur, top: acu.length ? acu[acu.length - 1].top + acu[acu.length - 1].height : 0, height: newHeight },
  //       ];
  //     }, []),
  //   [props.artboards, height]
  // );

  // return (
  //   <Box
  //     // id="HowItWorksSection"
  //     component="section"
  //     sx={{
  //       height: getHeightSection(),
  //       position: "relative",
  //       display: "flex",
  //       flexDirection: "column",
  //       alignItems: "center",
  //     }}
  //   >
  //     <Box
  //       key={"artboard-1"}
  //       sx={{
  //         position: "absolute",
  //         top: 0,
  //         width: "100%",
  //         height: height - 70,
  //         // borderRight: `dashed 6px #ff28c9`,
  //         color: "white",
  //       }}
  //     >
  //     </Box>
  //     <CustomTypography
  //       component={"h2"}
  //       variant="h1"
  //       marked="center"
  //       align="center"
  //       sx={{ mb: 7, fontWeight: 700, position: "absolute", top: height - 30 }}
  //     >
  //       {sectionsOrder[1].title}
  //     </CustomTypography>
  //     {processedArtboard.map((artboard: any, idx: number) => (
  //       <Box
  //         key={artboard.name}
  //         sx={{
  //           position: "absolute",
  //           top: artboard.top,
  //           width: "100%",
  //           height: artboard.height,
  //           // borderRight: `dashed 6px ${artboard.color}`,
  //           color: "white",
  //         }}
  //       >
  //         {idx > 0 && (
  //           <Typography
  //             variant="h5"
  //             component="h3"
  //             sx={{
  //               mt: "100px",
  //               ml: "10px",
  //               position: "sticky",
  //               top: "100px",
  //               // color: "white",
  //               textTransform: "none",
  //             }}
  //           >
  //             {artboard.name}
  //           </Typography>
  //         )}
  //       </Box>
  //     ))}

  //     <Box sx={{ position: "absolute", bottom: "20px", zIndex: 11 }}>{props.animationOptions}</Box>

  //     <div
  //       style={{
  //         position: "sticky",
  //         top: topCenteredPosition,
  //         width: boxLarge,
  //         height: boxLarge,
  //         display: "flex",
  //         flexDirection: "column",
  //         zIndex: 10,
  //         // border: "solid 2px pink"
  //       }}
  //     >
  //       {props.children}
  //     </div>
  //   </Box>
  // );
  const AnimationSections = useMemo(() => {
    return artboards.map((artboard: any, idx: number, src: any[]) => (
      <Stack
        ref={refs[idx]}
        key={artboard.name}
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
            <Box sx={{ width: `${canvasDimension.width}px`, height: `${canvasDimension.height}px` }}>
              <RiveComponentMemoized
                src={artboard.src}
                artboard={artboard.artoboard}
                animations={["Timeline 1", theme.palette.mode]}
                autoplay={true}
              />
            </Box>
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
  }, [
    artboards,
    refs,
    width,
    canvasDimension.width,
    canvasDimension.height,
    theme.palette.mode,
    isMobile,
    getGrayColorText,
  ]);

  return (
    <Stack
      component="section"
      direction={"column"}
      alignItems={"center"}
      spacing={width < 900 ? "0px" : "245px"}
      sx={{
        // position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: "100px",
      }}
    >
      {AnimationSections}
    </Stack>
  );
};

// const getHeight = (width: number) => (300 * width) / 500;
const getHeight = (width: number) => width;

const HowItWorksFordwarded = forwardRef(HowItWorks);

export default HowItWorksFordwarded;
