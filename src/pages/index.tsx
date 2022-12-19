/* eslint-disable */
import PublicLayout from "@/components/layouts/PublicLayout";
import { ComponentType, ReactNode, useMemo, useRef, useState } from "react";
import { useRive } from "@rive-app/react-canvas";
import { NextPageWithLayout } from "src/knowledgeTypes";
import sectionsOrder from "@/components/home/sectionsOrder";
import { Box, Button, ThemeProvider, Tooltip } from "@mui/material";
import Landing from "@/components/home/Landing";
import AppHeaderNavbar from "@/components/AppHeaderNavbar";

export const HowItWorks: ComponentType<any> = dynamic(
  () => import("@/components/home/HowItWorks").then(m => m.default),
  {
    ssr: false,
  }
);

import What from "@/components/home/What";
import Values from "@/components/home/Values";

export const UniversitiesMap: ComponentType<any> = dynamic(
  () => import("@/components/home/UniversitiesMap/UniversitiesMap").then(m => m.default),
  {
    ssr: false,
  }
);

import WhoWeAre from "@/components/home/WhoWeAre";

import JoinUs from "@/components/home/JoinUs";
import AppFooter from "@/components/home/AppFooter";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { brandingLightTheme } from "@/lib/theme/brandingTheme";

const artboards = [
  { name: "animation1", durationMs: 5000 },
  { name: "animation2", durationMs: 30000 },
  { name: "animation3", durationMs: 8000 },
  { name: "animation4", durationMs: 22000 },
  { name: "animation5", durationMs: 13000 },
  { name: "animation6", durationMs: 3000 },
];

