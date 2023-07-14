import { devLog } from "../lib/utils/develop.util";

type DetectElementInput = {
  ids: string[];
  delay?: number;
  tries?: number;
};

/**
 * tries = 30 and delay = 1000, means will try 30s
 */
export const detectElements = ({
  ids,
  delay = 1000,
  tries = 30,
}: DetectElementInput): Promise<{ [key: string]: HTMLElement | null } | null> => {
  return new Promise((resolve, reject) => {
    if (!ids.length) return resolve(null);

    devLog("DETECT_ELEMENT", { ids });
    let elementsRef: (HTMLElement | null)[] = new Array(ids.length).fill(null);
    let tryNumber = 0;

    const interval = setInterval(() => {
      try {
        tryNumber += 1;
        ids.forEach((cur, idx) => {
          if (elementsRef[idx]) return;
          const element = document.getElementById(cur);
          if (element) elementsRef[idx] = element;
        });
        if (elementsRef.every(cur => Boolean(cur))) {
          clearInterval(interval);
          const elementsDetected = elementsRef.reduce((acu, cur, idx) => ({ ...acu, [ids[idx]]: cur }), {});
          resolve(elementsDetected);
        }
        if (tryNumber >= tries) {
          clearInterval(interval);
          resolve(null);
        }
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
};
