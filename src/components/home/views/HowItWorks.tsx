import Box from "@mui/material/Box";
import React from "react";

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
  // const isMobile = useMediaQuery("(max-width:600px)");

  // const boxLarge = useMemo(() => {
  //   const offset = width < 600 ? 32 : width < 900 ? 70 : 100;
  //   if (height < width) return height - offset;
  //   return width - offset;
  // }, [height, width]);

  // const topCenteredPosition = height / 2 - boxLarge / 2 + 35;

  const getHeightSection = () => props.artboards.reduce((a: number, c: any) => a + c.getHeight(), 0);

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
      {props.children}
    </Box>
  );
};

// const HowItWorksForwarded = React.forwardRef((props, ref) => <HowItWorks {...props} innerRef={ref} />);

export default HowItWorks;
