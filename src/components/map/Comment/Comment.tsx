//import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Divider, Popover, Typography } from "@mui/material";
import { EmojiClickData } from "emoji-picker-react";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getFirestore,
  increment,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import moment from "moment";
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { IComment } from "src/commentTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import OptimizedAvatar from "@/components/OptimizedAvatar";
import { Post } from "@/lib/mapApi";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

//import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { NotFoundNotification } from "../Sidebar/SidebarV2/NotificationSidebar";
import { CommentButtons } from "./CommentButtons";
import CommentInput from "./CommentInput";
import { Emoticons } from "./Emoticons";
import ProposalItem from "./ProposalItem";
const DynamicMemoEmojiPicker = dynamic(() => import("../Sidebar/Chat/Common/EmojiPicker"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

type CommentProps = {
  concept: any;
  user: any;
  confirmIt: any;
  comments: any;
  users: any;
  commentSidebarInfo: { type: string; id: string; proposal?: any };
  sidebarWidth: number;
  innerHeight: number;
  setComments: React.Dispatch<React.SetStateAction<IComment[]>>;
};

const Comment = ({
  user,
  confirmIt,
  comments,
  users,
  commentSidebarInfo,
  sidebarWidth,
  innerHeight,
  setComments,
}: CommentProps) => {
  const db = getFirestore();
  const [showReplies, setShowReplies] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editing, setEditing] = useState<IComment | null>(null);
  const [replies, setReplies] = useState<IComment[]>([]);
  const [isRecording] = useState<boolean>(false);
  const [recordingType] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const commentRef = useRef<{
    comment: IComment | null;
  }>({
    comment: null,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const openPicker = Boolean(anchorEl);
  const scrolling = useRef<any>();

  const toggleEmojiPicker = (event: any, comment?: IComment) => {
    commentRef.current.comment = comment || null;
    setAnchorEl(event.currentTarget);
    setShowEmojiPicker(!showEmojiPicker);
  };
  const handleCloseEmojiPicker = () => {
    setAnchorEl(null);
  };

  const handleEmojiClick = (emojiObject: EmojiClickData) => {
    const comment = commentRef.current.comment;
    if (comment) {
      toggleReaction(comment, emojiObject.emoji);
    }
    setShowEmojiPicker(false);
  };

  const addReaction = async (comment: IComment, emoji: string) => {
    if (!comment.id || !user?.uname) return;

    if (!comment.parentComment) {
      setComments((prevComments: any) => {
        const commentIdx = prevComments.findIndex((m: any) => m.id === comment.id);
        prevComments[commentIdx].reactions.push({ user: user?.uname, emoji });
        return prevComments;
      });
    }
    if (!comment.parentComment) {
      const mRef = getCommentDocRef(commentSidebarInfo.type, comment.id || "");
      await updateDoc(mRef, { reactions: arrayUnion({ user: user?.uname, emoji }) });
    } else {
      const cRef = getCommentDocRef(commentSidebarInfo.type, comment.parentComment);
      const replyRef = doc(cRef, "replies", comment?.id || "");
      await updateDoc(replyRef, { reactions: arrayUnion({ user: user?.uname, emoji }) });
    }
  };

  const removeReaction = async (comment: IComment, emoji: string) => {
    if (!comment.id) return;
    if (!comment.parentComment) {
      setComments((prevMessages: any) => {
        const messageIdx = prevMessages.findIndex((m: any) => m.id === comment.id);
        prevMessages[messageIdx].reactions = prevMessages[messageIdx].reactions.filter(
          (r: any) => r.emoji !== emoji && r.user !== user?.uname
        );
        return prevMessages;
      });
    }

    if (!comment.parentComment) {
      const cRef = getCommentDocRef(commentSidebarInfo.type, comment.id);
      await updateDoc(cRef, { reactions: arrayRemove({ user: user?.uname, emoji }) });
    } else {
      const cRef = getCommentDocRef(commentSidebarInfo.type, comment.parentComment);
      const replyRef = doc(cRef, "replies", comment?.id || "");
      await updateDoc(replyRef, { reactions: arrayRemove({ user: user?.uname, emoji }) });
    }
  };

  const toggleReaction = (comment: IComment, emoji: string) => {
    if (!comment?.id || !user?.uname) return;
    const reactionIdx = comment.reactions.findIndex(r => r.user === user?.uname && r.emoji === emoji);
    if (reactionIdx !== -1) {
      removeReaction(comment, emoji);
    } else {
      addReaction(comment, emoji);
    }
    setAnchorEl(null);
  };

  useEffect(() => {
    if (!showReplies) return;
    const commentRef = getCommentDocRef(commentSidebarInfo.type, showReplies);
    const replyRef = collection(commentRef, "replies");
    const q = query(replyRef, where("deleted", "==", false));
    const unsubscribe = onSnapshot(q, snapshot => {
      const repliesDocuments: any = snapshot.docs.map(doc => {
        const document = doc.data();
        return { ...document, parentComment: showReplies, id: doc.id };
      }) as IComment[];
      repliesDocuments.sort((a: IComment, b: IComment) => a.createdAt.toMillis() - b.createdAt.toMillis());
      setReplies(repliesDocuments);
    });
    return () => unsubscribe();
  }, [showReplies]);

  const getCommentRef = (commentType: string) => {
    let commentRef = collection(db, "versionComments");
    if (commentType === "node") {
      commentRef = collection(db, "nodeComments");
    }
    return commentRef;
  };
  const getCommentDocRef = (commentType: string, commentId: string) => {
    let commentRef = doc(db, "versionComments", commentId);
    if (commentType === "node") {
      commentRef = doc(db, "nodeComments", commentId);
    }
    return commentRef;
  };

  const addComment = async (text: string, imageUrls: string[]) => {
    if (!user?.uname) return;
    setIsLoading(true);
    const commentData = {
      refId: commentSidebarInfo.id,
      text: text,
      sender: user.uname,
      senderDetail: {
        uname: user.uname,
        fullname: user.fName + " " + user.lName,
        imageUrl: user.imageUrl,
        uid: user.userId,
      },
      imageUrls,
      reactions: [],
      edited: false,
      deleted: false,
      totalReplies: 0,
      createdAt: new Date(),
    };
    const docRef = await addDoc(getCommentRef(commentSidebarInfo.type), commentData);
    setIsLoading(false);
    Post("/comment/sendNotification", {
      subject: "Comment by",
      comment: { ...commentData, id: docRef.id },
      nodeId: commentSidebarInfo.type === "node" ? commentSidebarInfo.id : commentSidebarInfo.proposal.node,
    });
    scrollToBottom();
  };

  const addReply = async (text: string, imageUrls: string[], commentId: string) => {
    if (!user?.uname) return;
    setIsLoading(true);
    const reply = {
      text: text,
      sender: user.uname,
      senderDetail: {
        uname: user.uname,
        fullname: user.fName + " " + user.lName,
        imageUrl: user.imageUrl,
        uid: user.userId,
      },
      imageUrls: imageUrls,
      reactions: [],
      edited: false,
      deleted: false,
      createdAt: new Date(),
    };
    const commentRef = getCommentDocRef(commentSidebarInfo?.type, commentId);
    const replyRef = collection(commentRef, "replies");
    const docRef = await addDoc(replyRef, reply);
    await updateDoc(commentRef, {
      totalReplies: increment(1),
    });
    setIsLoading(false);
    Post("/comment/sendNotification", {
      subject: "Comment by",
      comment: { ...reply, id: docRef.id },
      nodeId: commentSidebarInfo.type === "node" ? commentSidebarInfo.id : commentSidebarInfo.proposal.node,
    });
  };

  const editComment = async (text: string, imageUrls: string[], commentId: string) => {
    await updateDoc(getCommentDocRef(commentSidebarInfo?.type, commentId), {
      text: text,
      imageUrls,
      edited: true,
      editedAt: new Date(),
    });
  };

  const deleteComment = async (commentId: string) => {
    if (await confirmIt("Are you sure you want to delete this comment?", "Delete", "Keep")) {
      const commentRef = getCommentDocRef(commentSidebarInfo?.type, commentId);
      await updateDoc(commentRef, {
        deleted: true,
      });
    }
  };

  const editReply = async (text: string, imageUrls: string[], commentId: string, replyId: string) => {
    const commentRef = getCommentDocRef(commentSidebarInfo?.type, commentId);
    const replyRef = doc(commentRef, "replies", replyId);
    await updateDoc(replyRef, {
      text: text,
      imageUrls,
      edited: true,
      editedAt: new Date(),
    });
  };

  const deleteReply = async (commentId: string, replyId: string) => {
    if (await confirmIt("Are you sure you want to delete this reply?", "Delete", "Keep")) {
      const commentRef = getCommentDocRef(commentSidebarInfo?.type, commentId);
      const replyRef = doc(commentRef, "replies", replyId);
      await updateDoc(replyRef, {
        deleted: true,
      });
      await updateDoc(commentRef, {
        totalReplies: increment(-1),
      });
    }
  };

  const renderReplies = (commentId: string, replies: any) => {
    return replies.map((reply: any, index: number) => (
      <Box
        key={index}
        sx={{
          display: "flex",
          gap: "10px",
          pt: 5,
        }}
      >
        <Box
          sx={{
            width: `40px`,
            height: `40px`,
            cursor: "pointer",
            borderRadius: "50%",
          }}
        >
          <OptimizedAvatar
            name={reply.senderDetail?.fullname || ""}
            imageUrl={reply.senderDetail?.imageUrl || ""}
            sx={{ border: "none" }}
          />
          <Box sx={{ background: "#12B76A", fontSize: "1px" }} className="UserStatusOnlineIcon" />
        </Box>

        <Box sx={{ width: "90%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex" }}>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: "500",
                  lineHeight: "24px",
                }}
              >
                {reply.senderDetail.fullname}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "12px" }}>
              {moment(reply.createdAt.toDate().getTime()).format("h:mm a")}
            </Typography>
          </Box>
          {editing?.parentComment === commentId && editing?.id === reply.id ? (
            <CommentInput
              comment={reply}
              user={user}
              type="reply"
              onClose={() => setEditing(null)}
              onSubmit={editReply}
              isLoading={isLoading}
              isEditing={true}
              isRecording={isRecording}
              recordingType={recordingType}
              users={users}
              startListening={() => {}}
              stopListening={() => {}}
              confirmIt={confirmIt}
              editing={editing}
              setEditing={setEditing}
            />
          ) : (
            <Box
              className="reply-box"
              sx={{
                position: "relative",
                fontSize: "16px",
                fontWeight: "400",
                lineHeight: "24px",
                p: "10px 14px",
                borderRadius: "9px",
                background: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray200,
              }}
            >
              <Box
                sx={{
                  fontSize: "16px",
                  fontWeight: "400",
                  lineHeight: "24px",
                }}
              >
                <MarkdownRender
                  text={reply.text}
                  sx={{
                    fontSize: "16px",
                    fontWeight: 400,
                    letterSpacing: "inherit",
                  }}
                />

                <Box
                  sx={{
                    pt: 1,
                    display: "flex",
                    gap: "15px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {(reply.imageUrls || []).map((imageUrl: string) => (
                    <img
                      width={"100%"}
                      style={{ borderRadius: "8px", objectFit: "contain" }}
                      src={imageUrl}
                      alt="reply image"
                      key={imageUrl}
                    />
                  ))}
                </Box>
              </Box>

              <Box className="message-buttons" sx={{ display: "none" }}>
                <CommentButtons
                  comment={reply}
                  handleEditMessage={() => setEditing(reply)}
                  handleDeleteMessage={() => deleteReply(commentId, reply.id)}
                  toggleEmojiPicker={toggleEmojiPicker}
                  user={user}
                />
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5px" }}>
                <Emoticons
                  comment={reply}
                  reactionsMap={reply.reactions}
                  toggleEmojiPicker={toggleEmojiPicker}
                  toggleReaction={toggleReaction}
                  user={user}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    ));
  };

  const scrollToBottom = () => {
    if (scrolling.current) {
      scrolling.current.scrollIntoView({ behaviour: "smooth" });
    }
  };
  const renderComments = () => {
    return (
      <TransitionGroup>
        {comments.map((comment: any) => (
          <CSSTransition key={comment.id} timeout={500} classNames="comment">
            <Box
              sx={{
                display: "flex",
                gap: "10px",
                pt: 5,
              }}
            >
              <Box
                sx={{
                  width: `40px`,
                  height: `40px`,
                  cursor: "pointer",
                  borderRadius: "50%",
                }}
              >
                <OptimizedAvatar
                  name={comment.senderDetail?.fullname || ""}
                  imageUrl={comment.senderDetail?.imageUrl || ""}
                  sx={{ border: "none" }}
                />
                <Box sx={{ background: "#12B76A", fontSize: "1px" }} className="UserStatusOnlineIcon" />
              </Box>

              <Box sx={{ width: "90%" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex" }}>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: "500",
                        lineHeight: "24px",
                      }}
                    >
                      {comment.senderDetail.fullname}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: "12px" }}>
                    {moment(comment.createdAt.toDate().getTime()).format("h:mm a")}
                  </Typography>
                </Box>
                {editing?.id === comment.id ? (
                  <CommentInput
                    comment={comment}
                    user={user}
                    type="comment"
                    onClose={() => setEditing(null)}
                    onSubmit={editComment}
                    isLoading={isLoading}
                    isEditing={true}
                    startListening={() => {}}
                    stopListening={() => {}}
                    isRecording={isRecording}
                    recordingType={recordingType}
                    users={users}
                    confirmIt={confirmIt}
                    editing={editing}
                    setEditing={setEditing}
                  />
                ) : (
                  <Box
                    className="reply-box"
                    sx={{
                      position: "relative",
                      fontSize: "16px",
                      fontWeight: "400",
                      lineHeight: "24px",
                      p: "10px 14px",
                      borderRadius: "9px",
                      background: theme =>
                        theme.palette.mode === "dark"
                          ? DESIGN_SYSTEM_COLORS.notebookG700
                          : DESIGN_SYSTEM_COLORS.gray200,
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: "16px",
                        fontWeight: "400",
                        lineHeight: "24px",
                      }}
                    >
                      <MarkdownRender
                        text={comment.text}
                        sx={{
                          fontSize: "16px",
                          fontWeight: 400,
                          letterSpacing: "inherit",
                        }}
                      />

                      <Box
                        sx={{
                          pt: 1,
                          display: "flex",
                          gap: "15px",
                          justifyContent: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        {(comment.imageUrls || []).map((imageUrl: string) => (
                          <img
                            width={"100%"}
                            style={{ borderRadius: "8px", objectFit: "contain" }}
                            src={imageUrl}
                            alt="comment image"
                            key={imageUrl}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Box className="message-buttons" sx={{ display: "none" }}>
                      <CommentButtons
                        comment={comment}
                        handleEditMessage={() => setEditing(comment)}
                        handleDeleteMessage={() => deleteComment(comment.id)}
                        toggleEmojiPicker={toggleEmojiPicker}
                        user={user}
                      />
                    </Box>

                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5px" }}>
                      <Emoticons
                        comment={comment}
                        reactionsMap={comment.reactions}
                        toggleEmojiPicker={toggleEmojiPicker}
                        toggleReaction={toggleReaction}
                        user={user}
                      />
                    </Box>

                    <Button
                      onClick={() => setShowReplies(!showReplies ? comment.id : null)}
                      style={{ border: "none", fontSize: "14px" }}
                    >
                      {showReplies === comment.id ? "Hide" : comment?.totalReplies || null}{" "}
                      {comment?.totalReplies > 1 ? "Replies" : "Reply"}
                    </Button>
                  </Box>
                )}

                {showReplies === comment.id && (
                  <Box sx={{ mt: "10px" }}>
                    {renderReplies(comment.id, replies)}
                    <CommentInput
                      user={user}
                      type="reply"
                      comment={comment}
                      onSubmit={addReply}
                      isLoading={isLoading}
                      startListening={() => {}}
                      stopListening={() => {}}
                      isRecording={isRecording}
                      recordingType={recordingType}
                      users={users}
                      confirmIt={confirmIt}
                      setEditing={setEditing}
                    />
                  </Box>
                )}
                <Box ref={scrolling}></Box>
              </Box>
            </Box>
          </CSSTransition>
        ))}
      </TransitionGroup>
    );
  };
  return (
    <Box
      sx={{
        p: "10px",
        position: "relative",
        borderRadius: "15px",
        listStyle: "none",
        transition: "box-shadow 0.3s",
      }}
    >
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
            theme={"dark"}
          />
        )}
      </Popover>
      {commentSidebarInfo.type === "version" && (
        <Box sx={{ width: sidebarWidth - 20, zIndex: 9999 }}>
          <ProposalItem
            proposal={commentSidebarInfo.proposal}
            showTitle={true}
            userVotesOnProposals={commentSidebarInfo.proposal.userVotesOnProposals}
          />
          <Divider sx={{ mt: 2 }} variant="fullWidth" />
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box
          id="comments-section"
          sx={{
            height: innerHeight - 200,
            overflow: "auto",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {comments.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NotFoundNotification title="Start Commenting" description="" />
            </Box>
          ) : (
            <Box>{renderComments()}</Box>
          )}
        </Box>
        <Box
          sx={{
            position: "fixed",
            bottom: "13px",
            mt: "15px",
            pr: "15px",
            width: sidebarWidth - 5,
          }}
        >
          <CommentInput
            user={user}
            type="comment"
            onSubmit={addComment}
            isLoading={isLoading}
            startListening={() => {}}
            stopListening={() => {}}
            isRecording={isRecording}
            recordingType={recordingType}
            users={users}
            confirmIt={confirmIt}
            setEditing={setEditing}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(Comment);
