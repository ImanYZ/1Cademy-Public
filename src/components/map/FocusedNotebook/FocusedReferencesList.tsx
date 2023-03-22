import { Box, Stack, SxProps, Theme, Typography } from "@mui/material";
import React from "react";
import { INode } from "src/types/INode";

import NodeTypeIcon from "@/components/NodeTypeIcon";

type ReferencesListProps = {
  node: INode;
  navigateToNode: (nodeId: string) => void;
  sx?: SxProps<Theme>;
};

const FocusedReferencesList = ({ node, sx, navigateToNode }: ReferencesListProps) => {
  if (!node.references.length) return null;

  return (
    <Box sx={{ ...sx }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {node.references.map((reference: any, idx: number) => {
          return (
            <Stack
              key={idx}
              onClick={() => navigateToNode(node.referenceIds[idx])}
              direction={"row"}
              spacing={2}
              sx={{
                width: "100%",
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
  );
};

export const MemoizedFocusedReferencesList = React.memo(FocusedReferencesList);
