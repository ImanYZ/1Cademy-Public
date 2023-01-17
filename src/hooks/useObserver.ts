import * as React from "react";

type ObserverOptions = {
  root: any;
  rootMargin: string;
  threshold: number | number[];
};
export type UseInViewProps = {
  options: ObserverOptions;
};
const useInViewInitialValue: UseInViewProps = {
  options: {
    root: null,
    rootMargin: "0px",
    threshold: 0,
  },
};

// export function useInViewS({ options } = { options: useInViewInitialValue }) {}

// create props in a constant out of the component to not rebuild again
// in other case that will generate an infinity loop

export function useInView(props = useInViewInitialValue) {
  const { options } = props;
  const [ref, setRef] = React.useState(null);
  // const callback = React.useRef < IntersectionOptions['onChange'] > ();
  const [state, setState] = React.useState<{
    inView: boolean;
    inViewOnce: boolean;
    entry: IntersectionObserverEntry | undefined;
  }>({
    inView: false,
    inViewOnce: false,
    entry: undefined,
  });

  // Store the onChange callback in a `ref`, so we can access the latest instance
  // inside the `useEffect`, but without triggering a rerender.
  // callback.current = onChange;

  React.useEffect(() => {
    if (!ref) {
      setState(prev => ({ inView: false, entry: undefined, inViewOnce: prev.inViewOnce }));
      return;
    }

    const observe = new IntersectionObserver(entries => {
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

        setState(prev => ({ inView, entry, inViewOnce: prev.inViewOnce || inView }));
      });
    }, options);

    observe.observe(ref);

    return () => {
      if (observe) {
        observe.unobserve(ref);
        observe.disconnect();
      }
    };
  }, [options, ref]);

  return { ref: setRef, inView: state.inView, inViewOnce: state.inViewOnce, entry: state.entry };
}
