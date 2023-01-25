import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useCallback, useMemo } from "react";

import { useWindowSize } from "@/hooks/useWindowSize";

import { useInView, UseInViewProps } from "../../hooks/useObserver";
import { gray03 } from "../../pages/assistant";
import { RiveComponentMemoized } from "../home/components/temporals/RiveComponentExtended";
import valuesItems from "./whyItems";

const observerOption: UseInViewProps = { options: { root: null, rootMargin: "0px", threshold: 0.5 } };

const Values = () => {
  const theme = useTheme();
  const { width } = useWindowSize();

  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(min-width:900px)");
  const { ref: ref1, inViewOnce: inViewOnce1 } = useInView(observerOption);
  const { ref: ref2, inViewOnce: inViewOnce2 } = useInView(observerOption);
  const { ref: ref3, inViewOnce: inViewOnce3 } = useInView(observerOption);
  const { ref: ref4, inViewOnce: inViewOnce4 } = useInView(observerOption);
  const { ref: ref5, inViewOnce: inViewOnce5 } = useInView(observerOption);
  const { ref: ref6, inViewOnce: inViewOnce6 } = useInView(observerOption);
  const { ref: ref7, inViewOnce: inViewOnce7 } = useInView(observerOption);
  const { ref: ref8, inViewOnce: inViewOnce8 } = useInView(observerOption);
  const { ref: ref9, inViewOnce: inViewOnce9 } = useInView(observerOption);
  const { ref: ref10, inViewOnce: inViewOnce10 } = useInView(observerOption);
  const { ref: ref11, inViewOnce: inViewOnce11 } = useInView(observerOption);
  const { ref: ref12, inViewOnce: inViewOnce12 } = useInView(observerOption);

  const refs = useMemo(
    () => [ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, ref10, ref11, ref12],
    [ref1, ref10, ref11, ref12, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9]
  );
  const inViewOnces = useMemo(
    () => [
      inViewOnce1,
      inViewOnce2,
      inViewOnce3,
      inViewOnce4,
      inViewOnce5,
      inViewOnce6,
      inViewOnce7,
      inViewOnce8,
      inViewOnce9,
      inViewOnce10,
      inViewOnce11,
      inViewOnce12,
    ],
    [
      inViewOnce1,
      inViewOnce10,
      inViewOnce11,
      inViewOnce12,
      inViewOnce2,
      inViewOnce3,
      inViewOnce4,
      inViewOnce5,
      inViewOnce6,
      inViewOnce7,
      inViewOnce8,
      inViewOnce9,
    ]
  );

  // const { rive, RiveComponent: RiveComponentMeettings } = useRive({
  //   src: "rive-assistant/meetings.riv",
  //   artboard: "meetings",
  //   animations: ["Timeline 1", theme.palette.mode === "dark" ? "dark" : "light"],
  //   autoplay: true,
  // });

  // useEffect(() => {
  //   if (!rive || !rive.play) return;
  //   rive.play(["Timeline 1", theme.palette.mode === "dark" ? "dark" : "light"]);
  // }, [rive, theme.palette.mode]);

  const getGrayColorText = useCallback(
    () => (theme.palette.mode === "dark" ? gray03 : theme.palette.common.darkBackground2),
    [theme.palette.common.darkBackground2, theme.palette.mode]
  );

  const Items = useMemo(() => {
    return valuesItems.map((value, idx) => (
      <Stack
        ref={refs[idx]}
        key={idx}
        direction={isMobile ? "column" : idx % 2 === 0 ? "row" : "row-reverse"}
        spacing={isMobile ? "0px" : "40px"}
        alignItems={"stretch"}
      >
        <Box
          component={"picture"}
          sx={{
            minWidth: isTablet ? "500px" : "300px",
            height: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "center" : idx % 2 === 0 ? "flex-start" : "flex-end",
          }}
          className={inViewOnces[idx] ? (idx % 2 === 0 ? "slide-left-to-right" : "slide-right-to-left") : "hide"}
        >
          {idx === 2 ? (
            <Box
              sx={{
                width: width > 600 && width < 900 ? "300px" : "450px",
                height: width > 600 && width < 900 ? "200px" : "300px",
                flex: 1,
              }}
            >
              <RiveComponentMemoized
                src="rive-assistant/meetings.riv"
                artboard="meetings"
                animations={["Timeline 1", theme.palette.mode === "dark" ? "dark" : "light"]}
                autoplay={true}
              />
            </Box>
          ) : (
            <img
              alt={value.name}
              src={theme.palette.mode === "light" ? value.image : value.imageDark}
              style={{ flex: 1 }}
            />
          )}
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
          }}
          className={inViewOnces[idx] ? (idx % 2 !== 0 ? "slide-left-to-right" : "slide-right-to-left") : "hide"}
        >
          <Typography
            gutterBottom
            variant="h3"
            component="h3"
            sx={{ fontSize: "24px", textAlign: isMobile ? "center" : "start" }}
          >
            {value.name}
          </Typography>
          {value.body.split("\n").map((paragraph, idx) => (
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
  }, [getGrayColorText, inViewOnces, isMobile, isTablet, refs, theme.palette.mode, width]);
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowX: "hidden",
      }}
    >
      <Stack direction={"column"} spacing={isMobile ? "60px" : "100px"}>
        {Items}
      </Stack>
    </Box>
  );
};

const ValuesMemoized = React.memo(Values);
export default ValuesMemoized;
