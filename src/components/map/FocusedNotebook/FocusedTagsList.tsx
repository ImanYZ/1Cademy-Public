import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Box, Chip, SxProps, Theme, Typography } from "@mui/material";
import React from "react";
import { INode } from "src/types/INode";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

type TagsListProp = {
  node: INode;
  sx?: SxProps<Theme>;
  navigateToNode: (nodeId: string) => void;
};

const FocusedTagsList = ({ node, sx, navigateToNode }: TagsListProp) => {
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
        {node.tags.map((tag, idx) => (
          <Chip
            key={node.tagIds[idx] || tag}
            onClick={() => navigateToNode(node.tagIds[idx])}
            label={<MarkdownRender text={tag} />}
            sx={{ p: "20px", color: "black", fontSize: "14px", borderRadius: "20px" }}
          />
        ))}
      </Box>
    </Box>
  );
};

export const MemoizedFocusedTagsList = React.memo(FocusedTagsList);
