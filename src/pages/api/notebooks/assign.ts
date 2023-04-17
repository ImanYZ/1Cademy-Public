import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { checkRestartBatchWriteCounts, commitBatch, db } from "@/lib/firestoreServer/admin";
import { INotebook } from "src/types/INotebook";
import { IUserNode } from "src/types/IUserNode";
import { IUser } from "src/types/IUser";

export type INotebookAssignPayload = {
  notebookId: string;
  user: string;
  role: "viewer" | "editor";
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (String(req.method).toLowerCase() !== "post") {
      throw new Error("only post method allowed");
    }

    const { uname } = req.body?.data?.user?.userData;

    const { notebookId, user, role } = req.body as INotebookAssignPayload;
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
    if (notebookData.owner != uname) {
      throw new Error("Your don't have access to roles");
    }

    const userDoc = await db.collection("users").doc(user).get();
    if (!userDoc.exists) {
      throw new Error(`${user} doesn't exists`);
    }

    const userData = userDoc.data() as IUser;

    notebookData.usersInfo[user] = {
      role,
      chooseUname: !!userData.chooseUname,
      fullname: `${userData.fName} ${userData.lName}`,
      imageUrl: userData.imageUrl,
    };
    if (!notebookData.users.includes(user)) {
      notebookData.users.push(user);
    }

    // updating user nodes
    const userNodes = await db
      .collection("userNodes")
      .where("user", "==", notebookData.owner)
      .where("notebooks", "array-contains", notebookId)
      .get();

    for (const userNode of userNodes.docs) {
      const userNodeData = userNode.data() as IUserNode;
      const _userNodes = await db
        .collection("userNodes")
        .where("user", "==", user)
        .where("node", "==", userNodeData.node)
        .get();
      if (_userNodes.docs.length) {
        const userNodeRef = db.collection("userNodes").doc(_userNodes.docs[0].id);
        const _userNodeData = _userNodes.docs[0].data() as IUserNode;

        _userNodeData.notebooks = _userNodeData.notebooks || [];
        _userNodeData.expands = _userNodeData.expands || [];

        if (_userNodeData.notebooks.indexOf(notebookId) === -1) {
          _userNodeData.notebooks.push(notebookId);
          _userNodeData.expands.push(true);
        }

        batch.update(userNodeRef, {
          notebooks: _userNodeData.notebooks,
          expands: _userNodeData.expands,
        });
      } else {
        const userNodeRef = db.collection("userNodes").doc();
        batch.set(userNodeRef, {
          correct: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deleted: false,
          isStudied: false,
          bookmarked: false,
          changed: false,
          node: userNodeData.node,
          open: true,
          user: user,
          visible: true,
          wrong: false,
          nodeChanges: {},
          notebooks: [notebookId],
          expands: [true],
        } as IUserNode);
      }
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }

    batch.update(notebookRef, {
      users: notebookData.users,
      usersInfo: notebookData.usersInfo,
    });

    commitBatch(batch);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error, success: false });
  }
}

export default fbAuth(handler);
