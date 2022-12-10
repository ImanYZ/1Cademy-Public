import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Box, Chip, SxProps, Theme, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { FullNodesData } from "src/nodeBookTypes";
import { INode } from "src/types/INode";

import HtmlTooltip from "@/components/HtmlTooltip";
import MarkdownRender from "@/components/Markdown/MarkdownRender";

type TagsListProp = {
  loadNodeData: (nodeId: string) => Promise<any>;
  nodes: FullNodesData;
  node: INode;
  sx?: SxProps<Theme>;
  navigateToNode: (nodeId: string) => void;
};

const FocusedTagsList = ({ nodes, node, sx, navigateToNode, loadNodeData }: TagsListProp) => {
  const [linkedNodes, setLinkedNodes] = useState<{
    [nodeId: string]: any;
  }>({});

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

  if (!node.tags.length) return null;
  return (
    <Box sx={{ ...sx }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: "15px", mt: "20px" }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: "15px", mt: "20px" }}>
          Tags
        </Typography>
        <LocalOfferIcon sx={{ fontSize: "1.5rem", ml: "10px", color: "#ff8a33" }} />
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {node.tags.map((tag, idx) => {
          const nodeId = node.tagIds[idx];
          const nodeImageUrl = linkedNodes[nodeId] ? linkedNodes[nodeId].nodeImage : "";
          const nodeTitle = linkedNodes[nodeId] ? linkedNodes[nodeId].title : "";
          return (
            <HtmlTooltip
              key={node.tagIds[idx] || tag}
              title={
                <Box>
                  <Typography variant="body2" component="div">
                    <MarkdownRender text={linkedNodes[nodeId] ? linkedNodes[nodeId].content : ""} />
                  </Typography>
                  {nodeImageUrl && (
                    <Box>
                      {/* TODO: change to next Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={nodeImageUrl} alt={nodeTitle} width="100%" height="100%" />
                    </Box>
                  )}
                </Box>
              }
              placement="left"
            >
              <Chip
                onClick={() => navigateToNode(node.tagIds[idx])}
                label={<MarkdownRender text={tag} />}
                sx={{ p: "20px", color: "black", fontSize: "14px", borderRadius: "20px" }}
              />
            </HtmlTooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export const MemoizedFocusedTagsList = React.memo(FocusedTagsList);
