import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IUser } from "src/types/IUser";
import { checkInstantDeleteForNode } from "src/utils/course-helpers";
import { db } from "@/lib/firestoreServer/admin";
import { saveLogs } from "@/lib/firestoreServer/logs";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { nodeId } = req.body;
  const { uname } = req?.body?.data?.user?.userData as IUser;
  try {
    const nodeDoc = await db.collection("nodes").doc(nodeId).get();
    const tagIds = nodeDoc.data()?.tagIds;
    const { courseExist, instantDelete } = await checkInstantDeleteForNode(tagIds, uname, nodeId);
    return res.status(200).json({ courseExist, instantDelete });
  } catch (error: any) {
    console.log(error);
    try {
      await saveLogs({
        uname: uname || "",
        severity: "error",
        nodeId,
        where: "checkInstantDeleteForNode endpoint",
        error: {
          message: error.message,
          stack: error.stack,
        },
        createdAt: new Date(),
      });
    } catch (error) {
      console.log("error saving the log", error);
    }
    return res.status(500).json({ error: true });
  }
}

export default fbAuth(handler);
