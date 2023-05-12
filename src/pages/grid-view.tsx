import { Box, SxProps, Theme, Typography } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Node, NodeGrid, NodePosition } from "../gridViewTypes";
import { useWindowSize } from "../hooks/useWindowSize";
import {
  GAP_X,
  GAP_Y,
  getNodesHeight,
  gridNodesToNodes,
  NODE_WIDTH,
  SMALL_GAP_Y,
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

  const getPivot = (type: NodePosition, containerHeigh: number, totalHeight: number, nodesOffsetHeight: number) => {
    if (type === "siblingsTop") return containerHeigh / 2 - totalHeight - GAP_Y - nodesOffsetHeight; // above nodes
    if (type === "siblingsBottom") return containerHeigh / 2 + GAP_Y + nodesOffsetHeight; // below nodes
    return containerHeigh / 2 - totalHeight / 2; // parents, children and nodes are centered on middle of window
  };

  const calculatePositions = (
    gridNodes: NodeGrid,
    leftPosition: number,
    containerHeigh: number,
    gap: number,
    type: NodePosition,
    nodesOffsetHeight: number = 0
  ): Node[] => {
    const nodes = gridNodesToNodes(gridNodes, type);
    const nodesHeight = getNodesHeight(nodes);
    const gapHeight = (nodes.length - 1) * gap;
    const totalHeight = nodesHeight + gapHeight;
    const nodesPivot = getPivot(type, containerHeigh, totalHeight, nodesOffsetHeight);
    const result = nodes.reduce(
      (acu: { nodes: Node[]; previousHeight: number }, cur) => {
        const thisNode: Node = { ...cur, top: acu.previousHeight, left: leftPosition };
        return { nodes: [...acu.nodes, thisNode], previousHeight: acu.previousHeight + cur.height + gap };
      },
      { nodes: [], previousHeight: nodesPivot }
    );
    return result.nodes;
  };

  const LEFT_POSITION: { [key in NodePosition]: number } = {
    nodes: 0,
    children: NODE_WIDTH + GAP_X,
    parents: -(NODE_WIDTH + GAP_X),
    siblingsTop: 57,
    siblingsBottom: 57,
  };

  const onChangeHeight = (id: string, height: number, type: NodePosition) => {
    setGridNodes(prev => {
      console.log("onChangeHeight", { id, height, type, prev });
      const thisNode = prev[type][id];
      if (!thisNode) return prev;

      const OFFSET_X = windowWidth / 2 - NODE_WIDTH / 2;
      const newGridNodes: NodeGrid = { ...prev, [type]: { ...prev[type], [id]: { ...thisNode, height } } };
      console.log({ id, type, newGridNodes });
      const nodesWithNewPositions: Node[] = calculatePositions(
        newGridNodes,
        LEFT_POSITION[type] + OFFSET_X,
        windowHeight,
        SMALL_GAP_Y,
        type,
        getNodesHeight(gridNodesToNodes(prev, "nodes")) / 2
      );
      const copyNewGridNodes = { ...newGridNodes };
      nodesWithNewPositions.forEach(cur => (copyNewGridNodes[type][cur.id] = cur));
      return copyNewGridNodes;
    });
  };

  return (
    <Box
      sx={{
        border: "dashed 6px royalBlue",
        height: "100vh",
        width: "100vw",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        position: "relative",
      }}
    >
      {nodes.map(cur => (
        <Node
          key={cur.id}
          node={cur}
          selectedNodeId={selectedNode?.id ?? ""}
          changeNodeHight={onChangeHeight}
          sx={{
            position: "absolute",
            top: `${cur.top}px`,
            left: `${cur.left}px`,
          }}
        />
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
      sx={{
        // width: selectedNodeId === node.id ? `${NODE_WIDTH}px` : `${SMALL_NODE_WIDTH}px`,
        width: node.position === "nodes" ? `${NODE_WIDTH}px` : `${SMALL_NODE_WIDTH}px`,
        backgroundColor: "#eee",
        border: "solid 2px orange",
        p: "10px",
        ...sx,
      }}
    >
      <Typography sx={{ fontSize: "24px", color: "#123" }}>{node.id}</Typography>
      <Typography sx={{ color: "#123" }}>{node.content}</Typography>
    </Box>
  );
};

const NODE_GRID: NodeGrid = {
  nodes: {
    n1: {
      id: "n1",
      top: 0,
      left: 0,
      height: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
      position: "nodes",
    },
  },
  parents: {
    p1: {
      id: "p1",
      top: 0,
      left: 0,
      height: 0,
      content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. ",
      position: "parents",
    },
    p2: {
      id: "p2",
      top: 0,
      left: 0,
      height: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
      position: "parents",
    },
    p3: {
      id: "p3",
      top: 0,
      left: 0,
      height: 0,
      content:
        "Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
      position: "parents",
    },
    p4: {
      id: "p4",
      top: 0,
      left: 0,
      height: 0,
      content:
        "Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
      position: "parents",
    },
    p5: {
      id: "p5",
      top: 0,
      left: 0,
      height: 0,
      content:
        "Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
      position: "parents",
    },
  },
  children: {
    CH1: {
      id: "CH1",
      top: 0,
      left: 0,
      height: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
      position: "children",
    },
    CH2: {
      id: "CH2",
      top: 0,
      left: 0,
      height: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
      position: "children",
    },
    CH3: {
      id: "CH3",
      top: 0,
      left: 0,
      height: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
      position: "children",
    },
  },
  siblingsTop: {
    st1: {
      id: "st1",
      top: 0,
      left: 0,
      height: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
      position: "siblingsTop",
    },
    st2: {
      id: "st2",
      top: 0,
      left: 0,
      height: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
      position: "siblingsTop",
    },
  },
  siblingsBottom: {
    sb1: {
      id: "sb1",
      top: 0,
      left: 0,
      height: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
      position: "siblingsBottom",
    },
    sb2: {
      id: "sb2",
      top: 0,
      left: 0,
      height: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
      position: "siblingsBottom",
    },
    sb3: {
      id: "sb3",
      top: 0,
      left: 0,
      height: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
      position: "siblingsBottom",
    },
  },
};
