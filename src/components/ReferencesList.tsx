import { Divider } from "@mui/material";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/system";
import React from "react";

import { getNodePageUrl, isValidHttpUrl } from "@/lib/utils/utils";

import { LinkedKnowledgeNode } from "../knowledgeTypes";
import { LinkedReference } from "./LinkedReference";
import NodeTypeIcon from "./NodeTypeIcon";

type ReferencesListProps = {
  references: LinkedKnowledgeNode[];
  sx?: SxProps<Theme>;
};

export const ReferencesList = ({ references, sx }: ReferencesListProps) => {
  const getReferenceContent = (el: LinkedKnowledgeNode) => {
    return isValidHttpUrl(el.label) ? `${el.title}:  ${el.label}` : el.title || "";
  };

  if (!references.length) return null;

  return (
    <Box sx={{ ...sx }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: "15px", mt: "20px" }}>
        <Typography variant="body2" color="text.secondary">
          References
        </Typography>
        <NodeTypeIcon nodeType={"Reference"} sx={{ ml: "10px" }} />
      </Box>
      <Divider />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <List sx={{ width: "100%", p: 0 }}>
          {references.map((node, idx) => (
            <React.Fragment key={idx}>
              <LinkedReference
                title={node.title || ""}
                linkSrc={getNodePageUrl(node.title || "", node.node)}
                nodeType={node.nodeType}
                nodeImageUrl={node.nodeImage}
                nodeContent={getReferenceContent(node)}
                showListItemIcon={false}
                label={node.label || ""}
                sx={{ p: "10px", mx: "5px", ml: "-13px" }}
                secondaryActionSx={{ mr: "34px" }}
              />
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  );
};
