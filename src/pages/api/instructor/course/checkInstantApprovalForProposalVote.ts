import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IUser } from "src/types/IUser";
import { checkInstantApprovalForProposalVote } from "src/utils/course-helpers";
import { db } from "@/lib/firestoreServer/admin";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { nodeId, verisonType, versionId } = req.body;
    const { uname } = req?.body?.data?.user?.userData as IUser;
    const nodeDoc = await db.collection("nodes").doc(nodeId).get();
    const tagIds = nodeDoc.data()?.tagIds;
    const { courseExist, instantApprove, isInstructor } = await checkInstantApprovalForProposalVote(
      tagIds,
      uname,
      verisonType,
      versionId
    );
    return res.status(200).json({ courseExist, instantApprove, isInstructor });
  } catch (error) {
    return res.status(500).json({ error: true });
  }
}

export default fbAuth(handler);
