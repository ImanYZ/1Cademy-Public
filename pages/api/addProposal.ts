import { NextApiRequest, NextApiResponse } from "next";

import { db } from "../../lib/admin";
import { buildProposal } from "../../lib/proposal";
import { ProposalInput } from "../../src/knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const data = req.body.data as ProposalInput;
    const proposal = buildProposal(data)

    await db.collection("conceptVersions").add({ ...data, createdAt: new Date() });
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot send feedback" });
  }
}

export default handler;
