import { Timestamp } from "firebase-admin/firestore";
import { db } from "../admin";

const hasMajorChanges = (newNode: any, previousNode: any): boolean => {
  if (newNode.title !== previousNode.title) return true;
  if (newNode.content !== previousNode.content) return true;
  if (newNode.admin !== previousNode.admin) return true;
  if (newNode.corrects !== previousNode.corrects) return true;
  if (newNode.wrongs !== previousNode.wrongs) return true;
  if (newNode.nodeImage !== previousNode.nodeImage) return true;
  if (JSON.stringify(newNode.parents) !== JSON.stringify(previousNode.parents)) return true;
  if (JSON.stringify(newNode.children) !== JSON.stringify(previousNode.children)) return true;
  if (JSON.stringify(newNode.tags) !== JSON.stringify(previousNode.tags)) return true;
  if (JSON.stringify(newNode.references) !== JSON.stringify(previousNode.references)) return true;
  return false;
};
interface INodeChange {
  nodeId: string;
  nodeData: Partial<any>;
  changedAt: Timestamp;
}

export const signalChangesToUsers = async (newNode: any, previousNode: any, nodeId: string) => {
  try {
    const majorChanges = hasMajorChanges(newNode, previousNode);
    console.log("majorChanges", majorChanges, "nodeId", nodeId);
    if (majorChanges) {
      const nodeChanges: INodeChange = {
        changedAt: Timestamp.now(),
        nodeId,
        nodeData: newNode,
      };
      const nodeChangesRef = db.collection("nodeChange").doc(nodeId);
      nodeChangesRef.set(nodeChanges);
    }
  } catch (error) {
    console.log(error);
  }
};
