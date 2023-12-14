import { Paper } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { arrayUnion, collection, doc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { IChannelMessage } from "src/chatTypes";
import { getChannelMesasgesSnapshot } from "src/client/firestore/channelMessages.firesrtore";
import { UserTheme } from "src/knowledgeTypes";

import { newId } from "@/lib/utils/newFirestoreId";

import { Forward } from "../List/Forward";
import { MessageInput } from "./MessageInput";
import { MessageLeft } from "./MessageLeft";
import { NewsCard } from "./NewsCard";
import { Reply } from "./Reply";
// import { NodeLink } from "./NodeLink";

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
  getMessageRef: any;
  leading: boolean;
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
  getMessageRef,
  leading,
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

  useEffect(() => {
    const sidebarContentElement = document.getElementById("chat-content");

    if (sidebarContentElement) {
      sidebarContentElement.scrollTop = sidebarContentElement.scrollHeight;
    }
  }, [inputValue]);

  const forwardMessage = (message: any) => {
    setSelectedMessage(message);
    setForward(true);
  };

  // const scroll = () => {
  //   if (messageBoxRef.current && messages.length > 2) {
  //     messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
  //   }
  // };

  const sendReplyOnMessage = async (
    curMessage: IChannelMessage,
    inputMessage: string,
    imageUrls: string[] = [],
    important = false
  ) => {
    try {
      const messageRef = getMessageRef(curMessage.id, curMessage?.channelId);
      setInputValue("");
      setReplyOnMessage(null);
      await updateDoc(messageRef, {
        replies: arrayUnion({
          id: newId(db),
          parentMessage: curMessage.id,
          pinned: false,
          read_by: [],
          edited: false,
          message: inputMessage,
          node: {},
          createdAt: new Date(),
          replies: [],
          sender: user.uname,
          mentions: [],
          imageUrls,
          editedAt: new Date(),
          reactions: [],
          channelId: selectedChannel?.id,
          important,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };
  const sendMessage = useCallback(
    async (imageUrls: string[], important = false) => {
      try {
        if (!inputValue.trim() && !imageUrls.length) return;
        if (!!replyOnMessage) {
          sendReplyOnMessage(replyOnMessage, inputValue, imageUrls);
          return;
        }
        setInputValue("");
        setLastVisible(null);
        let channelRef = doc(db, "channelMessages", selectedChannel?.id);
        if (roomType === "direct") {
          channelRef = doc(db, "conversationMessages", selectedChannel?.id);
        } else if (roomType === "news") {
          channelRef = doc(db, "announcementsMessages", selectedChannel?.id);
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
          imageUrls,
          reactions: [],
          channelId: selectedChannel?.id,
          important,
        };
        // await updateDoc(channelRef, {
        //   updatedAt: new Date(),
        // });
        await setDoc(messageRef, newMessage);
        scrollToBottom();
      } catch (error) {
        console.error(error);
      }
    },
    [inputValue, messages]
  );

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
    // const channelRef = doc(collection(db, "channels"), selectedChannel.id);
    // if (user.uname)
    //   await updateDoc(channelRef, {
    //     typing: arrayUnion(user.uname),
    //   });
    // setTimeout(async () => {
    //   await updateDoc(channelRef, {
    //     typing: [],
    //   });
    // }, 10000);
  };
  const saveMessageEdit = async (newMessage: string) => {
    if (!editingMessage?.channelId) return;
    if (editingMessage.parentMessage) {
      const parentMessage = messages.find((m: IChannelMessage) => m.id === editingMessage.parentMessage);
      const replyIdx = parentMessage.replies.findIndex((r: IChannelMessage) => r.id === editingMessage.id);
      parentMessage.replies[replyIdx] = {
        ...parentMessage.replies[replyIdx],
        message: newMessage,
        edited: true,
        editedAt: new Date(),
      };
      const messageRef = getMessageRef(editingMessage.parentMessage, editingMessage.channelId);
      await updateDoc(messageRef, {
        replies: parentMessage.replies,
      });
    } else {
      const messageRef = getMessageRef(editingMessage.id, editingMessage.channelId);

      await updateDoc(messageRef, {
        message: newMessage,
        edited: true,
        editedAt: new Date(),
      });
    }
    setEditingMessage(null);
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
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Paper
                        sx={{
                          alignItems: "center",
                          borderRadius: "15px",
                          padding: "10px",
                          fontSize: "12px",
                          p: 1,
                          backgroundColor: "grey",
                          mt: "7px",
                        }}
                      >
                        {date}
                      </Paper>
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
                            setReplyOnMessage={setReplyOnMessage}
                            toggleReaction={toggleReaction}
                            forwardMessage={forwardMessage}
                            editingMessage={editingMessage}
                            setEditingMessage={setEditingMessage}
                            user={user}
                            selectedMessage={selectedMessage}
                            saveMessageEdit={saveMessageEdit}
                            db={db}
                            roomType={roomType}
                            leading={leading}
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
                            roomType={roomType}
                            leading={leading}
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

        <Box>
          {replyOnMessage && (
            <Reply
              message={{ ...replyOnMessage, sender: selectedChannel.membersInfo[replyOnMessage.sender].fullname }}
              close={() => setReplyOnMessage(null)}
            />
          )}
          {(leading || replyOnMessage || roomType !== "news") && (
            <MessageInput
              theme={theme}
              channelUsers={channelUsers}
              placeholder="Type message here ...."
              sendMessage={sendMessage}
              handleTyping={handleTyping}
              inputValue={inputValue}
              toggleEmojiPicker={toggleEmojiPicker}
              roomType={roomType}
              leading={leading}
            />
          )}
        </Box>
      </Box>
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
