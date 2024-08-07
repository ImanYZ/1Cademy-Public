import { NextApiRequest, NextApiResponse } from "next";

import { getNodeDataForCourse } from "@/lib/firestoreServer/nodes";

import { ResponseNodeData } from "../../knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseNodeData>) {
  try {
    const { nodeId } = req.body;
    if (!nodeId) {
      throw Error("invalid node");
    }

    const data = await getNodeDataForCourse(nodeId);
    if (!data) {
      throw Error("invalid node");
    }

    const response: ResponseNodeData = { results: data };
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot get node" });
  }
}

export default handler;
