import { useRef } from "react";

/* https://medium.com/trabe/prevent-click-events-on-double-click-with-react-with-and-without-hooks-6bf3697abc40 */
const delay = n => new Promise(resolve => setTimeout(resolve, n));

const cancellablePromise = promise => {
  let isCanceled = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      value => (isCanceled ? reject({ isCanceled, value }) : resolve(value)),
      error => reject({ isCanceled, error })
    );
  });

  return {
    promise: wrappedPromise,
    cancel: () => (isCanceled = true),
  };
};

const useCancellablePromises = () => {
  const pendingPromises = useRef([]);

  const appendPendingPromise = promise => (pendingPromises.current = [...pendingPromises.current, promise]);

  const removePendingPromise = promise =>
    (pendingPromises.current = pendingPromises.current.filter(p => p !== promise));

  const clearPendingPromises = () => pendingPromises.current.map(p => p.cancel());

  const api = {
    appendPendingPromise,
    removePendingPromise,
    clearPendingPromises,
  };

  return api;
};

const useClickPreventionOnDoubleClick = (onClick, onDoubleClick) => {
  const api = useCancellablePromises();

  const handleClick = event => {
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
      .catch(e => {});
  };

  const handleDoubleClick = event => {
    api.clearPendingPromises();
    onDoubleClick(event);
  };

  return [handleClick, handleDoubleClick];
};

export default useClickPreventionOnDoubleClick;