const Index: NextPageWithLayout = () => {
  const [showMenu, setShowMenu] = useState(false);
  const onCloseMenu = () => setShowMenu(false);
  const onShowMenu = () => setShowMenu(true);
  const [{ isAuthenticated }] = useAuth();

  const [section, setSection] = useState(0);
  const [notSectionSwitching, setNotSectionSwitching] = useState(true);

  const { rive, RiveComponent } = useRive({
    src: "gg.riv",
    stateMachines: artboards[0].name,
    autoplay: false,
  });

  const sectionAnimationControllerRef = useRef<any>(null);
  const section1Ref = useRef<any>(null);
  const section2Ref = useRef<any>(null);
  const section3Ref = useRef<any>(null);
  const section4Ref = useRef<any>(null);
  const section5Ref = useRef<any>(null);
  const section6Ref = useRef<any>(null);

  const onScrollAnimation = (target: any) => {
    const scrollOffset = target.scrollTop;
    const scrollTotal = target.scrollHeight - window.innerHeight;
    const percentage = (100 * scrollOffset) / scrollTotal;
    // setScrollPercentage(percentage)

    if (!section1Ref.current) return;
    if (!section2Ref.current) return;
    if (!section3Ref.current) return;
    if (!section4Ref.current) return;
    if (!section5Ref.current) return;
    if (!section6Ref.current) return;
    if (!rive) return;

    // const pageHeight = target.scrollHeight
    const section1Height = section1Ref.current.clientHeight;
    const section2Height = section2Ref.current.clientHeight;
    const section3Height = section3Ref.current.clientHeight;
    const section4Height = section4Ref.current.clientHeight;
    const section5Height = section5Ref.current.clientHeight;
    const section6Height = section6Ref.current.clientHeight;

    const sectionsHeight = [
      section1Height,
      section2Height,
      section3Height,
      section4Height,
      section5Height,
      section6Height,
    ];
    const animationSectionIndex = 1;

    const { index, cumulativeHeight } = sectionsHeight.reduce(
      (acu, cur, idx) => {
        if (acu.index >= 0) return acu;
        const newCumulativeHeight = acu.cumulativeHeight + cur;
        if (scrollOffset < newCumulativeHeight) return { cumulativeHeight: newCumulativeHeight, index: idx };
        return { ...acu, cumulativeHeight: newCumulativeHeight };
      },
      { cumulativeHeight: 0, index: -1 }
    );

    if (index < 0) return Error("cant detect current` section");

    if (index < animationSectionIndex) {
      // show first artboard and first frame
      rive.reset({ artboard: artboards[0].name });
      rive.scrub("Timeline 1", 0);
    }
    if (index > animationSectionIndex) {
      // show last artboard and last frame
      rive.reset({ artboard: artboards[artboards.length - 1].name });
      rive.scrub("Timeline 1", artboards[artboards.length - 1].durationMs / 1000);
    }
    if (index === animationSectionIndex) {
      // check local percentage
      const lowerLimit = cumulativeHeight - sectionsHeight[animationSectionIndex];
      const upperLimit = cumulativeHeight;

      const rangeAnimation = upperLimit - lowerLimit;
      const positionAnimation = scrollOffset - lowerLimit;
      const percentageAnimation = (positionAnimation * 100) / rangeAnimation;

      if (!sectionAnimationControllerRef.current) return;

      const animation1Height = sectionAnimationControllerRef.current.getAnimation1Height();
      const animation2Height = sectionAnimationControllerRef.current.getAnimation2Height();
      const animation3Height = sectionAnimationControllerRef.current.getAnimation3Height();
      const animation4Height = sectionAnimationControllerRef.current.getAnimation4Height();
      const animation5Height = sectionAnimationControllerRef.current.getAnimation5Height();
      const animation6Height = sectionAnimationControllerRef.current.getAnimation6Height();

      const animationsHeight = [
        animation1Height,
        animation2Height,
        animation3Height,
        animation4Height,
        animation5Height,
        animation6Height,
      ];

      const { indexAnimation, cumulativeAnimationHeight } = animationsHeight.reduce(
        (acu, cur, idx) => {
          if (acu.indexAnimation >= 0) return acu;
          const cumulativeAnimationHeight = acu.cumulativeAnimationHeight + cur;
          // console.log(1, { acu })
          // console.log(2, '<', { scrollOffset, cumulativeAnimationHeight })
          if (scrollOffset < cumulativeAnimationHeight) return { cumulativeAnimationHeight, indexAnimation: idx };
          return { ...acu, cumulativeAnimationHeight };
        },
        { cumulativeAnimationHeight: lowerLimit, indexAnimation: -1 }
      );

      if (indexAnimation < 0) return Error("cant detect current animation");

      const lowerAnimationLimit = cumulativeAnimationHeight - animationsHeight[indexAnimation];
      const upperAnimationLimit = cumulativeAnimationHeight;

      const rangeFrames = upperAnimationLimit - lowerAnimationLimit;
      const positionFrame = scrollOffset - lowerAnimationLimit;
      const percentageFrame = (positionFrame * 100) / rangeFrames;

      rive.reset({ artboard: artboards[indexAnimation].name });
      const timeInSeconds = ((artboards[indexAnimation].durationMs / 1000) * percentageFrame) / 100;
      rive.scrub("Timeline 1", timeInSeconds);
      // setFramePercentage(percentageFrame)
    }
  };

  const RiveComponentMemo = useMemo(() => {
    return (
      <RiveComponent
        // onMouseEnter={() => rive && rive.play()}
        // onMouseLeave={() => rive && rive.pause()}
        className="rive-canvas"
      />
    );
  }, []);

  const updatePosition = (e: any) => {
    onScrollAnimation(e.currentTarget);

    const _document: any = window.document;

    if (notSectionSwitching) {
      let cumulativeHeight = 0;
      for (let sIdx = 0; sIdx < sectionsOrder.length; sIdx++) {
        const sectOffsetHeight = _document.getElementById(sectionsOrder[sIdx].id).scrollHeight;
        cumulativeHeight += sectOffsetHeight;
        if (e.target.scrollTop < cumulativeHeight) {
          setSection(sIdx - 1);
          window.history.replaceState(null, sectionsOrder[sIdx].title, "#" + sectionsOrder[sIdx].id);
          break;
        }
      }
    }
  };

  const switchSection = (newValue: number) => (e: any) => {
    setNotSectionSwitching(false);
    setSection(newValue);
    const _document: any = window.document;

    let cumulativeHeight = 0;
    for (let sIdx = -1; sIdx < newValue; sIdx++) {
      const sectOffsetHeight = _document.getElementById(sectionsOrder[sIdx + 1].id).scrollHeight;
      cumulativeHeight += sectOffsetHeight;
    }
    _document.getElementById("ScrollableContainer").scroll({
      top: cumulativeHeight,
      left: 0,
      behavior: "smooth",
    });
    window.history.replaceState(null, sectionsOrder[newValue + 1].title, "#" + sectionsOrder[newValue + 1].id);
    setTimeout(() => {
      setNotSectionSwitching(true);
    }, 1000);
  };

  const joinUsClick = (e: any) => {
    e.preventDefault();
    switchSection(sectionsOrder.length - 2)(e);
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
          position: "relative",
        }}
      >
        <AppHeaderNavbar
          showMenu={showMenu}
          onCloseMenu={onCloseMenu}
          onShowMenu={onShowMenu}
          showSearch={false}
          isSignedIn={isAuthenticated}
        />
        <Box id="step-0" ref={section1Ref}>
          <Landing />
        </Box>
        <Box ref={section2Ref} sx={{ background: "yellow" }}>
          <HowItWorks section={section} riveComponent={RiveComponentMemo} ref={sectionAnimationControllerRef} />
        </Box>
        <Box ref={section3Ref}>
          <What />
        </Box>
        <Box ref={section4Ref}>
          <Values />
        </Box>
        <UniversitiesMap theme={"Light"} />
        <Box ref={section5Ref}>
          <WhoWeAre />
        </Box>
        <Box ref={section6Ref}>
          <JoinUs />
        </Box>
        <AppFooter />
      </Box>
    </ThemeProvider>
  );
};

Index.getLayout = (page: ReactNode) => {
  return <PublicLayout>{page}</PublicLayout>;
};
export default Index;
/* eslint-enable */
