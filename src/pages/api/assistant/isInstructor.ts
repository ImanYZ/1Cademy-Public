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
    console.log(userData);
    const instrutor = await db.collection("instructors").where("uname", "==", userData.uname).get();
    if (instrutor.docs.length) {
      return res.status(200).send(false);
    } else {
      return res.status(200).send(false);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default fbAuth(handler);
