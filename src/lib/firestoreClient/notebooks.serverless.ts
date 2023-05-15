import { doc, Firestore, updateDoc } from "firebase/firestore";

export const updateNotebookTag = async (
  db: Firestore,
  notebookId: string,
  data: { defaultTagId: string; defaultTagName: string }
) => {
  // console.log('first')
  const notebookRef = doc(db, "notebook", notebookId);
  await updateDoc(notebookRef, data);
};
