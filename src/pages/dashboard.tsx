import { Box } from "@mui/system";
import dagre from "dagre";
import { useCallback, useEffect, useState } from "react";
// eslint-disable-next-line no-use-before-define
/*eslint-disable */
import { MapInteractionCSS } from "react-map-interaction";

/*eslint-enable */
import Node from "../components/map/Node";
// import { useMemoizedCallback } from "../hooks/useMemoizedCallback";
import { NodeUser } from "../knowledgeTypes";
import { dag1, NODE_HEIGHT, NODE_WIDTH, XOFFSET, YOFFSET } from "../lib/utils/Map.utils";

const NODES: { [key: string]: NodeUser } = {
  n1: {
    title: "title node 1",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pharetra dapibus vulputate. Ut semper nulla mi. In ex augue, interdum nec tempor ut, iaculis in odio. Quisque eget aliquam libero. Ut fringilla pulvinar lacus, nec vulputate nulla efficitur eu. Aliquam eget ligula lacus. Nam eu sapien eget nunc convallis fermentum eget quis odio. Sed quis tellus eget elit placerat tincidunt. Nam pretium laoreet nunc in rhoncus. Nunc lacinia tempus risus vitae interdum. Sed eget magna ultricies, scelerisque odio nec, pellentesque massa."
  },
  n2: {
    title: "title node 2",
    content:
      "Mauris odio ligula, fringilla et sapien in, fringilla pharetra velit. Mauris vulputate laoreet purus ut malesuada. Vestibulum ac odio neque. In ante augue, aliquam non malesuada non, placerat in nisl. Nunc a condimentum lectus, in auctor risus. Fusce felis urna, eleifend et lacinia in, blandit in neque. Duis ultricies risus lectus, at mollis odio interdum vitae. Ut commodo eros ut elit tempus, eget ultrices quam convallis. Etiam luctus erat justo, ac laoreet purus auctor eu."
  },
  n3: {
    title: "title node 3",
    content:
      "Sdf  sapien in, fringilla pharetra velit. Mauris vulputate laoreet purus ut malesuada. Vestibulum ac odio neque. In ante augue, aliquam non malesuada non, placerat in nisl. Nunc a condimentum lectus, in auctor risus. Fusce felis urna, eleifend et lacinia in, blandit in neque. Duis ultricies risus lectus, at mollis odio interdum vitae. Ut commodo eros ut elit tempus, eget ultrices quam convallis. Etiam luctus erat justo, ac laoreet purus auctor eu."
  },
  n4: {
    title: "title node 4",
    content:
      "Mauris odi fringilla et sapien in, fringilla pharetra velit. Mauris vulputate laoreet purus ut malesuada. Vestibulum ac odio neque. In ante augue, aliquam non malesuada non, placerat in nisl. Nunc a condimentum lectus, in auctor risus. Fusce felis urna, eleifend et lacinia in, blandit in neque. Duis ultricies risus lectus, at mollis odio interdum vitae. Ut commodo eros ut elit tempus, eget ultrices quam convallis. Etiam luctus erat justo, ac laoreet purus auctor eu."
  },
  n5: {
    title: "title node 5",
    content:
      "Mauris odio ligula, fringilla et sapien in, fringilla pharetra velit. Mauris vulputate laoreet purus ut malesuada. Vestibulum ac odio neque. In ante augue, aliquam non malesuada non, placerat in nisl. Nunc a condimentum lectus, in auctor risus. Fusce felis urna, eleifend et lacinia in, blandit in neque. Duis ultricies risus lectus, at mollis odio interdum vitae. Ut commodo eros ut elit tempus, eget ultrices quam convallis. Etiam luctus erat justo, ac laoreet purus auctor eu."
  }
};

type DashboardProps = {};

const Dashboard = ({}: DashboardProps) => {
  // dag1.setNode("kspacey", { label: 'sdfkdsf', width: 144, height: 100 });
  // dag1.setNode("sdfsdf", { label: 'sdfkdsf', width: 144, height: 100 });
  const [mapRendered, setMapRendered] = useState(false);
  // const [nodes, setNodes] = useState<{ [key: string]: NodeUser }>({});

  const getNodes = () => {
    return dag1.nodes().map(cur => {
      const nodeN = dag1.node(cur);
      console.log("nodeN", nodeN);
      const node = NODES[cur];
      const newLeft = nodeN.x + XOFFSET - nodeN.width / 2;
      const newTop = nodeN.y + YOFFSET - nodeN.height / 2;
      return { id: cur, node: { ...node, left: newLeft, top: newTop } };
    });
  };

  const nodeChanged = useCallback(
    (nodeRef, nodeId: string) => {
      console.log("nodeRef:", nodeRef);
      const nodeFromGraph = dag1.node(nodeId);
      if (!nodeFromGraph) return;

      if (!nodeRef.current) return;

      console.log("nodeRef.current.offsetHeight", nodeRef.current.offsetHeight, NODE_HEIGHT);
      const newHeight = nodeRef.current.offsetHeight || NODE_HEIGHT;
      dag1.setNode(nodeId, { ...nodeFromGraph, height: newHeight });
    },
    [mapRendered]
  );

  // const nodeChanged = useMemoizedCallback(
  //   (nodeRef: any, nodeId: string, content: string, title: string, imageLoaded: boolean, openPart: boolean) => {
  //     // console.log("In nodeChanged, nodeId:", nodeId);
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

  useEffect(() => {
    console.log("will fill");
    Object.entries(NODES).forEach(([key]) => dag1.setNode(key, { with: NODE_WIDTH, height: NODE_HEIGHT }));
    console.log("will reacalculate dagre");
    dagre.layout(dag1);
    setMapRendered(true);
  }, []);

  // useEffect(() => {
  //   console.log('check if we can render')
  //   if (mapRendered) {

  //     console.log('call the render')
  //     // recalculate height with and mark as nodeChanges to rerender again
  //     setMapRendered(false)
  //   }
  // }, [mapRendered])

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <MapInteractionCSS>
        {/* show clusters */}
        {/* link list */}
        {/* node list */}
        {/* {Object.entries(NODES).map(([, value], idx) => <Node key={idx} node={value} />)} */}
        {getNodes().map((cur, idx) => (
          <Node key={idx} nodeId={cur.id} node={cur.node} nodeChanged={nodeChanged} />
        ))}
        dash
      </MapInteractionCSS>
    </Box>
  );
};

export default Dashboard;
