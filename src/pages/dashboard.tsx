import { Button } from "@mui/material";
import { Box } from "@mui/system";
import dagre from "dagre";
import { useCallback, useEffect, useState } from "react";
import { MapInteractionCSS } from "react-map-interaction";

import Line from "../components/map/Line/Line";
import Node from "../components/map/Node";
// import { useMemoizedCallback } from "../hooks/useMemoizedCallback";
import { NodeUser, Point } from "../knowledgeTypes";
import { dag1, NODE_HEIGHT, NODE_WIDTH, XOFFSET, YOFFSET } from "../lib/utils/Map.utils";

const NODES: { [key: string]: NodeUser } = {
  n1: {
    title: "title node 1",
    content:
      "Sdf  sapien in, fringilla pharetra velit. Mauris vulputate laoreet purus ut malesuada. Vestibulum ac odio neque. In ante augue, aliquam non malesuada non, placerat in nisl. Nunc a condimentum lectus, in auctor risus. Fusce felis urna, eleifend et lacinia in, blandit in neque. Duis ultricies risus lectus, at mollis odio interdum vitae. Ut commodo eros ut elit tempus, eget ultrices quam convallis. Etiam luctus erat justo, ac laoreet purus auctor eu.",
    left: 0,
    top: 0,
    width: 0,
    height: 0
  },
  n2: {
    title: "title node 2",
    content: "",
    left: 0,
    top: 0,
    width: 0,
    height: 0
  },
  n3: {
    title: "title node 3",
    content:
      "Sdf  sapien in, fringilla pharetra velit. Mauris vulputate laoreet purus ut malesuada. Vestibulum ac odio neque. In ante augue, aliquam non malesuada non, placerat in nisl. Nunc a condimentum lectus, in auctor risus. Fusce felis urna, eleifend et lacinia in, blandit in neque. Duis ultricies risus lectus, at mollis odio interdum vitae. Ut commodo eros ut elit tempus, eget ultrices quam convallis. Etiam luctus erat justo, ac laoreet purus auctor eu.",
    left: 0,
    top: 0,
    width: 0,
    height: 0
  },
  n4: {
    title: "title node 4",
    content:
      "Mauris odi fringilla et sapien in, fringilla pharetra velit. Mauris vulputate laoreet purus ut malesuada. Vestibulum ac odio neque. In ante augue, aliquam non malesuada non, placerat in nisl. Nunc a condimentum lectus, in auctor risus. Fusce felis urna, eleifend et lacinia in, blandit in neque. Duis ultricies risus lectus, at mollis odio interdum vitae. Ut commodo eros ut elit tempus, eget ultrices quam convallis. Etiam luctus erat justo, ac laoreet purus auctor eu.",
    left: 0,
    top: 0,
    width: 0,
    height: 0
  },
  n5: {
    title: "title node 5",
    content:
      "Mauris odio ligula, fringilla et sapien in, fringilla pharetra velit. Mauris vulputate laoreet purus ut malesuada. Vestibulum ac odio neque. In ante augue, aliquam non malesuada non, placerat in nisl. Nunc a condimentum lectus, in auctor risus. Fusce felis urna, eleifend et lacinia in, blandit in neque. Duis ultricies risus lectus, at mollis odio interdum vitae. Ut commodo eros ut elit tempus, eget ultrices quam convallis. Etiam luctus erat justo, ac laoreet purus auctor eu.",
    left: 0,
    top: 0,
    width: 0,
    height: 0
  }
};

type Edge = { from: string; to: string };
const EDGES: Edge[] = [
  { from: "n1", to: "n2" },
  { from: "n2", to: "n5" }
];

type EdgeProcess = { from: Point; to: Point };
// const EDGES: EdgeProcess[] = []

type DashboardProps = {};

