import { RefObject, useCallback, useEffect, useState } from "react";

export type UseComponentSizeProps = {
  componentRef: RefObject<HTMLElement>;
};

export const useComponentSize = ({ componentRef }: UseComponentSizeProps) => {
  const isSSR = typeof window !== "undefined";
  // const [firstRender, setFirstRender] = useState(true);
  const [componentSize, setComponentSize] = useState({
    clientWidth: isSSR ? 0 : componentRef.current?.clientWidth ?? 0,
    clientHeight: isSSR ? 0 : componentRef.current?.clientHeight ?? 0,
  });

  const onChangeWindowSize = useCallback(() => {
    //
    console.log("onChangeWindowSize", componentRef.current);
    if (!componentRef.current) {
      setComponentSize({ clientWidth: 0, clientHeight: 0 });
      return;
    }
    setComponentSize({
      clientWidth: componentRef.current.clientWidth,
      clientHeight: componentRef.current.clientHeight,
    });
  }, [componentRef]);

  // useEffect(() => {
  //   // in first render we need to set default values
  //   console.log("componentRef.current", componentRef.current);
  //   if (firstRender) {
  //     setComponentSize({
  //       clientWidth: isSSR ? 0 : componentRef.current?.clientWidth ?? 0,
  //       clientHeight: isSSR ? 0 : componentRef.current?.clientHeight ?? 0,
  //     });
  //     setFirstRender(false);
  //   }
  // }, [componentRef, firstRender, isSSR]);

  useEffect(() => {
    window.addEventListener("resize", onChangeWindowSize);
    onChangeWindowSize();
    return () => {
      window.removeEventListener("resize", onChangeWindowSize);
    };
  }, [onChangeWindowSize]);

  return componentSize;
};

// export const sac = forwardRef((props, ref: RefObject<HTMLElement>) => useComponentSize({ componentRef: ref }));
