import { collection, doc, Firestore } from "firebase/firestore";

export const newId = (db: Firestore) => {
  const nodeRef = doc(collection(db, "nodes"));
  return nodeRef.id;
};
