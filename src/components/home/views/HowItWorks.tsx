import { Stack, useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useEffect, useMemo } from "react";

import { useInView } from "@/hooks/useObserver";

import { useRiveMemoized } from "../components/temporals/useRiveMemoized";
import Typography from "../components/Typography copy";

// import { useWindowSize } from "../../hooks/useWindowSize";
// import Collapse from "@mui/material/Collapse";
// import { CardActionArea } from "@mui/material";
// import Typography from "../components/Typography";
// import CustomTypography from "../components/Typography";
// import { sectionsOrder } from "../sectionsOrder";
// import { sectionsOrder } from "../sectionsOrder";
// // import sectionsOrder from "./sectionsOrder";

// const sectionIdx = sectionsOrder.findIndex(sect => sect.id === "HowItWorksSection");
const AnimationObserverOptions = { options: { threshold: 0.35, root: null, rootMargin: "0px" } };

const HowItWorks = (props: any) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const theme = useTheme();

  // const boxLarge = useMemo(() => {
  //   const offset = width < 600 ? 32 : width < 900 ? 70 : 100;
  //   if (height < width) return height - offset;
  //   return width - offset;
  // }, [height, width]);

  // const topCenteredPosition = height / 2 - boxLarge / 2 + 35;
  const { ref: ref4, inView: inView4 } = useInView(AnimationObserverOptions);

  const getHeightSection = () => props.artboards.reduce((a: number, c: any) => a + c.getHeight(), 0);

  const Animation1 = useRiveMemoized({
    src: "rive/notebook.riv",
    artboard: "artboard-3",
    animations: ["Timeline 1", theme.palette.mode],
    autoplay: false,
  });
  console.log({ Animation1 });
  useEffect(() => {
    console.log({ inView4 });
    if (!Animation1.rive) return;

    inView4 ? Animation1.rive.play() : Animation1.rive.pause();
  }, [Animation1.rive, inView4]);

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
            {/* <RiveComponentMemoized
              src="rive/notebook.riv"
              artboard={artboard.artoboard}
              animations={["Timeline 1", theme.palette.mode]}
              autoplay={false}
              // inView={idx === 0 ? inView4 : false}
            /> */}
            {Animation1.riveComponentMemoized}
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
          <Typography fontSize={"20px"} fontWeight={300}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae dolor, laboriosam temporibus impedit qui
            tempora, necessitatibus dolorum sit rem, enim reiciendis optio voluptatum culpa eos quas magni libero fugit
            odit?
          </Typography>
        </Box>
      </Stack>
    ));
  }, [Animation1.riveComponentMemoized, isMobile, props.artboards, ref4]);
  // const processedArtboard = useMemo(
  //   () =>
  //     props.artboards.reduce((acu: any[], cur: any) => {
  //       const newHeight = cur.getHeight();
  //       return [
  //         ...acu,
  //         { ...cur, top: acu.length ? acu[acu.length - 1].top + acu[acu.length - 1].height : 0, height: newHeight },
  //       ];
  //     }, []),
  //   [props.artboards]
  // );

  return (
    <Box
      // id="HowItWorksSection"
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

// const HowItWorksForwarded = React.forwardRef((props, ref) => <HowItWorks {...props} innerRef={ref} />);

export default HowItWorks;
