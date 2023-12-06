import { Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import NextImage from "next/image";
import React from "react";

import TagIcon from "../../../../../../public/tag.svg";
import { CustomBadge } from "../../../CustomBudge";

dayjs.extend(relativeTime);
type NewsListProps = {
  openRoom: any;
  newsChannels: any;
};
export const NewsList = ({ openRoom, newsChannels }: NewsListProps) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "9px" }}>
      {newsChannels.map((news: any, idx: number) => (
        <Paper
          onClick={() => openRoom("news")}
          key={idx}
          elevation={3}
          className="CollapsedProposal collection-item"
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: "12px 16px 10px 16px",
            borderRadius: "8px",
            boxShadow: theme =>
              theme.palette.mode === "light"
                ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)"
                : "none",
            background: theme =>
              theme.palette.mode === "dark" ? theme.palette.common.notebookG700 : theme.palette.common.gray100,
            marginBottom: "5px",
            cursor: "pointer",
            ":hover": {
              background: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
            },
          }}
        >
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{
                  width: "50%",
                  fontSize: "16px",
                  fontWeight: "500",
                  lineHeight: "24px",
                }}
              >
                {news.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.notebookG200 : theme.palette.common.gray500,
                }}
              >
                {/* {dayjs(new Date()).format("h:mm A")} */}
                {news.createdAt}
              </Typography>
            </Box>
            <Box
              sx={{
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <NextImage width={"20px"} src={TagIcon} alt="tag icon" />
                <Box
                  sx={{
                    fontSize: "12px",
                    marginLeft: "5px",
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.notebookG200 : theme.palette.common.gray500,
                  }}
                >
                  {news.tag}
                </Box>
              </Box>
              <CustomBadge
                value={news.totalMessages}
                sx={{
                  height: "20px",
                  p: "6px",
                  fontSize: "13px",
                }}
              />
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};
