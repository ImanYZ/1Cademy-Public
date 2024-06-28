import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IUser } from "src/types/IUser";
import { shouldInstantApprovalForProposal } from "src/utils/course-helpers";
import { db } from "@/lib/firestoreServer/admin";
import { saveLogs } from "@/lib/firestoreServer/logs";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  console.log("/api/searchNodesInNotebook...");
  const { nodeId } = req.body;
  const { uname } = req?.body?.data?.user?.userData as IUser;
  try {
    console.log("checkInstantApprovalForProposal", { nodeId, uname });
    if (!nodeId) {
      return res.status(200).json({ isInstructor: true, courseExist: true, instantApprove: true });
    }
    const nodeDoc = await db.collection("nodes").doc(nodeId).get();
    const tagIds = nodeDoc.data()?.tagIds ?? [];
    const { isInstructor, courseExist, instantApprove } = await shouldInstantApprovalForProposal(tagIds, uname);
    console.log(uname, { isInstructor, courseExist, instantApprove });
    return res.status(200).json({ isInstructor, courseExist, instantApprove });
  } catch (error: any) {
    console.log(error);
    try {
      await saveLogs({
        uname: uname || "",
        severity: "error",
        nodeId,
        where: "checkInstantApprovalForProposal endpoint",
        error: {
          message: error.message,
          stack: error.stack,
        },
      });
    } catch (error) {
      console.log("error saving the log", error);
    }
    return res.status(500).json({ error: true });
  }
}

export default fbAuth(handler);
