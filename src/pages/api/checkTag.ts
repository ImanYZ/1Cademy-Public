import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";

import fbAuth from "src/middlewares/fbAuth";
import { ISemester } from "src/types/ICourse";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";
import { arrayToChunks } from "src/utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { tagId } = req.body;
    const userData = req?.body?.data?.user?.userData as IUser;
    const tagNode = await db.collection("nodes").doc(tagId).get();
    const nodeData = tagNode.data() as INode;
    if (!tagNode.exists || nodeData.deleted) {
      return res.status(400).json({ message: "node doesn't exists", success: false });
    }

    if (!nodeData.locked) {
      return res.status(200).json({ success: true });
    } else {
      const tagIds: string[] = [tagId];
      nodeData.parents.forEach(parent => {
        if (parent.node) {
          tagIds.push(parent.node);
        }
      });
      const tagIdChunks = arrayToChunks(tagIds, 10);
      for (const tagIds of tagIdChunks) {
        const semesters = await db.collection("semesters").where("__name__", "in", tagIds).get();
        if (semesters.docs.length) {
          // Check if student is present in any of semesters related to tagIds
          for (const semester of semesters.docs) {
            const semesterData = semester.data() as ISemester;
            const studentIdx = semesterData.students.findIndex(student => student.uname === userData.uname);
            if (studentIdx !== -1) {
              return res.status(200).json({ success: true });
            }
          }
        }
      }
      return res.status(400).json({ success: false });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to process your request", success: false });
  }
}

export default fbAuth(handler);
