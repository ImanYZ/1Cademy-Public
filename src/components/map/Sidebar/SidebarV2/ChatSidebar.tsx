import { Box, ClickAwayListener, Modal, Popover, Tab, Tabs } from "@mui/material";
import { EmojiClickData } from "emoji-picker-react";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  DocumentData,
  DocumentReference,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import dynamic from "next/dynamic";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { IChannelMessage, IChannels, IConversation } from "src/chatTypes";
import { channelsChange, getChannelsSnapshot } from "src/client/firestore/channels.firesrtore";
import { conversationChange, getConversationsSnapshot } from "src/client/firestore/conversations.firesrtore";
import { UserTheme } from "src/knowledgeTypes";

import { AllTagsTreeView, ChosenTag, MemoizedTagsSearcher } from "@/components/TagsSearcher";
import { useTagsTreeView } from "@/hooks/useTagsTreeView";
import { retrieveAuthenticatedUser } from "@/lib/firestoreClient/auth";
import { updateNotebookTag } from "@/lib/firestoreClient/notebooks.serverless";
import { Post } from "@/lib/mapApi";

import { ChannelsList } from "../Chat/List/Channels";
import { DirectMessagesList } from "../Chat/List/DirectMessages";
import { NewsList } from "../Chat/List/News";
import { Summary } from "../Chat/List/Summary";
//import { NodeLink } from "../Chat/Room/NodeLink";
import { Message } from "../Chat/Room/Message";
//import { NewsCard } from "../Chat/Room/NewsCard";
import { SidebarWrapper } from "./SidebarWrapper";

