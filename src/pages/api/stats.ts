import { NextApiRequest, NextApiResponse } from "next";

import { getStats } from "@/lib/firestoreServer/stats";

import { StatsSchema } from "../../knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<StatsSchema>) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    const stats = await getStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500);
  }
}

export default handler;
