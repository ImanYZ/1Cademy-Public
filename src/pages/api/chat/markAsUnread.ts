import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next/types";

import fbAuth from "src/middlewares/fbAuth";

const getMessageRef = (messageId: string, channelId: string, roomType: string) => {
  let channelRef = db.collection("channelMessages").doc(channelId);
  if (roomType === "direct") {
    channelRef = db.collection("conversationMessages").doc(channelId);
  } else if (roomType === "news") {
    channelRef = db.collection("announcementsMessages").doc(channelId);
  }
  return channelRef.collection("messages").doc(messageId);
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { uname } = req.body?.data?.user?.userData;
    const { message, roomType } = req.body as any;
    const notificationQuery = db.collection("notifications").where("channelId", "==", message.channelId);

    await db.runTransaction(async (t: any) => {
      const notificationDocs = await t.get(notificationQuery);
      const messageIds: string[] = [];
      const selectedMessageNotification = notificationDocs.docs.find(
        (notification: any) => notification.data().id === message?.id || notification.data().messageId === message?.id
      );
      const selectedMessageNotificationData = selectedMessageNotification?.data();
      const selectedMessageNotificationCreatedAt =
        selectedMessageNotificationData?.createdAt?.toDate()?.getTime() || new Date(message.createdAt).getTime();
      for (const notification of notificationDocs.docs) {
        const notificationData = notification.data();
        const notificationCreatedAt = notificationData.createdAt.toDate().getTime();
        if (
          notificationCreatedAt >= selectedMessageNotificationCreatedAt - 1500 &&
          (notificationData.subject == "New Message from" || !notificationData?.subject) &&
          notificationData.sender !== uname &&
          notificationData.notify === uname &&
          !notificationData?.parentMessage
        ) {
          if (!messageIds.includes(notificationData?.id || notificationData?.messageId)) {
            const messageDoc = await getMessageRef(
              notificationData?.id || notificationData?.messageId,
              message.channelId,
              roomType
            ).get();
            if (messageDoc.exists) {
              if (!messageDoc.data()?.deleted) {
                t.update(notification.ref, { seen: false, manualSeen: true });
                messageIds.push(notificationData.id);
              }
            }
          }
        }
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
