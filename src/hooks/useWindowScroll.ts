import { useEffect, useState } from "react";

export const useWindowScroll = () => {
  //   const isSSR = typeof window !== "undefined";
  //   const [firstRender, setFirstRender] = useState(true);
  const [scroll, setScroll] = useState(0);

  const onChangeWindowScroll = e => {
    console.log("scroll", e);
    const increment = e.deltaY >= 0 ? 1 : -1;
    setScroll(s => s + increment);
  };

  // useEffect(() => {
  //     // in first render we need to set default values
  //     if (firstRender) {
  //         setScroll({ width: window.innerWidth, height: window.innerHeight });
  //         setFirstRender(false);
  //     }
  // }, [firstRender]);

  useEffect(() => {
    window.addEventListener("wheel", e => onChangeWindowScroll(e));

    return () => {
      window.removeEventListener("scroll", onChangeWindowScroll);
    };
  }, []);

  return scroll;
};
