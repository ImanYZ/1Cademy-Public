import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { INode } from "src/types/INode";
import { INodeType } from "src/types/INodeType";
import { arrayToChunks } from "src/utils";
import { typesenseReferenceNodeSearch } from "src/utils/assistant-helpers";

export type IAssistantGetReferenceNodesPayload = {
  query: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const payload = req.body as IAssistantGetReferenceNodesPayload;
    const nodeIds = await typesenseReferenceNodeSearch(payload.query);

    const referenceNodes: {
      id: string;
      title: string;
      content: string;
      type: INodeType;
    }[] = [];

    const nodeIdsChunk = arrayToChunks(nodeIds, 10);
    for (const nodeIds of nodeIdsChunk) {
      const nodes = await db.collection("nodes").where("__name__", "in", nodeIds).limit(nodeIds.length).get();
      for (const node of nodes.docs) {
        const nodeData = node.data() as INode;
        referenceNodes.push({
          id: node.id,
          title: nodeData.title,
          content: nodeData.content,
          type: nodeData.nodeType,
        });
      }
    }

    return res.status(200).json(referenceNodes);
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default handler;
