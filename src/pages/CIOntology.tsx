import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TreeItem, TreeView } from "@mui/lab";
import { Box, Button, Link, Typography } from "@mui/material";
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
import { useCallback, useEffect, useRef, useState } from "react";
import { IActivity, IActor, IEvaluation, IOntology, IProcesse, ISubOntology } from "src/types/IOntology";

import AppHeaderMemoized from "@/components/Header/AppHeader";
import withAuthUser from "@/components/hoc/withAuthUser";
import Ontology from "@/components/ontology/Ontology";
import SneakMessage from "@/components/ontology/SneakMessage";
import { useAuth } from "@/context/AuthContext";
import { newId } from "@/lib/utils/newFirestoreId";

import Custom404 from "./404";

type IOntologyPath = {
  id: string;
  title: string;
};
const INITIAL_VALUES: any = {
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
      "Evaluation Dimensions": {},
    },
    ontologyType: "Activity",
  },
  Actor: {
    title: "",
    description: "",
    Type: "",
    plainText: {
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
    Type: "",
    plainText: {
      notes: "",
      Subactivities: "",
      Dependencies: "",
      "Performance prediction models": "",
    },
    subOntologies: { Roles: {}, Specializations: {} },
    ontologyType: "Process",
  },
  Evaluation: {
    title: "",
    description: "",
    type: "",
    plainText: {
      notes: "",
      "Measurement units": "",
      "Direction of desirability": "",
      "Criteria for acceptability:": "",
    },
    subOntologies: {
      Specializations: {},
    },
    ontologyType: "Evaluation",
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
        const _specializations = ontologies.filter((onto: any) => {
          const findIdx = (ontlogy?.subOntologies?.Specializations[category]?.ontologies || []).findIndex(
            (o: any) => o.id === onto.id
          );
          return findIdx !== -1;
        });
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
  const addMissingCategories = ({ __mainSpecializations }: any) => {
    for (let category of ["WHAT: Activities", "WHO: Actors", "HOW: Processes", "WHY: Evaluation"]) {
      if (!__mainSpecializations.hasOwnProperty(category)) {
        __mainSpecializations = {
          [category]: {
            id: newId(db),
            specializations: {},
          },
          ...__mainSpecializations,
        };
      }
    }
    return __mainSpecializations;
  };
  useEffect(() => {
    const mainOntologies = ontologies.filter((ontology: any) =>
      ["WHAT: Activities", "WHO: Actors", "HOW: Processes", "WHY: Evaluation"].includes(ontology.title)
    );
    mainOntologies.sort((a: any, b: any) => {
      const order = ["WHAT: Activities", "WHO: Actors", "HOW: Processes", "WHY: Evaluation"];
      return order.indexOf(a.title) - order.indexOf(b.title);
    });
    let __mainSpecializations = getSpecializationsTree({ mainOntologies, path: [] });
    __mainSpecializations = addMissingCategories({ __mainSpecializations });
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

  const getMainCategory = (category: string) => {
    let newOntology: IActivity | IActor | IProcesse | IEvaluation | null = null;
    if (category === "WHAT: Activities") {
      newOntology = {
        title: "WHAT: Activities",
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
          "Evaluation Dimensions": {},
        },
        ontologyType: "Activity",

        locked: true,
      };
    } else if (category === "WHO: Actors") {
      newOntology = {
        title: "WHO: Actors",
        Type: "",
        description: "",
        plainText: {
          notes: "",
          Abilities: "",
        },
        subOntologies: {
          Specializations: {},
        },

        ontologyType: "Actor",
        locked: true,
      };
    } else if (category === "HOW: Processes") {
      newOntology = {
        title: "HOW: Processes",
        description: "",
        Type: "",
        plainText: {
          notes: "",
          Subactivities: "",
          Dependencies: "",
          "Performance prediction models": "",
        },
        subOntologies: { Roles: {}, Specializations: {} },
        ontologyType: "Process",

        locked: true,
      };
    } else if (category === "WHY: Evaluation") {
      newOntology = {
        title: "WHY: Evaluation",
        description: "",
        type: "",
        plainText: {
          notes: "",
          "Measurement units": "",
          "Direction of desirability": "",
          "Criteria for acceptability": "",
        },
        subOntologies: {
          Specializations: {},
        },
        ontologyType: "Evaluation",

        locked: true,
      };
    }
    return newOntology;
  };
  const openMainCategory = useCallback(
    async (category: string, path: string[]) => {
      if (!user) return;
      const ontologyIdx = ontologies.findIndex((onto: any) => onto.title === category);
      let _path = [...path];
      let newId = "";
      if (ontologyIdx !== -1) {
        setOpenOntology(ontologies[ontologyIdx]);
        newId = ontologies[ontologyIdx].id;
      } else {
        const newOntology = getMainCategory(category);
        setOpenOntology(newOntology);
        const ontologyRef = doc(collection(db, "ontology"));
        await setDoc(ontologyRef, {
          ...newOntology,
          createdAt: new Date(),
          createdBy: user.uname,
          deleted: false,
        });
        newId = ontologyRef.id;
        _path.push(newId);
      }
      await updateUserDoc([..._path]);
    },
    [ontologies, user]
  );

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
                  <Typography>{category}</Typography>
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

  if (!user?.claims.ontology) {
    return <Custom404 />;
  }

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
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: "0",
          top: "70px",
          width: "400px",
          height: "590vh",
          backgroundColor: theme =>
            theme.palette.mode === "dark" ? theme.palette.common.notebookMainBlack : theme.palette.common.gray50,
          p: "20px",
          overflow: "auto",
        }}
      >
        <TreeViewSimplified mainSpecializations={mainSpecializations} />
      </Box>

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
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: "70px",
          right: "0px",
          bottom: "0px",
          backgroundColor: theme =>
            theme.palette.mode === "dark" ? theme.palette.common.notebookMainBlack : theme.palette.common.gray50,
          p: "20px",
          overflow: "auto",
        }}
      >
        <Breadcrumbs sx={{ ml: "40px", position: "sticky" }}>
          {ontologyPath.length > 1 &&
            ontologyPath.map(path => (
              <Link
                underline="hover"
                key={path.id}
                onClick={() => handleLinkNavigation(path, "")}
                sx={{ cursor: "pointer" }}
              >
                {path.title}
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
            mainSpecializations={mainSpecializations}
            ontologies={ontologies}
            addNewOntology={addNewOntology}
            INITIAL_VALUES={INITIAL_VALUES}
          />
        )}
      </Box>
      <SneakMessage newMessage={snackbarMessage} setNewMessage={setSnackbarMessage} />
    </Box>
  );
};
export default withAuthUser({
  shouldRedirectToLogin: true,
  shouldRedirectToHomeIfAuthenticated: false,
})(CIOntology);
