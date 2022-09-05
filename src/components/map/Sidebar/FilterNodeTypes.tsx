// import "./FilterNodeTypes.css";

import { Checkbox, ListItemIcon, ListItemText, MenuItem } from "@mui/material";
// import { Checkbox, ListItemIcon, ListItemText, MenuItem } from "@material-ui/core";
import React from "react";

import NodeTypeIcon from "../../NodeTypeIcon2";

// import NodeTypeIcon from "../../../Node/NodeTypeIcon/NodeTypeIcon";

// type FilterNodeTypesProps = {};

const FilterNodeTypes = (props: any) => {
  return (
    // <div className="input-field col s2 Tooltip NodeTypeSelector">
    //   <label>
    //     <input
    //       name={"Only" + props.nodeType + "NodeTypes"}
    //       type="checkbox"
    //       checked={props.nodeTypes.includes(props.nodeType)}
    //       onChange={props.setNodeTypesClick(props.nodeType)}
    //     />
    //     <span>
    //       <NodeTypeIcon nodeType={props.nodeType} /> {props.nodeType}
    //     </span>
    //   </label>
    // </div>
    <MenuItem onClick={props.setNodeTypesClick(props.nodeType)} className={props.className}>
      <Checkbox
        className={"searchCheckbox " + (props.nodeTypes.includes(props.nodeType) ? "selected" : "")}
        checked={props.nodeTypes.includes(props.nodeType)}
      />
      <ListItemIcon>
        <NodeTypeIcon
          className={"searchIcon " + (props.nodeTypes.includes(props.nodeType) ? "selected" : "")}
          nodeType={props.nodeType}
        />
      </ListItemIcon>
      <ListItemText className={props.nodeTypes.includes(props.nodeType) ? "selected" : ""} primary={props.nodeType} />
    </MenuItem>
  );
};

export default React.memo(FilterNodeTypes);
