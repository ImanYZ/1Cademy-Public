import LinkIcon from "@mui/icons-material/Link";
import { IconButton, Link, ListItem, ListItemButton, ListItemText, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/system";
import LinkNext from "next/link";
import { FC } from "react";
import { ReactNode } from "react-markdown/lib/react-markdown";

// import { NodeType } from "src/types";
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
  readonly?: boolean;
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
  openInNewTab = false,
  readonly = false,
}) => {
  return (
    <HtmlTooltip
      sx={{ zIndex: 9999 }}
      title={
        <Box>
          <Typography variant="body2" component="div">
            <MarkdownRender text={nodeContent || ""} />
          </Typography>
          {nodeImageUrl && (
            <Box>
              {/* TODO: change to next Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={nodeImageUrl} alt={title} width="100%" height="100%" />
            </Box>
          )}
        </Box>
      }
      placement="left"
    >
      <ListItem
        disablePadding
        sx={{
          display: "flex",
          "& .MuiListItemIcon-root": {
            minWidth: "100%",
          },
        }}
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
                    color: theme => theme.palette.common.darkGrayBackground,
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
          <>
            {readonly ? (
              <ListItemText
                sx={{
                  ...sx,
                  p: "16px",
                  ":hover": {
                    background: theme =>
                      theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
                  },
                }}
                primary={<MarkdownRender text={title || ""} />}
                disableTypography={true}
              />
            ) : (
              <LinkNext passHref href={linkSrc}>
                <ListItemButton component="a" sx={{ ...sx, p: "16px" }}>
                  <ListItemText primary={<MarkdownRender text={title || ""} />} disableTypography={true} />
                </ListItemButton>
              </LinkNext>
            )}
          </>
        )}
        {openInNewTab && (
          <ListItemButton component="a" href={linkSrc} rel="noreferrer" target="_blank" sx={{ ...sx, p: "16px" }}>
            <ListItemText primary={<MarkdownRender text={title} />} disableTypography={true} />
          </ListItemButton>
        )}
      </ListItem>
    </HtmlTooltip>
  );
};

export default LinkedNodeItem;
