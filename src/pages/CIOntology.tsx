import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Box, Button, Link } from "@mui/material";
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
import { useEffect, useRef, useState } from "react";
import { IOntology, ISubOntology } from "src/types/IOntology";

import AppHeaderMemoized from "@/components/Header/AppHeader";
import withAuthUser from "@/components/hoc/withAuthUser";
import Ontology from "@/components/ontology/Ontology";
import SneakMessage from "@/components/ontology/SneakMessage";
import { useAuth } from "@/context/AuthContext";
import { newId } from "@/lib/utils/newFirestoreId";

import darkModeLibraryImage from "../../public/darkModeLibraryBackground.jpg";

type IOntologyPath = {
  id: string;
  title: string;
};
const CIOntology = () => {
  const db = getFirestore();
  const [{ user }] = useAuth();

  const [ontologies, setOntologies] = useState<IOntology[]>([]);
  // const [userOntology, setUserOntology] = useState<IUserOntology[]>([]);
  const [openOntology, setOpenOntology] = useState<IOntology | null>({
    deleted: false,
    id: newId(db),
    node: null,
    title: "",
    description: "",
    comments: [],
    tags: [],
    notes: [],
    contributors: [],
    actors: [],
    preconditions: [],
    postconditions: [],
    evaluations: [],
    processes: [],
    specializations: [],
    editMode: true,
  });
  const [ontologyPath, setOntologyPath] = useState<IOntologyPath[]>([]);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const headerRef = useRef<HTMLHeadElement | null>(null);

  const getPath = (newPath: string[]) => {
    const ontologyPath = [];
    for (let path of newPath) {
      const ontologyIdx = ontologies.findIndex(onto => onto.id === path);
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
    const userQuery = query(collection(db, "users"), where("userId", "==", user.userId));
    const unsubscribeUser = onSnapshot(userQuery, snapshot => {
      const docChange = snapshot.docChanges()[0];
      const dataChange = docChange.doc.data();
      setOntologyPath(getPath(dataChange?.ontologyPath || []));
      const lastOntology = dataChange?.ontologyPath.reverse()[0];
      const ontologyIdx = ontologies.findIndex(ontology => ontology.id === lastOntology);
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
        console.info({ _ontologies });
        return _ontologies;
      });
    });
    return () => unsubscribeOntology();
  }, [db]);

  const handleLinkNavigation = async (path: { id: string; title: string }) => {
    try {
      if (!user) return;
      const ontologyIndex = ontologies.findIndex(ontology => ontology.id === path.id);

      if (ontologyIndex !== -1) {
        setOpenOntology(ontologies[ontologyIndex]);
      } else {
        addNewOntology({ id: path.id, addpath: false });
        setOpenOntology({
          deleted: false,
          id: path.id,
          node: null,
          title: path.title,
          description: "",
          comments: [],
          tags: [],
          notes: [],
          contributors: [],
          actors: [],
          preconditions: [],
          postconditions: [],
          evaluations: [],
          processes: [],
          specializations: [],
          editMode: true,
        });
      }
      let _ontologyPath = [...ontologyPath];
      const pathIdx = _ontologyPath.findIndex((p: any) => p.id === path.id);
      if (pathIdx !== -1) {
        _ontologyPath = _ontologyPath.slice(0, pathIdx + 1);
      } else {
        _ontologyPath.push(path);
      }

      setOntologyPath(_ontologyPath);
      const userQuery = query(collection(db, "users"), where("userId", "==", user.userId));
      const userDocs = await getDocs(userQuery);
      const userDoc = userDocs.docs[0];
      await updateDoc(userDoc.ref, { ontologyPath: _ontologyPath.map(onto => onto.id) });
    } catch (error) {
      console.error(error);
    }
  };
  const updateUserDoc = async (ontologyPath: string[]) => {
    if (!user) return;
    const userQuery = query(collection(db, "users"), where("userId", "==", user.userId));
    const userDocs = await getDocs(userQuery);
    const userDoc = userDocs.docs[0];
    await updateDoc(userDoc.ref, { ontologyPath });
  };

  const addNewOntology = async ({ id = newId(db), addpath = true }: { id?: string; addpath?: boolean }) => {
    try {
      const prevOntologies = [...ontologies];
      let newOntology = {
        deleted: false,
        id,
        node: null,
        title: "",
        description: "",
        comments: [],
        tags: [],
        notes: [],
        contributors: [],
        actors: [],
        preconditions: [],
        postconditions: [],
        evaluations: [],
        processes: [],
        specializations: [],
        editMode: true,
      };
      const newOntologyRef = doc(collection(db, "ontology"), id);
      prevOntologies.push(newOntology);
      setOpenOntology(newOntology);
      setOntologies(prevOntologies);
      await setDoc(newOntologyRef, newOntology);
      if (addpath) {
        setOntologyPath([
          {
            id,
            title: "",
          },
        ]);
        await updateUserDoc([id]);
      }
    } catch (error) {
      console.error(error);
    }
  };
  console.info({ ontologies, ontologyPath });

  const saveSubOntology = async (subOntology: ISubOntology, type: string, id: string) => {
    try {
      if (!openOntology) return;
      const ontologyParentRef = doc(collection(db, "ontology"), id);
      const ontologyParentDoc = await getDoc(ontologyParentRef);
      const ontologyParent: any = ontologyParentDoc.data();
      if (!ontologyParent) return;
      const idx = ontologyParent[type].findIndex((sub: ISubOntology) => sub.id === subOntology.id);
      if (idx === -1) {
        ontologyParent[type].push({
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
      // setOntologies((ontologies: IOntology[]) => {
      //   const _ontologies = [...ontologies];
      //   const ontologyIdx = _ontologies.findIndex(onto => onto.id === openOntology?.id);
      //   if (ontologyIdx !== -1) {
      //     _ontologies[ontologyIdx] = ontologyParent;
      //   }
      //   return _ontologies;
      // });

      await updateDoc(ontologyParentRef, ontologyParent);
      // handleLinkNavigation({ id: subOntology.id, title: subOntology.title });
    } catch (error) {
      console.info(error);
    }
  };

  return (
    <Box>
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
          left: "50%" /* Set the left position to 50% */,
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
            <Link underline="hover" key={path.id} onClick={() => handleLinkNavigation(path)} sx={{ cursor: "pointer" }}>
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

        {!openOntology && (
          <Button
            startIcon={<ArrowForwardIosIcon />}
            variant="outlined"
            sx={{
              marginTop: "5px",
              color: theme => theme.palette.common.orange,
            }}
            onClick={() => addNewOntology({})}
          >
            Add new
          </Button>
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
