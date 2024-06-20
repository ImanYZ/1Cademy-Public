import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next/types";
import fbAuth from "src/middlewares/fbAuth";

const getChannelRef = (channelId: string, roomType: string) => {
  let channelRef = db.collection("channels").doc(channelId);
  if (roomType === "direct") {
    channelRef = db.collection("conversations").doc(channelId);
  } else if (roomType === "news") {
    channelRef = db.collection("announcementsMessages").doc(channelId);
  }
  return channelRef;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { uname } = req.body?.data?.user?.userData;
    const { channelId, roomType } = req.body as any;

    await db.runTransaction(async (t: any) => {
      const channelRef = getChannelRef(channelId, roomType);
      const channelDoc = await t.get(channelRef);
      if (channelDoc.exists) {
        const channelData = channelDoc.data();
        const membersInfo = {
          ...(channelData?.membersInfo || {}),
          [uname]: { ...channelData?.membersInfo[uname], unreadMessageId: null },
        };
        await t.update(channelRef, { membersInfo });
      }
    });

    return res.status(200).send({});
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: true,
    });
  }
}
export default fbAuth(handler);
