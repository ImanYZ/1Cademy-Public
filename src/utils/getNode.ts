import { db } from "../lib/firestoreServer/admin";

export const getNode = async ({ nodeId, t = false }: any) => {
  const nodeRef = db.collection("nodes").doc(nodeId);
  const nodeDoc = t ? await t.get(nodeRef) : await nodeRef.get();
  const nodeData: any = { ...nodeDoc.data(), id: nodeId };
  return { nodeData, nodeRef };
};
