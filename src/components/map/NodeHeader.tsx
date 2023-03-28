import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import RemoveIcon from "@mui/icons-material/Remove";
import { IconButton, Tooltip } from "@mui/material";
import { Box, SxProps, Theme } from "@mui/system";
import React from "react";

type NodeHeaderProps = {
  id: string;
  open: boolean;
  onToggleNode: any;
  onHideDescendants: any;
  onHideNodeHandler: any;
  sx?: SxProps<Theme>;
  disabled?: boolean;
  enableChildElements?: string[];
};

const NodeHeader = ({
  id,
  open,
  onToggleNode,
  onHideDescendants,
  onHideNodeHandler,
  sx,
  // setFocusView,
  disabled,
  enableChildElements = [],
}: NodeHeaderProps) => {
  const closeButtonId = `${id}-close-button`;
  const openButtonId = `${id}-open-button`;
  const hideDescendantsButtonId = `${id}-hide-descendants-button`;
  const hideButtonId = `${id}-hidden-button`;

  // this will execute the includes operation only when disable is TRUE (in tutorial)
  const disableCloseButton = disabled && !enableChildElements.includes(closeButtonId);
  const disableOpenButton = disabled && !enableChildElements.includes(openButtonId);
  const disableHideDescendantsButton = disabled && !enableChildElements.includes(hideDescendantsButtonId);
  const disableHideButton = disabled && !enableChildElements.includes(hideButtonId);

  return (
    <Box
      id={`${id}-node-header`}
      sx={{
        display: "flex",
        alignItems: "center",
        borderRadius: "4px",
        justifyContent: "flex-end",
        mt: "-14px",
        mb: "-10px",
        ...sx,
      }}
    >
      <Tooltip title={`${open ? "Close" : "Open"} the node.`}>
        <span>
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
        </span>
      </Tooltip>

      <Tooltip title="Hide all the descendants of this node.">
        <span>
          <IconButton
            disabled={disableHideDescendantsButton}
            id={hideDescendantsButtonId}
            color="inherit"
            onClick={onHideDescendants}
            aria-label="delete"
            size="small"
          >
            <KeyboardTabIcon fontSize="inherit" sx={{ transform: "scaleX(-1)" }} />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Hide the node from your map.">
        <span>
          <IconButton
            disabled={disableHideButton}
            id={hideButtonId}
            color="inherit"
            onClick={e => onHideNodeHandler(e)}
            aria-label="delete"
            size="small"
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export const MemoizedNodeHeader = React.memo(NodeHeader);

// TEST: validate if is showing correct button depending by props and if is called the function if are clicked