const DynamicMemoEmojiPicker = dynamic(() => import("../Chat/Common/EmojiPicker"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

type ChatSidebarProps = {
  user: any;
  settings: any;
  onlineUsers: any;
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  openLinkedNode: any;
  username: string;
  sidebarWidth: number;
  innerHeight?: number;
  innerWidth: number;
  bookmark: any;
  notebookRef: any;
  nodeBookDispatch: any;
  nodeBookState: any;
  notebooks: any;
  onChangeNotebook: any;
  selectedNotebook: any;
  dispatch: any;
  onChangeTagOfNotebookById: any;
};

export const ChatSidebar = ({
  user,
  settings,
  open,
  onClose,
  sidebarWidth,
  innerHeight,
  innerWidth,
  theme,
  notebookRef,
  nodeBookDispatch,
  nodeBookState,
  notebooks,
  onChangeNotebook,
  selectedNotebook,
  dispatch,
  onChangeTagOfNotebookById,
  onlineUsers,
}: ChatSidebarProps) => {
  const db = getFirestore();
  const [value, setValue] = React.useState(0);
  const [displayTagSearcher, setDisplayTagSearcher] = useState<boolean>(false);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const [openChatRoom, setOpenChatRoom] = useState<boolean>(false);
  const [roomType, setRoomType] = useState<string>("");
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
  const [forward, setForward] = useState<boolean>(false);
  const openPicker = Boolean(anchorEl);
  const [chosenTags, setChosenTags] = useState<ChosenTag[]>([]);
  const [openChatInfo, setOpenChatInfo] = useState<boolean>(false);
  const { allTags, setAllTags } = useTagsTreeView(user?.tagId ? [user?.tagId] : []);

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

  useEffect(() => {
    if (chosenTags.length > 0 && chosenTags[0].id in allTags) {
      notebookRef.current.chosenNode = { id: chosenTags[0].id, title: chosenTags[0].title };
      nodeBookDispatch({ type: "setChosenNode", payload: { id: chosenTags[0].id, title: chosenTags[0].title } });
      onCloseTagSearcher();
    }
  }, [allTags, chosenTags, nodeBookDispatch]);

  useEffect(() => {
    const targetTag: any = user?.tagId;
    setAllTags(oldAllTags => {
      const updatedTag = {
        [targetTag]: { ...oldAllTags[targetTag], checked: true },
      };
      delete oldAllTags[targetTag];
      const newAllTags: AllTagsTreeView = {
        ...updatedTag,
        ...oldAllTags,
      };
      2;

      for (let aTag in newAllTags) {
        if (aTag !== targetTag && newAllTags[aTag].checked) {
          newAllTags[aTag] = { ...newAllTags[aTag], checked: false };
        }
      }
      return newAllTags;
    });
  }, [user?.tagId]);

  useEffect(() => {
    const setDefaultTag = async () => {
      if (!selectedNotebook) return;
      const thisNotebook = notebooks.find((cur: any) => cur.id === selectedNotebook);
      if (!thisNotebook) return;

      if (thisNotebook.owner !== user.uname) return alert("Cant modify this tag, ask to the notebook's owner");

      if (nodeBookState.choosingNode?.id === "Tag" && nodeBookState.chosenNode) {
        const { id: nodeId, title: nodeTitle } = nodeBookState.chosenNode;
        notebookRef.current.choosingNode = null;
        notebookRef.current.chosenNode = null;
        nodeBookDispatch({ type: "setChoosingNode", payload: null });
        nodeBookDispatch({ type: "setChosenNode", payload: null });
        try {
          // onChangeNotebook(selectedNotebook);
          dispatch({
            type: "setAuthUser",
            payload: { ...user, tagId: nodeId, tag: nodeTitle },
          });
          onChangeTagOfNotebookById(selectedNotebook, { defaultTagId: nodeId, defaultTagName: nodeTitle });
          await Post(`/changeDefaultTag/${nodeId}`);

          await updateNotebookTag(db, selectedNotebook, { defaultTagId: nodeId, defaultTagName: nodeTitle });

          let { reputation, user: userUpdated } = await retrieveAuthenticatedUser(user.userId, user.role, user.claims);
          if (!reputation) throw Error("Cant find Reputation");
          if (!userUpdated) throw Error("Cant find User");

          dispatch({ type: "setReputation", payload: reputation });
          dispatch({ type: "setAuthUser", payload: userUpdated });
          setDisplayTagSearcher(false);
        } catch (err) {
          console.error(err);
        }
      }
    };
    setDefaultTag();
  }, [
    db,
    dispatch,
    nodeBookDispatch,
    nodeBookState.choosingNode?.id,
    nodeBookState.chosenNode,
    notebookRef,
    notebooks,
    onChangeNotebook,
    onChangeTagOfNotebookById,
    selectedNotebook,
    user,
  ]);

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
    } else if (roomType === "news") {
      channelRef = doc(db, "announcementsMessages", channelId);
    }
    return doc(channelRef, "messages", messageId);
  };
  const addReaction = async (message: IChannelMessage, emoji: string) => {
    if (!message.id || !message.channelId || !user?.uname) return;
    if (message.parentMessage) {
      const parentMessage = messages.find((m: IChannelMessage) => m.id === message.parentMessage);
      const replyIdx = parentMessage.replies.findIndex((r: IChannelMessage) => r.id === message.id);
      parentMessage.replies[replyIdx].reactions.push({ user: user?.uname, emoji });
      const mRef = getMessageRef(message.parentMessage, message.channelId);
      await updateDoc(mRef, { replies: parentMessage.replies });
    } else {
      const mRef = getMessageRef(message.id, message.channelId);
      await updateDoc(mRef, { reactions: arrayUnion({ user: user?.uname, emoji }) });
    }
  };

  const removeReaction = async (message: IChannelMessage, emoji: string) => {
    if (!message.id || !message.channelId) return;
    if (message.parentMessage) {
      const parentMessage = messages.find((m: IChannelMessage) => m.id === message.parentMessage);
      const replyIdx = parentMessage.replies.findIndex((r: IChannelMessage) => r.id === message.id);
      const reactionIdx = parentMessage.replies[replyIdx].reactions.findIndex(
        (r: any) => r.emoji === emoji && r.user === user?.uname
      );
      parentMessage.replies[replyIdx].reactions.splice(reactionIdx, 1);
      const mRef = getMessageRef(message.parentMessage, message.channelId);
      await updateDoc(mRef, { replies: parentMessage.replies });
    } else {
      const mRef = getMessageRef(message.id, message.channelId);
      await updateDoc(mRef, { reactions: arrayRemove({ user: user?.uname, emoji }) });
    }
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
    setMessages([]);
  };

  const openConversation = (type: string, channel: any) => {
    setOpenChatRoom(true);
    setRoomType(type);
    setSelectedChannel(channel);
  };

  const moveBack = () => {
    if (forward) {
      setForward(!forward);
    } else {
      setOpenChatRoom(false);
      setSelectedChannel(null);
    }
  };

  const onCloseTagSearcher = () => setDisplayTagSearcher(false);

  const openChatInfoPage = () => {
    setOpenChatInfo(!openChatInfo);
  };

  const contentSignalState = useMemo(() => {
    return { updates: true };
  }, [
    openChatRoom,
    value,
    roomType,
    anchorEl,
    selectedChannel,
    channels,
    conversations,
    messages,
    displayTagSearcher,
    setChosenTags,
    chosenTags,
    openChatInfo,
  ]);

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

  const openDMChannel = async (user2: any) => {
    if (!user?.uname || !user2.uname) return;
    const findConversation = await getDocs(
      query(collection(db, "conversations"), where("members", "==", [user2.uname, user?.uname]))
    );

    if (findConversation.docs.length > 0) {
      const conversationData: any = findConversation.docs[0].data();
      openRoom("direct", { ...conversationData, id: findConversation.docs[0].id });
    } else {
      const converstionRef = doc(collection(db, "conversations"));
      const conversationData = {
        title: "",
        members: [user2.uname, user?.uname],
        membersInfo: {
          [user2.uname]: {
            uname: user2.uname,
            imageUrl: user2.imageUrl,
            chooseUname: !!user2.chooseUname,
            fullname: `${user2.fName} ${user2.lName}`,
            role: "",
          },
          [user?.uname]: {
            uname: user?.uname,
            imageUrl: user.imageUrl,
            chooseUname: !!user.chooseUname,
            fullname: `${user.fName} ${user.lName}`,
            role: "",
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await setDoc(converstionRef, conversationData);
      openRoom("direct", { ...conversationData, id: converstionRef.id });
    }
  };
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
      setDisplayTagSearcher={setDisplayTagSearcher}
      openChatInfoPage={openChatInfoPage}
      sidebarType={"chat"}
      onlineUsers={onlineUsers}
      user={user}
      SidebarContent={
        <Box sx={{ marginTop: openChatRoom ? "9px" : "22px" }}>
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
            <>
              {openChatInfo ? (
                <Summary roomType={roomType} selectedChannel={selectedChannel} />
              ) : (
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
                  setForward={setForward}
                  forward={forward}
                  getMessageRef={getMessageRef}
                />
              )}
            </>
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
                {value === 2 && (
                  <DirectMessagesList
                    openRoom={openConversation}
                    conversations={conversations}
                    db={db}
                    onlineUsers={onlineUsers}
                    openDMChannel={openDMChannel}
                  />
                )}
              </Box>
            </Box>
          )}
          {displayTagSearcher && (
            <Suspense fallback={<div>loading...</div>}>
              <ClickAwayListener onClickAway={onCloseTagSearcher}>
                <Modal
                  open={displayTagSearcher}
                  disablePortal
                  hideBackdrop
                  sx={{
                    "&.MuiModal-root": {
                      top: "10px",
                      left: "240px",
                      right: "unset",
                      bottom: "unset",
                    },
                  }}
                >
                  <MemoizedTagsSearcher
                    id="user-settings-tag-searcher"
                    setChosenTags={setChosenTags}
                    chosenTags={chosenTags}
                    allTags={allTags}
                    setAllTags={setAllTags}
                    width={"440px"}
                    height={"440px"}
                    onClose={onCloseTagSearcher}
                  />
                </Modal>
              </ClickAwayListener>
            </Suspense>
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
