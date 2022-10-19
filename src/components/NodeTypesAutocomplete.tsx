import CloseIcon from "@mui/icons-material/Close";
import { Tooltip } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { NodeType } from "src/types";

import { NODE_TYPE_OPTIONS } from "@/lib/utils/constants";
import { getQueryParameter } from "@/lib/utils/utils";

// import { NodeType } from "../knowledgeTypes";
import NodeTypeIcon from "./NodeTypeIcon";

type Props = {
  onNodesTypeChange: (newValues: string[]) => void;
};

const NodeTypesAutocomplete: FC<Props> = ({ onNodesTypeChange }) => {
  const router = useRouter();
  const [value, setValue] = useState<NodeType[]>([]);
  const [hasBeenCleared, setHasBeenCleared] = useState(false);

  const handleChange = (_: React.SyntheticEvent, newValue: NodeType[]) => {
    if (newValue.length === 0) {
      setHasBeenCleared(true);
    }
    setValue(newValue);
    onNodesTypeChange(newValue);
  };

  useEffect(() => {
    const nodeTypes = (getQueryParameter(router.query.nodeTypes) || "")
      .split(",")
      .filter(el => el !== "") as NodeType[];

    if (value.length === 0 && nodeTypes.length > 0 && !hasBeenCleared) {
      setValue(nodeTypes);
    }
  }, [hasBeenCleared, router.query.nodeTypes, value.length]);

  return (
    <Tooltip title="There are six different types of nodes on 1Cademy: concept, relation, question, code, reference, and idea. You can tell the type of node by looking at the icon at the bottom-right corner of each node.">
      <Autocomplete
        multiple
        options={NODE_TYPE_OPTIONS}
        value={value}
        renderOption={(props, option) => (
          <li {...props}>
            {<NodeTypeIcon sx={{ mr: 1 }} nodeType={option as NodeType} />}
            {option}
          </li>
        )}
        getOptionLabel={option => option}
        onChange={handleChange}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option, index: number) => (
            <Chip
              icon={<NodeTypeIcon color="primary" nodeType={option as NodeType} />}
              variant="outlined"
              label={option}
              deleteIcon={<CloseIcon />}
              {...getTagProps({ index })}
              key={index}
            />
          ))
        }
        renderInput={params => <TextField {...params} variant="outlined" label="Node types" />}
      />
    </Tooltip>
  );
};
export default NodeTypesAutocomplete;
