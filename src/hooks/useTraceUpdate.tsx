import { useEffect, useRef } from "react";

/**
 * this hook detect the dependencies which change on a component 😎
 */
export function useTraceUpdate(props: any, prefix: string, display = true) {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps: any, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0 && display) {
      console.info(`Changed-props:${prefix ? prefix + ":" : ""}`, changedProps);
    }
    prev.current = props;
  });
}
