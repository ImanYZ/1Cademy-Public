import { collection, doc, Firestore, getDoc, getDocs, query, where } from "firebase/firestore";

import { ActionTracksDocument, Node, NodeFireStore } from "../../nodeBookTypes";

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

export const getMostUsedNodeIdsByUser = async (db: Firestore, username: string): Promise<string[]> => {
  console.log("getMostUsedNodeIdsByUser in 24h");
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 50); // 50 days ago
  const q = query(collection(db, "actionTracks24h"), where("doer", "==", username));
  const documents = await getDocs(q);
  const result: ActionTracksDocument[] = [];
  documents.forEach(c => c.exists() && result.push(c.data() as ActionTracksDocument));
  console.log("getMostUsedNodeIdsByUser:", { result });
  const nodesCount = result.reduce((acu: { [key: string]: number }, cur) => {
    return { ...acu, [cur.nodeId]: (acu[cur.nodeId] ?? 0) + 1 };
  }, {});

  const mostUsedNodeIds = Object.keys(nodesCount)
    .map(c => ({ nodeId: c, amount: nodesCount[c] }))
    .sort((a, b) => a.amount - b.amount)
    .map(c => c.nodeId);
  console.log("getMostUsedNodeIdsByUser:", { mostUsedNodeIds });

  return mostUsedNodeIds;
};
