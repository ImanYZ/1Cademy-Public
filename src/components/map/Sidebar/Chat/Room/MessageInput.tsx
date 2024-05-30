import AddLinkIcon from "@mui/icons-material/AddLink";
import CloseIcon from "@mui/icons-material/Close";
import CollectionsIcon from "@mui/icons-material/Collections";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { Button, IconButton, Tooltip } from "@mui/material";
import { Box } from "@mui/system";
import { getStorage } from "firebase/storage";
import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mention, MentionsInput } from "react-mentions";
import { IChannelMessage } from "src/chatTypes";

import { useUploadImage } from "@/hooks/useUploadImage";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { isValidHttpUrl } from "@/lib/utils/utils";

import { UsersTag } from "./UsersTag";
type MessageInputProps = {
  notebookRef: any;
  nodeBookDispatch: any;
  db: any;
  theme: string;
  channelUsers: { id: string; display: string }[];
  toggleEmojiPicker: (event: any, message: IChannelMessage) => void;
  placeholder: string;
  editingMessage?: IChannelMessage;
  setEditingMessage?: any;
  roomType?: string;
  leading: boolean;
  getMessageRef: any;
  setReplyOnMessage: any;
  user: any;
  selectedChannel: any;
  replyOnMessage: any;
  messages?: any;
  scrollToBottom?: any;
  sendMessageType?: string;
  setMessages?: any;
  sendMessage: any;
  sendReplyOnMessage: any;
  parentMessage?: IChannelMessage;
};
export const MessageInput = ({
  notebookRef,
  nodeBookDispatch,
  theme,
  channelUsers,
  placeholder,
  editingMessage,
  setEditingMessage,
  leading,
  setReplyOnMessage,
  sendMessageType,
  sendMessage,
  parentMessage,
}: MessageInputProps) => {
  const storage = getStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, percentageUploaded, uploadImage } = useUploadImage({ storage });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [important, setImportant] = useState(false);

  useEffect(() => {
    if (editingMessage) {
      setInputValue(editingMessage.message);
    }
  }, [editingMessage]);

  // const sendReplyOnMessage = useCallback(
  //   async (
  //     curMessage: IChannelMessage,
  //     inputMessage: string,
  //     imageUrls: string[] = [],
  //     important = false,
  //     node = {}
  //   ) => {
  //     try {
  //       setInputValue("");
  //       setReplyOnMessage(null);
  //       const reply = {
  //         id: newId(db),
  //         parentMessage: curMessage.id,
  //         pinned: false,
  //         read_by: [],
  //         edited: false,
  //         message: inputMessage,
  //         node,
  //         createdAt: Timestamp.fromDate(new Date()),
  //         replies: [],
  //         sender: user.uname,
  //         mentions: [],
  //         imageUrls,
  //         editedAt: Timestamp.fromDate(new Date()),
  //         reactions: [],
  //         channelId: selectedChannel?.id,
  //         important,
  //       };
  //       setMessages((prevMessages: any) => {
  //         const messageIdx = prevMessages.findIndex((m: any) => m.id === curMessage.id);
  //         prevMessages[messageIdx].replies.push(reply);
  //         return prevMessages;
  //       });
  //       console.log(roomType, "roomType--roomType");
  //       await Post("/chat/replyOnMessage/", { reply, curMessage, action: "addReaction", roomType });
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   },
  //   [getMessageRef, setInputValue, setReplyOnMessage, updateDoc, arrayUnion, newId, db, user.uname, selectedChannel?.id]
  // );

  // const saveMessageEdit = async (newMessage: string) => {
  //   if (!editingMessage?.channelId) return;
  //   if (editingMessage.parentMessage) {
  //     const parentMessage = messages.find((m: IChannelMessage) => m.id === editingMessage.parentMessage);
  //     const replyIdx = parentMessage.replies.findIndex((r: IChannelMessage) => r.id === editingMessage.id);
  //     parentMessage.replies[replyIdx] = {
  //       ...parentMessage.replies[replyIdx],
  //       message: newMessage,
  //       edited: true,
  //       editedAt: new Date(),
  //     };
  //     const messageRef = getMessageRef(editingMessage.parentMessage, editingMessage.channelId);
  //     await updateDoc(messageRef, {
  //       replies: parentMessage.replies,
  //     });
  //   } else {
  //     const messageRef = getMessageRef(editingMessage.id, editingMessage.channelId);

  //     await updateDoc(messageRef, {
  //       message: newMessage,
  //       edited: true,
  //       editedAt: new Date(),
  //     });
  //   }
  //   setEditingMessage(null);
  // };

  // const sendMessage = useCallback(
  //   async (imageUrls: string[], important = false, inputValue: string, node = {}) => {
  //     try {
  //       if (sendMessageType === "edit") {
  //         saveMessageEdit(inputValue);
  //       } else if (!!replyOnMessage || sendMessageType === "reply") {
  //         if (!inputValue.trim() && !imageUrls.length) return;
  //         sendReplyOnMessage(replyOnMessage, inputValue, imageUrls);
  //         return;
  //       } else {
  //         //setLastVisible(null);
  //         let channelRef = doc(db, "channelMessages", selectedChannel?.id);
  //         if (roomType === "direct") {
  //           channelRef = doc(db, "conversationMessages", selectedChannel?.id);
  //         } else if (roomType === "news") {
  //           channelRef = doc(db, "announcementsMessages", selectedChannel?.id);
  //         }
  //         const messageRef = doc(collection(channelRef, "messages"));
  //         const newMessage = {
  //           pinned: false,
  //           read_by: [],
  //           edited: false,
  //           message: inputValue,
  //           node,
  //           createdAt: new Date(),
  //           replies: [],
  //           sender: user.uname,
  //           mentions: [],
  //           imageUrls,
  //           reactions: [],
  //           channelId: selectedChannel?.id,
  //           important,
  //         };
  //         console.log(messageRef, "messageRef--messageRef");
  //         // await updateDoc(channelRef, {
  //         //   updatedAt: new Date(),
  //         // });
  //         console.log(messageRef, "messageRef--messageRef");
  //         await setDoc(messageRef, newMessage);

  //         scrollToBottom();
  //         await Post("/chat/sendNotification", {
  //           newMessage,
  //           roomType,
  //         });
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   },
  //   [inputValue, messages]
  // );

  const cancel = useCallback(() => {
    setEditingMessage(null);
  }, [setEditingMessage]);

  const handleKeyPress = useCallback(
    (event: any) => {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [inputValue]
  );

  const handleTyping = useCallback(
    async (e: any) => {
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
    },
    [setInputValue]
  );
  const uploadImageClicked = useCallback(() => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  }, [fileInputRef]);
  const onUploadImage = useCallback(
    (event: any) => {
      let bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? "onecademy-dev.appspot.com";
      if (isValidHttpUrl(bucket)) {
        const { hostname } = new URL(bucket);
        bucket = hostname;
      }
      const path = "https://storage.googleapis.com/" + bucket + `/chat-images`;
      let imageFileName = new Date().toUTCString();
      uploadImage({ event, path, imageFileName }).then(url => {
        setImageUrls((prev: string[]) => [...prev, url]);
        if (!!parentMessage && sendMessageType === "reply") {
          setReplyOnMessage({ ...parentMessage, notVisible: true });
        }
      });
    },
    [setImageUrls]
  );

  const handleSendMessage = () => {
    sendMessage(imageUrls, important, sendMessageType, inputValue);
    setInputValue("");
    setImageUrls([]);
    setImportant(false);
  };

  const handleBlur = () => {
    if (!!parentMessage && sendMessageType === "reply") {
      setReplyOnMessage({ ...parentMessage, notVisible: true });
    }
  };

  const choosingNewLinkedNode = () => {
    notebookRef.current.choosingNode = { id: "", type: "Node", impact: "node" };
    notebookRef.current.selectedNode = "";
    notebookRef.current.chosenNode = null;
    nodeBookDispatch({ type: "setChoosingNode", payload: { id: "", type: "Node" } });
    nodeBookDispatch({ type: "setSelectedNode", payload: "" });
    nodeBookDispatch({ type: "setChosenNode", payload: null });
    if (!!parentMessage && sendMessageType === "reply") {
      setReplyOnMessage({ ...parentMessage, notVisible: true });
    }
  };

  return (
    <Box
      sx={{
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
        placeholder={placeholder}
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
            color: theme.toLowerCase() === "dark" ? DESIGN_SYSTEM_COLORS.orange100 : DESIGN_SYSTEM_COLORS.notebookG900,
            padding: "8px",
            overFlow: "auto",
          },
          suggestions: {
            list: {
              background:
                theme.toLowerCase() === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
              padding: "2px",
              fontSize: 16,
              position: "absolute",
              top: "-120px",
              left: "-16px",
              maxHeight: "150px",
              overflowY: "auto",
            },
          },
        }}
        value={inputValue}
        singleLine={false}
        onChange={handleTyping}
        onKeyDown={handleKeyPress}
        onFocus={handleBlur}
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
      <Box sx={{ display: "flex" }}>
        {imageUrls.map(imageUrl => (
          <Box
            key={imageUrl}
            sx={{
              display: "flex",
              p: 1,
              position: "relative",
              "&:hover .close-icon": {
                opacity: 1,
              },
            }}
          >
            <Tooltip title={"Remove Image"} placement="top">
              <CloseIcon
                className="close-icon"
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  zIndex: 1,
                  cursor: "pointer",
                  borderRadius: "50%",
                  opacity: 0,
                  transition: "opacity 0.3s",
                  backgroundColor: "grey",
                  height: "20px",
                  width: "20px",
                }}
                onClick={() => setImageUrls((prev: string[]) => prev.filter(image => image !== imageUrl))}
              />
            </Tooltip>

            <NextImage width={"90px"} height={"90px"} style={{ borderRadius: "8px" }} src={imageUrl} alt="" />
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          width: "100%",
          p: "0px 8px 8px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <input type="file" ref={fileInputRef} onChange={onUploadImage} hidden />
        {!editingMessage && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isUploading ? (
              <span style={{ width: "37px", fontSize: "11px", textAlign: "center" }}>{percentageUploaded + "%"}</span>
            ) : (
              <Tooltip title={"Upload Image"}>
                <IconButton onClick={uploadImageClicked}>
                  <CollectionsIcon />
                </IconButton>
              </Tooltip>
            )}
            {leading && (
              <Tooltip title={important ? "Unmark as Important" : "Mark as Important"}>
                <IconButton onClick={() => setImportant(prev => !prev)}>
                  <PriorityHighIcon sx={{ color: important ? "red" : "" }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={"Upload a node from notebook"}>
              <IconButton onClick={() => choosingNewLinkedNode()}>
                <AddLinkIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        {!editingMessage ? (
          <Button
            variant="contained"
            onClick={handleSendMessage}
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
        ) : (
          <Box sx={{ ml: "auto" }}>
            <Button
              variant="contained"
              onClick={cancel}
              sx={{
                minWidth: "0px",
                width: "80px",
                height: "30px",
                p: "10px",
                borderRadius: "8px",
                mr: "5px",
                backgroundColor: theme.toLowerCase() === "dark" ? "transparent" : DESIGN_SYSTEM_COLORS.notebookG400,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSendMessage}
              sx={{
                minWidth: "0px",
                width: "80px",
                height: "30px",
                p: "10px",
                borderRadius: "8px",
              }}
            >
              Save
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};
