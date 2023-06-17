import { collection, doc, Firestore, getDocs, limit, query, where } from "firebase/firestore";
import { UserNode, UserNodeFirestore } from "src/nodeBookTypes";

import { generateUserNode } from "@/lib/utils/utils";

export const getUserNodeByForce = async (
  db: Firestore,
  nodeId: string,
  uname: string,
  notebookId: string
): Promise<UserNode> => {
  const ref = collection(db, "userNodes");
  const q = query(ref, where("node", "==", nodeId), where("user", "==", uname), limit(1));
  const userNodeDoc = await getDocs(q);
  if (!userNodeDoc.docs.length) {
    return { ...generateUserNode({ nodeId, uname, notebookId, isMock: true }), id: doc(ref).id };
  }
  const thisUserNode: UserNode = { ...(userNodeDoc.docs[0].data() as UserNodeFirestore), id: nodeId };
  return thisUserNode;
};

export const getUserNodesByForce = async (
  db: Firestore,
  userNodeIds: string[],
  uname: string,
  notebookId: string
): Promise<UserNode[]> => {
  return await Promise.all(userNodeIds.map(async cur => await getUserNodeByForce(db, cur, uname, notebookId)));
};
