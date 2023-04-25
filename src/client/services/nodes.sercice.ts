import { doc, Firestore, getDoc } from "firebase/firestore";

import { Node, NodeFireStore } from "../../nodeBookTypes";

export const getNode = async (db: Firestore, nodeId: string): Promise<Node | null> => {
  const nodeRef = doc(db, "nodes", nodeId);
  const nodeDoc = await getDoc(nodeRef);
  if (!nodeDoc.exists()) return null;
  const thisNode: Node = { ...(nodeDoc.data() as NodeFireStore), id: nodeId };
  return thisNode;
};

export const getNodes = async (db: Firestore, nodeIds: string[]): Promise<(Node | null)[]> => {
  return await Promise.all(nodeIds.map(async cur => await getNode(db, cur)));
};

export const getRootQuestionDescendants = async (
  db: Firestore,
  rootId: string
): Promise<{ root: Node; descendants: Node[] } | null> => {
  const root = await getNode(db, rootId);
  console.log({ root });
  if (!root) return null;

  const questionDescendantIds = root.children.filter(c => c.type === "Question").map(c => c.node);
  const descendantsResult = await getNodes(db, questionDescendantIds);
  const descendants = descendantsResult.flatMap(cur => cur || []);
  return { root, descendants };
};
