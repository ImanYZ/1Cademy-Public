import { Box } from "@mui/material";
import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";

import { useInView, UseInViewProps } from "../../hooks/useObserver";
import { getStats } from "../../lib/knowledgeApi";
import AppHeaderMemoized, { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from "../Header/AppHeader";
import { SectionWrapper } from "./components/SectionWrapper";
import { HeroMemoized } from "./sections/Hero";
import { ONE_CADEMY_SECTIONS } from "./SectionsItems";

const observerOption: UseInViewProps = { options: { root: null, rootMargin: "-480px 0px -380px 0px", threshold: 0 } };

type HomeWrapperProps = {
  mechanismSectionChildren: ReactNode;
  magnitudeSectionChildren: ReactNode;
  benefitSectionChildren: ReactNode;
  topicsSectionChildren: ReactNode;
  systemSectionChildren: ReactNode;
  aboutSectionChildren: ReactNode;
  applySectionChildren: ReactNode;
};

const HomeWrapper = ({
  mechanismSectionChildren,
  magnitudeSectionChildren,
  benefitSectionChildren,
  // topicsSectionChildren,
  // systemSectionChildren,
  aboutSectionChildren,
}: // applySectionChildren,
HomeWrapperProps) => {
  const isScrolling = useRef(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const [selectedSectionId, setSelectedSectionId] = useState("");
  const headerRef = useRef<HTMLHeadElement | null>(null);
  const heroSectionRef = useRef<HTMLDivElement | null>(null);
  const { entry: mechanismEntry, inView: mechanismInView, ref: MechanismSectionRef } = useInView(observerOption);
  const { entry: magnitudeEntry, inView: magnitudeInView, ref: MagnitudeSectionRef } = useInView(observerOption);
  const { entry: benefitEntry, inView: benefitInView, ref: BenefitSectionRef } = useInView(observerOption);
  // const { entry: topicsEntry, inView: topicsInView, ref: TopicsSectionRef } = useInView(observerOption);
  // const { entry: systemsEntry, inView: systemsInView, ref: SystemSectionRef } = useInView(observerOption);
  const { entry: aboutEntry, inView: aboutInView, ref: AboutSectionRef } = useInView(observerOption);
  // const { entry: applyEntry, inView: applyInView, ref: ApplySectionRef } = useInView(observerOption);

  const { data: stats } = useQuery("stats", getStats);

  useEffect(() => {
    isScrolling.current = true;
    if (window.location.hash) {
      setSelectedSectionId(`${window.location.hash}`);
    }

    timer.current = setTimeout(() => {
      isScrolling.current = false;
    }, 1300);
  }, []);

  useEffect(() => {
    console.log("ss:01");
    if (isScrolling.current) return;
    console.log("ss:02");
    let newSelectedSectionId = "";
    if (mechanismInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[1].id;
    if (magnitudeInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[2].id;
    if (benefitInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[3].id;
    // if (topicsInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[4].id;
    // if (systemsInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[5].id;
    if (aboutInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[4].id;
    // if (applyInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[7].id;
    console.log("ss:03");
    const newHash = newSelectedSectionId ? `#${newSelectedSectionId}` : "#";
    console.log("ss:04");
    setSelectedSectionId(newHash);
    window.history.replaceState(null, "", newHash);
  }, [aboutInView, benefitInView, magnitudeInView, mechanismInView]);

  const onSwitchSection = (newSelectedSectionId: string) => {
    if (isScrolling.current) return;
    if (typeof window === "undefined") return;

    const scrollableContainer = window.document.getElementById("ScrollableContainer");
    if (!scrollableContainer) return;

    const newHash = newSelectedSectionId ? `#${newSelectedSectionId}` : "";
    if (window.location.hash === newHash) return;

    const sectionsHeight = getSectionHeights();
    if (!sectionsHeight) return;

    isScrolling.current = true;

    console.log("ss1", sectionsHeight);
    setSelectedSectionId(newHash);
    const sectionIdx = sectionsHeight.findIndex(cur => cur.id === newSelectedSectionId);
    if (sectionIdx < 0) return;
    console.log("ss2");

    const previousSections = sectionsHeight.slice(0, sectionIdx + 1);
    const cumulativeSectionHeight = previousSections.reduce((a, c) => ({ id: c.id, height: a.height + c.height }));

    scrollableContainer.scroll({ top: cumulativeSectionHeight.height, left: 0, behavior: "smooth" });
    window.history.replaceState(null, "", newHash);

    console.log("ss3");
    timer.current = setTimeout(() => {
      isScrolling.current = false;
    }, 1000);
  };

  const getSectionHeights = useCallback(() => {
    console.log("ttt:01");
    if (!headerRef?.current) return null;
    if (!heroSectionRef?.current) return null;
    console.log("ttt:02");
    if (!mechanismEntry) return null;
    if (!magnitudeEntry) return null;
    if (!benefitEntry) return null;
    // if (!topicsEntry) return null;
    // if (!systemsEntry) return null;
    if (!aboutEntry) return null;
    // if (!applyEntry) return null;
    console.log("ttt:03");

    return [
      { id: mechanismEntry.target.id, height: headerRef.current.clientHeight + heroSectionRef.current.clientHeight },
      { id: magnitudeEntry.target.id, height: mechanismEntry.target.clientHeight },
      { id: benefitEntry.target.id, height: magnitudeEntry.target.clientHeight },
      // { id: topicsEntry.target.id, height: benefitEntry.target.clientHeight },
      // { id: systemsEntry.target.id, height: topicsEntry.target.clientHeight },
      { id: aboutEntry.target.id, height: benefitEntry.target.clientHeight },
      // { id: applyEntry.target.id, height: aboutEntry.target.clientHeight },
    ];
  }, [aboutEntry, benefitEntry, magnitudeEntry, mechanismEntry]);

  return (
    <Box>
      <AppHeaderMemoized
        ref={headerRef}
        page="ONE_CADEMY"
        sections={ONE_CADEMY_SECTIONS}
        selectedSectionId={selectedSectionId}
        onSwitchSection={onSwitchSection}
      />

      <Box ref={heroSectionRef}>
        <HeroMemoized
          headerHeight={HEADER_HEIGHT}
          headerHeightMobile={HEADER_HEIGHT_MOBILE}
          onApply={() => onSwitchSection("apply")}
        />
      </Box>

      <SectionWrapper ref={MechanismSectionRef} section={ONE_CADEMY_SECTIONS[1]} textAlign="center">
        {mechanismSectionChildren}
      </SectionWrapper>

      <SectionWrapper ref={MagnitudeSectionRef} section={ONE_CADEMY_SECTIONS[2]} stats={stats}>
        {magnitudeSectionChildren}
      </SectionWrapper>

      <SectionWrapper ref={BenefitSectionRef} section={ONE_CADEMY_SECTIONS[3]}>
        {benefitSectionChildren}
      </SectionWrapper>

      {/* <SectionWrapper ref={TopicsSectionRef} section={ONE_CADEMY_SECTIONS[4]}>
        {topicsSectionChildren}
      </SectionWrapper> */}
      {/* 
      <SectionWrapper ref={SystemSectionRef} section={ONE_CADEMY_SECTIONS[5]}>
        {systemSectionChildren}
      </SectionWrapper> */}

      <SectionWrapper ref={AboutSectionRef} section={ONE_CADEMY_SECTIONS[4]}>
        {aboutSectionChildren}
      </SectionWrapper>

      {/* <SectionWrapper ref={ApplySectionRef} section={ONE_CADEMY_SECTIONS[7]}>
        {applySectionChildren}
      </SectionWrapper> */}
    </Box>
  );
};

export default HomeWrapper;
