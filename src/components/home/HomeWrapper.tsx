import { Box } from "@mui/material";
import { collection, getFirestore, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { useInView, UseInViewProps } from "../../hooks/useObserver";
import AppHeaderMemoized, { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from "../Header/AppHeader";
import { SectionWrapper } from "./components/SectionWrapper";
import { HeroMemoized } from "./sections/Hero";
import { ONE_CADEMY_SECTIONS } from "./SectionsItems";

const observerOption: UseInViewProps = { options: { root: null, rootMargin: "-480px 0px -380px 0px", threshold: 0 } };

export type StatsSchema = {
  institutions: number;
  users: number;
  proposals: number;
  nodes: number;
  links: number;
  communities?: number;
};

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
  const db = getFirestore();
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
  const [stats, setStats] = useState<StatsSchema>({
    institutions: 180,
    links: 234713,
    nodes: 44296,
    proposals: 87566,
    users: 1529,
  });

  useEffect(() => {
    const statsRef = collection(db, "stats");
    const q = query(statsRef, orderBy("createdAt", "desc"), limit(1));
    const killSnapshot = onSnapshot(q, snapshot => {
      if (!snapshot.docs.length) return;

      const newStats = snapshot.docs[0].data() as StatsSchema;
      setStats(newStats);
    });
    return () => killSnapshot();
  }, [db]);

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
    if (isScrolling.current) return;
    let newSelectedSectionId = "";
    if (mechanismInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[1].id;
    if (magnitudeInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[2].id;
    if (benefitInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[3].id;
    // if (topicsInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[4].id;
    // if (systemsInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[5].id;
    if (aboutInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[4].id;
    // if (applyInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[7].id;
    const newHash = newSelectedSectionId ? `#${newSelectedSectionId}` : "#";
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

    setSelectedSectionId(newHash);
    const sectionIdx = sectionsHeight.findIndex(cur => cur.id === newSelectedSectionId);
    if (sectionIdx < 0) return;

    const previousSections = sectionsHeight.slice(0, sectionIdx + 1);
    const cumulativeSectionHeight = previousSections.reduce((a, c) => ({ id: c.id, height: a.height + c.height }));

    scrollableContainer.scroll({ top: cumulativeSectionHeight.height, left: 0, behavior: "smooth" });
    window.history.replaceState(null, "", newHash);

    timer.current = setTimeout(() => {
      isScrolling.current = false;
    }, 1000);
  };

  const getSectionHeights = useCallback(() => {
    if (!headerRef?.current) return null;
    if (!heroSectionRef?.current) return null;
    if (!mechanismEntry) return null;
    if (!magnitudeEntry) return null;
    if (!benefitEntry) return null;
    // if (!topicsEntry) return null;
    // if (!systemsEntry) return null;
    if (!aboutEntry) return null;
    // if (!applyEntry) return null;

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

      <SectionWrapper ref={MechanismSectionRef} section={ONE_CADEMY_SECTIONS[1]} textAlign="center" display="block">
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
