import LinkIcon from "@mui/icons-material/Link";
import { IconButton, Link, ListItem, ListItemButton, ListItemText, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/system";
import LinkNext from "next/link";
import { FC } from "react";
import { ReactNode } from "react-markdown/lib/react-markdown";

import { isValidHttpUrl } from "@/lib/utils/utils";

import { NodeType } from "../knowledgeTypes";
import HtmlTooltip from "./HtmlTooltip";
import MarkdownRender from "./Markdown/MarkdownRender";

type Props = {
  title: string;
  linkSrc: string;
  nodeType: NodeType;
  nodeImageUrl?: string;
  nodeContent?: string;
  showListItemIcon?: boolean;
  label: string;
  sx?: SxProps<Theme>;
  secondaryActions?: ReactNode;
  secondaryActionSx?: SxProps<Theme>;
  openInNewTab?: Boolean;
};
const LinkedNodeItem: FC<Props> = ({
  nodeImageUrl,
  nodeContent,
  title,
  linkSrc,
  label,
  sx,
  secondaryActions = null,
  secondaryActionSx,
  openInNewTab = false
}) => {
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
      <ListItem
        disablePadding
        sx={{ display: "flex" }}
        secondaryAction={
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", ...secondaryActionSx }}>
            {secondaryActions}
            {isValidHttpUrl(label) && (
              <Tooltip title="Open the reference specified section in new tab">
                <IconButton
                  target="_blank"
                  LinkComponent={Link}
                  href={label}
                  sx={{
                    ml: 2,
                    display: "flex",
                    direction: "row",
                    justifyContent: "center",
                    color: theme => theme.palette.common.darkGrayBackground
                  }}
                >
                  <LinkIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
      >
        {!openInNewTab && (
          <LinkNext passHref href={linkSrc}>
            <ListItemButton component="a" sx={{ ...sx, p: "16px" }}>
              <ListItemText primary={<MarkdownRender text={title || ""} />} disableTypography={true} />
            </ListItemButton>
          </LinkNext>
        )}
        {openInNewTab && (
          <ListItemButton
            component="a"
            href={`../${linkSrc}`}
            rel="noreferrer"
            target="_blank"
            sx={{ ...sx, p: "16px" }}
          >
            <ListItemText primary={<MarkdownRender text={title} />} disableTypography={true} />
          </ListItemButton>
        )}
      </ListItem>
    </HtmlTooltip>
  );
};

export default LinkedNodeItem;
