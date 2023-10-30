import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CancelIcon from "@mui/icons-material/Cancel";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SaveIcon from "@mui/icons-material/Save";
import { TreeItem, TreeView } from "@mui/lab";
import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  FormControlLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import { Box } from "@mui/system";
import { collection, doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import { ISubOntology } from "src/types/IOntology";

import { newId } from "@/lib/utils/newFirestoreId";

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
};

const Ontology = ({
  openOntology,
  setOpenOntology,
  handleLinkNavigation,
  saveSubOntology,
  setSnackbarMessage,
  updateUserDoc,
  user,
  mainSpecializations,
  ontologies,
}: IOntologyProps) => {
  // const [newTitle, setNewTitle] = useState<string>("");
  // const [description, setDescription] = useState<string>("");

  const [isFocused, setIsFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setCheckedSpecializations([]);
    setOpen(false);
  };
  const [type, setType] = useState("");
  const [checkedSpecializations, setCheckedSpecializations] = useState<any>([]);

  const handleFocus = () => {
    // if (updatingTitle) return;
    setIsFocused(true);
  };
  const handleBlur = () => {
    setIsFocused(false);
  };

  const db = getFirestore();
  // const {
  //   palette: { mode },
  // } = useTheme();

  const AddPlainText = ({ type, disabled }: { type: string; disabled: boolean }) => {
    const addSubOntology = async () => {
      // const id = newId(db);
      // handleLinkNavigation({ id, title: "" });
      // await saveSubOntology({ id, title: "" }, type, openOntology.id);
      setOpenOntology((openOntology: any) => {
        const _openOntology = { ...openOntology };
        _openOntology.plainText[type].push({
          title: "",
          id: newId(db),
          editMode: true,
          new: true,
        });
        return _openOntology;
      });
    };
    return (
      <Button
        startIcon={<ArrowForwardIosIcon />}
        variant="outlined"
        sx={{
          color: theme => theme.palette.common.orange,
        }}
        onClick={addSubOntology}
        disabled={disabled}
      >
        New {capitalizeFirstLetter(type)}
      </Button>
    );
  };

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
  const addSubOntology = async (type: string) => {
    const id = newId(db);
    // handleLinkNavigation({ id, title: "" });
    await saveSubOntology({ id, title: "" }, type, openOntology.id);
  };
  const AddSubOntology = ({ type, disabled }: { type: string; disabled: boolean }) => {
    return (
      <Box>
        {!getCategoryTitle(type) && (
          <Button
            startIcon={<ArrowForwardIosIcon />}
            variant="outlined"
            sx={{
              color: theme => theme.palette.common.orange,
            }}
            onClick={() => addSubOntology(type)}
            disabled={disabled}
          >
            New {capitalizeFirstLetter(type)}
          </Button>
        )}
      </Box>
    );
  };

  const handleEditTitle = (e: any) => {
    setOpenOntology((open: any) => {
      const _open = { ...open };
      _open.title = e.target.value;
      return _open;
    });
  };
  const handleEditDescription = (e: any) => {
    setOpenOntology((open: any) => {
      const _open = { ...open };
      _open.description = e.target.value;
      return _open;
    });
  };

  const editTitleSubOntology = ({ parentData, newTitle, id }: any) => {
    for (let type of ["Actor", "Process", "Specializations", "Specializations", "Roles", "Evaluation Dimensions"]) {
      if ((parentData.subOntologies[type] || []).length > 0) {
        for (let subOnto of parentData.subOntologies[type]) {
          if (subOnto.id === id) {
            subOnto.title = newTitle;
          }
        }
      }
    }
  };

  const SaveOntologyTitle = useCallback(async () => {
    try {
      const ontologyRef = doc(collection(db, "ontology"), openOntology.id);
      const newOntologyDoc = await getDoc(ontologyRef);
      if (newOntologyDoc.exists()) {
        for (let parentId of openOntology.parents) {
          const parentRef = doc(collection(db, "ontology"), parentId);
          const parentDoc = await getDoc(parentRef);
          const parentData = parentDoc.data();
          editTitleSubOntology({ parentData, newTitle: openOntology.title, id: openOntology.id });
          await updateDoc(parentRef, parentData);
        }
        await updateDoc(ontologyRef, {
          title: openOntology.title,
        });
      } else {
        await setDoc(ontologyRef, {
          ...openOntology,
        });
        updateUserDoc([openOntology.id]);
      }
      setSnackbarMessage("Updated Successufly");
    } catch (error) {
      console.error(error);
    }
  }, [db, openOntology]);

  const SaveOntologyDescription = useCallback(async () => {
    try {
      console.info(openOntology.id, isFocused);
      const ontologyRef = doc(collection(db, "ontology"), openOntology.id);
      await updateDoc(ontologyRef, {
        description: openOntology.description,
      });
      setSnackbarMessage("Updated Successufly");
    } catch (error) {
      console.error(error);
    }
  }, [db, openOntology, setOpenOntology]);

  const addNote = () => {
    // if (!user) return;
    setOpenOntology(() => {
      const _openOntology = { ...openOntology };
      _openOntology.notes.push({
        id: newId(db),
        note: "",
        sender: user.uname,
        editMode: true,
      });
      return _openOntology;
    });
  };

  // const cancelTitleChanges = () => {
  //   /* CANCEL TITLE */
  // };
  // const cancelDescriptionChanges = () => {
  //   /* CANCEL DESCRIPTION */
  // };
  const saveNote = async () => {
    try {
      const ontologyRef = doc(collection(db, "ontology"), openOntology.id);
      const newOntologyDoc = await getDoc(ontologyRef);
      if (newOntologyDoc.exists()) {
        const notes = openOntology.notes.map((note: any) => {
          delete note.editMode;
          return note;
        });
        await updateDoc(newOntologyDoc.ref, { notes });
      }
    } catch (error) {
      console.error(error);
    }
  };
  const cancelNote = () => {
    setOpenOntology((openOntology: any) => {
      const _openOntology = { ...openOntology };
      _openOntology.notes = _openOntology.notes.filter((note: any) => !note.editMode);
      return _openOntology;
    });
  };

  const EditNote = (e: any, id: string) => {
    setOpenOntology((openOntology: any) => {
      const _openOntology = { ...openOntology };
      const noteIdx = _openOntology.notes.findIndex((note: any) => note.id === id);
      if (noteIdx !== -1) {
        _openOntology.notes[noteIdx].note = e.target.value;
      }
      return _openOntology;
    });
  };
  const capitalizeFirstLetter = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };
  const savePlainText = () => {
    try {
      console.info("savePlainText");
    } catch (error) {
      console.error(error);
    }
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

  const TreeViewSimplified = ({ mainSpecializations }: any) => {
    return (
      <TreeView defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />}>
        {Object.keys(mainSpecializations).map(category => (
          <TreeItem
            key={mainSpecializations[category].id}
            nodeId={mainSpecializations[category].id}
            sx={{ mt: "5px" }}
            label={
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
            }
          >
            {Object.keys(mainSpecializations[category].specializations).length > 0 && (
              <TreeViewSimplified mainSpecializations={mainSpecializations[category].specializations} />
            )}
          </TreeItem>
        ))}
      </TreeView>
    );
  };
  const showList = (type: string) => {
    setOpen(true);
    setType(type);
    const specializations = openOntology.subOntologies[type].map((onto: any) => onto.id);
    setCheckedSpecializations(specializations);
  };

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
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <TextField
          placeholder={`Title`}
          variant="standard"
          fullWidth
          multiline
          value={openOntology.title}
          onChange={handleEditTitle}
          disabled={openOntology.locked}
          InputProps={{
            style: { fontSize: "36px" },
            startAdornment: (
              <Box style={{ marginRight: "8px", cursor: "pointer" }}>
                {!openOntology.locked && (
                  <Tooltip title="Save">
                    <SaveIcon
                      sx={{
                        color: "#757575",
                        ":hover": {
                          color: theme => theme.palette.common.orange,
                        },
                      }}
                      onClick={SaveOntologyTitle}
                    />
                  </Tooltip>
                )}
              </Box>
            ),
            endAdornment: (
              <Box style={{ marginRight: "8px", cursor: "pointer" }}>
                {/* <Tooltip title="Cancel">
                  <CancelIcon
                    sx={{
                      marginLeft: "10px",
                      color: "#757575",
                      ":hover": {
                        color: theme => theme.palette.common.orange,
                      },
                    }}
                    onClick={cancelTitleChanges}
                  />
                </Tooltip> */}
              </Box>
            ),
            disableUnderline: true,
          }}
          sx={{}}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <TextField
          placeholder={`Description`}
          variant="standard"
          fullWidth
          multiline
          value={openOntology.description}
          onChange={handleEditDescription}
          InputProps={{
            style: { fontSize: "15px" },
            startAdornment: (
              <Box style={{ marginRight: "8px", cursor: "pointer" }}>
                {/* {isFocused && ( */}
                <Tooltip title="Save">
                  <SaveIcon
                    sx={{
                      color: "#757575",
                      ":hover": {
                        color: theme => theme.palette.common.orange,
                      },
                    }}
                    onClick={SaveOntologyDescription}
                  />
                </Tooltip>
                {/* )} */}
              </Box>
            ),
            endAdornment: (
              <Box style={{ marginRight: "8px", cursor: "pointer" }}>
                {/* {description !== openOntology.description && (
                  <Tooltip title="Cancel">
                    <CancelIcon
                      sx={{
                        marginLeft: "10px",
                        color: "#757575",
                        ":hover": {
                          color: theme => theme.palette.common.orange,
                        },
                      }}
                      onClick={cancelDescriptionChanges}
                    />
                  </Tooltip>
                )} */}
              </Box>
            ),
            disableUnderline: true,
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
              {((openOntology?.subOntologies[type] || []).length > 0 || getCategoryTitle(type)) && (
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography sx={{ fontSize: "19px" }}>{capitalizeFirstLetter(type)}:</Typography>
                    {type !== "Specializations" && (
                      <Tooltip title={"Add New"}>
                        <IconButton>
                          <ControlPointIcon onClick={() => addSubOntology(type)} />
                        </IconButton>
                      </Tooltip>
                    )}
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
              )}
            </Box>
            {type !== "Specializations" ? (
              Object.keys(mainSpecializations[getCategoryTitle(type)]?.specializations || {}).length > 0 && (
                <Tooltip title={"Select"}>
                  <IconButton onClick={() => showList(type)}>
                    <KeyboardArrowDownIcon />
                  </IconButton>
                </Tooltip>
              )
            ) : (
              <AddSubOntology type={type} disabled={!openOntology.title.trim()} />
            )}
            {/* <hr style={{ color: "#A5A5A5", width: "50%", marginTop: "0px", position: "absolute" }} /> */}
          </Box>
        ))}

        {Object.keys(openOntology.plainText).map(type => (
          <Box key={type}>
            <Box sx={{ display: "grid", mt: "5px" }}>
              {(openOntology.plainText[type] || []).length > 0 && (
                <Box>
                  <Typography sx={{ fontSize: "19px" }}>{capitalizeFirstLetter(type)}:</Typography>
                  <ul>
                    {openOntology.plainText[type].map((plainText: { id: string; title: string }) => {
                      return (
                        <li key={plainText.id}>
                          <SubPlainText
                            setSnackbarMessage={setSnackbarMessage}
                            savePlainText={savePlainText}
                            openOntology={openOntology}
                            setOpenOntology={setOpenOntology}
                            sx={{ mt: "15px" }}
                            key={openOntology.id}
                            subOntology={plainText}
                            type={type}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </Box>
              )}
            </Box>
            <AddPlainText
              type={type}
              disabled={
                openOntology.plainText[type].findIndex((note: any) => note.editMode) !== -1 ||
                openOntology.title.trim() === ""
              }
            />
          </Box>
        ))}
        {/* ["preconditions", "postconditions", "evaluation-dimensions", "abilities"] */}

        <Box sx={{ mt: "55px" }}>
          {openOntology.notes.length > 0 && (
            <Box>
              NOTES:
              <ul>
                {" "}
                {openOntology.notes.map((_note: { note: string; sender: string; editMode: boolean; id: string }) => {
                  return (
                    <li key={_note.id}>
                      {_note.editMode ? (
                        <TextField
                          placeholder={``}
                          variant="standard"
                          fullWidth
                          value={_note.note}
                          multiline
                          onChange={e => {
                            EditNote(e, _note.id);
                          }}
                          InputProps={{
                            endAdornment: (
                              <Box style={{ marginRight: "18px", cursor: "pointer", display: "flex" }}>
                                <Tooltip title={"Save"}>
                                  <SaveIcon
                                    sx={{
                                      color: "#757575",
                                      ":hover": {
                                        color: theme => theme.palette.common.orange,
                                      },
                                    }}
                                    onClick={saveNote}
                                  />
                                </Tooltip>
                                <Tooltip title={"Cancel"}>
                                  <CancelIcon
                                    sx={{
                                      marginLeft: "10px",
                                      color: "#757575",
                                      ":hover": {
                                        color: theme => theme.palette.common.orange,
                                      },
                                    }}
                                    onClick={cancelNote}
                                  />
                                </Tooltip>
                              </Box>
                            ),
                          }}
                          sx={{
                            fontWeight: 400,
                            fontSize: {
                              xs: "14px",
                              md: "16px",
                            },
                            marginBottom: "5px",
                            display: "block",
                          }}
                        />
                      ) : (
                        <Typography>{_note.note}</Typography>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Box>
          )}
          <Button
            startIcon={<ArrowForwardIosIcon />}
            variant="outlined"
            sx={{
              color: theme => theme.palette.common.orange,
            }}
            onClick={addNote}
            disabled={openOntology.notes.findIndex((note: any) => note.editMode) !== -1}
          >
            Add Note
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Ontology;
