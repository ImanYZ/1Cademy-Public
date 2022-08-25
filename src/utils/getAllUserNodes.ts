import { db } from "../lib/firestoreServer/admin";

export const getAllUserNodes = async ({ nodeId }: any) => {
  const userNodesQuery = db.collection("userNodes").where("node", "==", nodeId);
  const userNodesDocs = await userNodesQuery.get();
  const userNodesData: any[] = [];
  const userNodesRefs: any[] = [];
  userNodesDocs.forEach((doc) => {
    userNodesData.push({ ...doc.data(), id: doc.id });
    userNodesRefs.push(db.collection("userNodes").doc(doc.id));
  });
  return { userNodesData, userNodesRefs };
};