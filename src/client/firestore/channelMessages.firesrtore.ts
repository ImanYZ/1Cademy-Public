import {
  collection,
  doc,
  Firestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  Unsubscribe,
} from "firebase/firestore";
import { IChannelMessage } from "src/chatTypes";
import { SnapshotChangesTypes } from "src/types";

export type channelMessagesChange = {
  data: IChannelMessage & { id: string };
  type: SnapshotChangesTypes;
};

export const getChannelMesasgesSnapshot = (
  db: Firestore,
  data: {
    lastVisible: any;
    channelId: string;
    roomType: string;
  },
  callback: (changes: channelMessagesChange[]) => void
): Unsubscribe => {
  const { channelId, roomType, lastVisible } = data;
  let channelRef = doc(db, "channelMessages", channelId);
  if (roomType === "direct") {
    channelRef = doc(db, "conversationMessages", channelId);
  }

  const messageRef = collection(channelRef, "messages");

  let q = query(messageRef, orderBy("createdAt", "desc"), limit(10));

  if (lastVisible) {
    q = query(messageRef, orderBy("createdAt", "desc"), startAfter(lastVisible), limit(10));
  }
  const killSnapshot = onSnapshot(q, snapshot => {
    const docChanges = snapshot.docChanges();

    const actionTrackDocuments: channelMessagesChange[] = docChanges.map(change => {
      const document = change.doc.data() as IChannelMessage;
      console.log({ documentDDSSS: document });
      return { type: change.type, data: { id: change.doc.id, ...document }, doc: change.doc };
    });
    callback(actionTrackDocuments);
  });
  return killSnapshot;
};