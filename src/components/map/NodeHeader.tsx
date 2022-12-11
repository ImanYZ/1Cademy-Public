import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import RemoveIcon from "@mui/icons-material/Remove";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { IconButton, Tooltip } from "@mui/material";
import { Box, SxProps, Theme } from "@mui/system";
import React from "react";

type NodeHeaderProps = {
  setFocusView: () => void;
  open: boolean;
  onToggleNode: any;
  onHideOffsprings: any;
  onHideNodeHandler: any;
  sx?: SxProps<Theme>;
};

const NodeHeader = ({ open, onToggleNode, onHideOffsprings, onHideNodeHandler, sx, setFocusView }: NodeHeaderProps) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", ...sx }}>
      <Tooltip title="Focused mode">
        <IconButton onClick={() => setFocusView()} aria-label="focus-mode" size="small">
          <UnfoldMoreIcon fontSize="inherit" sx={{ color: "#BEBEBE", transform: "rotate(45deg)" }} />
        </IconButton>
      </Tooltip>

      <Tooltip title={`${open ? "Close" : "Open"} the node.`}>
        {open ? (
          <IconButton onClick={onToggleNode} aria-label="Close the node" size="small">
            <RemoveIcon fontSize="inherit" />
          </IconButton>
        ) : (
          <IconButton onClick={onToggleNode} aria-label="open the node" size="small">
            <FullscreenIcon fontSize="inherit" />
          </IconButton>
        )}
      </Tooltip>

      <Tooltip title="Hide all the descendants of this node.">
        <IconButton onClick={onHideOffsprings} aria-label="delete" size="small">
          <KeyboardTabIcon fontSize="inherit" sx={{ transform: "scaleX(-1)" }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Hide the node from your map.">
        <IconButton onClick={e => onHideNodeHandler(e)} aria-label="delete" size="small">
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export const MemoizedNodeHeader = React.memo(NodeHeader);

// TEST: validate if is showing correct button depending by props and if is called the function if are clicked
