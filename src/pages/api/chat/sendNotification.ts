import { admin, db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next/types";

import fbAuth from "src/middlewares/fbAuth";

const triggerNotifications = async (newMessage: any) => {
  try {
    const { channelId, roomType, sender, message } = newMessage;
    const fcmTokensHash: { [key: string]: string } = {};
    const fcmTokensDocs = await db.collection("fcmTokens").get();

    for (let fcmToken of fcmTokensDocs.docs) {
      fcmTokensHash[fcmToken.id] = fcmToken.data().token;
    }

    let channelRef = db.collection("channels").doc(channelId);
    if (roomType === "direct") {
      channelRef = db.collection("conversations").doc(channelId);
    }
    const channelDoc = await channelRef.get();

    const channelData = channelDoc.data();

    if (roomType === "news") {
      await channelRef.update({
        newsUpdatedAt: new Date(),
      });
    } else {
      await channelRef.update({
        updatedAt: new Date(),
      });
    }
    console.log(fcmTokensHash);
    if (channelData) {
      console.log(channelData?.members);
      const _member = channelData.members.filter((m: string) => m !== sender);
      for (let member of _member) {
        const newNotification = {
          ...newMessage,
          roomType,
          createdAt: new Date(),
          seen: false,
          notify: member,
          notificationType: "chat",
        };
        const notificationRef = db.collection("notifications").doc();
        try {
          const token = fcmTokensHash[channelData.membersInfo[member].uid];
          const payload = {
            token,
            notification: {
              title: "Expense Tracker: Your expense has been processed",
              body: message,
            },
          };
          console.log(admin.messaging());
          console.log(payload);
          admin
            .messaging()
            .send(payload)
            .then((response: any) => {
              console.log("Successfully sent message: ", response);
            })
            .catch((error: any) => {
              console.log("error: ", error);
            });
        } catch (error) {}
        await notificationRef.set(newNotification);
      }
    }

    console.log("documents created");
  } catch (error) {
    console.log(error);
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { uname } = req.body?.data?.user?.userData;
    // const { leading } = req.body?.data?.user?.userData?.customClaims || {};
    const { roomType, newMessage } = req.body as any;
    if (uname !== newMessage.sender) {
      throw new Error("");
    }
    console.log({ newMessage, roomType });
    await triggerNotifications({ ...newMessage, roomType });
    return res.status(200).send({});
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: true,
    });
  }
}
export default fbAuth(handler);
