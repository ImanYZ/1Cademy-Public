import { Box, Tab, Tabs } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { IChannels, IConversation } from "src/chatTypes";
import { channelsChange, getChannelsSnapshot } from "src/client/firestore/channels.firesrtore";
import { conversationChange, getConversationsSnapshot } from "src/client/firestore/conversations.firesrtore";
import { UserTheme } from "src/knowledgeTypes";

import { useAuth } from "@/context/AuthContext";

import { ChannelsList } from "../Chat/List/Channels";
import { DirectMessagesList } from "../Chat/List/DirectMessages";
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
  const [channels, setChannels] = useState<IChannels[]>([]);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const db = getFirestore();

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

  const openConversation = (type: string, channel: any) => {
    setOpenChatRoom(true);
    setRoomType(type);
    setSelectedChannel(channel);
  };

  const moveBack = () => {
    setOpenChatRoom(false);
    setSelectedChannel("");
  };

  const contentSignalState = useMemo(() => {
    return { updates: true };
  }, [openChatRoom, value, roomType]);

  useEffect(() => {
    if (!user) return;
    const onSynchronize = (changes: channelsChange[]) => {
      setChannels((prev: any) => changes.reduce(synchronizationChannels, [...prev]));
    };
    const killSnapshot = getChannelsSnapshot(db, { username: user.uname }, onSynchronize);
    return () => killSnapshot();
  }, [db, user]);

  useEffect(() => {
    if (!user) return;
    const onSynchronize = (changes: conversationChange[]) => {
      setConversations((prev: any) => changes.reduce(synchronizationChannels, [...prev]));
    };
    const killSnapshot = getConversationsSnapshot(db, { username: user.uname }, onSynchronize);
    return () => killSnapshot();
  }, []);

  return (
    <SidebarWrapper
      title={""}
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
      selectedChannel={selectedChannel}
      sidebarType={"chat"}
      SidebarContent={
        <Box sx={{ borderTop: "solid 1px ", marginTop: openChatRoom ? "9px" : "22px" }}>
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
                {value === 0 && <NewsList openRoom={openRoom} newsChannels={[]} />}
                {value === 1 && <ChannelsList openRoom={openRoom} channels={channels} />}
                {value === 2 && <DirectMessagesList openRoom={openConversation} conversations={conversations} />}
              </Box>
            </Box>
          )}
        </Box>
      }
    />
  );
};

export const MemoizedChatSidebar = React.memo(ChatSidebar);

const synchronizationChannels = (prev: (any & { id: string })[], change: any) => {
  const docType = change.type;
  const curData = change.data as any & { id: string };

  const prevIdx = prev.findIndex((m: any & { id: string }) => m.id === curData.id);
  if (docType === "added" && prevIdx === -1) {
    prev.push(curData);
  }
  if (docType === "modified" && prevIdx !== -1) {
    prev[prevIdx] = curData;
  }

  if (docType === "removed" && prevIdx !== -1) {
    prev.splice(prevIdx);
  }
  prev.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
  return prev;
};
