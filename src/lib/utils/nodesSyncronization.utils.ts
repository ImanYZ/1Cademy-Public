import { graphlib } from "dagre";
import { collection, DocumentChange, DocumentData, Firestore, getDocs, query, where } from "firebase/firestore";

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

export const arrayToChunks = (inputArray: any[], perChunk: number = 30) => {
  const result = inputArray.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  return result;
};
export const getUserNodeChanges = (
  docChanges: DocumentChange<DocumentData>[]
): { userNodeChanges: { [nodeId: string]: UserNodeChanges }; nodeIds: string[] } => {
  const userNodeChanges: { [nodeId: string]: UserNodeChanges } = {};
  let nodeIds = [];
  for (let change of docChanges) {
    const userNodeData: UserNodeFirestore = change.doc.data() as UserNodeFirestore;
    userNodeChanges[userNodeData.node] = {
      cType: change.type,
      uNodeId: change.doc.id,
      uNodeData: userNodeData,
    };
    nodeIds.push(userNodeData.node);
  }
  return { userNodeChanges, nodeIds };
};

export const getNodesPromises = async (db: Firestore, nodeIds: string[]): Promise<{ [nodeId: string]: NodesData }> => {
  // Firestore limits 'in' queries to a maximum of 30 items per query.
  const CHUNK_SIZE = 30;

  const arrayToChunks = (array: any[], chunkSize: number) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, chunkSize + i));
    }
    return chunks;
  };

  const chunks = arrayToChunks(nodeIds, CHUNK_SIZE);

  const nodeDocsPromises = chunks.map((nodeIdsChunk: string[]) => {
    const nodeQuery = query(collection(db, "nodes"), where("__name__", "in", nodeIdsChunk));
    return getDocs(nodeQuery);
  });

  const nodeDocs = await Promise.all(nodeDocsPromises);
  const nodesMap: { [nodeId: string]: NodesData } = {};

  nodeDocs.forEach(nd => {
    nd.docs.forEach((nodeDoc: any) => {
      if (!nodeDoc.exists()) return;

      const tmpData = nodeDoc.data();
      delete tmpData?.height;
      delete tmpData?.visible;
      delete tmpData?.open;
      const nData: NodeFireStore = tmpData as NodeFireStore;

      nodesMap[nodeDoc.id] = {
        cType: nData.deleted ? "removed" : "added",
        nId: nodeDoc.id,
        nData: { ...nData, tagIds: nData.tagIds ?? [], tags: nData.tags ?? [] },
      };
    });
  });

  return nodesMap;
};

export const buildFullNodes = (
  userNodesChanges: { [nodeId: string]: UserNodeChanges },
  nodesData: { [nodeId: string]: NodesData }
): FullNodeData[] => {
  const res: FullNodeData[] = [];
  for (let nodeId in userNodesChanges) {
    const nodeData = nodesData[nodeId];
    if (nodeData) {
      const nData = nodeData.nData;
      const fullNodeData: FullNodeData = {
        ...userNodesChanges[nodeId].uNodeData, // User node data
        ...nData, // Node Data
        userNodeId: userNodesChanges[nodeId].uNodeId,
        nodeChangeType: userNodesChanges[nodeId].cType, // TODO: improve the names and values
        userNodeChangeType: nodeData.cType,
        editable: false,
        left: 0,
        top: 0,
        firstVisit: userNodesChanges[nodeId].uNodeData.createdAt.toDate(),
        lastVisit:
          userNodesChanges[nodeId].uNodeData.updatedAt?.toDate() ??
          userNodesChanges[nodeId].uNodeData.createdAt.toDate(),
        changedAt: nData.changedAt.toDate(),
        createdAt: nData.createdAt.toDate(),
        updatedAt: nData.updatedAt.toDate(),
        references: nData.references || [],
        referenceIds: nData.referenceIds || [],
        referenceLabels: nData.referenceLabels || [],
        tags: nData.tags || [],
        tagIds: nData.tagIds || [],
        contributors: nData.contributors ?? {},
        contribNames: nData.contribNames ?? [],
        institutions: nData.institutions ?? {},
        institNames: nData.institNames ?? [],
        bookmarks: nData.bookmarks ? Number(nData.bookmarks) : 0,
      };

      if (nData.nodeType !== "Question") {
        fullNodeData.choices = [];
      }

      fullNodeData.bookmarked = userNodesChanges[nodeId].uNodeData.bookmarked || false;
      fullNodeData.nodeChanges = userNodesChanges[nodeId].uNodeData.nodeChanges || null;

      res.push(fullNodeData);
    }
  }

  return res;
};

export const mergeAllNodes = (newAllNodes: FullNodeData[], currentAllNodes: FullNodesData): FullNodesData => {
  const updatedNodes = { ...currentAllNodes };

  newAllNodes.forEach(cur => {
    if (cur.nodeChangeType === "added" || cur.nodeChangeType === "modified") {
      updatedNodes[cur.node] = cur;
    } else if (cur.nodeChangeType === "removed") {
      delete updatedNodes[cur.node];
    }
  });

  return updatedNodes;
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
    (acu: { newNodes: FullNodesData; newEdges: EdgesData }, cur) => {
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
