import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TreeItem, TreeView } from "@mui/lab";
import { Button, Checkbox, DialogActions, DialogContent, FormControlLabel, Tooltip, Typography } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import { Box } from "@mui/system";
import { collection, doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import { ISubOntology } from "src/types/IOntology";

import SubOntology from "./SubOntology";
import SubPlainText from "./SubPlainText";

type IOntologyProps = {
  openOntology: any;
  setOpenOntology: (ontology: any) => void;
  handleLinkNavigation: any;
  setOntologyPath: any;
  ontologyPath: any;
  saveSubOntology: any;
  setSnackbarMessage: (message: string) => void;
  updateUserDoc: (ids: string[]) => void;
  user: any;
  mainSpecializations: any;
  ontologies: any;
  addNewOntology: any;
  INITIAL_VALUES: any;
};

const Ontology = ({
  openOntology,
  setOpenOntology,
  handleLinkNavigation,
  saveSubOntology,
  setSnackbarMessage,
  updateUserDoc,
  mainSpecializations,
  ontologies,
  addNewOntology,
  INITIAL_VALUES,
  ontologyPath,
}: IOntologyProps) => {
  // const [newTitle, setNewTitle] = useState<string>("");
  // const [description, setDescription] = useState<string>("");

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setCheckedSpecializations([]);
    setOpen(false);
  };
  const [type, setType] = useState("");
  const [checkedSpecializations, setCheckedSpecializations] = useState<any>([]);

  const db = getFirestore();
  // const {
  //   palette: { mode },
  // } = useTheme();

  const getCategoryTitle = (type: string) => {
    if (type === "Actor") {
      return "WHO: Actors";
    } else if (type === "Process") {
      return "HOW: Processes";
    } else if (type === "Evaluation Dimensions") {
      return "WHY: Evaluation";
    } /*  else if (type === "Evaluation Dimensions") {
      return "WHAT: Activities";
    } */
    return "";
  };

  const capitalizeFirstLetter = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const checkSpecialization = (checkedId: string) => {
    setCheckedSpecializations((oldChecked: string[]) => {
      let _oldChecked = [...oldChecked];
      if (_oldChecked.includes(checkedId)) {
        _oldChecked = _oldChecked.filter(cheked => cheked !== checkedId);
      } else {
        _oldChecked.push(checkedId);
      }
      return _oldChecked;
    });
  };

  const cloneOntology = async (ontologyId: string) => {
    try {
      const ontologyDoc = await getDoc(doc(collection(db, "ontology"), ontologyId));
      if (!ontologyDoc.exists()) return;
      const ontologyData = ontologyDoc.data();
      const newOntologyRef = doc(collection(db, "ontology"));
      const newOntology: any = {
        ...ontologyDoc.data(),
      };
      newOntology.id = newOntologyRef.id;
      newOntology.parents = [ontologyDoc.id];
      newOntology.title = `${ontologyData.title} copy`;
      newOntology.description = "";
      newOntology.subOntologies.Specializations = [];
      delete newOntology.locked;
      ontologyData.subOntologies.Specializations.push({
        id: newOntologyRef.id,
        title: `${ontologyData.title} copy`,
      });
      await updateDoc(ontologyDoc.ref, ontologyData);
      await setDoc(newOntologyRef, newOntology);
      return newOntologyRef.id;
    } catch (error) {
      console.error(error);
    }
  };

  const addNewSpecialisation = async (type: string) => {
    const ontologyParentRef = doc(collection(db, "ontology"), openOntology.id);
    const ontologyParentDoc = await getDoc(ontologyParentRef);
    const ontologyParent: any = ontologyParentDoc.data();
    if (!ontologyParent) return;
    const newOntologyRef = doc(collection(db, "ontology"));

    const idx = ontologyParent.subOntologies[type].findIndex((sub: ISubOntology) => sub.id === newOntologyRef.id);

    let subOntologyType = type;
    if (type === "Specializations") {
      subOntologyType = ontologyParent.ontologyType;
    }
    if (type === "Evaluation Dimensions") {
      subOntologyType = "Evaluation";
    }
    const newOntology = INITIAL_VALUES[subOntologyType];
    newOntology.parents = [openOntology.id];
    newOntology.title = "New " + subOntologyType;
    if (idx === -1) {
      ontologyParent.subOntologies[type].push({
        title: "New " + subOntologyType,
        id: newOntologyRef.id,
      });
    }
    await addNewOntology({ id: newOntologyRef.id, newOntology });
    await updateDoc(ontologyParentRef, ontologyParent);
    updateUserDoc([...ontologyPath.map((path: any) => path.id), newOntologyRef.id]);
  };

  const showList = async (type: string) => {
    if (getCategoryTitle(type)) {
      setOpen(true);
      setType(type);
      const specializations = openOntology.subOntologies[type].map((onto: any) => onto.id);
      setCheckedSpecializations(specializations);
    } else {
      await addNewSpecialisation(type);
    }
  };

  const handleCloning = async (ontology: any) => {
    const newCloneId = await cloneOntology(ontology.id);
    updateUserDoc([...ontology.path, newCloneId]);
    handleClose();
  };

  const TreeViewSimplified = useCallback(
    ({ mainSpecializations }: any) => {
      return (
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          sx={{
            "& .Mui-selected": {
              backgroundColor: "transparent", // Remove the background color
            },
          }}
          defaultExpanded={[]}
        >
          {Object.keys(mainSpecializations).map(category => (
            <TreeItem
              key={mainSpecializations[category].id}
              nodeId={mainSpecializations[category].id}
              sx={{ mt: "5px" }}
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    value={mainSpecializations[category].id}
                    control={
                      <Checkbox
                        checked={checkedSpecializations.includes(mainSpecializations[category]?.id)}
                        onChange={() => checkSpecialization(mainSpecializations[category].id)}
                        name={mainSpecializations[category].id}
                      />
                    }
                    label={category}
                  />
                  <Button variant="outlined" onClick={() => handleCloning(mainSpecializations[category])}>
                    New {category} Specialization
                  </Button>
                </Box>
              }
            >
              {Object.keys(mainSpecializations[category].specializations).length > 0 && (
                <TreeViewSimplified mainSpecializations={mainSpecializations[category].specializations} />
              )}
            </TreeItem>
          ))}
        </TreeView>
      );
    },
    [mainSpecializations, checkedSpecializations]
  );

  const handleSave = async () => {
    try {
      const ontologyDoc = await getDoc(doc(collection(db, "ontology"), openOntology.id));
      if (!ontologyDoc.exists()) return;
      const ontologyData = ontologyDoc.data();
      const newSubOntologies = [];
      for (let checkd of checkedSpecializations) {
        const findOntology = ontologies.find((ontology: any) => ontology.id === checkd);
        newSubOntologies.push({
          id: checkd,
          title: findOntology.title,
        });
      }
      ontologyData.subOntologies[type] = newSubOntologies;
      await updateDoc(ontologyDoc.ref, ontologyData);
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box
      sx={{
        padding: "40px 40px 40px 40px",
      }}
    >
      <Dialog onClose={handleClose} open={open}>
        <DialogContent>
          <Box sx={{ height: "auto", width: "500px" }}>
            <TreeViewSimplified
              mainSpecializations={mainSpecializations[getCategoryTitle(type)]?.specializations || {}}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={() => {
              handleCloning(mainSpecializations[getCategoryTitle(type)]);
            }}
          >
            Add new {type}
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <SubPlainText
          text={openOntology.title}
          openOntology={openOntology}
          type={"title"}
          setSnackbarMessage={setSnackbarMessage}
          setOpenOntology={setOpenOntology}
        />
        <SubPlainText
          text={openOntology.description}
          openOntology={openOntology}
          type={"description"}
          setSnackbarMessage={setSnackbarMessage}
          setOpenOntology={setOpenOntology}
        />
      </Box>
      <hr style={{ color: "#A5A5A5" }} />

      <Box key={openOntology.id} sx={{ mb: "15px" }}>
        <Box
          style={{
            paddingLeft: "10px",
          }}
        >
          {/* Actors: -
                     Preconditions: –
                     Postconditions: –
                     Evaluations: –
                     Process: –
                     Specializations: */}
        </Box>
        {Object.keys(openOntology.subOntologies).map(type => (
          <Box key={type}>
            <Box sx={{ display: "grid", mt: "5px" }}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={{ fontSize: "19px" }}>{capitalizeFirstLetter(type)}:</Typography>
                  <Tooltip title={"Select"}>
                    <Button onClick={() => showList(type)} sx={{ ml: "5px" }}>
                      {" "}
                      {getCategoryTitle(type) ? "Select" : "Add"} {type}{" "}
                    </Button>
                  </Tooltip>
                </Box>

                <ul>
                  {(openOntology?.subOntologies[type] || []).map((subOntology: ISubOntology) => {
                    return (
                      <li key={subOntology.id}>
                        <SubOntology
                          setSnackbarMessage={setSnackbarMessage}
                          saveSubOntology={saveSubOntology}
                          handleLinkNavigation={handleLinkNavigation}
                          openOntology={openOntology}
                          setOpenOntology={setOpenOntology}
                          sx={{ mt: "15px" }}
                          key={openOntology.id}
                          subOntology={subOntology}
                          type={type}
                        />
                      </li>
                    );
                  })}
                </ul>
              </Box>
            </Box>
          </Box>
        ))}
        {Object.keys(openOntology.plainText).map(type => (
          <Box key={type}>
            <SubPlainText
              text={openOntology.plainText[type]}
              openOntology={openOntology}
              type={type}
              setSnackbarMessage={setSnackbarMessage}
              setOpenOntology={setOpenOntology}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Ontology;
