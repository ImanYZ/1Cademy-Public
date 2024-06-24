import type { NextApiRequest, NextApiResponse } from "next";
import dispatchQueue from "./queue";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { data } = req.body as { data: string };

    try {
      await dispatchQueue.add({ data });
      res.status(200).json({ message: "Job added to the queue" });
    } catch (error) {
      res.status(500).json({ error: "Failed to add job to the queue" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
