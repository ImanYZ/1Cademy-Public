import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/lib/firestoreServer/admin";
import { buildProposal } from "@/lib/proposal";

import { NodeType, ProposalInput } from "../../knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const data = req.body.data as ProposalInput;
    const nodeType = req.body.nodeType as NodeType;
    console.log(data, "<===data ==>");
    let proposalNameCollection = "versions";

    if (!proposalNameCollection) {
      return res.status(400).json({ errorMessage: "Cannot send feedback" });
    }

    await db.collection(proposalNameCollection).add({ ...buildProposal({ ...data, nodeType }) });
    res.status(200).json({ results: "successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot send feedback" });
  }
}

export default handler;
