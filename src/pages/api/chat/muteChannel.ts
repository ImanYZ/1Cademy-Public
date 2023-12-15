import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firestoreServer/admin";
import fbAuth from "src/middlewares/fbAuth";

type IMuteChannelPayload = {
  channelId: string;
  muted: boolean;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { uname } = req.body?.data?.user?.userData;
    const { channelId } = req.body as IMuteChannelPayload;
    const channelDoc = await db.collection("channels").doc(channelId).get();
    if (channelDoc.exists) {
      const channelData: any = channelDoc.data();
      channelData.membersInfo[uname].muteChannel = !channelData.membersInfo[uname].muteChannel;
      await channelDoc.ref.update({
        membersInfo: channelData.membersInfo,
      });
    }
    return res.status(200).send({});
  } catch (error) {
    return res.status(500).send({
      error: true,
    });
  }
}
export default fbAuth(handler);
