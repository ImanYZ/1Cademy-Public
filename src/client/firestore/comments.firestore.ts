import {
  collection,
  Firestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  Unsubscribe,
  where,
} from "firebase/firestore";
import { IComment } from "src/commentTypes";
import { SnapshotChangesTypes } from "src/types";

export type commentChange = {
  data: IComment & { id: string };
  type: SnapshotChangesTypes;
};

export const getCommentsSnapshot = (
  db: Firestore,
  data: {
    lastVisible: any;
    refId: string;
    type: string;
  },
  callback: (changes: commentChange[]) => void
): Unsubscribe => {
  const { refId, type, lastVisible } = data;
  const pageSize = 15;
  let commentRef = collection(db, "versionComments");
  if (type === "node") {
    commentRef = collection(db, "nodeComments");
  }

  let q = query(commentRef, where("refId", "==", refId), where("deleted", "==", false), limit(pageSize));

  if (lastVisible) {
    q = query(
      commentRef,
      where("refId", "==", refId),
      where("deleted", "==", false),
      orderBy("createdAt", "desc"),
      startAfter(lastVisible),
      limit(pageSize)
    );
  }

  const killSnapshot = onSnapshot(q, snapshot => {
    const docChanges = snapshot.docChanges();

    const actionTrackDocuments: commentChange[] = docChanges.map(change => {
      const document = change.doc.data() as IComment;
      return { type: change.type, data: { id: change.doc.id, ...document }, doc: change.doc };
    });
    callback(actionTrackDocuments);
  });
  return killSnapshot;
};
