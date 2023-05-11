import { Box, SxProps, Theme, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";

type Node = { id: string; content: string; top: number; left: number };
type NodePosition = "PARENTS" | "NODES" | "CHILDREN" | "SIBLINGS";

type NodeGrid = {
  center: { [key: string]: Node };
  parents: { [key: string]: Node };
  children: { [key: string]: Node };
  siblings: { [key: string]: Node };
};

const GridView = () => {
  // const getPositionY = (lenght: number, idx: number, height: number) => {
  //   const OFFSET = 100;
  //   return idx * height + OFFSET;
  // };

  const onChangeHeight = (id: string, height: number, type: "PARENT") => {
    console.log({ id, height, type });
  };

  const parents = Object.keys(NODE_GRID.parents).reduce((acu: Node[], cur) => [...acu, NODE_GRID.parents[cur]], []);

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
      {/* <Node
        id={NODE_GRID.node.id}
        content={NODE_GRID.node.content}
        sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
        changeNodeHight={onChangeHeight}
      /> */}
      {/* parents */}
      {parents.map(cur => (
        <Node
          key={cur.id}
          id={cur.id}
          content={cur.content}
          changeNodeHight={onChangeHeight}
          position={"PARENTS"}
          sx={{
            position: "absolute",
            top: `${cur.top}px`,
            left: `${cur.left}px`,
            // transform: "translate(-50%,-50%)",
          }}
        />
      ))}
    </Box>
  );
};

export default GridView;

type NodeProps = {
  id: string;
  content: string;
  changeNodeHight: (id: string, height: number, position: NodePosition) => void;
  position: NodePosition;
  sx?: SxProps<Theme>;
};
const Node = ({ id, content, changeNodeHight, sx }: NodeProps) => {
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

        changeNodeHight(id, blockSize);
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
  }, [changeNodeHight, id]);

  return (
    <Box ref={nodeRef} sx={{ width: "300px", backgroundColor: "#eee", border: "solid 2px orange", p: "10px", ...sx }}>
      <Typography sx={{ fontSize: "24px", color: "#123" }}>{id}</Typography>
      <Typography sx={{ color: "#123" }}>{content}</Typography>
    </Box>
  );
};

const NODE_GRID: NodeGrid = {
  center: {
    "01": {
      id: "10",
      top: 0,
      left: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
  },
  parents: {
    "00": {
      id: "00",
      top: 0,
      left: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
    "01": {
      id: "01",
      top: 0,
      left: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
  },
  children: {
    "11": {
      id: "11",
      top: 0,
      left: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
    "12": {
      id: "12",
      top: 0,
      left: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
    "13": {
      id: "13",
      top: 0,
      left: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
  },
  siblings: {
    "10a": {
      id: "10a",
      top: 0,
      left: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
    "10b": {
      id: "10b",
      top: 0,
      left: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
    "00a": {
      id: "00a",
      top: 0,
      left: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
    "00b": {
      id: "00b",
      top: 0,
      left: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
    "00c": {
      id: "00c",
      top: 0,
      left: 0,
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
  },
};
