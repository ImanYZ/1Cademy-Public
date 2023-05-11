import { Box } from "@mui/material";
import Head from "next/head";
import React from "react";

// import { useQuery } from "react-query";
import AppFooter from "@/components/AppFooter";
import JoinUs from "@/components/community/JoinUs";
import Benefits from "@/components/home/sections/Benefits";
import { ONECADEMY_DOMAIN } from "@/lib/utils/1cademyConfig";

import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from "../components/Header/AppHeader";
import UniversitiesMap from "../components/home/components/UniversitiesMap/UniversitiesMap";
import HomeWrapper from "../components/home/HomeWrapper";
import About from "../components/home/sections/About";
import { Demos } from "../components/home/sections/Demos";
import { HeroMemoized } from "../components/home/sections/Hero";
import Magnitude from "../components/home/sections/Magnitude";
import Mechanism, { MECHANISM_ITEMS } from "../components/home/sections/Mechanism";
import Papers from "../components/home/sections/Papers";
import Systems from "../components/home/sections/Systems";
import Topics from "../components/home/sections/Topics";

export const gray01 = "#28282a";
export const gray02 = "#202020";
export const gray03 = "#AAAAAA";
export const gray04 = "#999898";
export const gray25 = "#FCFCFD";
export const gray50 = "#F9FAFB";
export const gray100 = "#F2F4F7";
export const gray200 = "#EAECF0";
export const gray300 = "#D0D5DD";
export const gray400 = "#98A2B3";
export const gray500 = "#4B535C";
export const gray600 = "#475467";
export const gray700 = "#344054";
export const gray800 = "#1D2939";
export const gray850 = "#302F2F";
export const gray900 = "#0A0D14";
export const orangeDark = "#FF6D00";
export const orangeLight = "#FF6D00";
export const orange250 = "#DCA882";
export const orange800 = "#FF6D00";
export const orange900 = "#E56200";
export const darkBase = "#242425";
export const yellow100 = "#FEF7C3";
export const warningDark = "#34322E";
export const green100 = "#D1FADF";
export const successDark = "#282C29";
export const orangeLighter = "#faa666";

export const orange25 = "#FFF2EA";
export const orange200 = "#FFC29C";

// const observerOption: UseInViewProps = { options: { root: null, rootMargin: "-380px 0px -380px 0px", threshold: 0 } };

/**
 * animations builded with: https://rive.app/
 */

export const Home = () => {
  return (
    <>
      <Head>
        <link rel="canonical" href={`${ONECADEMY_DOMAIN}`} key="canonical" />
        <title>1Cademy</title>
      </Head>
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
              <About sx={{ mb: "64px" }} />
              <Papers sx={{ mb: "64px" }} />
              <Demos />
            </>
          }
        />

        <Box sx={{ py: { xs: "64px", sm: "96px" }, maxWidth: "1216px", m: "auto" }}>
          <JoinUs community={null} themeName="dark" />
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
    </>
  );
};

export default Home;
