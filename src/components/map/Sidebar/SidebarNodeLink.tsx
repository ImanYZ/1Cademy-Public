import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Button, Stack, SxProps, Theme, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useState } from "react";
import { SimpleNode2 } from "src/types";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import NodeTypeIcon from "@/components/NodeTypeIcon2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { getVideoDataByUrl } from "@/lib/utils/utils";

import { MemoizedNodeVideo } from "../Node/NodeVideo";
dayjs.extend(relativeTime);

type SidebarNodeLinkProps = SimpleNode2 & {
  linkMessage: string;
  onClick: () => void;
  sx?: SxProps<Theme>;
};
export const SidebarNodeLink = ({
  id,
  title,
  content,
  changedAt,
  nodeType,
  nodeImage,
  nodeVideo,
  linkMessage,
  onClick,
  sx,
}: SidebarNodeLinkProps) => {
  const [expandItem, setExpandItem] = useState(false);

  return (
    <Stack
      key={id}
      spacing={"10px"}
      sx={{
        borderRadius: "8px",
        p: "12px 16px 10px 16px",
        backgroundColor: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
        ...sx,
      }}
    >
      <Box>
        <MarkdownRender
          text={title}
          customClass={"custom-react-markdown"}
          sx={{ fontSize: "16px", fontWeight: 500, letterSpacing: "inherit" }}
        />
        {/* <Typography sx={{ fontSize: "16px", fontWeight: 500, mb: "8px" }}>{title}</Typography> */}
        <Box sx={{ maxHeight: expandItem ? undefined : "59px", mt: "8px", overflowY: "hidden" }}>
          {/* height in Box enable multiline ellipsis */}
          <MarkdownRender
            text={content}
            customClass={"custom-react-markdown"}
            sx={{ fontSize: "14px", fontWeight: 400, letterSpacing: "inherit" }}
          />
          {nodeImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={nodeImage} alt="Node image" className="responsive-img NodeImage" />
          )}
          {nodeVideo && <MemoizedNodeVideo addVideo={true} videoData={getVideoDataByUrl(nodeVideo)} />}
        </Box>

        {!expandItem && (
          <Button onClick={() => setExpandItem(true)}>
            Show More
            <KeyboardArrowDownIcon sx={{ ml: "8px" }} />
          </Button>
        )}
      </Box>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} spacing={"6px"}>
          <NodeTypeIcon nodeType={nodeType} fontSize="inherit" />
          <Typography
            sx={{
              fontSize: "12px",
              color: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray500,
            }}
          >
            {dayjs(changedAt).fromNow()}
          </Typography>
        </Stack>
        {!linkMessage ||
          (linkMessage !== "" && (
            <Button
              onClick={onClick}
              variant="contained"
              sx={{
                minWidth: "30px",
                height: "30px",
                borderRadius: "16px",
                backgroundColor: DESIGN_SYSTEM_COLORS.primary800,
              }}
            >
              {linkMessage}
            </Button>
          ))}
      </Stack>
    </Stack>
  );
};
