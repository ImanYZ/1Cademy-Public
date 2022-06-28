import { useCallback, useState } from "react";

interface UseElementOnScreenProps {
  options: IntersectionObserverInit;
  defaultVisible: boolean;
}

export const useElementOnScreen = ({ options, defaultVisible = false }: UseElementOnScreenProps) => {
  const [isVisible, setIsVisible] = useState(defaultVisible);

  const containerRefCallback = useCallback(
    (node: any) => {
      const observer = new IntersectionObserver(([entry]) => {
        setIsVisible(entry.isIntersecting);
      }, options);

      if (node) {
        observer.unobserve(node);
        observer.observe(node);
      }
    },
    [options]
  );

  return { containerRefCallback, isVisible };
};
