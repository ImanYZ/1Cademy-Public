import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import SettingsVoiceIcon from "@mui/icons-material/SettingsVoice";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import moment from "moment";
import { useEffect, useRef, useState } from "react";

import PDFView from "@/components/community/PDFView";
import UploadButtonCademy from "@/components/community/UploadButtonCademy";
import withAuthUser from "@/components/hoc/withAuthUser";
import MarkdownRender from "@/components/Markdown/MarkdownRender";
import { useAuth } from "@/context/AuthContext";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import { Post } from "@/lib/mapApi";
import { isValidHttpUrl } from "@/lib/utils/utils";

const GPT_AVATAR =
  "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FujkG0olNv2hYlAgs1c17ANHoGiN2%2FSat%2C%2006%20May%202023%2011%3A00%3A14%20GMT_430x1300.png?alt=media&token=f3515019-e022-422b-b4f3-aa6aba9f7b25";
const Tutor = () => {
  const [bookUrl, setBookUrl] = useState("");
  const [threads, setThreads] = useState<any>([]);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any>([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [uploadError, setUploadError] = useState<any>(false);
  const [isRecording, setRecording] = useState<boolean>(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any>([]);
  const messagesContainerRef = useRef<any>(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [watingWhisper, setWatingWhisper] = useState(false);

  const { confirmIt, ConfirmDialog } = useConfirmDialog();

  const storage = getStorage();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const [bookId, setBookId] = useState("");

  const [{ user }] = useAuth();

  const db = getFirestore();

  const uploadAudio = async (audioBlob: any) => {
    try {
      let bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? "onecademy-dev.appspot.com";
      if (isValidHttpUrl(bucket)) {
        const { hostname } = new URL(bucket);
        bucket = hostname;
      }
      const rootURL = "https://storage.googleapis.com/" + bucket + "/";
      const filesFolder = rootURL + "SpeechToText/";

      let fileName = new Date().toString() + ".wav";
      const storageRef = ref(storage, filesFolder + fileName);
      const task = uploadBytesResumable(storageRef, audioBlob);

      return new Promise((resolve, reject) => {
        task.on(
          "state_changed",
          snapshot => {
            console.info(Math.ceil((100 * snapshot.bytesTransferred) / snapshot.totalBytes));
          },
          err => {
            console.error("Upload Error: ", err);
            reject(err);
          },
          async () => {
            try {
              const generatedUrl = await getDownloadURL(storageRef);
              resolve(generatedUrl);
            } catch (error) {
              console.error("Error getting download URL: ", error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async (book: string, asAudio: boolean, newMessage: string) => {
    try {
      setMessages((_messages: any) => {
        _messages.push({
          role: "user",
          created_at: Timestamp.fromDate(new Date()).seconds,
          content: [{ type: "text", text: { value: newMessage } }],
        });
        return _messages;
      });
      setNewMessage("");
      scroll();
      setWaitingForResponse(true);

      const { messages, audioUrl, messageId }: any = await Post("/booksAssistant", {
        bookId: book,
        message: newMessage,
        asAudio,
      });
      setMessages(messages);
      scroll();
      setWaitingForResponse(false);

      if (asAudio) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.play();
        setPlayingAudio(messageId);
      }
    } catch (error: any) {
      confirmIt("There appears to be an issue with sending the request to GPT. Please try again.", false);
      console.error(error);
      setWaitingForResponse(false);
    }
  };
  const saveBook = async (bookUrl: string) => {
    try {
      if (!bookUrl) return;
      const newBookRef = doc(collection(db, "books"));
      await setDoc(newBookRef, {
        bookUrl,
        uname: user?.uname,
        createdAt: new Date(),
        title: "THE CONSTITUTION of the United States",
        deleted: false,
      });
      setBookUrl(bookUrl);
      setBookId(newBookRef.id);
      setMessages([]);
      handleSendMessage(newBookRef.id, false, newMessage);
    } catch (error) {
      console.error(error);
    }
  };

  const createDefaultBook = async () => {
    try {
      await saveBook(
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/books%2Fconstitution.pdf?alt=media&token=3b9da61d-49dc-4ac1-ba6b-5568db36c464"
      );
      setShowPDF(true);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const ontologyQuery = query(
      collection(db, "books"),
      where("uname", "==", user?.uname),
      where("deleted", "==", false)
    );
    const unsubscribeOntology = onSnapshot(ontologyQuery, snapshot => {
      const docChanges = snapshot.docChanges();
      if (docChanges.length <= 0) {
        createDefaultBook();
      }
      setThreads((books: any) => {
        const _books = [...books];

        for (let change of docChanges) {
          const changeData: any = change.doc.data();
          if (changeData.threadId && (changeData?.title || "").trim()) {
            const previousIdx = _books.findIndex(d => d.id === change.doc.id);
            if (change.type === "removed" && previousIdx !== -1) {
              _books.splice(previousIdx, 1);
            } else if (previousIdx !== -1) {
              _books[previousIdx] = { id: change.doc.id, ...changeData };
            } else {
              _books.push({
                id: change.doc.id,
                ...changeData,
              });
            }
          }
        }
        return _books;
      });
    });
    return () => unsubscribeOntology();
  }, [db]);

  const handleSelectThread = async (thread: any) => {
    if (!thread) return;
    setMessages([]);
    setBookUrl(thread.bookUrl);
    setBookId(thread.id);
    handleClose();
    setWaitingForResponse(true);
    const response: any = await Post("/listMessages", { bookId: thread.id });
    setMessages(response.messages);
    setWaitingForResponse(false);
  };

  useEffect(() => {
    if (!bookId) {
      handleSelectThread(threads[0]);
    }
  }, [threads]);

  const convertTimestampToDate = (timestamp: number) => {
    const timestampInMillis = timestamp * 1000;

    const momentTimestamp = moment(timestampInMillis);

    const formattedDate = momentTimestamp.format("h:mm:ss A MMM D, YYYY");

    return formattedDate;
  };

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event: any) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          const audioUrl = await uploadAudio(audioBlob);
          if (audioUrl) {
            setRecording(false);
            audioChunksRef.current = [];
            const response: { transctiption: string } = await Post("/transcribeSpeech", { audioUrl });
            if (response.transctiption.trim()) {
              setNewMessage(response.transctiption);
              handleSendMessage(bookId, true, response.transctiption);
            } else {
              confirmIt(
                "I didn't catch what you said; please ensure that you've granted microphone permissions.",
                false
              );
            }
          }
          setWatingWhisper(false);
        };

        mediaRecorderRef.current.start();
        setRecording(true);
      })
      .catch(error => {
        console.error("Error accessing microphone:", error);
        setWatingWhisper(false);
        confirmIt("I didn't catch what you said; please ensure that you've granted microphone permissions.", false);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleMouseDown = () => {
    startRecording();
  };

  const handleMouseUp = () => {
    stopRecording();
    setWatingWhisper(true);
  };
  const scroll = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const playAudio = async (message: any) => {
    try {
      setPlayingAudio(message.id);
      setLoadingAudio(true);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      let existAudioUrl = "";
      const thread = threads.find((t: any) => t.id === bookId);
      if ((thread?.messages || {}).hasOwnProperty(message.id)) {
        existAudioUrl = thread.messages[message.id].audioUrl;
      }
      if (!existAudioUrl) {
        const { audioUrl }: any = await Post("/STT", {
          message,
          bookId,
        });
        existAudioUrl = audioUrl;
      }
      audioRef.current = new Audio(existAudioUrl);
      audioRef.current.play();
      setLoadingAudio(false);
    } catch (error) {
      console.error(error);
    }
  };
  const stopAudio = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingAudio(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage(bookId, false, newMessage);
    }
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      setNewMessage(prevMessage => prevMessage + "\n");
    }
  };

  const deleteBook = async () => {
    try {
      if (await confirmIt("Are you sure you want to delete this Book?")) {
        const bookRef = doc(collection(db, "books"), bookId);
        const remainThreads = threads.filter((t: any) => t.id !== bookId);
        if (remainThreads.length) {
          handleSelectThread(remainThreads[0]);
        } else {
          setMessages([]);
        }
        await updateDoc(bookRef, {
          deleted: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          filter: "brightness(1.95)",
          zIndex: -2,
          backgroundColor: theme =>
            theme.palette.mode === "dark" ? theme.palette.common.notebookMainBlack : theme.palette.common.gray50,
          overflow: "hidden",
        }}
      />

      <Paper
        elevation={3}
        sx={{
          margin: "0 auto",
          maxWidth: 1000,
          height: "110vh",
          overflow: "auto",
        }}
        ref={messagesContainerRef}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pt: "15px",
            mb: "15px",
            p: 2,
          }}
        >
          {" "}
          {threads.length > 0 && (
            <Box sx={{ mr: "5px", width: "70%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Button sx={{ mr: "5px" }} onClick={deleteBook}>
                {"Delete"}
              </Button>
              <Box sx={{ mr: "5px", width: "100%" }}>
                <Button
                  id="demo-customized-button"
                  aria-controls={open ? "demo-customized-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  variant="outlined"
                  disableElevation
                  onClick={handleClick}
                  fullWidth
                  endIcon={<KeyboardArrowDownIcon />}
                >
                  {threads.find((thread: any) => thread?.id === bookId)?.title || ""}
                </Button>
                <Box sx={{ maxWidth: "400px" }}>
                  <Menu
                    id="demo-customized-menu"
                    MenuListProps={{
                      "aria-labelledby": "demo-customized-button",
                    }}
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    // PaperProps={{
                    //   style: {
                    //     width: "90%",
                    //     maxWidth: "none",
                    //   },
                    // }}
                  >
                    {threads.map((thread: any) => (
                      <MenuItem key={thread.id} onClick={() => handleSelectThread(thread)} disableRipple>
                        {thread.title}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              </Box>
            </Box>
          )}
          <Box>
            <UploadButtonCademy
              name="Book"
              mimeTypes={["application/pdf"]} // Alternatively "image/png, image/gif, image/jpeg"
              typeErrorMessage="We only accept a file with PDF format. Please upload another file."
              sizeErrorMessage="We only accept file sizes less than 10MB. Please upload another file."
              maxSize={10}
              storageFolder="books/"
              setFileUrl={setBookUrl}
              fullname={user?.uname || ""}
              saveBook={saveBook}
              setUploadError={setUploadError}
              disabled={waitingForResponse}
            />
          </Box>
        </Box>
        {uploadError && (
          <Box sx={{ m: 1 }}>
            <Alert severity="warning">{uploadError}</Alert>
          </Box>
        )}
        <Box sx={{ mb: 150, p: 3 }}>
          <Stack spacing={2} padding={2}>
            <Box style={{ overflowY: "auto" }}>
              {messages
                .filter((m: any) => !m?.content[0]?.text?.value.startsWith("Hi, I'm"))
                .map((m: any) => {
                  return (
                    (m?.content || []).length > 0 &&
                    m?.content[0]?.text?.value && (
                      <Box key={m.id} sx={{ mb: "15px", p: 5 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar src={m.role === "user" ? user?.imageUrl : GPT_AVATAR} />
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              ml: "5px",
                            }}
                          >
                            <Box sx={{ display: "flex", flexDirection: "inline" }}>
                              <Typography sx={{ ml: "4px", fontSize: "14px", fontFamily: "bold" }}>
                                {m.role === "user" ? user?.fName + " " + user?.lName : "GPT-4-Turbo"}
                              </Typography>
                              {m.role !== "user" &&
                                (playingAudio === m.id ? (
                                  loadingAudio ? (
                                    <Box>
                                      <LinearProgress sx={{ width: "20px", mt: "9px", ml: "15px" }} />
                                    </Box>
                                  ) : (
                                    <VolumeOffIcon sx={{ ml: "5px", cursor: "pointer" }} onClick={stopAudio} />
                                  )
                                ) : (
                                  <VolumeUpIcon
                                    sx={{ ml: "5px", cursor: "pointer" }}
                                    onClick={() => {
                                      playAudio(m);
                                    }}
                                  />
                                ))}
                            </Box>

                            <Typography sx={{ ml: "4px", fontSize: "12px" }}>
                              {convertTimestampToDate(m.created_at)}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography sx={{ mt: "9px" }}>
                          {" "}
                          <MarkdownRender text={(m?.content || []).length > 0 ? m?.content[0]?.text?.value : ""} />
                        </Typography>
                      </Box>
                    )
                  );
                })}
              {waitingForResponse && (
                <Box key={"loading"} sx={{ mb: "15px", p: 5 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar src={watingWhisper ? user?.imageUrl : GPT_AVATAR} />
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        ml: "5px",
                      }}
                    >
                      <Typography sx={{ ml: "4px", fontSize: "14px" }}>
                        {watingWhisper ? user?.fName + " " + user?.lName : "GPT-4-Turbo"}
                      </Typography>
                      <LinearProgress sx={{ width: "150px", mt: "2px" }} />
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Paper
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          margin: "0 auto",
          maxWidth: 1000,
          p: "15px",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", position: "sticky", zIndex: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              id="message-input"
              label="Type your message..."
              variant="outlined"
              fullWidth
              multiline
              value={newMessage}
              disabled={waitingForResponse || !bookUrl}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <Tooltip title={waitingForResponse ? "Stop" : "Send"}>
                    <IconButton
                      color="primary"
                      disabled={waitingForResponse || !bookUrl || !newMessage}
                      onClick={() => handleSendMessage(bookId, false, newMessage)}
                      edge="end"
                    >
                      <SendIcon />
                    </IconButton>
                  </Tooltip>
                ),
              }}
              sx={{ mr: "5px" }}
            />
            {watingWhisper ? (
              <LinearProgress sx={{ width: "50px", mt: "2px" }} />
            ) : (
              <IconButton
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                disabled={waitingForResponse || !bookUrl}
              >
                {isRecording ? (
                  <SettingsVoiceIcon sx={{ fontSize: "40px", color: "orange" }} />
                ) : (
                  <MicIcon sx={{ fontSize: "35px" }} />
                )}
              </IconButton>
            )}
          </Box>
        </Box>

        <Box sx={{ width: "100%" }}>{showPDF && <PDFView fileUrl={bookUrl} height="500px" width="100%" />}</Box>
        <Box sx={{ justifyContent: "center", display: "flex", alignItems: "center" }}>
          {" "}
          {bookUrl && (
            <Tooltip title={showPDF ? "Hide Book" : "Show Book"}>
              <Button
                onClick={() => {
                  setShowPDF(prev => !prev);
                }}
                sx={{ mt: "9px", justifyContent: "center", display: "flex" }}
              >
                {showPDF ? "Hide Book" : "Show Book"}
              </Button>
            </Tooltip>
          )}
        </Box>
      </Paper>
      {ConfirmDialog}
    </Box>
  );
};

export default withAuthUser({
  shouldRedirectToLogin: true,
  shouldRedirectToHomeIfAuthenticated: false,
})(Tutor);
