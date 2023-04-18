import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { checkRestartBatchWriteCounts, commitBatch, db } from "@/lib/firestoreServer/admin";
import { INotebook } from "src/types/INotebook";
import { IUserNode } from "src/types/IUserNode";

export type INotebookDeletePayload = {
  notebookId: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (String(req.method).toLowerCase() !== "delete") {
      throw new Error("only delete method allowed");
    }

    const { uname } = req.body?.data?.user?.userData;

    const { notebookId } = req.body as INotebookDeletePayload;
    if (!notebookId) {
      throw new Error("Notebook doesn't exists");
    }

    let batch = db.batch();
    let writeCounts = 0;

    const notebook = await db
      .collection("notebooks")
      .doc(notebookId as string)
      .get();
    if (!notebook.exists) {
      throw new Error("Notebook doesn't exists");
    }

    const notebookRef = db.collection("notebooks").doc(notebook.id);

    // checking role of current user
    const notebookData = notebook.data() as INotebook;
    if (notebookData.owner !== uname) {
      throw new Error("Only owner can delete Notebooks");
    }

    // updating user nodes
    const userNodes = await db.collection("userNodes").where("notebooks", "array-contains", notebookId).get();
    for (const userNode of userNodes.docs) {
      const userNodeRef = db.collection("userNodes").doc(userNode.id);
      const userNodeData = userNode.data() as IUserNode;
      const notebookIdx = userNodeData.notebooks!.indexOf(notebookId as string);
      // removing deleted notebook from userNode
      userNodeData.notebooks!.splice(notebookIdx, 1);
      batch.update(userNodeRef, {
        notebooks: userNodeData.notebooks,
        updatedAt: new Date(),
      });
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }

    // deleting notebook document itself
    batch.delete(notebookRef);

    await commitBatch(batch);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error, success: false });
  }
}

export default fbAuth(handler);
