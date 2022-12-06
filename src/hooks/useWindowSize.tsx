import { useEffect, useState } from "react";

export const useWindowSize = () => {
  // const isSSR = typeof window !== "undefined";
  // console.log("isSSR", isSSR);
  const [firstRender, setFirstRender] = useState(true);
  const [windowSize, setWindowSize] = useState({
    // width: isSSR ? 0 : window.innerWidth,
    // height: isSSR ? 0 : window.innerHeight,
    width: 0,
    height: 0,
  });

  const onChangeWindowSize = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  };

  useEffect(() => {
    // in first render we need to set default values
    if (firstRender) {
      console.log("isSSR:firstRender");
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      setFirstRender(false);
    }
  }, [firstRender]);

  useEffect(() => {
    window.addEventListener("resize", onChangeWindowSize);

    return () => {
      window.removeEventListener("resize", onChangeWindowSize);
    };
  }, []);

  return windowSize;
};
