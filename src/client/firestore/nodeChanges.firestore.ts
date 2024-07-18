import { collection, Firestore, onSnapshot, query, Unsubscribe } from "firebase/firestore";
import { SnapshotChangesTypes } from "src/types";

export type channelNotificationChange = {
  data: any & { id: string };
  type: SnapshotChangesTypes;
};

export const getNodeChangesSnapshot = (
  db: Firestore,
  callback: (changes: channelNotificationChange[]) => void
): Unsubscribe => {
  const nodeChangeRef = collection(db, "nodeChange");
  let q = query(nodeChangeRef);

  const killSnapshot = onSnapshot(q, snapshot => {
    const docChanges = snapshot.docChanges();

    const actionTrackDocuments: channelNotificationChange[] = docChanges.map(change => {
      const document = change.doc.data() as any;
      return { type: change.type, data: { id: change.doc.id, ...document }, doc: change.doc };
    });
    callback(actionTrackDocuments);
  });
  return killSnapshot;
};
