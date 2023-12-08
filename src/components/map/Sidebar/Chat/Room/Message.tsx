import { Divider } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { collection, doc, getFirestore, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { IChannelMessage } from "src/chatTypes";
import { getChannelMesasgesSnapshot } from "src/client/firestore/channelMessages.firesrtore";
//import { IChannelMessage } from "src/chatTypes";
//import { getChannelMesasgesSnapshot } from "src/client/firestore/channelMessages.firesrtore";
import { UserTheme } from "src/knowledgeTypes";

import { Forward } from "../List/Forward";
//import { Reply } from "./Reply";
// import { MessageRight } from "./MessageRight";
// import { NodeLink } from "./NodeLink";
import { MessageInput } from "./MessageInput";
import { MessageLeft } from "./MessageLeft";
import { NewsCard } from "./NewsCard";
// import { DirectMessagesList } from "../List/Direct";
// import { Forward } from "../List/Forward";

dayjs.extend(relativeTime);
type MessageProps = {
  roomType: string;
  theme: UserTheme;
  selectedChannel: any;
  user: any;
  reactionsMap: { [key: string]: string[] };
  setReactionsMap: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
  toggleEmojiPicker: (event: any, messageId?: string) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
  setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>;
  messageBoxRef: any;
  messageRef: any;
  position: { top: number; left: number };
  setPosition: React.Dispatch<React.SetStateAction<{ top: number; left: number }>>;
};

export const Message = ({
  roomType,
  theme,
  selectedChannel,
  user,
  reactionsMap,
  setReactionsMap,
  toggleEmojiPicker,
  toggleReaction,
  messageBoxRef,
}: MessageProps) => {
  const [messages, setMessages] = useState<any>([]);
  const [forward, setForward] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<{ id: string | null; message: string | null } | {}>({});
  const [inputValue, setInputValue] = useState<string>("");

  const [reply, setReply] = useState<boolean>(false);
  const [channelUsers, setChannelUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loadMore, setLoadMore] = useState<boolean>(false);
  const [messagesByDate, setMessagesByDate] = useState<any>({});
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
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
          const options: any = { weekday: "long", month: "long", day: "numeric" };
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

  const replyMessage = (message: any) => {
    setSelectedMessage(message);
    setReply(!reply);
  };

  // const scroll = () => {
  //   if (messageBoxRef.current && messages.length > 2) {
  //     messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
  //   }
  // };

  const sendMessage = useCallback(async () => {
    try {
      if (!inputValue.trim()) return;
      let channelRef = doc(db, "channelMessages", selectedChannel?.id);
      if (roomType === "direct") {
        channelRef = doc(db, "conversationMessages", selectedChannel?.id);
      }
      const messageRef = doc(collection(channelRef, "messages"));

      await setDoc(messageRef, {
        pinned: false,
        read_by: [],
        edited: true,
        message: inputValue,
        node: {},
        createdAt: new Date(),
        replies: [],
        sender: user.uname,
        mentions: [],
        imageUrl: user.imageUrl,
        editedAt: new Date(),
        reactions: [],
        channelId: selectedChannel?.id,
      });
      scrollToBottom();
    } catch (error) {
      console.error(error);
    }

    setInputValue("");
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

      // const currentDate = new Date();
      // const previousDate = new Date(currentDate);
      // previousDate.setDate(currentDate.getDate() - 1);
      // const _previosDate = new Date(currentDate);
      // _previosDate.setDate(currentDate.getDate() - 3);
      // const messages = [
      //   {
      //     id: "1",
      //     imageUrl:
      //       "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FJqxTY6ZE08dudguFF0KDPqbkoZt2%2FWed%2C%2018%20Jan%202023%2022%3A14%3A06%20GMT_430x1300.jpeg?alt=media&token=9ef2b4e0-1d78-483a-ae3d-79c2007dfb31",
      //     message: "Hey Olivia, can you please review the latest node when you can?",
      //     replies: [
      //       {
      //         id: "5",
      //         message: "Hey Olivia, can you please review the latest node when you can?",
      //         sender: "1man",
      //         createdAt: Timestamp.fromDate(new Date()),
      //       },
      //       {
      //         id: "6",
      //         message: "Hey Olivia, can you please review the latest node when you can?",
      //         sender: "Sam",
      //         createdAt: Timestamp.fromDate(new Date()),
      //       },
      //     ],
      //     sender: "Haroon",
      //     createdAt: Timestamp.fromDate(new Date()),
      //   },
      //   {
      //     id: "2",
      //     message: "Hey Olivia, can you please review the latest node when you can?",
      //     sender: "You",
      //     createdAt: Timestamp.fromDate(new Date()),
      //   },
      //   {
      //     id: "3",
      //     imageUrl:
      //       "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FJqxTY6ZE08dudguFF0KDPqbkoZt2%2FWed%2C%2018%20Jan%202023%2022%3A14%3A06%20GMT_430x1300.jpeg?alt=media&token=9ef2b4e0-1d78-483a-ae3d-79c2007dfb31",
      //     message: "Hey Olivia, can you please review the latest node when you can?",
      //     sender: "Haroon",
      //     createdAt: Timestamp.fromDate(previousDate),
      //   },
      //   {
      //     id: "4",
      //     message: "Hey Olivia, can you please review the latest node when you can?",
      //     sender: "You",
      //     createdAt: Timestamp.fromDate(previousDate),
      //   },
      //   {
      //     id: "5",
      //     imageUrl:
      //       "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FJqxTY6ZE08dudguFF0KDPqbkoZt2%2FWed%2C%2018%20Jan%202023%2022%3A14%3A06%20GMT_430x1300.jpeg?alt=media&token=9ef2b4e0-1d78-483a-ae3d-79c2007dfb31",
      //     message: "Hey Olivia, can you please review the latest node when you can?",
      //     sender: "Haroon",
      //     createdAt: Timestamp.fromDate(_previosDate),
      //   },
      //   {
      //     id: "6",
      //     message: "Hey Olivia, can you please review the latest node when you can?",
      //     sender: "You",
      //     createdAt: Timestamp.fromDate(_previosDate),
      //   },
      // ];
      // setMessages(messages);
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
  }, [selectedChannel, db, loadMore]);

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      sendMessage();
    }
    if (event.key === "Enter") {
      event.preventDefault();
      setInputValue(prevMessage => prevMessage + "\n");
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
                  <>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Divider sx={{ borderColor: "#f99346", width: "30%" }} />
                      {date}
                      <Divider sx={{ borderColor: "#f99346", width: "30%" }} />
                    </Box>
                    {messagesByDate[date].map((message: any) => (
                      <Box key={message.id}>
                        {roomType === "news" && (
                          <NewsCard
                            tag="1cademy"
                            image={message.imageUrl}
                            text={
                              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                            }
                            heading="Card Test Heading"
                          />
                        )}
                        {roomType !== "news" && (
                          <MessageLeft
                            selectedMessage={selectedMessage}
                            message={message}
                            reply={reply}
                            reactionsMap={reactionsMap}
                            setReactionsMap={setReactionsMap}
                            toggleEmojiPicker={toggleEmojiPicker}
                            toggleReaction={toggleReaction}
                            membersInfo={selectedChannel.membersInfo}
                            forwardMessage={forwardMessage}
                            replyMessage={replyMessage}
                          />
                        )}
                      </Box>
                    ))}
                  </>
                );
              })}
            </Box>
          )}
        </Box>
        {roomType !== "news" && (
          <Box>
            {/* <Box
              sx={{
                display: showEmojiPicker ? "block" : "none",
                position: "absolute",
                top: position.top,
                left: position.left,
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
            </Box> */}
            <MessageInput
              theme={theme}
              channelUsers={channelUsers}
              sendMessage={sendMessage}
              setInputValue={setInputValue}
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
