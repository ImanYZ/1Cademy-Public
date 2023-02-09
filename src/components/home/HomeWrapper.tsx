import { Box } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { ReactNode } from "react-markdown/lib/react-markdown";

import { useInView, UseInViewProps } from "../../hooks/useObserver";
import AppHeaderMemoized from "../Header/AppHeader";
import { SectionWrapper } from "./components/SectionWrapper";
import { ONE_CADEMY_SECTIONS } from "./SectionsItems";

const observerOption: UseInViewProps = { options: { root: null, rootMargin: "-480px 0px -380px 0px", threshold: 0 } };

type HomeWrapperProps = {
  heroSectionChildren: ReactNode;
  mechanismSectionChildren: ReactNode;
  magnitudeSectionChildren: ReactNode;
  benefitSectionChildren: ReactNode;
  topicsSectionChildren: ReactNode;
  systemSectionChildren: ReactNode;
  aboutSectionChildren: ReactNode;
};

const HomeWrapper = ({
  heroSectionChildren,
  mechanismSectionChildren,
  magnitudeSectionChildren,
  benefitSectionChildren,
  topicsSectionChildren,
  systemSectionChildren,
  aboutSectionChildren,
}: HomeWrapperProps) => {
  const isScrolling = useRef(false);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const [selectedSectionId, setSelectedSectionId] = useState("");
  const { inView: mechanismInView, ref: MechanismSectionRef } = useInView(observerOption);
  const { inView: magnitudeInView, ref: MagnitudeSectionRef } = useInView(observerOption);
  const { inView: benefitInView, ref: BenefitSectionRef } = useInView(observerOption);
  const { inView: topicsInView, ref: TopicsSectionRef } = useInView(observerOption);
  const { inView: systemsInView, ref: SystemSectionRef } = useInView(observerOption);
  const { inView: aboutInView, ref: AboutSectionRef } = useInView(observerOption);

  useEffect(() => {
    isScrolling.current = true;

    timer.current = setTimeout(() => {
      isScrolling.current = false;
    }, 1000);
  }, []);

  useEffect(() => {
    if (isScrolling.current) return;

    let newSelectedSectionId = "";
    if (mechanismInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[1].id;
    if (magnitudeInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[2].id;
    if (benefitInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[3].id;
    if (topicsInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[4].id;
    if (systemsInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[5].id;
    if (aboutInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[6].id;

    const newHash = newSelectedSectionId ? `#${newSelectedSectionId}` : "";
    if (window.location.hash === newHash) return;
    window.location.hash = newHash;

    setSelectedSectionId(newHash);
  }, [mechanismInView, magnitudeInView, benefitInView, topicsInView, systemsInView, aboutInView, router]);

  const onSwitchSection = (newSelectedSectionId: string) => {
    if (isScrolling.current) return;

    const newHash = newSelectedSectionId ? `#${newSelectedSectionId}` : "";
    if (window.location.hash === newHash) return;

    isScrolling.current = true;

    timer.current = setTimeout(() => {
      isScrolling.current = false;
    }, 1000);

    setSelectedSectionId(newHash);
    window.location.hash = newHash;
  };

  return (
    <Box>
      <AppHeaderMemoized
        page="ONE_CADEMY"
        sections={ONE_CADEMY_SECTIONS}
        selectedSectionId={selectedSectionId}
        onPreventSwitch={onSwitchSection}
      />

      {heroSectionChildren}

      <SectionWrapper ref={MechanismSectionRef} section={ONE_CADEMY_SECTIONS[1]} textAlign="center">
        {mechanismSectionChildren}
      </SectionWrapper>

      <SectionWrapper ref={MagnitudeSectionRef} section={ONE_CADEMY_SECTIONS[2]} /* stats={stats} */>
        {magnitudeSectionChildren}
      </SectionWrapper>

      <SectionWrapper ref={BenefitSectionRef} section={ONE_CADEMY_SECTIONS[3]}>
        {benefitSectionChildren}
      </SectionWrapper>

      <SectionWrapper ref={TopicsSectionRef} section={ONE_CADEMY_SECTIONS[4]}>
        {topicsSectionChildren}
      </SectionWrapper>

      <SectionWrapper ref={SystemSectionRef} section={ONE_CADEMY_SECTIONS[5]}>
        {systemSectionChildren}
      </SectionWrapper>

      <SectionWrapper ref={AboutSectionRef} section={ONE_CADEMY_SECTIONS[6]}>
        {aboutSectionChildren}
      </SectionWrapper>
    </Box>
  );
};

export default HomeWrapper;
