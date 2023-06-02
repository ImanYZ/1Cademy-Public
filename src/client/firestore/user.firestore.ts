import { doc, Firestore, getDoc } from "firebase/firestore";

import { User } from "../../knowledgeTypes";

export const getUser = async (db: Firestore, userId: string): Promise<User | null> => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) return null;
  const thisUser: User = { ...(userDoc.data() as any), id: userId };
  return thisUser;
};
