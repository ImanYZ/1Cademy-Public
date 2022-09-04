import { useRef } from "react";

/* https://medium.com/trabe/prevent-click-events-on-double-click-with-react-with-and-without-hooks-6bf3697abc40 */
const delay = (n: number) => new Promise(resolve => setTimeout(resolve, n));

const cancellablePromise = (promise: any) => {
  let isCanceled = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      (value: any) => (isCanceled ? reject({ isCanceled, value }) : resolve(value)),
      (error: any) => reject({ isCanceled, error })
    );
  });

  return {
    promise: wrappedPromise,
    cancel: () => (isCanceled = true),
  };
};

const useCancellablePromises = () => {
  const pendingPromises = useRef<any[]>([]);

  const appendPendingPromise = (promise: any) => (pendingPromises.current = [...pendingPromises.current, promise]);

  const removePendingPromise = (promise: any) =>
    (pendingPromises.current = pendingPromises.current.filter((p: any) => p !== promise));

  const clearPendingPromises = () => pendingPromises.current.map((p: any) => p.cancel());

  const api = {
    appendPendingPromise,
    removePendingPromise,
    clearPendingPromises,
  };

  return api;
};

const useClickPreventionOnDoubleClick = (onClick: any, onDoubleClick: any) => {
  const api = useCancellablePromises();

  const handleClick = (event: any) => {
    api.clearPendingPromises();
    const waitForClick = cancellablePromise(delay(300));
    api.appendPendingPromise(waitForClick);

    return waitForClick.promise
      .then(() => {
        api.removePendingPromise(waitForClick);
        onClick(event);
      })
      .catch(errorInfo => {
        api.removePendingPromise(waitForClick);
        if (!errorInfo.isCanceled) {
          throw errorInfo.error;
        }
      })
      .catch(() => {});
  };

  const handleDoubleClick = (event: any) => {
    api.clearPendingPromises();
    onDoubleClick(event);
  };

  return [handleClick, handleDoubleClick];
};

export default useClickPreventionOnDoubleClick;
