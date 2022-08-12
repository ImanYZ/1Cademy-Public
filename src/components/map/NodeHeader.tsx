import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
import RemoveIcon from '@mui/icons-material/Remove';
import { IconButton, Tooltip } from '@mui/material';
import { Box, SxProps, Theme } from '@mui/system';
import React from 'react'

type NodeHeaderProps = {
  open: boolean,
  onToggleNode:any,
  onHideOffsprings: any,
  onHideNodeHandler: any,
  sx?: SxProps<Theme>
}

const NodeHeader = ({ open, onToggleNode, onHideOffsprings, onHideNodeHandler, sx }: NodeHeaderProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
      <Tooltip title={`${open ? "Close" : "Open"} the node.`}>
        {
          open
            ? <IconButton onClick={onToggleNode} aria-label="delete" size="small">
              <RemoveIcon fontSize="inherit" />
            </IconButton>
            : <IconButton onClick={onToggleNode} aria-label="delete" size="small">
              <FullscreenIcon fontSize="inherit" />
            </IconButton>
        }
      </Tooltip>

      <Tooltip title='Hide all the descendants of this node.'>
        <IconButton onClick={onHideOffsprings} aria-label="delete" size="small">
          <KeyboardTabIcon fontSize="inherit" sx={{ transform: 'scaleX(-1)' }} />
        </IconButton>
      </Tooltip>
      <Tooltip title='Hide the node from your map.'>
        <IconButton onClick={onHideNodeHandler} aria-label="delete" size="small">
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export const MemoizedNodeHeader = React.memo(NodeHeader);


// TEST: validate if is showing correct button depending by props and if is called the function if are clicked