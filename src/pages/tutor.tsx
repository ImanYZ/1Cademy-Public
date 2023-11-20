import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import StopCircleIcon from "@mui/icons-material/StopCircle";
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
  useMediaQuery,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import { collection, doc, getFirestore, onSnapshot, query, setDoc, Timestamp, where } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import moment from "moment";
import { useEffect, useRef, useState } from "react";

import SearchMessage from "@/components/assistant/SearchMessage";
import PDFView from "@/components/community/PDFView";
import UploadButtonCademy from "@/components/community/UploadButtonCademy";
import AppHeaderMemoized from "@/components/Header/AppHeader";
import withAuthUser from "@/components/hoc/withAuthUser";
import { RiveComponentMemoized } from "@/components/home/components/temporals/RiveComponentExtended";
import MarkdownRender from "@/components/Markdown/MarkdownRender";
import { useAuth } from "@/context/AuthContext";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import { Post } from "@/lib/mapApi";
import { isValidHttpUrl } from "@/lib/utils/utils";

const Tutor = () => {
  const [bookUrl, setBookUrl] = useState("");
  const [threads, setThreads] = useState<any>([]);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any>([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElAudioType, setAnchorElAudioType] = useState(null);
  const [audioType, setAudioType] = useState("alloy");
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [uploadError, setUploadError] = useState<any>(false);
  const [isRecording, setRecording] = useState<boolean>(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any>([]);
  const messagesContainerRef = useRef<any>(null);
  const [playingAudio, setPlayingAudio] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [watingWhisper, setWatingWhisper] = useState(false);

  const isMobile = useMediaQuery("(max-width:599px)");
  const { confirmIt, ConfirmDialog } = useConfirmDialog();

  const storage = getStorage();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAudioType = (event: any) => {
    setAnchorElAudioType(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClosAudio = () => {
    setAnchorElAudioType(null);
  };
  const open = Boolean(anchorEl);
  const openAudioType = Boolean(anchorElAudioType);
  const [bookId, setBookId] = useState("");

  const [{ user }] = useAuth();

  const db = getFirestore();

  const getEmotions = (emotion: string) => {
    if (emotion === "happy" || emotion === "very happy") {
      return "rive-voice-assistant/idle.riv";
    } else if (emotion === "blinking") {
      return "rive-voice-assistant/idle.riv";
    } else if (emotion === "clapping") {
      return "rive-voice-assistant/happy.riv";
    } else if (emotion === "happy drumming") {
      return "rive-voice-assistant/happy.riv";
    } else if (emotion === "celebrating daily goal achievement") {
      return "rive/positive-reinforcement.riv";
    } else if (emotion === "sad" || emotion === "unhappy") {
      return "rive-voice-assistant/sad.riv";
    }
    return "rive-voice-assistant/idle.riv";
  };

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

  const capitalizeFirstLetter = (word: string) => {
    if (typeof word !== "string" || word.length === 0) {
      return "";
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
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
        audioType,
      });
      messages.shift();
      setMessages(messages);
      scroll();
      setWaitingForResponse(false);

      if (asAudio) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.addEventListener("ended", handleAudioEnded);
        audioRef.current.play();
        setPlayingAudio(messageId);
      }
    } catch (error: any) {
      confirmIt("There appears to be an issue with sending the request to GPT. Please try again.", false);
      console.error(error);
      setWaitingForResponse(false);
    }
  };
  const saveBook = async (bookUrl: string, defaultBook?: boolean) => {
    try {
      if (!bookUrl) return;
      const newBookRef = doc(collection(db, "books"));
      await setDoc(newBookRef, {
        bookUrl,
        uname: user?.uname,
        createdAt: new Date(),
        title: !!defaultBook ? "The Constitution of the United States" : "",
        deleted: false,
        default: !!defaultBook,
        file_id: !!defaultBook ? "file-pxDzdQt0omIiWcWfD82S6gBw" : "",
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
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/books%2Fconstitution.pdf?alt=media&token=3b9da61d-49dc-4ac1-ba6b-5568db36c464",
        true
      );
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
    const { messages }: any = await Post("/listMessages", { bookId: thread.id });
    messages.shift();
    setMessages(messages);
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
  const handleRecoding = () => {
    if (isRecording) {
      stopRecording();
      setWatingWhisper(true);
    } else {
      startRecording();
    }
  };

  const scroll = () => {
    if (messagesContainerRef.current && messages.length > 2) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };
  const handleAudioEnded = () => {
    setPlayingAudio(null);
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
        existAudioUrl = thread.messages[message.id][audioType];
      }
      if (!existAudioUrl) {
        const { audioUrl }: any = await Post("/STT", {
          message,
          bookId,
          audioType,
        });
        existAudioUrl = audioUrl;
      }
      audioRef.current = new Audio(existAudioUrl);
      audioRef.current.addEventListener("ended", handleAudioEnded);
      setLoadingAudio(false);
      audioRef.current.play();
      // setPlayingAudio(null);
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
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSendMessage(bookId, false, newMessage);
    }
    if (event.key === "Enter") {
      event.preventDefault();
      setNewMessage(prevMessage => prevMessage + "\n");
    }
  };

  const deleteBook = async () => {
    try {
      if (await confirmIt("Are you sure you want to delete this Book?")) {
        const remainThreads = threads.filter((t: any) => t.id !== bookId);
        if (remainThreads.length) {
          handleSelectThread(remainThreads[0]);
        } else {
          setMessages([]);
        }
        await Post("/deleteAssistantFile", {
          bookId,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const removeExtraCharacters = (text: string) => {
    text = text.replaceAll("【27†source】", "");
    text = text.replace(/This message is sent at\s\d{1,2}:\d{2}[ap]m\s\w{3}\son\s\d{1,2}\/\d{1,2}\/\d{4}/i, "");
    return capitalizeFirstLetter(text);
  };
  const handleSelectAudio = (voiceType: string) => {
    setAudioType(voiceType);
    handleClosAudio();
  };

  const getJSON = (text: string) => {
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      const jsonArrayString = text.slice(start, end + 1);

      return JSON.parse(jsonArrayString);
    } catch (error) {
      return {
        message: text,
        emotion: null,
      };
    }
  };

  return (
    <Box>
      <AppHeaderMemoized
        page="ONE_CADEMY"
        tutorPage={true}
        sections={[]}
        selectedSectionId={""}
        onSwitchSection={() => {}}
      />
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
            mt: 5,
            m: isMobile ? 5 : "",
          }}
        >
          {" "}
          {threads.length > 0 && (
            <Box
              sx={{
                mr: "5px",
                width: isMobile ? "90%" : "70%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!threads.find((thread: any) => thread?.id === bookId)?.default && !isMobile && (
                <Button sx={{ mr: "5px" }} onClick={deleteBook} disabled={waitingForResponse}>
                  {"Delete"}
                </Button>
              )}
              <Box sx={{ mr: "5px", width: "100%" }}>
                {!threads.find((thread: any) => thread?.id === bookId)?.title && waitingForResponse ? (
                  <LinearProgress />
                ) : (
                  <Button
                    id="demo-customized-button"
                    aria-controls={open ? "demo-customized-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    variant="outlined"
                    disableElevation
                    onClick={handleClick}
                    fullWidth
                    endIcon={
                      threads.filter((thread: any) => thread?.id !== bookId).length > 0 && <KeyboardArrowDownIcon />
                    }
                  >
                    {threads.find((thread: any) => thread?.id === bookId)?.title || ""}
                  </Button>
                )}
                {threads.filter((thread: any) => thread?.id !== bookId).length > 0 && (
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
                      {threads
                        .filter((thread: any) => thread?.id !== bookId)
                        .map((thread: any) => (
                          <MenuItem key={thread.id} onClick={() => handleSelectThread(thread)} disableRipple>
                            {thread.title}
                          </MenuItem>
                        ))}
                    </Menu>
                  </Box>
                )}
              </Box>
            </Box>
          )}
          <Box>
            {!isMobile && (
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
            )}
          </Box>
        </Box>
        {isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!threads.find((thread: any) => thread?.id === bookId)?.default && (
              <Button sx={{ mr: "5px" }} onClick={deleteBook} disabled={waitingForResponse}>
                {"Delete"}
              </Button>
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
        )}
        {uploadError && (
          <Box sx={{ m: 1 }}>
            <Alert severity="warning">{uploadError}</Alert>
          </Box>
        )}

        <Stack spacing={2} padding={2} sx={{ p: 3, mb: showPDF ? 200 : 150 }}>
          <Box style={{ overflowY: "auto" }}>
            {messages.map((m: any) => {
              return (
                (m?.content || []).length > 0 &&
                m?.content[0]?.text?.value && (
                  <Box key={m.id} sx={{ mb: "15px", p: 5, pt: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {m.role === "user" ? (
                        <Avatar src={user?.imageUrl} />
                      ) : (
                        <Box
                          sx={{
                            width: playingAudio === m.id && !loadingAudio ? "85px" : "60px",
                            height: playingAudio === m.id && !loadingAudio ? "85px" : "60px",
                            mb: { xs: "24px", sm: "24px" },
                            display: "flex",
                            alignItems: "center",
                            pt: "25px",
                          }}
                        >
                          {playingAudio === m.id && !loadingAudio ? (
                            <RiveComponentMemoized
                              key={`talking-${m.id}`}
                              src={"rive-voice-assistant/talking.riv"}
                              artboard="New Artboard"
                              animations={["Timeline 1"]}
                              autoplay={true}
                            />
                          ) : (
                            <RiveComponentMemoized
                              key={`emotion-${m.id}`}
                              src={`${getEmotions(getJSON(m?.content[0]?.text?.value).emotion)}`}
                              artboard="New Artboard"
                              animations={["Timeline 1"]}
                              autoplay={true}
                            />
                          )}
                        </Box>
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          ml: "5px",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography sx={{ ml: "4px", fontSize: "19px", fontFamily: "bold" }}>
                            {m.role === "user" ? user?.fName + " " + user?.lName : "1Tutor"}
                          </Typography>
                          {m.role !== "user" &&
                            (playingAudio === m.id ? (
                              loadingAudio ? (
                                <Box>
                                  <LinearProgress sx={{ width: "20px", mt: "9px", ml: "15px" }} />
                                </Box>
                              ) : (
                                <VolumeOffIcon
                                  sx={{ ml: "5px", cursor: "pointer", color: "orange" }}
                                  onClick={stopAudio}
                                />
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
                    <Typography sx={{ mt: m.role === "user" ? "9px" : "" }}>
                      {" "}
                      <MarkdownRender
                        text={
                          (m?.content || []).length > 0
                            ? removeExtraCharacters(
                                m.role === "user"
                                  ? m?.content[0]?.text?.value
                                  : getJSON(m?.content[0]?.text?.value).message
                              )
                            : ""
                        }
                      />
                    </Typography>
                  </Box>
                )
              );
            })}
            {waitingForResponse && (
              <Box key={"loading"} sx={{ mb: "15px", pl: 5 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: "130px",
                      height: "130px",
                      mb: { xs: "64px", sm: "32px" },
                      display: "flex",
                      alignItems: "center",
                      pt: "25px",
                    }}
                  >
                    <SearchMessage />
                  </Box>
                  {/* <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      ml: "5px",
                    }}
                  >
                    <Typography sx={{ ml: "4px", fontSize: "19px" }}>
                      {watingWhisper ? user?.fName + " " + user?.lName : "1Tutor"}
                    </Typography>
                    <LinearProgress sx={{ width: "150px", mt: "2px" }} />
                  </Box> */}
                </Box>
              </Box>
            )}
          </Box>
        </Stack>
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
          {isRecording && (
            <Box
              sx={{
                width: "90px",
                height: "90px",
                mb: { xs: "64px", sm: "32px" },
                display: "flex",
                alignItems: "center",
              }}
            >
              <RiveComponentMemoized
                src="rive-voice-assistant/listening.riv"
                artboard="New Artboard"
                animations={["Timeline 1"]}
                autoplay={true}
              />
            </Box>
          )}
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
              <Tooltip title={isRecording ? "Stop" : "Start"}>
                <IconButton disabled={waitingForResponse || !bookUrl} onClick={handleRecoding}>
                  {isRecording ? (
                    <StopCircleIcon sx={{ fontSize: "40px", color: "orange" }} />
                  ) : (
                    <MicIcon sx={{ fontSize: "35px" }} />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            width: "150px",
            marginLeft: "auto",
            mt: "15px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography sx={{ mr: "15px" }}>Narrator:</Typography>
          <Button
            id="demo-customized-button"
            aria-controls={openAudioType ? "demo-customized-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={openAudioType ? "true" : undefined}
            variant="outlined"
            disableElevation
            onClick={handleAudioType}
            fullWidth
            endIcon={<KeyboardArrowDownIcon />}
          >
            {capitalizeFirstLetter(audioType)}
          </Button>
          <Menu
            id="demo-customized-menu"
            MenuListProps={{
              "aria-labelledby": "demo-customized-button",
            }}
            anchorEl={anchorElAudioType}
            open={openAudioType}
            onClose={handleClosAudio}
          >
            {["alloy", "echo", "fable", "onyx", "nova", "shimmer"].map((voiceType: string) => (
              <MenuItem key={voiceType} onClick={() => handleSelectAudio(voiceType)} disableRipple>
                {capitalizeFirstLetter(voiceType)}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <Box>
          <Box sx={{ width: "100%" }}>{showPDF && <PDFView fileUrl={bookUrl} height="400px" width="100%" />}</Box>
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
