import { collection, doc, Firestore, onSnapshot, query, Unsubscribe } from "firebase/firestore";
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
  const actionTrackRef = collection(channelRef, "messages");

  // Todo: we use actionTracks24h because because that is removed automatically after 24h
  let q = query(actionTrackRef);

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
