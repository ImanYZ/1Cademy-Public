import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import React, { useCallback, useEffect, useRef } from "react";

// import { useWindowScroll } from "../hooks/useWindowScroll";
import { useWindowSize } from "../hooks/useWindowSize";

const Home = () => {
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  const { rive, RiveComponent } = useRive({
    src: "rive/gg-7.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
  });

  const { height } = useWindowSize();
  //   const scroll = useWindowScroll();

  const scrollInput = useStateMachineInput(rive, "State Machine 1", "scroll");

  const onChangeObserver = useCallback(
    (e: IntersectionObserverEntry[]) => {
      if (!scrollInput) return;
      console.log("onChangeObserver", e);
      e.forEach(({ isIntersecting }, idx) => {
        if (isIntersecting) {
          scrollInput.value = 5 + idx * 10;
          console.log("onChangeObserver:scrollInput.value", scrollInput.value);
        }
      });
    },
    [scrollInput]
  );

  useEffect(() => {
    if (!step1Ref.current || !step2Ref.current || !step3Ref.current) return;

    let options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.51,
    };
    const ob = new IntersectionObserver(onChangeObserver, options);
    ob.observe(step1Ref.current);
    ob.observe(step2Ref.current);
    ob.observe(step3Ref.current);

    return () => {
      ob.disconnect();
    };
  }, [onChangeObserver]);

  return (
    <div style={{ position: "relative", border: "dashed 2px royalBlue" }}>
      <div id="step-1" ref={step1Ref} style={{ height, background: "#0f375f79" }}></div>
      <div id="step-2" ref={step2Ref} style={{ height, background: "#218f7d79" }}></div>
      <div id="step-3" ref={step3Ref} style={{ height, background: "#4bb48079" }}></div>
      <div className="st" style={{ height, borderRight: "solid 6px pink" }}>
        <div style={{ height, width: height }}>
          <RiveComponent className="canvas" />
        </div>
      </div>
    </div>
  );
};

export default Home;
