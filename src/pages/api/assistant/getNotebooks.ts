import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IUser } from "src/types/IUser";

type INotebookDocument = { title: string; conversation?: boolean } & { [key: string]: any };

type INotebook = INotebookDocument & { documentId: string };

export type IAssistantGetNotebooksPayload = {
  includeConversations?: boolean;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const userData = req.body.data.user.userData as IUser;

    const payload = req.body as IAssistantGetNotebooksPayload;
    const notebooks = await db.collection("notebooks").where("owner", "==", userData.uname).get();

    const notebooksProcessed: INotebook[] = payload?.includeConversations
      ? notebooks.docs.map(doc => ({ documentId: doc.id, ...(doc.data() as INotebookDocument) }))
      : notebooks.docs
          .filter(doc => !doc.data()?.conversation)
          .map(doc => ({ documentId: doc.id, ...(doc.data() as INotebookDocument) }));

    return res.status(200).json(notebooksProcessed);
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default fbAuth(handler);
