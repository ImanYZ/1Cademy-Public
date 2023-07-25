import { useEffect, useRef } from "react";

const getDiffProperties = (props: any, prevProps: any) => {
  const changedProps = Object.entries(props).reduce((ps: any, [k, v]) => {
    if (prevProps[k] !== v) {
      ps[k] = [prevProps[k], v];
    }
    return ps;
  }, {});
  return changedProps;
};

/**
 * this hook detect the dependencies which change on a component 😎
 */
export function useTraceUpdate(props: any, prefix: string, display = true) {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = getDiffProperties(props, prev);
    prev.current = props;
    if (Object.keys(changedProps).length > 0 && display) {
      console.info(`component-changed-props:${prefix ? prefix + ":" : ""}`, changedProps);
    }
  });
}
