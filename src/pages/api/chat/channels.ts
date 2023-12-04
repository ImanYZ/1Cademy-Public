import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { IChannels } from "src/chatTypes";
import fbAuth from "src/middlewares/fbAuth";
import { IUser } from "src/types/IUser";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userData = req.body.data.user.userData as IUser;

    const channelDocs = await db.collection("channels").where("members", "array-contains", userData.uname).get();
    const channels: IChannels[] = [];
    channelDocs.forEach(doc => {
      const data = doc.data() as IChannels;
      channels.push({
        id: doc.id,
        ...data,
      } as IChannels);
    });

    const response: any = { channels: channels };
    res.status(200).json(response);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ errorMessage: error.message });
  }
}

export default fbAuth(handler);
