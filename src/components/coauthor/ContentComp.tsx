import "react-quill/dist/quill.snow.css";

import { PeopleAltOutlined } from "@mui/icons-material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Modal,
  Paper,
  Popper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { addDoc, collection, doc, getDocs, getFirestore, query, updateDoc, where } from "firebase/firestore";
import { useFormik } from "formik";
import Fuse from "fuse.js";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill";
import { User } from "src/knowledgeTypes";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { delay } from "../../lib/utils/utils";
import DisciplinesComp from "./DisciplinesComp";
import OptimizedAvatar from "./OptimizedAvatar";

interface Props {
  selectedArticle: any;
  user: User | null;
  setArticleContent: any;
  setArticleDOM: any;
  quillRef: any;
  selection: any;
  setSelection: any;
  articleContent: any;
  articleTypePath: any;
  setArticleTypePath: any;
  articleTypes: any;
  expandedIssue: number | null;
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
  expandedIssue,
}) => {
  const db = getFirestore();
  const theme = useTheme();
  const router = useRouter();
  const [content, setContent] = useState(selectedArticle?.content);
  const [open, setOpen] = useState(false);
  const [lastClickPosition, setLastClickPosition] = useState(0);
  const [path, setPath] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [inputFieldErrors, setInputFieldErrors] = useState<{ [key: string]: string }>({});
  const [openModal, setOpenModal] = React.useState(false);
  const [users, setUsers] = React.useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const popperRef = useRef<any>(null);
  const [fuseInstance, setFuseInstance] = useState<any>(null);
  const [priorReviews, setPriorReviews] = useState<string>("");
  const [isReviewsOpen, setIsReviewOpen] = useState<boolean>(false);
  const [keyPressed, setKeyPressed] = useState(false);
  const priorReviewsTimeoutRef = useRef<any>(null);
  const contentTimeoutRef = useRef<any>(null);
  const reviewsQuillRef = useRef<any>(null);

  useEffect(() => {
    if (selectedArticle?.priorReviews) {
      setPriorReviews(selectedArticle?.priorReviews);
      setIsReviewOpen(true);
    }
  }, []);

  useEffect(() => {
    if (users.length === 0) return;
    if (!fuseInstance) {
      const fuse = new Fuse(users, {
        keys: ["email", "fName", "lName"],
        isCaseSensitive: true,
        includeMatches: true,
        findAllMatches: false,
      });
      setFuseInstance(fuse);
    }
  }, [users, fuseInstance]);

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

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit: async values => {
      try {
        if (!values.title) {
          setInputFieldErrors({ title: "Title is required." });
          return;
        }
        setInputFieldErrors({});

        if (path.length === 0) {
          setError("Please select the path from tree-view.");
          return;
        }
        startLoader();
        if (formik.values.title != selectedArticle?.title) {
          const q = query(
            collection(db, "articles"),
            where("title", "==", values.title),
            where("user", "==", user?.uname)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            alert("An article with the provided title already exists.");
            stopLoader();
            return;
          }
        }
        setOpen(false);
        await updateDoc(doc(db, "articles", selectedArticle.id), {
          title: values.title,
          path,
          updatedAt: new Date(),
        });
        await saveLogs({
          doer: user?.uname,
          action: "Updated Article",
          articleId: selectedArticle?.id,
          title: values.title,
          cursorPosition: lastClickPosition,
        });
        setError("");
        stopLoader();
      } catch (err) {
        console.error(err);
        stopLoader();
      }
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

  const saveAndAnalyze = useCallback(
    async (type: string) => {
      if (selectedArticle?.id) {
        setArticleAndDOM();
        const dataForUpdate: any = {
          updatedAt: new Date(),
        };
        if (type === "content") {
          dataForUpdate["aSteps"] = null;
        } else {
          dataForUpdate["issues"] = null;
        }
        await updateDoc(doc(db, "articles", selectedArticle.id), dataForUpdate);
        await saveLogs({
          doer: user?.uname,
          action: "Modified Article",
          articleId: selectedArticle.id,
          content: content,
          cursorPosition: lastClickPosition,
        });
      }
    },
    [user, content, selectedArticle]
  );

  // const handleChange = useCallback(
  //   (e: any) => {
  //     if (!e.target.value) {
  //       setSelectedArticle(null);
  //       setContent("");
  //     } else {
  //       handleClose();
  //       const selectedArticle = userArticles.find((article: any) => article.id === e.target.value);
  //       setSelectedArticle(selectedArticle);
  //       setArticleTypePath(selectedArticle?.path || []);
  //     }
  //   },
  //   [selectedArticle, userArticles]
  // );

  const handleSelectionChange = useCallback(
    (range: any) => {
      if (range && range.length > 0) {
        const quill = quillRef.current.getEditor();
        const selection = quill.getSelection();
        setSelection(selection);
      }
    },
    [content, selectedArticle]
  );

  const handleBlur = useCallback(() => {
    const quill = quillRef.current.getEditor();
    if (selection && selection.length > 0) {
      quill.formatText(
        selection.index,
        selection.length,
        "background",
        theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG400 : DESIGN_SYSTEM_COLORS.gray300
      );
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

  const handleTreeItemClick = (path: string[]) => {
    setPath(path);
  };

  const renderTree = (node: AcademicArticleCategory | string[], nodeId: string, path: string[]): JSX.Element => {
    if (Array.isArray(node)) {
      return (
        <>
          {node.map((item, index) => (
            <TreeItem
              sx={{
                color: theme => (theme.palette.mode === "dark" ? "inherit" : "black"),
              }}
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
            <TreeItem
              sx={{
                color: theme => (theme.palette.mode === "dark" ? "inherit" : "black"),
              }}
              key={`${nodeId}-${index}`}
              nodeId={`${nodeId}-${index}`}
              label={camelCaseToSpaces(key)}
            >
              {renderTree(node[key], `${nodeId}-${index}`, [...path, key])}
            </TreeItem>
          ))}
        </>
      );
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
    if (!fuseInstance) return;
    const results = fuseInstance
      .search(searchTerm)
      ?.map((result: any) => result.item)
      ?.splice(0, 10);

    return results;
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

  const changeOutline = () => {
    setOpen(true);
    setPath(selectedArticle?.path || []);
    formik.setFieldValue("title", selectedArticle?.title);
  };

  const handleUpdatePriorReviews = async (priorReviews: any, source: any) => {
    if (source === "user" && keyPressed) {
      clearTimeout(priorReviewsTimeoutRef?.current);
      priorReviewsTimeoutRef.current = setTimeout(async () => {
        await updateDoc(doc(db, "articles", selectedArticle.id), {
          priorReviews,
          updatedAt: new Date(),
        });
      }, 1000);
      setPriorReviews(priorReviews);
      setKeyPressed(false);
    }
  };

  const handleUpdateContent = async (content: string, source: any) => {
    if (source === "user" && keyPressed) {
      clearTimeout(contentTimeoutRef?.current);
      contentTimeoutRef.current = setTimeout(async () => {
        await updateDoc(doc(db, "articles", selectedArticle.id), {
          content,
          updatedAt: new Date(),
        });
      }, 1000);

      setContent(content);
      setKeyPressed(false);
    }
  };

  useEffect(() => {
    if (expandedIssue === null) return;
    const issues = selectedArticle?.issues.issues;
    const filteredIssue = issues[expandedIssue];
    if (filteredIssue instanceof Object) {
      const sentences = filteredIssue.sentences;
      highlightSentences(sentences);
    }
  }, [expandedIssue]);

  const highlightSentences = (sentencesToFind: any) => {
    const quill = reviewsQuillRef.current.getEditor();
    quill.formatText(0, articleContent.length, {
      background: false,
    });
    sentencesToFind.forEach((sentence: any) => {
      const index = quill.getText().indexOf(sentence);
      if (index > -1) {
        quill.formatText(
          index,
          sentence.length,
          "background",
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG400 : DESIGN_SYSTEM_COLORS.gray300
        );
      }
    });
  };
  return (
    <Box sx={{ m: "16px 10px" }}>
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
            sx={{ zIndex: 999999, width: "300px", height: "350px", overflowY: "auto" }}
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
                        <Box>
                          <ListItemText primary={`${user.fName} ${user.lName}`} />
                          <Typography variant="subtitle2">{user.email}</Typography>
                        </Box>
                      </Box>
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <IconButton
          onClick={() => {
            router.push("/coauthor");
          }}
        >
          <HomeIcon />
        </IconButton>

        {articleTypePath.length > 0 && (
          <DisciplinesComp
            allContent={articleContent}
            articleTypePath={articleTypePath}
            setArticleTypePath={setArticleTypePath}
            articleTypes={articleTypes}
          />
        )}

        {selectedArticle && selectedArticle?.user === user?.uname && (
          <Button onClick={handleModalOpen} variant="outlined">
            <PeopleAltOutlined /> <Typography color="inherit">Share</Typography>
          </Button>
        )}
      </Box>

      <Box mt={2} id="quill-box">
        {/* <Select
          labelId="coauthor-articles-select"
          id="coauthor-articles-select"
          value={selectedArticle?.id || 0}
          onChange={handleChange}
          sx={{
            zIndex: 9999,
            width: "200px",
            height: "36px",
            position: "absolute",
            right: "355px",
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
        </Select> */}
        <ReactQuill
          modules={{
            clipboard: {
              matchVisual: false,
            },
          }}
          preserveWhitespace={false}
          style={{ height: `calc(100vh - ${isReviewsOpen ? "400" : "170"}px)` }}
          ref={quillRef}
          value={content}
          onChange={(content, {}, source) => handleUpdateContent(content, source)}
          onKeyDown={() => setKeyPressed(true)}
          onBlur={() => handleBlur()}
          onFocus={() => handleFocus()}
          onChangeSelection={(range: any) => handleSelectionChange(range)}
        />
        <Box
          sx={{
            position: "absolute",
            top: (document.getElementById("quill-box")?.offsetTop || 0) + 2,
            right: "13px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <IconButton onClick={() => changeOutline()}>
            <SettingsIcon />
          </IconButton>

          <Button variant="contained" color="success" onClick={() => saveAndAnalyze("content")}>
            Analyze
          </Button>
        </Box>
      </Box>
      <Box mt={isReviewsOpen ? 7 : 6}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "solid 1px #CCCCCC",
            borderLeft: "solid 1px #CCCCCC",
            borderRight: "solid 1px #CCCCCC",
            borderBottom: !isReviewsOpen ? "solid 1px #CCCCCC" : undefined,
            pl: "10px",
            pr: "2px",
            py: "2.5px",
          }}
        >
          <Typography variant="subtitle1">Reviews:</Typography>
          <IconButton
            sx={{
              width: "25px",
              height: "20px",
              color: theme => (theme.palette.mode === "dark" ? "#bebebe" : "rgba(0, 0, 0, 0.6)"),

              fontSize: "16px",

              cursor: "pointer",
            }}
            onClick={() => setIsReviewOpen(!isReviewsOpen)}
          >
            <ArrowForwardIosIcon
              fontSize="inherit"
              sx={{
                transform: isReviewsOpen ? "rotate(90deg)" : "rotate(270deg)",
              }}
            />
          </IconButton>

          <Button
            disabled={!isReviewsOpen}
            variant="contained"
            color="success"
            onClick={() => saveAndAnalyze("reviews")}
          >
            Analyze
          </Button>
        </Box>
        <ReactQuill
          ref={reviewsQuillRef}
          modules={{
            clipboard: {
              matchVisual: false,
            },
            toolbar: false,
          }}
          preserveWhitespace={false}
          style={{ display: !isReviewsOpen ? "none" : undefined, height: "225px" }}
          value={priorReviews}
          onChange={(content, {}, source) => handleUpdatePriorReviews(content, source)}
          onKeyDown={() => setKeyPressed(true)}
        />
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
                <Typography
                  sx={{
                    color: theme => (theme.palette.mode === "dark" ? "inherit" : "black"),
                  }}
                >
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

            <Box mt={2} sx={{ display: "flex", justifyContent: "center", gap: "5px" }}>
              <Button type="submit" variant="outlined">
                Save
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default ContentComp;
