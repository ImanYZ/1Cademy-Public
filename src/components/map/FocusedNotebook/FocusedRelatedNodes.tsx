import { Box, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import React from "react";
import { INode } from "src/types/INode";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import NodeTypeIcon from "../../NodeTypeIcon2";

type RelatedNodeProp = {
  node: any;
  currentNode: INode;
  navigateToNode: (nodeId: string) => void;
};

const FocusedRelatedNodes = ({ node, currentNode, navigateToNode }: RelatedNodeProp) => {
  return (
    <Box
      sx={{
        mx: "10px",
        borderTop: theme =>
          theme.palette.mode === "dark" ? `solid 1px ${theme.palette.common.white}` : "solid 1px #CFCFCF",
      }}
    >
      <Box sx={{ paddingY: "20px" }}>
        {node &&
          node.children.map((child: any, idx: number) => {
            if (child.title !== currentNode.title) {
              return (
                <ListItem
                  key={idx}
                  disablePadding
                  sx={{ display: "flex" }}
                  onClick={() => navigateToNode(child.node)}
                  secondaryAction={
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <ListItemIcon>
                        <NodeTypeIcon tooltipPlacement="bottom" nodeType={child.type} sx={{ marginLeft: "100px" }} />
                      </ListItemIcon>
                    </Box>
                  }
                >
                  <ListItemButton component="a" sx={{ p: "16px" }}>
                    <ListItemText primary={<MarkdownRender text={child.title || ""} />} disableTypography={true} />
                  </ListItemButton>
                </ListItem>
              );
            }
          })}
      </Box>
    </Box>
  );
};

export const MemoizedFocusedRelatedNodes = React.memo(FocusedRelatedNodes);
