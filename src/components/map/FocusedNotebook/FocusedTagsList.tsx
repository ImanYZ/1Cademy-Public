import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Box, Stack, SxProps, Theme, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { FullNodesData } from "src/nodeBookTypes";
import { INode } from "src/types/INode";

import NodeTypeIcon from "../../NodeTypeIcon2";

type TagsListProp = {
  loadNodeData: (nodeId: string) => Promise<any>;
  nodes: FullNodesData;
  node: INode;
  sx?: SxProps<Theme>;
  navigateToNode: (nodeId: string) => void;
};

const FocusedTagsList = ({ nodes, node, navigateToNode, loadNodeData }: TagsListProp) => {
  const [linkedNodes, setLinkedNodes] = useState<{
    [nodeId: string]: any;
  }>({});
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (window.innerWidth <= 500) {
      setIsMobile(true);
    }
  }, [window.innerWidth]);
  useEffect(() => {
    let _nodes: {
      [nodeId: string]: any;
    } = {};

    for (let i = 0; i < node.tags.length; i++) {
      const tagNodeId = node.tagIds[i];
      if (nodes.hasOwnProperty(tagNodeId)) {
        _nodes[tagNodeId] = nodes[tagNodeId];
      } else {
        loadNodeData(tagNodeId).then(nodeData => {
          setLinkedNodes(linkedNodes => {
            return { ...linkedNodes, [tagNodeId]: nodeData };
          });
        });
      }
    }

    setLinkedNodes(_nodes);
  }, [node]);
  if (isMobile) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {node.tags.map((tag: any, idx: number) => {
          const nodeId = node.tagIds[idx];
          const nodeTitle = linkedNodes[nodeId] ? linkedNodes[nodeId].title : "";
          return (
            <Stack
              key={idx}
              onClick={() => navigateToNode(nodeId)}
              direction={"row"}
              spacing={2}
              sx={{
                cursor: "pointer",
                padding: "5px 10px 5px 10px",
                ":hover": {
                  background: theme => (theme.palette.mode === "dark" ? "#404040" : "#ECECEC"),
                },
              }}
            >
              <LocalOfferIcon
                sx={{
                  marginRight: "5px",
                  marginTop: "5px",
                  fontSize: "16px",
                  color: "#f9a825",
                }}
              />
              <Typography
                sx={{
                  color: theme =>
                    theme.palette.mode === "light"
                      ? theme.palette.common.darkGrayBackground
                      : theme.palette.common.white,
                }}
                fontSize={16}
                variant="subtitle1"
              >
                {nodeTitle}
              </Typography>
            </Stack>
          );
        })}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        py: "10px",
        borderTop: theme =>
          theme.palette.mode === "dark" ? `solid 1px ${theme.palette.common.white}` : "solid 1px #CFCFCF",
      }}
    >
      <Box sx={{ py: "8px", display: "flex", justifyContent: "space-between" }}>
        <Box
          sx={{
            p: "10px 6px 10px 13px",
            width: "48%",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <strong>References</strong>
            {node.references.map((reference: any, idx: number) => {
              return (
                <Stack
                  key={idx}
                  onClick={() => navigateToNode(node.referenceIds[idx])}
                  direction={"row"}
                  spacing={2}
                  sx={{
                    cursor: "pointer",
                    padding: "5px 10px 5px 10px",
                    ":hover": {
                      background: theme => (theme.palette.mode === "dark" ? "#404040" : "#ECECEC"),
                    },
                  }}
                >
                  <NodeTypeIcon
                    nodeType={"Reference"}
                    sx={{
                      fontSize: "16px",

                      marginTop: "5px",
                    }}
                  />
                  <Typography
                    sx={{
                      color: theme =>
                        theme.palette.mode === "light"
                          ? theme.palette.common.darkGrayBackground
                          : theme.palette.common.white,
                    }}
                    fontSize={16}
                    variant="subtitle1"
                  >
                    {reference}
                  </Typography>
                </Stack>
              );
            })}
          </Box>
        </Box>
        <Box
          sx={{
            background: theme => (theme.palette.mode === "dark" ? "#404040" : "#D0D5DD"),
            width: "1px",
          }}
        />
        <Box
          sx={{
            p: "10px 6px 10px 13px",
            width: "48%",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <strong>Tags</strong>
            {node.tags.map((tag: any, idx: number) => {
              const nodeId = node.tagIds[idx];
              const nodeTitle = linkedNodes[nodeId] ? linkedNodes[nodeId].title : "";
              return (
                <Stack
                  key={idx}
                  onClick={() => navigateToNode(nodeId)}
                  direction={"row"}
                  spacing={2}
                  sx={{
                    cursor: "pointer",
                    padding: "5px 10px 5px 10px",
                    ":hover": {
                      background: theme => (theme.palette.mode === "dark" ? "#404040" : "#ECECEC"),
                    },
                  }}
                >
                  <LocalOfferIcon
                    sx={{
                      marginRight: "5px",
                      marginTop: "5px",
                      fontSize: "16px",
                      color: "#f9a825",
                    }}
                  />
                  <Typography
                    sx={{
                      color: theme =>
                        theme.palette.mode === "light"
                          ? theme.palette.common.darkGrayBackground
                          : theme.palette.common.white,
                    }}
                    fontSize={16}
                    variant="subtitle1"
                  >
                    {nodeTitle}
                  </Typography>
                </Stack>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const MemoizedFocusedTagsList = React.memo(FocusedTagsList);
