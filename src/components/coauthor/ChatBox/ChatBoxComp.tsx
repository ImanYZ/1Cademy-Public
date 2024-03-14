import React, { useState, useRef, useEffect } from "react";
import { doc, updateDoc, collection, addDoc, onSnapshot, query, where, getFirestore } from "firebase/firestore";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import SchoolIcon from "@mui/icons-material/School";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import moment from "moment";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import ImproveItemComp from "../ImproveItemComp";
import OptimizedAvatar from "../OptimizedAvatar";
import MessageInput from "./MessageInput";
import MessageButtons from "./MessageButtons";
import { sendMessageToChatGPT } from "../../../services/openai";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { RiveComponentMemoized } from "@/components/home/components/temporals/RiveComponentExtended";
import { User } from "src/knowledgeTypes";

const mode: string = "dark";
interface Improvement {
  reasoning: string;
  action: string;
  sentence: string;
  new_sentence: string;
}

interface Props {
  theme: any;
  allContent: string;
  selectedArticle: any;
  articleTypePath: string[];
  recommendedSteps: string[];
  sideBarWidth: number;
  findScrollAndSelect: (text: string) => Promise<void> | Promise<HTMLElement>;
  user: User | null;
}

const ChatBoxComp: React.FC<Props> = ({
  theme,
  allContent,
  selectedArticle,
  articleTypePath,
  recommendedSteps,
  sideBarWidth,
  findScrollAndSelect,
  user,
}) => {
  const db = getFirestore();
  const [messages, setMessages] = useState<any>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [commentInput, setCommentInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editable, setEditable] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrolling = useRef<any>();

  // TO:DO : NEED TO CHANGE THE QUERY MESSAGES

  useEffect(() => {
    if (!selectedArticle?.id) return;
    const unsubscribe = onSnapshot(
      query(collection(db, "articleMessages"), where("articleId", "==", selectedArticle.id)),
      snapshot => {
        let messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any),
        }));
        messagesData = messagesData.filter(message => !message.deleted);
        messagesData.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
        setMessages(messagesData);
        const users: any = new Set();
        messagesData.forEach(c => {
          users.add(c.user.imageUrl);
        });
      }
    );
    return () => unsubscribe();
  }, [db, selectedArticle]);

  const getChatGPTResponse = async (toUpdate: boolean = false) => {
    const chatGPTMessages = [
      {
        role: "system",
        content: `You are our co-author on the following  ${articleTypePath.slice(2).reverse().join(" of ")}:
'''
${allContent}
'''
We're currently trying to do the following:
'''
${JSON.stringify(recommendedSteps)}
'''
Please respond to our conversation.
Depending on your response, you can also recommend improvements to this ${articleTypePath
          .slice(2)
          .reverse()
          .join(" of ")}.
You should always generate only a JSON response with the structure {'message': 'Your message as a response to the conversation', 'improvement': {...}}. 
The value of the field 'improvement' should be an object about only one of the sentences from our paper and have the following structure:
{
"reasoning": "Your reasoning for this improvement",
"action": Can take one of the values of 'delete', 'add', or 'modify',
"sentence": "If the action you suggest us is to delete a sentence, specify the 'sentence' that you want us to delete. If the action is to modify a sentence, it should take the exact sentence that you'd like to help us improve. If the action is to add a sentence, you should specify the previous sentence that we should add your suggested new sentence after this.",
"new_sentence": "If the action you suggest us is to delete a sentence, this field should be ''. If the action is modify a sentence, it should take the new sentence that you'd like us to write instead of the original sentence. If the action is add a sentence, it should take the new sentence."
}
If the value of the field 'improvement' is {}, it means that your response to the conversation does not accompany any recommended improvement.
`,
      },
    ];
    for (let message of messages) {
      chatGPTMessages.push({
        role: message.user.fullname === "1CoAuthor" ? "assistant" : "user",
        content:
          message.user.fullname === "1CoAuthor"
            ? message.text
            : `{"user": ${message.user.fullname}, "message": ${message.text}}`,
      });
    }
    if (toUpdate) {
      chatGPTMessages.push({
        role: "user",
        content: commentInput,
      });
    }

    let incompleteResponse = true;
    let parsedMessage = {
      message: "",
      improvement: {
        reasoning: "",
        action: "",
        sentence: "",
        new_sentence: "",
      },
    };
    while (incompleteResponse) {
      parsedMessage = await sendMessageToChatGPT(chatGPTMessages);
      if (parsedMessage.message.trim()) {
        if (!parsedMessage.hasOwnProperty("improvement") || Object.keys(parsedMessage.improvement).length === 0) {
          incompleteResponse = false;
        } else if ((parsedMessage.improvement as any).sentence?.trim()) {
          const matchedEl = await findScrollAndSelect((parsedMessage.improvement as any).sentence);
          if (matchedEl) {
            incompleteResponse = false;
          }
        }
      }
    }
    return parsedMessage;
  };

  const addComment = async () => {
    if (!user?.userId || commentInput.trim() === "") return;
    setIsLoading(true);
    const docRef = await addDoc(collection(db, "articleMessages"), {
      text: commentInput,
      user: {
        uid: user?.userId,
        fullname: user?.fName + " " + user?.lName,
        imageUrl: user?.imageUrl,
      },
      articleId: selectedArticle.id,
      createdAt: new Date(),
    });
    setCommentInput("");
    const parsedMessage = await getChatGPTResponse(true);
    addBotMessage(parsedMessage, docRef.id);
    //setImageUrls([])
    //scrollToBottom()
  };

  const addBotMessage = async (parsedMessage: { message: string; improvement: Improvement }, ref: string) => {
    if (!user?.userId) return;
    await addDoc(collection(db, "articleMessages"), {
      text: parsedMessage.message,
      improvement:
        parsedMessage.hasOwnProperty("improvement") &&
        Object.keys(parsedMessage.improvement).length > 0 &&
        parsedMessage.improvement?.sentence?.trim()
          ? parsedMessage.improvement
          : null,
      type: "assistant",
      user: {
        uid: "",
        fullname: "1CoAuthor",
        imageUrl: "images/icon-8x.png",
      },
      refMessageId: ref,
      articleId: selectedArticle.id,
      createdAt: new Date(),
    });
    setIsLoading(false);
  };

  const editMessage = async (messageId: string) => {
    const updatedText = editCommentText;
    if (updatedText && updatedText.trim()) {
      await updateDoc(doc(db, "articleMessages", messageId), {
        text: updatedText,
        edited: true,
        updatedAt: new Date(),
      });
      setEditable(null);
      setEditCommentText(null);
    }
  };

  const deleteMessage = async (messageId: string) => {
    // if (confirm("Are you sure you want to delete this comment?")) {
    await updateDoc(doc(db, "articleMessages", messageId), {
      deleted: true,
      updatedAt: new Date(),
    });
    // }
  };
  // const scrollToBottom = () => {
  //   if (scrolling.current) {
  //     scrolling.current.scrollIntoView({ behaviour: 'smooth' })
  //   }
  // }

  const locateImprovement = async (messageId: string, improvement: Improvement) => {
    setIsLoading(true);
    const matchedEl = await findScrollAndSelect(improvement?.sentence);
    if (!matchedEl) {
      await updateDoc(doc(db, "articleMessages", messageId), {
        improvement: null,
        updatedAt: new Date(),
      });
    }
    setIsLoading(false);
  };

  const excludeCurrentModification = (messageId: string) => {
    if (messageId) {
      updateDoc(doc(db, "articleMessages", messageId), {
        improvement: null,
        updatedAt: new Date(),
      });
    }
  };

  const renderMessages = () => {
    return (
      <TransitionGroup>
        {messages.map((message: any) => {
          let improvement: Improvement = {
            reasoning: "",
            action: "",
            sentence: "",
            new_sentence: "",
          };
          const messageText = message.text;
          if (
            message.user.fullname === "1CoAuthor" &&
            message.improvement &&
            Object.keys(message.improvement).length > 0 &&
            message.improvement?.sentence?.trim()
          ) {
            improvement = message.improvement;
          }
          return (
            <CSSTransition key={message.id} timeout={500} classNames="comment">
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
                  {message?.type === "assistant" ? (
                    <OptimizedAvatar
                      name={"assistant"}
                      imageUrl={"images/icon-8x.png"}
                      sx={{ border: "none" }}
                      imageSx={{ width: "40px", height: "40px" }}
                    />
                  ) : (
                    <OptimizedAvatar
                      name={message.user?.fullname || ""}
                      imageUrl={message?.user?.imageUrl || ""}
                      sx={{ border: "none" }}
                      imageSx={{ width: "40px", height: "40px" }}
                    />
                  )}
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
                        {message?.type === "assistant" ? "1CoAuthor" : message.user.fullname}
                      </Typography>
                      {message?.user?.isInstructor && <SchoolIcon color="primary" sx={{ pl: "5px" }} />}
                    </Box>
                    <Typography sx={{ fontSize: "12px" }}>
                      {moment(message.createdAt.toDate().getTime()).format("h:mm a")}
                    </Typography>
                  </Box>
                  {editable === message.id ? (
                    <MessageInput
                      fileInputRef={fileInputRef}
                      mode={mode}
                      type="comment"
                      value={editCommentText || messageText}
                      setAction={setEditCommentText}
                      onClose={() => {
                        setEditable(null);
                        setEditCommentText(null);
                      }}
                      onSubmit={() => editMessage(message.id)}
                      isLoading={isLoading}
                      isEditing={true}
                      isAuthenticated={!!user?.uname}
                    />
                  ) : (
                    <>
                      <Box
                        className="reply-box"
                        sx={{
                          position: "relative",
                          fontSize: "16px",
                          fontWeight: "400",
                          lineHeight: "24px",
                          p: "10px 14px",
                          borderRadius: "9px",
                          border: message?.user?.isInstructor ? "solid 2px orange" : undefined,
                          background: mode === "dark" ? "#48444A" : "#FFFFFF",
                        }}
                      >
                        <Box
                          sx={{
                            fontSize: "16px",
                            fontWeight: "400",
                            lineHeight: "24px",
                          }}
                        >
                          <Typography
                            display="block"
                            sx={{
                              fontSize: "16px",
                              fontWeight: 400,
                              letterSpacing: "inherit",
                            }}
                          >
                            {messageText}
                          </Typography>

                          <Box
                            sx={{
                              pt: 1,
                              display: "flex",
                              gap: "15px",
                              justifyContent: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            {(message?.imageUrls || []).map((imageUrl: string) => (
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
                        {user?.uname === message?.user?.uname && (
                          <MessageButtons
                            message={message}
                            handleEditMessage={() => {
                              setEditable(message.id);
                              setEditCommentText(messageText);
                            }}
                            handleDeleteMessage={() => deleteMessage(message.id)}
                            user={user}
                            mode={mode}
                            sx={{
                              background: "transparent",
                            }}
                          />
                        )}
                      </Box>
                      {improvement.action.trim() && (
                        <>
                          <Box
                            sx={{
                              width: "100%",
                              mb: "10px",
                              mt: "10px",
                            }}
                          >
                            <Button
                              onClick={() => locateImprovement(message.id, improvement)}
                              sx={{
                                width: "100%",
                                backgroundColor: "info.main",
                                color: "white",
                                "&:hover": {
                                  backgroundColor: "info.light",
                                },
                              }}
                            >
                              Locate it <ArrowForwardIcon sx={{ marginLeft: "7px" }} />
                            </Button>
                          </Box>
                          <ImproveItemComp
                            improvement={improvement}
                            theme={theme}
                            findScrollAndSelect={findScrollAndSelect}
                            excludeCurrentModification={() => excludeCurrentModification(message.id)}
                          />
                        </>
                      )}
                    </>
                  )}

                  <Box ref={scrolling}></Box>
                </Box>
              </Box>
            </CSSTransition>
          );
        })}
      </TransitionGroup>
    );
  };

  return (
    <Box
      id="comment-section"
      sx={{
        position: "relative",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        listStyle: "none",
        transition: "box-shadow 0.3s",
        pb: "120px",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: "0",
          left: "0",
          width: "100%",
          backgroundColor: mode === "light" ? DESIGN_SYSTEM_COLORS.gray200 : DESIGN_SYSTEM_COLORS.notebookG600,
        }}
      ></Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "90%",
        }}
      >
        <Box id="comments-section" sx={{ height: "calc(100vh - 300px)" }}>
          {messages.length === 0 ? (
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
                      src={"/rive-notebook/notification.riv"}
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
            <Box>{renderMessages()}</Box>
          )}
        </Box>
        <Box
          id="comment-input"
          sx={{
            position: "fixed",
            bottom: "10px",
            left: "7px",
            width: `${sideBarWidth - 19}px`,
          }}
        >
          <MessageInput
            fileInputRef={fileInputRef}
            mode={mode}
            type="comment"
            value={commentInput}
            setAction={setCommentInput}
            onSubmit={addComment}
            isLoading={isLoading}
            imageUrls={imageUrls}
            setImageUrls={setImageUrls}
            isAuthenticated={!!user?.uname}
          />
          {isLoading && <LinearProgress color="secondary" sx={{ width: "100%", mt: 2 }} />}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatBoxComp;
