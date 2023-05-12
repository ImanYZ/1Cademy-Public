import { Box, SxProps, Theme, Typography } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Node, NodeGrid, NodePosition } from "../gridViewTypes";
import { useWindowSize } from "../hooks/useWindowSize";
import {
  calculateNodePosition,
  calculateNodesPositions,
  changeNodesPosition,
  gridNodesToNodes,
  NODE_WIDTH,
  SMALL_NODE_WIDTH,
} from "../lib/utils/gridView.utils";

const GridView = () => {
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [gridNodes, setGridNodes] = useState<NodeGrid>(NODE_GRID);
  const [selectedNode /* setSelectedNode */] = useState<Node | null>(null);

  const nodes = useMemo(
    () => [
      ...gridNodesToNodes(gridNodes, "nodes"),
      ...gridNodesToNodes(gridNodes, "parents"),
      ...gridNodesToNodes(gridNodes, "children"),
      ...gridNodesToNodes(gridNodes, "siblingsTop"),
      ...gridNodesToNodes(gridNodes, "siblingsBottom"),
    ],
    [gridNodes]
  );
  // console.log(">>>>>>>>>>>>>>>>>>>", { nodes, gridNodes });

  const onChangeHeight = (id: string, height: number, type: NodePosition) => {
    setGridNodes(prev => calculateNodePosition({ id, height, type, gridNodes: prev, windowWidth, windowHeight }));
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = event => {
    console.log(event.key);

    if (event.key === "Enter") {
      console.log("Enter key pressed");
    }

    if (event.key === "ArrowDown") {
      console.log("ArrowDown key pressed");
    }

    if (event.key === "ArrowLeft") {
      console.log("ArrowLeft key pressed");
      setGridNodes(prev => {
        const gridNodesUpdated: NodeGrid = {
          children: {},
          nodes: changeNodesPosition(prev.children, "nodes"),
          parents: changeNodesPosition(prev.nodes, "parents"),
          siblingsBottom: {},
          siblingsTop: {},
        };
        return calculateNodesPositions({ gridNodes: gridNodesUpdated, windowWidth, windowHeight });
      });
    }

    if (event.key === "ArrowRight") {
      console.log("ArrowRight key pressed");
      setGridNodes(prev => {
        const gridNodesUpdated: NodeGrid = {
          children: changeNodesPosition(prev.nodes, "children"),
          nodes: changeNodesPosition(prev.parents, "nodes"),
          parents: {},
          siblingsBottom: {},
          siblingsTop: {},
        };
        return calculateNodesPositions({ gridNodes: gridNodesUpdated, windowWidth, windowHeight });
      });
    }

    if (event.key === "ArrowUp") {
      console.log("ArrowUp key pressed");
    }
  };

  return (
    <Box
      tabIndex={0}
      onKeyDown={handleKeyDown}
      sx={{
        border: "dashed 6px royalBlue",
        height: "100vh",
        width: "100vw",
        // display: "grid",
        // gridTemplateColumns: "1fr 1fr 1fr",
        position: "relative",
      }}
    >
      {nodes.map(cur => (
        <Node key={cur.id} node={cur} selectedNodeId={selectedNode?.id ?? ""} changeNodeHight={onChangeHeight} />
      ))}
    </Box>
  );
};

export default GridView;

type NodeProps = {
  node: Node;
  selectedNodeId: string;
  changeNodeHight: (id: string, height: number, position: NodePosition) => void;
  sx?: SxProps<Theme>;
};
const Node = ({ node, /* selectedNodeId */ changeNodeHight, sx }: NodeProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const previousHeightRef = useRef<number>(0);
  const previousTopRef = useRef<string>("0px");
  useEffect(() => {
    console.log("start", node.id);
    return () => console.log("end", node.id);
  }, [node.id]);

  useEffect(() => {
    observer.current = new ResizeObserver(entries => {
      try {
        const { blockSize } = entries[0].borderBoxSize[0];
        const topPosition = (entries[0].target as any)?.style?.top;
        const isSimilar = blockSize === previousHeightRef.current;
        previousHeightRef.current = blockSize;
        previousTopRef.current = topPosition;
        if (isSimilar) return;

        console.log("changeNodeHight", { id: node.id, pos: node.position, blockSize });
        changeNodeHight(node.id, blockSize, node.position);
      } catch (err) {
        console.warn("invalid entry", err);
      }
    });

    if (nodeRef.current) {
      observer.current.observe(nodeRef.current);
    }

    return () => {
      if (!observer.current) return;
      return observer.current.disconnect();
    };
  }, [changeNodeHight, node.id, node.position]);

  return (
    <Box
      ref={nodeRef}
      tabIndex={0}
      sx={{
        // width: selectedNodeId === node.id ? `${NODE_WIDTH}px` : `${SMALL_NODE_WIDTH}px`,
        width: node.position === "nodes" ? `${NODE_WIDTH}px` : `${SMALL_NODE_WIDTH}px`,
        backgroundColor: "#eee",
        border: "solid 2px orange",
        p: "10px",
        transition: "1s",
        position: "absolute",
        top: `${node.top}px`,
        left: `${node.left}px`,
        ...sx,
      }}
    >
      <Typography sx={{ fontSize: "24px", color: "#123" }}>{node.id}</Typography>
      <Typography sx={{ color: "#123" }}>{node.content}</Typography>
    </Box>
  );
};

// const NODE_GRID: NodeGrid = {
//   nodes: {
//     n1: {
//       id: "n1",
//       top: 0,
//       left: 0,
//       height: 0,
//       content:
//         "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
//       position: "nodes",
//     },
//   },
//   parents: {
//     p1: {
//       id: "p1",
//       top: 0,
//       left: 0,
//       height: 0,
//       content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. ",
//       position: "parents",
//     },
//     p2: {
//       id: "p2",
//       top: 0,
//       left: 0,
//       height: 0,
//       content:
//         "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
//       position: "parents",
//     },
//     p3: {
//       id: "p3",
//       top: 0,
//       left: 0,
//       height: 0,
//       content:
//         "Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
//       position: "parents",
//     },
//     p4: {
//       id: "p4",
//       top: 0,
//       left: 0,
//       height: 0,
//       content:
//         "Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
//       position: "parents",
//     },
//     p5: {
//       id: "p5",
//       top: 0,
//       left: 0,
//       height: 0,
//       content:
//         "Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
//       position: "parents",
//     },
//   },
//   children: {
//     CH1: {
//       id: "CH1",
//       top: 0,
//       left: 0,
//       height: 0,
//       content:
//         "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
//       position: "children",
//     },
//     CH2: {
//       id: "CH2",
//       top: 0,
//       left: 0,
//       height: 0,
//       content:
//         "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
//       position: "children",
//     },
//     CH3: {
//       id: "CH3",
//       top: 0,
//       left: 0,
//       height: 0,
//       content:
//         "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
//       position: "children",
//     },
//   },
//   siblingsTop: {
//     st1: {
//       id: "st1",
//       top: 0,
//       left: 0,
//       height: 0,
//       content:
//         "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
//       position: "siblingsTop",
//     },
//     st2: {
//       id: "st2",
//       top: 0,
//       left: 0,
//       height: 0,
//       content:
//         "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
//       position: "siblingsTop",
//     },
//   },
//   siblingsBottom: {
//     sb1: {
//       id: "sb1",
//       top: 0,
//       left: 0,
//       height: 0,
//       content:
//         "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
//       position: "siblingsBottom",
//     },
//     sb2: {
//       id: "sb2",
//       top: 0,
//       left: 0,
//       height: 0,
//       content:
//         "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
//       position: "siblingsBottom",
//     },
//     sb3: {
//       id: "sb3",
//       top: 0,
//       left: 0,
//       height: 0,
//       content:
//         "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
//       position: "siblingsBottom",
//     },
//   },
// };

const NODE_GRID: NodeGrid = {
  nodes: {
    n1: {
      id: "n1",
      top: 0,
      left: 0,
      height: 0,
      content: "n1",
      position: "nodes",
    },
  },
  parents: {
    p1: {
      id: "p1",
      top: 0,
      left: 0,
      height: 0,
      content: "p1",
      position: "parents",
    },
    p2: {
      id: "p2",
      top: 0,
      left: 0,
      height: 0,
      content: "p2",
      position: "parents",
    },
    p3: {
      id: "p3",
      top: 0,
      left: 0,
      height: 0,
      content: "p3",
      position: "parents",
    },
    p4: {
      id: "p4",
      top: 0,
      left: 0,
      height: 0,
      content: "p4",
      position: "parents",
    },
    p5: {
      id: "p5",
      top: 0,
      left: 0,
      height: 0,
      content: "p5",
      position: "parents",
    },
  },
  children: {
    CH1: {
      id: "CH1",
      top: 0,
      left: 0,
      height: 0,
      content: "CH1",
      position: "children",
    },
    CH2: {
      id: "CH2",
      top: 0,
      left: 0,
      height: 0,
      content: "CH2",
      position: "children",
    },
    CH3: {
      id: "CH3",
      top: 0,
      left: 0,
      height: 0,
      content: "CH3",
      position: "children",
    },
  },
  siblingsTop: {
    st1: {
      id: "st1",
      top: 0,
      left: 0,
      height: 0,
      content: "st1",
      position: "siblingsTop",
    },
    st2: {
      id: "st2",
      top: 0,
      left: 0,
      height: 0,
      content: "st2",
      position: "siblingsTop",
    },
  },
  siblingsBottom: {
    sb1: {
      id: "sb1",
      top: 0,
      left: 0,
      height: 0,
      content: "sb1",
      position: "siblingsBottom",
    },
    sb2: {
      id: "sb2",
      top: 0,
      left: 0,
      height: 0,
      content: "sb2",
      position: "siblingsBottom",
    },
    sb3: {
      id: "sb3",
      top: 0,
      left: 0,
      height: 0,
      content: "sb3",
      position: "siblingsBottom",
    },
  },
};
