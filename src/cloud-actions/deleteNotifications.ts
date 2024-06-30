import { batchDelete, commitBatch, db } from "./utils/admin";
type DeleteNotifications = {
  message: any;
};
export const deleteNotifications = async ({ message }: DeleteNotifications) => {
  try {
    const notificationsDocs = await db.collection("notifications").where("id", "==", message.messageId).get();

    for (let doc of notificationsDocs.docs) {
      console.log("doc", doc.id);
      batchDelete(doc.ref);
    }
    await commitBatch();
  } catch (error) {
    console.log(error);
  }
};
