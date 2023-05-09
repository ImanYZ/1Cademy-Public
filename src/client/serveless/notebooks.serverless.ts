import { doc, Firestore, getDoc, updateDoc } from "firebase/firestore";

import { Notebook, NotebookDocument, NotebookUserRole } from "../../types";
import { getUserByUname } from "./users.serveless";

export const getNotebook = async (db: Firestore, notebookId: string): Promise<Notebook | null> => {
  const notebookRef = doc(db, "notebooks", notebookId);
  const notebookDoc = await getDoc(notebookRef);
  if (!notebookDoc.exists()) return null;
  const thisNode: Notebook = { ...(notebookDoc.data() as NotebookDocument), id: notebookId };
  return thisNode;
};

export const addUserOnNotebook = async (
  db: Firestore,
  notebookId: string,
  uname: string,
  role: NotebookUserRole
): Promise<void> => {
  const notebookData = await getNotebook(db, notebookId);

  if (!notebookData) throw Error("Notebook doesn't exist");

  const user = await getUserByUname(db, uname);
  if (!user) throw Error("User doesn't exist");

  const notebookRef = doc(db, "notebooks", notebookId);
  await updateDoc(notebookRef, {
    users: [...notebookData.users, user.uname],
    usersInfo: {
      ...notebookData.usersInfo,
      [user.uname]: { chooseUname: user.chooseUname, fullname: user.fName ?? "", imageUrl: user.imageUrl, role },
    },
  });
};
