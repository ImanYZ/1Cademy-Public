import { Stack, useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import { gray03 } from "@/pages/index";

import { useWindowSize } from "../../../hooks/useWindowSize";
import { RiveComponentMemoized } from "../components/temporals/RiveComponentExtended";
import Typography from "../components/Typography copy";

const HowItWorks = (props: any, ref: any) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const [canvasDimension, setCanvasDimension] = useState({ width: 0, height: 0 });
  const ref1 = useRef<any | null>(null);
  const ref2 = useRef<any | null>(null);
  const ref3 = useRef<any | null>(null);
  const ref4 = useRef<any | null>(null);
  const ref5 = useRef<any | null>(null);

  const refs = useMemo(() => [ref1, ref2, ref3, ref4, ref5], []);

  useImperativeHandle(ref, () => ({
    getHeight1: () => {
      return ref1?.current ? ref1.current.clientHeight : 0;
    },
    getHeight2: () => (ref2?.current ? ref2.current.clientHeight : 0),
    getHeight3: () => (ref3?.current ? ref3.current.clientHeight : 0),
    getHeight4: () => (ref4?.current ? ref4.current.clientHeight : 0),
    getHeight5: () => (ref5?.current ? ref5.current.clientHeight : 0),
  }));

  const { width } = useWindowSize();

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

  const AnimationSections = useMemo(() => {
    return props.artboards.map((artboard: any, idx: number, src: any[]) => (
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
                src="rive/notebook.riv"
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
    canvasDimension.height,
    canvasDimension.width,
    getGrayColorText,
    isMobile,
    props.artboards,
    refs,
    theme.palette.mode,
    width,
  ]);

  return (
    <Box
      component="section"
      sx={{
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

const getHeight = (width: number) => (300 * width) / 500;

const FancyInputFordwarded = forwardRef(HowItWorks);

export default FancyInputFordwarded;
