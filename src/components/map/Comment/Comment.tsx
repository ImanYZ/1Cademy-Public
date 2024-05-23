//import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import { Box, Button, Typography } from "@mui/material";
import { addDoc, collection, deleteDoc, doc, getFirestore, updateDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import moment from "moment";
import React, { useCallback, useRef, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import { RiveComponentMemoized } from "@/components/home/components/temporals/RiveComponentExtended";
import MarkdownRender from "@/components/Markdown/MarkdownRender";
import OptimizedAvatar from "@/components/OptimizedAvatar";
import { useUploadImage } from "@/hooks/useUploadImage";
//import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { isValidHttpUrl } from "@/lib/utils/utils";

import CommentButtons from "./CommentButtons";
import CommentInput from "./CommentInput";

type CommentProps = {
  concept: any;
  user: any;
  confirmIt: any;
  comments: any;
  users: any;
};

const Comment = ({ user, concept, confirmIt, comments, users }: CommentProps) => {
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
        let bucket: string = process.env.FIREBASE_STORAGE_BUCKET as string;
        if (isValidHttpUrl(bucket)) {
          const { hostname } = new URL(bucket);
          bucket = hostname;
        }
        const path = "https://storage.googleapis.com/" + bucket + `/tutor-comment-images/${user.uid}`;
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

  const addComment = async () => {
    if (!user?.uname) return;
    setIsLoading(true);
    await addDoc(collection(db, "conceptCardComments"), {
      conceptId: concept.id,
      text: commentInput,
      user: {
        uname: user.uname,
        fullname: user.fullName,
        imageUrl: user.imageUrl,
        isInstructor: user.instructor,
      },
      imageUrls,
      createdAt: new Date(),
      replies: [],
    });
    setCommentInput("");
    setIsLoading(false);
    setImageUrls([]);
    scrollToBottom();
  };

  const addReply = async (commentId: string) => {
    if (!user?.uname) return;
    setIsLoading(true);
    const replyText = replyInput;
    const reply = {
      text: replyText,
      user: {
        uname: user.uname,
        fullname: user.fullName,
        imageUrl: user.imageUrl,
        isInstructor: user.instructor,
      },
      imageUrls: replyImageUrls,
      createdAt: new Date(),
    };
    const comment = comments.find((comment: any) => comment.id === commentId);
    const commentRef = doc(db, "conceptCardComments", commentId);
    await updateDoc(commentRef, {
      replies: [...(comment?.replies || []), reply],
    });

    setReplyInput("");
    setIsLoading(false);
    setReplyImageUrls([]);
  };

  const editComment = async (commentId: string) => {
    const updatedText = editCommentText;
    if (updatedText !== null) {
      await updateDoc(doc(db, "conceptCardComments", commentId), {
        text: updatedText,
        edited: true,
      });
      setEditable(null);
      setEditCommentText(null);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (await confirmIt("Are you sure you want to delete this comment?", "Delete", "Keep")) {
      await deleteDoc(doc(db, "conceptCardComments", commentId));
    }
  };

  const editReply = async (commentId: string, replyIndex: number) => {
    const updatedText = editReplyText;
    if (updatedText !== null) {
      const updatedReplies = [...(comments.find((comment: any) => comment.id === commentId)?.replies || [])];
      updatedReplies[replyIndex].text = updatedText;
      await updateDoc(doc(db, "conceptCardComments", commentId), {
        replies: updatedReplies,
      });
      setEditableReply(null);
      setEditReplyText(null);
    }
  };

  const deleteReply = async (commentId: string, replyIndex: number) => {
    if (await confirmIt("Are you sure you want to delete this reply?", "Delete", "Keep")) {
      const updatedReplies = [...(comments.find((comment: any) => comment.id === commentId)?.replies || [])];
      updatedReplies.splice(replyIndex, 1);
      await updateDoc(doc(db, "conceptCardComments", commentId), {
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
            name={reply.user?.fullname || ""}
            imageUrl={reply.user?.imageUrl || ""}
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
                {reply.user.fullname}
              </Typography>
              {reply.user.isInstructor && <SchoolIcon color="primary" sx={{ pl: "5px" }} />}
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
                border: reply.user.isInstructor ? "solid 2px orange" : undefined,
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
              {user.uname === reply.user.uname && (
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
                  name={comment.user?.fullname || ""}
                  imageUrl={comment.user?.imageUrl || ""}
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
                      {comment.user.fullname}
                    </Typography>
                    {comment.user.isInstructor && <SchoolIcon color="primary" sx={{ pl: "5px" }} />}
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
                      border: comment.user.isInstructor ? "solid 2px orange" : undefined,
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
                    {user.uname === comment.user.uname && (
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
                      {showReplies === comment.id ? "Hide" : comment.replies.length || null}{" "}
                      {comment.replies.length > 1 ? "Replies" : "Reply"}
                    </Button>
                  </Box>
                )}

                {showReplies === comment.id && (
                  <Box sx={{ mt: "10px" }}>
                    {renderReplies(comment.id, comment.replies)}
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
        height: "99vh",
        p: "10px",
        position: "relative",
        width: window.innerWidth / 3 + "px",
        borderRadius: "15px",
        overflow: "auto",
        listStyle: "none",
        transition: "box-shadow 0.3s",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "90%",
        }}
      >
        {/* <ConceptCard
          concept={concept}
          mode={mode}
          expanded={concept.id}
          handleOpenConcept={() => {}}
          sx={{ overflow: 'visible' }}
          cSx={{ height: '68px', overflowY: 'auto' }}
          showImagesAndVideos={false}
        /> */}
        <Box
          id="comments-section"
          sx={{
            height: "70vh",
            overflow: "auto",
            pb: "60px",
            mt: "160px",
          }}
        >
          {comments.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "40%",
              }}
            >
              <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
                <Box>
                  <Box
                    sx={{
                      width: { xs: "250px", sm: "300px" },
                      height: { xs: "150px", sm: "200px" },
                    }}
                  >
                    <RiveComponentMemoized
                      src={"/rive-assistant/notification.riv"}
                      animations={"Timeline 1"}
                      artboard="New Artboard"
                      autoplay={true}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </Box>
                </Box>
              </Box>
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
            width: window.innerWidth / 3 - 4,
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
