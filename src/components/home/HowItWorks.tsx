import Box from "@mui/material/Box";
import React, { useImperativeHandle, useMemo, useRef } from "react";

import { useWindowSize } from "../../hooks/useWindowSize";
import sectionsOrder from "./sectionsOrder";
import Typography from "./Typography";
import YoutubeEmbed from "./YoutubeEmbed/YoutubeEmbed";
const sectionIdx = sectionsOrder.findIndex(sect => sect.id === "HowItWorksSection");

const HowItWorks = (props: any) => {
  const animation1Ref = useRef<any>(null);
  const animation2Ref = useRef<any>(null);
  const animation3Ref = useRef<any>(null);
  const animation4Ref = useRef<any>(null);
  const animation5Ref = useRef<any>(null);
  const animation6Ref = useRef<any>(null);

  useImperativeHandle(
    props.innerRef,
    () => {
      return {
        getAnimation1Height: () => animation1Ref?.current?.clientHeight ?? 0,
        getAnimation2Height: () => animation2Ref?.current?.clientHeight ?? 0,
        getAnimation3Height: () => animation3Ref?.current?.clientHeight ?? 0,
        getAnimation4Height: () => animation4Ref?.current?.clientHeight ?? 0,
        getAnimation5Height: () => animation5Ref?.current?.clientHeight ?? 0,
        getAnimation6Height: () => animation6Ref?.current?.clientHeight ?? 0,
      };
    },
    []
  );
  const { height, width } = useWindowSize();

  const boxLarge = useMemo(() => {
    if (height < width) return height - 100;
    return width - 100;
  }, [height, width]);

  return (
    <>
      <Box
        id="HowItWorksSection"
        component="section"
        sx={{
          pt: 7,
          pb: 10,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#28282a",
        }}
      >
        <Typography variant="h4" marked="center" sx={{ mb: 7, color: "#f8f8f8" }}>
          {sectionsOrder[sectionIdx].title}
        </Typography>

        {/* --- animations start */}

        <div
          style={{
            position: "sticky",
            top: height / 2 - boxLarge / 2 + 35,
            /* border: 'solid 2px royalBlue', */ width: boxLarge,
            height: boxLarge,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {props.riveComponent}
        </div>
        <div ref={animation1Ref} style={{ height: "100vh", width: "100%" /* background: "#123" */ }}></div>
        <div ref={animation2Ref} style={{ height: "500vh", width: "100%" /* background: "#2769aa" */ }}></div>
        <div ref={animation3Ref} style={{ height: "300vh", width: "100%" /* background: "#3696f7" */ }}></div>
        <div ref={animation4Ref} style={{ height: "300vh", width: "100%" /* background: "#26c2ff" */ }}></div>
        <div ref={animation5Ref} style={{ height: "300vh", width: "100%" /* background: "#24f0ff" */ }}></div>
        <div
          ref={animation6Ref}
          style={{
            height: "100vh",
            width: "100%" /* background: "#15e9a2" */,
            position: "absolute",
            bottom: "0px",
            left: "0px",
          }}
        ></div>

        {/* --- animation ends */}

        <Box sx={{ zIndex: 1, mx: "auto" }}>
          <Box sx={{ mt: "19px" }}>
            <YoutubeEmbed embedId="vkNx-QUmbNI" />
          </Box>
        </Box>
      </Box>
    </>
  );
};

const HowItWorksForwarded = React.forwardRef((props: any, ref) => <HowItWorks {...props} innerRef={ref} />);

export default HowItWorksForwarded;
// eslint-enable
