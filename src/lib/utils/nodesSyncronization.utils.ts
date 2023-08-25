import { graphlib } from "dagre";
import { doc, DocumentChange, DocumentData, Firestore, getDoc } from "firebase/firestore";

import { AllTagsTreeView } from "@/components/TagsSearcher";
import { Graph } from "@/pages/notebook";

import {
  EdgesData,
  FullNodeData,
  FullNodesData,
  NodeFireStore,
  NodesData,
  TNodeUpdates,
  UserNodeChanges,
  UserNodeFirestore,
} from "../../nodeBookTypes";
import {
  COLUMN_GAP,
  compare2Nodes,
  createOrUpdateNode,
  makeNodeVisibleInItsLinks,
  NODE_WIDTH,
  removeDagAllEdges,
  removeDagNode,
} from "./Map.utils";
// import { FullNodeData, NodeFireStore, NodesData, UserNodeChanges } from "../../noteBookTypes";

export const getUserNodeChanges = (docChanges: DocumentChange<DocumentData>[]): UserNodeChanges[] => {
  // const docChanges = snapshot.docChanges();
  // if (!docChanges.length) return null

  return docChanges.map(change => {
    const userNodeData: UserNodeFirestore = change.doc.data() as UserNodeFirestore;
    return {
      cType: change.type,
      uNodeId: change.doc.id,
      uNodeData: userNodeData,
    };
  });
};

export const getNodesPromises = async (db: Firestore, nodeIds: string[]): Promise<NodesData[]> => {
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
    delete tmpData?.visible; // IMPORTANT: visible wont exist on DB, that value is calculated by notebooks // REMOVE after update backend and DB
    delete tmpData?.open; // IMPORTANT: open wont exist on DB, that value is calculated by expands // REMOVE after update backend and DB
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
        bookmarks: nodeDataFound.nData.bookmarks ? Number(nodeDataFound.nData.bookmarks) : 0,
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
  currentNodes: FullNodesData,
  currentEdges: EdgesData,
  withClusters: boolean,
  allTags: AllTagsTreeView
  // updatedNodeIds: string[]
): { result: { newNodes: FullNodesData; newEdges: EdgesData }; updatedNodeIds: string[] } => {
  let updatedNodeIds: string[] = [];
  const result = fullNodes.reduce(
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
        // console.log("----->removed", cur.node);
        updatedNodeIds.push(cur.node);
        if (g.hasNode(cur.node)) {
          // g.nodes().forEach(function () {});
          // g.edges().forEach(function () {});
          // PROBABLY you need to add hideNodeAndItsLinks, this is called into removeDagAllEdges

          // !IMPORTANT, Don't change the order, first remove edges then nodes
          tmpEdges = removeDagAllEdges(g, cur.node, acu.newEdges, updatedNodeIds);
          tmpNodes = removeDagNode(g, cur.node, acu.newNodes);
        } else {
          // this simulate the pure functionally, when all flow is pure, we can remove this part
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
  return { result, updatedNodeIds };
};

type SynchronizeGraphInput = {
  g: graphlib.Graph<{}>;
  graph: Graph;
  fullNodes: FullNodeData[];
  selectedNotebookId: string;
  allTags: AllTagsTreeView;
  setNodeUpdates: (newValue: TNodeUpdates) => void;
  setNoNodesFoundMessage: (newValue: boolean) => void;
  nodesInEdition?: string[];
};
export const synchronizeGraph = ({
  g,
  graph,
  fullNodes,
  selectedNotebookId,
  allTags,
  setNodeUpdates,
  setNoNodesFoundMessage,
  nodesInEdition = [],
}: SynchronizeGraphInput): Graph => {
  const { nodes, edges } = graph;
  // console.log({ selectedNotebookId });

  const visibleFullNodesMerged = fullNodes.map(cur => {
    const tmpNode = nodes[cur.node];
    if (tmpNode) {
      if (tmpNode.hasOwnProperty("simulated")) {
        delete tmpNode["simulated"];
      }
      if (tmpNode.hasOwnProperty("isNew")) {
        delete tmpNode["isNew"];
      }
    }

    const hasParent = cur.parents.length;
    // IMPROVE: we need to pass the parent which open the node
    // to use his current position
    // in this case we are checking first parent
    // if this doesn't exist will set top:0 and left: 0 + NODE_WIDTH + COLUMN_GAP
    const nodeParent = hasParent ? nodes[cur.parents[0].node] : null;
    const topParent = nodeParent?.top ?? 0;

    const leftParent = nodeParent?.left ?? 0;
    const notebookIdx = (cur?.notebooks ?? []).findIndex(c => c === selectedNotebookId);

    const isLinkedByEditedNode = tmpNode?.node && nodesInEdition.includes(tmpNode.node);
    return {
      ...cur,
      left: tmpNode?.left ?? leftParent + NODE_WIDTH + COLUMN_GAP,
      top: tmpNode?.top ?? topParent,
      visible: Boolean((cur.notebooks ?? [])[notebookIdx]),
      open: Boolean((cur.expands ?? [])[notebookIdx]),
      editable: tmpNode?.editable ?? false,
      parents: isLinkedByEditedNode ? tmpNode.parents : cur.parents,
      children: isLinkedByEditedNode ? tmpNode.children : cur.children,
    };
  });

  const { result, updatedNodeIds } = fillDagre(g, visibleFullNodesMerged, nodes, edges, false, allTags);
  const { newNodes, newEdges } = result;

  setNodeUpdates({
    nodeIds: updatedNodeIds,
    updatedAt: new Date(),
  });

  if (!Object.keys(newNodes).length) {
    setNoNodesFoundMessage(true);
  }
  // TODO: set synchronizationIsWorking false
  // setUserNodesLoaded(true);
  return { nodes: newNodes, edges: newEdges };
};
