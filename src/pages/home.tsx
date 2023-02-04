import { Box /* useTheme */, Typography } from "@mui/material";
import React from "react";

import AppFooter3 from "@/components/AppFooter3";
import Benefits from "@/components/home/sections/Benefits";

import AppHeader, { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from "../components/AppHeader2";
import UniversitiesMap from "../components/home/components/UniversitiesMap/UniversitiesMap";
import About from "../components/home/sections/About";
import Join from "../components/home/sections/Join";
import Magnitude from "../components/home/sections/Magnitude";
import Mechanism from "../components/home/sections/Mechanism";
import Papers from "../components/home/sections/Papers";
import Topics from "../components/home/sections/Systems";
import Systems from "../components/home/sections/Topics";
import { ONE_CADEMY_SECTIONS } from "../components/home/SectionsItems";
// const Values = dynamic(() => import("../components/home/views/Values"), { suspense: true, ssr: false });
// const What = dynamic(() => import("../components/home/views/What"), { suspense: true, ssr: false });
// const UniversitiesMap = dynamic(() => import("../components/home/components/UniversitiesMap/UniversitiesMap"), {
//   suspense: true,
//   ssr: false,
// });
// const WhoWeAre = dynamic(() => import("../components/home/views/WhoWeAre"), { suspense: true, ssr: false });
// const Which = dynamic(() => import("../components/home/views/Which"), { suspense: true, ssr: false });
// import dynamic from "next/dynamic";
import { HeroMemoized } from "../components/home/views/Hero";

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
        backgroundColor: theme => (theme.palette.mode === "dark" ? "#0A0D14" : "#FFFFFF"),
      }}
    >
      <AppHeader />
      <HeroMemoized headerHeight={HEADER_HEIGHT} headerHeightMobile={HEADER_HEIGHT_MOBILE} />
      {ONE_CADEMY_SECTIONS.slice(1).map((section, idx) => (
        <Box key={section.id} id={section.id} component={"section"} sx={{ py: { xs: "64px", sm: "96px" } }}>
          <Box
            sx={{
              maxWidth: "1280px",
              margin: "auto",
              // border: `solid 2px ${idx % 2 === 0 ? "royalBlue" : "pink"}`,
              textAlign: idx === 0 ? "center" : "left",
              px: { xs: "16px", sm: "32px" },
            }}
          >
            <Box sx={{ mb: idx === 0 ? "32px" : "64px" }}>
              <Typography sx={{ fontSize: "36px", mb: "20px" }}>{section.label}</Typography>
              <Typography sx={{ fontSize: "20px", maxWidth: idx !== 0 ? "768px" : undefined }}>
                {section.getDescription
                  ? section.getDescription({
                      institutions: "0",
                      links: "0",
                      nodes: "0",
                      proposals: "0",
                      users: "0",
                      communities: "0",
                    })
                  : section.description}
              </Typography>
            </Box>

            {idx === 0 && <Mechanism />}
            {idx === 1 && <Magnitude />}
            {idx === 1 && <UniversitiesMap theme={"Dark"} />}
            {idx === 2 && <Benefits />}
            {idx === 4 && <Topics />}
            {idx === 3 && <Systems />}
            {idx === 5 && <About />}
            {idx === 5 && <Papers />}
          </Box>
        </Box>
      ))}

      <Box sx={{ py: "96px", maxWidth: "1216px", m: "auto" }}>
        <Join />
      </Box>

      <AppFooter3 />
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
