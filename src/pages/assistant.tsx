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
    // description: `We gather valuable information from various sources such as books, articles, and videos, and divide it into granular pieces. We then combine these pieces into concise notes that focus on a single concept. \nTraditional note-taking methods often only benefit the individual for a short period of time, typically for a semester or two. 1Cademy's collaborative note-taking approach ensures that the notes are useful and usable for multiple students studying the same topics. \nThrough this process, we aim to improve the notes semester by semester, making the learning experience more efficient for all. This way, students can spend less time on note-taking and gain the most benefit from the notes.`,
  },
];
const artboards = [
  {
    name: "Planning",
    src: "rive-assistant/assistant-1.riv",
    artoboard: "artboard-1",
    getHeight: (vh: number) => 6 * vh,
    color: "#f33636",
    description: `We gather valuable information from various sources such as books, articles, and videos, and divide it into granular pieces. We then combine these pieces into concise notes that focus on a single concept. \nTraditional note-taking methods often only benefit the individual for a short period of time, typically for a semester or two. 1Cademy's collaborative note-taking approach ensures that the notes are useful and usable for multiple students studying the same topics. \nThrough this process, we aim to improve the notes semester by semester, making the learning experience more efficient for all. This way, students can spend less time on note-taking and gain the most benefit from the notes.`,
  },
  {
    name: "Meetings",
    src: "rive-assistant/assistant-2.riv",
    artoboard: "artboard-2",
    getHeight: (vh: number) => 8 * vh,
    color: "#f38b36",
    description: `We gather valuable information from various sources such as books, articles, and videos, and divide it into granular pieces. We then combine these pieces into concise notes that focus on a single concept. \nTraditional note-taking methods often only benefit the individual for a short period of time, typically for a semester or two. 1Cademy's collaborative note-taking approach ensures that the notes are useful and usable for multiple students studying the same topics. \nThrough this process, we aim to improve the notes semester by semester, making the learning experience more efficient for all. This way, students can spend less time on note-taking and gain the most benefit from the notes.`,
  },
  {
    name: "Goals",
    src: "rive-assistant/assistant-3.riv",
    artoboard: "artboard-3",
    getHeight: (vh: number) => 15 * vh,
    color: "#e6f336",
    description: `We gather valuable information from various sources such as books, articles, and videos, and divide it into granular pieces. We then combine these pieces into concise notes that focus on a single concept. \nTraditional note-taking methods often only benefit the individual for a short period of time, typically for a semester or two. 1Cademy's collaborative note-taking approach ensures that the notes are useful and usable for multiple students studying the same topics. \nThrough this process, we aim to improve the notes semester by semester, making the learning experience more efficient for all. This way, students can spend less time on note-taking and gain the most benefit from the notes.`,
  },
];

export const SECTION_WITH_ANIMATION = 1;

const sectionsTmp = [
  { id: "Landing", title: "Home", simpleTitle: "Home", children: [] },
  {
    id: "How1CademyAssistantWorks",
    title: "How 1Cademy Assistant works?",
    simpleTitle: "How?",
    children: [
      { id: "animation1", title: "Planning", simpleTitle: "Planning" },
      { id: "animation2", title: "Meetings", simpleTitle: "Meetings" },
      { id: "animation3", title: "Goals", simpleTitle: "Goals" },
    ],
  },
  { id: "Why1CademyAssistant", title: "Why 1Cademy Assistant?", simpleTitle: "Why?", children: [] },
  { id: "WhichSection", title: "Which systems?", simpleTitle: "Which?", children: [] },
  { id: "WhoIsBehind1CademyAssistant", title: "Who's Behind 1Cademy Assistant?", simpleTitle: "Who?", children: [] },
];
const footerOptions = { threshold: 0.5, root: null, rootMargin: "0px" };

