import { collection, Firestore, getDocs, query, where } from "firebase/firestore";

import { RecentUserNodesDocument } from "../../nodeBookTypes";

export const getRecentUserNodesByUser = async (db: Firestore, username: string): Promise<string[]> => {
  const q = query(collection(db, "recentUserNodes"), where("user", "==", username));
  const documents = await getDocs(q);
  const result: RecentUserNodesDocument[] = [];
  documents.forEach(c => c.exists() && result.push(c.data() as RecentUserNodesDocument));
  return result.map(c => c.nodeId).filter(c => c);
};
