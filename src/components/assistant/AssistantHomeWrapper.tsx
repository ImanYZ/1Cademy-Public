import { Box } from "@mui/material";
import React, { ReactNode, useEffect, useRef, useState } from "react";

import { useInView, UseInViewProps } from "../../hooks/useObserver";
// import ROUTES from "../../lib/utils/routes";
import AppHeaderMemoized from "../Header/AppHeader";
import { SectionWrapper } from "../home/components/SectionWrapper";
// import { SectionWrapper } from "./components/SectionWrapper";
import { ONE_ASSISTANT_SECTIONS } from "./sections";
// import { ONE_CADEMY_SECTIONS } from "./SectionsItems";

const observerOption: UseInViewProps = { options: { root: null, rootMargin: "-480px 0px -380px 0px", threshold: 0 } };

type AssistantHomeWrapperProps = {
  heroSectionChildren: ReactNode;
  mechanismtSectionChildren: ReactNode;
  benefitSectionChildren: ReactNode;
  systemsSectionChildren: ReactNode;
  aboutectionChildren: ReactNode;
};

const AssistantHomeWrapper = ({
  heroSectionChildren,
  mechanismtSectionChildren,
  benefitSectionChildren,
  systemsSectionChildren,
  aboutectionChildren,
}: AssistantHomeWrapperProps) => {
  const isScrolling = useRef(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const [selectedSectionId, setSelectedSectionId] = useState("");
  const { inView: mechanismInView, ref: MechanismSectionRef } = useInView(observerOption);
  const { inView: benefitInView, ref: BenefitSectionRef } = useInView(observerOption);
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
    if (mechanismInView) newSelectedSectionId = ONE_ASSISTANT_SECTIONS[1].id;
    if (benefitInView) newSelectedSectionId = ONE_ASSISTANT_SECTIONS[2].id;
    if (systemsInView) newSelectedSectionId = ONE_ASSISTANT_SECTIONS[3].id;
    if (aboutInView) newSelectedSectionId = ONE_ASSISTANT_SECTIONS[4].id;

    const newHash = newSelectedSectionId ? `#${newSelectedSectionId}` : "";
    if (window.location.hash === newHash) return;

    setSelectedSectionId(newHash);
    window.location.hash = newHash;
  }, [aboutInView, benefitInView, mechanismInView, systemsInView]);

  const onSwitchSection = (newSelectedSectionId: string) => {
    // if (fromOtherPage) return (window.location.href = `${ROUTES.publicHome}#${newSelectedSectionId}`);

    if (isScrolling.current) return;

    const newHash = newSelectedSectionId ? `#${newSelectedSectionId}` : "";
    if (window.location.hash === newHash) return;

    isScrolling.current = true;

    timer.current = setTimeout(() => {
      isScrolling.current = false;
    }, 1000);

    setSelectedSectionId(newHash);
    window.history.replaceState(null, "", newHash);
    // window.location.hash = newHash;
  };

  return (
    <Box>
      <AppHeaderMemoized
        page="ONE_ASSISTANT"
        sections={ONE_ASSISTANT_SECTIONS}
        selectedSectionId={selectedSectionId}
        onSwitchSection={onSwitchSection}
      />

      {heroSectionChildren}

      <SectionWrapper ref={MechanismSectionRef} section={ONE_ASSISTANT_SECTIONS[1]} textAlign="center">
        {mechanismtSectionChildren}
      </SectionWrapper>

      <SectionWrapper ref={BenefitSectionRef} section={ONE_ASSISTANT_SECTIONS[2]} /* stats={stats} */>
        {benefitSectionChildren}
      </SectionWrapper>

      <SectionWrapper ref={SystemSectionRef} section={ONE_ASSISTANT_SECTIONS[3]}>
        {systemsSectionChildren}
      </SectionWrapper>

      <SectionWrapper ref={AboutSectionRef} section={ONE_ASSISTANT_SECTIONS[4]}>
        {aboutectionChildren}
      </SectionWrapper>
    </Box>
  );
};

export default AssistantHomeWrapper;
