import { collection, Firestore, onSnapshot, query, Unsubscribe, where } from "firebase/firestore";
import { SnapshotChangesTypes } from "src/types";
import { IActionTrack } from "src/types/IActionTrack";

export type ActionsTracksChange = {
  data: IActionTrack & { id: string };
  type: SnapshotChangesTypes;
};

export const getActionTrackSnapshot = (
  db: Firestore,
  data: {
    rewindDate: Date;
  },
  callback: (changes: ActionsTracksChange[]) => void
): Unsubscribe => {
  const actionTrackRef = collection(db, "actionTracks");
  // INFO: when create assignments, change user to assignment and update DB with a script
  const q = query(actionTrackRef, where("createdAt", ">", data.rewindDate));
  const killSnapshot = onSnapshot(q, snapshot => {
    const docChanges = snapshot.docChanges();

    const actionTrackDocuments: ActionsTracksChange[] = docChanges.map(change => {
      const document = change.doc.data() as IActionTrack;
      return { type: change.type, data: { id: change.doc.id, ...document } };
    });

    callback(actionTrackDocuments);
  });
  return killSnapshot;
};
