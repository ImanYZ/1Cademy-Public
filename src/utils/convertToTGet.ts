import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Query,
  QuerySnapshot,
  Transaction,
} from "firebase-admin/firestore";

export const convertToTGet = (q: Query | DocumentReference, t: Transaction | null): Promise<any> => {
  if (t) {
    return t.get(q as DocumentReference);
  }
  return q.get();
};
