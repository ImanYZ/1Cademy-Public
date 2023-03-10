import {
  Box,
  Card,
  CardHeader,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { FullNodesData } from "src/nodeBookTypes";
import { INodeLink } from "src/types/INodeLink";

import HtmlTooltip from "@/components/HtmlTooltip";
import NodeTypeIcon from "@/components/NodeTypeIcon";

import MarkdownRender from "../../Markdown/MarkdownRender";
import TypographyUnderlined from "../../TypographyUnderlined";

type FocusedLinkedNodesProps = {
  loadNodeData: (nodeId: string) => Promise<any>;
  header: string;
  nodes: FullNodesData;
  nodeLinks: INodeLink[];
  navigateToNode: (nodeId: string) => void;
  width: number;
};

const FocusedLinkedNodes = ({
  header,
  nodeLinks,
  nodes,
  navigateToNode,
  loadNodeData,
  width,
}: FocusedLinkedNodesProps) => {
  const [linkedNodes, setLinkedNodes] = useState<{
    [nodeId: string]: any;
  }>({});

  useEffect(() => {
    let _nodes: {
      [nodeId: string]: any;
    } = {};

    for (const nodeLink of nodeLinks) {
      if (nodes.hasOwnProperty(nodeLink.node)) {
        _nodes[nodeLink.node] = nodes[nodeLink.node];
      } else {
        loadNodeData(nodeLink.node).then(nodeData => {
          setLinkedNodes(linkedNodes => {
            return { ...linkedNodes, [nodeLink.node]: nodeData };
          });
        });
      }
    }

    setLinkedNodes(_nodes);
  }, [nodeLinks]);
  return (
    <Card>
      <CardHeader
        sx={{
          backgroundColor: theme => (theme.palette.mode === "dark" ? "#242425" : "#EAECF0"),
          color: theme => (theme.palette.mode === "dark" ? theme.palette.common.white : "#1D2939"),
        }}
        title={
          <Box sx={{ textAlign: "center" }}>
            <TypographyUnderlined variant="h6" fontWeight="500" gutterBottom align="center" sx={{ color: "inherit" }}>
              {header}
            </TypographyUnderlined>
          </Box>
        }
      ></CardHeader>
      <List sx={{ p: "0px", background: theme => (theme.palette.mode === "dark" ? "#303134" : "#F2F4F7") }}>
        {nodeLinks.map(nodeLink => {
          const nodeImageUrl = linkedNodes[nodeLink.node] ? linkedNodes[nodeLink.node].nodeImage : "";
          const nodeTitle = linkedNodes[nodeLink.node] ? linkedNodes[nodeLink.node].title : "";
          return (
            <HtmlTooltip
              key={nodeLink.node}
              title={
                <Box>
                  <Typography variant="body2" component="div">
                    <MarkdownRender text={linkedNodes[nodeLink.node] ? linkedNodes[nodeLink.node].content : ""} />
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
              placement={width > 899 ? "left" : "top"}
            >
              <ListItem
                disablePadding
                sx={{ display: "flex" }}
                onClick={() => navigateToNode(nodeLink.node)}
                secondaryAction={
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <ListItemIcon>
                      <NodeTypeIcon tooltipPlacement="bottom" nodeType={nodeLink.type} sx={{ marginLeft: "100px" }} />
                    </ListItemIcon>
                  </Box>
                }
              >
                <ListItemButton component="a" sx={{ p: "16px" }}>
                  <ListItemText primary={<MarkdownRender text={nodeLink.title || ""} />} disableTypography={true} />
                </ListItemButton>
              </ListItem>
            </HtmlTooltip>
          );
        })}
      </List>
    </Card>
  );
};

export const MemoizedFocusedLinkedNodes = React.memo(FocusedLinkedNodes);
