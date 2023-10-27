import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import { Button, TextField, Tooltip, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { collection, doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import { ISubOntology } from "src/types/IOntology";

import { newId } from "@/lib/utils/newFirestoreId";

import SubOntology from "./SubOntology";

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
};

const Ontology = ({
  openOntology,
  setOpenOntology,
  handleLinkNavigation,
  ontologyPath,
  setOntologyPath,
  saveSubOntology,
  setSnackbarMessage,
  updateUserDoc,
  user,
}: IOntologyProps) => {
  // const [newTitle, setNewTitle] = useState<string>("");
  // const [description, setDescription] = useState<string>("");

  const [isFocused, setIsFocused] = useState(false);

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

  const AddSubOntology = ({
    title,
    type,
  }: {
    title: "Actor" | "Pre-Condition" | "Post-condition" | "Evaluation" | "Processe" | "Specialization";
    type: "actors" | "preconditions" | "postconditions" | "evaluations" | "processes" | "specializations";
  }) => {
    const addSubOntology = async () => {
      const id = newId(db);
      handleLinkNavigation({ id, title: "" });
      await saveSubOntology({ id, title: "" }, type, openOntology.id);
      // setOpenOntology((openOntology: IOntology) => {
      //   const _openOntology = { ...openOntology };
      //   _openOntology[type].push({
      //     title: "",
      //     id: newId(db),
      //     editMode: true,
      //     new: true,
      //   });
      //   return _openOntology;
      // });
    };
    return (
      <Button
        startIcon={<ArrowForwardIosIcon />}
        variant="outlined"
        sx={{
          color: theme => theme.palette.common.orange,
        }}
        onClick={addSubOntology}
        disabled={openOntology.title.trim() === ""}
      >
        New {title}
      </Button>
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
    for (let type of ["actors", "preconditions", "postconditions", "evaluations", "processes", "specializations"]) {
      for (let subOnto of parentData[type]) {
        if (subOnto.id === id) {
          subOnto.title = newTitle;
        }
      }
    }
  };

  const SaveOntologyTitle = useCallback(async () => {
    try {
      const ontologyRef = doc(collection(db, "ontology"), openOntology.id);
      const newOntologyDoc = await getDoc(ontologyRef);
      if (newOntologyDoc.exists()) {
        await updateDoc(ontologyRef, {
          title: openOntology.title,
        });
        const pathIdx = ontologyPath.findIndex((p: any) => p.id === openOntology.id);
        if (pathIdx - 1 !== -1) {
          const parentId = ontologyPath[pathIdx - 1].id;
          const parentRef = doc(collection(db, "ontology"), parentId);
          const parentDoc = await getDoc(parentRef);
          const parentData = parentDoc.data();
          editTitleSubOntology({ parentData, newTitle: openOntology.title, id: openOntology.id });
          await updateDoc(parentRef, parentData);
        }
        setOntologyPath((ontologyPath: any) => {
          const _path = [...ontologyPath];
          const pathIdx = _path.findIndex(p => p.id === openOntology.id);
          if (pathIdx !== -1) {
            _path[pathIdx].title = openOntology.title;
          }
          return _path;
        });
      } else {
        await setDoc(ontologyRef, {
          ...openOntology,
        });
        setOntologyPath([
          {
            id: openOntology.id,
            title: openOntology.title,
          },
        ]);
        await updateUserDoc([openOntology.id]);
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

  return (
    <Box
      sx={{
        padding: "40px 40px 40px 40px",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <TextField
          placeholder={`Title`}
          variant="standard"
          fullWidth
          multiline
          value={openOntology.title}
          onChange={handleEditTitle}
          InputProps={{
            style: { fontSize: "36px" },
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
                    onClick={SaveOntologyTitle}
                  />
                </Tooltip>
                {/* )} */}
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
          <Box sx={{ display: "grid", mt: "5px" }}>
            {openOntology.actors.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: "19px" }}>Actors:</Typography>
                <ul>
                  {openOntology.actors.map((subOntology: ISubOntology) => {
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
                          type="actors"
                        />
                      </li>
                    );
                  })}
                </ul>
              </Box>
            )}
          </Box>
          <AddSubOntology title="Actor" type="actors" />
          <Box sx={{ display: "grid", mt: "5px" }}>
            {openOntology.preconditions.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: "19px" }}>Pre-Conditions:</Typography>
                <ul>
                  {openOntology.preconditions.map((subOntology: ISubOntology) => {
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
                          type="preconditions"
                        />
                      </li>
                    );
                  })}{" "}
                </ul>{" "}
              </Box>
            )}
          </Box>
          <AddSubOntology title="Pre-Condition" type="preconditions" />
          <Box sx={{ display: "grid", mt: "5px" }}>
            {openOntology.postconditions.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: "19px" }}>Post-Conditions:</Typography>
                <ul>
                  {openOntology.postconditions.map((subOntology: ISubOntology) => {
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
                          type="postconditions"
                        />
                      </li>
                    );
                  })}{" "}
                </ul>{" "}
              </Box>
            )}
          </Box>
          <AddSubOntology title="Post-condition" type="postconditions" />
          <Box sx={{ display: "grid", mt: "5px" }}>
            {openOntology.processes.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: "19px" }}>Processes:</Typography>
                <ul>
                  {openOntology.processes.map((subOntology: ISubOntology) => {
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
                          type="processes"
                        />
                      </li>
                    );
                  })}
                </ul>{" "}
              </Box>
            )}
          </Box>
          <AddSubOntology title="Processe" type="processes" />
          <Box sx={{ display: "grid", mt: "5px" }}>
            {openOntology.evaluations.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: "19px" }}>Evaluations:</Typography>
                <ul>
                  {openOntology.evaluations.map((subOntology: ISubOntology) => {
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
                          type="evaluations"
                        />
                      </li>
                    );
                  })}
                </ul>{" "}
              </Box>
            )}
          </Box>{" "}
          <AddSubOntology title="Evaluation" type="evaluations" />
          <Box sx={{ display: "grid", mt: "5px" }}>
            {openOntology.specializations.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: "19px" }}>Specializations:</Typography>
                <ul>
                  {openOntology.specializations.map((subOntology: ISubOntology) => {
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
                          type="specializations"
                        />
                      </li>
                    );
                  })}
                </ul>{" "}
              </Box>
            )}
          </Box>
          <AddSubOntology title="Specialization" type="specializations" />
        </Box>
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
