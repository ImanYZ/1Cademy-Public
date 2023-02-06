import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Modal, Typography, useMediaQuery } from "@mui/material";
// const ValuesMemoized = dynamic(() => import("../components/assistant/Why"), { suspense: true, ssr: false });
// const Which = dynamic(() => import("../components/home/views/Which"), { suspense: true, ssr: false });
// const WhoWeAre = dynamic(() => import("../components/home/views/WhoWeAre"), { suspense: true, ssr: false });
import React, { useEffect, useState } from "react";

import AppHeaderMemoized from "@/components/AppHeader2";
import AssistantFooter from "@/components/assistant/AssistantFooter";
import Benefits from "@/components/assistant/Benefits";
import { AssistantHeroMemoized } from "@/components/assistant/Hero";
import Mechanism from "@/components/assistant/Mechanism";
import { ASSISTANT_MECHANISMS } from "@/components/assistant/mechanismItems";
import { ONE_ASSISTANT_SECTIONS } from "@/components/assistant/sections";
import About from "@/components/home/sections/About";
import Systems from "@/components/home/sections/Systems";
import SearcherPupUp from "@/components/SearcherPupUp";
import { useWindowSize } from "@/hooks/useWindowSize";

import AssistantForm from "../components/assistant/AssistantRegister";
import Papers from "../components/home/sections/Papers";

/**
 * animations builded with: https://rive.app/
 */

export const gray01 = "#28282a";
export const gray02 = "#202020";
export const gray03 = "#AAAAAA";

export const SECTION_WITH_ANIMATION = 1;

const sectionsTmp = [
  {
    id: "Landing",
    title: "Home",
    simpleTitle: "Home",
    children: [],
    height: { xs: "0px", mb: "0px", sm: "0px", md: "0px", lg: "0px", xl: "0px" },
  },
  {
    id: "How1CademyAssistantWorks",
    title: "How 1Cademy Assistant works?",
    simpleTitle: "How?",
    children: [
      { id: "animation1", title: "Planning", simpleTitle: "Planning" },
      { id: "animation2", title: "Meetings", simpleTitle: "Meetings" },
      { id: "animation3", title: "Goals", simpleTitle: "Goals" },
    ],
    height: { xs: "auto", mb: "3079px", sm: "3063px", md: "3244px", lg: "3325px", xl: "3625px" },
  },
  {
    id: "Why1CademyAssistant",
    title: "Why 1Cademy Assistant?",
    simpleTitle: "Why?",
    children: [],
    height: { xs: "auto", mb: "6920px", sm: "5500", md: "5887px", lg: "5765px", xl: "5765px" },
  },
  {
    id: "WhichSection",
    title: "Which systems?",
    simpleTitle: "Which?",
    children: [],
    height: { xs: "auto", mb: "3190px", sm: "2955px", md: "2510px", lg: "2690px", xl: "2870px" },
  },
  {
    id: "WhoIsBehind1CademyAssistant",
    title: "Who's Behind 1Cademy Assistant?",
    simpleTitle: "Who?",
    children: [],
    height: { xs: "auto", mb: "2847px", sm: "2382px", md: "1303px", lg: "1203px", xl: "1203px" },
  },
];
// const footerOptions = { threshold: 0.5, root: null, rootMargin: "0px" };

