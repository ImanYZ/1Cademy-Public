import { Node, NodeGrid, NodePosition } from "../../gridViewTypes";

export const NODE_WIDTH = 800;
export const SMALL_NODE_WIDTH = 686;
export const GAP_X = 90;
export const GAP_Y = 64;
export const SMALL_GAP_Y = 16;

export const getNodesHeight = (nodes: Node[]) => nodes.reduce((acu, cur) => acu + cur.height, 0);

export const gridNodesToNodes = (gridNodes: NodeGrid, type: NodePosition): Node[] =>
  Object.keys(gridNodes[type]).reduce((acu: Node[], cur) => [...acu, gridNodes[type][cur]], []);
