import { Stack, useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";

import { gray03 } from "@/pages/index";

import { useWindowSize } from "../../../hooks/useWindowSize";
import { RiveComponentMemoized } from "../components/temporals/RiveComponentExtended";
import Typography from "../components/Typography copy";

const HowItWorks = (props: any, ref) => {
  // const isLargeDesktop = useMediaQuery("(min-width:1350px)");
  const isMobile = useMediaQuery("(max-width:600px)");

  const ref1 = useRef<any | null>(null);
  const ref2 = useRef<any | null>(null);
  const ref3 = useRef<any | null>(null);
  const ref4 = useRef<any | null>(null);
  const ref5 = useRef<any | null>(null);

  const refs = useMemo(() => [ref1, ref2, ref3, ref4, ref5], []);

  useImperativeHandle(ref, () => ({
    getHeight1: () => {
      console.log("h1:", ref1.current.clientHeight);
      return ref1?.current ? ref1.current.clientHeight : 0;
    },
    getHeight2: () => (ref2?.current ? ref2.current.clientHeight : 0),
    getHeight3: () => (ref3?.current ? ref3.current.clientHeight : 0),
    getHeight4: () => (ref4?.current ? ref4.current.clientHeight : 0),
    getHeight5: () => (ref5?.current ? ref5.current.clientHeight : 0),
  }));

  const { width } = useWindowSize();

  const theme = useTheme();

  // const getHeightSection = () => props.artboards.reduce((a: number, c: any) => a + c.getHeight(isMobile), 0);

  const getGrayColorText = useCallback(
    () => (theme.palette.mode === "dark" ? gray03 : theme.palette.common.darkBackground2),
    [theme.palette.common.darkBackground2, theme.palette.mode]
  );

  const containerResponsiveProps = useMemo(() => {
    const getHeight = (width: number) => (300 * width) / 500;

    console.log(width);
    if (width > 1350) return { width: "800px", height: getHeight(800), top: "calc(50% - 400px)" };
    if (width > 1200) return { width: "700px", height: getHeight(700), top: "calc(50% - 350px)" };
    if (width > 900) return { width: "550px", height: getHeight(550), top: "calc(50% - 275px)" };
    if (width > 600) return { width: "500px", height: getHeight(500), top: "calc(50% - 225px)" };
    return { width: "450px", height: getHeight(450), top: "0px" };
  }, [width]);

  const AnimationSections = useMemo(() => {
    return props.artboards.map((artboard: any, idx: number) => (
      <Stack
        // ref={idx === 0 ? ref4 : undefined}
        ref={refs[idx]}
        key={artboard.name}
        direction={isMobile ? "column" : idx % 2 === 0 ? "row" : "row-reverse"}
        spacing={isMobile ? "20px" : "40px"}
        alignItems={isMobile ? "center" : "stretch"}
        alignSelf={isMobile ? "center" : idx % 2 === 0 ? "flex-end" : "flex-start"}
        sx={{ position: "relative", minHeight: "500px", border: `2px dashed red` }}
      >
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              position: isMobile ? "relative" : "absolute",
              // width: isLargeDesktop ? "800px" : "600px",
              // height: isLargeDesktop ? "800px" : "600px",
              // top: "calc(50% - 400px)",
              left: idx % 2 === 0 ? undefined : "0",
              right: idx % 2 === 1 ? undefined : "0",
              ...containerResponsiveProps,
              border: "solid 1px royalBlue",
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
  }, [containerResponsiveProps, getGrayColorText, isMobile, props.artboards, refs, theme.palette.mode]);

  return (
    <Box
      component="section"
      sx={{
        // height: getHeightSection(),
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

const FancyInputFordwarded = forwardRef(HowItWorks);

export default FancyInputFordwarded;
