import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TreeItem, TreeView } from "@mui/lab";
import { Button, Checkbox, DialogActions, DialogContent, TextField, Tooltip, Typography } from "@mui/material";
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
    setSelectedCategory("");
  };
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const handleCloseAddCategory = () => {
    setType("");
    setNewCategory("");
    setOpenAddCategory(false);
  };
  const [newCategory, setNewCategory] = useState("");
  const [type, setType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [checkedSpecializations, setCheckedSpecializations] = useState<any>([]);

  const db = getFirestore();
  // const {
  //   palette: { mode },
  // } = useTheme();

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
      newOntology.subOntologies.Specializations = {};
      delete newOntology.locked;
      ontologyData.subOntologies.Specializations = {
        ["main"]: {
          ontologies: [
            {
              id: newOntologyRef.id,
              title: `${ontologyData.title} copy`,
            },
          ],
        },
      };
      await updateDoc(ontologyDoc.ref, ontologyData);
      await setDoc(newOntologyRef, newOntology);
      return newOntologyRef.id;
    } catch (error) {
      console.error(error);
    }
  };

  const addNewSpecialisation = async (type: string, category: string) => {
    const ontologyParentRef = doc(collection(db, "ontology"), openOntology.id);
    const ontologyParentDoc = await getDoc(ontologyParentRef);
    const ontologyParent: any = ontologyParentDoc.data();
    if (!ontologyParent) return;
    const newOntologyRef = doc(collection(db, "ontology"));

    let subOntologyType = type;
    if (type === "Specializations") {
      subOntologyType = ontologyParent.ontologyType;
    }
    if (type === "Roles") {
      subOntologyType = "Role";
    }
    const newOntology = INITIAL_VALUES[subOntologyType];
    newOntology.parents = [openOntology.id];
    newOntology.title = "New " + subOntologyType;
    if (!ontologyParent.subOntologies[type].hasOwnProperty(category)) {
      ontologyParent.subOntologies[type] = {
        ...ontologyParent.subOntologies[type],
        [category]: {
          ontologies: [],
        },
      };
    }
    ontologyParent.subOntologies[type][category].ontologies.push({
      title: "New " + subOntologyType,
      id: newOntologyRef.id,
    });

    await addNewOntology({ id: newOntologyRef.id, newOntology });
    await updateDoc(ontologyParentRef, ontologyParent);
    updateUserDoc([...ontologyPath.map((path: any) => path.id), newOntologyRef.id]);
  };

  const showList = async (type: string, category: string, showModel: boolean) => {
    if (type !== "Specializations" || showModel) {
      setOpen(true);
      setType(type);
      setSelectedCategory(category);
      const specializations = (openOntology.subOntologies[type][category]?.ontologies || []).map(
        (onto: any) => onto.id
      );
      setCheckedSpecializations(specializations || []);
    } else {
      await addNewSpecialisation(type, category);
    }
  };

  const handleCloning = async (ontology: any) => {
    const newCloneId = await cloneOntology(ontology.id);
    updateUserDoc([...ontology.path, newCloneId]);
    handleClose();
  };

  const TreeViewSimplified = useCallback(
    ({ mainSpecializations, clone }: any) => {
      return (
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          sx={{
            "& .Mui-selected": {
              backgroundColor: "transparent",
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
                  <Checkbox
                    checked={checkedSpecializations.includes(mainSpecializations[category]?.id)}
                    onChange={e => {
                      e.stopPropagation();
                      checkSpecialization(mainSpecializations[category].id);
                    }}
                    name={mainSpecializations[category].id}
                    sx={{}}
                  />
                  <Typography>
                    {category.split(" ").splice(0, 3).join(" ") + (category.split(" ").length > 3 ? "..." : "")}
                  </Typography>
                  {clone && (
                    <Button
                      variant="outlined"
                      sx={{ ml: "9px" }}
                      onClick={() => handleCloning(mainSpecializations[category])}
                    >
                      New {category.split(" ").splice(0, 3).join(" ") + (category.split(" ").length > 3 ? "..." : "")}{" "}
                      Specialization
                    </Button>
                  )}
                </Box>
              }
            >
              {Object.keys(mainSpecializations[category].specializations).length > 0 && (
                <TreeViewSimplified mainSpecializations={mainSpecializations[category].specializations} clone={clone} />
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
      const newSubOntologies =
        type === "Specializations" ? [...ontologyData.subOntologies[type][selectedCategory].ontologies] : [];

      for (let checkd of checkedSpecializations) {
        const findOntology = ontologies.find((ontology: any) => ontology.id === checkd);
        const indexFound = newSubOntologies.findIndex(onto => onto.id === checkd);
        if (indexFound === -1) {
          newSubOntologies.push({
            id: checkd,
            title: findOntology.title,
          });
        }
      }
      if (type === "Specializations") {
        ontologyData.subOntologies[type]["main"].ontologies = ontologyData.subOntologies[type][
          "main"
        ].ontologies.filter((ontology: any) => newSubOntologies.findIndex(o => o.id === ontology.id) === -1);
      }
      ontologyData.subOntologies[type][selectedCategory].ontologies = newSubOntologies;
      await updateDoc(ontologyDoc.ref, ontologyData);
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };
  const addCatgory = useCallback(async () => {
    try {
      if (!newCategory) return;
      const ontologyDoc = await getDoc(doc(collection(db, "ontology"), openOntology.id));
      if (ontologyDoc.exists()) {
        const ontologyData = ontologyDoc.data();
        if (!ontologyData?.subOntologies[type]?.hasOwnProperty(newCategory)) {
          ontologyData.subOntologies[type] = {
            ...(ontologyData?.subOntologies[type] || {}),
            [newCategory]: {
              ontologies: [],
            },
          };
        }

        await updateDoc(ontologyDoc.ref, ontologyData);
        handleCloseAddCategory();
      }
    } catch (error) {
      console.error(error);
    }
  }, [newCategory]);

  const getCurrentSpecializations = () => {
    const _mainSpecializations: any = {};
    const _specializations = ontologies.filter((onto: any) => {
      const findIdx = (openOntology?.subOntologies?.Specializations["main"]?.ontologies || []).findIndex(
        (o: any) => o.id === onto.id
      );
      return findIdx !== -1;
    });

    for (let specialization of _specializations) {
      _mainSpecializations[specialization.title] = { id: specialization.id, path: [], specializations: {} };
    }

    return _mainSpecializations;
  };

  const handleNewSpec = async () => {
    if (type === "Specializations") {
      await addNewSpecialisation(type, selectedCategory);
      handleClose();
    } else {
      await handleCloning(mainSpecializations[type]);
      handleClose();
    }
  };
  return (
    <Box
      sx={{
        padding: "40px 40px 40px 40px",
        mb: "90px",
      }}
    >
      <Dialog onClose={handleClose} open={open}>
        <DialogContent>
          <Box sx={{ height: "auto", width: "500px" }}>
            <TreeViewSimplified
              mainSpecializations={
                type === "Specializations"
                  ? getCurrentSpecializations()
                  : mainSpecializations[type]?.specializations || {}
              }
              clone={type !== "Specializations"}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button onClick={handleNewSpec}>Add new {type}</Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog onClose={handleCloseAddCategory} open={openAddCategory}>
        <DialogContent>
          <Box sx={{ height: "auto", width: "500px" }}>
            <TextField
              placeholder={`Add Category`}
              variant="standard"
              fullWidth
              value={newCategory}
              multiline
              onChange={(e: any) => setNewCategory(e.target.value)}
              sx={{
                fontWeight: 400,
                fontSize: {
                  xs: "14px",
                  md: "16px",
                },
                marginBottom: "5px",
                width: "100%",
                display: "block",
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button onClick={addCatgory} color="primary">
            Add
          </Button>
          <Button onClick={handleCloseAddCategory} color="primary">
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
                    <Button onClick={() => showList(type, "main", false)} sx={{ ml: "5px" }}>
                      {" "}
                      {type !== "Specializations" ? "Select" : "Add"} {type}{" "}
                    </Button>
                  </Tooltip>
                  {type === "Specializations" && (
                    <Button
                      onClick={() => {
                        setOpenAddCategory(true);
                        setType(type);
                      }}
                      sx={{ ml: "5px" }}
                    >
                      Add Category
                    </Button>
                  )}
                </Box>
                <ul>
                  {Object.keys(openOntology?.subOntologies[type])
                    .filter(c => c !== "main")
                    .map((category: any) => {
                      const subOntologies = openOntology?.subOntologies[type][category]?.ontologies || [];
                      return (
                        <Box key={category} /* sx={{ ml: "15px" }} */>
                          <li key={category}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography sx={{ fontWeight: "bold" }}>{category}</Typography> :{" "}
                              <Button
                                onClick={() =>
                                  showList(
                                    type,
                                    category,
                                    openOntology?.subOntologies[type]["main"]?.ontologies.length > 0
                                  )
                                }
                                sx={{ ml: "5px" }}
                              >
                                {" "}
                                {type !== "Specializations" ? "Select" : "Add"} {type}{" "}
                              </Button>
                            </Box>
                          </li>
                          <ul>
                            {subOntologies.map((subOntology: ISubOntology) => {
                              return (
                                <li key={subOntology.id}>
                                  <SubOntology
                                    setSnackbarMessage={setSnackbarMessage}
                                    saveSubOntology={saveSubOntology}
                                    openOntology={openOntology}
                                    setOpenOntology={setOpenOntology}
                                    sx={{ mt: "15px" }}
                                    key={openOntology.id}
                                    subOntology={subOntology}
                                    type={type}
                                    category={category}
                                    ontologyPath={ontologyPath}
                                    updateUserDoc={updateUserDoc}
                                  />
                                </li>
                              );
                            })}
                          </ul>
                        </Box>
                      );
                    })}
                </ul>
                <ul>
                  {(openOntology?.subOntologies[type]["main"]?.ontologies || []).map((subOntology: ISubOntology) => {
                    return (
                      <li key={subOntology.id}>
                        <SubOntology
                          setSnackbarMessage={setSnackbarMessage}
                          saveSubOntology={saveSubOntology}
                          openOntology={openOntology}
                          setOpenOntology={setOpenOntology}
                          sx={{ mt: "15px" }}
                          key={openOntology.id}
                          subOntology={subOntology}
                          type={type}
                          category={"main"}
                          ontologyPath={ontologyPath}
                          updateUserDoc={updateUserDoc}
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
