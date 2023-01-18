/* eslint-disable */

import React, { useCallback, useEffect, useMemo, useState } from "react";

type ObserverOptions = {
  root: any;
  rootMargin: string;
  threshold: number | number[];
};

type ObserverStatus = {
  [key: string]: {
    inView: boolean;
    inViewOnce: boolean;
    entry: IntersectionObserverEntry | undefined;
  };
};

export type UseInViewMultipleProps = {
  observerKeys: string[];
  options?: ObserverOptions;
};
const useInViewInitialValue: UseInViewMultipleProps = {
  observerKeys: [],
  options: {
    root: null,
    rootMargin: "0px",
    threshold: 0,
  },
};

// create props in a constant out of the component to not rebuild again
// in other case that will generate an infinity loop

const generateInitialStatusValue = (observerKeys: string[]) => {
  return observerKeys.reduce((a, c) => {
    return { ...a, [c]: { inView: false, inViewOnce: false, entry: undefined } };
  }, {});
};

const generateInitialRefs = (observerKeys: string[]) => observerKeys.reduce((a, c) => ({ ...a, [c]: null }), {});

/**
 * pass observer Ids and get ref and status, objects you can access using Ids
 */
export function useInViewMultiple(props = useInViewInitialValue) {
  const { options, observerKeys } = props;

  const [refs, setRefs] = React.useState<{ [key: string]: any }>(generateInitialRefs(observerKeys));
  const [status, setStatus] = useState<ObserverStatus>(generateInitialStatusValue(observerKeys));

  const setRefByKey = useCallback((key: string, element: any) => setRefs(p => ({ ...p, [key]: element })), []);

  useEffect(() => {
    // reset value from unmounted elements
    setStatus(prev =>
      Object.keys(prev).reduce(
        (a, key) => ({
          ...a,
          [key]: refs[key] ? prev[key] : { inView: false, inViewOnce: false, entry: undefined },
        }),
        {}
      )
    );

    const observe = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        // While it would be nice if you could just look at isIntersecting to determine if the component is inside the viewport, browsers can't agree on how to use it.
        // -Firefox ignores `threshold` when considering `isIntersecting`, so it will never be false again if `threshold` is > 0

        const name = entry.target.getAttribute("data-observer-id");
        if (!name) {
          console.warn(
            "Encountered entry with no name. You should add data-observer-id to every element passed to the isInView hook."
          );
          return;
        }

        const inView = entry.isIntersecting; /* &&
                        thresholds.some((threshold) => entry.intersectionRatio >= threshold); */

        // // @ts-ignore support IntersectionObserver v2
        // if (props.options.trackVisibility && typeof entry.isVisible === 'undefined') {
        //     // The browser doesn't support Intersection Observer v2, falling back to v1 behavior.
        //     // @ts-ignore
        //     entry.isVisible = inView;
        // }

        setStatus(p => ({ ...p, [name]: { inView, inViewOnce: p[name].inViewOnce || inView, entry } }));
      });
    }, options);

    // observe.observe(ref);
    Object.keys(refs).forEach(keys => {
      const htmlElement = refs[keys];
      if (!htmlElement) return;

      observe.observe(htmlElement);
    });

    return () => {
      if (!observe) return;

      Object.keys(refs).forEach(keys => {
        const htmlElement = refs[keys];
        if (!htmlElement) return;

        observe.unobserve(htmlElement);
      });
      observe.disconnect();
    };
  }, [options, refs]);

  return { status, setRefByKey };
}
