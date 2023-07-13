import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IUser } from "src/types/IUser";
import { checkInstantApprovalForProposal } from "src/utils/course-helpers";
import { db } from "@/lib/firestoreServer/admin";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { nodeId } = req.body;
    const { uname } = req?.body?.data?.user?.userData as IUser;
    const nodeDoc = await db.collection("nodes").doc(nodeId).get();
    const tagIds = nodeDoc.data()?.tagIds;

    const { isInstructor, courseExist, instantApprove } = await checkInstantApprovalForProposal(tagIds, uname);
    return res.status(200).json({ isInstructor, courseExist, instantApprove });
  } catch (error) {
    return res.status(500).json({ error: true });
  }
}

export default fbAuth(handler);
