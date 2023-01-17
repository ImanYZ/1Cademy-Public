import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";

import { gray03 } from "../../../pages";
import valuesItems from "./valuesItems";
const Values = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(min-width:900px)");

  const getGrayColorText = () => (theme.palette.mode === "dark" ? gray03 : theme.palette.common.darkBackground2);

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
      <Stack direction={"column"} spacing={isMobile ? "60px" : "100px"}>
        {valuesItems.map((value, idx) => (
          <Stack
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
                minWidth: isTablet ? "500px" : "300px",
                height: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: isMobile ? "center" : idx % 2 === 0 ? "flex-start" : "flex-end",
              }}
            >
              <img alt={value.name} src={"/static/" + value.image} style={{ flex: 1, width: "100%" }} />
            </Box>
            <Box sx={{ p: "10px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography
                gutterBottom
                variant="h3"
                component="h3"
                sx={{ fontSize: "24px", textAlign: isMobile ? "center" : "start" }}
              >
                {value.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ textAlign: "left", color: getGrayColorText(), fontSize: isMobile ? "16px" : "20px" }}
              >
                {value.body}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default Values;
