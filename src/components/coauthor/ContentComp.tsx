import "react-quill/dist/quill.snow.css";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, query, updateDoc, where } from "firebase/firestore";
import { useFormik } from "formik";
import React, { useCallback, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { User } from "src/knowledgeTypes";
import { sendMessageToChatGPT } from "src/services/openai";

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
  articleTypes: any;
}

type AcademicArticleCategory = {
  [key: string]: AcademicArticleCategory | string[];
};

const validate = (values: any) => {
  const errors: any = {};
  if (!values.title) {
    errors.title = "Required";
  }
  return errors;
};

const initialValues = {
  title: "",
  objective: "",
  idea: "",
  information: "",
  outlined: "",
};

const startLoader = () => {
  const element = document.getElementById("loader-overlay") as HTMLElement;
  if (element) {
    element.style.display = "flex";
  }
};

const stopLoader = () => {
  const element = document.getElementById("loader-overlay") as HTMLElement;
  if (element) {
    element.style.display = "none";
  }
};

const camelCaseToSpaces = (text: string): string => {
  return text
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, function (str) {
      return str.toUpperCase();
    });
};

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
  articleTypes,
}) => {
  const db = getFirestore();
  const [content, setContent] = useState(selectedArticle?.content);
  const [open, setOpen] = useState(false);
  const [lastClickPosition, setLastClickPosition] = useState(0);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [modalSection, setModalSection] = useState<number>(0);
  const [path, setPath] = useState<string[]>([]);
  const [draft, setDraft] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [inputFieldErrors, setInputFieldErrors] = useState<{ [key: string]: string }>({});

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

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit: async values => {
      startLoader();
      const q = query(
        collection(db, "articles"),
        where("title", "==", values.title),
        where("user", "==", user?.userId)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert("An article with the provided title already exists.");
        stopLoader();
        return;
      }
      setOpen(false);
      let GPTResponse: any = {};
      if (selectedTab === 0) {
        const prompt = `I need to write about ${values.title}.
      ${values.objective ? "My writing has the following objectives:" + values.objective : ""}
      ${values.idea ? "I have already thought about it and my ideas are as follows:" + values.idea : ""}
      ${
        values.information
          ? "I have already collected some pieces of information about it and they are as follows:" + values.information
          : ""
      }
      ${values.outlined ? " I have already outlined my writing and the outline is as follows:" + values.outlined : ""}
      Generate only a JSON object with the following structure:
      {
        "outline": "The writing outline as a long string in HTML format.",
        "instructions": "Step by step instructions to continue writing this article based on your generated outline. This should be an object where each key indicates a step and its value explains the step instructions. This object should have the following structure: {'step 1:': 'Step 1 instructions', 'step 2:': 'Step 2 instructions', ...}"
     }`;

        GPTResponse = await sendMessageToChatGPT([
          {
            role: "user",
            content: prompt,
          },
        ]);

        const docRef = await addDoc(collection(db, "articles"), {
          title: values.title,
          content: GPTResponse.outline,
          path,
          user: user?.userId,
          createdAt: new Date(),
        });
        let text = "";
        for (const key in GPTResponse.instructions) {
          if (GPTResponse.instructions.hasOwnProperty(key)) {
            const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
            text += `${capitalizedKey} ${GPTResponse.instructions[key]}\n\n`;
          }
        }

        await addDoc(collection(db, "articleMessages"), {
          text: text,
          improvement: null,
          type: "assistant",
          user: {
            uid: "",
            fullname: "1CoAuthor",
            imageUrl: "images/icon-8x.png",
          },
          articleId: docRef.id,
          createdAt: new Date(),
        });

        await saveLogs({
          doer: user?.uname,
          action: "Created New Article",
          articleId: docRef.id,
          title: values.title,
          cursorPosition: lastClickPosition,
        });
      } else {
        const articleData: any = {
          title: values.title,
          path,
          user: user?.userId,
          createdAt: new Date(),
        };
        if (draft) {
          articleData["content"] = draft;
        }
        const docRef = await addDoc(collection(db, "articles"), articleData);
        await saveLogs({
          doer: user?.uname,
          action: "Created New Article",
          articleId: docRef.id,
          title: values.title,
          cursorPosition: lastClickPosition,
        });
      }
      setError("");
      setModalSection(0);
      setSelectedTab(0);
      stopLoader();
    },
  });

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
    }
  }, [user, content, selectedArticle]);
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const deleteArticle = async (event: any, articleId: string) => {
    event.stopPropagation();
    if (confirm("Are you sure to delete article")) {
      await deleteDoc(doc(db, "articles", articleId));
    }
  };

  const handleTreeItemClick = (path: string[]) => {
    setPath(path);
  };

  const renderTree = (node: AcademicArticleCategory | string[], nodeId: string, path: string[]): JSX.Element => {
    if (Array.isArray(node)) {
      return (
        <>
          {node.map((item, index) => (
            <TreeItem
              key={`${nodeId}-${index}`}
              nodeId={`${nodeId}-${index}`}
              label={camelCaseToSpaces(item)}
              onClick={() => handleTreeItemClick([...path, item])}
            />
          ))}
        </>
      );
    } else {
      return (
        <>
          {Object.keys(node).map((key, index) => (
            <TreeItem key={`${nodeId}-${index}`} nodeId={`${nodeId}-${index}`} label={camelCaseToSpaces(key)}>
              {renderTree(node[key], `${nodeId}-${index}`, [...path, key])}
            </TreeItem>
          ))}
        </>
      );
    }
  };

  return (
    <Box sx={{ m: "16px 10px" }}>
      <Box sx={{ height: "24px", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
        {articleTypePath.length > 0 && (
          <DisciplinesComp
            allContent={articleContent}
            articleTypePath={articleTypePath}
            setArticleTypePath={setArticleTypePath}
            articleTypes={articleTypes}
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
              {selectedArticle?.id !== article.id && (
                <IconButton onClick={e => deleteArticle(e, article.id)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </MenuItem>
          ))}
        </Select>

        <ReactQuill
          style={{ height: "calc(100vh - 110px)" }}
          ref={quillRef}
          value={content}
          onChange={setContent}
          onBlur={() => handleBlur()}
          onFocus={() => handleFocus()}
          onChangeSelection={(range: any) => handleSelectionChange(range)}
        />

        <Button
          variant="contained"
          color="success"
          style={{ position: "absolute", right: "13px", top: "59.5px" }}
          onClick={() => saveAndAnalyze()}
        >
          Save and Analyze
        </Button>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            pt: 2,
            px: 4,
            pb: 3,
          }}
        >
          <form onSubmit={formik.handleSubmit}>
            {modalSection == 0 && (
              <Box>
                <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                  <InputLabel htmlFor="standard-adornment-amount">What is the title of your writing?</InputLabel>
                  <Input
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(inputFieldErrors?.title)}
                    id="standard-adornment-amount"
                  />
                </FormControl>

                <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                  {error && <Typography color={"red"}>{error}</Typography>}
                  <Typography>
                    Please enter the type of your writing by expanding the branches of the following tree-view:
                  </Typography>
                  <TreeView
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    style={{ maxHeight: 400, overflowY: "auto", padding: "10px" }}
                  >
                    {renderTree(articleTypes, "0", [])}
                  </TreeView>
                </FormControl>
              </Box>
            )}

            {modalSection == 1 && (
              <Box>
                <Tabs
                  variant="fullWidth"
                  value={selectedTab}
                  onChange={handleTabChange}
                  aria-label="1CoAuthor Tabs"
                  style={{ marginBottom: "19px" }}
                >
                  <Tab label="Help me outline" value={0} />
                  <Tab label="I'd like to draft" value={1} />
                </Tabs>

                {selectedTab === 0 ? (
                  <>
                    <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                      <InputLabel htmlFor="standard-adornment-amount">What is the writing objective?</InputLabel>
                      <Input
                        name="objective"
                        value={formik.values.objective}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        id="standard-adornment-amount"
                      />
                    </FormControl>
                    <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                      <InputLabel htmlFor="standard-adornment-amount">What do you have in mind?</InputLabel>
                      <Input
                        name="idea"
                        value={formik.values.idea}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        id="standard-adornment-amount"
                      />
                    </FormControl>
                    <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                      <InputLabel htmlFor="standard-adornment-amount">
                        Copy the pieces of information that you have already collected in the following box.
                      </InputLabel>
                      <Input
                        name="information"
                        value={formik.values.information}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        id="standard-adornment-amount"
                      />
                    </FormControl>
                    <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                      <InputLabel htmlFor="standard-adornment-amountIf">
                        If you have already outlined your writing copy the outline bellow.
                      </InputLabel>
                      <Input
                        name="outlined"
                        value={formik.values.outlined}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        id="standard-adornment-amount"
                      />
                    </FormControl>
                  </>
                ) : (
                  selectedTab === 1 && <ReactQuill style={{ height: "auto" }} value={draft} onChange={setDraft} />
                )}
              </Box>
            )}

            <Box mt={2} sx={{ display: "flex", justifyContent: "center", gap: "5px" }}>
              {modalSection == 0 && (
                <Button
                  onClick={() => {
                    if (!formik.values.title) {
                      setInputFieldErrors({ title: "Title is required." });
                      return;
                    }
                    setInputFieldErrors({});
                    if (path.length === 0) {
                      setError("Please select the path from tree-view.");
                      return;
                    }
                    setModalSection(1);
                  }}
                  variant="outlined"
                >
                  Next
                </Button>
              )}
              {modalSection == 1 && (
                <Button onClick={() => setModalSection(0)} variant="outlined">
                  Back
                </Button>
              )}

              {modalSection == 1 && selectedTab === 0 && (
                <Button type="submit" variant="outlined">
                  Outline
                </Button>
              )}
              {selectedTab === 1 && (
                <Button type="submit" variant="outlined">
                  Create
                </Button>
              )}
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default ContentComp;
