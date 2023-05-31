import { admin, db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";
import { generateGpt4QueryResultV2, topGoogleSearchResults, topTypesenseSearch } from "src/utils/assistant-helpers";

export type IBardQueryRequestPayload = {
  commands: string[];
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const payload = req.body as IBardQueryRequestPayload;

    // Course Id
    const tagId: string = "HjIukJr12fIP9DNoD9gX";

    let userData: IUser | undefined = undefined;
    // loading user document if authorization provided
    let token = (req.headers.authorization || req.headers.Authorization || "") as string;
    token = token.replace("Bearer ", "").trim();
    if (token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (decodedToken) {
          const users = await db.collection("users").where("userId", "==", decodedToken.uid).limit(1).get();
          if (users.docs.length) {
            userData = users.docs[0].data() as IUser;
          }
        }
      } catch (e) {}
    }

    let tagTitle: string = "";
    if (tagId) {
      const tagDoc = await db.collection("nodes").doc(tagId).get();
      if (tagDoc.exists) {
        const tag = tagDoc.data() as INode;
        tagTitle = tag.title;
      }
    }

    const _nodeIds: Set<string> = new Set();
    for (const command of payload.commands) {
      let nodeIds: string[] = [];
      const googleNodeIds = await topGoogleSearchResults(command, 10, tagTitle);
      if (googleNodeIds.length) {
        nodeIds = googleNodeIds;
      } else {
        nodeIds = await topTypesenseSearch(command, 10, tagTitle);
      }

      for (const nodeId of nodeIds) {
        _nodeIds.add(nodeId);
      }
    }

    const nodeIds = Array.from(_nodeIds);
    const nodes = await generateGpt4QueryResultV2(nodeIds, userData);

    // If was able to get information from knowledge graph
    return res.status(200).json({
      nodes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default handler;
