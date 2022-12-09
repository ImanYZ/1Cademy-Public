import { Box, Card, CardHeader, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import React from "react";
import { INodeLink } from "src/types/INodeLink";

import NodeTypeIcon from "@/components/NodeTypeIcon";

import MarkdownRender from "../../Markdown/MarkdownRender";
import TypographyUnderlined from "../../TypographyUnderlined";

type FocusedLinkedNodesProps = {
  header: string;
  nodeLinks: INodeLink[];
  navigateToNode: (nodeId: string) => void;
};

const FocusedLinkedNodes = ({ header, nodeLinks, navigateToNode }: FocusedLinkedNodesProps) => {
  return (
    <Card>
      <CardHeader
        sx={{
          backgroundColor: theme => theme.palette.common.darkGrayBackground,
          color: theme => theme.palette.common.white,
        }}
        title={
          <Box sx={{ textAlign: "center" }}>
            <TypographyUnderlined variant="h6" fontWeight="300" gutterBottom align="center">
              {header}
            </TypographyUnderlined>
          </Box>
        }
      ></CardHeader>
      <List sx={{ p: "0px" }}>
        {nodeLinks.map(nodeLink => (
          <ListItem
            key={nodeLink.node}
            disablePadding
            sx={{ display: "flex" }}
            onClick={() => navigateToNode(nodeLink.node)}
            secondaryAction={
              <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <ListItemIcon>
                  <NodeTypeIcon tooltipPlacement="bottom" nodeType={nodeLink.type} sx={{ marginLeft: "auto" }} />
                </ListItemIcon>
              </Box>
            }
          >
            <ListItemButton component="a" sx={{ p: "16px" }}>
              <ListItemText primary={<MarkdownRender text={nodeLink.title || ""} />} disableTypography={true} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

export const MemoizedFocusedLinkedNodes = React.memo(FocusedLinkedNodes);
