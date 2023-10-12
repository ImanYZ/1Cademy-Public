import { db } from "../admin";
interface IGetNode {
  nodeData: any;
  nodeRef: any;
  nodeExists: boolean;
}

export const getNode = async ({ nodeId }: any): Promise<IGetNode> => {
  const nodeRef = db.collection("nodes").doc(nodeId);
  const nodeDoc = await nodeRef.get();
  const nodeData: any = { ...nodeDoc.data(), id: nodeId };
  return { nodeData, nodeRef, nodeExists: !!nodeDoc.exists };
};
