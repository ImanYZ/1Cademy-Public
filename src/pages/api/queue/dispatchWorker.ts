// workers/dispatchWorker.ts

import dispatchQueue from "./queue";

dispatchQueue.process(async job => {
  const { data }: any = job;

  try {
    console.log(`Processing job: ${data}`);

    await performDispatch(data);
    return Promise.resolve();
  } catch (error) {
    console.error(`Failed to process job: ${data}`, error);
    return Promise.reject(error);
  }
});

async function performDispatch(data: string): Promise<void> {
  // Simulate an asynchronous operation
  return new Promise(resolve => setTimeout(resolve, 1000));
}
