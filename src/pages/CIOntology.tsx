import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SendIcon from "@mui/icons-material/Send";
import { TreeItem, TreeView } from "@mui/lab";
import { Avatar, Box, Button, Grid, IconButton, Link, Paper, TextField, Tooltip, Typography } from "@mui/material";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  IActivity,
  IActor,
  IEvaluation,
  IIncentive,
  IOntology,
  IProcesse,
  IReward,
  IRole,
  ISubOntology,
} from "src/types/IOntology";

import AppHeaderMemoized from "@/components/Header/AppHeader";
import withAuthUser from "@/components/hoc/withAuthUser";
import MarkdownRender from "@/components/Markdown/MarkdownRender";
import Ontology from "@/components/ontology/Ontology";
import SneakMessage from "@/components/ontology/SneakMessage";
import { useAuth } from "@/context/AuthContext";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import { newId } from "@/lib/utils/newFirestoreId";

import Custom404 from "./404";

type IOntologyPath = {
  id: string;
  title: string;
};
const INITIAL_VALUES: { [key: string]: IActivity | IActor | IProcesse | IEvaluation | IRole | IIncentive | IReward } = {
  Activity: {
    title: "",
    description: "",
    plainText: {
      notes: "",
      Preconditions: "",
      Postconditions: "",
    },
    subOntologies: {
      Actor: {},
      Process: {},
      Specializations: {},
      "Evaluation Dimension": {},
    },
    ontologyType: "Activity",
  },
  Actor: {
    title: "",
    description: "",
    plainText: {
      "Type of actor": "",
      notes: "",
      Abilities: "",
    },
    subOntologies: {
      Specializations: {},
    },
    ontologyType: "Actor",
  },
  Process: {
    title: "",
    description: "",
    plainText: {
      "Type of Process": "",
      notes: "",
      Subactivities: "",
      Dependencies: "",
      "Performance prediction models": "",
    },
    subOntologies: { Role: {}, Specializations: {} },
    ontologyType: "Process",
  },
  "Evaluation Dimension": {
    title: "",
    description: "",
    plainText: {
      "Evaluation type": "",
      notes: "",
      "Measurement units": "",
      "Direction of desirability": "",
      "Criteria for acceptability": "",
    },
    subOntologies: {
      Specializations: {},
    },
    ontologyType: "Evaluation Dimension",
  },
  Role: {
    title: "",
    description: "",
    subOntologies: { Actor: {}, Specializations: {}, Incentive: {} },
    plainText: {
      "Role type": "",
      Units: "",
      "Capabilities required": "",
      notes: "",
    },
    ontologyType: "Role",
  },
  Reward: {
    title: "",
    description: "",
    subOntologies: { Specializations: {} },
    plainText: {
      Units: "",
      "Reward type": "",
    },
    ontologyType: "Reward",
  },
  Incentive: {
    title: "",
    description: "",
    subOntologies: { Specializations: {}, "Evaluation Dimension": {}, Reward: {} },
    plainText: {
      "Reward function": "",
      "Capabilities required": "",
      notes: "",
    },
    ontologyType: "Incentive",
  },
};

