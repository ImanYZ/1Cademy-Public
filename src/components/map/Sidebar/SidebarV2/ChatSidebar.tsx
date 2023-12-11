import { Box, Popover, Tab, Tabs } from "@mui/material";
import { EmojiClickData } from "emoji-picker-react";
import {
  arrayRemove,
  arrayUnion,
  doc,
  DocumentData,
  DocumentReference,
  getFirestore,
  updateDoc,
} from "firebase/firestore";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { IChannelMessage, IChannels, IConversation } from "src/chatTypes";
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

const DynamicMemoEmojiPicker = dynamic(() => import("../Chat/Common/EmojiPicker"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

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
  const [{ user, settings }] = useAuth();
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const [openChatRoom, setOpenChatRoom] = useState<boolean>(false);
  const [roomType, setRoomType] = useState<string>("false");
  const [selectedChannel, setSelectedChannel] = useState<IChannels | null>(null);
  const [channels, setChannels] = useState<IChannels[]>([]);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const messageBoxRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any>([]);
  const messageRef = useRef<{
    message: IChannelMessage | null;
  }>({
    message: null,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const openPicker = Boolean(anchorEl);
  const db = getFirestore();

  const a11yProps = (index: number) => {
    return {
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };
  const toggleEmojiPicker = (event: any, message?: IChannelMessage) => {
    messageRef.current.message = message || null;
    setAnchorEl(event.currentTarget);
    setShowEmojiPicker(!showEmojiPicker);
  };
  const handleCloseEmojiPicker = () => {
    setAnchorEl(null);
  };

  const handleEmojiClick = (emojiObject: EmojiClickData) => {
    const message = messageRef.current.message;
    if (message) {
      toggleReaction(message, emojiObject.emoji);
    }
    setShowEmojiPicker(false);
  };

  const getMessageRef = (messageId: string, channelId: string): DocumentReference<DocumentData> => {
    let channelRef = doc(db, "channelMessages", channelId);
    if (roomType === "direct") {
      channelRef = doc(db, "conversationMessages", channelId);
    }
    return doc(channelRef, "messages", messageId);
  };
  const addReaction = async (message: IChannelMessage, emoji: string) => {
    if (!message.id || !message.channelId || !user?.uname) return;
    const mRef = getMessageRef(message.id, message.channelId);
    await updateDoc(mRef, { reactions: arrayUnion({ user: user?.uname, emoji }) });
  };

  const removeReaction = async (message: IChannelMessage, emoji: string) => {
    if (!message.id || !message.channelId) return;
    const mRef = getMessageRef(message.id, message.channelId);
    await updateDoc(mRef, { reactions: arrayRemove({ user: user?.uname, emoji }) });
  };

  const toggleReaction = (message: IChannelMessage, emoji: string) => {
    if (!message?.id || !user?.uname || !message.channelId) return;
    const reactionIdx = message.reactions.findIndex(r => r.user === user?.uname && r.emoji === emoji);
    if (reactionIdx !== -1) {
      removeReaction(message, emoji);
    } else {
      addReaction(message, emoji);
    }
    setAnchorEl(null);
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
    setSelectedChannel(null);
  };

  const contentSignalState = useMemo(() => {
    return { updates: true };
  }, [openChatRoom, value, roomType, anchorEl, selectedChannel, channels, conversations, messages]);

  useEffect(() => {
    if (!user) return;
    const onSynchronize = (changes: channelsChange[]) => {
      setChannels((prev: any) => changes.reduce(synchronizationChannels, [...prev]));
      setSelectedChannel(s => synchroniseSelectedChannel(s, changes));
    };
    const killSnapshot = getChannelsSnapshot(db, { username: user.uname }, onSynchronize);
    return () => killSnapshot();
  }, [db, user]);

  useEffect(() => {
    if (!user) return;
    const onSynchronize = (changes: conversationChange[]) => {
      setConversations((prev: any) => changes.reduce(synchronizationChannels, [...prev]));
      // setSelectedChannel(s => synchroniseSelectedChannel(s, changes));
    };
    const killSnapshot = getConversationsSnapshot(db, { username: user.uname }, onSynchronize);
    return () => killSnapshot();
  }, [db, user]);
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
          <Popover
            open={openPicker}
            anchorEl={anchorEl}
            onClose={handleCloseEmojiPicker}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            {openPicker && (
              <DynamicMemoEmojiPicker
                width="300px"
                height="400px"
                onEmojiClick={handleEmojiClick}
                lazyLoadEmojis={true}
                theme={settings.theme.toLowerCase()}
              />
            )}
          </Popover>

          {openChatRoom ? (
            <Message
              roomType={roomType}
              theme={theme}
              selectedChannel={selectedChannel}
              user={user}
              toggleEmojiPicker={toggleEmojiPicker}
              toggleReaction={toggleReaction}
              messageBoxRef={messageBoxRef}
              setMessages={setMessages}
              messages={messages}
            />
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
                {value === 0 && <NewsList openRoom={openRoom} newsChannels={channels} />}
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

const synchroniseSelectedChannel = (selectedChannel: any, changes: any) => {
  if (!selectedChannel?.id) return null;
  const newIdx = changes.findIndex((c: any) => c.data.id === selectedChannel.id);
  if (newIdx !== -1) {
    return changes[newIdx].data;
  }
};
