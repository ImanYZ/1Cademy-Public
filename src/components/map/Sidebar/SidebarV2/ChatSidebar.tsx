import { Box, ClickAwayListener, Modal, Popover, Tab, Tabs, Typography } from "@mui/material";
import { EmojiClickData } from "emoji-picker-react";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  DocumentData,
  DocumentReference,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import dynamic from "next/dynamic";
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IChannelMessage, IChannels, IConversation } from "src/chatTypes";
import { getSelectedChannel } from "src/client/firestore/channels.firesrtore";
import { UserTheme } from "src/knowledgeTypes";

import { AllTagsTreeView, ChosenTag, MemoizedTagsSearcher } from "@/components/TagsSearcher";
import useConfirmationDialog from "@/hooks/useConfirmDialog";
import { useTagsTreeView } from "@/hooks/useTagsTreeView";
import { retrieveAuthenticatedUser } from "@/lib/firestoreClient/auth";
import { updateNotebookTag } from "@/lib/firestoreClient/notebooks.serverless";
import { Post } from "@/lib/mapApi";
import { generateChannelName } from "@/lib/utils/chat";

import { CustomBadge } from "../../CustomBudge";
import { ChannelsList } from "../Chat/List/Channels";
import { DirectMessagesList } from "../Chat/List/DirectMessages";
import { NewsList } from "../Chat/List/News";
import { Summary } from "../Chat/List/Summary";
import { Message } from "../Chat/Room/Message";
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
  notifications: any;
  openUserInfoSidebar: any;
  channels: IChannels[];
  conversations: IConversation[];
};

