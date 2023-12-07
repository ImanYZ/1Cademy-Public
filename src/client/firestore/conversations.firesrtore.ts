import { collection, Firestore, onSnapshot, query, Unsubscribe, where } from "firebase/firestore";
import { IConversation } from "src/chatTypes";
import { SnapshotChangesTypes } from "src/types";

export type conversationChange = {
  data: IConversation & { id: string };
  type: SnapshotChangesTypes;
};

export const getConversationsSnapshot = (
  db: Firestore,
  data: {
    username: string;
  },
  callback: (changes: conversationChange[]) => void
): Unsubscribe => {
  const channelRef = collection(db, "conversations");
  let q = query(channelRef, where("members", "array-contains", data.username));
  const killSnapshot = onSnapshot(q, snapshot => {
    const docChanges = snapshot.docChanges();

    const convDocuments: conversationChange[] = docChanges.map(change => {
      const document = change.doc.data() as IConversation;
      return { type: change.type, data: { id: change.doc.id, ...document }, doc: change.doc };
    });
    callback(convDocuments);
  });
  return killSnapshot;
};
