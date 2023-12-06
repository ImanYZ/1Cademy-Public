import { collection, doc, Firestore, /* limit, */ onSnapshot, orderBy, query, Unsubscribe } from "firebase/firestore";
import { IChannelMessage } from "src/chatTypes";
import { SnapshotChangesTypes } from "src/types";

export type channelMessagesChange = {
  data: IChannelMessage & { id: string };
  type: SnapshotChangesTypes;
};

export const getChannelMesasgesSnapshot = (
  db: Firestore,
  data: {
    // lastVisible: any;
    channelId: string;
  },
  callback: (changes: channelMessagesChange[]) => void
): Unsubscribe => {
  const { channelId } = data;

  const channelRef = doc(db, "channelMessages", channelId);
  const messageRef = collection(channelRef, "messages");

  let q = query(messageRef, orderBy("createdAt", "asc") /* , limit(10) */);
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
