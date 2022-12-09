import LinkIcon from "@mui/icons-material/Link";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  SxProps,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { INode } from "src/types/INode";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import NodeTypeIcon from "@/components/NodeTypeIcon";
import { isValidHttpUrl } from "@/lib/utils/utils";

type ReferencesListProps = {
  node: INode;
  navigateToNode: (nodeId: string) => void;
  sx?: SxProps<Theme>;
};

const FocusedReferencesList = ({ node, sx, navigateToNode }: ReferencesListProps) => {
  if (!node.references.length) return null;

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
          {node.references.map((reference: string, idx: number) => (
            <React.Fragment key={idx}>
              <ListItem
                onClick={() => navigateToNode(node.referenceIds[idx])}
                disablePadding
                sx={{ display: "flex", px: 0 }}
                secondaryAction={
                  <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    {isValidHttpUrl(node.referenceLabels[idx]) && (
                      <Tooltip title="Open the reference specified section in new tab">
                        <IconButton
                          target="_blank"
                          href={node.referenceLabels[idx]}
                          sx={{
                            ml: 2,
                            display: "flex",
                            direction: "row",
                            justifyContent: "center",
                            color: theme => theme.palette.common.darkGrayBackground,
                          }}
                        >
                          <LinkIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                }
              >
                <ListItemButton sx={{ ...sx }}>
                  <ListItemText primary={<MarkdownRender text={reference} />} disableTypography={true} />
                </ListItemButton>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export const MemoizedFocusedReferencesList = React.memo(FocusedReferencesList);
