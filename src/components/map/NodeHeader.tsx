import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import RemoveIcon from "@mui/icons-material/Remove";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { IconButton, Tooltip } from "@mui/material";
import { Box, SxProps, Theme } from "@mui/system";
import React from "react";

type NodeHeaderProps = {
  id: string;
  setFocusView: () => void;
  open: boolean;
  onToggleNode: any;
  onHideOffsprings: any;
  onHideNodeHandler: any;
  sx?: SxProps<Theme>;
  disabled?: boolean;
  enableChildElements?: string[];
};

const NodeHeader = ({
  id,
  open,
  onToggleNode,
  onHideOffsprings,
  onHideNodeHandler,
  sx,
  setFocusView,
  disabled,
  enableChildElements = [],
}: NodeHeaderProps) => {
  const closeButtonId = `${id}-close-button`;
  const openButtonId = `${id}-open-button`;
  const hideOffspringsButtonId = `${id}-hide-offsprings-button`;
  const hideButtonId = `${id}-hide-button`;

  // this will execute the includes operation only when disable is TRUE (in tutorial)
  const disableCloseButton = disabled && !enableChildElements.includes(closeButtonId);
  const disableOpenButton = disabled && !enableChildElements.includes(openButtonId);
  const disableHideOffspringsButton = disabled && !enableChildElements.includes(hideOffspringsButtonId);
  const disableHideButton = disabled && !enableChildElements.includes(hideButtonId);

  return (
    <Box
      id={`${id}-node-header`}
      sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mt: "-14px", mb: "-10px", ...sx }}
    >
      <Tooltip title="Focused mode">
        <IconButton color="inherit" onClick={() => setFocusView()} aria-label="focus-mode" size="small">
          <UnfoldMoreIcon fontSize="inherit" sx={{ transform: "rotate(45deg)" }} />
        </IconButton>
      </Tooltip>

      <Tooltip title={`${open ? "Close" : "Open"} the node.`}>
        {open ? (
          <IconButton
            disabled={disableCloseButton}
            id={closeButtonId}
            color="inherit"
            onClick={onToggleNode}
            aria-label="Close the node"
            size="small"
          >
            <RemoveIcon fontSize="inherit" />
          </IconButton>
        ) : (
          <IconButton
            disabled={disableOpenButton}
            id={openButtonId}
            color="inherit"
            onClick={onToggleNode}
            aria-label="open the node"
            size="small"
          >
            <FullscreenIcon fontSize="inherit" />
          </IconButton>
        )}
      </Tooltip>

      <Tooltip title="Hide all the descendants of this node.">
        <IconButton
          disabled={disableHideOffspringsButton}
          id={`${id}-hide-offsprings-button`}
          color="inherit"
          onClick={onHideOffsprings}
          aria-label="delete"
          size="small"
        >
          <KeyboardTabIcon fontSize="inherit" sx={{ transform: "scaleX(-1)" }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Hide the node from your map.">
        <IconButton
          disabled={disableHideButton}
          id={`${id}-hiden-button`}
          color="inherit"
          onClick={e => onHideNodeHandler(e)}
          aria-label="delete"
          size="small"
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export const MemoizedNodeHeader = React.memo(NodeHeader);

// TEST: validate if is showing correct button depending by props and if is called the function if are clicked
