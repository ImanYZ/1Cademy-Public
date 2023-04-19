import { Box, Paper, Typography } from "@mui/material";
import React from "react";
import { NodeType } from "src/types";

import NodeTypeIcon from "@/components/NodeTypeIcon";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { NODE_TYPE_OPTIONS } from "./SidebarV2/UserSettigsSidebar";

type NodeTypeTrendsProps = {
  nodeTypeStats: Map<NodeType, string>;
};

const NodeTypeTrends = ({ nodeTypeStats }: NodeTypeTrendsProps) => {
  return (
    <Box component={"section"} sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", mt: "16px" }}>
      {NODE_TYPE_OPTIONS.map((nodeType, idx) => (
        <Paper
          key={`${nodeType}-${idx}`}
          sx={{
            p: "16px",
            borderRadius: "8px",
            backgroundColor: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray200,
          }}
        >
          <NodeTypeIcon nodeType={nodeType} sx={{ justifyContent: "flex-start" }} />
          <Typography fontSize={"16px"} fontWeight={"600"}>
            {nodeTypeStats.get(nodeType)}
          </Typography>
          <Typography>{`${nodeType}s`}</Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default NodeTypeTrends;
