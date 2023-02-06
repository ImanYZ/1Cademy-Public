import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";

import AppFooter3 from "@/components/AppFooter3";
import Benefits from "@/components/home/sections/Benefits";
import { getStats } from "@/lib/knowledgeApi";

import { AppHeaderMemoized, HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from "../components/AppHeader2";
import { SectionWrapper } from "../components/home/components/SectionWrapper";
import UniversitiesMap from "../components/home/components/UniversitiesMap/UniversitiesMap";
import About from "../components/home/sections/About";
import Join from "../components/home/sections/Join";
import Magnitude from "../components/home/sections/Magnitude";
import Mechanism, { MECHANISM_ITEMS } from "../components/home/sections/Mechanism";
import Papers from "../components/home/sections/Papers";
import Systems from "../components/home/sections/Systems";
import Topics from "../components/home/sections/Topics";
import { ONE_CADEMY_SECTIONS } from "../components/home/SectionsItems";
import { HeroMemoized } from "../components/home/views/Hero";
import { useInView, UseInViewProps } from "../hooks/useObserver";

export const gray01 = "#28282a";
export const gray02 = "#202020";
export const gray03 = "#AAAAAA";
export const gray25 = "#FCFCFD";
export const gray50 = "#F9FAFB";
export const gray100 = "#F2F4F7";
export const gray200 = "#EAECF0";
export const gray300 = "#D0D5DD";
export const gray600 = "#475467";
export const gray700 = "#344054";
export const gray800 = "#1D2939";
export const gray900 = "#0A0D14";
export const orangeDark = "#FF6D00";
export const orangeLight = "#FF6D00";
export const orange900 = "#E56200";

const observerOption: UseInViewProps = { options: { root: null, rootMargin: "-380px 0px -380px 0px", threshold: 0 } };

/**
 * animations builded with: https://rive.app/
 */

export const Home = () => {
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const { data: stats } = useQuery("stats", getStats);

  const { inView: mechanismInView, ref: MechanismSectionRef } = useInView(observerOption);
  const { inView: magnitudeInView, ref: MagnitudeSectionRef } = useInView(observerOption);
  const { inView: benefitInView, ref: BenefitSectionRef } = useInView(observerOption);
  const { inView: topicsInView, ref: TopicsSectionRef } = useInView(observerOption);
  const { inView: systemsInView, ref: SystemSectionRef } = useInView(observerOption);
  const { inView: aboutInView, ref: AboutSectionRef } = useInView(observerOption);

  useEffect(() => {
    let newSelectedSectionId = "";
    if (mechanismInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[1].id;
    if (magnitudeInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[2].id;
    if (benefitInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[3].id;
    if (topicsInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[4].id;
    if (systemsInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[5].id;
    if (aboutInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[6].id;

    setSelectedSectionId(newSelectedSectionId);

    const newHash = newSelectedSectionId ? `#${newSelectedSectionId}` : "";
    if (window.location.hash === newHash) return;
    window.location.hash = newHash;
  }, [mechanismInView, magnitudeInView, benefitInView, topicsInView, systemsInView, aboutInView]);

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
      <AppHeaderMemoized page="ONE_CADEMY" sections={ONE_CADEMY_SECTIONS} selectedSectionId={selectedSectionId} />

      <HeroMemoized headerHeight={HEADER_HEIGHT} headerHeightMobile={HEADER_HEIGHT_MOBILE} />

      <SectionWrapper ref={MechanismSectionRef} section={ONE_CADEMY_SECTIONS[1]} textAlign="center">
        <Mechanism mechanisms={MECHANISM_ITEMS} />
      </SectionWrapper>

      <SectionWrapper ref={MagnitudeSectionRef} section={ONE_CADEMY_SECTIONS[2]} stats={stats}>
        <Magnitude />
        <UniversitiesMap theme={"Dark"} />
      </SectionWrapper>

      <SectionWrapper ref={BenefitSectionRef} section={ONE_CADEMY_SECTIONS[3]}>
        <Benefits />
      </SectionWrapper>

      <SectionWrapper ref={TopicsSectionRef} section={ONE_CADEMY_SECTIONS[4]}>
        <Topics />
      </SectionWrapper>

      <SectionWrapper ref={SystemSectionRef} section={ONE_CADEMY_SECTIONS[5]}>
        <Systems />
      </SectionWrapper>

      <SectionWrapper ref={AboutSectionRef} section={ONE_CADEMY_SECTIONS[6]}>
        <About />
        <Papers />
      </SectionWrapper>

      <Box sx={{ py: { xs: "64px", sm: "96px" }, maxWidth: "1216px", m: "auto" }}>
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
