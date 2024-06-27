import { collection, Firestore, onSnapshot, query, Unsubscribe, where } from "firebase/firestore";
import { IChannelMessage } from "src/chatTypes";
import { SnapshotChangesTypes } from "src/types";

export type channelNotificationChange = {
  data: IChannelMessage & { id: string };
  type: SnapshotChangesTypes;
};

export const getUserProposalsSnapshot = (
  db: Firestore,
  data: {
    nodeId: string;
    uname: string;
  },
  callback: (changes: channelNotificationChange[]) => void
): Unsubscribe => {
  const { nodeId, uname } = data;

  const userVersionsRef = collection(db, "userVersions");
  let q = query(userVersionsRef, where("user", "==", uname), where("deleted", "==", false));
  if (nodeId) {
    q = query(userVersionsRef, where("node", "==", nodeId), where("user", "==", uname), where("deleted", "==", false));
  }

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
