import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Modal,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const ValuesMemoized = dynamic(() => import("../components/assistant/Why"), { suspense: true, ssr: false });
const Which = dynamic(() => import("../components/home/views/Which"), { suspense: true, ssr: false });
const WhoWeAre = dynamic(() => import("../components/home/views/WhoWeAre"), { suspense: true, ssr: false });

import dynamic from "next/dynamic";
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRive } from "rive-react";

import AppHeader from "@/components/AppHeader";
import { RiveComponentMemoized } from "@/components/home/components/temporals/RiveComponentExtended";
import SearcherPupUp from "@/components/SearcherPupUp";
import { useInView } from "@/hooks/useObserver";
import { useWindowSize } from "@/hooks/useWindowSize";

import backgroundImageDarkMode from "../../public/darkModeLibraryBackground.jpg";
import AppFooter from "../components/AppFooter2"; // TODO: load with lazy load and observer when is required
import AssistantForm from "../components/assistant/AssistantRegister";
import HowItWorks from "../components/assistant/HowItWorks";
import { sectionsOrder } from "../components/assistant/sectionsOrder";
import { MemoizedTableOfContent } from "../components/home/components/TableOfContent";
import CustomTypography from "../components/home/components/Typography";

/**
 * animations builded with: https://rive.app/
 */

const HEADER_HEIGTH = 70;
export const gray01 = "#28282a";
export const gray02 = "#202020";
export const gray03 = "#AAAAAA";

