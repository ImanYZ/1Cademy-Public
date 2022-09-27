import { graphlib } from "dagre";
import { Dispatch, MutableRefObject, SetStateAction, useCallback, useEffect, useState } from "react";

import { AllTagsTreeView } from "../components/TagsSearcher";
import { dagreUtils, GraphObject } from "../lib/utils/dagre.util";
import { setDagNodes } from "../lib/utils/Map.utils";
import { ClusterNodes, EdgeData, EdgesData, FullNodeData, FullNodesData } from "../nodeBookTypes";

export type Task = {
  id: string;
  height: number;
};

type UseWorkerQueueProps = {
  g: MutableRefObject<graphlib.Graph<{}>>;
  nodes: FullNodesData;
  edges: any;
  setNodes: Dispatch<SetStateAction<FullNodesData>>;
  setMapWidth: any;
  setMapHeight: any;
  setClusterNodes: any;
  setEdges: Dispatch<SetStateAction<EdgesData>>;
  setMapChanged: any;
  mapWidth: number;
  mapHeight: number;
  allTags: AllTagsTreeView;
};
export const useWorkerQueue = ({
  g,
  nodes,
  setNodes,
  setMapWidth,
  setMapHeight,
  setClusterNodes,
  setEdges,
  setMapChanged,
  mapWidth,
  mapHeight,
  allTags,
  edges,
}: UseWorkerQueueProps) => {
  //   const [nodes, setNodes] = useState<Task[]>([]);
  const [queue, setQueue] = useState<Task[]>([]);
  const [isWorking, setIsWorking] = useState(false);

  // console.log(" --> use nodes:", nodes, queue);
  // const recalculateGraphWithWorker = useCallback(
  //   (newTask: Task, newNodes: FullNodesData) => {
  //     console.log("worker was created!", newNodes);
  //     setIsWorking(true);
  //     const worker: Worker = new Worker(new URL("../workers/TestWorker.ts", import.meta.url));
  //     worker.postMessage({ nodeChange: newTask, nodes: newNodes });
  //     // worker.onerror = (err) => err;
  //     worker.onmessage = e => {
  //       worker.terminate();
  //       console.log("result of worker:", e.data);
  //       const newNodes = e.data;
  //       setNodes(newNodes);
  //       setIsWorking(false);
  //     };
  //   },
  //   [setNodes]
  // );

  const recalculateGraphWithWorker = useCallback(
    (nodesToRecalculate: FullNodesData, edgesToRecalculate: any) => {
      console.log("[recalculateGraphWithWorker]", { nodesToRecalculate, edgesToRecalculate });
      let mapChangedFlag = true;
      const oldClusterNodes: ClusterNodes = {};
      let oldMapWidth = mapWidth;
      let oldMapHeight = mapHeight;
      let oldNodes = { ...nodesToRecalculate };
      let oldEdges = { ...edgesToRecalculate };
      setIsWorking(true);
      const worker: Worker = new Worker(new URL("../workers/MapWorker.ts", import.meta.url));

      worker.postMessage({
        mapChangedFlag,
        oldClusterNodes,
        oldMapWidth,
        oldMapHeight,
        oldNodes,
        oldEdges,
        allTags,
        graph: dagreUtils.mapGraphToObject(g.current),
      });
      worker.onerror = err => {
        console.log("[WORKER]error:", err);
        worker.terminate();
        setIsWorking(false);
      };
      worker.onmessage = e => {
        const { mapChangedFlag, oldClusterNodes, oldMapWidth, oldMapHeight, oldNodes, oldEdges, graph } = e.data;
        // const gg = dagreUtils.mapObjectToGraph(graph);
        const gObject = dagreUtils.mapGraphToObject(g.current);
        const graphObject: GraphObject = graph;
        // const nodesMerged = graphObject.nodes.
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

        worker.terminate();
        console.log({ g: g.current, gg });
        g.current = gg;
        setMapWidth(oldMapWidth);
        setMapHeight(oldMapHeight);
        setClusterNodes(oldClusterNodes);

        setNodes(nodes => {
          console.log("nodes", nodes);
          const nodesCopy = { ...nodes };
          Object.keys(nodesCopy).forEach(nodeId => {
            const resultNode: FullNodeData = oldNodes[nodeId];
            if (!resultNode) return;

            const overrideNode: FullNodeData = {
              ...nodesCopy[nodeId],
              left: resultNode.left,
              top: resultNode.top,
              x: resultNode.x,
              y: resultNode.y,
              height: resultNode.height,
            };
            console.log("override node");
            nodesCopy[nodeId] = overrideNode;
          });
          console.log(nodesCopy);
          return nodesCopy;
        });

        setEdges(edges => {
          console.log("override:edges:", { edges, oldEdges });
          const edgesCopy = { ...edges };
          Object.keys(edgesCopy).forEach(edgeId => {
            const resultEdge: EdgeData = oldEdges[edgeId];
            if (!resultEdge) return;

            edgesCopy[edgeId] = { ...resultEdge };
          });
          return edgesCopy;
        });
        setMapChanged(mapChangedFlag); // CHECK: if is used
        setIsWorking(false);
      };
    },
    [allTags, g, mapHeight, mapWidth, setClusterNodes, setEdges, setMapChanged, setMapHeight, setMapWidth, setNodes]
  );

  useEffect(() => {
    console.log("[queue]: useEffect", { nodes });
    if (isWorking) return;
    if (!queue.length) return;
    if (!g?.current) return;

    // CREATE WORKER with Nodes and Nodes changed
    console.log("[queue]: recalculateGraphWithWorker", nodes, queue[0], queue);
    const individualNodeChanges: FullNodeData[] = queue.map(cur => ({ ...nodes[cur.id], height: cur.height }));
    const nodesToRecalculate = setDagNodes(g.current, individualNodeChanges, nodes, allTags);
    recalculateGraphWithWorker(nodesToRecalculate, edges);
    setQueue([]);
  }, [allTags, edges, g, isWorking, nodes, queue, recalculateGraphWithWorker]);

  const addTask = (newTask: Task) => {
    console.log("[queue]: add task\n", queue);
    setQueue(queue => [...queue, newTask]);
  };

  return { addTask, queue };
};
