import { useEffect } from "react";

type IntervalProps = {
  stepId?: string;
  cb?: () => void;
  event?: keyof HTMLElementEventMap;
  delay?: number;
};

// TODO: add tries in other case this is infinity
const useEventListener = ({ stepId, cb, event = "click", delay = 100 }: IntervalProps) => {
  useEffect(() => {
    if (!stepId) return;
    if (!cb) return;

    let element: HTMLElement | null = null;
    const interval = setInterval(() => {
      element = document.getElementById(stepId);
      if (!element) return;
      element.addEventListener(event, cb);
    }, delay);
    return () => {
      if (element) element.removeEventListener("click", cb);
      clearInterval(interval);
    };
  }, [cb, delay, event, stepId]);
};

export default useEventListener;
