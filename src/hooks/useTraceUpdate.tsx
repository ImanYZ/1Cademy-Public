import { useEffect, useRef } from "react";

/**
 * this hook detect the dependencies which change on a component 😎
 */
export function useTraceUpdate(props: any) {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps: any, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0) {
      console.info("Changed-props:", changedProps);
    }
    prev.current = props;
  });
}