const section1ArtBoards = [
  {
    name: "artboard-1",
    // artoboard: "artboard-1",
    getHeight: (vh: number) => vh - HEADER_HEIGTH,
    // color: "#ff28c9",
  },
];
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
    description: `The 1Cademy AI Assistant is designed to help you make steady progress towards your goals and objectives, both personal and academic. It utilizes a unique point system to motivate you to form beneficial habits and recognize how these habits can improve your life. The assistant rewards you with badges for completing tasks and maintaining good habits, which serves as a visual representation of your progress. Additionally, it tracks your progress towards each goal, and provides you with personalized feedback and guidance to help you focus on areas where you need improvement and to remind you of your strengths. This way, the assistant helps you achieve a more balanced and well-rounded life, where you excel in all aspects.`,
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
    height: { xs: "auto", mb: "6744px", sm: "5661px", md: "5824px", lg: "5634px", xl: "5634px" },
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
  const [notSectionSwitching, setNotSectionSwitching] = useState(true);
  const isLargeDesktop = useMediaQuery("(min-width:1350px)");
  const isDesktop = useMediaQuery("(min-width:1200px)");
  const isMobile = useMediaQuery("(max-width:600px)");

  const isOnlyMobile = useMediaQuery("(min-width:375px) and (max-width:600px)");

  const [animationSelected, setSelectedAnimation] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  const { entry: homeEntry, inView: homeInView, ref: homeSectionRef } = useInView();
  const { entry: whyEntry, inViewOnce: whyInViewOnce, ref: whySectionRef } = useInView();
  const { entry: whichEntry, inViewOnce: whichInViewOnce, ref: whichSectionRef } = useInView();

  const { entry: whoEntry, inViewOnce: whoInViewOnce, ref: whoSectionRef } = useInView();
  const { inView: footerInView, ref: footerSectionRef } = useInView({
    options: footerOptions,
  });

  const { height, width } = useWindowSize({ initialHeight: 1000, initialWidth: 0 });
  const howSectionRef = useRef<HTMLDivElement | null>(null);

  const animationRefs = useRef<any | null>(null);

  const { RiveComponent: RiveComponent1 } = useRive({
    src: "rive-assistant/assistant-0.riv",
    artboard: "New Artboard",
    animations: ["Timeline 1", "eyes", "1cademy"],
    autoplay: true,
  });

  const heroCanvasDimensions = useMemo(() => {
    const min = width > height ? height : width;
    if (width < 600) return min - 20;
    if (width < 900) return min - 40;
    return min - 100;
  }, [width, height]);

  useEffect(() => {
    const hash = window?.location?.hash;
    if (!hash) return;

    const selectedSectionByUrl = sectionsTmp.findIndex(cur => `#${cur.id}` === hash);
    if (selectedSectionByUrl < 0) return;

    setSelectedSection(selectedSectionByUrl);
  }, []);

  const getSectionHeights = useCallback(() => {
    if (!homeEntry) return null;
    if (!howSectionRef?.current) return null;
    if (!whyEntry) return null;
    if (!whichEntry) return null;
    if (!whoEntry) return null;

    return [
      { id: homeEntry.target.id, height: 0 },
      { id: howSectionRef.current.id, height: homeEntry.target.clientHeight },
      { id: whyEntry.target.id, height: howSectionRef.current.clientHeight },
      { id: whichEntry.target.id, height: whyEntry.target.clientHeight },
      { id: whoEntry.target.id, height: whichEntry.target.clientHeight },
    ];
  }, [homeEntry, whichEntry, whoEntry, whyEntry]);

  const getSectionPositions = useCallback(() => {
    if (!homeEntry) return null;
    if (!howSectionRef?.current) return null;
    if (!whyEntry) return null;
    if (!whichEntry) return null;
    if (!whoEntry) return null;

    return [
      { id: homeEntry.target.id, height: homeEntry.target.clientHeight },
      { id: howSectionRef.current.id, height: howSectionRef.current.clientHeight },
      { id: whyEntry.target.id, height: whyEntry.target.clientHeight },
      { id: whichEntry.target.id, height: whichEntry.target.clientHeight },
      { id: whoEntry.target.id, height: whoEntry.target.clientHeight },
    ];
  }, [homeEntry, whichEntry, whoEntry, whyEntry]);

  const getAnimationsHeight = useCallback((heights: number[]) => {
    return [0, ...heights.splice(0, heights.length - 1)];
  }, []);

  const getAnimationsPositions = useCallback((heights: number[]) => {
    return heights;
  }, []);

  const scrollToSection = ({ height, sectionSelected }: { height: number; sectionSelected: any }) => {
    if (typeof window === "undefined") return;

    const scrollableContainer = window.document.getElementById("ScrollableContainer");
    if (!scrollableContainer) return;

    scrollableContainer.scroll({ top: height, left: 0, behavior: "smooth" });
    window.history.replaceState(null, sectionSelected.title, "#" + sectionSelected.id);
  };

  const detectScrollPosition = useCallback(
    (event: any) => {
      if (!animationRefs.current) return;
      if (notSectionSwitching) {
        const currentScrollPosition = event.target.scrollTop;
        const sectionsHeight = getSectionPositions();
        if (!sectionsHeight) return;

        const { min, idx: idxSection } = sectionsHeight.reduce(
          (acu, cur, idx) => {
            if (acu.max > currentScrollPosition) return acu;
            return { max: acu.max + cur.height, min: acu.max, idx };
          },
          { max: 0, min: 0, idx: -1 }
        );

        if (idxSection < 0) return;

        let animationsHeight = [];
        if (idxSection === 0) {
          animationsHeight = [section1ArtBoards[0].getHeight(height)];
        } else {
          const animationsHeightsArray = [
            animationRefs.current.getHeight1(),
            animationRefs.current.getHeight2(),
            animationRefs.current.getHeight3(),
          ];
          animationsHeight = getAnimationsPositions(animationsHeightsArray);
        }

        const { idxAnimation } = animationsHeight.reduce(
          (acu, cur, idx) => {
            if (acu.maxAnimation > currentScrollPosition) return acu;
            return { maxAnimation: acu.maxAnimation + cur, minAnimation: acu.maxAnimation, idxAnimation: idx };
          },
          { maxAnimation: min, minAnimation: min, idxAnimation: -1 }
        );

        const sectionSelected = sectionsTmp[idxSection];

        if (window.location.hash !== `#${sectionSelected.id}`) {
          window.history.replaceState(null, sectionSelected.title, "#" + sectionSelected.id);
        }
        setSelectedSection(idxSection);
        setSelectedAnimation(idxAnimation);
      }
    },
    [notSectionSwitching, getSectionPositions, height, getAnimationsPositions]
  );

  const switchSection = useCallback(
    (sectionIdx: number, animationIndex = -1) => {
      console.log("switch", animationRefs);
      if (!animationRefs.current) return;

      setNotSectionSwitching(false);
      const sectionsHeight = getSectionHeights();
      if (!sectionsHeight) return;

      const previousSections = sectionsHeight.slice(0, sectionIdx + 1);
      const sectionResult = previousSections.reduce((a, c) => ({ id: c.id, height: a.height + c.height }));

      let cumulativeAnimationHeight = 0;

      const animationsHeights = [
        animationRefs.current.getHeight1(),
        animationRefs.current.getHeight2(),
        animationRefs.current.getHeight3(),
      ];
      const animationsHeight = getAnimationsHeight(animationsHeights);
      if (animationsHeight) {
        if (animationIndex >= 0) {
          const animationSectionTitleHeight = 121;
          const previousAnimationHeight = animationsHeight.slice(0, animationIndex + 1);
          cumulativeAnimationHeight = previousAnimationHeight.reduce((a, c) => a + c, animationSectionTitleHeight);
        }
      }
      const cumulativeHeight = sectionResult.height + cumulativeAnimationHeight;
      scrollToSection({ height: cumulativeHeight, sectionSelected: sectionsOrder[sectionIdx] });

      setSelectedSection(sectionIdx);
      setSelectedAnimation(animationIndex);

      setTimeout(() => {
        setNotSectionSwitching(true);
      }, 1000);
    },
    [getAnimationsHeight, getSectionHeights]
  );

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
      onScroll={e => detectScrollPosition(e)}
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
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{ position: "absolute", top: height, bottom: "0px", left: "0px", minWidth: "10px", maxWidth: "180px" }}
        >
          <Box sx={{ position: "sticky", top: "100px", zIndex: 11 }}>
            <MemoizedTableOfContent
              menuItems={sectionsTmp}
              viewType={isLargeDesktop ? "COMPLETE" : isDesktop ? "NORMAL" : "SIMPLE"}
              onChangeContent={switchSection}
              sectionSelected={sectionSelected}
              animationSelected={animationSelected}
              sectionWithAnimation={SECTION_WITH_ANIMATION}
            />
          </Box>
        </Box>

        <Stack
          ref={homeSectionRef}
          spacing={width < 900 ? "10px" : "20px"}
          direction={"column"}
          alignItems={"center"}
          justifyContent="flex-end"
          sx={{
            height: "calc(100vh - 70px)",
            width: "100%",
            backgroundColor: "#1d1102",
            backgroundImage: `url(${backgroundImageDarkMode.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <Box sx={{ width: heroCanvasDimensions, height: heroCanvasDimensions }}>
            <RiveComponent1 className={`rive-canvas`} />
          </Box>
          <Typography
            color="white"
            variant="h5"
            sx={{ textAlign: "center", pb: "100px", width: isMobile ? "300px" : "auto" }}
          >
            HELPS YOU OPTIMIZE YOUR LIFE.
          </Typography>
        </Stack>

        <Box
          id={sectionsOrder[1].id}
          ref={howSectionRef}
          sx={{
            pb: 10,
            scrollMarginTop: "70px",
            height: {
              xs: isOnlyMobile ? sectionsTmp[1].height["mb"] : sectionsTmp[1].height["xs"],
              sm: sectionsTmp[1].height["sm"],
              md: sectionsTmp[1].height["md"],
              lg: sectionsTmp[1].height["lg"],
              xl: sectionsTmp[1].height["xl"],
              // border: "solid 2px pink",
            },
            width: "100%",
            maxWidth: { xs: isOnlyMobile ? "355px" : "100%", sm: "580px", md: "920px", lg: "980px" },
            margin: "auto",
            position: "relative",
          }}
        >
          <CustomTypography
            component={"h2"}
            variant="h1"
            marked="center"
            align="center"
            sx={{ pb: 10, pt: "20px", fontWeight: 700 }}
          >
            {sectionsOrder[1].title}
          </CustomTypography>
          <HowItWorks ref={animationRefs} artboards={artboards} />
        </Box>

        <Box
          id={sectionsOrder[2].id}
          ref={whySectionRef}
          sx={{
            py: 10,
            scrollMarginTop: "70px",
            height: {
              xs: isOnlyMobile ? sectionsTmp[2].height["mb"] : sectionsTmp[1].height["xs"],
              sm: sectionsTmp[2].height["sm"],
              md: sectionsTmp[2].height["md"],
              lg: sectionsTmp[2].height["lg"],
              xl: sectionsTmp[2].height["xl"],
            },
            width: "100%",
            maxWidth: { xs: isOnlyMobile ? "355px" : "100%", sm: "580px", md: "920px", lg: "980px" },
            margin: "auto",
            position: "relative",
            // border: "solid 2px pink",
          }}
        >
          <CustomTypography
            component={"h2"}
            variant="h1"
            marked="center"
            align="center"
            sx={{ pb: 10, fontWeight: 700 }}
          >
            {sectionsOrder[2].title}
          </CustomTypography>
          {!whyInViewOnce && <div style={{ height: 2 * height }}></div>}
          {whyInViewOnce && (
            <Suspense
              fallback={
                <Grid container spacing={2.5} alignItems="center">
                  {new Array(8).fill(0).map((a, i) => (
                    <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
                      <Skeleton
                        variant="rectangular"
                        height={210}
                        animation="wave"
                        sx={{ background: "#72727263", maxWidth: 340 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              }
            >
              <ValuesMemoized />
            </Suspense>
          )}
        </Box>
        <Box
          id={sectionsOrder[3].id}
          ref={whichSectionRef}
          sx={{
            py: 10,
            scrollMarginTop: "70px",
            height: {
              xs: isOnlyMobile ? sectionsTmp[3].height["mb"] : sectionsTmp[1].height["xs"],
              sm: sectionsTmp[3].height["sm"],
              md: sectionsTmp[3].height["md"],
              lg: sectionsTmp[3].height["lg"],
              xl: sectionsTmp[3].height["xl"],
            },
            width: "100%",
            maxWidth: { xs: isOnlyMobile ? "355px" : "100%", sm: "580px", md: "920px", lg: "980px" },
            margin: "auto",
            position: "relative",
            // border: "solid 2px pink",
          }}
        >
          <CustomTypography
            component={"h2"}
            variant="h1"
            marked="center"
            align="center"
            sx={{ pb: 10, fontWeight: 700 }}
          >
            {sectionsOrder[3].title}
          </CustomTypography>
          {!whichInViewOnce ? (
            <div style={{ height: 2 * height }}></div>
          ) : (
            <Suspense
              fallback={
                <Box
                  sx={{
                    pt: 7,
                    pb: 10,
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Skeleton variant="rectangular" height={800} animation="wave" sx={{ background: gray02 }} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Skeleton variant="rectangular" height={800} animation="wave" sx={{ background: gray02 }} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Skeleton variant="rectangular" height={800} animation="wave" sx={{ background: gray02 }} />
                    </Grid>
                  </Grid>
                </Box>
              }
            >
              <Which />
            </Suspense>
          )}
        </Box>

        <Box
          id={sectionsOrder[4].id}
          ref={whoSectionRef}
          sx={{
            py: 10,
            scrollMarginTop: "70px",
            height: {
              xs: isOnlyMobile ? sectionsTmp[4].height["mb"] : sectionsTmp[1].height["xs"],
              sm: sectionsTmp[4].height["sm"],
              md: sectionsTmp[4].height["md"],
              lg: sectionsTmp[4].height["lg"],
              xl: sectionsTmp[4].height["xl"],
            },
            // border: "solid 2px pink",
            width: "100%",
            maxWidth: { xs: isOnlyMobile ? "355px" : "100%", sm: "580px", md: "920px", lg: "980px" },
            margin: "auto",
            position: "relative",
          }}
        >
          <CustomTypography
            component={"h2"}
            variant="h1"
            marked="center"
            align="center"
            sx={{ pb: 10, fontWeight: 700 }}
          >
            {sectionsOrder[4].title}
          </CustomTypography>
          {!whoInViewOnce ? (
            <div style={{ height: 2 * height }}></div>
          ) : (
            <Suspense
              fallback={
                <Box
                  sx={{
                    pt: 7,
                    pb: 10,
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Skeleton variant="rectangular" height={800} animation="wave" sx={{ background: gray02 }} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Skeleton variant="rectangular" height={800} animation="wave" sx={{ background: gray02 }} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Skeleton variant="rectangular" height={800} animation="wave" sx={{ background: gray02 }} />
                    </Grid>
                  </Grid>
                </Box>
              }
            >
              <WhoWeAre />
            </Suspense>
          )}
        </Box>
      </Box>
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
