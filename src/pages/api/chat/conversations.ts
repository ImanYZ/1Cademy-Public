import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { IConversation } from "src/chatTypes";
import fbAuth from "src/middlewares/fbAuth";
import { IUser } from "src/types/IUser";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userData = req.body.data.user.userData as IUser;

    const conversationDocs = await db
      .collection("conversations")
      .where("users", "array-contains", userData.uname)
      .get();
    const conversations: IConversation[] = [];
    conversationDocs.forEach(doc => {
      const data = doc.data() as IConversation;
      conversations.push({
        id: doc.id,
        ...data,
      } as IConversation);
    });

    const response: any = { results: conversations };
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot get node" });
  }
}

export default fbAuth(handler);
