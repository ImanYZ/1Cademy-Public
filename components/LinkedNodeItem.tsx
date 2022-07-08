import LinkIcon from "@mui/icons-material/Link";
import { IconButton, Link, ListItem, ListItemButton, ListItemText, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/system";
import LinkNext from "next/link";
import { FC } from "react";

import { isValidHttpUrl } from "../lib/utils";
import { NodeType } from "../src/knowledgeTypes";
import HtmlTooltip from ".../src/knowledgeTypes.old
import MarkdownRender from "./Markdown/MarkdownRender";
import NodeTypeIcon from "./NodeTypeIcon";

type Props = {
  title: string;
  linkSrc: string;
  nodeType: NodeType;
  nodeImageUrl?: string;
  nodeContent?: string;
  showListItemIcon?: boolean;
  label: string;
  sx?: SxProps<Theme>;
  secondaryActionSx?: SxProps<Theme>;
};
const LinkedNodeItem: FC<Props> = ({
  nodeImageUrl,
  nodeContent,
  title,
  nodeType,
  linkSrc,
  label,
  sx,
  secondaryActionSx
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
            <ListItemIcon>
              <NodeTypeIcon nodeType={nodeType} sx={{ marginLeft: "auto" }} />
            </ListItemIcon>
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
        <LinkNext passHref href={linkSrc}>
          <ListItemButton component="a" href={linkSrc} sx={{ ...sx }}>
            <ListItemText primary={<MarkdownRender text={title || ""} />} disableTypography={true} />
          </ListItemButton>
        </LinkNext>
      </ListItem>
    </HtmlTooltip>
  );
};

export default LinkedNodeItem;
