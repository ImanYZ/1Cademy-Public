import { Box /* useTheme */ } from "@mui/material";
// const Values = dynamic(() => import("../components/home/views/Values"), { suspense: true, ssr: false });
// const What = dynamic(() => import("../components/home/views/What"), { suspense: true, ssr: false });
// const UniversitiesMap = dynamic(() => import("../components/home/components/UniversitiesMap/UniversitiesMap"), {
//   suspense: true,
//   ssr: false,
// });
// const WhoWeAre = dynamic(() => import("../components/home/views/WhoWeAre"), { suspense: true, ssr: false });
// const Which = dynamic(() => import("../components/home/views/Which"), { suspense: true, ssr: false });
// import dynamic from "next/dynamic";
import React from "react";

import { HeroMemoized } from "@/components/home/views/Hero";
import Topics from "@/components/home/views/Topics";

import AppHeader from "../components/AppHeader2";

export const gray01 = "#28282a";
export const gray02 = "#202020";
export const gray03 = "#AAAAAA";

/**
 * animations builded with: https://rive.app/
 */

export const Home = () => {
  // const theme = useTheme();

  return (
    <Box
      id="ScrollableContainer"
      // onScroll={e => detectScrollPosition(e)}
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        backgroundColor: theme => (theme.palette.mode === "dark" ? "#28282a" : theme.palette.common.white),
      }}
    >
      <AppHeader />
      <HeroMemoized headerHeight={50} />
      <Topics />
      <style>
        {`
          body{
            overflow:hidden;
          }
        `}
      </style>
    </Box>
  );
};

export default Home;
