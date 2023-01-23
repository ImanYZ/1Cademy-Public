import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";

import { gray03 } from "../../../pages";
import whichItems from "./whichValues";

const Which = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(min-width:900px)");

  // const { inViewOnce: paper1ViewOnce, ref: paper1Ref } = useInView();
  // const { inViewOnce: paper2ViewOnce, ref: paper2Ref } = useInView();
  // const { inViewOnce: paper3ViewOnce, ref: paper3Ref } = useInView();
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
        {whichItems.map((value, idx) => (
          <Stack
            // ref={refs[idx]}
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
              // className={inViewOnces[idx] ? (idx % 2 === 0 ? "slide-left-to-right" : "slide-right-to-left") : "hide"}
            >
              <img
                alt={value.name}
                src={theme.palette.mode === "light" ? "/static/" + value.image : "/static/" + value.imageDark}
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
              // className={inViewOnces[idx] ? (idx % 2 !== 0 ? "slide-left-to-right" : "slide-right-to-left") : "hide"}
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

export default Which;