export const ChatSidebar = ({
  user,
  settings,
  open,
  onClose,
  sidebarWidth,
  innerHeight,
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
  openLinkedNode,
  notifications,
  openUserInfoSidebar,
  channels,
  conversations,
}: ChatSidebarProps) => {
  const db = getFirestore();
  const [value, setValue] = React.useState(0);
  const { confirmIt, ConfirmDialog } = useConfirmationDialog();
  const [displayTagSearcher, setDisplayTagSearcher] = useState<boolean>(false);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const [openChatRoom, setOpenChatRoom] = useState<boolean>(false);
  const [roomType, setRoomType] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<IChannels | null>(null);
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
  const [leading, setLeading] = useState<any>(user.claims?.leading || []);
  const { allTags, setAllTags } = useTagsTreeView(user?.tagId ? [user?.tagId] : []);
  const [newMemberSection, setNewMemberSection] = useState(false);
  const [isLoadingReaction, setIsLoadingReaction] = useState<IChannelMessage | null>(null);

  useEffect(() => {
    (async () => {
      const updatedSelectedChannel = await getSelectedChannel(db, roomType, selectedChannel?.id || "");
      if (updatedSelectedChannel) {
        setSelectedChannel({ ...updatedSelectedChannel });
      }
    })();
  }, [channels, conversations]);

  // useEffect(() => {
  //   if (!user) return;
  //   const onSynchronize = (changes: channelsChange[]) => {
  //     setChannels((prev: any) => changes.reduce(synchronizeStuff, [...prev]));
  //     // setSelectedChannel(s => synchroniseSelectedChannel(s, changes));
  //   };
  //   const killSnapshot = getChannelsSnapshot(db, { username: user.uname }, onSynchronize);
  //   return () => killSnapshot();
  // }, [db, user]);

  // useEffect(() => {
  //   if (!user) return;
  //   const onSynchronize = (changes: conversationChange[]) => {
  //     setConversations((prev: any) => changes.reduce(synchronizeStuff, [...prev]));
  //     // setSelectedChannel(s => synchroniseSelectedChannel(s, changes));
  //   };
  //   const killSnapshot = getConversationsSnapshot(db, { username: user.uname }, onSynchronize);
  //   return () => killSnapshot();
  // }, [db, user]);

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

      if (thisNotebook.owner !== user.uname)
        return confirmIt("Cant modify this tag, ask to the notebook's owner", "Ok", "");

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
      setMessages((prevMessages: any) => {
        const messageIdx = prevMessages.findIndex((m: any) => m.id === message.parentMessage);
        const replyIdx = prevMessages[messageIdx].replies.findIndex((m: any) => m.id === message.id);
        prevMessages[messageIdx].replies[replyIdx].reactions.push({ user: user?.uname, emoji });
        return prevMessages;
      });
    } else {
      setMessages((prevMessages: any) => {
        const messageIdx = prevMessages.findIndex((m: any) => m.id === message.id);
        prevMessages[messageIdx].reactions.push({ user: user?.uname, emoji });
        return prevMessages;
      });
    }
    if (message.sender === user?.uname && !message.parentMessage) {
      const mRef = getMessageRef(message.id, message.channelId);
      await updateDoc(mRef, { reactions: arrayUnion({ user: user?.uname, emoji }) });
    } else {
      setIsLoadingReaction(message);
      await Post("/chat/reactOnMessage/", { message, action: "addReaction", roomType, emoji });
      setIsLoadingReaction(null);
    }
  };

  const removeReaction = async (message: IChannelMessage, emoji: string) => {
    if (!message.id || !message.channelId) return;
    if (message.parentMessage) {
      setMessages((prevMessages: any) => {
        const messageIdx = prevMessages.findIndex((m: any) => m.id === message.parentMessage);
        const replyIdx = prevMessages[messageIdx].replies.findIndex((m: any) => m.id === message.id);
        prevMessages[messageIdx].replies[replyIdx].reactions = prevMessages[messageIdx].replies[
          replyIdx
        ].reactions.filter((r: any) => r.emoji !== emoji && r.user !== user?.uname);
        return prevMessages;
      });
    } else {
      setMessages((prevMessages: any) => {
        const messageIdx = prevMessages.findIndex((m: any) => m.id === message.id);
        prevMessages[messageIdx].reactions = prevMessages[messageIdx].reactions.filter(
          (r: any) => r.emoji !== emoji && r.user !== user?.uname
        );
        return prevMessages;
      });
    }

    if (message.sender === user?.uname && !message.parentMessage) {
      const mRef = getMessageRef(message.id, message.channelId);
      await updateDoc(mRef, { reactions: arrayRemove({ user: user?.uname, emoji }) });
    } else {
      await Post("/chat/reactOnMessage/", { message, action: "removeReaction", roomType, emoji });
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
    clearNotifications(notifications.filter((n: any) => n.channelId === channel.id));
    makeMessageRead(channel.id);
  };

  const moveBack = () => {
    if (openChatInfo) {
      setOpenChatInfo(false);
      return;
    }
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

  const getChannelRef = (channelId: string): DocumentReference<DocumentData> => {
    let channelRef = doc(db, "channels", channelId);
    if (roomType === "direct") {
      channelRef = doc(db, "conversations", channelId);
    } else if (roomType === "news") {
      channelRef = doc(db, "announcementsMessages", channelId);
    }
    return channelRef;
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
    notifications,
    theme,
    onlineUsers,
    newMemberSection,
    leading,
    isLoadingReaction,
  ]);

  // useEffect(() => {
  //   if (!user) return;
  //   const onSynchronize = (changes: channelsChange[]) => {
  //     setChannels((prev: any) => changes.reduce(synchronizeStuff, [...prev]));
  //     setSelectedChannel(s => synchroniseSelectedChannel(s, changes));
  //   };
  //   const killSnapshot = getChannelsSnapshot(db, { username: user.uname }, onSynchronize);
  //   return () => killSnapshot();
  // }, [db, user]);

  // useEffect(() => {
  //   if (!user) return;
  //   const onSynchronize = (changes: conversationChange[]) => {
  //     setConversations((prev: any) => changes.reduce(synchronizeStuff, [...prev]));
  //     // setSelectedChannel(s => synchroniseSelectedChannel(s, changes));
  //   };
  //   const killSnapshot = getConversationsSnapshot(db, { username: user.uname }, onSynchronize);
  //   return () => killSnapshot();
  // }, [db, user]);

  const openDMChannel = async (user2: any) => {
    if (!user?.uname || !user2.uname) return;
    const findConversation = await getDocs(
      query(collection(db, "conversations"), where("members", "array-contains", user.uname))
    );
    const filteredResults = findConversation.docs.find(
      doc => doc.data().members.includes(user2.uname) && doc.data().members.length === 2
    );
    if (filteredResults) {
      const conversationData: any = filteredResults.data();
      openRoom("direct", { ...conversationData, id: filteredResults.id });
    } else {
      const converstionRef = doc(collection(db, "conversations"));
      const membersInfo = {
        [user2.uname]: {
          uname: user2.uname,
          imageUrl: user2.imageUrl,
          chooseUname: !!user2.chooseUname,
          fullname: `${user2.fName} ${user2.lName}`,
          role: "",
          uid: user2.userId,
        },
        [user?.uname]: {
          uname: user?.uname,
          imageUrl: user.imageUrl,
          chooseUname: !!user.chooseUname,
          fullname: `${user.fName} ${user.lName}`,
          role: "",
          uid: user?.userId,
        },
      };
      const conversationData = {
        title: generateChannelName(membersInfo, user),
        members: [user2.uname, user?.uname],
        membersInfo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await setDoc(converstionRef, conversationData);
      const docSnap = await getDoc(converstionRef);
      setLeading([...leading, docSnap.id]);
      Post(`/chat/createChannelLeader`, { channelId: docSnap.id });
      openRoom("direct", { ...conversationData, id: converstionRef.id });
    }
  };

  const clearNotifications = (notifications: any) => {
    for (let notif of notifications) {
      updateDoc(notif.doc.ref, {
        seen: true,
        seenAt: new Date(),
      });
    }
  };

  const makeMessageUnread = async (message: IChannelMessage) => {
    if (!selectedChannel) return;

    const channelRef = getChannelRef(selectedChannel.id || "");
    const membersInfo = {
      ...(selectedChannel?.membersInfo || {}),
      [user.uname]: { ...selectedChannel?.membersInfo[user.uname], unreadMessageId: message.id },
    };
    await updateDoc(channelRef, {
      membersInfo,
    });
    await Post("/chat/markAsUnread", { roomType, message });
  };

  const makeMessageRead = async (channelId: string) => {
    await Post("/chat/markAsRead", { roomType, channelId });
  };

  useEffect(() => {
    if (!selectedChannel || !roomType) return;
    clearNotifications(notifications.filter((n: any) => n.channelId === selectedChannel.id && !n?.manualSeen));
  }, [notifications, selectedChannel]);

  const getNotificationsNumbers = useCallback(
    (type: string) => {
      return notifications.filter((n: any) => n.roomType === type).length;
    },
    [notifications]
  );

  return (
    <SidebarWrapper
      id="chat"
      title={""}
      open={open}
      onClose={onClose}
      width={sidebarWidth}
      height={100}
      innerHeight={innerHeight}
      sx={{
        boxShadow: "none",
      }}
      showScrollUpButton={false}
      contentSignalState={contentSignalState}
      moveBack={selectedChannel ? moveBack : null}
      selectedChannel={selectedChannel}
      // setDisplayTagSearcher={setDisplayTagSearcher}
      openChatInfoPage={openChatInfoPage}
      setNewMemberSection={setNewMemberSection}
      sidebarType={"chat"}
      onlineUsers={onlineUsers}
      user={user}
      openChatInfo={openChatInfo}
      leading={leading.includes(selectedChannel?.id)}
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
                <Summary
                  theme={theme}
                  roomType={roomType}
                  selectedChannel={selectedChannel}
                  openLinkedNode={openLinkedNode}
                  leading={leading}
                  openUserInfoSidebar={openUserInfoSidebar}
                  moveBack={moveBack}
                  setOpenChatRoom={setOpenChatRoom}
                  onlineUsers={onlineUsers}
                  user={user}
                  sidebarWidth={sidebarWidth}
                  getChannelRef={getChannelRef}
                />
              ) : (
                <Message
                  notebookRef={notebookRef}
                  nodeBookDispatch={nodeBookDispatch}
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
                  leading={leading.includes(selectedChannel?.id)}
                  sidebarWidth={sidebarWidth}
                  openLinkedNode={openLinkedNode}
                  onlineUsers={onlineUsers}
                  newMemberSection={newMemberSection}
                  setNewMemberSection={setNewMemberSection}
                  getChannelRef={getChannelRef}
                  isLoadingReaction={isLoadingReaction}
                  makeMessageUnread={makeMessageUnread}
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
                  {[
                    { title: "News", type: "announcement" },
                    { title: "Channels", type: "channel" },
                    { title: "Direct", type: "direct" },
                  ].map((tabItem: any, idx: number) => (
                    <Tab
                      key={tabItem.title}
                      id={`chat-tab-${tabItem.title.toLowerCase()}`}
                      label={
                        <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <Typography>{tabItem.title}</Typography>
                          {getNotificationsNumbers(tabItem.type) > 0 && (
                            <CustomBadge
                              value={getNotificationsNumbers(tabItem.type)}
                              key={idx}
                              sx={{
                                height: "20px",
                                p: "6px",
                                fontSize: "13px",
                              }}
                            />
                          )}
                        </Box>
                      }
                      {...a11yProps(idx)}
                    ></Tab>
                  ))}
                </Tabs>
              </Box>
              <Box sx={{ p: "2px 16px" }}>
                {value === 0 && (
                  <NewsList
                    openRoom={openRoom}
                    newsChannels={channels.sort(
                      (a, b) => b.newsUpdatedAt.toDate().getTime() - a.newsUpdatedAt.toDate().getTime()
                    )}
                    notifications={notifications.filter((n: any) => n.roomType === "news")}
                  />
                )}
                {value === 1 && (
                  <ChannelsList
                    openRoom={openRoom}
                    channels={channels.sort((a, b) => b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime())}
                    notifications={notifications.filter((n: any) => n.roomType === "channel")}
                  />
                )}
                {value === 2 && (
                  <DirectMessagesList
                    openRoom={openRoom}
                    conversations={conversations}
                    db={db}
                    onlineUsers={onlineUsers}
                    openDMChannel={openDMChannel}
                    notifications={notifications.filter((n: any) => n.roomType === "direct")}
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
          {ConfirmDialog}
        </Box>
      }
    />
  );
};

const areEqual = (prevProps: any, nextProps: any) => {
  return (
    prevProps.user === nextProps.user &&
    prevProps.settings === nextProps.settings &&
    prevProps.open === nextProps.open &&
    //prevProps.onClose === nextProps.onClose &&
    prevProps.sidebarWidth === nextProps.sidebarWidth &&
    prevProps.innerHeight === nextProps.innerHeight &&
    prevProps.theme === nextProps.theme &&
    prevProps.notebookRef === nextProps.notebookRef &&
    prevProps.nodeBookDispatch === nextProps.nodeBookDispatch &&
    prevProps.nodeBookState === nextProps.nodeBookState &&
    prevProps.notebooks === nextProps.notebooks &&
    prevProps.onChangeNotebook === nextProps.onChangeNotebook &&
    prevProps.selectedNotebook === nextProps.selectedNotebook &&
    prevProps.dispatch === nextProps.dispatch &&
    prevProps.onChangeTagOfNotebookById === nextProps.onChangeTagOfNotebookById &&
    prevProps.onlineUsers === nextProps.onlineUsers &&
    prevProps.openLinkedNode === nextProps.openLinkedNode &&
    prevProps.notifications === nextProps.notifications &&
    prevProps.openUserInfoSidebar === nextProps.openUserInfoSidebar &&
    prevProps.channels === nextProps.channels &&
    prevProps.conversations === nextProps.conversations
  );
};

export const MemoizedChatSidebar = React.memo(ChatSidebar, areEqual);

// const synchronizeStuff = (prev: (any & { id: string })[], change: any) => {
//   const docType = change.type;
//   const curData = change.data as any & { id: string };

//   const prevIdx = prev.findIndex((m: any & { id: string }) => m.id === curData.id);
//   if (docType === "added" && prevIdx === -1) {
//     prev.push(curData);
//   }
//   if (docType === "modified" && prevIdx !== -1) {
//     prev[prevIdx] = curData;
//   }

//   if (docType === "removed" && prevIdx !== -1) {
//     prev.splice(prevIdx, 1);
//   }
//   prev.sort((a, b) => b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime());
//   return prev;
// };

// const synchroniseSelectedChannel = (selectedChannel: any, changes: any) => {
//   if (!selectedChannel?.id) return null;
//   const newIdx = changes.findIndex((c: any) => c.data.id === selectedChannel.id);
//   if (newIdx !== -1) {
//     return changes[newIdx].data;
//   }
// };
