import { RefObject, useEffect, useRef, useState } from "react";

export const useHeightElement = (divRef: RefObject<HTMLDivElement>, callback: (height: number) => void) => {
  const INITIAL_HEIGHT = 1;
  const previousHeight = useRef(INITIAL_HEIGHT);

  const callbackFn = (height: number) => {
    callback()
  }

  //   IMPORTANT: Run in every render
  useEffect(() => {
    if (!divRef?.current) return;

    const currentHeight = divRef.current.offsetHeight;
    if (previousHeight.current === currentHeight) return;

    previousHeight.current = currentHeight;
    callback(currentHeight)
  });

  return { height };
};
