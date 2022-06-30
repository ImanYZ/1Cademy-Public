import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Typography } from "@mui/material";
import Chip from "@mui/material/Chip";
import { useRouter } from 'next/router';
import React, { FC } from "react";

import HtmlTooltip from "./HtmlTooltip";
import MarkdownRender from "./Markdown/MarkdownRender";

type Props = {
  node: string;
  title: string;
  linkSrc: string;
  nodeImageUrl?: string;
  nodeContent?: string;
  openInNewTab?: Boolean;
  onDelete?: (node: string) => void | undefined
};

export const LinkedTag: FC<Props> = ({ node, nodeImageUrl, nodeContent, title, linkSrc, openInNewTab = false, onDelete = undefined }) => {

  const router = useRouter();

  const onOpenTag = () => {
    return openInNewTab
      ? window.open(linkSrc, '_blank')
      : router.push({ pathname: linkSrc })
  }

  return (
    <HtmlTooltip
      title={
        <Box>
          <Typography variant="body2" component="div">
            <MarkdownRender text={nodeContent || ""} />
          </Typography>
          {nodeImageUrl && (
            <Box>
              <img src={nodeImageUrl} width="100%" height="100%" />
            </Box>
          )}
        </Box>
      }
      placement="left"
    >
      {
        <Chip
          label={<MarkdownRender text={title || ""} />}
          clickable
          deleteIcon={<CloseIcon />}
          sx={{ p: "20px", color: "black", fontSize: "14px", borderRadius: "20px" }}
          onDelete={onDelete ? () => onDelete(node) : undefined}
          onClick={onOpenTag}
        />
      }
    </HtmlTooltip>
  );
};
