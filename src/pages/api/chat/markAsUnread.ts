import { db } from "@/lib/firestoreServer/admin";
import { Timestamp } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next/types";

import fbAuth from "src/middlewares/fbAuth";

const isTimestampGreater = (ts1: Timestamp, ts2: Timestamp) => {
  const seconds1 = ts1.seconds;
  const nanoseconds1 = ts1.nanoseconds;
  const seconds2 = ts2.seconds;
  const nanoseconds2 = ts2.nanoseconds;

  if (seconds1 > seconds2) {
    return true;
  } else if (seconds1 < seconds2) {
    return false;
  } else {
    return nanoseconds1 > nanoseconds2;
  }
};

// const getMessageRef = (messageId: string, channelId: string, roomType: string) => {
//   let channelRef = db.collection("channelMessages").doc(channelId);
//   if (roomType === "direct") {
//     channelRef = db.collection("conversationMessages").doc(channelId);
//   } else if (roomType === "news") {
//     channelRef = db.collection("announcementsMessages").doc(channelId);
//   }
//   return channelRef.collection("messages").doc(messageId);
// };

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { uname } = req.body?.data?.user?.userData;
    const { message, roomType } = req.body as any;

    const notificationQuery = db
      .collection("notifications")
      .where("notify", "==", uname)
      .where("channelId", "==", message.channelId);

    await db.runTransaction(async (t: any) => {
      const notificationDocs = await t.get(notificationQuery);
      // const messageRef = getMessageRef(message?.id || "", message.channelId || "", roomType);
      // const messageDoc = await t.get(messageRef);
      // if (messageDoc.exists) {
      //   const messageData = messageDoc.data();
      //   console.log(messageData, "messageData---messageData");
      //   await t.update(messageRef, {
      //     unread_by: {
      //       ...(messageData.unread || {}),
      //       [uname]: {
      //         unreadMessageId: message.id,
      //       },
      //     },
      //   });
      // }

      for (const notification of notificationDocs.docs) {
        const notificationData = notification.data();
        if (
          isTimestampGreater(notificationData.createdAt, message.createdAt) &&
          notificationData.sender !== uname &&
          !notificationData?.parentMessage
        ) {
          t.update(notification.ref, { seen: false, manualSeen: true });
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
