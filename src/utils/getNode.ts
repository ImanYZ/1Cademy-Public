import { DocumentReference, DocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../lib/firestoreServer/admin";

interface IGetNode {
  nodeData: any;
  nodeRef: DocumentReference;
  nodeExists: boolean;
}

export const getNode = async ({ nodeId, t = false }: any): Promise<IGetNode> => {
  const nodeRef: DocumentReference = db.collection("nodes").doc(nodeId);
  const nodeDoc: DocumentSnapshot = t ? await t.get(nodeRef) : await nodeRef.get();
  const nodeData: any = { ...nodeDoc.data(), id: nodeId };
  return { nodeData, nodeRef, nodeExists: !!nodeDoc.exists };
};
