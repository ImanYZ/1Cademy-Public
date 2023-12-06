import CreateIcon from "@mui/icons-material/Create";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { IChannels } from "src/chatTypes";

import { useAuth } from "@/context/AuthContext";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

dayjs.extend(relativeTime);
type DirectMessageProps = {
  openRoom: any;
  channels: any;
};
export const DirectMessagesList = ({ openRoom, channels }: DirectMessageProps) => {
  const [{ user }] = useAuth();

  const generateChannelName = (members: any) => {
    const name = ["You, "];
    let more = 0;
    for (let mId in members) {
      if (name.length > 3) {
        more++;
      }
      if (mId !== user?.uname) name.push(members[mId].fullname + ", ");
    }
    if (more > 2) {
      name.push(`...`);
    }
    return name.join("");
  };
  const OverlappingAvatars = ({ members }: any) => {
    return (
      <Stack direction="row" spacing={-10} alignItems="center">
        {members.map((member: any, index: number) => (
          <Avatar
            key={index}
            alt={member.fullname}
            src={member.imageUrl}
            sx={{ width: 40, height: 40, border: "2px solid #fff" }}
          />
        ))}
      </Stack>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingY: "10px" }}>
        <TextField
          sx={{
            width: "80%",
          }}
          placeholder="Search"
          id="outlined-basic"
          variant="outlined"
          InputProps={{
            inputProps: {
              style: {
                padding: "9.5px 14px",
              },
            },
            startAdornment: <SearchIcon />,
          }}
        />
        <IconButton
          sx={{
            background: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
            borderRadius: "8px",
            border: theme =>
              `solid 1px ${
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray300
              }`,
          }}
        >
          <CreateIcon color="primary" />
        </IconButton>
      </Box>
      {channels.map((channel: IChannels, idx: number) => (
        <Paper
          onClick={() => openRoom("direct", channel)}
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
              <Box sx={{ mr: "7px" }}>
                <OverlappingAvatars members={Object.values(channel.membersInfo)} />
              </Box>
              <Box>
                <Box sx={{ width: "350px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: "500",
                      lineHeight: "24px",
                    }}
                  >
                    {generateChannelName(channel.membersInfo)}
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
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.notebookG200 : theme.palette.common.gray500,
                  }}
                >
                  {channel?.tag}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};