const Dashboard = ({}: DashboardProps) => {
  // dag1.setNode("kspacey", { label: 'sdfkdsf', width: 144, height: 100 });
  // dag1.setNode("sdfsdf", { label: 'sdfkdsf', width: 144, height: 100 });
  const [mapChanged, setMapChanged] = useState(false);
  const [mapRendered, setMapRendered] = useState(false);
  const [nodes, setNodes] = useState<{ [key: string]: NodeUser }>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [edges, setEdges] = useState<EdgeProcess[]>([]);

  // const getNodes = () => {
  //   return dag1.nodes().map(cur => {
  //     const nodeN = dag1.node(cur);

  //     const node = NODES[cur];
  //     const newLeft = nodeN.x + XOFFSET - nodeN.width / 2;
  //     const newTop = nodeN.y + YOFFSET - nodeN.height / 2;
  //     return { id: cur, node: { ...node, left: newLeft, top: newTop } };
  //   });
  // };

  const showDaggerState = () => {
    console.log("show dagger");
    // dag1.nodes().map((cur, idx) => {
    //   const nodeN = dag1.node(cur);
    //   // const newLeft = nodeN.x + XOFFSET - nodeN.width / 2;
    //   // const newTop = nodeN.y + YOFFSET - nodeN.height / 2;

    // });
  };

  const nodeChanged = useCallback(
    (nodeRef, nodeId: string) => {
      console.log("[NODE CHANGED]", mapRendered);
      if (!mapRendered) return;
      if (!nodeRef.current) return;
      console.log("[node changed]");
      // const nodeFromGraph = dag1.node(nodeId);
      // if (!nodeFromGraph) return;

      // if (!nodeRef.current) return;

      // const newHeight = nodeRef.current.offsetHeight || NODE_HEIGHT;
      // dag1.setNode(nodeId, { ...nodeFromGraph, height: newHeight });
      // dagre.layout(dag1);

      // const nodeN = dag1.node(nodeId);
      // const newLeft = nodeN.x + XOFFSET - nodeN.width / 2;
      // const newTop = nodeN.y + YOFFSET - nodeN.height / 2;

      // setNodes(oldNodes => {
      //   const tmp = { ...oldNodes }
      //   tmp[nodeId].left = newLeft;
      //   tmp[nodeId].top = newTop;
      //   tmp[nodeId].height = nodeRef.current.offsetHeight || NODE_HEIGHT
      //   tmp[nodeId].width = nodeRef.current.offsetWidth || NODE_WIDTH
      //   return tmp
      // })

      // const newUserEdges = dag1.edges().map((edgeId): EdgeProcess => {
      //   // edgeId.v
      //   // edgeId.w
      //   const fromNode = nodes[edgeId.v]
      //   const toNode = nodes[edgeId.w]
      //   // const { points } = dag1.edge(edgeId)

      //   const newFromX = fromNode.left + NODE_WIDTH;
      //   const newFromY = fromNode.top + Math.floor(fromNode.height / 2);
      //   // const newFromY = fromNode.top + Math.floor(NODE_HEIGHT / 2);
      //   const newToX = toNode.left;
      //   const newToY = toNode.top + Math.floor(toNode.height / 2);
      //   // const newToY = toNode.top + Math.floor(NODE_HEIGHT / 2);
      //   return { from: { x: newFromX, y: newFromY }, to: { x: newToX, y: newToY } }
      // })

      // // // const newUserEdges: EdgeProcess[] = dag1.edges().map((edgeId): EdgeProcess => {
      // // //   const { points } = dag1.edge(edgeId)
      // // //   // return { from: points[0], to: points[2] }
      // // //   return {
      // // //     from: { x: points[0].x + XOFFSET, y: points[0].y + YOFFSET },
      // // //     to: { x: points[2].x + XOFFSET, y: points[2].y + YOFFSET },
      // // //   }
      // // // })

      // setEdges(newUserEdges)
      // export const setDagEdge = (from, to, edge, oldEdges) => {

      //   // checks that the from and to nodes exist in map
      //   if (dag1[0].hasNode(from) && dag1[0].hasNode(to)) {
      //     const edgeId = from + "-" + to;
      //     const newEdge = { ...edge };
      //     dag1[0].setEdge(from, to, newEdge);
      //     // adds newEdge to oldEdges
      //     oldEdges[edgeId] = newEdge;
      //   }
      //   return oldEdges;
      // };

      // const nodeFromDagre = dag1.node(nodeId)
      const node = nodes[nodeId];

      // build new Node
      let newNode: NodeUser = { ...node };

      const newHeight = nodeRef.current.offsetHeight || NODE_HEIGHT;

      newNode.width = node?.width ? node.width : NODE_WIDTH;
      // newNode.height = node?.height ? node.height : NODE_HEIGHT;
      newNode.height = newHeight;
      if (node?.left) newNode.left = node.left;
      if (node?.top) newNode.top = node.top;
      // if (node?.top) newNode.top = node.top;
      if (node?.x) newNode.x = node.x;
      if (node?.y) newNode.y = node.y;

      // set dag node
      // set Nodes

      setNodes(oldNodes => {
        const tmp = { ...oldNodes };
        return { ...tmp, [nodeId]: newNode };
      });
      console.log("newNode", { newNode });
      // dag1.setNode(nodeId, newNode); // uncoment this
      setMapChanged(true);
    },
    [mapRendered]
  );

  useEffect(() => {
    if (dag1.nodes().length !== Object.entries(NODES).length) {
      Object.entries(NODES).forEach(([key]) => dag1.setNode(key, { width: NODE_WIDTH, height: NODE_HEIGHT }));
      EDGES.forEach(({ from, to }) => {
        dag1.setEdge(from, to);
      });
      setMapChanged(true);
    }
  }, [nodes]);

  useEffect(() => {
    console.log("[WORKER]");

    let mapChangedFlag = mapChanged;
    while (mapChangedFlag) {
      console.log("[worker]");

      mapChangedFlag = false;
      // simulates the worker.js

      // Update cluster

      // ITERATE oldNodes
      // get every node (nodeN) calculated by dagre
      // calculate OFFSETs
      // update with setDagNode
      // calculate map

      dagre.layout(dag1);
      const newUserNodes = dag1.nodes().reduce((acu, cur) => {
        const thisNode = { ...nodes[cur] };
        const nodeN = dag1.node(cur);
        const newLeft = nodeN.x + XOFFSET - nodeN.width / 2;
        const newTop = nodeN.y + YOFFSET - nodeN.height / 2;
        if (!thisNode?.left || !thisNode?.top) {
          dag1.setNode(cur, { ...nodeN, left: newLeft, top: newTop });
        }
        return {
          ...acu,
          [cur]: {
            ...nodes[cur],
            left: newLeft,
            top: newTop
          }
        };
      }, {});

      console.log("newUserNodes", newUserNodes);
      setNodes(newUserNodes);

      setMapChanged(false);

      // setTimeout(() => {
      //   if (mapRendered) return
      // }, 1000)
      setMapRendered(true);
      // setEdges(newUserEdges)
      // setMapRendered(true);

      // ITERATE EDGES and calculate the new positions
    }
  }, [mapChanged]);

  // const nodeChanged = useMemoizedCallback(
  //   (nodeRef: any, nodeId: string, content: string, title: string, imageLoaded: boolean, openPart: boolean) => {

  //     let currentHeight = NODE_HEIGHT;
  //     let newHeight = NODE_HEIGHT;
  //     let nodesChanged = false;
  //     if (mapRendered && (nodeRef.current || content !== null || title !== null)) {
  //       setNodes((oldNodes) => {
  //         const node = { ...oldNodes[nodeId] };
  //         if (content !== null && node.content !== content) {
  //           node.content = content;
  //           nodesChanged = true;
  //         }
  //         if (title !== null && node.title !== title) {
  //           node.title = title;
  //           nodesChanged = true;
  //         }
  //         if (nodeRef.current) {
  //           const { current } = nodeRef;
  //           newHeight = current.offsetHeight;
  //           if ("height" in node && Number(node.height)) {
  //             currentHeight = Number(node.height);
  //           }
  //           if (
  //             (Math.abs(currentHeight - newHeight) >= MIN_CHANGE &&
  //               (node.nodeImage === "" || imageLoaded)) ||
  //             ("open" in node && node.open && !node.openHeight) ||
  //             ("open" in node && !node.open && !node.closedHeight)
  //           ) {
  //             if (node.open) {
  //               node.height = newHeight;
  //               if (openPart === null) {
  //                 node.openHeight = newHeight;
  //               }
  //             } else {
  //               node.height = newHeight;
  //               node.closedHeight = newHeight;
  //             }
  //             nodesChanged = true;
  //           }
  //         }
  //         if (nodesChanged) {
  //           return setDagNode(nodeId, node, { ...oldNodes }, () => setMapChanged(true));
  //         } else {
  //           return oldNodes;
  //         }
  //       });
  //     }
  //   },
  //   //  referenced by pointer, so when these variables change, it will be updated without having to redefine the function
  //   [mapRendered, allTags]
  // );

  // useEffect(() => {

  //   if (mapRendered) {

  //     // recalculate height with and mark as nodeChanges to rerender again
  //     setMapRendered(false)
  //   }
  // }, [mapRendered])

  console.log(nodes);
  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <MapInteractionCSS>
        {/* show clusters */}
        {/* link list */}
        {/* node list */}
        {/* {Object.entries(NODES).map(([, value], idx) => <Node key={idx} node={value} />)} */}
        <Button onClick={showDaggerState}>get Nodes</Button>
        <Button
          onClick={() => {
            setMapChanged(true);
          }}
        >
          map changed to TRUE {mapChanged ? "T" : "F"}
        </Button>
        {Object.entries(nodes).map(([key, nodeValue], idx) => {
          return <Node key={idx} nodeId={key} node={nodeValue} nodeChanged={nodeChanged} />;
        })}
        {edges.map(({ from, to }, idx) => {
          return <Line key={idx} from={from} to={to} label="" leftDirection color="rgb(1, 211, 106)" />;
        })}
        dash
      </MapInteractionCSS>
    </Box>
  );
};

export default Dashboard;
