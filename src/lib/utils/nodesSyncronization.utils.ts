import { doc, DocumentChange, DocumentData, Firestore, getDoc } from "firebase/firestore";

import { FullNodeData, NodeFireStore, NodesData, UserNodeChanges, UserNodesData } from "../../nodeBookTypes";
// import { FullNodeData, NodeFireStore, NodesData, UserNodeChanges } from "../../noteBookTypes";

export const getUserNodeChanges = (docChanges: DocumentChange<DocumentData>[]): UserNodeChanges[] => {
  // const docChanges = snapshot.docChanges();
  // if (!docChanges.length) return null

  return docChanges.map(change => {
    const userNodeData: UserNodesData = change.doc.data() as UserNodesData;
    return {
      cType: change.type,
      uNodeId: change.doc.id,
      uNodeData: userNodeData,
    };
  });
};

export const getNodes = async (db: Firestore, nodeIds: string[]): Promise<NodesData[]> => {
  // console.log("[GET NODES]");
  const nodeDocsPromises = nodeIds.map(nodeId => {
    const nodeRef = doc(db, "nodes", nodeId);
    return getDoc(nodeRef);
  });

  const nodeDocs = await Promise.all(nodeDocsPromises);

  return nodeDocs.map(nodeDoc => {
    if (!nodeDoc.exists()) return null;

    // if (result.height !== undefined) {
    //   delete result?.height;
    // }
    const tmpData = nodeDoc.data();
    delete tmpData?.height;
    const nData: NodeFireStore = tmpData as NodeFireStore;
    // if (nData.deleted) return null;
    if (nData.deleted) {
      return {
        cType: "removed",
        nId: nodeDoc.id,
        nData: { ...nData, tagIds: nData.tagIds ?? [], tags: nData.tags ?? [] },
      };
    }

    return {
      cType: "added",
      nId: nodeDoc.id,
      nData: { ...nData, tagIds: nData.tagIds ?? [], tags: nData.tags ?? [] },
    };
  });
};

export const buildFullNodes = (userNodesChanges: UserNodeChanges[], nodesData: NodesData[]): FullNodeData[] => {
  // console.log("[BUILD FULL NODES]");
  const findNodeDataById = (id: string) => nodesData.find(cur => cur && cur.nId === id);
  const res = userNodesChanges
    .map(cur => {
      const nodeDataFound = findNodeDataById(cur.uNodeData.node);

      if (!nodeDataFound) return null;

      const fullNodeData: FullNodeData = {
        ...cur.uNodeData, // User node data
        ...nodeDataFound.nData, // Node Data
        userNodeId: cur.uNodeId,
        nodeChangeType: cur.cType, // TODO: improve the names and values
        userNodeChangeType: nodeDataFound.cType,
        editable: false,
        left: 0,
        top: 0,
        firstVisit: cur.uNodeData.createdAt.toDate(),
        lastVisit: cur.uNodeData.updatedAt?.toDate() ?? cur.uNodeData.createdAt.toDate(),
        changedAt: nodeDataFound.nData.changedAt.toDate(),
        createdAt: nodeDataFound.nData.createdAt.toDate(),
        updatedAt: nodeDataFound.nData.updatedAt.toDate(),
        references: nodeDataFound.nData.references || [],
        referenceIds: nodeDataFound.nData.referenceIds || [],
        referenceLabels: nodeDataFound.nData.referenceLabels || [],
        tags: nodeDataFound.nData.tags || [],
        tagIds: nodeDataFound.nData.tagIds || [],
        contributors: nodeDataFound.nData.contributors ?? {},
        contribNames: nodeDataFound.nData.contribNames ?? [],
        institutions: nodeDataFound.nData.institutions ?? {},
        institNames: nodeDataFound.nData.institNames ?? [],
        // parents:nodeDataFound.nData.parents??[],
        // children:node
      };
      if (nodeDataFound.nData.nodeType !== "Question") {
        fullNodeData.choices = [];
      }
      fullNodeData.bookmarked = cur.uNodeData?.bookmarked || false;
      fullNodeData.nodeChanges = cur.uNodeData?.nodeChanges || null;

      return fullNodeData;
    })
    .flatMap(cur => cur || []);

  return res;
};
