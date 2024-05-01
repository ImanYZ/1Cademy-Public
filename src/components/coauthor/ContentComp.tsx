import "react-quill/dist/quill.snow.css";

import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Modal,
  Paper,
  Popper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, query, updateDoc, where } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill";
import { User } from "src/knowledgeTypes";

import { delay } from "../../lib/utils/utils";
import DisciplinesComp from "./DisciplinesComp";
import OptimizedAvatar from "./OptimizedAvatar";

interface Props {
  selectedArticle: any;
  setSelectedArticle: any;
  user: User | null;
  userArticles: any;
  setArticleContent: any;
  setArticleDOM: any;
  quillRef: any;
  selection: any;
  setSelection: any;
  articleContent: any;
  articleTypePath: any;
  setArticleTypePath: any;
}

const ContentComp: React.FC<Props> = ({
  selectedArticle,
  setSelectedArticle,
  userArticles,
  user,
  setArticleContent,
  setArticleDOM,
  quillRef,
  selection,
  setSelection,
  articleContent,
  articleTypePath,
  setArticleTypePath,
}) => {
  const db = getFirestore();
  const [content, setContent] = useState(selectedArticle?.content);
  const [open, setOpen] = useState(false);
  const [lastClickPosition, setLastClickPosition] = useState(0);
  const [articleTitle, setArticleTitle] = useState("");
  const [openModal, setOpenModal] = React.useState(false);
  const [users, setUsers] = React.useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const popperRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.docs.length > 0) {
        let usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          fName: doc.data()?.fName,
          lName: doc.data()?.lName,
          uname: doc.data()?.uname,
          imageUrl: doc.data()?.imageUrl,
          email: doc.data()?.email,
        }));
        setUsers(usersData);
      }
    })();
  }, []);

  useEffect(() => {
    const editor = quillRef.current.editor;
    const editorElement = quillRef.current.editor?.root;
    const handleClick = () => {
      const clickPosition = editor.getSelection()?.index || 0;
      setSelection(editor.getSelection());
      setLastClickPosition(clickPosition);
    };

    editorElement?.addEventListener("click", handleClick);

    return () => {
      editorElement?.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (selectedArticle) {
        const quillEditor = quillRef.current.getEditor();
        setContent(selectedArticle.content);
        await delay(1000);
        const content = quillEditor.getText();
        if (content.trim()?.length > 0) {
          setArticleAndDOM();
        }
      }
    })();
  }, [selectedArticle]);

  const saveLogs = async (logs: any) => {
    try {
      addDoc(collection(db, "articleLogs"), {
        ...logs,
        createdAt: new Date(),
      });
    } catch (error) {}
  };

  const setArticleAndDOM = useCallback(() => {
    if (!quillRef) return;
    const quillEditor = quillRef.current.getEditor();
    const editorDOMs = document.getElementsByClassName("ql-editor");
    const editorDOM = editorDOMs[0];
    setArticleDOM(editorDOM.children);
    setArticleContent(quillEditor.root.innerHTML);
  }, []);

  const saveAndAnalyze = useCallback(async () => {
    if (selectedArticle?.id) {
      setArticleAndDOM();
      await updateDoc(doc(db, "articles", selectedArticle.id), {
        content,
        updatedAt: new Date(),
      });
      await saveLogs({
        doer: user?.uname,
        action: "Modified Article",
        articleId: selectedArticle.id,
        content: content,
        cursorPosition: lastClickPosition,
      });
    } else {
      const q = query(collection(db, "articles"), where("title", "==", articleTitle), where("user", "==", user?.uname));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert("An article with the provided title already exists.");
        return;
      }
      const docRef = await addDoc(collection(db, "articles"), {
        title: articleTitle,
        content,
        user: user?.uname,
        editors: [user?.uname],
        editorsData: {
          [user?.uname || ""]: {
            fName: user?.fName,
            lName: user?.lName,
            uname: user?.uname,
            imageUrl: user?.imageUrl,
            email: user?.email,
          },
        },
        createdAt: new Date(),
      });
      await saveLogs({
        doer: user?.uname,
        action: "Created New Article",
        articleId: docRef.id,
        title: articleTitle,
        cursorPosition: lastClickPosition,
      });
    }

    setArticleTitle("");
    setOpen(false);
  }, [user, content, selectedArticle, articleTitle]);
  const handleChange = useCallback(
    (e: any) => {
      if (!e.target.value) {
        setSelectedArticle(null);
        setContent("");
      } else {
        handleClose();
        const selectedArticle = userArticles.filter((article: any) => article.id === e.target.value);
        setSelectedArticle(selectedArticle[0]);
      }
    },
    [selectedArticle, userArticles]
  );

  const handleSelectionChange = useCallback(
    (range: any) => {
      if (range && range.length > 0) {
        const selection = quillRef.current.getEditor().getSelection();
        setSelection(selection);
      }
    },
    [content, selectedArticle]
  );

  const handleBlur = useCallback(() => {
    const quill = quillRef.current.getEditor();
    if (selection && selection.length > 0) {
      quill.formatText(selection.index, selection.length, "background", "#BD7A00");
    } else {
      quill.insertText(lastClickPosition, "|", "color", "red");
    }
  }, [selection, lastClickPosition]);

  const handleFocus = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (selection) {
      quill.formatText(0, content.length, {
        background: false,
      });
      setSelection(null);
    }

    const redBars = document.querySelectorAll('span[style="color: red;"]');
    redBars.forEach((redBar: any) => {
      redBar.parentNode.removeChild(redBar);
    });
  }, [selection]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [selectedArticle]);

  const handleInputChange = useCallback(
    (event: any) => {
      setArticleTitle(event.target.value);
    },
    [articleTitle, selectedArticle]
  );
  const deleteArticle = async (event: any, articleId: string) => {
    event.stopPropagation();
    if (confirm("Are you sure to delete article")) {
      await deleteDoc(doc(db, "articles", articleId));
    }
  };

  const handleModalOpen = () => {
    setSearchTerm("");
    setOpenModal(true);
  };
  const handleModalClose = () => setOpenModal(false);

  const handleSelection = async (value: any) => {
    if (!value) return;
    const existingEditors = selectedArticle?.editors || [];
    const currentExistingEditor = existingEditors.indexOf(value.uname);
    if (currentExistingEditor == -1) {
      await updateDoc(doc(db, "articles", selectedArticle.id), {
        editors: [...existingEditors, value.uname],
        editorsData: {
          ...(selectedArticle?.editorsData || {}),
          [value?.uname || ""]: {
            fName: value?.fName,
            lName: value?.lName,
            uname: value?.uname,
            email: value?.email,
            imageUrl: value?.imageUrl,
          },
        },
        updatedAt: new Date(),
      });
      setSearchTerm("");
    }
  };

  const removeSharedUser = async (value: any) => {
    if (!value) return;
    const existingEditors = selectedArticle?.editors || [];
    const currentExistingEditor = existingEditors.indexOf(value.uname);
    if (currentExistingEditor != -1) {
      const editorsData = selectedArticle?.editorsData;
      delete editorsData[value?.uname];
      existingEditors.splice(currentExistingEditor, 1);
      await updateDoc(doc(db, "articles", selectedArticle.id), {
        editors: existingEditors,
        editorsData,
        updatedAt: new Date(),
      });
    }
  };

  const handleSuggestionChange = (event: any) => {
    setSearchTerm(event.target.value);
    setAnchorEl(event.currentTarget);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user: any) => user.email.toLowerCase() === searchTerm.toLowerCase());
  }, [searchTerm, users]);

  const handleClickOutside = (event: any) => {
    if (popperRef.current && !popperRef.current.contains(event.target)) {
      setAnchorEl(null);
    }
  };

  useEffect(() => {
    document.body.addEventListener("click", handleClickOutside);
    return () => {
      document.body.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <Box sx={{ m: "16px 10px" }}>
      {selectedArticle && selectedArticle?.user === user?.uname && (
        <Button onClick={handleModalOpen} variant="outlined" sx={{ position: "absolute", right: "10px", top: "10px" }}>
          Share
        </Button>
      )}
      <Modal
        open={openModal}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <TextField
            sx={{ width: "100%" }}
            label="Search for a user"
            variant="outlined"
            onChange={handleSuggestionChange}
            value={searchTerm}
          />
          <Popper
            sx={{ zIndex: 999999, width: "300px" }}
            open={!!searchTerm && filteredUsers?.length > 0}
            anchorEl={anchorEl}
            ref={popperRef}
          >
            <Paper>
              <List>
                {filteredUsers?.map((user: any) => (
                  <ListItem button onClick={() => handleSelection(user)} key={user.userId}>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <OptimizedAvatar
                          name={user?.fName || ""}
                          imageUrl={user?.imageUrl || ""}
                          sx={{ border: "none" }}
                          imageSx={{ width: "40px", height: "40px" }}
                        />
                        <ListItemText primary={`${user.fName} ${user.lName}`} />
                      </Box>
                      <Typography variant="subtitle1">{user.email}</Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Popper>
          {selectedArticle?.editorsData && (
            <Box mt={3}>
              {Object.keys(selectedArticle?.editorsData).map((editor: any, key: number) => {
                if (selectedArticle?.editorsData[editor]?.uname != user?.uname) {
                  return (
                    <Box
                      key={key}
                      sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "10px" }}
                    >
                      <OptimizedAvatar
                        name={selectedArticle?.editorsData[editor]?.fName || ""}
                        imageUrl={selectedArticle?.editorsData[editor]?.imageUrl || ""}
                        sx={{ border: "none" }}
                        imageSx={{ width: "40px", height: "40px" }}
                      />
                      <Typography>
                        {selectedArticle?.editorsData[editor]?.email || selectedArticle?.editorsData[editor]?.label}{" "}
                      </Typography>
                      <Button onClick={() => removeSharedUser(selectedArticle?.editorsData[editor])}>
                        <DeleteIcon />
                      </Button>
                    </Box>
                  );
                }
              })}
            </Box>
          )}
        </Box>
      </Modal>
      <Box sx={{ height: "24px", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
        {articleContent.trim() && (
          <DisciplinesComp
            allContent={articleContent}
            articleTypePath={articleTypePath}
            setArticleTypePath={setArticleTypePath}
          />
        )}
      </Box>
      <Box mt={2}>
        {!open && (
          <Select
            labelId="coauthor-articles-select"
            id="coauthor-articles-select"
            value={selectedArticle?.id || 0}
            onChange={handleChange}
            sx={{
              zIndex: 9999,
              width: "200px",
              height: "36px",
              position: "absolute",
              right: "190px",
              top: "59.5px",
            }}
          >
            <MenuItem
              onClick={() => {
                setSelectedArticle(null);
                setOpen(true);
              }}
              value={0}
            >
              Create New Article
            </MenuItem>
            <Divider variant="fullWidth" sx={{ my: "10px" }} />
            {userArticles.map((article: any, index: number) => (
              <MenuItem sx={{ display: "flex", justifyContent: "space-between" }} key={index} value={article.id}>
                {article?.title}
                {selectedArticle?.id !== article.id && article.user == user?.uname && (
                  <IconButton onClick={e => deleteArticle(e, article.id)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </MenuItem>
            ))}
          </Select>
        )}

        {open && (
          <TextField
            placeholder="Enter Article Title"
            sx={{
              position: "absolute",
              right: "190px",
              top: "59.5px",
            }}
            value={articleTitle}
            onChange={handleInputChange}
            variant="outlined"
            onKeyDown={(event: any) => {
              if (event.key === "Enter") {
                saveAndAnalyze();
              }
            }}
            InputProps={{
              sx: {
                width: "200px",
                height: "36px",
              },
            }}
          />
        )}
        <ReactQuill
          style={{ height: "calc(100vh - 110px)" }}
          ref={quillRef}
          value={content}
          onChange={setContent}
          onBlur={() => handleBlur()}
          onFocus={() => handleFocus()}
          onChangeSelection={(range: any) => handleSelectionChange(range)}
        />

        {open && (
          <Button
            variant="contained"
            color="error"
            style={{ position: "absolute", right: "90px", top: "59.5px" }}
            onClick={() => {
              setOpen(false);
              const latestArticle = userArticles.reduce((prev: any, current: any) => {
                const prevTimestamp = Math.max(prev.createdAt, prev.updatedAt || 0);
                const currentTimestamp = Math.max(current.createdAt, current.updatedAt || 0);
                return currentTimestamp > prevTimestamp ? current : prev;
              }, userArticles[0]);
              setSelectedArticle(latestArticle);
            }}
          >
            Cancel
          </Button>
        )}

        <Button
          variant="contained"
          color="success"
          style={{ position: "absolute", right: "13px", top: "59.5px" }}
          onClick={() => saveAndAnalyze()}
        >
          {open ? "Save" : "Save and Analyze"}
        </Button>
      </Box>
    </Box>
  );
};

export default ContentComp;
