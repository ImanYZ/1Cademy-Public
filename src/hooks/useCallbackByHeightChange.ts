import { useCallback, useRef } from 'react';


export const useCallbackByHeightChange = (callback: (height: number) => void) => {
    const INITIAL_HEIGHT = 1;
    const previousHeight = useRef(INITIAL_HEIGHT);

    const setRef = useCallback((node: HTMLDivElement) => {
        if (!node) return;

        const currentHeight = node.offsetHeight;
        console.log('.', 'cur:', node.offsetHeight, 'prev', previousHeight.current, currentHeight === previousHeight.current)
        if (currentHeight === previousHeight.current) return;

        previousHeight.current = currentHeight;
        callback(currentHeight);
    }, [callback]);

    return { setRef };
};