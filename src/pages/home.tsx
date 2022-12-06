import { Box } from "@mui/material";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import React, { useCallback, useEffect, useRef } from "react";

import { useWindowSize } from "../hooks/useWindowSize";

/**
 * animations builded with: https://rive.app/
 */
const Home = () => {
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

  const { height } = useWindowSize();

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

  return (
    <>
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
          <Box sx={{ height, width: height }}>
            <RiveComponent className="rive-canvas" />
          </Box>
        </Box>
      </div>
      <div id="step-5" ref={step5Ref} style={{ height, background: "#f3b65b79" }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet voluptates quibusdam earum. Harum blanditiis
        veniam quidem? Aliquid, aliquam in maxime numquam repudiandae doloribus voluptatum doloremque. Ea reiciendis
        atque doloribus maxime!
      </div>
    </>
  );
};

export default Home;
