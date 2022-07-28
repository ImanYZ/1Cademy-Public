import { MutableRefObject, useEffect, useState } from "react";

export const useOnScreen = (
  ref: MutableRefObject<HTMLDivElement | null> | undefined,
  defaultVisible = false,
  rootMargin = "0px"
) => {
  const [isIntersecting, setIntersecting] = useState(defaultVisible);
  useEffect(() => {
    if (!ref) {
      return;
    }
    const current = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin
      }
    );
    if (ref?.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (!current) return;
      observer.unobserve(current);
    };
  }, [ref, rootMargin]);
  return isIntersecting;
};
