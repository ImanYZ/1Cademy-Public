import { useCallback, useEffect, useState } from "react";

export type Task = {
  id: string;
  height: number;
};

type UseWorkerQueueProps = {
  nodes: Task[];
  setNodes: (newNodes: Task[]) => void;
};
export const useWorkerQueue = ({ nodes, setNodes }: UseWorkerQueueProps) => {
  //   const [nodes, setNodes] = useState<Task[]>([]);
  const [queue, setQueue] = useState<Task[]>([]);
  const [isWorking, setIsWorking] = useState(false);

  console.log(" --> use nodes:", nodes, queue);
  const recalculateGraphWithWorker = useCallback(
    (newTask: Task, newNodes: Task[]) => {
      console.log("worker was created!", newNodes);
      setIsWorking(true);
      const worker: Worker = new Worker(new URL("../workers/TestWorker.ts", import.meta.url));
      worker.postMessage({ nodeChange: newTask, nodes: newNodes });
      // worker.onerror = (err) => err;
      worker.onmessage = e => {
        worker.terminate();
        console.log("result of worker:", e.data);
        const newNodes = e.data;
        setNodes(newNodes);
        setIsWorking(false);
      };
    },
    [setNodes]
  );

  useEffect(() => {
    console.log("[queue]: useEffect");
    if (isWorking) return;
    if (!queue.length) return;

    console.log("[queue]: recalculateGraphWithWorker", nodes, queue[0], queue);

    const [, ...others] = queue;
    console.log("--others", others, queue);
    setQueue(others);
    recalculateGraphWithWorker(queue[0], nodes);
  }, [isWorking, nodes, queue, recalculateGraphWithWorker]);

  const addTask = (newTask: Task) => {
    console.log("[queue]: add task\n", queue);
    setQueue(queue => [...queue, newTask]);
  };

  return { addTask, queue };
};
