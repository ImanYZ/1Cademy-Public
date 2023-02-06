import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Modal, useMediaQuery } from "@mui/material";
// const ValuesMemoized = dynamic(() => import("../components/assistant/Why"), { suspense: true, ssr: false });
// const Which = dynamic(() => import("../components/home/views/Which"), { suspense: true, ssr: false });
// const WhoWeAre = dynamic(() => import("../components/home/views/WhoWeAre"), { suspense: true, ssr: false });
import React, { useEffect, useState } from "react";

import AppHeaderMemoized from "@/components/AppHeader2";
import AssistantFooter from "@/components/assistant/AssistantFooter";
import Benefits from "@/components/assistant/Benefits";
import { AssistantHeroMemoized } from "@/components/assistant/Hero";
import Mechanism from "@/components/assistant/Mechanism";
import { ASSISTANT_MECHANISMS } from "@/components/assistant/mechanismItems";
import { ONE_ASSISTANT_SECTIONS } from "@/components/assistant/sections";
import About from "@/components/home/sections/About";
import Systems from "@/components/home/sections/Systems";
import SearcherPupUp from "@/components/SearcherPupUp";

import AssistantForm from "../components/assistant/AssistantRegister";
import { SectionWrapper } from "../components/home/components/SectionWrapper";
import Papers from "../components/home/sections/Papers";
import { useInView, UseInViewProps } from "../hooks/useObserver";

/**
 * animations builded with: https://rive.app/
 */

export const SECTION_WITH_ANIMATION = 1;

const observerOption: UseInViewProps = { options: { root: null, rootMargin: "-380px 0px -380px 0px", threshold: 0 } };

const Home = () => {
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const { inView: mechanismInView, ref: MechanismSectionRef } = useInView(observerOption);
  const { inView: benefitInView, ref: BenefitSectionRef } = useInView(observerOption);
  const { inView: systemsInView, ref: SystemSectionRef } = useInView(observerOption);
  const { inView: aboutInView, ref: AboutSectionRef } = useInView(observerOption);

  useEffect(() => {
    let newSelectedSectionId = "";
    if (mechanismInView) newSelectedSectionId = ONE_ASSISTANT_SECTIONS[1].id;
    if (benefitInView) newSelectedSectionId = ONE_ASSISTANT_SECTIONS[2].id;
    if (systemsInView) newSelectedSectionId = ONE_ASSISTANT_SECTIONS[3].id;
    if (aboutInView) newSelectedSectionId = ONE_ASSISTANT_SECTIONS[4].id;

    setSelectedSectionId(newSelectedSectionId);

    const newHash = newSelectedSectionId ? `#${newSelectedSectionId}` : "";
    if (window.location.hash === newHash) return;
    window.location.hash = newHash;
  }, [aboutInView, benefitInView, mechanismInView, systemsInView]);

  const isMobile = useMediaQuery("(max-width:600px)");

  const [openForm, setOpenForm] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

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
      <AppHeaderMemoized page="ONE_ASSISTANT" sections={ONE_ASSISTANT_SECTIONS} selectedSectionId={selectedSectionId} />

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
      </SectionWrapper>

      <Modal open={openForm} onClose={() => setOpenForm(false)}>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            bgcolor: theme => (theme.palette.mode === "dark" ? "#28282ad3" : "#f8f8f8e3"),
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: { xs: "flex-start", sm: "center" },
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
