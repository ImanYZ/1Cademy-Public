import { Box, Typography } from "@mui/material";
import Chip from "@mui/material/Chip";
import React, { FC } from "react";

import HtmlTooltip from "./HtmlTooltip";
import MarkdownRender from "./Markdown/MarkdownRender";

type Props = {
  title: string;
  linkSrc: string;
  nodeImageUrl?: string;
  nodeContent?: string;
};

export const LinkedTag: FC<Props> = ({ nodeImageUrl, nodeContent, title, linkSrc }) => {
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
      <Chip
        label={<MarkdownRender text={title || ""} />}
        component="a"
        href={linkSrc}
        clickable
        sx={{ p: "20px", color: "black", fontSize: "14px", borderRadius: "20px" }}
      />
    </HtmlTooltip>
  );
};
