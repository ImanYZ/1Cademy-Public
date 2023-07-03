import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Button, Divider, Stack, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useState } from "react";
import { SimpleNode2 } from "src/types";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import NodeTypeIcon from "@/components/NodeTypeIcon2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import shortenNumber from "@/lib/utils/shortenNumber";
import { getVideoDataByUrl } from "@/lib/utils/utils";

import { CustomWrapperButton } from "../Buttons/Buttons";
import { MemoizedNodeVideo } from "../Node/NodeVideo";
dayjs.extend(relativeTime);

type SidebarNodeLinkProps = SimpleNode2 & {
  correct: boolean;
  wrong: boolean;
  onClick: () => void;
};
export const SidebarNodeLink = ({
  id,
  title,
  content,
  changedAt,
  correct,
  corrects,
  wrong,
  wrongs,
  nodeType,
  nodeImage,
  nodeVideo,
  onClick,
}: SidebarNodeLinkProps) => {
  const [expandItem, setExpandItem] = useState(false);

  return (
    <Stack
      key={id}
      spacing={"10px"}
      onClick={onClick}
      sx={{
        borderRadius: "8px",
        p: "12px 16px 10px 16px",
        backgroundColor: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
        cursor: "pointer",
      }}
    >
      <Box>
        <MarkdownRender
          text={title}
          customClass={"custom-react-markdown"}
          sx={{ fontSize: "16px", fontWeight: 500, letterSpacing: "inherit" }}
        />
        {/* <Typography sx={{ fontSize: "16px", fontWeight: 500, mb: "8px" }}>{title}</Typography> */}
        <Box sx={{ height: expandItem ? undefined : "59px", mt: "8px", overflowY: "hidden" }}>
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
        <CustomWrapperButton
          id={`${id}-node-footer-votes`}
          sx={{
            background: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray250,
          }}
        >
          <Stack direction={"row"} alignItems={"center"}>
            <Tooltip title={"Vote to prevent further changes."} placement={"top"}>
              <Button
                // onClick={() => console.log("correct")}
                // disabled={nodeCopy?.disableVotes}
                sx={{
                  p: "0px 8px 0px 5px",
                  color: "inherit",
                  minWidth: "0px",
                  borderRadius: "16px 0px 0px 16px",
                  // ":hover": {
                  //   backgroundColor: ({ palette }) =>
                  //     palette.mode === "dark" ? palette.common.notebookG400 : palette.common.lightBackground2,
                  // },
                }}
              >
                <Box sx={{ display: "flex", fontSize: "14px", alignItems: "center" }}>
                  <DoneIcon sx={{ fontSize: "14px", color: correct ? "#00E676" : undefined }} />
                  <span style={{ fontSize: "12px", marginLeft: "2px" }}>{shortenNumber(corrects, 2, false)}</span>
                </Box>
              </Button>
            </Tooltip>
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{
                my: "4px",
                borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : DESIGN_SYSTEM_COLORS.gray300),
              }}
            />
            <Tooltip title={"Vote to delete node."} placement={"top"}>
              <Button
                // onClick={() => console.log("wrong")}
                // disabled={nodeCopy?.disableVotes}
                sx={{
                  p: "0px 5px 0px 8px",
                  color: "inherit",
                  minWidth: "0px",
                  borderRadius: "0px 16px 16px 0px",
                  // ":hover": {
                  //   backgroundColor: ({ palette }) =>
                  //     palette.mode === "dark" ? palette.common.notebookG400 : palette.common.lightBackground2,
                  // },
                }}
              >
                <Box sx={{ display: "flex", fontSize: "14px", alignItems: "center" }}>
                  <CloseIcon sx={{ fontSize: "14px", color: wrong ? "red" : undefined }} />
                  <span style={{ fontSize: "12px", marginLeft: "2px" }}>{shortenNumber(wrongs, 2, false)}</span>
                </Box>
              </Button>
            </Tooltip>
          </Stack>
        </CustomWrapperButton>
      </Stack>
    </Stack>
  );
};
