import { collection, doc, Firestore, getDoc, getDocs, query, where } from "firebase/firestore";

import { User } from "../../knowledgeTypes";

export const getUser = async (db: Firestore, userId: string): Promise<User | null> => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) return null;
  const thisUser: User = { ...(userDoc.data() as any), id: userId };
  return thisUser;
};

export const getUserByUname = async (db: Firestore, uname: string): Promise<User | null> => {
  const userRef = collection(db, "users");
  const q = query(userRef, where("uname", "==", uname));
  const querySnapshot = await getDocs(q);
  const users: User[] = [];
  if (querySnapshot.empty) return null;

  querySnapshot.forEach(c => users.push(c.data() as User));
  return users[0] ?? null;
};
