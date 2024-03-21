import "react-quill/dist/quill.snow.css";

import { Box, Button, Divider, MenuItem, Select, TextField } from "@mui/material";
import { addDoc, collection, doc, getFirestore, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { User } from "src/knowledgeTypes";

import { delay } from "../../lib/utils/utils";
import DisciplinesComp from "./DisciplinesComp";

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
        setContent(selectedArticle.content);
        await delay(1000);
        if (selectedArticle.content) {
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
      const docRef = await addDoc(collection(db, "articles"), {
        title: articleTitle,
        content,
        user: user?.userId,
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
    [selectedArticle]
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
      quill.formatText(selection.index, selection.length, "background", "#573800");
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

  return (
    <Box sx={{ m: "16px 10px" }}>
      <Box sx={{ height: "24px", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
        {articleContent.trim() && (
          <DisciplinesComp
            allContent={articleContent}
            articleTypePath={articleTypePath}
            setArticleTypePath={setArticleTypePath}
          />
        )}
      </Box>
      {/* <ContributorComp
        users={[
          {
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/coauthor-1a236.appspot.com/o/profilePictures%2FHaroon-Waheed?alt=media&token=c41cc4b3-d0be-424e-8805-5a574d59b373",
            score: 10,
          },
          {
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/coauthor-1a236.appspot.com/o/profilePictures%2FIman-Yeckehzaare?alt=media&token=ec82eac8-0cee-4151-82df-7fd434c38edd",
            score: 8,
          },
          {
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/coauthor-1a236.appspot.com/o/profilePictures%2FHaroon-Waheed?alt=media&token=c41cc4b3-d0be-424e-8805-5a574d59b373",
            score: 10,
          },
          {
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/coauthor-1a236.appspot.com/o/profilePictures%2FIman-Yeckehzaare?alt=media&token=ec82eac8-0cee-4151-82df-7fd434c38edd",
            score: 8,
          },
          {
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/coauthor-1a236.appspot.com/o/profilePictures%2FHaroon-Waheed?alt=media&token=c41cc4b3-d0be-424e-8805-5a574d59b373",
            score: 10,
          },
          {
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/coauthor-1a236.appspot.com/o/profilePictures%2FIman-Yeckehzaare?alt=media&token=ec82eac8-0cee-4151-82df-7fd434c38edd",
            score: 8,
          },
          {
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/coauthor-1a236.appspot.com/o/profilePictures%2FHaroon-Waheed?alt=media&token=c41cc4b3-d0be-424e-8805-5a574d59b373",
            score: 10,
          },
          {
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/coauthor-1a236.appspot.com/o/profilePictures%2FIman-Yeckehzaare?alt=media&token=ec82eac8-0cee-4151-82df-7fd434c38edd",
            score: 8,
          },
        ]}
        sx={{ mb: 2 }}
      /> */}
      <Box mt={2}>
      {!open && (
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selectedArticle?.id || 0}
          onChange={handleChange}
          sx={{
            zIndex: 9999,
            width: "200px",
            height: "36px",
            position: "absolute",
            right: "190px",
            top: "78.5px",
          }}
        >
          <MenuItem onClick={() => setOpen(true)} value={0}>
            Create New Article
          </MenuItem>
          <Divider variant="fullWidth" sx={{ my: "10px" }} />
          {userArticles.map((article: any, index: number) => (
            <MenuItem key={index} value={article.id}>
              {article?.title}
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
            top: "78.5px",
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
              position: "absolute",
              right: "190px",
              top: "59.5px",
            }}
          >
            <MenuItem onClick={() => setOpen(true)} value={0}>
              Create New Article
            </MenuItem>
            <Divider variant="fullWidth" sx={{ my: "10px" }} />
            {userArticles.map((article: any, index: number) => (
              <MenuItem key={index} value={article.id}>
                {article?.title}
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
