import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { checkRestartBatchWriteCounts, commitBatch, db } from "@/lib/firestoreServer/admin";
import { IUserNode } from "src/types/IUserNode";
import { INotebook } from "src/types/INotebook";

export type IViewNodePayload = {
  notebookId: string;
  visible: boolean;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (String(req.method).toLowerCase() !== "post") {
      throw new Error("only post method allowed");
    }

    const { uname } = req.body?.data?.user?.userData;

    const { nodeId } = req.query;
    const { notebookId, visible } = req.body as IViewNodePayload;

    let batch = db.batch();
    let writeCounts = 0;

    const notebook = await db
      .collection("notebooks")
      .doc(notebookId as string)
      .get();
    if (!notebook.exists) {
      throw new Error("Notebook doesn't exists");
    }

    // checking role of current user
    const notebookData = notebook.data() as INotebook;
    if (notebookData.owner !== uname && notebookData.usersInfo?.[uname]?.role !== "editor") {
      throw new Error("Only owner or editor can update Notebooks");
    }

    const users: string[] = notebookData.users;
    if (users.indexOf(uname) === -1) {
      users.push(uname);
    }

    // if owner is missing in users
    if (users.indexOf(notebookData.owner) === -1) {
      users.push(notebookData.owner);
    }

    // pushing owner to create user node
    if (users.indexOf(notebookData.owner) === -1) {
      users.push(notebookData.owner);
    }

    // updating user nodes
    for (const user of users) {
      const userNodes = await db
        .collection("userNodes")
        .where("node", "==", nodeId)
        .where("user", "==", user)
        .limit(1)
        .get();
      if (userNodes.docs.length) {
        const userNodeRef = db.collection("userNodes").doc(userNodes.docs[0].id);
        const userNodeData = userNodes.docs[0].data() as IUserNode;

        userNodeData.notebooks = userNodeData.notebooks || [];
        userNodeData.expands = userNodeData.expands || [];

        if (visible && userNodeData.notebooks.indexOf(notebookId) === -1) {
          userNodeData.notebooks.push(notebookId);
          userNodeData.expands.push(true);
        } else if (!visible && userNodeData.notebooks.indexOf(notebookId) !== -1) {
          const notebookIdx = userNodeData.notebooks.indexOf(notebookId);
          userNodeData.notebooks.splice(notebookIdx, 1);
          userNodeData.expands.splice(notebookIdx, 1);
        }

        batch.update(userNodeRef, {
          notebooks: userNodeData.notebooks,
          expands: userNodeData.expands,
        });
      } else if (visible) {
        const userNodeRef = db.collection("userNodes").doc();
        batch.set(userNodeRef, {
          correct: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deleted: false,
          isStudied: false,
          bookmarked: false,
          changed: false,
          node: nodeId,
          open: true,
          user,
          visible: true,
          wrong: false,
          nodeChanges: {},
          notebooks: [notebookId],
          expands: [true],
        } as IUserNode);
      }
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }

    await commitBatch(batch);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error, success: false });
  }
}

export default fbAuth(handler);
