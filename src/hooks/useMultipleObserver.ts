/* eslint-disable */

import * as React from "react";

type ObserverOptions = {
  root: any;
  rootMargin: string;
  threshold: number | number[];
};
export type UseInViewMultipleProps = {
  numberOfObserver: string[];
  options?: ObserverOptions;
};
const useInViewInitialValue: UseInViewMultipleProps = {
  numberOfObserver: [],
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
  const { options, numberOfObserver } = props;
  console.log(
    "dd",
    Object.keys(numberOfObserver).reduce((a, c) => {
      return { ...a, [c]: { inView: false, inViewOnce: false, entry: undefined } };
    }, {})
  );
  const [tt, setTT] = React.useState<any | null>(null);
  const [refArray, setRefArray] = React.useState(new Array(numberOfObserver.length).fill(null));

  const tmpSetState = React.useCallback((n: number) => {
    return (e: any) => setRefArray(p => p.map((c, i) => (i === n ? e : c)));
  }, []);

  const [states, setStates] = React.useState<{
    [key: string]: {
      inView: boolean;
      inViewOnce: boolean;
      entry: IntersectionObserverEntry | undefined;
    };
  }>(
    Object.keys(numberOfObserver).reduce((a, c) => {
      return { ...a, [c]: { inView: false, inViewOnce: false, entry: undefined } };
    }, {})
  );

  React.useEffect(() => {
    // setStates(prev =>
    //   prev.map((cur, idx) => {
    //     if (refArray[idx]) return cur;
    //     return { inView: false, entry: undefined, inViewOnce: prev[idx].inViewOnce };
    //   })
    // );

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

        setStates(p => ({ ...p, [name]: { inView, inViewOnce: p[name].inViewOnce || inView, entry } }));
      });
    }, options);

    // observe.observe(ref);
    refArray.forEach(cur => {
      if (!cur) return;
      observe.observe(cur);
    });

    return () => {
      if (!observe) return;

      refArray.forEach(cur => {
        if (!cur) return;
        observe.unobserve(cur);
      });
      observe.disconnect();
    };
  }, [options, refArray]);

  return { ref: tmpSetState, tt: setTT, states };
}
