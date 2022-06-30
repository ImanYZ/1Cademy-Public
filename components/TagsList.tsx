import { Box, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React from "react";

import { getNodePageUrl, getReferenceTitle, isValidHttpUrl } from "../lib/utils";
import { LinkedKnowledgeNode } from "../src/knowledgeTypes";
import { LinkedTag } from "./LinkedTag";

type TagsListProps = {
  tags: LinkedKnowledgeNode[];
  sx?: SxProps<Theme>;
};

export const TagsList = ({ tags, sx }: TagsListProps) => {

  if (!tags.length) return null

  return (
    <Box sx={{ ...sx }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: "15px", mt: "20px" }}>
        Tags:
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {tags.map((node, idx) => (
          <LinkedTag
            key={idx}
            title={getReferenceTitle(node)}
            linkSrc={getNodePageUrl(node.title || "", node.node)}
            nodeImageUrl={node.nodeImage}
            nodeContent={node.content}
          />
        ))}
      </Box>
    </Box>
  );
};
