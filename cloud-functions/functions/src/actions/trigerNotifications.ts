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
    await channelRef.update({
      updatedAt: new Date(),
    });
    if (channelData) {
      for (let member of channelData.members.filter((m: string) => m !== message.sender)) {
        const newNotification = { ...message, seen: false, notify: member };
        const notificationRef = db.collection("chatNotifications").doc();
        await notificationRef.set(newNotification);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
