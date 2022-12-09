import { Box, ThemeProvider } from "@mui/material";
import React, { useState } from "react";

import { brandingLightTheme } from "@/lib/theme/brandingTheme";

import AppAppBar from "../components/home/AppAppBar";
import { sectionsOrder } from "../components/home/sectionsOrder";
import HowItWorks from "../components/home/views/HowItWorks";
import Landing from "../components/home/views/Landing";
import What from "../components/home/views/What";

/**
 * animations builded with: https://rive.app/
 */
const Home = () => {
  const [section, setSection] = useState(0);
  const [notSectionSwitching, setNotSectionSwitching] = useState(true);

  const updatePosition = (event: any) => {
    if (notSectionSwitching) {
      let cumulativeHeight = 0;
      for (let sIdx = 0; sIdx < sectionsOrder.length; sIdx++) {
        const sectionElement = window.document.getElementById(sectionsOrder[sIdx].id);
        const sectOffsetHeight = sectionElement ? sectionElement.scrollHeight : 0;
        cumulativeHeight += sectOffsetHeight;
        if (event.target.scrollTop < cumulativeHeight) {
          setSection(sIdx - 1);
          window.history.replaceState(null, sectionsOrder[sIdx].title, "#" + sectionsOrder[sIdx].id);
          break;
        }
      }
    }
  };

  const switchSection = (newValue: any) => {
    if (typeof window === "undefined") return;

    setNotSectionSwitching(false);
    setSection(newValue);
    let cumulativeHeight = 0;
    for (let sIdx = -1; sIdx < newValue; sIdx++) {
      const sectOffsetHeight = window.document.getElementById(sectionsOrder[sIdx + 1].id)?.scrollHeight || 0;
      cumulativeHeight += sectOffsetHeight;
    }
    const ScrollableContainer = window.document.getElementById("ScrollableContainer");
    if (!ScrollableContainer) return;

    ScrollableContainer.scroll({
      top: cumulativeHeight,
      left: 0,
      behavior: "smooth",
    });
    window.history.replaceState(null, sectionsOrder[newValue + 1].title, "#" + sectionsOrder[newValue + 1].id);
    setTimeout(() => {
      setNotSectionSwitching(true);
    }, 1000);
  };

  const homeClick = (event: any) => {
    event.preventDefault();
    switchSection(-1);
  };

  const joinUsClick = (event: any) => {
    event.preventDefault();
    switchSection(sectionsOrder.length - 2);
  };

  return (
    <ThemeProvider theme={brandingLightTheme}>
      <Box
        id="ScrollableContainer"
        onScroll={updatePosition}
        sx={{
          height: "100vh",
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        <AppAppBar
          section={section}
          joinNowSec={section === sectionsOrder.length - 2}
          switchSection={switchSection}
          homeClick={homeClick}
          joinUsClick={joinUsClick}
          thisPage={section === sectionsOrder.length - 2 ? "Apply!" : undefined}
        />
        <Landing />
        <HowItWorks /* section={section}  */ />
        <What />
      </Box>
    </ThemeProvider>
  );
};

export default Home;
