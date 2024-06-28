import type { NextApiRequest, NextApiResponse } from "next";
import { addToQueue } from "./queue/queue";
// import dispatchQueue from "./queue/queue";
async function job1() {
  console.log("Executing job 1...");
  await new Promise(resolve => setTimeout(resolve, 10000)); // Simulate async task
  console.log("Job 1 completed.");
}

async function job2() {
  console.log("Executing job 2...");
  await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate async task
  console.log("Job 2 completed.");
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { data } = req.body as { data: string };

    try {
      console.log(data, "data");
      addToQueue(job1);
      addToQueue(job2);
      // addToQueue("Job 3");
      //   await dispatchQueue.add({ data });.
      res.status(200).json({ message: "Job added to the queue" });
    } catch (error) {
      res.status(500).json({ error: "Failed to add job to the queue" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
