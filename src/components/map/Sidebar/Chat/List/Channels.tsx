import { Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import NextImage from "next/image";

import { CustomBadge } from "@/components/map/CustomBudge";

import TagIcon from "../../../../../../public/tag.svg";

dayjs.extend(relativeTime);
type ChannelListProps = {
  openRoom: any;
  channels: any;
};
export const ChannelsList = ({ openRoom, channels }: ChannelListProps) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "9px" }}>
      {channels.map((channel: any, idx: number) => (
        <Paper
          onClick={() => openRoom("channel", channel)}
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
            cursor: "pointer",
            ":hover": {
              background: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Box
                sx={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "200px",
                  background: "linear-gradient(to right, #FDC830, #F37335)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {channel.title
                  .split(" ")
                  .slice(0, 2)
                  .map((word: string) => word[0])
                  .join(" ")}
              </Box>
              <Box>
                <Box sx={{ width: "350px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: "500",
                      lineHeight: "24px",
                    }}
                  >
                    {channel.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: theme =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.notebookG200
                          : theme.palette.common.gray500,
                    }}
                  >
                    {dayjs(channel.updatedAt.toDate().getTime()).fromNow()}
                  </Typography>
                </Box>
                <Box
                  sx={{
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
                          theme.palette.mode === "dark"
                            ? theme.palette.common.notebookG200
                            : theme.palette.common.gray500,
                      }}
                    >
                      {channel.tag}
                    </Box>
                  </Box>
                  {false && (
                    <CustomBadge
                      value={channel.totalMessages}
                      sx={{
                        height: "20px",
                        p: "6px",
                        fontSize: "13px",
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};