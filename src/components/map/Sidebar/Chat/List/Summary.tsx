import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
// import SearchIcon from "@mui/icons-material/Search";
import { Tab, Tabs, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getFirestore } from "firebase/firestore";
import NextImage from "next/image";
import React, { useState } from "react";

import useConfirmDialog from "@/hooks/useConfirmDialog";
import { Post } from "@/lib/mapApi";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import TagIcon from "../../../../../../public/tag.svg";
import { Media } from "./Media";
import { Members } from "./Members";
import { Nodes } from "./Nodes";

dayjs.extend(relativeTime);
type SummaryProps = {
  selectedChannel: any;
  roomType: string;
  openLinkedNode: any;
  leading: boolean;
  openUserInfoSidebar: any;
  setOpenChatRoom: any;
  moveBack: any;
  onlineUsers: any;
  user: any;
};
export const Summary = ({
  selectedChannel,
  roomType,
  openLinkedNode,
  leading,
  openUserInfoSidebar,
  moveBack,
  setOpenChatRoom,
  onlineUsers,
  user,
}: SummaryProps) => {
  const db = getFirestore();
  const [value, setValue] = React.useState(0);
  const { confirmIt, ConfirmDialog } = useConfirmDialog();
  const [leavingChannel, setLeavingChannel] = useState(false);
  const [mutingChannel, setMutingChannel] = useState(false);
  const muted = !selectedChannel?.membersInfo[user.uname].muteChannel;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const a11yProps = (index: number) => {
    return {
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };
  const leaveChannel = async () => {
    try {
      if (
        await confirmIt(
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: "10px",
            }}
          >
            <LogoutIcon />
            <Typography sx={{ fontWeight: "bold" }}>Do you want to leave this Channel?</Typography>
            <Typography>This action will permanently remove you from this Channel.</Typography>
          </Box>,
          "Leave Channel",
          "Stay in Channel"
        )
      ) {
        setLeavingChannel(true);
        await Post("/chat/leaveChannel", {
          channelId: selectedChannel.id,
        });
        setLeavingChannel(false);
        moveBack();
        setOpenChatRoom(false);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const muteChannel = async () => {
    try {
      if (
        await confirmIt(
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: "10px",
            }}
          >
            {muted ? <NotificationsIcon /> : <NotificationsOffIcon />}
            <Typography sx={{ fontWeight: "bold" }}>
              Are you sure you want to {muted ? "unmute" : "mute"} this Channel?
            </Typography>
          </Box>,
          `${muted ? "Unmute" : "Mute"} Channel`,
          "Cancel"
        )
      ) {
        setMutingChannel(true);
        await Post("/chat/muteChannel", {
          channelId: selectedChannel.id,
        });
        setMutingChannel(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "9px", alignItems: "center" }}>
      <Box
        sx={{
          width: "70px",
          height: "70px",
          borderRadius: "200px",

          background: "linear-gradient(to right, #FDC830, #F37335)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selectedChannel.title
          .split(" ")
          .slice(0, 2)
          .map((word: string) => word[0])
          .join(" ")}
      </Box>
      <Typography sx={{ fontWeight: "500", fontSize: "17px" }}>{selectedChannel.title}</Typography>
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
                theme.palette.mode === "dark" ? theme.palette.common.notebookG200 : theme.palette.common.gray500,
            }}
          >
            {selectedChannel.tagLabel}
          </Box>
        </Box>
      </Box>
      <Typography
        sx={{
          color: theme =>
            theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray500,
        }}
      >
        {selectedChannel.members.length} members
      </Typography>
      <Box sx={{ display: "flex", gap: "10px" }}>
        {/* <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100px",
            height: "100px",
            borderRadius: "8px",
            cursor: "pointer",
            background: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray200,
            ":hover": {
              background: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray250,
            },
          }}
        >
          <Box>
            <SearchIcon />
          </Box>
          <Typography>Search</Typography>
        </Box> */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100px",
            height: "100px",
            borderRadius: "8px",
            cursor: "pointer",
            background: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray200,
            ":hover": {
              background: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray250,
            },
          }}
          onClick={muteChannel}
        >
          {" "}
          {mutingChannel ? (
            <CircularProgress />
          ) : (
            <>
              <Box>{muted ? <NotificationsOffIcon /> : <NotificationsIcon />}</Box>
              <Typography>{muted ? "Unmute" : "Mute"}</Typography>
            </>
          )}
        </Box>
        {!leading && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100px",
              height: "100px",
              borderRadius: "8px",
              cursor: "pointer",
              color: "red",
              background: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray200,
              ":hover": {
                background: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray250,
              },
            }}
            onClick={leaveChannel}
          >
            {leavingChannel ? (
              <CircularProgress />
            ) : (
              <>
                <Box>
                  <LogoutIcon sx={{ color: "red" }} />
                </Box>
                <Typography sx={{ color: "red" }}>Leave</Typography>
              </>
            )}
          </Box>
        )}
      </Box>
      <Box
        sx={{
          marginTop: "20px",
          borderBottom: 1,
          borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
          width: "100%",
        }}
      >
        <Tabs value={value} onChange={handleChange} aria-label={"Bookmarks Tabs"} variant="fullWidth">
          {[{ title: "Members" }, { title: "Nodes" }, { title: "Media" }].map((tabItem: any, idx: number) => (
            <Tab
              key={tabItem.title}
              id={`chat-tab-${tabItem.title.toLowerCase()}`}
              label={tabItem.title}
              {...a11yProps(idx)}
            />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ width: "100%", px: "10px" }}>
        {value === 0 && (
          <Members
            selectedChannel={selectedChannel}
            openUserInfoSidebar={openUserInfoSidebar}
            onlineUsers={onlineUsers}
            leading={leading}
          />
        )}
        {value === 1 && (
          <Nodes db={db} roomType={roomType} selectedChannel={selectedChannel} openLinkedNode={openLinkedNode} />
        )}
        {value === 2 && <Media db={db} roomType={roomType} selectedChannel={selectedChannel} />}
      </Box>
      {ConfirmDialog}
    </Box>
  );
};
