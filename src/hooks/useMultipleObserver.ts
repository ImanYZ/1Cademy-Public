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

// export function useInViewS({ options } = { options: useInViewInitialValue }) {}

// create props in a constant out of the component to not rebuild again
// in other case that will generate an infinity loop

// TODO: this hook is incomplete is generating infinity loop so memory is filled
// this hook return an array to pass as ref and save the element
// we need to observe array elements with one observer

export function useInViewMultiple(props = useInViewInitialValue) {
  const { options, observerKeys } = props;

  const [refs, setRefs] = React.useState<{ [key: string]: any }>(
    observerKeys.reduce((a, c) => ({ ...a, [c]: null }), {})
  );

  const setRefByKeyMemoized = useCallback((key: string, element: any) => setRefs(p => ({ ...p, [key]: element })), []);

  const [status, setStatus] = useState<ObserverStatus>(
    observerKeys.reduce((a, c) => {
      return { ...a, [c]: { inView: false, inViewOnce: false, entry: undefined } };
    }, {})
  );

  useEffect(() => {
    console.log("useEffect", refs);

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
      console.log("😃", { entries });
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

        // setStates(prev=>)
        // setState(prev => ({ inView, entry, inViewOnce: prev.inViewOnce || inView }));

        setStatus(p => ({ ...p, [name]: { inView, inViewOnce: p[name].inViewOnce || inView, entry } }));
      });
    }, options);

    // observe.observe(ref);
    Object.keys(refs).forEach(keys => {
      const htmlElement = refs[keys];
      console.log({ htmlElement });
      if (!htmlElement) return;

      observe.observe(htmlElement);
    });

    // refArray.forEach(cur => {
    //   if (!cur) return;
    //   observe.observe(cur);
    // });

    return () => {
      if (!observe) return;

      Object.keys(refs).forEach(keys => {
        const htmlElement = refs[keys];
        if (!htmlElement) return;

        observe.unobserve(htmlElement);
      });
      // refArray.forEach(cur => {
      //   if (!cur) return;
      //   observe.unobserve(cur);
      // });
      observe.disconnect();
    };
  }, [options, refs]);

  return { states: status, t: setRefByKeyMemoized };
}
