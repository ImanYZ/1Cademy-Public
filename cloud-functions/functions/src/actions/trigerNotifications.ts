import { db } from "../admin";
type ItrigerNotifications = {
  message: any;
};
export const trigerNotifications = async ({ message }: ItrigerNotifications) => {
  try {
    const { channelId } = message;

    let channelRef = db.collection("channels").doc(channelId);
    if (message.chatType === "direct") {
      channelRef = db.collection("conversations").doc(channelId);
    }
    const channelDoc = await channelRef.get();

    const channelData = channelDoc.data();
    console.log(channelId);
    if (message.chatType === "announcement") {
      await channelRef.update({
        newsUpdatedAt: new Date(),
      });
    } else {
      await channelRef.update({
        updatedAt: new Date(),
      });
    }

    if (channelData) {
      for (let member of channelData.members.filter((m: string) => m !== message.sender)) {
        const newNotification = { ...message, seen: false, notify: member, notificationType: "chat" };
        const notificationRef = db.collection("notifications").doc();
        await notificationRef.set(newNotification);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
