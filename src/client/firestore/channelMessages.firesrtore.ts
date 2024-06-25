import {
  collection,
  doc,
  Firestore,
  limit,
  // limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  // startAfter,
  Unsubscribe,
} from "firebase/firestore";
import { IChannelMessage } from "src/chatTypes";
import { SnapshotChangesTypes } from "src/types";

export type channelMessagesChange = {
  data: IChannelMessage & { id: string };
  type: SnapshotChangesTypes;
};

export const getChannelMessagesSnapshot = (
  db: Firestore,
  data: {
    lastVisible: any;
    channelId: string;
    roomType: string;
  },
  callback: (changes: channelMessagesChange[]) => void
): Unsubscribe => {
  const { channelId, roomType, lastVisible } = data;
  const pageSize = 8;
  let channelRef = doc(db, "channelMessages", channelId);
  if (roomType === "direct") {
    channelRef = doc(db, "conversationMessages", channelId);
  } else if (roomType === "news") {
    channelRef = doc(db, "announcementsMessages", channelId);
  }

  const messageRef = collection(channelRef, "messages");

  let q = query(messageRef, orderBy("createdAt", "desc"), limit(pageSize));

  if (lastVisible) {
    q = query(messageRef, orderBy("createdAt", "desc"), startAfter(lastVisible), limit(pageSize));
  }
  console.log(lastVisible, "lastVisible--lastVisible");
  const killSnapshot = onSnapshot(q, snapshot => {
    const docChanges = snapshot.docChanges();

    const actionTrackDocuments: channelMessagesChange[] = docChanges.map(change => {
      const document = change.doc.data() as IChannelMessage;
      return { type: change.type, data: { id: change.doc.id, ...document }, doc: change.doc };
    });
    callback(actionTrackDocuments);
  });
  return killSnapshot;
};
