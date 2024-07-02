//import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Typography } from "@mui/material";
import { addDoc, collection, doc, getFirestore, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { IComment } from "src/commentTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import OptimizedAvatar from "@/components/OptimizedAvatar";
import { useUploadImage } from "@/hooks/useUploadImage";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
//import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { isValidHttpUrl } from "@/lib/utils/utils";

import { NotFoundNotification } from "../Sidebar/SidebarV2/NotificationSidebar";
import CommentButtons from "./CommentButtons";
import CommentInput from "./CommentInput";

type CommentProps = {
  concept: any;
  user: any;
  confirmIt: any;
  comments: any;
  users: any;
  commentSidebarInfo: { type: string; id: string };
  sidebarWidth: number;
};

const Comment = ({ user, confirmIt, comments, users, commentSidebarInfo, sidebarWidth }: CommentProps) => {
  const db = getFirestore();
  const storage = getStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, percentageUploaded, uploadImage } = useUploadImage({
    storage,
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [replyImageUrls, setReplyImageUrls] = useState<string[]>([]);
  const [commentInput, setCommentInput] = useState<string>("");
  const [replyInput, setReplyInput] = useState<string>("");
  const [showReplies, setShowReplies] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editable, setEditable] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState<string | null>(null);
  const [replies, setReplies] = useState<IComment[]>([]);
  const [editableReply, setEditableReply] = useState<{
    commentId: string;
    replyIdx: number;
  } | null>(null);
  const [editReplyText, setEditReplyText] = useState<string | null>(null);
  const [isRecording] = useState<boolean>(false);
  const [recordingType] = useState<string | null>(null);
  const scrolling = useRef<any>();

  const uploadImageClicked = useCallback(() => {
    fileInputRef?.current?.click();
  }, [fileInputRef]);

  const onUploadImage = useCallback(
    (event: any, type: string) => {
      try {
        let bucket: string = process.env.NEXT_PUBLIC_STORAGE_BUCKET as string;
        if (isValidHttpUrl(bucket)) {
          const { hostname } = new URL(bucket);
          bucket = hostname;
        }
        const path = "https://storage.googleapis.com/" + bucket + `/nodes-comment-images/${user.uid}`;
        let imageFileName = new Date().toUTCString();
        uploadImage({ event, path, imageFileName }).then(
          (url: string) => {
            if (type === "comment") {
              setImageUrls((prev: string[]) => [...prev, url]);
            } else {
              setReplyImageUrls((prev: string[]) => [...prev, url]);
            }
          },
          (message: any) => {
            confirmIt(message, "ok", "");
          }
        );
      } catch (error) {
        confirmIt("Sorry, Your image could't get uploaded", "ok", "");
      }
    },
    [setImageUrls, setReplyImageUrls, user]
  );

  useEffect(() => {
    if (!showReplies) return;
    const commentRef = getCommentDocRef(commentSidebarInfo.type, showReplies);
    const replyRef = collection(commentRef, "replies");
    const q = query(replyRef, where("deleted", "==", false));
    const unsubscribe = onSnapshot(q, snapshot => {
      const repliesDocuments: any = snapshot.docs.map(doc => {
        const document = doc.data();
        return { ...document, id: doc.id };
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

  const addComment = async () => {
    if (!user?.uname) return;
    // setIsLoading(true);
    await addDoc(getCommentRef(commentSidebarInfo.type), {
      refId: commentSidebarInfo.id,
      text: commentInput,
      sender: user.uname,
      senderDetail: {
        uname: user.uname,
        fullname: user.fName + " " + user.lName,
        imageUrl: user.imageUrl,
        uid: user.userId,
      },
      imageUrls,
      edited: false,
      deleted: false,
      createdAt: new Date(),
    });
    setCommentInput("");
    //setIsLoading(false);
    setImageUrls([]);
    scrollToBottom();
  };

  const addReply = async (commentId: string) => {
    if (!user?.uname) return;
    setIsLoading(true);
    const replyText = replyInput;
    const reply = {
      text: replyText,
      sender: user.uname,
      senderDetail: {
        uname: user.uname,
        fullname: user.fName + " " + user.lName,
        imageUrl: user.imageUrl,
        uid: user.userId,
      },
      imageUrls: replyImageUrls,
      edited: false,
      deleted: false,
      createdAt: new Date(),
    };
    const commentRef = getCommentDocRef(commentSidebarInfo?.type, commentId);
    const replyRef = collection(commentRef, "replies");
    await addDoc(replyRef, reply);
    setReplyInput("");
    setIsLoading(false);
    setReplyImageUrls([]);
  };

  const editComment = async (commentId: string) => {
    const updatedText = editCommentText;
    if (updatedText !== null) {
      await updateDoc(getCommentDocRef(commentSidebarInfo?.type, commentId), {
        text: updatedText,
        edited: true,
        editedAt: new Date(),
      });
      setEditable(null);
      setEditCommentText(null);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (await confirmIt("Are you sure you want to delete this comment?", "Delete", "Keep")) {
      const commentRef = getCommentDocRef(commentSidebarInfo?.type, commentId);
      await updateDoc(commentRef, {
        deleted: true,
      });
    }
  };

  const editReply = async (commentId: string, replyId: string) => {
    const updatedText = editReplyText;
    if (updatedText !== null) {
      const commentRef = getCommentDocRef(commentSidebarInfo?.type, commentId);
      const replyRef = doc(commentRef, "replies", replyId);
      await updateDoc(replyRef, {
        text: updatedText,
        edited: true,
        editedAt: new Date(),
      });
      setEditableReply(null);
      setEditReplyText(null);
    }
  };

  const deleteReply = async (commentId: string, replyIndex: number) => {
    if (await confirmIt("Are you sure you want to delete this reply?", "Delete", "Keep")) {
      const updatedReplies = [...(comments.find((comment: any) => comment.id === commentId)?.replies || [])];
      updatedReplies.splice(replyIndex, 1);
      const commentRef = getCommentDocRef(commentSidebarInfo.type, commentId);
      await updateDoc(commentRef, {
        replies: updatedReplies,
      });
    }
  };

  const renderReplies = (commentId: string, replies: any) => {
    return replies.map((reply: any, index: number) => (
      <Box
        key={reply.text}
        sx={{
          display: "flex",
          gap: "10px",
          pt: 2,
        }}
      >
        <Box
          sx={{
            width: `40px`,
            height: `40px`,
            cursor: "pointer",
            transition: "all 0.2s 0s ease",
            background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
            borderRadius: "50%",
            "& > .user-image": {
              borderRadius: "50%",
              overflow: "hidden",
              width: "30px",
              height: "30px",
            },
            "@keyframes slidein": {
              from: {
                transform: "translateY(0%)",
              },
              to: {
                transform: "translateY(100%)",
              },
            },
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
          {editableReply?.commentId === commentId && editableReply?.replyIdx === index ? (
            <CommentInput
              fileInputRef={fileInputRef}
              isUploading={isUploading}
              percentageUploaded={percentageUploaded}
              uploadImageClicked={uploadImageClicked}
              onUploadImage={onUploadImage}
              type="reply"
              value={editReplyText || reply.text}
              setAction={setEditReplyText}
              onClose={() => {
                setEditableReply(null);
                setEditReplyText(null);
              }}
              onSubmit={() => editReply(commentId, index)}
              isLoading={isLoading}
              isEditing={true}
              isAuthenticated={!!user.uname}
              isRecording={isRecording}
              recordingType={recordingType}
              users={users}
              startListening={() => {}}
              stopListening={() => {}}
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
                      width={"200px"}
                      height={"200px"}
                      style={{ borderRadius: "8px" }}
                      src={imageUrl}
                      alt="news image"
                      key={imageUrl}
                    />
                  ))}
                </Box>
              </Box>
              {user.uname === reply.senderDetail.uname && (
                <CommentButtons
                  message={reply}
                  handleEditMessage={() => {
                    setEditableReply({
                      commentId: commentId,
                      replyIdx: index,
                    });
                    setEditReplyText(reply.text);
                  }}
                  handleDeleteMessage={() => deleteReply(commentId, index)}
                  user={user}
                  sx={{
                    background: "transparent",
                    position: "initial",
                    display: "flex",
                    justifyContent: "end",
                  }}
                />
              )}
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
                pt: 2,
              }}
            >
              <Box
                sx={{
                  width: `40px`,
                  height: `40px`,
                  cursor: "pointer",
                  transition: "all 0.2s 0s ease",
                  background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
                  borderRadius: "50%",
                  "& > .user-image": {
                    borderRadius: "50%",
                    overflow: "hidden",
                    width: "30px",
                    height: "30px",
                  },
                  "@keyframes slidein": {
                    from: {
                      transform: "translateY(0%)",
                    },
                    to: {
                      transform: "translateY(100%)",
                    },
                  },
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
                {editable === comment.id ? (
                  <CommentInput
                    fileInputRef={fileInputRef}
                    isUploading={isUploading}
                    percentageUploaded={percentageUploaded}
                    uploadImageClicked={uploadImageClicked}
                    onUploadImage={onUploadImage}
                    type="comment"
                    value={editCommentText || comment.text}
                    setAction={setEditCommentText}
                    onClose={() => {
                      setEditable(null);
                      setEditCommentText(null);
                    }}
                    onSubmit={() => editComment(comment.id)}
                    setImageUrls={setImageUrls}
                    isLoading={isLoading}
                    isEditing={true}
                    isAuthenticated={!!user.uname}
                    startListening={() => {}}
                    stopListening={() => {}}
                    isRecording={isRecording}
                    recordingType={recordingType}
                    users={users}
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
                    {user.uname === comment.senderDetail.uname && (
                      <CommentButtons
                        message={comment}
                        handleEditMessage={() => {
                          setEditable(comment.id);
                          setEditCommentText(comment.text);
                        }}
                        handleDeleteMessage={() => deleteComment(comment.id)}
                        user={user}
                        sx={{
                          background: "transparent",
                          bottom: "5px",
                          right: "10px",
                        }}
                      />
                    )}
                    <Button
                      onClick={() => setShowReplies(!showReplies ? comment.id : null)}
                      style={{ border: "none", fontSize: "14px" }}
                    >
                      {showReplies === comment.id ? "Hide" : comment?.replies?.length || null}{" "}
                      {comment?.replies?.length > 1 ? "Replies" : "Reply"}
                    </Button>
                  </Box>
                )}

                {showReplies === comment.id && (
                  <Box sx={{ mt: "10px" }}>
                    {renderReplies(comment.id, replies)}
                    <CommentInput
                      fileInputRef={fileInputRef}
                      isUploading={isUploading}
                      percentageUploaded={percentageUploaded}
                      uploadImageClicked={uploadImageClicked}
                      onUploadImage={onUploadImage}
                      type="reply"
                      message={comment}
                      value={replyInput}
                      setAction={setReplyInput}
                      onSubmit={() => addReply(comment.id)}
                      isLoading={isLoading}
                      imageUrls={replyImageUrls}
                      setImageUrls={setReplyImageUrls}
                      isAuthenticated={!!user.uname}
                      startListening={() => {}}
                      stopListening={() => {}}
                      isRecording={isRecording}
                      recordingType={recordingType}
                      users={users}
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
            height: "90vh",
            overflow: "auto",
            pb: "120px",
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
            fileInputRef={fileInputRef}
            isUploading={isUploading}
            percentageUploaded={percentageUploaded}
            uploadImageClicked={uploadImageClicked}
            onUploadImage={onUploadImage}
            type="comment"
            value={commentInput}
            setAction={setCommentInput}
            onSubmit={addComment}
            isLoading={isLoading}
            imageUrls={imageUrls}
            setImageUrls={setImageUrls}
            isAuthenticated={!!user.uname}
            startListening={() => {}}
            stopListening={() => {}}
            isRecording={isRecording}
            recordingType={recordingType}
            users={users}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Comment;
