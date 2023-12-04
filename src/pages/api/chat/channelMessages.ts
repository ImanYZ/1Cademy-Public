import { admin, db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { IChannelMessage } from "src/chatTypes";
import fbAuth from "src/middlewares/fbAuth";
import { IUser } from "src/types/IUser";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userData = req.body.data.user.userData as IUser;
    const channelId = req.body.data.channelId;
    if (!channelId) {
      return res.status(400).json({ message: "Please provide channelId." });
    }
    const channelDocs = await db
      .collection("channels")
      .where("members", "array-contains", userData.uname)
      .where(admin.firestore.FieldPath.documentId(), "==", channelId)
      .get();
    const isChannelExists = !channelDocs.empty;
    if (!isChannelExists) {
      return res.status(400).json({ message: "Please provide correct channelId." });
    }

    const channelMessageDocs = await db.collection("channelMessages").where("channelId", "==", channelId).get();
    const channelMessages: IChannelMessage[] = [];
    channelMessageDocs.forEach(doc => {
      const data = doc.data() as IChannelMessage;
      channelMessages.push({
        id: doc.id,
        ...data,
      } as IChannelMessage);
    });

    const response: any = { channelMessages };
    res.status(200).json(response);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ errorMessage: error.message });
  }
}

export default fbAuth(handler);
