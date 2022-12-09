import { Box } from "@mui/material";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import React, { useCallback, useEffect, useRef, useState } from "react";

import AppAppBar from "../components/home/AppAppBar";
import Landing from "../components/home/Landing";
import { sectionsOrder } from "../components/home/sectionsOrder";
import { useWindowSize } from "../hooks/useWindowSize";

/**
 * animations builded with: https://rive.app/
 */
const Home = () => {
  const [section, setSection] = useState(0);
  const [notSectionSwitching, setNotSectionSwitching] = useState(true);

  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);
  const step5Ref = useRef(null);

  const { rive, RiveComponent } = useRive({
    src: "rive/gg.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
  });

  const { height, width } = useWindowSize();

  const scrollInput = useStateMachineInput(rive, "State Machine 1", "scroll");

  const onChangeObserver = useCallback(
    (e: IntersectionObserverEntry[]) => {
      if (!scrollInput) return;

      e.forEach(({ isIntersecting, target }) => {
        let idx = null;
        if (target.id === "step-1") idx = 0;
        if (target.id === "step-2") idx = 1;
        if (target.id === "step-3") idx = 2;
        if (target.id === "step-4") idx = 3;

        if (isIntersecting && idx !== null) {
          scrollInput.value = 5 + idx * 10;
          console.log("onChangeObserver:scrollInput.value", target.id, scrollInput.value);
        }
      });
    },
    [scrollInput]
  );

  useEffect(() => {
    if (!step1Ref.current || !step2Ref.current || !step3Ref.current || !step4Ref.current) return;

    let options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.51,
    };
    const ob = new IntersectionObserver(onChangeObserver, options);
    ob.observe(step1Ref.current);
    ob.observe(step2Ref.current);
    ob.observe(step3Ref.current);
    ob.observe(step4Ref.current);

    return () => {
      ob.disconnect();
    };
  }, [onChangeObserver]);

  const updatePosition = (event: any) => {
    if (notSectionSwitching) {
      let cumulativeHeight = 0;
      for (let sIdx = 0; sIdx < sectionsOrder.length; sIdx++) {
        const sectionElement = window.document.getElementById(sectionsOrder[sIdx].id);
        const sectOffsetHeight = sectionElement ? sectionElement.scrollHeight : 0;
        cumulativeHeight += sectOffsetHeight;
        if (event.target.scrollTop < cumulativeHeight) {
          setSection(sIdx - 1);
          window.history.replaceState(null, sectionsOrder[sIdx].title, "#" + sectionsOrder[sIdx].id);
          break;
        }
      }
    }
  };

  const switchSection = (newValue: any) => {
    setNotSectionSwitching(false);
    setSection(newValue);
    let cumulativeHeight = 0;
    for (let sIdx = -1; sIdx < newValue; sIdx++) {
      const sectOffsetHeight = window.document.getElementById(sectionsOrder[sIdx + 1].id)?.scrollHeight || 0;
      cumulativeHeight += sectOffsetHeight;
    }
    const ScrollableContainer = window.document.getElementById("ScrollableContainer");
    if (!ScrollableContainer) return;

    ScrollableContainer.scroll({
      top: cumulativeHeight,
      left: 0,
      behavior: "smooth",
    });
    window.history.replaceState(null, sectionsOrder[newValue + 1].title, "#" + sectionsOrder[newValue + 1].id);
    setTimeout(() => {
      setNotSectionSwitching(true);
    }, 1000);
  };

  const homeClick = (event: any) => {
    event.preventDefault();
    switchSection(-1);
  };

  const joinUsClick = (event: any) => {
    event.preventDefault();
    switchSection(sectionsOrder.length - 2);
  };

  return (
    <Box
      id="ScrollableContainer"
      onScroll={updatePosition}
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "auto",
      }}
    >
      <AppAppBar
        section={section}
        joinNowSec={section === sectionsOrder.length - 2}
        switchSection={switchSection}
        homeClick={homeClick}
        joinUsClick={joinUsClick}
        thisPage={section === sectionsOrder.length - 2 ? "Apply!" : undefined}
      />

      {/* animation start */}

      <div style={{ position: "relative", border: "dashed 2px royalBlue" }}>
        <div id="step-1" ref={step1Ref} style={{ height, background: "#0f375f79" }}></div>
        <div id="step-2" ref={step2Ref} style={{ height, background: "#218f7d79" }}></div>
        <div id="step-3" ref={step3Ref} style={{ height, background: "#4bb48079" }}></div>
        {/* step-4 is an empty reference to know show last animation */}
        <div
          id="step-4"
          ref={step4Ref}
          style={{ height, background: "#c5f35b79", position: "absolute", bottom: "0px", left: "0px" }}
        ></div>
        <Box
          sx={{
            height,
            borderRight: "solid 6px pink",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "sticky",
            bottom: "0px",
          }}
        >
          <Box sx={{ height: width, width }}>
            <RiveComponent className="rive-canvas" />
          </Box>
        </Box>
      </div>

      {/* animation end */}

      <Landing />

      <div id="step-5" ref={step5Ref} style={{ height, background: "#f3b65b79" }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet voluptates quibusdam earum. Harum blanditiis
        veniam quidem? Aliquid, aliquam in maxime numquam repudiandae doloribus voluptatum doloremque. Ea reiciendis
        atque doloribus maxime!
      </div>
    </Box>
  );
};

export default Home;
