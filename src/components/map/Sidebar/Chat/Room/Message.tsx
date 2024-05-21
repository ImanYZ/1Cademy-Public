import { Paper } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getFirestore } from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { IChannelMessage } from "src/chatTypes";
import { getChannelMesasgesSnapshot } from "src/client/firestore/channelMessages.firesrtore";
import { UserTheme } from "src/knowledgeTypes";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { NotFoundNotification } from "../../SidebarV2/NotificationSidebar";
import { Forward } from "../List/Forward";
import { MessageInput } from "./MessageInput";
import { MessageLeft } from "./MessageLeft";
import { NewsCard } from "./NewsCard";
import { NodeLink } from "./NodeLink";
import { Reply } from "./Reply";

dayjs.extend(relativeTime);
type MessageProps = {
  notebookRef: any;
  nodeBookDispatch: any;
  roomType: string;
  theme: UserTheme;
  selectedChannel: any;
  user: any;
  toggleEmojiPicker: (event: any, message?: IChannelMessage) => void;
  toggleReaction: (messageId: IChannelMessage, emoji: string) => void;
  messageBoxRef: any;
  setMessages: any;
  messages: any;
  setForward: (forward: boolean) => void;
  forward: boolean;
  getMessageRef: any;
  leading: boolean;
  sidebarWidth: number;
  openLinkedNode: any;
  onlineUsers: any;
};

