onmessage = (e) => {
    const { myNumber } = e.data;
    console.log('----------------------- > get data in worker', myNumber)
    postMessage({ nn: Math.pow(myNumber, 2) });
};
