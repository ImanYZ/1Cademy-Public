// dagre is used for calculating location of nodes and arrows
import dagre from "dagre";

import { AllTagsTreeView } from "../components/TagsSearcher";
import { dagreUtils } from "../lib/utils/dagre.util";
import { devLog } from "../lib/utils/develop.util";
// import { setDagEdge, setDagNode } from "../lib/utils/Map.utils";
// import { ClusterNodes } from "../noteBookTypes";
import { MAP_RIGHT_GAP, MIN_CHANGE, NODE_WIDTH, XOFFSET, YOFFSET } from "../lib/utils/Map.utils";
import {
  // ClusterNodes,
  EdgesData,
  FullNodesData,
} from "../nodeBookTypes";

const calculateClusters = (g: dagre.graphlib.Graph<{}>, oldNodes: FullNodesData, allTags: AllTagsTreeView) => {
  const oldClusterNodes: {
    [key: string]: { id: string; x: number; y: number; width: number; height: number; title: string };
  } = {};
  const clusterRegions: {
    [key: string]: {
      yMin: number;
      yMax: number;
      xMin: number;
      xMax: number;
      title: string;
    };
  } = {};

  // // Iterate oldNodes and find the cluster boundary
  // // and update their size
  // // if not existe create the cluster
  for (let nId in oldNodes) {
    //  if the node belongs to a cluster
    if ("tagIds" in oldNodes[nId] && oldNodes[nId].tagIds.length > 0 && oldNodes[nId].tagIds[0] in allTags) {
      //  nodeN is the object corresponding to this node in dagr
      // const nodeN = dag1.node(nId);
      const nodeN = g.node(nId);
      if (oldNodes[nId].tagIds[0] in clusterRegions) {
        //  if the cluster is defined, update its bounds
        if (clusterRegions[oldNodes[nId].tagIds[0]].yMin > nodeN.y - nodeN.height / 2) {
          clusterRegions[oldNodes[nId].tagIds[0]].yMin = nodeN.y - nodeN.height / 2;
        }
        if (clusterRegions[oldNodes[nId].tagIds[0]].yMax < nodeN.y + nodeN.height / 2) {
          clusterRegions[oldNodes[nId].tagIds[0]].yMax = nodeN.y + nodeN.height / 2;
        }
        if (clusterRegions[oldNodes[nId].tagIds[0]].xMin > nodeN.x - nodeN.width / 2) {
          clusterRegions[oldNodes[nId].tagIds[0]].xMin = nodeN.x - nodeN.width / 2;
        }
        if (clusterRegions[oldNodes[nId].tagIds[0]].xMax < nodeN.x + nodeN.width / 2) {
          clusterRegions[oldNodes[nId].tagIds[0]].xMax = nodeN.x + nodeN.width / 2;
        }
      } else {
        //  define a cluster
        clusterRegions[oldNodes[nId].tagIds[0]] = {
          yMin: nodeN.y - nodeN.height / 2,
          yMax: nodeN.y + nodeN.height / 2,
          xMin: nodeN.x - nodeN.width / 2,
          xMax: nodeN.x + nodeN.width / 2,
          title: oldNodes[nId].tags[0], // CHECK I added this
        };
      }
    }
  }

  // Update OldClusterNodes
  for (let cNode in clusterRegions) {
    // const nodeN = g.node("Tag" + cNode);
    // console.log("setParent:nodeN", nodeN, cNode);
    // const nodeN = dag1.node("Tag" + cNode) as any;
    // console.log('  --- ---- --- >>', nodeN)
    oldClusterNodes[cNode] = {
      id: cNode,
      x: clusterRegions[cNode].xMin + XOFFSET,
      y: clusterRegions[cNode].yMin + YOFFSET,
      width: clusterRegions[cNode].xMax - clusterRegions[cNode].xMin,
      height: clusterRegions[cNode].yMax - clusterRegions[cNode].yMin,
      title: clusterRegions[cNode].title,
      // title: nodeN.title, // CHECK I commented this, because we will use the title setted
    };
  }
  return oldClusterNodes;
};

