import { Box, Tab, Tabs } from "@mui/material";
import React, { useMemo, useState } from "react";
import { UserTheme } from "src/knowledgeTypes";

import { useAuth } from "@/context/AuthContext";

import { ChannelsList } from "../Chat/List/Channels";
import { DirectMessagesList } from "../Chat/List/Direct";
import { NewsList } from "../Chat/List/News";
//import { NodeLink } from "../Chat/Room/NodeLink";
import { Message } from "../Chat/Room/Message";
//import { NewsCard } from "../Chat/Room/NewsCard";
import { SidebarWrapper } from "./SidebarWrapper";

type ChatSidebarProps = {
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  openLinkedNode: any;
  username: string;
  sidebarWidth: number;
  innerHeight?: number;
  innerWidth: number;
  bookmark: any;
};

export const ChatSidebar = ({ open, onClose, sidebarWidth, innerHeight, innerWidth, theme }: ChatSidebarProps) => {
  const [value, setValue] = React.useState(0);
  const [{ user }] = useAuth();
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const [openChatRoom, setOpenChatRoom] = useState<boolean>(false);
  const [roomType, setRoomType] = useState<string>("false");
  const [selectedChannel, setSelectedChannel] = useState("");

  const a11yProps = (index: number) => {
    return {
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };
  const openRoom = (type: string, channel: any) => {
    setOpenChatRoom(true);
    setRoomType(type);
    setSelectedChannel(channel);
  };
  const moveBack = () => {
    setOpenChatRoom(false);
  };

  const contentSignalState = useMemo(() => {
    return { updates: true };
  }, [openChatRoom, value, roomType]);

  return (
    <SidebarWrapper
      title={"1Cademy Chat"}
      open={open}
      onClose={onClose}
      width={sidebarWidth}
      height={innerWidth > 599 ? 100 : 35}
      innerHeight={innerHeight}
      sx={{
        boxShadow: "none",
      }}
      showScrollUpButton={false}
      contentSignalState={contentSignalState}
      moveBack={selectedChannel ? moveBack : null}
      SidebarContent={
        <Box sx={{ borderTop: "solid 1px ", marginTop: "20px" }}>
          {openChatRoom ? (
            <Message roomType={roomType} theme={theme} selectedChannel={selectedChannel} user={user} />
          ) : (
            <Box>
              <Box
                sx={{
                  marginTop: "20px",
                  borderBottom: 1,
                  borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
                  width: "100%",
                }}
              >
                <Tabs value={value} onChange={handleChange} aria-label={"Bookmarks Tabs"} variant="fullWidth">
                  {[{ title: "News" }, { title: "Channels" }, { title: "Direct" }].map((tabItem: any, idx: number) => (
                    <Tab
                      key={tabItem.title}
                      id={`chat-tab-${tabItem.title.toLowerCase()}`}
                      label={tabItem.title}
                      {...a11yProps(idx)}
                    />
                  ))}
                </Tabs>
              </Box>
              <Box sx={{ p: "2px 16px" }}>
                {value === 0 && (
                  // <NewsCard
                  //   tag="1cademy"
                  //   image="https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FJqxTY6ZE08dudguFF0KDPqbkoZt2%2FWed%2C%2018%20Jan%202023%2022%3A14%3A06%20GMT_430x1300.jpeg?alt=media&token=9ef2b4e0-1d78-483a-ae3d-79c2007dfb31"
                  //   text={
                  //     "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                  //   }
                  //   heading="Card Test Heading"
                  // />
                  <NewsList openRoom={openRoom} />
                )}
                {value === 1 && <ChannelsList openRoom={openRoom} />}
                {value === 2 && <DirectMessagesList openRoom={openRoom} />}
              </Box>
            </Box>
          )}
        </Box>
      }
    />
  );
};

export const MemoizedChatSidebar = React.memo(ChatSidebar);
