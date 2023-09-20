/**
 * @jest-environment jsdom
 */

import "react";
import "@testing-library/jest-dom";
import "../../../mocks/workers/webWorker";

import { render, screen } from "@testing-library/react";
import { useEffect, useRef, useState } from "react";
import { FullNodeData } from "src/nodeBookTypes";

import { useWorkerQueue } from "@/hooks/useWorkerQueue";
import { dagreUtils } from "@/lib/utils/dagre.util";
import { Graph } from "@/pages/notebook";

type WrapperProps = { graph: Graph };
const Wrapper = (initialValues: WrapperProps) => {
  const [graph, setGraph] = useState<Graph>(initialValues.graph);
  const [mapHeight, setMapHeight] = useState(1000);
  const [mapWidth, setMapWidth] = useState(1000);
  const g = useRef(dagreUtils.createGraph());

  const { addTask, isQueueWorking } = useWorkerQueue({
    setNodeUpdates: jest.fn(),
    allTags: {},
    g,
    graph,
    mapHeight,
    mapWidth,
    onComplete: jest.fn(),
    setClusterNodes: jest.fn(),
    setGraph,
    setMapHeight,
    setMapWidth,
    withClusters: false,
  });

  // should execute the useEffect only the first time, the addTask is never changed
  useEffect(() => {
    addTask({ id: "n01", height: 450 });
  }, [addTask]);

  return (
    <div>
      <h1>State: {isQueueWorking ? "working" : "completed"}</h1>
      <ul>
        {Object.keys(graph.nodes)
          .map(k => graph.nodes[k])
          .map(c => (
            <li data-testid={c.node} key={c.node}>
              left:{c.left}, top:{c.top}
            </li>
          ))}
      </ul>
    </div>
  );
};

describe("should test use worker", () => {
  it("should test error boundary", async () => {
    const graph: Graph = { nodes: { n01: generateNode("n01") }, edges: {} };
    render(<Wrapper graph={graph} />);

    expect(await screen.findByText("State: working")).toBeInTheDocument();
    expect(await screen.findByText("State: completed")).toBeInTheDocument();

    Object.values(graph.nodes).forEach(c => {
      const buttonElement = screen.getByTestId(c.node);
      expect(buttonElement.textContent).toBe("left:100, top:100");
    });
  });
});

const generateNode = (nodeId: string): FullNodeData => ({
  changed: true,
  correct: false,
  createdAt: new Date("2021-05-25T18:14:07.574Z"),
  updatedAt: new Date("2023-08-24T23:55:05.912Z"),
  deleted: false,
  isStudied: false,
  bookmarked: false,
  node: nodeId,
  user: "jjnnx",
  wrong: false,
  notebooks: ["1xjMdGklUUNwZSzwzVpK"],
  expands: [true],
  referenceLabels: [""],
  // adminPoints: 0.5,
  changedAt: new Date("2021-06-29T14:32:33.329Z"),
  // chooseUname: false, // this exist doesn't exist type
  aChooseUname: false,
  isTag: false, // this doesn't exist on answer
  corrects: 1,
  aFullname: "Sam Winter",
  nodeType: "Relation",
  tags: [],
  versions: 1,
  institNames: ["University of Michigan - Ann Arbor"],
  studied: 0,
  aImgUrl:
    "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2Fundefined%2FMon%2C%2011%20Jan%202021%2020%3A52%3A14%20GMT.png?alt=media&token=95e37cea-40f7-48ed-bad5-7a21af2f5ce8",
  maxVersionRating: 1,
  contribNames: ["swinter00"],
  content: "content of node 1",
  parents: [],
  viewers: 4,
  nodeImage: "",
  admin: "swinter00",
  comments: 0,
  institutions: {
    "University of Michigan - Ann Arbor": {
      reputation: 0.5,
    },
  },
  title: "title of node 1",
  references: ["Python Documentation"],
  children: [],
  wrongs: 0,
  referenceIds: ["srNYrnun6zK1Csh5MWOo"],
  contributors: {},
  tagIds: ["MlwLPB5GwSBWXgf1wqTe"],
  userNodeId: "8rKnI2bYWouj4poAuBXo",
  nodeChangeType: "added",
  userNodeChangeType: "added",
  editable: false,
  left: 0,
  top: 0,
  firstVisit: new Date("2023-08-24T23:55:05.908Z"),
  lastVisit: new Date("2023-08-24T23:55:05.908Z"),
  bookmarks: 0,
  choices: [],
  nodeChanges: null,
  visible: true,
});
