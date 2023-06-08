import { graphlib } from "dagre";
import { Dispatch, MutableRefObject, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AllTagsTreeView } from "../components/TagsSearcher";
import { dagreUtils, GraphObject } from "../lib/utils/dagre.util";
import { setDagNodes } from "../lib/utils/Map.utils";
import { EdgeData, EdgesData, FullNodeData, FullNodesData, TNodeUpdates } from "../nodeBookTypes";

export type Task = {
  id: string;
  height: number;
} | null;

type UseWorkerQueueProps = {
  setNodeUpdates: (nodeUpdates: TNodeUpdates) => void;
  g: MutableRefObject<graphlib.Graph<{}>>;
  graph: { nodes: FullNodesData; edges: EdgesData };
  setGraph: Dispatch<
    SetStateAction<{
      nodes: FullNodesData;
      edges: EdgesData;
    }>
  >;
  setMapWidth: any;
  setMapHeight: any;
  mapWidth: number;
  mapHeight: number;
  allTags: AllTagsTreeView;
  onComplete: () => void;
  setClusterNodes: any;
  withClusters: boolean;
};
export const useWorkerQueue = ({
  setNodeUpdates,
  g,
  graph,
  setGraph,
  setMapWidth,
  setMapHeight,
  mapWidth,
  mapHeight,
  allTags,
  onComplete,
  setClusterNodes,
  withClusters,
}: UseWorkerQueueProps) => {
  const [queue, setQueue] = useState<Task[]>([]);
  const [isWorking, setIsWorking] = useState(false);
  const [didWork, setDidWork] = useState(false);
  const isSameGraphRef = useRef(false);
  const workerRef = useRef<Worker | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deferredTimer, setDeferredTimer] = useState<NodeJS.Timeout | null>(null);

  const recalculateGraphWithWorker = useCallback(
    (nodesToRecalculate: FullNodesData, edgesToRecalculate: any) => {
      let oldMapWidth = mapWidth;
      let oldMapHeight = mapHeight;
      let oldNodes = { ...nodesToRecalculate };
      let oldEdges = { ...edgesToRecalculate };
      setIsWorking(true);
      isSameGraphRef.current = true;
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }

      const worker: Worker = new Worker(new URL("../workers/MapWorker.ts", import.meta.url));
      workerRef.current = worker;

      worker.postMessage({
        oldMapWidth,
        oldMapHeight,
        oldNodes,
        oldEdges,
        allTags,
        graph: dagreUtils.mapGraphToObject(g.current),
        withClusters,
        computedState: (g.current.graph() as any).computedState,
      });
      worker.onerror = err => {
        console.error("[WORKER]error:", err);
        worker.terminate();
        setIsWorking(false);
      };
      worker.onmessage = e => {
        const { oldMapWidth, oldMapHeight, oldNodes, oldEdges, graph, oldClusterNodes, computedState } = e.data;

        const gObject = dagreUtils.mapGraphToObject(g.current);
        const graphObject: GraphObject = graph;

        graphObject.edges.forEach(cur => {
          const indexFound = gObject.edges.findIndex(c => c.from === cur.from && c.to == cur.to);
          if (indexFound < 0) return;
          gObject.edges[indexFound] = { ...cur };
        });
        graphObject.nodes.forEach(cur => {
          const indexFound = gObject.nodes.findIndex(c => c.id === cur.id);
          if (indexFound < 0) return;
          gObject.nodes[indexFound] = { ...cur };
        });

        const gg = dagreUtils.mapObjectToGraph(gObject);
        (gg.graph() as any).computedState = computedState; // for memo values

        worker.terminate();
        workerRef.current = null;

        g.current = gg;
        setMapWidth(oldMapWidth);
        setMapHeight(oldMapHeight);
        setClusterNodes(oldClusterNodes);

        setDidWork(true);
        setGraph(({ nodes, edges }) => {
          const nodesCopy = { ...nodes };
          const updatedNodeIds: string[] = [];
          Object.keys(nodesCopy).forEach(nodeId => {
            const resultNode: FullNodeData = oldNodes[nodeId];
            if (!resultNode) return;

            const workerProps = ["left", "top", "x", "y", "height"];
            const isSame = workerProps.reduce(
              (c, k) => c && resultNode[k as keyof FullNodeData] === nodes[nodeId][k as keyof FullNodeData],
              true
            );
            isSameGraphRef.current = isSameGraphRef.current && isSame;
            // setIsSameGraph(oldIsSameGraph => {
            //   console.log("isSame ", { oldIsSameGraph, isSame, total: oldIsSameGraph && isSame });
            //   return oldIsSameGraph && isSame;
            // });
            if (isSame) return true; // don't update graph for this node
            // console.log(`calc height ${nodeId}`, { nH: resultNode.height, H: nodesCopy[nodeId].height });

            // if (resultNode.height !== nodesCopy[nodeId].height) {
            //   // console.log(`calc height ${nodeId}`, { nH: resultNode.height, H: nodesCopy[nodeId].height });
            // }
            const overrideNode: FullNodeData = {
              ...nodesCopy[nodeId],
              left: resultNode.left,
              top: resultNode.top,
              x: resultNode.x,
              y: resultNode.y,
              height: resultNode.height ? resultNode.height : nodesCopy[nodeId].height,
            };
            updatedNodeIds.push(nodeId);
            nodesCopy[nodeId] = overrideNode;
          });

          const edgesCopy: EdgesData = { ...edges };
          const edgeKeys = ["fromX", "fromY", "label", "points", "toX", "toY"];
          Object.keys(edgesCopy).forEach(edgeId => {
            const resultEdge: EdgeData = oldEdges[edgeId];
            if (!resultEdge) {
              return;
            }

            const isChanged = edgeKeys.some(
              k => resultEdge[k as keyof EdgeData] === edgesCopy[edgeId][k as keyof EdgeData]
            );
            if (isChanged) {
              edgesCopy[edgeId] = { ...resultEdge };
            }
          });
          setNodeUpdates({
            nodeIds: updatedNodeIds,
            updatedAt: new Date(),
          });

          return { nodes: nodesCopy, edges: edgesCopy };
        });
        if (!isSameGraphRef.current) onComplete();
        setIsWorking(false);
      };
    },
    [
      allTags,
      g,
      mapHeight,
      mapWidth,
      onComplete,
      setClusterNodes,
      setGraph,
      setMapHeight,
      setMapWidth,
      setNodeUpdates,
      withClusters,
    ]
  );

  useEffect(() => {
    if (isWorking) return;
    if (!queue.length) return;
    if (!g?.current) return;
    if (!Object.keys(graph.nodes).length) return setQueue([]); // when nodes are removed we need to clean queue
    // CREATE WORKER with Nodes and Nodes changed
    // console.log("[queue]: recalculateGraphWithWorker", { graph, queue });
    const individualNodeChanges: FullNodeData[] = queue
      .map(cur => {
        if (!cur) return null;
        if (!graph.nodes[cur.id]) return null; // when graph was modified and queue has old values
        return { ...graph.nodes[cur.id], height: cur.height };
      })
      .flatMap(cur => cur || []);

    const nodesToRecalculate = setDagNodes(g.current, individualNodeChanges, graph.nodes, allTags, withClusters);

    recalculateGraphWithWorker(nodesToRecalculate, graph.edges);
    setQueue([]);

    // // Implemention of executing only last
    // setDeferredTimer(deferredTimer => {
    //   const t = setTimeout(() => {
    //     if (deferredTimer) {
    //       clearTimeout(deferredTimer);
    //     }
    //     // CREATE WORKER with Nodes and Nodes changed
    //     // console.log("[queue]: recalculateGraphWithWorker", { graph, queue });
    //     const individualNodeChanges: FullNodeData[] = queue
    //       .map(cur => {
    //         if (!cur) return null;
    //         return { ...graph.nodes[cur.id], height: cur.height };
    //       })
    //       .flatMap(cur => cur || []);
    //     const nodesToRecalculate = setDagNodes(g.current, individualNodeChanges, graph.nodes, allTags, withClusters);

    //     console.log({ nodes: nodesToRecalculate, edges: graph.edges, g: g.current });
    //     recalculateGraphWithWorker(nodesToRecalculate, graph.edges);
    //     setQueue([]);
    //   }, 100);
    //   return t;
    // });
  }, [allTags, g, graph, isWorking, queue, recalculateGraphWithWorker, withClusters]);

  const addTask = useCallback(
    (newTask: Task) => {
      setQueue(queue => [...queue, newTask]);
    },
    [setQueue]
  );

  const queueFinished = useMemo(() => {
    if (!didWork) return false; // it dident execute a task before
    if (queue.length) return false; // it has pendient tasks

    // if (isQueueWorking) return false; // is working now
    return true;
  }, [didWork, queue.length]);

  return { addTask, queue, isQueueWorking: isWorking, queueFinished };
};
