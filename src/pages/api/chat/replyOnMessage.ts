import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firestoreServer/admin";
import fbAuth from "src/middlewares/fbAuth";
import { IChannelMessage } from "src/chatTypes";
import { DocumentData, DocumentReference, FieldValue } from "firebase-admin/firestore";

type IReactOnMessagePayload = {
  curMessage: IChannelMessage & { id: string };
  reply: IChannelMessage;
  roomType: string;
  action: "addReaction" | "removeReaction";
};
const getMessageRef = async (
  messageId: string,
  channelId: string,
  roomType: string
): Promise<{ mDoc: any; channelDoc: any }> => {
  let channelRef = db.collection("channelMessages").doc(channelId);
  if (roomType === "direct") {
    channelRef = db.collection("conversationMessages").doc(channelId);
  } else if (roomType === "news") {
    channelRef = db.collection("announcementsMessages").doc(channelId);
  }
  let _channelRef = db.collection("channels").doc(channelId);
  if (roomType === "direct") {
    _channelRef = db.collection("conversations").doc(channelId);
  }
  const channelDoc = await _channelRef.get();
  const mDoc = await channelRef.collection("messages").doc(messageId).get();
  return { mDoc, channelDoc };
};
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { uname } = req.body?.data?.user?.userData;
    const { leading } = req.body?.data?.user?.userData?.customClaims;

    const { reply, curMessage, roomType } = req.body as IReactOnMessagePayload;

    const { channelDoc, mDoc } = await getMessageRef(curMessage.id, curMessage.channelId, roomType);
    if (!channelDoc.exists && !mDoc.exists) {
      throw new Error("Channel or message doesn't exist!");
    }
    const channelData = channelDoc.data();
    if (!channelData || !channelData.members.includes(uname)) {
      throw new Error("User is not a member of teh channel!");
    }
    reply.sender = uname;
    if (reply.important && !leading.includes(curMessage.channelId)) {
      reply.important = false;
    }
    await mDoc.ref.update({
      replies: FieldValue.arrayUnion({
        ...reply,
        createdAt: new Date(),
        editedAt: new Date(),
        read_by: [],
        pinned: false,
        replies: [],
        edited: false,
        reactions: [],
      }),
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
