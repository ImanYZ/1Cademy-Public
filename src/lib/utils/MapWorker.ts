// dagre is used for calculating location of nodes and arrows
import dagre from "dagre";

type LayoutHandle = {
  mapChangedFlag: any,
  oldClusterNodes: any,
  oldMapWidth: any,
  oldMapHeight: any,
  oldNodes: any,
  oldEdges: any,
  allTags: any,
  dag1: any,
  XOFFSET: number,
  YOFFSET: number,
  MIN_CHANGE: number,
  MAP_RIGHT_GAP: number,
  NODE_WIDTH: number,
  setDagNode: any,
  setDagEdge: any,
}

const layoutHandler = (
  { mapChangedFlag,
    oldClusterNodes,
    oldMapWidth,
    oldMapHeight,
    oldNodes,
    oldEdges,
    allTags,
    dag1,
    XOFFSET,
    YOFFSET,
    MIN_CHANGE,
    MAP_RIGHT_GAP,
    NODE_WIDTH,
    setDagNode,
    setDagEdge }: LayoutHandle
) => {
  let mapNewWidth, mapNewHeight;
  while (mapChangedFlag) {
    mapChangedFlag = false;

    // DAGRE RECALCULATE LAYOUT
    dagre.layout(dag1[0]);
    const clusterRegions: any = {};

    // Iterate oldNodes and find the cluster boundary
    // and update their size
    // if not existe create the cluster
    for (let nId in oldNodes) {
      //  if the node belongs to a cluster
      if (
        "tagIds" in oldNodes[nId] &&
        oldNodes[nId].tagIds.length > 0 &&
        oldNodes[nId].tagIds[0] in allTags
      ) {
        //  nodeN is the object corresponding to this node in dagr
        const nodeN = dag1[0].node(nId);
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
          };
        }
      }
    }

    // Update OldClusterNodes
    for (let cNode in clusterRegions) {
      const nodeN = dag1[0].node("Tag" + cNode);
      oldClusterNodes[cNode] = {
        id: cNode,
        x: clusterRegions[cNode].xMin + XOFFSET,
        y: clusterRegions[cNode].yMin + YOFFSET,
        width: clusterRegions[cNode].xMax - clusterRegions[cNode].xMin,
        height: clusterRegions[cNode].yMax - clusterRegions[cNode].yMin,
        title: nodeN.title,
      };
    }

    // ITERATE oldNodes
    // get every node (nodeN) calculated by dagre
    // calculate OFFSETs
    // update with setDagNode
    // calculate map
    oldNodes.map((n: string) => {
      const nodeN = dag1[0].node(n);
      // If there is an object (label) assigned to the node in dag1[0], otherwise it'd be undefined:
      if (nodeN) {
        const newLeft = nodeN.x + XOFFSET - nodeN.width / 2;
        const newTop = nodeN.y + YOFFSET - nodeN.height / 2;
        const thisNode = { ...oldNodes[n] };
        //  if the distance between the new edge and old edge is >= constant value MIN_CHANGE
        //  update the map's width and mapChangedFlag accordingly
        if (
          !("left" in thisNode) ||
          !("top" in thisNode) ||
          Math.abs(thisNode.left - newLeft) >= MIN_CHANGE ||
          Math.abs(thisNode.top - newTop) >= MIN_CHANGE
        ) {
          oldNodes = setDagNode(n, { ...thisNode, left: newLeft, top: newTop }, oldNodes, null);
          mapNewWidth = newLeft + nodeN.width + MAP_RIGHT_GAP;
          if (oldMapWidth < mapNewWidth) {
            oldMapWidth = mapNewWidth;
          }
          mapNewHeight = newTop + nodeN.height;
          if (oldMapWidth < mapNewHeight) {
            oldMapWidth = mapNewHeight;
          }
          mapChangedFlag = true;
        }
      }
      return null;
    });

    // ITERATE EDGES and calculate the new positions
    dag1[0].edges().map((e: any) => {
      const fromNode = dag1[0].node(e.v);
      const toNode = dag1[0].node(e.w);
      if (
        "left" in fromNode &&
        "top" in fromNode &&
        "left" in toNode &&
        "top" in toNode &&
        "height" in fromNode &&
        "height" in toNode
      ) {
        const newFromX = fromNode.left + NODE_WIDTH;
        const newFromY = fromNode.top + Math.floor(fromNode.height / 2);
        const newToX = toNode.left;
        const newToY = toNode.top + Math.floor(toNode.height / 2);
        const thisEdge = oldEdges[e.v + "-" + e.w];
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
          oldEdges = setDagEdge(
            e.v,
            e.w,
            {
              ...thisEdge,
              fromX: newFromX,
              fromY: newFromY,
              toX: newToX,
              toY: newToY,
            },
            oldEdges
          );
          mapChangedFlag = true;
        }
        return null;
      }
    });
  }
  return { mapChangedFlag, oldClusterNodes, oldMapWidth, oldMapHeight, oldNodes, oldEdges };
};

type OnMessageProps = { data: LayoutHandle }

onmessage = (e: OnMessageProps) => {
  const {
    mapChangedFlag,
    oldClusterNodes,
    oldMapWidth,
    oldMapHeight,
    oldNodes,
    oldEdges,
    allTags,
    dag1,
    XOFFSET,
    YOFFSET,
    MIN_CHANGE,
    MAP_RIGHT_GAP,
    NODE_WIDTH,
    setDagNode,
    setDagEdge,
  } = e.data;
  const workerResults = layoutHandler({
    mapChangedFlag,
    oldClusterNodes,
    oldMapWidth,
    oldMapHeight,
    oldNodes,
    oldEdges,
    allTags,
    dag1,
    XOFFSET,
    YOFFSET,
    MIN_CHANGE,
    MAP_RIGHT_GAP,
    NODE_WIDTH,
    setDagNode,
    setDagEdge
  });
  postMessage(workerResults);
};
