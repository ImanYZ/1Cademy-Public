import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
import MinimizeIcon from '@mui/icons-material/Minimize';
import { IconButton, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react'
import { BooleanSchema } from 'yup';

type NodeHeaderProps = {
  open: BooleanSchema,
  onToggleNode: any,
  onHideOffsprings: any,
  onHideNodeHandler: any,
}

const NodeHeader = ({ open, onToggleNode, onHideOffsprings, onHideNodeHandler }: NodeHeaderProps) => {
  return (
    <Box>
      {
        open
          ? <Tooltip title=''>
            <IconButton onClick={onToggleNode} aria-label="delete" size="small">
              <MinimizeIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          : <Tooltip title=''>
            <IconButton aria-label="delete" size="small">
              <FullscreenIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
      }
      <Tooltip title=''>
        <IconButton aria-label="delete" size="small">
          <KeyboardTabIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Tooltip title=''>
        <IconButton aria-label="delete" size="small">
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export const MemoizedNodeHeader = React.memo(NodeHeader);

// import React from "react";

// import MetaButton from "../../MetaButton/MetaButton";

// import "./NodeHeader.css";

// const NodeHeader = (props) => {
//   return (
//     <div className="header right">
//       <MetaButton onClick={props.toggleNode} tooltip={`${props.open ? "Close" : "Open"} the node.`}>
//         <i className="MinimizeButton material-icons">
//           {props.open ? "horizontal_rule" : "fullscreen"}
//         </i>
//       </MetaButton>
//       {/* {props.parentsNum > 0 && ( */}
//       <MetaButton onClick={props.hideOffsprings} tooltip="Hide all the descendents of this node.">
//         <div className="CloseButton">
//           <i className="material-icons icon-flipped">keyboard_tab</i>
//         </div>
//       </MetaButton>
//       <MetaButton onClick={props.hideNodeHandler} tooltip="Hide the node from your map.">
//         <div className="CloseButton">
//           <i className="material-icons">close</i>
//         </div>
//       </MetaButton>
//       {/* )} */}
//     </div>
//   );
// };

// export default React.memo(NodeHeader);
