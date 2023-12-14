import { collection, Firestore, onSnapshot, query, Unsubscribe, where } from "firebase/firestore";
import { IChannelMessage } from "src/chatTypes";
import { SnapshotChangesTypes } from "src/types";

export type channelNotificationChange = {
  data: IChannelMessage & { id: string };
  type: SnapshotChangesTypes;
};

export const getchatNotificationsSnapshot = (
  db: Firestore,
  data: {
    username: any;
  },
  callback: (changes: channelNotificationChange[]) => void
): Unsubscribe => {
  const { username } = data;

  const chatNotificationsRef = collection(db, "notifications");

  let q = query(
    chatNotificationsRef,
    where("notify", "==", username),
    where("notificationType", "==", "chat"),
    where("seen", "==", false)
  );

  const killSnapshot = onSnapshot(q, snapshot => {
    const docChanges = snapshot.docChanges();

    const actionTrackDocuments: channelNotificationChange[] = docChanges.map(change => {
      const document = change.doc.data() as IChannelMessage;
      return { type: change.type, data: { id: change.doc.id, ...document }, doc: change.doc };
    });
    callback(actionTrackDocuments);
  });
  return killSnapshot;
};
