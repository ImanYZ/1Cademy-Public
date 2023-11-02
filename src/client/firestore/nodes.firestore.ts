import { collection, doc, Firestore, getDoc, getDocs, query, where } from "firebase/firestore";

import { Node, NodeFireStore } from "../../nodeBookTypes";

export const getNode = async (db: Firestore, nodeId: string): Promise<Node | null> => {
  const nodeRef = doc(db, "nodes", nodeId);
  const nodeDoc = await getDoc(nodeRef);
  if (!nodeDoc.exists()) return null;
  const thisNode: Node = { ...(nodeDoc.data() as NodeFireStore), id: nodeId };
  return thisNode;
};

export const getNodes = async (db: Firestore, nodeIds: string[]): Promise<(Node | null)[]> => {
  const chunkSize = 30;
  const nodeChunks = [];

  for (let i = 0; i < nodeIds.length; i += chunkSize) {
    const chunk = nodeIds.slice(i, i + chunkSize);
    nodeChunks.push(chunk);
  }
  const promises = nodeChunks.map(async chunk => {
    const nodesQuery = query(collection(db, "nodes"), where("__name__", "in", chunk), where("deleted", "==", false));
    const nodesDocs = await getDocs(nodesQuery);
    const nodes: (Node | null)[] = [];
    nodesDocs.forEach(doc => {
      if (doc.exists()) {
        nodes.push({ ...doc.data(), id: doc.id } as Node);
      } else {
        nodes.push(null);
      }
    });

    return nodes;
  });
  const results = await Promise.all(promises);
  return results.reduce((acc, val) => acc.concat(val), []);
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
