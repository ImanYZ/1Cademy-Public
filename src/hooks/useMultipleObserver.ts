/* eslint-disable */

import * as React from "react";

type ObserverOptions = {
  root: any;
  rootMargin: string;
  threshold: number | number[];
};
export type UseInViewMultipleProps = {
  numberOfObserver: number;
  options: ObserverOptions;
};
const useInViewInitialValue: UseInViewMultipleProps = {
  numberOfObserver: 1,
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
  const [ref, setRef] = React.useState(new Array(numberOfObserver).fill(null));

  const setRefIdx = React.useCallback((n: number) => {
    return (e: any) => setRef(p => p.map((c, i) => (i === n ? e : c)));
  }, []);

  // const callback = React.useRef < IntersectionOptions['onChange'] > ();
  const [state, setState] = React.useState<
    {
      inView: boolean;
      inViewOnce: boolean;
      entry: IntersectionObserverEntry | undefined;
    }[]
  >(
    new Array(numberOfObserver).fill({
      inView: false,
      inViewOnce: false,
      entry: undefined,
    })
  );

  React.useEffect(() => {
    setState(prev =>
      prev.map((cur, idx) => {
        if (ref[idx]) return cur;
        return { inView: false, entry: undefined, inViewOnce: prev[idx].inViewOnce };
      })
    );

    const observe = new IntersectionObserver(entries => {
      console.log("😃", { entries });
      entries.forEach(entry => {
        // While it would be nice if you could just look at isIntersecting to determine if the component is inside the viewport, browsers can't agree on how to use it.
        // -Firefox ignores `threshold` when considering `isIntersecting`, so it will never be false again if `threshold` is > 0
        const inView = entry.isIntersecting; /* &&
                        thresholds.some((threshold) => entry.intersectionRatio >= threshold); */

        // // @ts-ignore support IntersectionObserver v2
        // if (props.options.trackVisibility && typeof entry.isVisible === 'undefined') {
        //     // The browser doesn't support Intersection Observer v2, falling back to v1 behavior.
        //     // @ts-ignore
        //     entry.isVisible = inView;
        // }

        // setState(prev => ({ inView, entry, inViewOnce: prev.inViewOnce || inView }));
      });
    }, options);

    // observe.observe(ref);
    ref.forEach(cur => {
      if (cur) {
        observe.observe(cur);
      }
    });

    return () => {
      if (observe) {
        ref.forEach(cur => {
          if (cur) {
            observe.unobserve(cur);
          }
        });
        // observe.unobserve(ref);
        observe.disconnect();
      }
    };
  }, [options, ref]);

  return { ref: setRefIdx };
}
