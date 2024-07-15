import { collection, doc, Firestore, getDoc, onSnapshot, query, Unsubscribe, where } from "firebase/firestore";
import { IChannels } from "src/chatTypes";
import { SnapshotChangesTypes } from "src/types";

export type channelsChange = {
  data: IChannels & { id: string };
  type: SnapshotChangesTypes;
};

export const getChannelsSnapshot = (
  db: Firestore,
  data: {
    username: string;
  },
  callback: (changes: channelsChange[]) => void
): Unsubscribe => {
  const channelRef = collection(db, "channels");
  console.log({ data: data.username });
  let q = query(channelRef, where("members", "array-contains", data.username));
  const killSnapshot = onSnapshot(q, snapshot => {
    const docChanges = snapshot.docChanges();

    const channelDocuments: channelsChange[] = docChanges.map(change => {
      const document = change.doc.data() as IChannels;
      return { type: change.type, data: { id: change.doc.id, ...document }, doc: change.doc };
    });
    callback(channelDocuments);
  });
  return killSnapshot;
};

export const getSelectedChannel = async (db: Firestore, roomType: string, channelId: string) => {
  if (!channelId || !roomType) return;
  let channelRef = doc(db, "channels", channelId);
  if (roomType === "direct") {
    channelRef = doc(db, "conversations", channelId);
  }

  const channelDoc = await getDoc(channelRef);
  if (channelDoc.exists()) {
    return { ...channelDoc.data(), id: channelDoc.id } as IChannels;
  }
  return false;
};
