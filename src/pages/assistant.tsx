import { Box, useMediaQuery } from "@mui/material";
import React, { useState } from "react";

import AssistantFooter from "@/components/assistant/AssistantFooter";
import Benefits from "@/components/assistant/Benefits";
import { AssistantHeroMemoized } from "@/components/assistant/Hero";
import Mechanism from "@/components/assistant/Mechanism";
import { ASSISTANT_MECHANISMS } from "@/components/assistant/mechanismItems";
import About from "@/components/home/sections/About";
import Systems from "@/components/home/sections/Systems";
import SearcherPupUp from "@/components/SearcherPupUp";

import AssistantHomeWrapper from "../components/assistant/AssistantHomeWrapper";
import Papers from "../components/home/sections/Papers";

/**
 * animations builded with: https://rive.app/
 */

export const SECTION_WITH_ANIMATION = 1;

// const observerOption: UseInViewProps = { options: { root: null, rootMargin: "-380px 0px -380px 0px", threshold: 0 } };

const Home = () => {
  // const [selectedSectionId, setSelectedSectionId] = useState("");

  // const { inView: mechanismInView, ref: MechanismSectionRef } = useInView(observerOption);
  // const { inView: benefitInView, ref: BenefitSectionRef } = useInView(observerOption);
  // const { inView: systemsInView, ref: SystemSectionRef } = useInView(observerOption);
  // const { inView: aboutInView, ref: AboutSectionRef } = useInView(observerOption);

  // const isScrolling = useRef(false);
  // const timer = useRef<NodeJS.Timeout | null>(null);

  // useEffect(() => {
  //   let newSelectedSectionId = "";
  //   if (mechanismInView) newSelectedSectionId = ONE_ASSISTANT_SECTIONS[1].id;
  //   if (benefitInView) newSelectedSectionId = ONE_ASSISTANT_SECTIONS[2].id;
  //   if (systemsInView) newSelectedSectionId = ONE_ASSISTANT_SECTIONS[3].id;
  //   if (aboutInView) newSelectedSectionId = ONE_ASSISTANT_SECTIONS[4].id;

  //   setSelectedSectionId(newSelectedSectionId);

  //   const newHash = newSelectedSectionId ? `#${newSelectedSectionId}` : "";
  //   if (window.location.hash === newHash) return;
  //   window.location.hash = newHash;
  // }, [aboutInView, benefitInView, mechanismInView, systemsInView]);

  const isMobile = useMediaQuery("(max-width:600px)");

  // const [openForm, setOpenForm] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  // const onSwitchSection = (newSelectedSectionId: string) => {
  //   isScrolling.current = true;
  //   if (timer.current) clearTimeout(timer.current);

  //   timer.current = setTimeout(() => {
  //     isScrolling.current = false;
  //     if (timer.current) clearTimeout(timer.current);
  //   }, 1000);

  //   setSelectedSectionId(newSelectedSectionId);
  //   const newHash = newSelectedSectionId ? `#${newSelectedSectionId}` : "";
  //   if (window.location.hash === newHash) return;
  //   window.location.hash = newHash;
  // };

  return (
    <Box
      id="ScrollableContainer"
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        scrollBehavior: "smooth",
        backgroundColor: theme => (theme.palette.mode === "dark" ? "#0A0D14" : "#FFFFFF"),
      }}
    >
      <AssistantHomeWrapper
        heroSectionChildren={<AssistantHeroMemoized />}
        mechanismtSectionChildren={<Mechanism mechanisms={ASSISTANT_MECHANISMS} />}
        benefitSectionChildren={<Benefits />}
        systemsSectionChildren={<Systems />}
        aboutectionChildren={
          <>
            <About />
            <Papers />
          </>
        }
      />

      {/* <AppHeaderMemoized
        page="ONE_ASSISTANT"
        sections={ONE_ASSISTANT_SECTIONS}
        selectedSectionId={selectedSectionId}
        onPreventSwitch={onSwitchSection}
      />

      <AssistantHeroMemoized />

      <SectionWrapper ref={MechanismSectionRef} section={ONE_ASSISTANT_SECTIONS[1]} textAlign="center">
        <Mechanism mechanisms={ASSISTANT_MECHANISMS} />
      </SectionWrapper>

      <SectionWrapper ref={BenefitSectionRef} section={ONE_ASSISTANT_SECTIONS[2]}>
        <Benefits />
      </SectionWrapper>

      <SectionWrapper ref={SystemSectionRef} section={ONE_ASSISTANT_SECTIONS[3]}>
        <Systems />
      </SectionWrapper>

      <SectionWrapper ref={AboutSectionRef} section={ONE_ASSISTANT_SECTIONS[4]}>
        <About />
        <Papers />
      </SectionWrapper> */}

      <AssistantFooter sx={{ px: { xs: "10px", lg: "0px" } }} />

      {openSearch && isMobile && <SearcherPupUp onClose={() => setOpenSearch(false)} />}

      <style>{`
          body{
            overflow:hidden;
          }
        `}</style>
    </Box>
  );
};

export default Home;
