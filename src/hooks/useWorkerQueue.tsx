import { graphlib } from "dagre";
import { MutableRefObject, useCallback, useEffect, useState } from "react";

import { AllTagsTreeView } from "../components/TagsSearcher";
import { dagreUtils } from "../lib/utils/dagre.util";
import { setDagNodes } from "../lib/utils/Map.utils";
import { ClusterNodes, FullNodeData, FullNodesData } from "../nodeBookTypes";

export type Task = {
  id: string;
  height: number;
};

type UseWorkerQueueProps = {
  g: MutableRefObject<graphlib.Graph<{}>>;
  nodes: FullNodesData;
  edges: any;
  setNodes: (newNodes: FullNodesData) => void;
  setMapWidth: any;
  setMapHeight: any;
  setClusterNodes: any;
  setEdges: any;
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

  console.log(" --> use nodes:", nodes, queue);
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
      // worker.onerror = (err) => err;
      worker.onmessage = e => {
        const { mapChangedFlag, oldClusterNodes, oldMapWidth, oldMapHeight, oldNodes, oldEdges, graph } = e.data;
        const gg = dagreUtils.mapObjectToGraph(graph);

        worker.terminate();
        g.current = gg;
        setMapWidth(oldMapWidth);
        setMapHeight(oldMapHeight);
        setClusterNodes(oldClusterNodes);
        setNodes(oldNodes);
        setEdges(oldEdges);
        setMapChanged(mapChangedFlag);
        setIsWorking(false);
      };
    },
    [allTags, g, mapHeight, mapWidth, setClusterNodes, setEdges, setMapChanged, setMapHeight, setMapWidth, setNodes]
  );

  useEffect(() => {
    console.log("[queue]: useEffect");
    if (isWorking) return;
    if (!queue.length) return;
    if (!g?.current) return;

    // CREATE WORKER with Nodes and Nodes changed
    console.log("[queue]: recalculateGraphWithWorker", nodes, queue[0], queue);
    const individualNodeChanges: FullNodeData[] = queue.map(cur => ({ ...nodes[cur.id], height: cur.height }));
    const nodesToRecalculate = setDagNodes(g.current, individualNodeChanges, nodes, allTags);
    // const nodesChanges: FullNodesData = individualNodeChanges.reduce((acu, cur) => {
    //   return { ...acu, [cur.node]: { ...cur } };
    // }, nodes);
    // const [firstTask, ...others] = queue;
    setQueue([]);
    // const nodeChanged: FullNodeData = { ...nodes[firstTask.id], height: firstTask.height };
    // console.log("--> nodeChanged", nodeChanged);
    // const nodesToRecalculate = setDagNode(g.current, firstTask.id, nodeChanged, { ...nodes }, { ...allTags }, null);
    recalculateGraphWithWorker(nodesToRecalculate, edges);
  }, [allTags, edges, g, isWorking, nodes, queue, recalculateGraphWithWorker]);

  const addTask = (newTask: Task) => {
    console.log("[queue]: add task\n", queue);
    setQueue(queue => [...queue, newTask]);
  };

  return { addTask, queue };
};
