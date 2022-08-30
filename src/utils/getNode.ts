import { db } from "../lib/firestoreServer/admin";

export const getNode = async ({ nodeId }: any) => {
  const nodeRef = db.collection("nodes").doc(nodeId);
  const nodeDoc = await nodeRef.get();
  const nodeData: any = { ...nodeDoc.data(), id: nodeId };
  return { nodeData, nodeRef };
};