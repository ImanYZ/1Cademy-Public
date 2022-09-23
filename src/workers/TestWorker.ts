import { Task } from "../hooks/useWorkerQueue";

type LayoutHandler = { nodeChange: Task; nodes: Task[] };

const layoutHandler = async ({ nodeChange, nodes }: LayoutHandler): Promise<Task[]> => {
  const seg = Math.ceil(Math.random() * 3000);
  console.log("WORKER:", nodeChange, seg);

  await new Promise(res => {
    setTimeout(() => {
      res(true);
    }, seg);
  });
  if (nodes.find(cur => cur.id === nodeChange.id)) {
    return nodes.map(cur => (cur.id === nodeChange.id ? nodeChange : cur));
  }
  return [...nodes, nodeChange];
};

onmessage = async e => {
  const { nodeChange, nodes } = e.data;
  const newNodes = await layoutHandler({ nodeChange, nodes });
  console.log("end of worker:", newNodes);
  postMessage(newNodes);
};
