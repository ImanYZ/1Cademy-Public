import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firestoreServer/admin";
import fbAuth from "src/middlewares/fbAuth";
import { IChannelMessage } from "src/chatTypes";
import { DocumentData, DocumentReference, FieldValue } from "firebase-admin/firestore";

type IReactOnMessagePayload = {
  message: IChannelMessage & { id: string };
  emoji: string;
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
    const { message, emoji, roomType, action } = req.body as IReactOnMessagePayload;

    let documents = null;
    if (message.parentMessage) {
      documents = await getMessageRef(message.parentMessage, message.channelId, roomType);
    } else {
      documents = await getMessageRef(message.id, message.channelId, roomType);
    }
    const { channelDoc, mDoc } = documents;
    if (!channelDoc.exists && !mDoc.exists) {
      throw new Error("Channel or message doesn't exist!");
    }
    const channelData = channelDoc.data();
    if (!channelData || !channelData.members.includes(uname)) {
      throw new Error("User is not a member of teh channel!");
    }
    if (message.parentMessage) {
      const parentMessage = mDoc.data();
      const replyIdx = parentMessage.replies.findIndex((r: IChannelMessage) => r.id === message.id);
      if (action === "addReaction") {
        parentMessage.replies[replyIdx].reactions.push({ user: uname, emoji });
      } else if (action === "removeReaction") {
        parentMessage.replies[replyIdx].reactions = parentMessage.replies[replyIdx].reactions.filter(
          (r: { user: string; emoji: string }) => r.user === uname && r.emoji !== emoji
        );
      }
      await mDoc.ref.update({ replies: parentMessage.replies });
    } else {
      if (action === "addReaction") {
        await mDoc.ref.update({ reactions: FieldValue.arrayUnion({ user: uname, emoji }) });
      } else if (action === "removeReaction") {
        await mDoc.ref.update({ reactions: FieldValue.arrayRemove({ user: uname, emoji }) });
      }
    }
    return res.status(200).send({});
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: true,
    });
  }
}
export default fbAuth(handler);
