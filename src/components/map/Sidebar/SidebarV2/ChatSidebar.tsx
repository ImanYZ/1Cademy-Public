import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Tab, Tabs } from "@mui/material";
import { EmojiClickData } from "emoji-picker-react";
import { getFirestore } from "firebase/firestore";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [{ user }] = useAuth();
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const [openChatRoom, setOpenChatRoom] = useState<boolean>(false);
  const [roomType, setRoomType] = useState<string>("false");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [channels, setChannels] = useState<IChannels[]>([]);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [reactionsMap, setReactionsMap] = useState<{ [key: string]: string[] }>({});
  const messageBoxRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<{
    messageId: string | null;
  }>({
    messageId: null,
  });
  const db = getFirestore();

  const a11yProps = (index: number) => {
    return {
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const toggleEmojiPicker = (event: any, messageId?: string) => {
    messageRef.current.messageId = messageId || null;
    const buttonRect = event.target.getBoundingClientRect();
    const parentDivRect = messageBoxRef?.current?.getBoundingClientRect();
    let newPosition = {
      top: buttonRect.bottom + window.scrollY,
      left: buttonRect.left + window.scrollX,
    };
    const left = newPosition.left;
    const top = newPosition.top;
    newPosition.left = Math.min(left, (parentDivRect?.right || 0) - window.scrollX - 350);
    newPosition.top = Math.min(top, (parentDivRect?.bottom || 0) - window.scrollY - 400);
    if (top >= newPosition.top) {
      newPosition.top = newPosition.top - 100;
    }
    setPosition(newPosition);
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = useCallback(
    (emojiObject: EmojiClickData) => {
      const messageId = messageRef.current.messageId;
      if (messageId) {
        toggleReaction(messageId, emojiObject.emoji);
      } else {
        // setInputValue(prevValue => prevValue + emojiObject.emoji);
      }
      setShowEmojiPicker(false);
    },
    [reactionsMap]
  );

  const addReaction = useCallback(
    (messageId: string, emoji: string) => {
      setReactionsMap(prevReactionsMap => ({
        ...prevReactionsMap,
        [messageId]: [...(prevReactionsMap[messageId] || []), emoji],
      }));
    },
    [reactionsMap]
  );

  const removeReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (reactionsMap[messageId]) {
        setReactionsMap(prevReactionsMap => ({
          ...prevReactionsMap,
          [messageId]: prevReactionsMap[messageId].filter(reaction => reaction !== emoji),
        }));
      }
    },
    [reactionsMap]
  );

  const toggleReaction = useCallback(
    (messageId: string, emoji: string) => {
      const messageReactions = reactionsMap[messageId] || [];
      if (messageReactions.includes(emoji)) {
        removeReaction(messageId, emoji);
      } else {
        addReaction(messageId, emoji);
      }
    },
    [showEmojiPicker, reactionsMap]
  );

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
  }, [openChatRoom, value, roomType, position, reactionsMap, showEmojiPicker]);

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
          <Box
            sx={{
              display: showEmojiPicker ? "block" : "none",
              position: "absolute",
              top: position.top,
              left: position.left,
              zIndex: "99",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "end" }}>
              <IconButton onClick={() => setShowEmojiPicker(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <DynamicMemoEmojiPicker
              width="300px"
              height="400px"
              onEmojiClick={handleEmojiClick}
              lazyLoadEmojis={true}
            />
          </Box>
          {openChatRoom ? (
            <Message
              roomType={roomType}
              theme={theme}
              selectedChannel={selectedChannel}
              user={user}
              toggleEmojiPicker={toggleEmojiPicker}
              toggleReaction={toggleReaction}
              messageBoxRef={messageBoxRef}
              messageRef={messageRef}
              position={position}
              setPosition={setPosition}
              reactionsMap={reactionsMap}
              setReactionsMap={setReactionsMap}
              setShowEmojiPicker={setShowEmojiPicker}
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
