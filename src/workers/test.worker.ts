// import dagre from "dagre";
onmessage = (e) => {
    const { myNumber } = e.data;
    console.log('----------------------- > TEST_WORKER data', myNumber)
    postMessage({ nn: Math.pow(myNumber, 2) });
};
