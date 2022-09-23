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
        const [, ...others] = queue;
        console.log("--others", others);
        setQueue(others);
        setIsWorking(false);
      };
    },
    [queue, setNodes]
  );

  useEffect(() => {
    console.log(0);
    if (isWorking) return;
    if (!queue.length) return;

    console.log(1);
    recalculateGraphWithWorker(queue[0], nodes);
  }, [isWorking, nodes, queue, recalculateGraphWithWorker]);

  const addTask = (newTask: Task) => {
    setQueue(queue => [...queue, newTask]);
  };

  return { addTask, queue };
};
