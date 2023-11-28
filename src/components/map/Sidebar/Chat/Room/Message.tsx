import AddIcon from "@mui/icons-material/Add";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import CollectionsIcon from "@mui/icons-material/Collections";
import { Button, IconButton } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Mention,MentionsInput } from "react-mentions";
import { UserTheme } from "src/knowledgeTypes";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { MessageLeft } from "./MessageLeft";
import { NewsCard } from "./NewsCard";
//import { MessageRight } from "./MessageRight";
import { NodeLink } from "./NodeLink";
import { UsersTag } from "./UsersTag";

dayjs.extend(relativeTime);
type MessageProps = {
  roomType: string;
  theme: UserTheme;
};

const userList = [
  {
    id: 1,
    display: "John Doe",
    image: "https://img.freepik.com/free-photo/cardano-blockchain-platform_23-2150411956.jpg",
  },
  {
    id: 2,
    display: "Jane Smith",
    image: "https://img.freepik.com/free-photo/cardano-blockchain-platform_23-2150411956.jpg",
  },
  {
    id: 3,
    display: "Alice Johnson",
    image: "https://img.freepik.com/free-photo/cardano-blockchain-platform_23-2150411956.jpg",
  },
];

export const Message = ({ roomType, theme }: MessageProps) => {
  const [messages, setMessages] = useState<any>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [reactionsMap, setReactionsMap] = useState<{ [key: string]: string[] }>({});
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const messageBoxRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<{
    messageId: string | null;
  }>({
    messageId: null,
  });

  const handleEmojiClick = useCallback(
    (emojiObject: EmojiClickData) => {
      const messageId = messageRef.current.messageId;
      if (messageId) {
        toggleReaction(messageId, emojiObject.emoji);
      } else {
        setInputValue(prevValue => prevValue + emojiObject.emoji);
      }
    },
    [showEmojiPicker, reactionsMap]
  );

  const toggleEmojiPicker = (event: any, messageId?: string) => {
    messageRef.current.messageId = messageId || null;
    const buttonRect = event.target.getBoundingClientRect();
    const parentDivRect = messageBoxRef?.current?.getBoundingClientRect();
    let newPosition = {
      top: buttonRect.bottom + window.scrollY,
      left: buttonRect.left + window.scrollX,
    };

    newPosition.left = Math.min(newPosition.left, (parentDivRect?.right || 0) - window.scrollX - 350);

    newPosition.top = Math.min(newPosition.top, (parentDivRect?.bottom || 0) - window.scrollY - 450) - 75;

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

  useEffect(() => {
    setMessages([
      {
        id: "1",
        message: "Hey Olivia, can you please review the latest node when you can?",
        sender: "Haroon",
        createdAt: "11:34 am",
      },
      {
        id: "2",
        message: "Hey Olivia, can you please review the latest node when you can?",
        sender: "You",
        createdAt: "11:34 am",
      },
      {
        id: "3",
        message: "Hey Olivia, can you please review the latest node when you can?",
        sender: "Haroon",
        createdAt: "11:34 am",
      },
      {
        id: "4",
        message: "Hey Olivia, can you please review the latest node when you can?",
        sender: "You",
        createdAt: "11:34 am",
      },
      {
        id: "5",
        message: "Hey Olivia, can you please review the latest node when you can?",
        sender: "Haroon",
        createdAt: "11:34 am",
      },
      {
        id: "6",
        message: "Hey Olivia, can you please review the latest node when you can?",
        sender: "You",
        createdAt: "11:34 am",
      },
    ]);
  }, []);

  const sendMessage = useCallback(() => {
    setMessages([
      ...messages,
      {
        id: "132131313",
        message: inputValue,
        sender: "You",
        createdAt: "11:34 am",
      },
    ]);
    setInputValue("");
  }, [inputValue, messages]);

  return (
    <Box ref={messageBoxRef} sx={{ display: "flex", flexDirection: "column", gap: "4px", p: "10px" }}>
      <Box
        sx={{
          height: roomType !== "news" ? "666px" : "777px",
        }}
      >
        <Box
          className="messages-room"
          sx={{
            height: "100%",
            overflow: "auto",
            borderBottom: "solid 1px grey",
            pb: "10px",
            paddingTop: roomType === "news" ? "20px" : undefined,
          }}
        >
          {messages.map((message: any) => (
            <Box key={message.id}>
              {roomType === "news" && (
                <NewsCard
                  tag="1cademy"
                  image="https://img.freepik.com/free-photo/cardano-blockchain-platform_23-2150411956.jpg"
                  text={
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                  }
                  heading="Card Test Heading"
                />
              )}
              {roomType !== "news" &&
                (message.sender !== "You" ? (
                  <MessageLeft
                    message={message}
                    reactionsMap={reactionsMap}
                    setReactionsMap={setReactionsMap}
                    toggleEmojiPicker={toggleEmojiPicker}
                    toggleReaction={toggleReaction}
                  />
                ) : (
                  <NodeLink message={message} reactionsMap={reactionsMap} />
                ))}
            </Box>
          ))}
        </Box>
        {roomType !== "news" && (
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
                  maxHeight: "50px",
                  overFlow: "hidden",
                },
                input: {
                  fontSize: 16,
                  border: "none",
                  outline: "none",
                  width: "100%",
                  color: theme === "Dark" ? DESIGN_SYSTEM_COLORS.gray200 : DESIGN_SYSTEM_COLORS.gray700,
                  padding: "8px",
                  maxHeight: "50px",
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
            >
              <Mention
                trigger="@"
                data={userList}
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
                  <EmojiPicker onEmojiClick={handleEmojiClick} lazyLoadEmojis={true} />
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

            {/* <InputBase
              id="message-chat"
              multiline={true}
              fullWidth
              placeholder="Type your message here..."
              autoComplete={"off"}
              value={inputValue}
              onChange={handleInputChange}
              sx={{
                p: "14px 14px",
                fontSize: "14px",
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
                color: theme =>
                  theme.palette.mode === "dark"
                    ? DESIGN_SYSTEM_COLORS.baseWhite
                    : DESIGN_SYSTEM_COLORS.notebookMainBlack,
                "::placeholder": {
                  color: DESIGN_SYSTEM_COLORS.gray500,
                },
              }}
              inputProps={{
                style: {
                  maxHeight: "60px",
                  overflow: "auto",
                },
              }}
            />
           
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
                <IconButton>
                  <AttachFileIcon />
                </IconButton>
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
            {showSuggestions && (
              <div className="suggestions-container">
                <UsersTag users={filteredUsers} handleUserSelection={handleUserSelection} />
              </div>
            )} */}
          </Box>
        )}
      </Box>
    </Box>
  );
};