const Home = () => {
  const theme = useTheme();

  const [sectionSelected, setSelectedSection] = useState(0);
  const [notSectionSwitching, setNotSectionSwitching] = useState(true);
  const [, /* idxRiveComponent */ setIdxRiveComponent] = useState(0);
  const isLargeDesktop = useMediaQuery("(min-width:1350px)");
  const isDesktop = useMediaQuery("(min-width:1200px)");
  const isMobile = useMediaQuery("(max-width:600px)");
  const [showLandingOptions, setShowLandingOptions] = useState(true);
  // const [/* showAnimationOptions, */ setShowAnimationOptions] = useState(false);
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
  // const HomeSectionRef = useRef<HTMLDivElement | null>(null);
  const howSectionRef = useRef<HTMLDivElement | null>(null);
  // const timeInSecondsRef = useRef<number>(0);

  const animationRefs = useRef<any | null>(null);

  const { RiveComponent: RiveComponent1 } = useRive({
    src: "rive-assistant/assistant-0.riv",
    artboard: "New Artboard",
    animations: ["Timeline 1", "eyes", "1cademy"],
    autoplay: true,
  });

  // const { rive: rive2 } = useRive({
  //   src: "rive-assistant/assistant-1.riv",
  //   artboard: "artboard-1",
  //   animations: ["Timeline 1", "dark", "light"],
  //   autoplay: false,
  // });

  // const { rive: rive3 } = useRive({
  //   src: "rive-assistant/assistant-2.riv",
  //   artboard: "artboard-2",
  //   animations: ["Timeline 1", "dark", "light"],
  //   autoplay: false,
  // });

  // const { rive: rive4 } = useRive({
  //   src: "rive-assistant/assistant-3.riv",
  //   artboard: "artboard-3",
  //   animations: ["Timeline 1", "dark", "light"],
  //   autoplay: false,
  // });

  const heroCanvasDimensions = useMemo(() => {
    const min = width > height ? height : width;
    if (width < 600) return min - 20;
    if (width < 900) return min - 40;
    return min - 100;
  }, [width, height]);

  // useEffect(() => {
  //   if (!rive1 || !rive2 || !rive3 || !rive4) return;

  //   advanceAnimationTo(rive1, timeInSecondsRef.current, theme);
  //   advanceAnimationTo(rive2, timeInSecondsRef.current, theme);
  //   advanceAnimationTo(rive3, timeInSecondsRef.current, theme);
  //   advanceAnimationTo(rive4, timeInSecondsRef.current, theme);
  // }, [rive1, rive2, rive3, rive4, theme]);

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

  // const getAnimationsHeight = useCallback(() => {
  //   const res = artboards.map(artboard => artboard.getHeight(height));
  //   return [0, ...res.splice(0, res.length - 1)];
  // }, [height]);

  const getAnimationsHeight = useCallback((heights: number[]) => {
    // const res = artboards.map(artboard => artboard.getHeight(height));
    return [0, ...heights.splice(0, heights.length - 1)];
  }, []);

  // const getAnimationsPositions = useCallback(() => {
  //   return artboards.map(artboard => artboard.getHeight(height));
  // }, [height]);

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

        const { /* maxAnimation, minAnimation, */ idxAnimation } = animationsHeight.reduce(
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

        // let showLandingOptions = false;

        // if (idxAnimation < 0) return;

        // if (idxSection === 0) {
        //   const lowerAnimationLimit = minAnimation;
        //   const upperAnimationLimit = maxAnimation;
        //   const rangeFrames = upperAnimationLimit - lowerAnimationLimit;
        //   const positionFrame = currentScrollPosition - lowerAnimationLimit;
        //   const percentageFrame = (positionFrame * 100) / rangeFrames;
        //   setIdxRiveComponent(0);

        //   if (percentageFrame < 5) {
        //     showLandingOptions = true;
        //   }
        // }

        // if (idxSection === SECTION_WITH_ANIMATION) {
        //   // console.log("section with aniomation");
        //   setIdxRiveComponent(idxAnimation + 1);
        //   const lowerAnimationLimit = minAnimation;
        //   const upperAnimationLimit = maxAnimation;
        //   const rangeFrames = upperAnimationLimit - lowerAnimationLimit;
        //   const positionFrame = currentScrollPosition - lowerAnimationLimit;
        //   const percentageFrame = (positionFrame * 100) / rangeFrames;

        //   const timeInSeconds = (artboards[idxAnimation].durationMs * percentageFrame) / (1000 * 100);
        //   timeInSecondsRef.current = timeInSeconds;

        //   if (idxAnimation === 0) {
        //     advanceAnimationTo(rive2, timeInSeconds, theme);
        //   }
        //   if (idxAnimation === 1) {
        //     advanceAnimationTo(rive3, timeInSeconds, theme);
        //   }
        //   if (idxAnimation === 2) {
        //     advanceAnimationTo(rive4, timeInSeconds, theme);
        //   }
      }
      // setShowLandingOptions(showLandingOptions);
      // }
    },
    [notSectionSwitching, getSectionPositions, height, getAnimationsPositions]
  );

  const switchSection = useCallback(
    (sectionIdx: number, animationIndex = -1) => {
      console.log("switch", animationRefs);
      if (!animationRefs.current) return;
      // if (!rive2 || !rive3 || !rive4) return;

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
        // animationRefs.current.getHeight4(),
        // animationRefs.current.getHeight5(),
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

      if (sectionIdx === 0) {
        setShowLandingOptions(true);
        setIdxRiveComponent(animationIndex);
      }
      // if (sectionIdx === SECTION_WITH_ANIMATION) {
      //   setIdxRiveComponent(animationIndex + 1);
      //   // reset animation when jump through sections
      //   if (animationIndex === 0) {
      //     rive2.scrub("Timeline 1", 0);
      //   }
      //   if (animationIndex === 1) {
      //     rive3.scrub("Timeline 1", 0);
      //   }
      //   if (animationIndex === 2) {
      //     rive4.scrub("Timeline 1", 0);
      //   }
      // }

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
          right: "0px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        className={footerInView ? "hide" : "undefined"}
      >
        <Typography color={homeInView ? "white" : undefined}>Scroll</Typography>
        <Box sx={{ width: isMobile ? "50px" : "80px", height: isMobile ? "70px" : "100px" }}>
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
      {/* <Box
        component={"header"}
        sx={{ position: "sticky", width: "100%", top: "0px", zIndex: 12, display: "flex", justifyContent: "center" }}
      >
        <Box
          sx={{
            height: HEADER_HEIGTH,
            width: "100%",
            background: theme => (theme.palette.mode === "dark" ? "rgba(0,0,0,.72)" : "#f8f8f894"),
            backdropFilter: "saturate(180%) blur(20px)",
          }}
        />
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          spacing={isMobile ? "20px" : "30px"}
          sx={{
            width: "100%",
            maxWidth: "1200px",
            height: HEADER_HEIGTH,
            px: isDesktop ? "0px" : "10px",
            position: "absolute",
          }}
        >
          <Stack
            spacing={isDesktop ? "30px" : "20px"}
            alignItems={"center"}
            justifyContent={"space-between"}
            direction={"row"}
            sx={{ color: "#f8f8f8" }}
          >
            <img src={LogoDarkMode.src} alt="logo" width="45px" height={"45px"} />

            {isTablet && (
              <>
                {sectionsOrder.slice(1).map((cur, idx) => (
                  <Tooltip key={cur.id} title={cur.title}>
                    <Typography
                      sx={{
                        cursor: "pointer",
                        borderBottom: theme =>
                          sectionSelected === idx + 1 ? `solid 2px ${theme.palette.common.orange}` : undefined,
                      }}
                      onClick={() => switchSection(idx + 1)}
                    >
                      {sectionsOrder[idx + 1].label}
                    </Typography>
                  </Tooltip>
                ))}
              </>
            )}
          </Stack>
          {!isMobile && (
            <AppHeaderSearchBar
              searcherUrl={"search"}
              sx={{
                color: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black,
              }}
            />
          )}
          <Stack direction={"row"} alignItems="center" spacing={isDesktop ? "20px" : "10px"}>
            {isMobile && (
              <Tooltip title="Open Searcher">
                <IconButton onClick={() => setOpenSearch(true)}>
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            )}
            <FormGroup>
              <ThemeSwitcher onClick={e => handleThemeSwitch(e)} checked={theme.palette.mode === "dark"} />
            </FormGroup>

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
          </Stack>
        </Stack>
      </Box> */}
      <AppHeader
        sections={sectionsOrder}
        sectionSelected={sectionSelected}
        onClickSearcher={setOpenSearch}
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
            className={showLandingOptions ? "show-blurred-text" : "hide-content"}
          >
            HELPS YOU OPTIMIZE YOUR LIFE.
          </Typography>
        </Stack>

        <Box sx={{ width: "100%", maxWidth: "980px", px: isDesktop ? "0px" : "10px", margin: "auto" }}>
          <Box id={sectionsOrder[1].id} ref={howSectionRef} sx={{ pb: 10 }}>
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
            {/* <Box sx={{ position: "relative", width: "inherit", height: "inherit" }}>
                <RiveComponent1 className={`rive-canvas ${idxRiveComponent !== 0 ? "rive-canvas-hidden" : ""}`} />
                <RiveComponent2 className={`rive-canvas ${idxRiveComponent !== 1 ? "rive-canvas-hidden" : ""}`} />
                <RiveComponent3 className={`rive-canvas ${idxRiveComponent !== 2 ? "rive-canvas-hidden" : ""}`} />
                <RiveComponent4 className={`rive-canvas ${idxRiveComponent !== 3 ? "rive-canvas-hidden" : ""}`} />
              </Box> */}
          </Box>

          <Box id={sectionsOrder[2].id} ref={whySectionRef} sx={{ py: 10 }}>
            <CustomTypography
              component={"h2"}
              variant="h1"
              marked="center"
              align="center"
              sx={{ pb: 10, fontWeight: 700 }}
            >
              {sectionsOrder[2].title}
            </CustomTypography>
            {!whyInViewOnce && <div style={{ height: 2 * height /* background: "red" */ }}></div>}
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
          <Box id={sectionsOrder[3].id} ref={whichSectionRef} sx={{ py: 10 }}>
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
              <div style={{ height: 2 * height /* background: "pink" */ }}></div>
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

          <Box id={sectionsOrder[4].id} ref={whoSectionRef} sx={{ py: 10 }}>
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
              <div style={{ height: 2 * height /* background: "pink" */ }}></div>
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
      </Box>
      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        // aria-labelledby="modal-modal-title"
        // aria-describedby="modal-modal-description"
        sx={
          {
            // backdropFilter: "blur(4px)",
          }
        }
      >
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

              // position: "absolute",
              // top: "0px",
              // left: "0px",
              // right:"0px",
              // bottom:"0px",
              // transform: "translate(-50%, -50%)",
            }}
          >
            <IconButton onClick={() => setOpenForm(false)} sx={{ position: "absolute", top: "0px", right: "0px" }}>
              <CloseIcon />
            </IconButton>
            <Stack spacing={"20px"} /* direction={width < 1200 ? "column" : "row"} */ sx={{ p: "20px" }}>
              {/* <Box
              sx={{
                maxWidth: "500px",
                p: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src="assistant/robot.png" alt="" srcSet="" />
            </Box> */}
              <AssistantForm onSuccessFeedback={() => setOpenForm(false)} />
            </Stack>
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
    // </ThemeProvider>
  );
};

// Home.getLayout = (page: ReactNode) => {
//   return <PublicLayout>{page}</PublicLayout>;
// };

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
