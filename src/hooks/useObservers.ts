import { useEffect, useState } from "react";

interface Visibility {
  isVisible: boolean;
  hasBeenVisible: boolean;
}

export interface DivRefs {
  [key: string]: React.MutableRefObject<any | null>;
}

export const useObserveMultipleDivs = (divRefs: DivRefs): { [key: string]: Visibility } => {
  const [visibility, setVisibility] = useState<{ [key: string]: Visibility }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        console.log({ entry });
        setVisibility(prevVisibility => {
          const newVisibility = { ...prevVisibility };
          const tt = entry.target as Element;
          const id = tt.attributes["data-observer-id"].value;
          console.log("id", id);
          newVisibility[id] = {
            isVisible: entry.isIntersecting,
            hasBeenVisible: prevVisibility[id]
              ? prevVisibility[id].hasBeenVisible || entry.isIntersecting
              : entry.isIntersecting,
          };
          return newVisibility;
        });
      });
    });

    Object.keys(divRefs).forEach(key => {
      if (!divRefs[key].current) return;

      observer.observe(divRefs[key].current);
    });

    return () => {
      Object.keys(divRefs).forEach(key => {
        if (divRefs[key].current) {
          observer.unobserve(divRefs[key].current);
        }
      });
    };
  }, [divRefs]);

  return visibility;
};
