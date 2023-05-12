export type Node = { id: string; content: string; top: number; left: number; height: 0; position: NodePosition };

export type NodePosition = "parents" | "nodes" | "children" | "siblingsTop" | "siblingsBottom";

export type NodeGrid = { [key in NodePosition]: { [key: string]: Node } };
