import { useCallback, useEffect, useRef } from 'react';


export const useCallbackByHeightChange = (callback: (height: number) => void) => {
    const INITIAL_HEIGHT = 1;
    const previousHeight = useRef(INITIAL_HEIGHT);
    const divRef = useRef<HTMLDivElement>(null);

    // const setRef = useCallback((node: HTMLDivElement) => {
    //     if (!node) return;

    //     const currentHeight = node.offsetHeight;
    //     console.log('.', 'cur:', node.offsetHeight, 'prev', previousHeight.current, currentHeight === previousHeight.current)
    //     if (currentHeight === previousHeight.current) return;

    //     previousHeight.current = currentHeight;
    //     callback(currentHeight);
    // }, [callback]);

    // IMPORTANT in every render
    useEffect(() => {
        if (!divRef?.current) return;

        const currentHeight = divRef.current.offsetHeight;
        console.log('.', 'cur:', currentHeight, 'prev', previousHeight.current, currentHeight === previousHeight.current);
        if (currentHeight === previousHeight.current) return;

        previousHeight.current = currentHeight;
        callback(currentHeight);
    });

    return { divRef };
};