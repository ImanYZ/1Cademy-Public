import { Box } from "@mui/material";
import React from "react";

// import { useQuery } from "react-query";
import AppFooter from "@/components/AppFooter";
import Benefits from "@/components/home/sections/Benefits";

import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from "../components/Header/AppHeader";
import UniversitiesMap from "../components/home/components/UniversitiesMap/UniversitiesMap";
import HomeWrapper from "../components/home/HomeWrapper";
import About from "../components/home/sections/About";
import { HeroMemoized } from "../components/home/sections/Hero";
import Join from "../components/home/sections/Join";
import Magnitude from "../components/home/sections/Magnitude";
import Mechanism, { MECHANISM_ITEMS } from "../components/home/sections/Mechanism";
import Papers from "../components/home/sections/Papers";
import Systems from "../components/home/sections/Systems";
import Topics from "../components/home/sections/Topics";

export const gray01 = "#28282a";
export const gray02 = "#202020";
export const gray03 = "#AAAAAA";
export const gray25 = "#FCFCFD";
export const gray50 = "#F9FAFB";
export const gray100 = "#F2F4F7";
export const gray200 = "#EAECF0";
export const gray300 = "#D0D5DD";
export const gray400 = "#98A2B3";
export const gray600 = "#475467";
export const gray700 = "#344054";
export const gray800 = "#1D2939";
export const gray850 = "#302F2F";
export const gray900 = "#0A0D14";
export const orangeDark = "#FF6D00";
export const orangeLight = "#FF6D00";
export const orange800 = "#FF6D00";
export const orange900 = "#E56200";
export const darkBase = "#242425";

// const observerOption: UseInViewProps = { options: { root: null, rootMargin: "-380px 0px -380px 0px", threshold: 0 } };

/**
 * animations builded with: https://rive.app/
 */

export const Home = () => {
  return (
    <Box
      id="ScrollableContainer"
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        scrollBehavior: "smooth",
        backgroundColor: theme => (theme.palette.mode === "dark" ? darkBase : "#FFFFFF"),
      }}
    >
      <HomeWrapper
        heroSectionChildren={<HeroMemoized headerHeight={HEADER_HEIGHT} headerHeightMobile={HEADER_HEIGHT_MOBILE} />}
        mechanismSectionChildren={<Mechanism mechanisms={MECHANISM_ITEMS} />}
        magnitudeSectionChildren={
          <>
            <Magnitude />
            <UniversitiesMap theme={"Dark"} />
          </>
        }
        benefitSectionChildren={<Benefits />}
        topicsSectionChildren={<Topics />}
        systemSectionChildren={<Systems />}
        aboutSectionChildren={
          <>
            <About />
            <Papers />
          </>
        }
      />

      <Box sx={{ py: { xs: "64px", sm: "96px" }, maxWidth: "1216px", m: "auto" }}>
        <Join />
      </Box>

      <AppFooter />
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