const Home = () => {
  // const theme = useTheme();

  const [, /* sectionSelected */ setSelectedSection] = useState(0);
  const isDesktop = useMediaQuery("(min-width:1200px)");
  const isMobile = useMediaQuery("(max-width:600px)");

  const [openForm, setOpenForm] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  // const { inView: homeInView } = useInView();

  // const { inView: footerInView, ref: footerSectionRef } = useInView({
  //   options: footerOptions,
  // });

  const { width } = useWindowSize({ initialHeight: 1000, initialWidth: 0 });

  useEffect(() => {
    const hash = window?.location?.hash;
    if (!hash) return;

    const selectedSectionByUrl = sectionsTmp.findIndex(cur => `#${cur.id}` === hash);
    if (selectedSectionByUrl < 0) return;

    setSelectedSection(selectedSectionByUrl);
  }, []);

  // const scrollAnimationMemoized = useMemo(() => {
  //   return (
  //     <Box
  //       sx={{
  //         position: "fixed",
  //         bottom: isMobile ? "0" : `calc(50vh - 50px)`,
  //         right: "20px",
  //         display: "flex",
  //         flexDirection: "column",
  //         alignItems: "center",
  //       }}
  //       className={footerInView ? "hide" : "undefined"}
  //     >
  //       <Typography color={homeInView ? "white" : undefined}>Scroll</Typography>
  //       <Box sx={{ width: "50px", height: isMobile ? "70px" : "100px" }}>
  //         <RiveComponentMemoized
  //           src="rive/scroll.riv"
  //           animations={["Timeline 1", homeInView ? "dark" : theme.palette.mode === "dark" ? "dark" : "light"]}
  //           artboard={"New Artboard"}
  //           autoplay={true}
  //         />
  //       </Box>
  //     </Box>
  //   );
  // }, [footerInView, homeInView, isMobile, theme.palette.mode]);

  return (
    <Box
      id="ScrollableContainer"
      // onScroll={e => detectScrollPosition(e)}
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        scrollBehavior: "smooth",
        backgroundColor: theme => (theme.palette.mode === "dark" ? "#0A0D14" : "#FFFFFF"),
      }}
    >
      <AppHeaderMemoized page="ONE_ASSISTANT" sections={ONE_ASSISTANT_SECTIONS} />
      <AssistantHeroMemoized />
      {ONE_ASSISTANT_SECTIONS.slice(1).map((section, idx) => (
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
              <Typography sx={{ fontSize: "36px", mb: "20px", textTransform: "uppercase", fontWeight: 600 }}>
                {section.label}
              </Typography>
            </Box>

            {idx === 0 && <Mechanism mechanisms={ASSISTANT_MECHANISMS} />}
            {idx === 1 && <Benefits />}
            {idx === 2 && <Systems />}
            {idx === 3 && <About />}
            {idx === 3 && <Papers />}
          </Box>
        </Box>
      ))}
      <Modal open={openForm} onClose={() => setOpenForm(false)}>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            bgcolor: theme => (theme.palette.mode === "dark" ? "#28282ad3" : "#f8f8f8e3"),
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: width < 600 ? "flex-start" : "center",
          }}
        >
          <Box
            sx={{
              position: "relative",
              maxWidth: "900px",
              overflowY: "auto",
            }}
          >
            <IconButton onClick={() => setOpenForm(false)} sx={{ position: "absolute", top: "0px", right: "0px" }}>
              <CloseIcon />
            </IconButton>
            <Box>
              <AssistantForm onSuccessFeedback={() => setOpenForm(false)} />
            </Box>
          </Box>
        </Box>
      </Modal>

      <AssistantFooter sx={{ px: isDesktop ? "0px" : "10px" }} />

      {openSearch && isMobile && <SearcherPupUp onClose={() => setOpenSearch(false)} />}

      {/* {scrollAnimationMemoized} */}

      <style>{`
          body{
            overflow:hidden;
          }
        `}</style>
    </Box>
  );
};

export default Home;

// const advanceAnimationTo = (rive: Rive, timeInSeconds: number, theme?: any) => {
//   rive.scrub(theme.palette.mode === "dark" ? "dark" : "light", 1);

//   //@ts-ignore
//   if (!rive?.animator?.animations[0]) return;
//   //@ts-ignore
//   const Animator = rive.animator.animations[0];
//   Animator.instance.time = 0;
//   Animator.instance.advance(timeInSeconds);
//   Animator.instance.apply(1);
//   rive.startRendering();
// };
