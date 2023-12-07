import AddIcon from "@mui/icons-material/Add";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import CollectionsIcon from "@mui/icons-material/Collections";
import { Button, Divider, IconButton } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { EmojiClickData } from "emoji-picker-react";
import { collection, doc, getFirestore, setDoc } from "firebase/firestore";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mention, MentionsInput } from "react-mentions";
import { IChannelMessage } from "src/chatTypes";
import { getChannelMesasgesSnapshot } from "src/client/firestore/channelMessages.firesrtore";
//import { IChannelMessage } from "src/chatTypes";
//import { getChannelMesasgesSnapshot } from "src/client/firestore/channelMessages.firesrtore";
import { UserTheme } from "src/knowledgeTypes";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { MessageLeft } from "./MessageLeft";
import { NewsCard } from "./NewsCard";
//import { Reply } from "./Reply";
// import { MessageRight } from "./MessageRight";
// import { NodeLink } from "./NodeLink";
import { UsersTag } from "./UsersTag";
// import { DirectMessagesList } from "../List/Direct";
// import { Forward } from "../List/Forward";
// Create a dynamically importable component
const DynamicMemoEmojiPicker = dynamic(() => import("../Common/EmojiPicker"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

dayjs.extend(relativeTime);
type MessageProps = {
  roomType: string;
  theme: UserTheme;
  selectedChannel: any;
  user: any;
};

export const Message = ({ roomType, theme, selectedChannel, user }: MessageProps) => {
  const [messages, setMessages] = useState<any>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [reactionsMap, setReactionsMap] = useState<{ [key: string]: string[] }>({});
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  //const [reply, setReply] = useState<{ id: string | null; message: string | null }>({ id: null, message: null });
  const [channelUsers, setChannelUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loadMore, setLoadMore] = useState<boolean>(false);
  const [messagesByDate, setMessagesByDate] = useState<any>({});
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const db = getFirestore();

  const messageBoxRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<{
    messageId: string | null;
  }>({
    messageId: null,
  });

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

  const handleEmojiClick = useCallback(
    (emojiObject: EmojiClickData) => {
      const messageId = messageRef.current.messageId;
      if (messageId) {
        toggleReaction(messageId, emojiObject.emoji);
      } else {
        setInputValue(prevValue => prevValue + emojiObject.emoji);
      }
      setShowEmojiPicker(false);
    },
    [reactionsMap]
  );

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
      newPosition.top = newPosition.top - 120;
    }
    setPosition(newPosition);
    setShowEmojiPicker(!showEmojiPicker);
  };

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
                        message={message}
                        reactionsMap={reactionsMap}
                        setReactionsMap={setReactionsMap}
                        toggleEmojiPicker={toggleEmojiPicker}
                        toggleReaction={toggleReaction}
                        membersInfo={selectedChannel.membersInfo}
                      />
                    )}
                  </Box>
                ))}
              </>
            );
          })}
        </Box>
        {roomType !== "news" && (
          <Box>
            <Box
              sx={{
                marginTop: "12px",
                border: theme =>
                  `solid 1px ${
                    theme.palette.mode === "light" ? DESIGN_SYSTEM_COLORS.gray300 : DESIGN_SYSTEM_COLORS.notebookG500
                  }`,
                borderRadius: "4px",
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
              }}
            >
              <MentionsInput
                placeholder="Type message here ...."
                style={{
                  control: {
                    fontSize: 16,
                    padding: "10px",
                    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
                    border: "none",
                    overFlow: "hidden",
                  },
                  input: {
                    fontSize: 16,
                    border: "none",
                    outline: "none",
                    width: "100%",
                    color: theme === "Dark" ? DESIGN_SYSTEM_COLORS.gray200 : DESIGN_SYSTEM_COLORS.gray700,
                    padding: "8px",
                    overFlow: "auto",
                  },
                  suggestions: {
                    list: {
                      background: theme === "Dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
                      padding: "2px",
                      fontSize: 16,
                      position: "absolute",
                      top: "-175px",
                      left: "-16px",
                      maxHeight: "150px",
                      overflowY: "auto",
                    },
                  },
                }}
                value={inputValue}
                singleLine={false}
                onChange={(e: any) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
              >
                <Mention
                  trigger="@"
                  data={channelUsers}
                  displayTransform={(id, display) => {
                    return `@${display}`;
                  }}
                  renderSuggestion={(suggestion: any) => <UsersTag user={suggestion} />}
                />
              </MentionsInput>
              <Box
                sx={{
                  width: "100%",
                  p: "0px 8px 8px 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconButton>
                    <AddIcon />
                  </IconButton>
                  <IconButton>
                    <CollectionsIcon />
                  </IconButton>
                  <IconButton onClick={toggleEmojiPicker}>
                    <AttachFileIcon />
                  </IconButton>

                  <Box
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
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  onClick={sendMessage}
                  sx={{
                    minWidth: "0px",
                    width: "36px",
                    height: "36px",
                    p: "10px",
                    borderRadius: "8px",
                  }}
                  disabled={!inputValue.trim()}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke={"white"}
                  >
                    <path
                      d="M7.74976 10.2501L16.4998 1.50014M7.85608 10.5235L10.0462 16.1552C10.2391 16.6513 10.3356 16.8994 10.4746 16.9718C10.5951 17.0346 10.7386 17.0347 10.8592 16.972C10.9983 16.8998 11.095 16.6518 11.2886 16.1559L16.7805 2.08281C16.9552 1.63516 17.0426 1.41133 16.9948 1.26831C16.9533 1.1441 16.8558 1.04663 16.7316 1.00514C16.5886 0.957356 16.3647 1.0447 15.9171 1.21939L1.84398 6.71134C1.34808 6.90486 1.10013 7.00163 1.02788 7.14071C0.965237 7.26129 0.965322 7.40483 1.0281 7.52533C1.10052 7.66433 1.34859 7.7608 1.84471 7.95373L7.47638 10.1438C7.57708 10.183 7.62744 10.2026 7.66984 10.2328C7.70742 10.2596 7.74028 10.2925 7.76709 10.3301C7.79734 10.3725 7.81692 10.4228 7.85608 10.5235Z"
                      stroke="inherit"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </Box>
            </Box>
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
