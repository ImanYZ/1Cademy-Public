import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
// import SearchIcon from "@mui/icons-material/Search";
import { Avatar, AvatarGroup, Tab, Tabs, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getFirestore } from "firebase/firestore";
import NextImage from "next/image";
import React, { useCallback, useState } from "react";

import useConfirmDialog from "@/hooks/useConfirmDialog";
import { Post } from "@/lib/mapApi";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import TagIcon from "../../../../../../public/tag.svg";
import { Media } from "./Media";
import { Members } from "./Members";
import { Nodes } from "./Nodes";

dayjs.extend(relativeTime);
type SummaryProps = {
  theme: any;
  selectedChannel: any;
  roomType: string;
  openLinkedNode: any;
  leading: boolean;
  openUserInfoSidebar: any;
  setOpenChatRoom: any;
  moveBack: any;
  onlineUsers: any;
  user: any;
  sidebarWidth: number;
  getChannelRef: any;
};
export const Summary = ({
  theme,
  selectedChannel,
  roomType,
  openLinkedNode,
  leading,
  openUserInfoSidebar,
  moveBack,
  setOpenChatRoom,
  onlineUsers,
  user,
  sidebarWidth,
  getChannelRef,
}: SummaryProps) => {
  const db = getFirestore();
  const [value, setValue] = React.useState(0);
  const { confirmIt, ConfirmDialog } = useConfirmDialog();
  const [leavingChannel, setLeavingChannel] = useState(false);
  const [mutingChannel, setMutingChannel] = useState(false);
  const muted = !selectedChannel?.membersInfo[user.uname].muteChannel;

  const handleChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    },
    [value]
  );
  const a11yProps = (index: number) => {
    return {
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };
  const leaveChannel = useCallback(async () => {
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
  }, [selectedChannel, roomType]);
  const muteChannel = useCallback(async () => {
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
  }, [selectedChannel, roomType]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "9px", alignItems: "center" }}>
      <AvatarGroup total={Object.keys(selectedChannel.membersInfo)?.length}>
        {Object.keys(selectedChannel.membersInfo)
          .splice(0, 5)
          .map((member: any, index: number) => {
            return (
              <Avatar
                key={index}
                alt={selectedChannel.membersInfo[member]?.fullname}
                src={selectedChannel.membersInfo[member]?.imageUrl}
              />
            );
          })}

        <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
        <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
        <Avatar alt="Trevor Henderson" src="/static/images/avatar/5.jpg" />
      </AvatarGroup>
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
            db={db}
            user={user}
            selectedChannel={selectedChannel}
            openUserInfoSidebar={openUserInfoSidebar}
            onlineUsers={onlineUsers}
            leading={leading}
            sidebarWidth={sidebarWidth}
            getChannelRef={getChannelRef}
          />
        )}
        {value === 1 && (
          <Nodes
            db={db}
            theme={theme}
            roomType={roomType}
            selectedChannel={selectedChannel}
            openLinkedNode={openLinkedNode}
          />
        )}
        {value === 2 && <Media db={db} theme={theme} roomType={roomType} selectedChannel={selectedChannel} />}
      </Box>
      {ConfirmDialog}
    </Box>
  );
};
