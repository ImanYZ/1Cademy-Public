import { Box, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/system";

import { getNodePageUrl, getReferenceTitle } from "@/lib/utils/utils";

import { LinkedKnowledgeNode } from "../knowledgeTypes";
import { LinkedTag } from "./LinkedTag";

type TagsListProps = {
  tags: LinkedKnowledgeNode[];
  sx?: SxProps<Theme>;
};

export const TagsList = ({ tags, sx }: TagsListProps) => {
  if (!tags.length) return null;

  return (
    <Box sx={{ ...sx }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: "15px", mt: "20px" }}>
        Tags:
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {tags.map((node, idx) => (
          <LinkedTag
            key={idx}
            node={node.node}
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