const layoutHandler = (
  oldMapWidth: number,
  oldMapHeight: any,
  oldNodes: FullNodesData,
  oldEdges: EdgesData,
  allTags: AllTagsTreeView,
  g: dagre.graphlib.Graph<{}>,
  withClusters: boolean = false
) => {
  let oldClusterNodes = {};
  const startTimer = performance.now();
  // debugger;
  // console.log("{ WORKER }", { oldNodes, oldEdges });
  let mapNewWidth, mapNewHeight;
  // while (mapChangedFlag) {
  // mapChangedFlag = false;

  // DAGRE RECALCULATE LAYOUT
  // dagre.layout(dag1);
  dagre.layout(g);
  if (withClusters) {
    oldClusterNodes = calculateClusters(g, oldNodes, allTags);
  }

  // ITERATE oldNodes
  // get every node (nodeN) calculated by dagre
  // calculate OFFSETs
  // update with setDagNode
  // calculate map
  // console.log(oldNodes, JSON.parse(JSON.stringify(oldNodes)));
  // console.log("worker: iterate node to calculate Dimensions");
  Object.keys(oldNodes).map(n => {
    // const nodeN = dag1.node(n);
    const nodeN = g.node(n);
    // If there is an object (label) assigned to the node in dag1[0], otherwise it'd be undefined:
    if (nodeN) {
      const newLeft = nodeN.x + XOFFSET - nodeN.width / 2;
      const newTop = nodeN.y + YOFFSET - nodeN.height / 2;
      const thisNode = { ...oldNodes[n] };
      //  if the distance between the new edge and old edge is >= constant value MIN_CHANGE
      //  update the map's width and mapChangedFlag accordingly
      // console.log(thisNode, n, JSON.parse(JSON.stringify(thisNode)));
      if (
        !("left" in thisNode) ||
        !("top" in thisNode) ||
        Math.abs(thisNode.left - newLeft) >= MIN_CHANGE ||
        Math.abs(thisNode.top - newTop) >= MIN_CHANGE
      ) {
        // oldNodes = setDagNode(g, n, { ...thisNode, left: newLeft, top: newTop }, oldNodes, {}, null);
        oldNodes[n] = { ...thisNode, left: newLeft, top: newTop };

        mapNewWidth = newLeft + nodeN.width + MAP_RIGHT_GAP;
        if (oldMapWidth < mapNewWidth) {
          oldMapWidth = mapNewWidth;
        }
        mapNewHeight = newTop + nodeN.height;
        if (oldMapWidth < mapNewHeight) {
          oldMapWidth = mapNewHeight;
        }
        // mapChangedFlag = true;
      }
    }
    return null;
  });

  // ITERATE EDGES and calculate the new positions
  // debugger;
  // console.log("[Worker]:g.edges()", g.edges());

  // console.log("worker: iterate edges to update olEdges");
  g.edges().map((e: any) => {
    // const fromNode = g.node(e.v) as any;
    // const toNode = g.node(e.w) as any;
    const fromNode = oldNodes[e.v];
    const toNode = oldNodes[e.w];
    // console.log({ fromNode, toNode });
    if (
      "left" in fromNode &&
      "top" in fromNode &&
      "left" in toNode &&
      "top" in toNode &&
      "height" in fromNode &&
      "height" in toNode
    ) {
      const newFromX = fromNode.left + NODE_WIDTH;
      const newFromY = fromNode.top + Math.floor((fromNode.height ?? 25) / 2);
      const newToX = toNode.left;
      const newToY = toNode.top + Math.floor((toNode.height ?? 25) / 2);
      const thisEdge = oldEdges[e.v + "-" + e.w];
      // console.log(JSON.stringify({thisEdge, v: e.v, w: e.w, fromNode, toNode}), "thisEdge, e.v, e.w")

      if (
        !("fromX" in thisEdge) ||
        !("fromY" in thisEdge) ||
        !("toX" in thisEdge) ||
        !("toY" in thisEdge) ||
        Math.abs(thisEdge.fromX - newFromX) >= MIN_CHANGE ||
        Math.abs(thisEdge.fromY - newFromY) >= MIN_CHANGE ||
        Math.abs(thisEdge.toX - newToX) >= MIN_CHANGE ||
        Math.abs(thisEdge.toY - newToY) >= MIN_CHANGE
      ) {
        const tmpEdge = { ...thisEdge, fromX: newFromX, fromY: newFromY, toX: newToX, toY: newToY };
        // oldEdges = setDagEdge(g, e.v, e.w, tmpEdge, oldEdges);
        oldEdges[e.v + "-" + e.w] = tmpEdge;
        // mapChangedFlag = true;
      }
      return null;
    }
  });
  // }
  const graph = dagreUtils.mapGraphToObject(g);
  const endTimer = performance.now();
  devLog("⌚:Map Worker", `${endTimer - startTimer}ms`);

  return {
    /*mapChangedFlag,*/
    oldClusterNodes,
    oldMapWidth,
    oldMapHeight,
    oldNodes,
    oldEdges,
    graph,
  };
};

onmessage = e => {
  const {
    /*mapChangedFlag,*/
    // oldClusterNodes,
    oldMapWidth,
    oldMapHeight,
    oldNodes,
    oldEdges,
    allTags,
    graph,
    withClusters,
  } = e.data;

  const g = dagreUtils.mapObjectToGraph(graph);

  const workerResults = layoutHandler(oldMapWidth, oldMapHeight, oldNodes, oldEdges, allTags, g, withClusters);
  postMessage(workerResults);
};
