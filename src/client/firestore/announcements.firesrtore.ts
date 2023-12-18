import { collection, Firestore, onSnapshot, query, Unsubscribe, where } from "firebase/firestore";
import { IAnnouncement } from "src/chatTypes";
import { SnapshotChangesTypes } from "src/types";

export type announcementChange = {
  data: IAnnouncement & { id: string };
  type: SnapshotChangesTypes;
};

export const getAnnouncementsSnapshot = (
  db: Firestore,
  data: {
    username: string;
  },
  callback: (changes: announcementChange[]) => void
): Unsubscribe => {
  const announcementRef = collection(db, "announcements");
  let q = query(announcementRef, where("members", "array-contains", data.username));
  const killSnapshot = onSnapshot(q, snapshot => {
    const docChanges = snapshot.docChanges();

    const convDocuments: announcementChange[] = docChanges.map(change => {
      const document = change.doc.data() as IAnnouncement;
      return { type: change.type, data: { id: change.doc.id, ...document }, doc: change.doc };
    });
    callback(convDocuments);
  });
  return killSnapshot;
};
