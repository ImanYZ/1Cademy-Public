import { doc, DocumentChange, DocumentData, Firestore, getDoc } from "firebase/firestore";

import { AllTagsTreeView } from "@/components/TagsSearcher";

import {
  FullNodeData,
  FullNodesData,
  NodeFireStore,
  NodesData,
  UserNodeChanges,
  UserNodesData,
} from "../../nodeBookTypes";
import {
  compare2Nodes,
  createOrUpdateNode,
  makeNodeVisibleInItsLinks,
  removeDagAllEdges,
  removeDagNode,
} from "./Map.utils";
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

    const tmpData = nodeDoc.data();
    delete tmpData?.height; // IMPORTANT: we are removing height to not spoil height in dagre // DON'T remove this
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
export const mergeAllNodes = (newAllNodes: FullNodeData[], currentAllNodes: FullNodesData): FullNodesData => {
  return newAllNodes.reduce(
    (acu, cur) => {
      if (cur.nodeChangeType === "added" || cur.nodeChangeType === "modified") {
        return { ...acu, [cur.node]: cur };
      }
      if (cur.nodeChangeType === "removed") {
        const tmp = { ...acu };
        delete tmp[cur.node];
        return tmp;
      }
      return acu;
    },
    { ...currentAllNodes }
  );
};

export const fillDagre = (
  g: dagre.graphlib.Graph<{}>,
  fullNodes: FullNodeData[],
  currentNodes: any,
  currentEdges: any,
  withClusters: boolean,
  allTags: AllTagsTreeView,
  updatedNodeIds: string[]
) => {
  return fullNodes.reduce(
    (acu: { newNodes: { [key: string]: any }; newEdges: { [key: string]: any } }, cur) => {
      let tmpNodes = {};
      let tmpEdges = {};

      if (cur.nodeChangeType === "added") {
        const { uNodeData, oldNodes, oldEdges } = makeNodeVisibleInItsLinks(cur, acu.newNodes, acu.newEdges);

        updatedNodeIds.push(cur.node);
        const res = createOrUpdateNode(g, uNodeData, cur.node, oldNodes, oldEdges, allTags, withClusters);

        tmpNodes = res.oldNodes;
        tmpEdges = res.oldEdges;
      }
      if (cur.nodeChangeType === "modified" && cur.visible) {
        const node = acu.newNodes[cur.node];
        if (!node) {
          updatedNodeIds.push(cur.node);
          const res = createOrUpdateNode(g, cur, cur.node, acu.newNodes, acu.newEdges, allTags, withClusters);
          tmpNodes = res.oldNodes;
          tmpEdges = res.oldEdges;
        } else {
          const currentNode: FullNodeData = {
            ...cur,
            left: node.left,
            top: node.top,
          }; // <----- IMPORTANT: Add positions data from node into cur.node to not set default position into center of screen

          if (!compare2Nodes(cur, node)) {
            updatedNodeIds.push(cur.node);
            const res = createOrUpdateNode(g, currentNode, cur.node, acu.newNodes, acu.newEdges, allTags, withClusters);
            tmpNodes = res.oldNodes;
            tmpEdges = res.oldEdges;
          }
        }
      }
      // so the NO visible nodes will come as modified and !visible
      if (cur.nodeChangeType === "removed" || (cur.nodeChangeType === "modified" && !cur.visible)) {
        updatedNodeIds.push(cur.node);
        if (g.hasNode(cur.node)) {
          // g.nodes().forEach(function () {});
          // g.edges().forEach(function () {});
          // PROBABLY you need to add hideNodeAndItsLinks, to update children and parents nodes

          // !IMPORTANT, Don't change the order, first remove edges then nodes
          tmpEdges = removeDagAllEdges(g, cur.node, acu.newEdges, updatedNodeIds);
          tmpNodes = removeDagNode(g, cur.node, acu.newNodes);
        } else {
          // remove edges
          const oldEdges = { ...acu.newEdges };

          Object.keys(oldEdges).forEach(key => {
            if (key.includes(cur.node)) {
              delete oldEdges[key];
            }
          });

          tmpEdges = oldEdges;
          // remove node
          const oldNodes = acu.newNodes;
          if (cur.node in oldNodes) {
            delete oldNodes[cur.node];
          }
          // tmpEdges = {acu.newEdges,}
          tmpNodes = { ...oldNodes };
        }
      }

      return {
        newNodes: { ...tmpNodes },
        newEdges: { ...tmpEdges },
      };
    },
    { newNodes: { ...currentNodes }, newEdges: { ...currentEdges } }
  );
};