const CIOntology = () => {
  const db = getFirestore();
  // const MAIN_CATEGORIES = [
  //   { title: "WHAT: Activities", id: newId(db) },
  //   { title: "WHO: Actors", id: newId(db) },
  //   { title: "HOW: Processes", id: newId(db) },
  //   { title: "WHY: Evaluation", id: newId(db) },
  // ];
  const [{ user }] = useAuth();

  const [ontologies, setOntologies] = useState<any>([]);
  // const [userOntology, setUserOntology] = useState<IUserOntology[]>([]);
  const [openOntology, setOpenOntology] = useState<any>(null);
  const [ontologyPath, setOntologyPath] = useState<IOntologyPath[]>([]);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [mainSpecializations, setMainSpecializations] = useState<any>({});
  const [editOntology, setEditOntology] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const { confirmIt, ConfirmDialog } = useConfirmDialog();
  const [editingComment, setEditingComment] = useState("");

  // const [classes, setClasses] = useState([]);

  const headerRef = useRef<HTMLHeadElement | null>(null);

  const getPath = (newPath: string[]) => {
    const ontologyPath = [];
    for (let path of newPath) {
      const ontologyIdx = ontologies.findIndex((onto: any) => onto.id === path);
      if (ontologyIdx !== -1) {
        ontologyPath.push({
          id: path,
          title: ontologies[ontologyIdx].title,
        });
      }
    }
    return ontologyPath;
  };

  const getSpecializationsTree = ({ mainOntologies, path }: any) => {
    const _mainSpecializations: any = {};
    for (let ontlogy of mainOntologies) {
      let specializations: any = [];
      for (let category of Object.keys(ontlogy?.subOntologies?.Specializations)) {
        const _specializations =
          ontologies.filter((onto: any) => {
            const arrayOntologies = ontlogy?.subOntologies?.Specializations[category]?.ontologies.map((o: any) => o.id);
            return arrayOntologies.includes(onto.id);
          }) || [];
        specializations = [...specializations, ..._specializations];
      }
      _mainSpecializations[ontlogy.title] = {
        id: ontlogy.id,
        path: [...path, ontlogy.id],
        specializations: getSpecializationsTree({ mainOntologies: specializations, path: [...path, ontlogy.id] }),
      };
    }
    return _mainSpecializations;
  };
  // const addMissingCategories = ({ __mainSpecializations }: any) => {
  //   for (let category of ["WHAT: Activities", "WHO: Actors", "HOW: Processes", "WHY: Evaluation"]) {
  //     if (!__mainSpecializations.hasOwnProperty(category)) {
  //       __mainSpecializations = {
  //         [category]: {
  //           id: newId(db),
  //           specializations: {},
  //         },
  //         ...__mainSpecializations,
  //       };
  //     }
  //   }
  //   return __mainSpecializations;
  // };
  useEffect(() => {
    const mainOntologies = ontologies.filter((ontology: any) => ontology.category);
    mainOntologies.sort((a: any, b: any) => {
      const order = ["WHAT: Activities", "WHO: Actors", "HOW: Processes", "WHY: Evaluation"];
      return order.indexOf(a.title) - order.indexOf(b.title);
    });
    let __mainSpecializations = getSpecializationsTree({ mainOntologies, path: [] });
    // __mainSpecializations = addMissingCategories({ __mainSpecializations });
    /* ------------------  */
    setMainSpecializations(__mainSpecializations);
  }, [ontologies]);

  useEffect(() => {
    if (!user) return;
    if (!ontologies.length) return;

    const userQuery = query(collection(db, "users"), where("userId", "==", user.userId));
    const unsubscribeUser = onSnapshot(userQuery, snapshot => {
      const docChange = snapshot.docChanges()[0];
      const dataChange = docChange.doc.data();
      setOntologyPath(getPath(dataChange?.ontologyPath || []));
      const lastOntology = dataChange?.ontologyPath.reverse()[0];
      const ontologyIdx = ontologies.findIndex((ontology: any) => ontology.id === lastOntology);
      if (ontologies[ontologyIdx]) setOpenOntology(ontologies[ontologyIdx]);
    });

    return () => unsubscribeUser();
  }, [db, user, ontologies]);

  // useEffect(() => {
  //   if (!user) return;
  //   const ontologyQuery = query(collection(db, "userOntology"), where("uname", "==", user.uname));
  //   const unsubscribeOntology = onSnapshot(ontologyQuery, snapshot => {
  //     const docChanges = snapshot.docChanges();
  //     setUserOntology(userOntologies => {
  //       for (let change of docChanges) {
  //         const changeData: any = change.doc.data();
  //         const previousIdx = userOntologies.findIndex(d => d.id === changeData.id);
  //         if (change.type === "removed" && previousIdx !== -1) {
  //           userOntologies.splice(previousIdx, 1);
  //         } else if ((change.type === "modified" || change.type === "added") && previousIdx !== -1) {
  //           userOntologies[previousIdx] = { id: change.doc.id, ...changeData };
  //         } else if (change.type === "added") {
  //           userOntologies.push({
  //             id: change.doc.id,
  //             ...changeData,
  //           });
  //         }
  //       }
  //       return userOntologies;
  //     });
  //   });
  //   return () => unsubscribeOntology();
  // }, [user, db]);

  useEffect(() => {
    const ontologyQuery = query(collection(db, "ontology"), where("deleted", "==", false));
    const unsubscribeOntology = onSnapshot(ontologyQuery, snapshot => {
      const docChanges = snapshot.docChanges();

      setOntologies((ontologies: IOntology[]) => {
        const _ontologies = [...ontologies];
        for (let change of docChanges) {
          const changeData: any = change.doc.data();

          const previousIdx = _ontologies.findIndex(d => d.id === change.doc.id);
          if (change.type === "removed" && previousIdx !== -1) {
            _ontologies.splice(previousIdx, 1);
          } else if (previousIdx !== -1) {
            _ontologies[previousIdx] = { id: change.doc.id, ...changeData };
          } else {
            _ontologies.push({
              id: change.doc.id,
              ...changeData,
            });
          }
        }
        return _ontologies;
      });
    });
    return () => unsubscribeOntology();
  }, [db]);

  const getParent = (type: string) => {
    if (type === "Evaluation") {
      return mainSpecializations["WHY: Evaluation"].id;
    } else if (type === "Actor") {
      return mainSpecializations["WHO: Actors"].id;
    } else if (type === "Process") {
      return mainSpecializations["HOW: Processes"].id;
    }
  };

  const handleLinkNavigation = useCallback(
    async (path: { id: string; title: string }, type: string) => {
      try {
        if (!user) return;
        if (
          ontologies
            .filter((ontology: any) => ontology.category)
            .map((o: any) => o.title)
            .includes(path.title)
        )
          return;
        const ontologyIndex = ontologies.findIndex((ontology: any) => ontology.id === path.id);

        if (ontologyIndex !== -1) {
          setOpenOntology(ontologies[ontologyIndex]);
        } else {
          const parent = getParent(INITIAL_VALUES[type].ontologyType);
          const parentSet: any = new Set([openOntology.id, parent]);
          const parents = [...parentSet];
          const newOntology = INITIAL_VALUES[type];
          addNewOntology({ id: path.id, newOntology: { parents, ...newOntology } });
          setOpenOntology({ id: path.id, ...newOntology, parents });
        }
        let _ontologyPath = [...ontologyPath];
        const pathIdx = _ontologyPath.findIndex((p: any) => p.id === path.id);
        if (pathIdx !== -1) {
          _ontologyPath = _ontologyPath.slice(0, pathIdx + 1);
        } else {
          _ontologyPath.push(path);
        }

        await updateUserDoc([..._ontologyPath.map(onto => onto.id)]);
      } catch (error) {
        console.error(error);
      }
    },
    [ontologies, ontologyPath]
  );

  const updateUserDoc = async (ontologyPath: string[]) => {
    if (!user) return;
    const userQuery = query(collection(db, "users"), where("userId", "==", user.userId));
    const userDocs = await getDocs(userQuery);
    const userDoc = userDocs.docs[0];
    await updateDoc(userDoc.ref, { ontologyPath });
  };

  const addNewOntology = useCallback(
    async ({ id, newOntology }: { id: string; newOntology: any }) => {
      try {
        const newOntologyRef = doc(collection(db, "ontology"), id);
        await setDoc(newOntologyRef, { ...newOntology, deleted: false });
        setEditOntology(id);
      } catch (error) {
        console.error(error);
      }
    },
    [ontologies]
  );

  const addSubOntologyToParent = async (type: string, id: string) => {
    const parentId = getParent(type);
    if (parentId) {
      const parent: any = ontologies.find((ontology: any) => ontology.id === parentId);
      const ontologyRef = doc(collection(db, "ontology"), parentId);
      const specializations = parent.subOntologies.Specializations;
      const specializationIdx = parent.subOntologies.Specializations.findIndex((spcial: any) => spcial.id === id);
      if (specializationIdx === -1) {
        specializations.push({
          id,
          title: "",
        });
      }
      parent.subOntologies.Specializations = specializations;
      await updateDoc(ontologyRef, parent);
    }
  };

  const saveSubOntology = async (subOntology: ISubOntology, type: string, id: string) => {
    try {
      if (!openOntology) return;
      const ontologyParentRef = doc(collection(db, "ontology"), id);
      const ontologyParentDoc = await getDoc(ontologyParentRef);
      const ontologyParent: any = ontologyParentDoc.data();
      if (!ontologyParent) return;
      const idx = ontologyParent.subOntologies[type].findIndex((sub: ISubOntology) => sub.id === subOntology.id);
      if (idx === -1) {
        ontologyParent.subOntologies[type].push({
          title: subOntology.title,
          id: subOntology.id,
        });
      } else {
        ontologyParent[type][idx].title = subOntology.title;
      }
      const newOntologyRef = doc(collection(db, "ontology"), subOntology.id);
      const newOntologyDoc = await getDoc(newOntologyRef);
      if (newOntologyDoc.exists()) {
        await updateDoc(newOntologyRef, { title: subOntology.title });
      }
      await updateDoc(ontologyParentRef, ontologyParent);
      let subOntologyType = type;
      if (type === "Specializations") {
        subOntologyType = ontologyParent.ontologyType;
      }
      if (type === "Evaluation Dimensions") {
        subOntologyType = "Evaluation";
      }
      handleLinkNavigation({ id: subOntology.id, title: subOntology.title }, subOntologyType);
      await addSubOntologyToParent(subOntologyType, subOntology.id);
    } catch (error) {
      console.error(error);
    }
  };

  const openMainCategory = useCallback(
    async (category: string, path: string[]) => {
      if (!user) return;
      const ontologyIdx = ontologies.findIndex((onto: any) => onto.title === category);
      let _path = [...path];
      if (ontologyIdx !== -1) {
        setOpenOntology(ontologies[ontologyIdx]);
      }
      await updateUserDoc([..._path]);
    },
    [ontologies, user]
  );
  const getClasses = (mainSpecializations: any) => {
    let _mainSpecializations = {};
    for (let category in mainSpecializations) {
      _mainSpecializations = {
        ..._mainSpecializations,
        ...mainSpecializations[category].specializations,
      };
    }
    return _mainSpecializations;
  };
  const TreeViewSimplified = useCallback(
    ({ mainSpecializations }: any) => {
      /* 
  mainSpecializations is an object like: 
  {
    ["TITLE"]:{
        id:"id",
        specializations:
          {
            ["TITLE1"]:{
               id:"id1",
               specializations:[]
            },
            ["TITLE2"]:{
               id:"id2",
               specializations:[]
            }
          }
        
    }
  }
   */
      return (
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          defaultExpanded={[]}
          sx={{
            "& .Mui-selected": {
              backgroundColor: "transparent", // Remove the background color
            },
          }}
        >
          {Object.keys(mainSpecializations).map(category => (
            <TreeItem
              key={mainSpecializations[category].id}
              nodeId={mainSpecializations[category].id}
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography>
                    {category.split(" ").splice(0, 3).join(" ") + (category.split(" ").length > 3 ? "..." : "")}
                  </Typography>
                  {!["WHAT: Activities", "WHO: Actors", "HOW: Processes", "WHY: Evaluation"].includes(category) && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        openMainCategory(category, mainSpecializations[category]?.path || []);
                      }}
                      sx={{
                        ml: "5px",
                        fontSize: "14px",
                        border: "none",
                        background: "transparent",
                      }}
                    >
                      Open
                    </Button>
                  )}
                </Box>
              }
              sx={{ mt: "5px" }}
            >
              {Object.keys(mainSpecializations[category].specializations).length > 0 && (
                <TreeViewSimplified mainSpecializations={mainSpecializations[category].specializations} />
              )}
            </TreeItem>
          ))}
        </TreeView>
      );
    },
    [mainSpecializations]
  );
  const handleSendComment = async () => {
    try {
      if (!user) return;
      const ontologyDoc = await getDoc(doc(collection(db, "ontology"), openOntology.id));
      const ontologyData = ontologyDoc.data();
      const comments = ontologyData?.comments || [];
      comments.push({
        id: newId(db),
        content: newComment,
        sender: (user.fName || "") + " " + user.lName,
        senderImage: user.imageUrl,
        senderUname: user.uname,
        createdAt: new Date(),
      });
      await updateDoc(ontologyDoc.ref, { comments });
      setNewComment("");
    } catch (error) {
      console.error(error);
    }
  };
  function formatFirestoreTimestampWithMoment(timestamp: any) {
    const firestoreTimestamp = timestamp.toDate();
    const now = moment();
    const momentTimestamp = moment(firestoreTimestamp);
    const hoursAgo = now.diff(momentTimestamp, "hours");

    if (hoursAgo < 1) {
      return momentTimestamp.format("h:mm A") + " Today";
    } else {
      return momentTimestamp.format("h:mm A MMM D, YYYY");
    }
  }

  const deleteComment = async (commentId: string) => {
    try {
      if (editingComment === commentId) {
        setEditingComment("");
        return;
      }
      if (await confirmIt("Are you sure you want to delete the comment?")) {
        const ontologyDoc = await getDoc(doc(collection(db, "ontology"), openOntology.id));
        const ontologyData = ontologyDoc.data();
        let comments = ontologyData?.comments || [];
        comments = comments.filter((c: any) => c.id !== commentId);
        await updateDoc(ontologyDoc.ref, { comments });
      }
    } catch (error) {
      console.error(error);
    }
  };
  const editComment = async (comment: any) => {
    try {
      if (comment.id === editingComment) {
        const ontologyDoc = await getDoc(doc(collection(db, "ontology"), openOntology.id));
        const ontologyData = ontologyDoc.data();
        let comments = ontologyData?.comments || [];
        const commentIdx = comments.findIndex((c: any) => c.id == comment.id);
        comments[commentIdx].content = newComment;
        await updateDoc(ontologyDoc.ref, { comments });
        setEditingComment("");
        setNewComment("");
        return;
      }
      setEditingComment(comment.id);
      setNewComment(comment.content);
    } catch (error) {
      console.error(error);
    }
  };
  if (!user?.claims.ontology) {
    return <Custom404 />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <AppHeaderMemoized
        ref={headerRef}
        page="ONE_CADEMY"
        mitpage={true}
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

      <Grid container>
        <Grid item xs={2.5}>
          <Box
            sx={{
              mt: "30px",
              height: "100vh",
              overflow: "auto",
            }}
          >
            <Box sx={{ pb: "190px" }}>
              <TreeViewSimplified mainSpecializations={mainSpecializations} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6.5}>
          <Box
            sx={{
              backgroundColor: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookMainBlack : theme.palette.common.gray50,
              p: "20px",
              overflow: "auto",
              height: "94vh",
            }}
          >
            <Breadcrumbs>
              {ontologyPath.length > 1 &&
                ontologyPath.map(path => (
                  <Link
                    underline="hover"
                    key={path.id}
                    onClick={() => handleLinkNavigation(path, "")}
                    sx={{ cursor: "pointer" }}
                  >
                    {path.title.split(" ").splice(0, 3).join(" ") + (path.title.split(" ").length > 3 ? "..." : "")}
                  </Link>
                ))}
            </Breadcrumbs>

            {openOntology && (
              <Ontology
                openOntology={openOntology}
                setOpenOntology={setOpenOntology}
                handleLinkNavigation={handleLinkNavigation}
                setOntologyPath={setOntologyPath}
                ontologyPath={ontologyPath}
                saveSubOntology={saveSubOntology}
                setSnackbarMessage={setSnackbarMessage}
                updateUserDoc={updateUserDoc}
                user={user}
                mainSpecializations={getClasses(mainSpecializations)}
                ontologies={ontologies}
                addNewOntology={addNewOntology}
                INITIAL_VALUES={INITIAL_VALUES}
                editOntology={editOntology}
                setEditOntology={setEditOntology}
              />
            )}
          </Box>
        </Grid>

        <Grid item xs={2}>
          <Box sx={{ padding: "8px" }}>
            {(openOntology?.comments || []).map((comment: any) => (
              <Paper key={comment.id} elevation={3} sx={{ mt: "15px", padding: "8px" }}>
                <Box sx={{ mb: "15px", display: "flex", alignItems: "center" }}>
                  <Avatar src={comment.senderImage} />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      ml: "5px",
                    }}
                  >
                    <Typography sx={{ ml: "4px", fontSize: "14px" }}>{comment.sender}</Typography>
                    <Typography sx={{ ml: "4px", fontSize: "12px" }}>
                      {formatFirestoreTimestampWithMoment(comment.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ pl: "5px" }}>
                  {comment.id === editingComment ? (
                    <TextField
                      variant="outlined"
                      multiline
                      fullWidth
                      value={newComment}
                      onChange={(e: any) => {
                        setNewComment(e.target.value);
                      }}
                      autoFocus
                    />
                  ) : (
                    <MarkdownRender text={comment.content} />
                  )}
                </Box>

                {comment.senderUname === user.uname && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "9px" }}>
                    <Button onClick={() => editComment(comment)}>
                      {comment.id === editingComment ? "Save" : "Edit"}
                    </Button>
                    <Button onClick={() => deleteComment(comment.id)}>
                      {" "}
                      {comment.id === editingComment ? "Cancel" : "Delete"}
                    </Button>
                  </Box>
                )}
              </Paper>
            ))}

            {!editingComment && (
              <TextField
                sx={{ position: "fixed", bottom: 0, padding: "8px" }}
                variant="outlined"
                multiline
                // fullWidth
                placeholder="Add a Comment..."
                value={newComment}
                onChange={(e: any) => {
                  setNewComment(e.target.value);
                }}
                InputProps={{
                  endAdornment: (
                    <Tooltip title={"Share"}>
                      <IconButton color="primary" onClick={handleSendComment} edge="end">
                        <SendIcon />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
                autoFocus
              />
            )}
          </Box>{" "}
        </Grid>
      </Grid>
      {ConfirmDialog}
      <SneakMessage newMessage={snackbarMessage} setNewMessage={setSnackbarMessage} />
    </Box>
  );
};
export default withAuthUser({
  shouldRedirectToLogin: true,
  shouldRedirectToHomeIfAuthenticated: false,
})(CIOntology);
