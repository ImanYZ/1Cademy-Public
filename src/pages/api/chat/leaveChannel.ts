import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firestoreServer/admin";
import fbAuth from "src/middlewares/fbAuth";

type ILeaveChannelPayload = {
  channelId: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { uname } = req.body?.data?.user?.userData;
    const { channelId } = req.body as ILeaveChannelPayload;
    console.log(channelId);
    const channelDoc = await db.collection("channels").doc(channelId).get();
    if (channelDoc.exists) {
      const channelData: any = channelDoc.data();
      const members = channelData.members.filter((m: string) => m !== uname);
      channelData.membersInfo[uname].leftAt = new Date();
      channelData.membersInfo[uname].left = true;
      await channelDoc.ref.update({
        members,
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
