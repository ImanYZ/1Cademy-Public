import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useMemo } from "react";

import { useWindowSize } from "@/hooks/useWindowSize";

// import { useWindowSize } from "../../hooks/useWindowSize";
// import Collapse from "@mui/material/Collapse";
// import { CardActionArea } from "@mui/material";
// import Typography from "../components/Typography";
import CustomTypography from "../../components/home/components/Typography";
import { sectionsOrder } from "./sectionsOrder";
// import { sectionsOrder } from "../home/sectionsOrder";
// import { sectionsOrder } from "../sectionsOrder";
// import { sectionsOrder } from "../sectionsOrder";
// // import sectionsOrder from "./sectionsOrder";

// const sectionIdx = sectionsOrder.findIndex(sect => sect.id === "HowItWorksSection");

const HowItWorks = (props: any) => {
  const { height, width } = useWindowSize({ initialHeight: 1000, initialWidth: 0 });

  const boxLarge = useMemo(() => {
    const offset = width < 600 ? 32 : width < 900 ? 70 : 100;
    if (height < width) return height - offset;
    return width - offset;
  }, [height, width]);

  const topCenteredPosition = height / 2 - boxLarge / 2 + 35;

  const getHeightSection = () => props.artboards.reduce((a: number, c: any) => a + c.getHeight(height), 0);

  const processedArtboard = useMemo(
    () =>
      props.artboards.reduce((acu: any[], cur: any) => {
        const newHeight = cur.getHeight(height);
        return [
          ...acu,
          { ...cur, top: acu.length ? acu[acu.length - 1].top + acu[acu.length - 1].height : 0, height: newHeight },
        ];
      }, []),
    [props.artboards, height]
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
      {/* <Box
        key={"artboard-1"}
        sx={{
          position: "absolute",
          top: 0,
          width: "100%",
          height: height - 70,
          borderRight: `dashed 6px #ff28c9`,
          color: "white",
        }}
      ></Box> */}
      {/* <CustomTypography
        component={"h2"}
        variant="h1"
        marked="center"
        align="center"
        sx={{ mb: 7, fontWeight: 700, position: "absolute", top: 30 }}
      >
        {sectionsOrder[0].title}
      </CustomTypography> */}
      {/* <Typography variant="h4" marked="center" align="center" sx={{ color: "#f8f8f8", position: "absolute", top: height - 30 }}
      >
        {sectionsOrder[1].title}
      </Typography> */}
      {processedArtboard.map((artboard: any, idx: number) => (
        <Box
          key={artboard.name}
          sx={{
            position: "absolute",
            top: artboard.top,
            width: "100%",
            height: artboard.height,
            borderRight: `dashed 6px ${artboard.color}`,
            color: "white",
          }}
        >
          {idx === 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
              <CustomTypography
                component={"h2"}
                variant="h1"
                marked="center"
                align="center"
                sx={{ mb: 7, fontWeight: 700, position: "absolute", top: 30 }}
              >
                {sectionsOrder[0].title}
              </CustomTypography>
            </Box>
          )}
          {idx > 0 && (
            <Typography
              variant="h5"
              component="h3"
              sx={{
                mt: "100px",
                ml: "10px",
                position: "sticky",
                top: "100px",
                color: theme => (theme.palette.mode === "dark" ? "white" : "black"),
                textTransform: "none",
              }}
            >
              {artboard.name}
            </Typography>
          )}
        </Box>
      ))}

      <div
        style={{
          position: "sticky",
          top: topCenteredPosition,
          width: boxLarge,
          height: boxLarge,
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
          // border: "solid 2px pink",
        }}
      >
        {props.children}
      </div>
    </Box>
  );
};

// const HowItWorksForwarded = React.forwardRef((props, ref) => <HowItWorks {...props} innerRef={ref} />);

export default HowItWorks;
