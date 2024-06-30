import { admin, batchSet, batchUpdate, commitBatch, db } from "./utils/admin";
type ITriggerNotifications = {
  message: any;
};
export const triggerNotifications = async ({ message }: ITriggerNotifications) => {
  try {
    const { channelId } = message;
    const fcmTokensHash: { [key: string]: string } = {};
    const fcmTokensDocs = await db.collection("fcmTokens").get();

    for (let fcmToken of fcmTokensDocs.docs) {
      fcmTokensHash[fcmToken.id] = fcmToken.data().token;
    }

    let channelRef = db.collection("channels").doc(channelId);
    if (message.chatType === "direct") {
      channelRef = db.collection("conversations").doc(channelId);
    }
    const channelDoc = await channelRef.get();

    const channelData = channelDoc.data();

    if (message.chatType === "announcement") {
      batchUpdate(channelRef, {
        newsUpdatedAt: new Date(),
      });
    } else {
      batchUpdate(channelRef, {
        updatedAt: new Date(),
      });
    }
    console.log(fcmTokensHash);
    if (channelData) {
      console.log(channelData?.members);
      const _member = channelData.members.filter((m: string) => m !== message.sender);
      for (let member of _member) {
        const newNotification = { ...message, seen: false, notify: member, notificationType: "chat" };
        const notificationRef = db.collection("notifications").doc();
        const payload = {
          token: fcmTokensHash[channelData.membersInfo[member].uid],
          notification: {
            title: "New Message",
            body: message.message,
          },
        };
        console.log(payload);
        admin
          .messaging()
          .send(payload)
          .then(response => {
            console.log(response);
          })
          .catch(error => {
            console.log("error: ", error);
          });
        batchSet(notificationRef, newNotification);
      }
    }
    await commitBatch();
    console.log("documents created");
  } catch (error) {
    console.log(error);
  }
};
