import { db } from "../lib/firestoreServer/admin";
import { convertToTGet } from "./";

export const getAllUserNodes = async ({ nodeId, t }: any) => {
  const userNodesQuery = db.collection("userNodes").where("node", "==", nodeId);
  const userNodesDocs = await convertToTGet(userNodesQuery, t);
  const userNodesData: any[] = [];
  const userNodesRefs: any[] = [];
  userNodesDocs.forEach(doc => {
    userNodesData.push({ ...doc.data(), id: doc.id });
    userNodesRefs.push(db.collection("userNodes").doc(doc.id));
  });
  return { userNodesData, userNodesRefs };
};
