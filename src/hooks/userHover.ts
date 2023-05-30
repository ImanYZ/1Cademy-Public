import { useCallback, useRef, useState } from "react";

export const useHover = <T extends HTMLElement>() => {
  const [isHovered, setIsHovered] = useState(true);

  // Wrap in useCallback so we can use in dependencies below
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // Keep track of the last node passed to callbackRef
  // so we can remove its event listeners.
  const refElement = useRef<T>();

  // Use a callback refElement instead of useEffect so that event listeners
  // get changed in the case that the returned refElement gets added to
  // a different element later. With useEffect, changes to refElement.current
  // wouldn't cause a rerender and thus the effect would run again.
  const ref = useCallback<(node?: null | T) => void>(
    node => {
      if (refElement.current) {
        refElement.current.removeEventListener("mouseenter", handleMouseEnter);
        refElement.current.removeEventListener("mouseleave", handleMouseLeave);
      }

      refElement.current = node || undefined;

      if (refElement.current) {
        refElement.current.addEventListener("mouseenter", handleMouseEnter);
        refElement.current.addEventListener("mouseleave", handleMouseLeave);
      }
    },
    [handleMouseEnter, handleMouseLeave]
  );

  return { ref, isHovered };
};
