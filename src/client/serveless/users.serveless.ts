import { collection, Firestore, getDocs, query, where } from "firebase/firestore";

import { User, UserDocument } from "../../knowledgeTypes";

export const getUserByUname = async (db: Firestore, uname: string): Promise<User | null> => {
  const q = query(collection(db, "users"), where("uname", "==", uname));
  const documents = await getDocs(q);

  if (documents.size === 0) return null;
  if (!documents.docs[0].exists()) return null;
  const userData = documents.docs[0].data() as UserDocument;
  const user: User = { ...userData, id: documents.docs[0].id };
  return user;
};
