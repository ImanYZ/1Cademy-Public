import { Box, Link } from "@mui/material";
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
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { IActivity, IActor, IEvaluation, IOntology, IProcesse, ISubOntology } from "src/types/IOntology";

import AppHeaderMemoized from "@/components/Header/AppHeader";
import withAuthUser from "@/components/hoc/withAuthUser";
import Ontology from "@/components/ontology/Ontology";
import SneakMessage from "@/components/ontology/SneakMessage";
import { useAuth } from "@/context/AuthContext";
import { newId } from "@/lib/utils/newFirestoreId";

import darkModeLibraryImage from "../../public/darkModeLibraryBackground.jpg";
import Custom404 from "./404";

type IOntologyPath = {
  id: string;
  title: string;
};
const INITIAL_VALUES: any = {
  Actvity: {
    title: "",
    description: "",
    plainText: {
      Preconditions: [],
      Postconditions: [],
      "Evaluation Dimensions": [],
    },
    subOntologies: {
      Actor: [],
      Process: [],
      Specializations: [],
    },
    ontologyType: "Activity",
    notes: [],
  },
  Actor: {
    title: "",
    description: "",
    Type: "",
    plainText: {
      Abilities: [],
    },
    subOntologies: {
      Specializations: [],
    },
    ontologyType: "Actor",
    notes: [],
  },
  Process: {
    title: "",
    description: "",
    Type: "",
    plainText: {
      Subactivities: [],
      Dependencies: [],
      "Performance prediction models": [],
    },
    subOntologies: { Roles: [], Specializations: [] },
    ontologyType: "Process",
    notes: [],
  },
  Evaluation: {
    title: "",
    description: "",
    type: "",
    plainText: {
      "Measurement units": [],
      "Direction of desirability": [],
      "Criteria for acceptability:": [],
    },
    subOntologies: {
      Specializations: [],
    },
    ontologyType: "Evaluation",
    notes: [],
  },
};

const CIOntology = () => {
  const db = getFirestore();
  const MAIN_CATEGORIES = [
    { title: "WHAT: Activities", id: newId(db) },
    { title: "WHO: Actors", id: newId(db) },
    { title: "HOW: Processes", id: newId(db) },
    { title: "WHY: Evaluation", id: newId(db) },
  ];
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

  useEffect(() => {
    if (!user || !ontologies.length) return;

    const _mainSpecializations: any = {};
    for (let category of MAIN_CATEGORIES) {
      const categoryOntology = ontologies.find((onto: any) => onto.title === category.title);
      _mainSpecializations[category.title] = categoryOntology || {};
    }
    setMainSpecializations(_mainSpecializations);
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

  const handleLinkNavigation = useCallback(
    async (path: { id: string; title: string }, type: string) => {
      try {
        if (!user) return;
        const ontologyIndex = ontologies.findIndex((ontology: any) => ontology.id === path.id);
        if (ontologyIndex !== -1) {
          setOpenOntology(ontologies[ontologyIndex]);
        } else {
          const newOntology = INITIAL_VALUES[type];
          addNewOntology({ id: path.id, newOntology });
          setOpenOntology(newOntology);
        }
        let _ontologyPath = [...ontologyPath];
        const pathIdx = _ontologyPath.findIndex((p: any) => p.id === path.id);
        if (pathIdx !== -1) {
          _ontologyPath = _ontologyPath.slice(0, pathIdx + 1);
        } else {
          _ontologyPath.push(path);
        }
        setOntologyPath(_ontologyPath);

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
        await setDoc(newOntologyRef, newOntology);
      } catch (error) {
        console.error(error);
      }
    },
    [ontologies]
  );

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
      handleLinkNavigation({ id: subOntology.id, title: subOntology.title }, subOntologyType);
    } catch (error) {
      console.error(error);
    }
  };
  const openMainCategory = useCallback(
    async (e: any) => {
      if (!user) return;
      const category = e.target.innerHTML;
      const ontologyIdx = ontologies.findIndex((onto: any) => onto.title === category);
      let newId = "";
      let title = "";
      if (ontologyIdx !== -1) {
        setOpenOntology(ontologies[ontologyIdx]);
        newId = ontologies[ontologyIdx].id;
        title = ontologies[ontologyIdx].title;
      } else {
        let newOntology: IActivity | IActor | IProcesse | IEvaluation | null = null;
        if (category === "WHAT: Activities") {
          newOntology = {
            title: "WHAT: Activities",
            description: "",
            plainText: {
              Preconditions: [],
              Postconditions: [],
              "Evaluation Dimensions": [],
            },
            subOntologies: {
              Actor: [],
              Process: [],
              Specializations: [],
            },
            ontologyType: "Activity",
            notes: [],
            locked: true,
          };
        } else if (category === "WHO: Actors") {
          newOntology = {
            title: "WHO: Actors",
            Type: "",
            description: "",
            plainText: {
              Abilities: [],
            },
            subOntologies: {
              Specializations: [],
            },
            notes: [],
            ontologyType: "Actor",
            locked: true,
          };
        } else if (category === "HOW: Processes") {
          newOntology = {
            title: "HOW: Processes",
            description: "",
            Type: "",
            plainText: {
              Subactivities: [],
              Dependencies: [],
              "Performance prediction models": [],
            },
            subOntologies: { Roles: [], Specializations: [] },
            ontologyType: "Process",
            notes: [],
            locked: true,
          };
        } else if (category === "WHY: Evaluation") {
          newOntology = {
            title: "WHY: Evaluation",
            description: "",
            type: "",
            plainText: {
              "Measurement units": [],
              "Direction of desirability": [],
              "Criteria for acceptability:": [],
            },
            subOntologies: {
              Specializations: [],
            },
            ontologyType: "Evaluation",
            notes: [],
            locked: true,
          };
        }
        setOpenOntology(newOntology);
        const ontologyRef = doc(collection(db, "ontology"));
        await setDoc(ontologyRef, {
          ...newOntology,
          createdAt: new Date(),
          createdBy: user.uname,
          deleted: false,
        });
        newId = ontologyRef.id;
        title = newOntology?.title || "";
      }
      setOntologyPath([{ id: newId, title }]);
      await updateUserDoc([newId]);
    },
    [ontologies, user]
  );

  const navigateSpecialization = (parent: any, specialization: any) => {
    const ontologyIdx = ontologies.findIndex((ontology: any) => ontology.id === specialization.id);
    setOpenOntology(ontologies[ontologyIdx]);
    updateUserDoc([parent.id, specialization.id]);
  };

  if (!user?.claims.ontology) {
    return <Custom404 />;
  }
  return (
    <Box>
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: "35px", pt: "35px" }}>
          {MAIN_CATEGORIES.map(category => (
            <Box key={category.id}>
              <Link sx={{ fontSize: "25px", cursor: "pointer" }} onClick={openMainCategory}>
                {category.title}
              </Link>
              <ul>
                {(mainSpecializations[category.title]?.subOntologies?.Specializations || []).map(
                  (specialization: any) => (
                    <li key={specialization.id}>
                      <Link
                        sx={{ fontSize: "15px", cursor: "pointer" }}
                        onClick={() => navigateSpecialization(mainSpecializations[category.title], specialization)}
                      >
                        {specialization.title}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </Box>
          ))}
        </Box>
      </Box>
      <Box
        data-testid="auth-layout"
        sx={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          filter: "brightness(1.95)",
          zIndex: -2,
        }}
      >
        <Image alt="Library" src={darkModeLibraryImage} layout="fill" objectFit="cover" priority />
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
        <Breadcrumbs sx={{ ml: "40px" }}>
          {ontologyPath.map(path => (
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
