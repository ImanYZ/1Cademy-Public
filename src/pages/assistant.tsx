import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, IconButton, Modal, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
// const ValuesMemoized = dynamic(() => import("../components/assistant/Why"), { suspense: true, ssr: false });
// const Which = dynamic(() => import("../components/home/views/Which"), { suspense: true, ssr: false });
// const WhoWeAre = dynamic(() => import("../components/home/views/WhoWeAre"), { suspense: true, ssr: false });
import React, { useEffect, useMemo, useState } from "react";

import AppHeader from "@/components/AppHeader";
import Benefits from "@/components/assistant/Benefits";
import { AssistantHeroMemoized } from "@/components/assistant/Hero";
import { ONE_ASSISTANT_SECTIONS } from "@/components/assistant/sections";
import { RiveComponentMemoized } from "@/components/home/components/temporals/RiveComponentExtended";
import SearcherPupUp from "@/components/SearcherPupUp";
import { useInView } from "@/hooks/useObserver";
import { useWindowSize } from "@/hooks/useWindowSize";

import AppFooter from "../components/AppFooter2"; // TODO: load with lazy load and observer when is required
import AssistantForm from "../components/assistant/AssistantRegister";
import HowItWorks from "../components/assistant/HowItWorks";
import { sectionsOrder } from "../components/assistant/sectionsOrder";

/**
 * animations builded with: https://rive.app/
 */

export const gray01 = "#28282a";
export const gray02 = "#202020";
export const gray03 = "#AAAAAA";

const artboards = [
  {
    name: "Planning",
    src: "rive-assistant/assistant-1.riv",
    artoboard: "artboard-1",
    getHeight: (vh: number) => 6 * vh,
    color: "#f33636",
    description:
      "The 1Cademy AI Assistant is a comprehensive scheduling tool that seamlessly integrates with your Google Calendar to optimize and automate the management of your tasks, meetings, and events. It is constantly aware of your changing schedule, adapts to changes in time and priority, and integrates with your Learning Management Systems to automatically schedule course-related deadlines and activities. It uses the Pomodoro technique to break down your study, practice, work, and exercise sessions into manageable blocks with brief breaks to improve your productivity and efficiency. Additionally, it employs scientifically proven cognitive psychology techniques such as Spacing and Interleaving to enhance your long-term learning and retention. With 1Cademy AI Assistant, you can improve your time management, stay on top of your tasks, and boost your learning outcomes, all in one convenient location. The assistant prioritizes your tasks and meetings based on your defined deadlines and priorities, and uses a color-coding system to help you quickly assess your progress and manage your time effectively.",
  },
  {
    name: "Meetings",
    src: "rive-assistant/assistant-2.riv",
    artoboard: "artboard-2",
    getHeight: (vh: number) => 8 * vh,
    color: "#f38b36",
    description: `The 1Cademy AI Assistant is aware of your dynamically changing schedule. When scheduling a one-to-one or group meeting, you simply provide the contact information of the individuals you wish to meet with. The assistant automatically contacts them, and requests that they specify their preferred time slots on a visual calendar of your availabilities, without disclosing any of your tasks or events to them. The assistant also sends reminders to the invitees in case they miss the original invitation. Once the invitees have specified their availabilities, the assistant identifies the most suitable time slots that work for the majority, sets it in your calendar, and sends out Google Calendar invitations to all the attendees. Furthermore, for both one-time and recurring meetings, the assistant can schedule a Google Meet or Zoom call based on your preference. Additionally, the assistant can attend the meeting, transcribe the conversation, and send out a report of the main topics discussed and the results of brainstorming to all the participants after the meeting.`,
  },
  {
    name: "Goals",
    src: "rive-assistant/assistant-3.riv",
    artoboard: "artboard-3",
    getHeight: (vh: number) => 15 * vh,
    color: "#e6f336",
    description: `The 1Cademy AI heroCanvasDimensionsAssistant is designed to help you make steady progress towards your goals and objectives, both personal and academic. It utilizes a unique point system to motivate you to form beneficial habits and recognize how these habits can improve your life. The assistant rewards you with badges for completing tasks and maintaining good habits, which serves as a visual representation of your progress. Additionally, it tracks your progress towards each goal, and provides you with personalized feedback and guidance to help you focus on areas where you need improvement and to remind you of your strengths. This way, the assistant helps you achieve a more balanced and well-rounded life, where you excel in all aspects.`,
  },
];

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
const footerOptions = { threshold: 0.5, root: null, rootMargin: "0px" };

const Home = () => {
  const theme = useTheme();

  const [sectionSelected, setSelectedSection] = useState(0);
  const isDesktop = useMediaQuery("(min-width:1200px)");
  const isMobile = useMediaQuery("(max-width:600px)");

  const [openForm, setOpenForm] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  const { inView: homeInView } = useInView();

  const { inView: footerInView, ref: footerSectionRef } = useInView({
    options: footerOptions,
  });

  const { width } = useWindowSize({ initialHeight: 1000, initialWidth: 0 });

  useEffect(() => {
    const hash = window?.location?.hash;
    if (!hash) return;

    const selectedSectionByUrl = sectionsTmp.findIndex(cur => `#${cur.id}` === hash);
    if (selectedSectionByUrl < 0) return;

    setSelectedSection(selectedSectionByUrl);
  }, []);

  const scrollAnimationMemoized = useMemo(() => {
    return (
      <Box
        sx={{
          position: "fixed",
          bottom: isMobile ? "0" : `calc(50vh - 50px)`,
          right: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        className={footerInView ? "hide" : "undefined"}
      >
        <Typography color={homeInView ? "white" : undefined}>Scroll</Typography>
        <Box sx={{ width: "50px", height: isMobile ? "70px" : "100px" }}>
          <RiveComponentMemoized
            src="rive/scroll.riv"
            animations={["Timeline 1", homeInView ? "dark" : theme.palette.mode === "dark" ? "dark" : "light"]}
            artboard={"New Artboard"}
            autoplay={true}
          />
        </Box>
      </Box>
    );
  }, [footerInView, homeInView, isMobile, theme.palette.mode]);

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
      <AppHeader
        sections={sectionsOrder}
        sectionSelected={sectionSelected}
        onClickSearcher={() => setOpenSearch(true)}
        switchSection={switchSection}
        enableApply={false}
        enableSignInUp={false}
        rightOptions={
          <Tooltip title="SIGN IN/UP">
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setOpenForm(true)}
              size={isMobile ? "small" : "medium"}
              sx={{
                fontSize: 16,
                ml: 2.5,
                borderRadius: 40,
                wordBreak: "normal",
                whiteSpace: "nowrap",
              }}
            >
              SIGN IN/UP
            </Button>
          </Tooltip>
        }
      />
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

            {idx === 0 && <HowItWorks artboards={artboards} />}
            {idx === 1 && <Benefits />}
            {/* {idx === 4 && <Topics />}
            {idx === 3 && <Systems />}
            {idx === 5 && <About />}
            {idx === 5 && <Papers />} */}
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

      <Box ref={footerSectionRef}>
        <AppFooter sx={{ px: isDesktop ? "0px" : "10px" }} />
      </Box>

      {openSearch && isMobile && <SearcherPupUp onClose={() => setOpenSearch(false)} />}

      {scrollAnimationMemoized}

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
