import React from "react";

// The following code is from https://stackoverflow.com/questions/55045566/react-hooks-usecallback-causes-child-to-re-render
export const useMemoizedCallback = (callback: (...args: any[]) => any, inputs: any[] = []) => {
  // Instance var to hold the actual callback.
  const callbackRef = React.useRef(callback);

  // The memoized callback that won't change and calls the changed callbackRef.
  const memoizedCallback = React.useCallback((...args: any) => {
    return callbackRef.current(...args);
  }, []);

  // The callback that is constantly updated according to the inputs.
  const updatedCallback = React.useCallback(callback, inputs);

  // The effect updates the callbackRef depending on the inputs.
  React.useEffect(() => {
    callbackRef.current = updatedCallback;
  }, inputs);

  // Return the memoized callback.
  return memoizedCallback;
};
