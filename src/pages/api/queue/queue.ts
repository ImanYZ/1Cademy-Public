let jobQueue: any = [];
let isProcessing = false;

export async function addToQueue(job: any) {
  jobQueue.push(job);
  console.log(`New Job added to queue`, isProcessing);

  if (!isProcessing) {
    isProcessing = true;
    await processQueue();
  }
}

async function processQueue() {
  if (jobQueue.length > 0) {
    const job = jobQueue.shift();
    await performDispatch(job);
    await processQueue();
  } else {
    isProcessing = false;
    console.log("done processing jobs");
  }
}

async function performDispatch(job: any) {
  console.log("processing a job");
  await job();
  console.log("job done");
}
