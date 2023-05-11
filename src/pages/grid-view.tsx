import { Box, SxProps, Theme, Typography } from "@mui/material";
import React from "react";

type Node = { id: string; content: string };

type NodeGrid = {
  node: Node;
  parents: Node[];
  children: Node[];
  siblings: Node[];
};

const GridView = () => {
  const getPositionY = (lenght: number, idx: number, height: number) => {
    const OFFSET = 100;
    return idx * height + OFFSET;
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
      <Node
        id={NODE_GRID.node.id}
        content={NODE_GRID.node.content}
        sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
      />
      {/* parents */}
      {NODE_GRID.parents.map((cur, idx, src) => (
        <Node
          key={cur.id}
          id={cur.id}
          content={cur.content}
          sx={{
            position: "absolute",
            top: getPositionY(src.length, idx, 200),
            left: "20%",
            transform: "translate(-50%,-50%)",
          }}
        />
      ))}
    </Box>
  );
};

export default GridView;

type NodeProps = { id: string; content: string; sx?: SxProps<Theme> };
const Node = ({ id, content, sx }: NodeProps) => {
  return (
    <Box sx={{ width: "300px", backgroundColor: "#eee", border: "solid 2px orange", p: "10px", ...sx }}>
      <Typography sx={{ fontSize: "24px", color: "#123" }}>{id}</Typography>
      <Typography sx={{ color: "#123" }}>{content}</Typography>
    </Box>
  );
};
const NODE_GRID: NodeGrid = {
  node: {
    id: "10",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
  },
  parents: [
    {
      id: "00",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
    {
      id: "01",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
  ],
  children: [
    {
      id: "11",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
    {
      id: "12",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
    {
      id: "13",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
  ],
  siblings: [
    {
      id: "10a",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
    {
      id: "10b",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
    {
      id: "00a",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
    {
      id: "00b",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
    {
      id: "00c",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem culpa dolor unde at earum! Voluptatum provident, cupiditate ea officia debitis obcaecati, fugit odit architecto nihil delectus doloremque. Autem, commodi veritatis.",
    },
  ],
};
