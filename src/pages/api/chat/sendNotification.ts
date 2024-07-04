import { admin, db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next/types";

import fbAuth from "src/middlewares/fbAuth";
const removeInvalidTokens = async (invalidTokens: { [key: string]: string[] }) => {
  for (let uid in invalidTokens) {
    const fcmTokensDoc = await db.collection("fcmTokens").doc(uid).get();
    if (fcmTokensDoc.exists) {
      const tokens = fcmTokensDoc.data()?.tokens;
      const newTokens = tokens.filter((token: string) => !invalidTokens[uid].includes(token));
      await fcmTokensDoc.ref.update({
        tokens: newTokens,
      });
    }
  }
};
const replaceMentions = (text: string) => {
  let pattern = /\[@(.*?)\]\(\/mention\/.*?\)/g;
  return text.replace(pattern, (match, displayText) => `@${displayText}`);
};

const triggerNotifications = async (newMessage: any) => {
  try {
    const { channelId, roomType, sender, message, subject } = newMessage;
    const fcmTokensHash: { [key: string]: string } = {};
    const fcmTokensDocs = await db.collection("fcmTokens").get();

    for (let fcmToken of fcmTokensDocs.docs) {
      fcmTokensHash[fcmToken.id] = fcmToken.data().tokens;
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
      const membersInfo = channelData.membersInfo;
      console.log(channelData?.members);
      const _member = channelData.members.filter(
        (m: string) => m !== sender && fcmTokensHash.hasOwnProperty(membersInfo[m].uid)
      );
      const invalidTokens: any = {};
      for (let member of _member) {
        const UID = membersInfo[member].uid;

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
          const tokens = fcmTokensHash[UID];
          for (let token of tokens) {
            const payload = {
              token,
              notification: {
                title: `${subject} ${membersInfo[sender].fullname}`,
                body: replaceMentions(message),
              },
              data: {
                notificationType: "chat",
                messageId: newMessage?.parentMessage || newMessage.id,
                roomType,
                channelId,
                messageType: subject.includes("Repl") ? "reply" : "message",
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
                if (
                  error.code === "messaging/invalid-registration-token" ||
                  error.code === "messaging/registration-token-not-registered"
                ) {
                  console.log(`Token ${token} is invalid. Removing token...`);

                  invalidTokens[UID] = [...(invalidTokens[UID] || []), token];
                }
              });
          }
        } catch (error) {}
        await notificationRef.set(newNotification);
      }
      await removeInvalidTokens(invalidTokens);
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
    const { roomType, newMessage, subject } = req.body as any;
    if (uname !== newMessage.sender) {
      throw new Error("");
    }
    console.log({ newMessage, roomType });
    await triggerNotifications({ ...newMessage, roomType, subject });
    return res.status(200).send({});
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: true,
    });
  }
}
export default fbAuth(handler);
