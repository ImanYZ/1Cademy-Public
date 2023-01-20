import { Stack, Typography, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useMemo } from "react";

// import { useWindowSize } from "../../hooks/useWindowSize";
// import Collapse from "@mui/material/Collapse";
// import { CardActionArea } from "@mui/material";
// import Typography from "../components/Typography";
// import CustomTypography from "../components/Typography";
// import { sectionsOrder } from "../sectionsOrder";
// import { sectionsOrder } from "../sectionsOrder";
// // import sectionsOrder from "./sectionsOrder";

// const sectionIdx = sectionsOrder.findIndex(sect => sect.id === "HowItWorksSection");

const HowItWorks = (props: any) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  // const boxLarge = useMemo(() => {
  //   const offset = width < 600 ? 32 : width < 900 ? 70 : 100;
  //   if (height < width) return height - offset;
  //   return width - offset;
  // }, [height, width]);

  // const topCenteredPosition = height / 2 - boxLarge / 2 + 35;

  const getHeightSection = () => props.artboards.reduce((a: number, c: any) => a + c.getHeight(), 0);

  const processedArtboard = useMemo(
    () =>
      props.artboards.reduce((acu: any[], cur: any) => {
        const newHeight = cur.getHeight();
        return [
          ...acu,
          { ...cur, top: acu.length ? acu[acu.length - 1].top + acu[acu.length - 1].height : 0, height: newHeight },
        ];
      }, []),
    [props.artboards]
  );

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
      {processedArtboard.map((artboard: any, idx: number) => (
        <Stack
          // ref={refs[idx]}
          key={artboard.name}
          direction={isMobile ? "column" : idx % 2 === 0 ? "row" : "row-reverse"}
          spacing={isMobile ? "0px" : "40px"}
          alignItems={"stretch"}
          alignSelf={idx % 2 === 0 ? "flex-end" : "flex-start"}
          sx={{ position: "relative", height: artboard.height /* , border: `2px dashed ${artboard.color}` */ }}
        >
          {/* <img src="random.jpg" style={{ position: "absolute", top: 0, left: "100px" }} /> */}
          <Box sx={{ position: "relative" }}>
            {/* <img
              src="random.jpg"
              style={{
                position: "absolute",
                top: "calc((50% - 100px))",
                left: idx % 2 === 0 ? undefined : "0",
                right: idx % 2 === 1 ? undefined : "0",
              }}
            /> */}
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
              {artboard.riveComponent}
            </Box>
          </Box>
          {/* <Box
            component={"picture"}
            sx={{
              minWidth: isTablet ? "500px" : "300px",
              height: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: isMobile ? "center" : idx % 2 === 0 ? "flex-start" : "flex-end",
            }}
            // className={inViewOnces[idx] ? (idx % 2 === 0 ? "slide-left-to-right" : "slide-right-to-left") : "hide"}
          >
            <Box sx={{ width: "300px", height: "200px" }}>{artboard.riveComponent}</Box>
          </Box> */}
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
            // className={inViewOnces[idx] ? (idx % 2 !== 0 ? "slide-left-to-right" : "slide-right-to-left") : "hide"}
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
              tempora, necessitatibus dolorum sit rem, enim reiciendis optio voluptatum culpa eos quas magni libero
              fugit odit?
            </Typography>
            {/* {value.body.split("\n").map((paragraph, idx) => (
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
            ))} */}
          </Box>
        </Stack>
      ))}

      {/* <Box sx={{ position: "absolute", bottom: "20px", zIndex: 11 }}>{props.animationOptions}</Box> */}
    </Box>
  );
};

// const HowItWorksForwarded = React.forwardRef((props, ref) => <HowItWorks {...props} innerRef={ref} />);

export default HowItWorks;
