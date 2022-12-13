import { FormControl, MenuItem } from "@mui/material";
import Select from "@mui/material/Select";
import React, { useId } from "react";
import { FullNodeData } from "src/nodeBookTypes";

import NodeTypeIcon from "@/components/NodeTypeIcon";

type NodeTypeSelectorProps = {
  nodeId: string;
  setNodeParts: (nodeId: string, callback: (thisNode: FullNodeData) => FullNodeData) => void;
  nodeType: string;
};
const NodeTypeSelector = ({ nodeId, setNodeParts, nodeType }: NodeTypeSelectorProps) => {
  const nodeTypeOptions = ["Concept", "Relation", "Question", "Reference", "Code", "Idea", "News"];
  const currentId = useId();

  return (
    <FormControl sx={{ width: 48 }}>
      <Select
        sx={{
          m: 0,
          ".MuiSelect-select": {
            display: "flex",
            alignItems: "center",
          },
          "& > div": {
            padding: "5px",
            // paddingTop: "8px",
            paddingRight: "5px !important",
          },
          "> svg": {
            width: "0.7em",
            height: "0.7em",
            position: "relative",
          },
        }}
        MenuProps={{
          sx: {
            transform: "translateX(8px)",
          },
        }}
        inputProps={{
          hidden: true,
        }}
        labelId={currentId + "-label"}
        id={currentId}
        value={nodeType}
        autoWidth
        onChange={e => {
          setNodeParts(nodeId, node => {
            const selectedNodeType: string = e.target.value;
            const nodeTypes = new Set([...(node.nodeTypes || []), selectedNodeType]);
            return { ...node, nodeType: selectedNodeType, nodeTypes: Array.from(nodeTypes) } as any;
          });
        }}
      >
        {nodeTypeOptions.map(nodeType => {
          return (
            <MenuItem key={nodeType} value={nodeType}>
              <NodeTypeIcon nodeType={nodeType as any} tooltipPlacement={"top"} fontSize={"inherit"} />
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export const MemoizedNodeTypeSelector = React.memo(NodeTypeSelector);
