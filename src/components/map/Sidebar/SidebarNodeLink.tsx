import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Button, Divider, Stack, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useState } from "react";
import { NodeType } from "src/types";

import NodeTypeIcon from "@/components/NodeTypeIcon2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import shortenNumber from "@/lib/utils/shortenNumber";

import { CustomWrapperButton } from "../Buttons/Buttons";
dayjs.extend(relativeTime);

type SidebarNodeLinkProps = {
  id: string;
  title: string;
  content: string;
  changedAt: string;
  correct: boolean;
  corrects: number;
  wrong: boolean;
  wrongs: number;
  nodeType: NodeType;
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
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray300,
        cursor: "pointer",
        ":hover": {
          background: theme => (theme.palette.mode === "dark" ? "#2F2F2F" : "#EAECF0"),
        },
      }}
    >
      <Box>
        <Typography sx={{ fontSize: "16px", fontWeight: 500, mb: "8px" }}>{title}</Typography>
        <Box sx={{ height: expandItem ? undefined : "59px" }}>
          {/* height in Box enable multiline ellipsis */}
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 400,
              ...(!expandItem && {
                display: "-webkit-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3 /* start showing ellipsis when 3rd line is reached */,
                whiteSpace: "pre-wrap" /* let the text wrap preserving spaces */,
              }),
            }}
          >
            {content}
          </Typography>
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
        <CustomWrapperButton id={`${id}-node-footer-votes`}>
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
