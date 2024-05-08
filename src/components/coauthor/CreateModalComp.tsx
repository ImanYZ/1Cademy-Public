import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button, FormControl, Input, InputLabel, Modal, Tab, Tabs, TextareaAutosize, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { addDoc, collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import ReactQuill from "react-quill";
import { sendMessageToChatGPT } from "src/services/openai";

import { getArticleTypes } from "@/lib/coauthor";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { useAuth } from "../../context/AuthContext";
if (typeof window !== "undefined") {
  const Popper = require("popper.js").default;
  const jQuery = require("jquery");
  (window as any).Popper = Popper.default;
  (window as any).$ = (window as any).jQuery = jQuery;
  require("bootstrap");
}

type AcademicArticleCategory = {
  [key: string]: AcademicArticleCategory | string[];
};

type Props = {
  open: boolean;
  setOpen: any;
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

const CreateModalComp = ({ open, setOpen }: Props) => {
  const router = useRouter();
  const db = getFirestore();
  const [{ user }] = useAuth();
  const { data } = useQuery("articleTypes", getArticleTypes);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [modalSection, setModalSection] = useState<number>(0);
  const [path, setPath] = useState<string[]>([]);
  const [draft, setDraft] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [inputFieldErrors, setInputFieldErrors] = useState<{ [key: string]: string }>({});
  const [priorReviews, setPriorReviews] = useState<string>("");
  const [articleTypes, setArticleTypes] = useState<any>({});

  useEffect(() => {
    if (data) {
      setArticleTypes(data);
    }
  }, [data]);

  const saveLogs = async (logs: any) => {
    try {
      addDoc(collection(db, "articleLogs"), {
        ...logs,
        createdAt: new Date(),
      });
    } catch (error) {}
  };

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
          outline: {
            outlined: values.outlined,
            idea: values.idea,
            information: values.information,
            objective: values.objective,
          },
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
          user: user?.uname,
          createdAt: new Date(),
        });
        let text = "";
        for (const key in GPTResponse.instructions) {
          if (GPTResponse.instructions.hasOwnProperty(key)) {
            const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
            text += `${capitalizedKey} ${GPTResponse.instructions[key]}\n\n <hr>`;
          }
        }

        await addDoc(collection(db, "articleMessages"), {
          text: text,
          improvement: null,
          initial: true,
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
        });
        router.push(`/coauthor/${docRef.id}`);
      } else {
        const articleData: any = {
          title: values.title,
          path,
          outline: {
            outlined: values.outlined,
            idea: values.idea,
            information: values.information,
            objective: values.objective,
          },
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
          user: user?.uname,
          createdAt: new Date(),
        };
        if (draft) {
          articleData["content"] = draft;
        }
        if (priorReviews) {
          articleData["priorReviews"] = priorReviews;
        }
        const docRef = await addDoc(collection(db, "articles"), articleData);
        await saveLogs({
          doer: user?.uname,
          action: "Created New Article",
          articleId: docRef.id,
          title: values.title,
        });
        router.push(`/coauthor/${docRef.id}`);
      }
      setError("");
      setModalSection(0);
      setSelectedTab(0);
      stopLoader();
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleTreeItemClick = (path: string[]) => {
    setPath(path);
  };

  const handleClose = () => {
    setOpen(false);
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
    <Box>
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
            width: 800,
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
                  selectedTab === 1 && (
                    <>
                      <ReactQuill style={{ height: "200px" }} value={draft} onChange={setDraft} />
                      <Box mt={8}>
                        <TextareaAutosize
                          minRows={4}
                          placeholder="Copy the reviews that you have already received below:"
                          style={{
                            width: "100%",
                            fontSize: 16,
                            border: "none",
                            outline: "none",
                            padding: "15px",
                            fontFamily: "system-ui",
                            background: DESIGN_SYSTEM_COLORS.notebookG700,
                            color: "white",
                          }}
                          value={priorReviews}
                          onChange={e => setPriorReviews(e.target.value)}
                        />
                      </Box>
                    </>
                  )
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

export default CreateModalComp;
