import { Node, NodeGrid, NodePosition } from "../../gridViewTypes";

export const NODE_WIDTH = 800;
export const SMALL_NODE_WIDTH = 686;
export const GAP_X = 90;
export const GAP_Y = 64;
export const SMALL_GAP_Y = 16;

export const LEFT_POSITION: { [key in NodePosition]: number } = {
  nodes: 0,
  children: NODE_WIDTH + GAP_X,
  parents: -(NODE_WIDTH + GAP_X),
  siblingsTop: 57,
  siblingsBottom: 57,
};

export const INITIAL_NODES_GRID: NodeGrid = {
  children: {},
  nodes: {},
  parents: {},
  siblingsBottom: {},
  siblingsTop: {},
};

export const getNodesHeight = (nodes: Node[]) => nodes.reduce((acu, cur) => acu + cur.height, 0);

export const gridNodesToNodes = (gridNodes: NodeGrid, type: NodePosition): Node[] =>
  Object.keys(gridNodes[type]).reduce((acu: Node[], cur) => [...acu, gridNodes[type][cur]], []);

export const changeNodesPosition = (nodes: { [key: string]: Node }, newPosition: NodePosition) => {
  return Object.keys(nodes).reduce(
    (acu: { [key: string]: Node }, cur) => ({ ...acu, [cur]: { ...nodes[cur], position: newPosition } }),
    {}
  );
};

const getPivot = (type: NodePosition, containerHeigh: number, totalHeight: number, nodesOffsetHeight: number) => {
  if (type === "siblingsTop") return containerHeigh / 2 - totalHeight - GAP_Y - nodesOffsetHeight; // above nodes
  if (type === "siblingsBottom") return containerHeigh / 2 + GAP_Y + nodesOffsetHeight; // below nodes
  return containerHeigh / 2 - totalHeight / 2; // parents, children and nodes are centered on middle of window
};

const calculatePositions = (
  gridNodes: NodeGrid,
  leftPosition: number,
  containerHeigh: number,
  gap: number,
  type: NodePosition,
  nodesOffsetHeight: number = 0
): Node[] => {
  const nodes = gridNodesToNodes(gridNodes, type);
  const nodesHeight = getNodesHeight(nodes);
  const gapHeight = (nodes.length - 1) * gap;
  const totalHeight = nodesHeight + gapHeight;
  const nodesPivot = getPivot(type, containerHeigh, totalHeight, nodesOffsetHeight);
  const result = nodes.reduce(
    (acu: { nodes: Node[]; previousHeight: number }, cur) => {
      const thisNode: Node = { ...cur, top: acu.previousHeight, left: leftPosition };
      return { nodes: [...acu.nodes, thisNode], previousHeight: acu.previousHeight + cur.height + gap };
    },
    { nodes: [], previousHeight: nodesPivot }
  );

  return result.nodes;
};

type CalculateNodePositionInput = {
  id: string;
  height: number;
  type: NodePosition;
  gridNodes: NodeGrid;
  windowWidth: number;
  windowHeight: number;
};
export const calculateNodePosition = ({
  id,
  height,
  type,
  gridNodes,
  windowWidth,
  windowHeight,
}: CalculateNodePositionInput): NodeGrid => {
  console.log("calculateNodePosition", { id, height, type, gridNodes });
  const thisNode = gridNodes[type][id];
  if (!thisNode) return gridNodes;

  const OFFSET_X = windowWidth / 2 - NODE_WIDTH / 2;
  const newGridNodes: NodeGrid = { ...gridNodes, [type]: { ...gridNodes[type], [id]: { ...thisNode, height } } };
  console.log({ id, type, newGridNodes });
  const nodes = calculatePositions(
    newGridNodes,
    LEFT_POSITION[type] + OFFSET_X,
    windowHeight,
    SMALL_GAP_Y,
    type,
    getNodesHeight(gridNodesToNodes(gridNodes, "nodes")) / 2
  );
  const copyNewGridNodes = { ...gridNodes };
  nodes.forEach(cur => (copyNewGridNodes[type][cur.id] = cur));
  return copyNewGridNodes;
};

type CalculateNodesPositionsInput = {
  gridNodes: NodeGrid;
  windowWidth: number;
  windowHeight: number;
};

export const calculateNodesPositions = ({ gridNodes, windowHeight, windowWidth }: CalculateNodesPositionsInput) => {
  const OFFSET_X = windowWidth / 2 - NODE_WIDTH / 2;

  const nodePositions: NodePosition[] = Object.keys(gridNodes) as NodePosition[];
  const newNodesGrid: NodeGrid = nodePositions.reduce((acu: NodeGrid, cur: NodePosition) => {
    const nodes = calculatePositions(
      gridNodes,
      LEFT_POSITION[cur] + OFFSET_X,
      windowHeight,
      SMALL_GAP_Y,
      cur,
      getNodesHeight(gridNodesToNodes(gridNodes, "nodes")) / 2
    );

    return { ...acu, [cur]: [...nodes] };
  }, INITIAL_NODES_GRID);

  return newNodesGrid;
};
