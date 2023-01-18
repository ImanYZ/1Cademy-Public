import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";

import { useInView, UseInViewProps } from "@/hooks/useObserver";

import { gray03 } from "../../../pages";
import valuesItems from "./valuesItems";
const observerOption: UseInViewProps = { options: { root: null, rootMargin: "0px", threshold: 0.5 } };

const Values = () => {
  const theme = useTheme();
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

  const refs = [ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9];
  const inViewOnces = [
    inViewOnce1,
    inViewOnce2,
    inViewOnce3,
    inViewOnce4,
    inViewOnce5,
    inViewOnce6,
    inViewOnce7,
    inViewOnce8,
    inViewOnce9,
  ];

  const getGrayColorText = () => (theme.palette.mode === "dark" ? gray03 : theme.palette.common.darkBackground2);

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
        {valuesItems.map((value, idx) => (
          <Stack
            ref={refs[idx]}
            key={idx}
            direction={isMobile ? "column" : idx % 2 === 0 ? "row" : "row-reverse"}
            spacing={isMobile ? "0px" : "40px"}
            // alignItems={"center"}
            alignItems={"stretch"}
            // alignSelf={"stretch"}
          >
            <Box
              component={"picture"}
              sx={{
                // border: "solid 2px orange",
                minWidth: isTablet ? "350px" : "300px",
                height: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: isMobile ? "center" : idx % 2 === 0 ? "flex-start" : "flex-end",
              }}
              className={inViewOnces[idx] ? (idx % 2 === 0 ? "slide-left-to-right" : "slide-right-to-left") : "hide"}
            >
              <img
                alt={value.name}
                src={theme.palette.mode === "light" ? "/static/" + value.imageDark : "/static/" + value.image}
                style={{ flex: 1, width: "100%" }}
              />
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
        ))}
      </Stack>
    </Box>
  );
};

export default Values;
