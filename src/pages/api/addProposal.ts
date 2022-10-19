import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/lib/firestoreServer/admin";
import { buildProposal } from "@/lib/proposal";

import { ProposalInput } from "../../knowledgeTypes";
import { NodeType } from "src/types";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const data = req.body.data as ProposalInput;
    const nodeType = req.body.nodeType as NodeType;

    let proposalNameCollection = "";
    // if (nodeType === NodeType.Advertisement) {
    //   proposalNameCollection = "advertisementVersions";
    // }
    if (nodeType === "Code") {
      proposalNameCollection = "codeVersions";
    }
    if (nodeType === "Concept") {
      proposalNameCollection = "conceptVersions";
    }
    if (nodeType === "Idea") {
      proposalNameCollection = "ideaVersions";
    }
    if (nodeType === "News") {
      proposalNameCollection = "newsVersions";
    }
    // if (nodeType === NodeType.Private) {
    //   proposalNameCollection = "privateVersions";
    // }
    // if (nodeType === NodeType.Profile) {
    //   proposalNameCollection = "profileVersions";
    // }
    if (nodeType === "Question") {
      proposalNameCollection = "questionVersions";
    }
    if (nodeType === "Reference") {
      proposalNameCollection = "referenceVersions";
    }
    if (nodeType === "Relation") {
      proposalNameCollection = "relationVersions";
    }
    // if (nodeType === NodeType.Sequel) {
    //   proposalNameCollection = "sequelVersions";
    // }
    // if (nodeType === NodeType.Tag) {
    //   proposalNameCollection = "tagVersions";
    // }

    if (!proposalNameCollection) {
      return res.status(400).json({ errorMessage: "Cannot send feedback" });
    }

    await db.collection(proposalNameCollection).add({ ...buildProposal(data) });
    res.status(200).json({ results: "successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot send feedback" });
  }
}

export default handler;
