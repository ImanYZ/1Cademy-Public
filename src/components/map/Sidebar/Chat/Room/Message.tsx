import { Divider } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { arrayUnion, collection, doc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { IChannelMessage } from "src/chatTypes";
import { getChannelMesasgesSnapshot } from "src/client/firestore/channelMessages.firesrtore";
//import { IChannelMessage } from "src/chatTypes";
//import { getChannelMesasgesSnapshot } from "src/client/firestore/channelMessages.firesrtore";
import { UserTheme } from "src/knowledgeTypes";

import { Forward } from "../List/Forward";
// import { MessageRight } from "./MessageRight";
// import { NodeLink } from "./NodeLink";
import { MessageInput } from "./MessageInput";
import { MessageLeft } from "./MessageLeft";
import { NewsCard } from "./NewsCard";
import { Reply } from "./Reply";
// import { DirectMessagesList } from "../List/Direct";
// import { Forward } from "../List/Forward";

dayjs.extend(relativeTime);
type MessageProps = {
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
};

export const Message = ({
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
}: MessageProps) => {
  const [selectedMessage, setSelectedMessage] = useState<{ id: string | null; message: string | null } | {}>({});
  const [inputValue, setInputValue] = useState<string>("");
  const [channelUsers, setChannelUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loadMore, setLoadMore] = useState<boolean>(false);
  const [messagesByDate, setMessagesByDate] = useState<any>({});
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [replyOnMessage, setReplyOnMessage] = useState<any>(null);
  const [editingMessage, setEditingMessage] = useState<IChannelMessage | null>(null);

  const db = getFirestore();

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

  const forwardMessage = (message: any) => {
    setSelectedMessage(message);
    setForward(true);
  };

  // const scroll = () => {
  //   if (messageBoxRef.current && messages.length > 2) {
  //     messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
  //   }
  // };

  const sendReplyOnMessage = async (curMessage: IChannelMessage, inputMessage: string) => {
    try {
      let channelRef = doc(db, "channelMessages", curMessage?.channelId);
      if (roomType === "direct") {
        channelRef = doc(db, "conversationMessages", curMessage?.channelId);
      }
      const messageRef = doc(collection(channelRef, "messages"), curMessage.id);
      setInputValue("");
      setReplyOnMessage(null);
      await updateDoc(messageRef, {
        replies: arrayUnion({
          messageId: curMessage.id,
          pinned: false,
          read_by: [],
          edited: true,
          message: inputMessage,
          node: {},
          createdAt: new Date(),
          replies: [],
          sender: user.uname,
          mentions: [],
          imageUrl: "",
          editedAt: new Date(),
          reactions: [],
          channelId: selectedChannel?.id,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };
  const sendMessage = useCallback(async () => {
    try {
      if (!inputValue.trim()) return;
      if (!!replyOnMessage) {
        sendReplyOnMessage(replyOnMessage, inputValue);
        return;
      }
      setInputValue("");
      setLastVisible(null);
      let channelRef = doc(db, "channelMessages", selectedChannel?.id);
      if (roomType === "direct") {
        channelRef = doc(db, "conversationMessages", selectedChannel?.id);
      }
      const messageRef = doc(collection(channelRef, "messages"));
      const newMessage = {
        pinned: false,
        read_by: [],
        edited: false,
        message: inputValue,
        node: {},
        createdAt: new Date(),
        replies: [],
        sender: user.uname,
        mentions: [],
        imageUrl: "",
        editedAt: new Date(),
        reactions: [],
        channelId: selectedChannel?.id,
      };
      await setDoc(messageRef, newMessage);
      scrollToBottom();
    } catch (error) {
      console.error(error);
    }
  }, [inputValue, messages]);

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
  }, [selectedChannel, db, loadMore, roomType]);

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      sendMessage();
    }
  };
  const scrollToBottom = () => {
    const messageList: any = messageBoxRef.current;
    if (messageList) {
      // Scroll to the bottom of the message list
      messageList.scrollTop = messageList.scrollHeight;
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
  const handleTyping = async (e: any) => {
    setInputValue(e.target.value);
    const channelRef = doc(collection(db, "channels"), selectedChannel.id);
    if (user.uname)
      await updateDoc(channelRef, {
        typing: arrayUnion(user.uname),
      });
    setTimeout(async () => {
      await updateDoc(channelRef, {
        typing: [],
      });
    }, 10000);
  };
  const saveMessageEdit = async (newMessage: string) => {
    if (!editingMessage?.channelId) return;
    let channelRef = doc(db, "channelMessages", editingMessage.channelId);
    if (roomType === "direct") {
      channelRef = doc(db, "conversationMessages", editingMessage.channelId);
    } else if (roomType === "news") {
      channelRef = doc(db, "announcementsMessages", editingMessage.channelId);
    }
    const messageRef = doc(collection(channelRef, "messages"), editingMessage.id);
    setEditingMessage(null);
    await updateDoc(messageRef, {
      message: newMessage,
      edited: true,
    });
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", pl: 3, pr: 3 }}>
      <Box
        sx={{
          height: roomType !== "news" ? "725px" : "777px",
        }}
      >
        <Box
          ref={messageBoxRef}
          className="messages-room"
          sx={{
            height: "100%",
            overflow: "auto",
            borderBottom: "solid 1px grey",
            paddingTop: roomType === "news" ? "20px" : undefined,
            pt: 3,
          }}
        >
          {forward ? (
            <Forward />
          ) : (
            <Box>
              {Object.keys(messagesByDate).map(date => {
                return (
                  <Box key={date}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Divider sx={{ borderColor: "#f99346", width: "30%" }} />
                      {date}
                      <Divider sx={{ borderColor: "#f99346", width: "30%" }} />
                    </Box>
                    {messagesByDate[date].map((message: any) => (
                      <Box key={message.id}>
                        {roomType === "news" && (
                          <NewsCard
                            message={message}
                            membersInfo={selectedChannel.membersInfo}
                            toggleEmojiPicker={toggleEmojiPicker}
                            channelUsers={channelUsers}
                            sendReplyOnMessage={sendReplyOnMessage}
                            toggleReaction={toggleReaction}
                            forwardMessage={forwardMessage}
                            editingMessage={editingMessage}
                            setEditingMessage={setEditingMessage}
                          />
                        )}
                        {roomType !== "news" && (
                          <MessageLeft
                            selectedMessage={selectedMessage}
                            message={message}
                            toggleEmojiPicker={toggleEmojiPicker}
                            toggleReaction={toggleReaction}
                            membersInfo={selectedChannel.membersInfo}
                            forwardMessage={forwardMessage}
                            setReplyOnMessage={setReplyOnMessage}
                            channelUsers={channelUsers}
                            sendReplyOnMessage={sendReplyOnMessage}
                            saveMessageEdit={saveMessageEdit}
                            user={user}
                            db={db}
                            editingMessage={editingMessage}
                            setEditingMessage={setEditingMessage}
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
        {roomType !== "news" && (
          <Box>
            {replyOnMessage && (
              <Reply
                message={{ ...replyOnMessage, sender: selectedChannel.membersInfo[replyOnMessage.sender].fullname }}
                close={() => setReplyOnMessage(null)}
              />
            )}
            <MessageInput
              theme={theme}
              channelUsers={channelUsers}
              placeholder="Type message here ...."
              sendMessage={sendMessage}
              handleTyping={handleTyping}
              handleKeyPress={handleKeyPress}
              inputValue={inputValue}
              toggleEmojiPicker={toggleEmojiPicker}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

const synchronizationMessages = (prevMessages: (IChannelMessage & { id: string })[], messageChange: any) => {
  const docType = messageChange.type;
  const curData = messageChange.data as IChannelMessage & { id: string };

  const messageIdx = prevMessages.findIndex((m: IChannelMessage & { id: string }) => m.id === curData.id);
  if (docType === "added" && messageIdx === -1) {
    prevMessages.push({ ...curData, doc: messageChange.doc });
  }
  if (docType === "modified" && messageIdx !== -1) {
    prevMessages[messageIdx] = { ...curData, doc: messageChange.doc };
  }

  if (curData.deleted && messageIdx !== -1) {
    prevMessages.splice(messageIdx);
  }
  prevMessages.sort((a, b) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime());
  return prevMessages;
};
