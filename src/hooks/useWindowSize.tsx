import { useEffect, useState } from "react";

export const useWindowSize = ({ initialWidth, initialHeight } = { initialWidth: 0, initialHeight: 0 }) => {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  const onChangeWindowSize = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  };

  useEffect(() => {
    if (isFirstRender) {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      setIsFirstRender(false);
    }
  }, [isFirstRender]);

  useEffect(() => {
    window.addEventListener("resize", onChangeWindowSize);

    return () => {
      window.removeEventListener("resize", onChangeWindowSize);
    };
  }, []);

  return windowSize;
};
