import dagre from "dagre";

export const NODE_GAP = 19; // The minimum gap between the stacked nodes.
export const COLUMN_GAP = 190; // The minimum gap between the node columns.

const createGraph = () => {
  // let dag1: dagre.graphlib.Graph[] = [];
  // Using dagre for calculating location of nodes and arrows on map
  const g = new dagre.graphlib.Graph({ compound: true, directed: true })
    .setGraph({
      // directed: true,
      rankdir: "LR",
      nodesep: NODE_GAP,
      ranksep: COLUMN_GAP,
    })
    .setDefaultEdgeLabel(function () {
      // Default to assigning a new object as a label for each new edge.
      return {};
    });

  return g;
};

const getSummary = (g: dagre.graphlib.Graph<{}>) => {
  let summary = "";
  g.nodes().forEach(function (v) {
    summary += "Node " + v + ": " + JSON.stringify(g.node(v)) + "/n";
  });
  g.edges().forEach(function (e) {
    summary += "Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(g.edge(e)) + "/n";
  });

  return summary;
};

type GraphObject = {
  nodes: {
    id: string;
    data: {
      x: number;
      y: number;
      width: number;
      height: number;
      class?: string | undefined;
      label?: string | undefined;
      padding?: number | undefined;
      paddingX?: number | undefined;
      paddingY?: number | undefined;
      rx?: number | undefined;
      ry?: number | undefined;
      shape?: string | undefined;
    };
  }[];
  edges: {
    from: string;
    to: string;
    data: dagre.GraphEdge;
  }[];
};

const mapGraphToObject = (g: dagre.graphlib.Graph<{}>): GraphObject => {
  return {
    nodes: g.nodes().map((v: string) => ({ id: v, data: g.node(v) })),
    edges: g.edges().map(e => ({ from: e.v, to: e.w, data: g.edge(e) })),
  };
};

const mapObjectToGraph = ({ nodes, edges }: GraphObject): dagre.graphlib.Graph<{}> => {
  const g = createGraph();
  nodes.forEach(node => g.setNode(node.id, node.data));
  edges.forEach(edge => g.setEdge(edge.from, edge.to, edge.data));
  return g;
};

export const dagreUtils = {
  createGraph,
  getSummary,
  mapGraphToObject,
  mapObjectToGraph,
};
