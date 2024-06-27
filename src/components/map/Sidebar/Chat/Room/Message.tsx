import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { IconButton, LinearProgress, Modal, Paper, Skeleton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
/* eslint-disable */
// @ts-ignore
import { MapInteractionCSS } from "react-map-interaction";
import { IChannelMessage } from "src/chatTypes";
import { getChannelMessagesSnapshot } from "src/client/firestore/channelMessages.firesrtore";
import { UserTheme } from "src/knowledgeTypes";

import { useNodeBook } from "@/context/NodeBookContext";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import { Post } from "@/lib/mapApi";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { createActionTrack } from "@/lib/utils/Map.utils";
import { newId } from "@/lib/utils/newFirestoreId";

import { NotFoundNotification } from "../../SidebarV2/NotificationSidebar";
import { AddMember } from "../List/AddMember";
import { Forward } from "../List/Forward";
import { MessageInput } from "./MessageInput";
import { MessageLeft } from "./MessageLeft";
import { NewsCard } from "./NewsCard";
import { NodeLink } from "./NodeLink";

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
  newMemberSection: any;
  setNewMemberSection: any;
  getChannelRef: any;
  isLoadingReaction: IChannelMessage | null;
  makeMessageUnread: (message: IChannelMessage) => void;
  scrollToMessage: (id: string, type?: string, delay?: number) => void;
  messageRefs: any;
  openDMChannel: (user2: any) => void;
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
  newMemberSection,
  setNewMemberSection,
  getChannelRef,
  isLoadingReaction,
  makeMessageUnread,
  scrollToMessage,
  messageRefs,
  openDMChannel,
}: MessageProps) => {
  const db = getFirestore();
  const { nodeBookState } = useNodeBook();
  const { confirmIt, ConfirmDialog } = useConfirmDialog();
  const [selectedMessage, setSelectedMessage] = useState<{ id: string | null; message: string | null } | {}>({});
  const [channelUsers, setChannelUsers] = useState([]);
  const [loadMore, setLoadMore] = useState<boolean>(false);
  const [messagesByDate, setMessagesByDate] = useState<any>({});
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [replyOnMessage, setReplyOnMessage] = useState<IChannelMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<IChannelMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState<IChannelMessage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openReplies, setOpenReplies] = useState<IChannelMessage | null>(null);
  const [replies, setReplies] = useState<IChannelMessage[]>([]);
  const [isRepliesLoaded, setIsRepliesLoaded] = useState<boolean>(true);
  const [openMedia, setOpenMedia] = useState<string | null>(null);
  const scrolling = useRef<any>();
  const unsubscribeRefs = useRef<any>([]);

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
    if (firstLoad) {
      setTimeout(() => {
        scrollToBottom();
      }, 500);
    }
    setIsLoading(false);
  }, [messages]);

  useEffect(() => {
    (async () => {
      if (nodeBookState?.chatNode) {
        const nodeRef = doc(db, "nodes", nodeBookState?.chatNode?.id);
        const nodeDoc = await getDoc(nodeRef);
        if (!nodeDoc.exists()) return null;
        const nodeData = nodeDoc.data();
        const messageNodeData = {
          id: nodeDoc.id,
          title: nodeData?.title,
          content: nodeData?.content,
        };
        if (!!replyOnMessage) {
          sendReplyOnMessage(replyOnMessage, "", [], false, messageNodeData);
        } else {
          sendMessage([], false, "", "", messageNodeData);
        }

        nodeBookDispatch({ type: "setChatNode", payload: null });
      }
    })();
  }, [nodeBookState?.chatNode]);

  useEffect(() => {
    if (!openReplies) return;
    setIsRepliesLoaded(false);
    const messageRef = getMessageRef(openReplies?.id, openReplies?.channelId);
    const replyRef = collection(messageRef, "replies");
    const q = query(replyRef, where("deleted", "==", false));
    const unsubscribe = onSnapshot(q, snapshot => {
      const repliesDocuments: any = snapshot.docs.map(doc => {
        const document = doc.data();
        return { ...document, id: doc.id };
      }) as IChannelMessage[];
      repliesDocuments.sort(
        (a: IChannelMessage, b: IChannelMessage) => a.createdAt.toMillis() - b.createdAt.toMillis()
      );
      setReplies(repliesDocuments);
      setIsRepliesLoaded(true);
    });
    return () => unsubscribe();
  }, [openReplies]);

  const forwardMessage = useCallback(
    (message: any) => {
      setSelectedMessage(message);
      setForward(true);
    },
    [setSelectedMessage, setForward]
  );

  // const scroll = () => {
  //     messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
  //   }
  //   if (messageBoxRef.current && messages.length > 2) {
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
    setIsLoading(true);
    const onSynchronize = (changes: any) => {
      setMessages((prev: any) => changes.reduce(synchronizationMessages, [...prev]));
      setTimeout(() => {
        setFirstLoad(false);
      }, 500);
    };
    const killSnapshot = getChannelMessagesSnapshot(
      db,
      { channelId: selectedChannel.id, lastVisible: null, roomType },
      onSynchronize
    );
    return () => killSnapshot();
  }, [db, selectedChannel?.id]);

  const scrollToBottom = () => {
    if (scrolling.current) {
      scrolling.current.scrollIntoView({ behaviour: "smooth" });
    }
  };

  useEffect(() => {
    const messageList: any = messageBoxRef.current;
    const handleScroll = () => {
      if (messageList.scrollTop === 0) {
        fetchOlderMessages();
      }
    };
    messageList?.addEventListener("scroll", handleScroll);
    return () => {
      messageList?.removeEventListener("scroll", handleScroll);
    };
  }, [messages, messageBoxRef.current]);

  useEffect(() => {
    if (!!openReplies) {
      scrollToMessage(openReplies?.id || "", "reply", 100);
    }
  }, [openReplies, replies]);

  useEffect(() => {
    return () => {
      unsubscribeRefs.current.forEach((unsubscribe: any) => unsubscribe());
    };
  }, []);

  const handleMentionUserOpenRoom = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, uname: string) => {
      event.preventDefault();
      const extractedUname = uname.split("/")[2];
      const user = selectedChannel?.membersInfo[extractedUname];
      openDMChannel(user);
    },
    [selectedChannel]
  );

  const fetchOlderMessages = () => {
    setLoadMore(true);
    const onSynchronize = (changes: any) => {
      setMessages((prev: any) => changes.reduce(synchronizationMessages, [...prev]));
      setLoadMore(false);
    };
    const killSnapshot = getChannelMessagesSnapshot(
      db,
      { channelId: selectedChannel.id, lastVisible: messages[0]?.doc, roomType },
      onSynchronize
    );
    unsubscribeRefs.current.push(killSnapshot);
  };

  const handleDeleteReply = async (curMessage: IChannelMessage, reply: IChannelMessage) => {
    if (
      await confirmIt(
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "10px",
          }}
        >
          <DeleteForeverIcon />
          <Typography sx={{ fontWeight: "bold" }}>Do you want to delete this message?</Typography>
          <Typography>Deleting a message will permanently remove it from this chat.</Typography>
        </Box>,
        "Delete Message",
        "Keep Message"
      )
    ) {
      setIsDeleting(reply);
      await Post("/chat/deleteReply/", { curMessage, reply, roomType });
      setIsDeleting(null);
    }
  };

  const handleDeleteMessage = async (message: IChannelMessage) => {
    if (
      await confirmIt(
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "10px",
          }}
        >
          <DeleteForeverIcon />
          <Typography sx={{ fontWeight: "bold" }}>Do you want to delete this message?</Typography>
          <Typography>Deleting a message will permanently remove it from this chat.</Typography>
        </Box>,
        "Delete Message",
        "Keep Message"
      )
    ) {
      let channelRef = doc(db, "channelMessages", message?.channelId);
      if (roomType === "direct") {
        channelRef = doc(db, "conversationMessages", message?.channelId);
      } else if (roomType === "news") {
        channelRef = doc(db, "announcementsMessages", message?.channelId);
      }
      const messageRef = doc(collection(channelRef, "messages"), message.id);
      await updateDoc(messageRef, {
        deleted: true,
      });
    }
  };

  const saveMessageEdit = async (newMessage: string, imageUrls: string[] = []) => {
    if (!editingMessage?.channelId) return;
    if (editingMessage.parentMessage) {
      // const parentMessage = messages.find((m: IChannelMessage) => m.id === editingMessage.parentMessage);
      // const replyIdx = parentMessage.replies.findIndex((r: IChannelMessage) => r.id === editingMessage.id);
      // parentMessage.replies[replyIdx] = {
      //   ...parentMessage.replies[replyIdx],
      //   message: newMessage,
      //   imageUrls,
      //   edited: true,
      //   editedAt: new Date(),
      // };
      const messageRef = getMessageRef(editingMessage.parentMessage, editingMessage.channelId);
      const replyRef = doc(messageRef, "replies", editingMessage?.id || "");
      await updateDoc(replyRef, {
        message: newMessage,
        imageUrls,
        edited: true,
        editedAt: new Date(),
      });
    } else {
      const messageRef = getMessageRef(editingMessage.id, editingMessage.channelId);
      await updateDoc(messageRef, {
        message: newMessage,
        imageUrls,
        edited: true,
        editedAt: new Date(),
      });
    }
    Post("/chat/sendNotification", {
      subject: "Edited by",
      newMessage: { ...editingMessage, message: newMessage },
      roomType,
    });
    createActionTrack(
      db,
      "MessageEdited",
      "",
      {
        fullname: `${user?.fName} ${user?.lName}`,
        chooseUname: !!user?.chooseUname,
        uname: String(user?.uname),
        imageUrl: String(user?.imageUrl),
      },
      "",
      [],
      user.email
    );
    setEditingMessage(null);
  };

  const sendReplyOnMessage = useCallback(
    async (
      curMessage: IChannelMessage | null,
      inputMessage: string,
      imageUrls: string[] = [],
      important = false,
      node = {}
    ) => {
      try {
        setReplyOnMessage(null);
        const replyId = newId(db);
        const reply = {
          id: replyId,
          parentMessage: curMessage?.id,
          pinned: false,
          read_by: [],
          unread_by: {},
          edited: false,
          message: inputMessage,
          node,
          createdAt: Timestamp.fromDate(new Date()),
          replies: [],
          sender: user.uname,
          mentions: [],
          imageUrls,
          editedAt: Timestamp.fromDate(new Date()),
          reactions: [],
          channelId: selectedChannel?.id,
          important,
          deleted: false,
        };
        setReplies((prevMessages: any) => {
          return [...prevMessages, reply];
        });
        scrollToMessage(curMessage?.id || "", "reply");

        const mRef = getMessageRef(curMessage?.id, selectedChannel?.id);
        const replyRef = collection(mRef, "replies");

        await addDoc(replyRef, reply);
        updateDoc(mRef, {
          totalReplies: (curMessage?.totalReplies || 0) + 1,
        });

        //await Post("/chat/replyOnMessage/", { reply, curMessage, action: "addReaction", roomType });
        await Post("/chat/sendNotification", {
          subject: "Replied from",
          newMessage: reply,
          roomType,
        });
        createActionTrack(
          db,
          "MessageReplied",
          "",
          {
            fullname: `${user?.fName} ${user?.lName}`,
            chooseUname: !!user?.chooseUname,
            uname: String(user?.uname),
            imageUrl: String(user?.imageUrl),
          },
          "",
          [],
          user.email
        );
      } catch (error) {
        console.error(error);
      }
    },
    [getMessageRef, editingMessage, setReplyOnMessage, updateDoc, newId, db, user.uname, selectedChannel?.id]
  );

  const sendMessage = useCallback(
    async (imageUrls: string[], important = false, sendMessageType: string, inputValue: string, node = {}) => {
      try {
        if (sendMessageType === "edit") {
          saveMessageEdit(inputValue, imageUrls);
        } else if (!!replyOnMessage || sendMessageType === "reply") {
          if (!inputValue.trim() && !imageUrls.length) return;
          sendReplyOnMessage(replyOnMessage, inputValue, imageUrls, important);
          return;
        } else {
          let channelRef = doc(db, "channelMessages", selectedChannel?.id);
          if (roomType === "direct") {
            channelRef = doc(db, "conversationMessages", selectedChannel?.id);
          } else if (roomType === "news") {
            channelRef = doc(db, "announcementsMessages", selectedChannel?.id);
          }
          const messageRef = collection(channelRef, "messages");
          const newMessage = {
            pinned: false,
            read_by: [],
            edited: false,
            message: inputValue,
            node,
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
          const docRef = await addDoc(messageRef, newMessage);

          scrollToBottom();
          await Post("/chat/sendNotification", {
            subject: "New Message from",
            newMessage: { ...newMessage, id: docRef.id },
            roomType,
          });
          createActionTrack(
            db,
            "MessageSent",
            "",
            {
              fullname: `${user?.fName} ${user?.lName}`,
              chooseUname: !!user?.chooseUname,
              uname: String(user?.uname),
              imageUrl: String(user?.imageUrl),
            },
            "",
            [],
            user.email
          );
        }
      } catch (error) {
        console.error(error);
      }
    },
    [messages, editingMessage, replyOnMessage]
  );

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
      {isLoading && (
        <Box>
          {Array.from(new Array(7)).map((_, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                p: 1,
              }}
            >
              <Skeleton
                variant="circular"
                width={50}
                height={50}
                sx={{
                  bgcolor: "grey.500",
                  borderRadius: "50%",
                }}
              />
              <Skeleton
                variant="rectangular"
                width={410}
                height={90}
                sx={{
                  bgcolor: "grey.300",
                  borderRadius: "0px 10px 10px 10px",
                  mt: "19px",
                  ml: "5px",
                }}
              />
            </Box>
          ))}
        </Box>
      )}
      {newMemberSection && (
        <Box sx={{ position: "relative", pt: "14px" }}>
          <AddMember
            db={db}
            user={user}
            onlineUsers={onlineUsers}
            selectedChannel={selectedChannel}
            getChannelRef={getChannelRef}
          />
          <IconButton
            onClick={() => setNewMemberSection(false)}
            sx={{ position: "absolute", right: "0px", top: "-10px" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}
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
          {loadMore && <LinearProgress sx={{ width: "100%" }} />}
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
                        messageRefs={messageRefs}
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
                        sendMessage={sendMessage}
                        sendReplyOnMessage={sendReplyOnMessage}
                        isLoadingReaction={isLoadingReaction}
                        makeMessageUnread={makeMessageUnread}
                        handleDeleteMessage={handleDeleteMessage}
                        handleDeleteReply={handleDeleteReply}
                        openReplies={openReplies}
                        setOpenReplies={setOpenReplies}
                        replies={replies}
                        setReplies={setReplies}
                        isRepliesLoaded={isRepliesLoaded}
                        setOpenMedia={setOpenMedia}
                        handleMentionUserOpenRoom={handleMentionUserOpenRoom}
                        openDMChannel={openDMChannel}
                      />
                    )}
                    {roomType !== "news" && (
                      <>
                        {message?.node?.id ? (
                          <NodeLink
                            db={db}
                            notebookRef={notebookRef}
                            messageRefs={messageRefs}
                            nodeBookDispatch={nodeBookDispatch}
                            replyOnMessage={replyOnMessage}
                            forwardMessage={forwardMessage}
                            user={user}
                            message={message}
                            membersInfo={selectedChannel.membersInfo}
                            openLinkedNode={openLinkedNode}
                            onlineUsers={onlineUsers}
                            toggleEmojiPicker={toggleEmojiPicker}
                            toggleReaction={toggleReaction}
                            roomType={roomType}
                            selectedChannel={selectedChannel}
                            channelUsers={channelUsers}
                            editingMessage={editingMessage}
                            setEditingMessage={setEditingMessage}
                            leading={leading}
                            getMessageRef={getMessageRef}
                            handleDeleteReply={handleDeleteReply}
                            isDeleting={isDeleting}
                            sendMessage={sendMessage}
                            sendReplyOnMessage={sendReplyOnMessage}
                            setReplyOnMessage={setReplyOnMessage}
                            setMessages={setMessages}
                            selectedMessage={selectedMessage}
                            handleDeleteMessage={handleDeleteMessage}
                            isLoadingReaction={isLoadingReaction}
                            makeMessageUnread={makeMessageUnread}
                            openReplies={openReplies}
                            setOpenReplies={setOpenReplies}
                            replies={replies}
                            setReplies={setReplies}
                            isRepliesLoaded={isRepliesLoaded}
                            setOpenMedia={setOpenMedia}
                            handleMentionUserOpenRoom={handleMentionUserOpenRoom}
                            openDMChannel={openDMChannel}
                          />
                        ) : (
                          <MessageLeft
                            type={"message"}
                            messageRefs={messageRefs}
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
                            openLinkedNode={openLinkedNode}
                            handleDeleteReply={handleDeleteReply}
                            handleDeleteMessage={handleDeleteMessage}
                            isDeleting={isDeleting}
                            sendMessage={sendMessage}
                            sendReplyOnMessage={sendReplyOnMessage}
                            isLoadingReaction={isLoadingReaction}
                            makeMessageUnread={makeMessageUnread}
                            openReplies={openReplies}
                            setOpenReplies={setOpenReplies}
                            replies={replies}
                            setReplies={setReplies}
                            isRepliesLoaded={isRepliesLoaded}
                            setOpenMedia={setOpenMedia}
                            handleMentionUserOpenRoom={handleMentionUserOpenRoom}
                            openDMChannel={openDMChannel}
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

      {!isLoading && (leading || replyOnMessage || roomType !== "news") && (
        <Box
          sx={{
            position: "fixed",
            bottom: "10px",
            mt: "15px",
            zIndex: 99,
            width: { xs: `${window.innerWidth - 30}px`, sm: `${sidebarWidth - 32}px` },
          }}
        >
          {/* {replyOnMessage && !replyOnMessage?.notVisible && (
            <Paper>
              <Reply
                message={{ ...replyOnMessage, sender: selectedChannel.membersInfo[replyOnMessage.sender].fullname }}
                close={() => setReplyOnMessage(null)}
                sx={{ py: "5px", mb: "5px" }}
              />
            </Paper>
          )} */}
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
            sendMessageType={"message"}
            sendMessage={sendMessage}
            sendReplyOnMessage={sendReplyOnMessage}
            setOpenMedia={setOpenMedia}
          />
        </Box>
      )}
      {ConfirmDialog}
      <Suspense fallback={<div></div>}>
        <Modal
          open={Boolean(openMedia)}
          onClose={() => setOpenMedia(null)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <>
            <CloseIcon
              sx={{ position: "absolute", top: "60px", right: "50px", zIndex: "99" }}
              onClick={() => setOpenMedia(null)}
            />
            <MapInteractionCSS>
              <Paper
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100vh",
                  width: "100vw",
                  background: "transparent",
                }}
              >
                {/* TODO: change to Next Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={openMedia || ""} alt="Node image" className="responsive-img" />
              </Paper>
            </MapInteractionCSS>
          </>
        </Modal>
      </Suspense>
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