export const Message = ({
  notebookRef,
  nodeBookDispatch,
  roomType,
  theme,
  selectedChannel,
  user,
  toggleEmojiPicker,
  toggleReaction,
  messageBoxRef,
  setMessages,
  messages,
  setForward,
  forward,
  getMessageRef,
  leading,
  sidebarWidth,
  openLinkedNode,
  onlineUsers,
}: MessageProps) => {
  const db = getFirestore();
  const [selectedMessage, setSelectedMessage] = useState<{ id: string | null; message: string | null } | {}>({});
  const [channelUsers, setChannelUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loadMore, setLoadMore] = useState<boolean>(false);
  const [messagesByDate, setMessagesByDate] = useState<any>({});
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [replyOnMessage, setReplyOnMessage] = useState<any>(null);
  const [editingMessage, setEditingMessage] = useState<IChannelMessage | null>(null);
  const scrolling = useRef<any>();

  useEffect(() => {
    const currentDate = new Date();
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    const _previosDate = new Date(currentDate);
    _previosDate.setDate(currentDate.getDate() - 3);

    const messagesObject: { [key: string]: any } = {};
    messages.forEach((message: any) => {
      const currentDate = new Date();
      const messageDate = message.createdAt.toDate();
      let formattedDate;
      if (
        messageDate.getDate() === currentDate.getDate() &&
        messageDate.getMonth() === currentDate.getMonth() &&
        messageDate.getFullYear() === currentDate.getFullYear()
      ) {
        formattedDate = "Today";
      } else {
        const yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1);

        if (
          messageDate.getDate() === yesterday.getDate() &&
          messageDate.getMonth() === yesterday.getMonth() &&
          messageDate.getFullYear() === yesterday.getFullYear()
        ) {
          formattedDate = "Yesterday";
        } else {
          const options: any = { weekday: "short", month: "short", day: "numeric" };
          formattedDate = messageDate.toLocaleDateString("en-US", options);
        }
      }

      if (!messagesObject[formattedDate]) {
        messagesObject[formattedDate] = [];
      }

      messagesObject[formattedDate].push(message);
    });
    setMessagesByDate(messagesObject);
  }, [messages]);

  const forwardMessage = useCallback(
    (message: any) => {
      setSelectedMessage(message);
      setForward(true);
    },
    [setSelectedMessage, setForward]
  );
  // const scroll = () => {
  //   if (messageBoxRef.current && messages.length > 2) {
  //     messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
  //   }
  // };

  useEffect(() => {
    if (!selectedChannel) return;
    const members: any = Object.values(selectedChannel.membersInfo).map((m: any) => {
      m.display = m.fullname;
      m.id = m.uname;
      return m;
    });
    setChannelUsers(members);
  }, [selectedChannel]);

  useEffect(() => {
    setLastVisible(messages[0]?.doc || null);
  }, [messages]);

  useEffect(() => {
    const onSynchronize = (changes: any) => {
      setMessages((prev: any) => changes.reduce(synchronizationMessages, [...prev]));

      setTimeout(() => {
        if (firstLoad) {
          setFirstLoad(false);
          scrollToBottom();
        }
      }, 500);
    };
    const killSnapshot = getChannelMesasgesSnapshot(
      db,
      { channelId: selectedChannel.id, lastVisible, roomType },
      onSynchronize
    );
    return () => killSnapshot();
  }, [db]);

  const scrollToBottom = () => {
    if (scrolling.current) {
      scrolling.current.scrollIntoView({ behaviour: "smooth" });
    }
  };

  useEffect(() => {
    const messageList: any = messageBoxRef.current;
    const handleScroll = () => {
      if (messageList.scrollTop === 0) {
        setLoadMore(l => !l);
      }
    };

    messageList.addEventListener("scroll", handleScroll);

    return () => {
      messageList.removeEventListener("scroll", handleScroll);
    };
  }, [loadMore]);

  if (!selectedChannel) return <></>;

  return (
    <Box
      id="message-box"
      ref={messageBoxRef}
      sx={{
        gap: "4px",
        pl: 3,
        pr: 3,
        position: "relative",
        height: leading || replyOnMessage || roomType !== "news" ? "88vh" : "90vh",
        pb: "120px",
        overflow: "auto",
      }}
    >
      {forward ? (
        <Forward />
      ) : (
        <Box>
          {!firstLoad && !Object.keys(messagesByDate).length && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "40%",
              }}
            >
              <NotFoundNotification title="Start Chatting" description="" />
            </Box>
          )}
          {Object.keys(messagesByDate).map(date => {
            return (
              <Box key={date}>
                <Box sx={{ display: "flex", justifyContent: "center", position: "sticky", top: 0, zIndex: 1 }}>
                  <Paper
                    sx={{
                      alignItems: "center",
                      borderRadius: "20px",
                      padding: "8px 20px",
                      fontSize: "14px",
                      fontWeight: "500",
                      background: DESIGN_SYSTEM_COLORS.orange300,
                      color: "white",
                      mt: "15px",
                    }}
                  >
                    {date}
                  </Paper>
                </Box>
                {messagesByDate[date].map((message: any) => (
                  <Box key={message.id}>
                    {roomType === "news" && (
                      <NewsCard
                        notebookRef={notebookRef}
                        nodeBookDispatch={nodeBookDispatch}
                        db={db}
                        user={user}
                        message={message}
                        membersInfo={selectedChannel.membersInfo}
                        toggleEmojiPicker={toggleEmojiPicker}
                        channelUsers={channelUsers}
                        replyOnMessage={replyOnMessage}
                        setReplyOnMessage={setReplyOnMessage}
                        toggleReaction={toggleReaction}
                        forwardMessage={forwardMessage}
                        editingMessage={editingMessage}
                        setEditingMessage={setEditingMessage}
                        selectedMessage={selectedMessage}
                        roomType={roomType}
                        leading={leading}
                        getMessageRef={getMessageRef}
                        selectedChannel={selectedChannel}
                        onlineUsers={onlineUsers}
                      />
                    )}
                    {roomType !== "news" && (
                      <>
                        {message?.node?.id ? (
                          <NodeLink
                            message={message}
                            membersInfo={selectedChannel.membersInfo}
                            openLinkedNode={openLinkedNode}
                            onlineUsers={onlineUsers}
                          />
                        ) : (
                          <MessageLeft
                            notebookRef={notebookRef}
                            nodeBookDispatch={nodeBookDispatch}
                            selectedMessage={selectedMessage}
                            message={message}
                            toggleEmojiPicker={toggleEmojiPicker}
                            toggleReaction={toggleReaction}
                            membersInfo={selectedChannel.membersInfo}
                            forwardMessage={forwardMessage}
                            replyOnMessage={replyOnMessage}
                            setReplyOnMessage={setReplyOnMessage}
                            channelUsers={channelUsers}
                            user={user}
                            db={db}
                            editingMessage={editingMessage}
                            setEditingMessage={setEditingMessage}
                            roomType={roomType}
                            leading={leading}
                            getMessageRef={getMessageRef}
                            selectedChannel={selectedChannel}
                            setMessages={setMessages}
                            onlineUsers={onlineUsers}
                          />
                        )}
                      </>
                    )}
                  </Box>
                ))}
                <Box ref={scrolling}></Box>
              </Box>
            );
          })}
        </Box>
      )}

      {(leading || replyOnMessage || roomType !== "news") && (
        <Box
          sx={{
            position: "fixed",
            bottom: "10px",
            mt: "15px",
            zIndex: 99,
            width: { xs: `${window.innerWidth - 30}px`, sm: `${sidebarWidth - 32}px` },
          }}
        >
          <Paper>
            {replyOnMessage && (
              <Reply
                message={{ ...replyOnMessage, sender: selectedChannel.membersInfo[replyOnMessage.sender].fullname }}
                close={() => setReplyOnMessage(null)}
                sx={{ py: "5px", mb: "5px" }}
              />
            )}
          </Paper>
          <MessageInput
            notebookRef={notebookRef}
            nodeBookDispatch={nodeBookDispatch}
            theme={theme}
            setReplyOnMessage={setReplyOnMessage}
            getMessageRef={getMessageRef}
            channelUsers={channelUsers}
            placeholder="Type message here ...."
            toggleEmojiPicker={toggleEmojiPicker}
            roomType={roomType}
            leading={leading}
            db={db}
            messages={messages}
            scrollToBottom={scrollToBottom}
            selectedChannel={selectedChannel}
            user={user}
            replyOnMessage={replyOnMessage}
            setMessages={setMessages}
          />
        </Box>
      )}
    </Box>
  );
};

const synchronizationMessages = (prevMessages: (IChannelMessage & { id: string })[], messageChange: any) => {
  const docType = messageChange.type;
  const curData = messageChange.data as IChannelMessage & { id: string };

  const messageIdx = prevMessages.findIndex((m: IChannelMessage & { id: string }) => m.id === curData.id);
  if (docType === "added" && messageIdx === -1 && !curData.deleted) {
    prevMessages.push({ ...curData, doc: messageChange.doc });
  }
  if (docType === "modified" && messageIdx !== -1 && !curData.deleted) {
    prevMessages[messageIdx] = { ...curData, doc: messageChange.doc };
  }

  if (curData.deleted && messageIdx !== -1) {
    prevMessages.splice(messageIdx, 1);
  }
  prevMessages.sort((a, b) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime());
  return prevMessages;
};
