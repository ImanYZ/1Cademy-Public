import { EdgeData, EdgesData, FullNodeData, FullNodesData } from "src/nodeBookTypes";

import { GraphObject } from "@/lib/utils/dagre.util";

type WebWorkerDagreMessageEvent = {
  oldClusterNodes: any;
  oldMapWidth: number;
  oldMapHeight: number;
  oldNodes: FullNodesData;
  oldEdges: EdgesData;
  graph: GraphObject;
  computedState: any;
};

// @ts-ignore
class MockWorker implements Worker {
  constructor(stringUrl: string) {
    this.url = stringUrl;
    this.onmessage = null;
  }

  postMessage(data: WebWorkerDagreMessageEvent): void {
    console.log("web worker mocked!");
    if (this.onmessage) {
      // @ts-ignore
      setTimeout(() => this.onmessage({ data: simulateDagreWebWorker(data) }), 50); // this is to simulate the time takes to the worker to complete the task
    } else {
      console.warn('dev, set up the "onmessage" function before "postMessage" to become testable the web worker');
    }
  }

  // Properties from Worker interface
  onmessage: ((this: Worker, ev: MessageEvent) => any) | null;
  terminate(): void {}
  readonly url: string;
  // ... other properties from Worker interface
}

(global as any).Worker = MockWorker; // Assign the mock implementation to the global Worker

const simulateDagreWebWorker = ({
  oldMapWidth,
  oldMapHeight,
  oldNodes,
  oldEdges,
  graph,
  computedState,
}: WebWorkerDagreMessageEvent) => {
  const workerResults: WebWorkerDagreMessageEvent = {
    oldClusterNodes: {},
    computedState,
    graph: {
      // dagre object
      nodes: graph.nodes.map(c => ({ ...c, data: { ...c.data, x: 100, y: 100 } })),
      edges: graph.edges.map(c => ({ ...c, data: { ...c.data, fromX: 10, fromY: 10, toX: 90, toY: 90 } })),
      parents: [],
    },
    oldEdges: Object.keys(oldEdges) // edges from graph state
      .map(k => ({ ...oldEdges[k], k }))
      .reduce((a: EdgesData, c) => {
        const k = c.k;
        const tmp: any = { ...c };
        delete tmp.k;
        const tmpEdge: EdgeData = { ...tmp, fromX: 10, fromY: 10, toX: 90, toY: 90 };
        return { ...a, [k]: tmpEdge };
      }, {}),
    oldNodes: Object.keys(oldNodes) // node from graph state
      .map(k => oldNodes[k])
      .reduce((a: FullNodesData, c) => {
        const tmp: any = { ...c };
        const tmpEdge: FullNodeData = { ...tmp, left: 100, top: 100 };
        return { ...a, [tmpEdge.node]: tmpEdge };
      }, {}),
    oldMapHeight,
    oldMapWidth,
  };

  return workerResults;
};
