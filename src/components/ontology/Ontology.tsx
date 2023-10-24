import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import { Button, TextField, Tooltip, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { collection, doc, getFirestore, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { IOntology, ISubOntology } from "src/types/IOntology";

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
};

const Ontology = ({
  openOntology,
  setOpenOntology,
  handleLinkNavigation,
  ontologyPath,
  setOntologyPath,
  saveSubOntology,
  setSnackbarMessage,
}: IOntologyProps) => {
  const [newTitle, setNewTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setNewTitle(openOntology.title);
    setDescription(openOntology.description);
  }, []);

  const handleFocus = () => {
    // if (updatingTitle) return;
    setIsFocused(true);
  };
  const handleBlur = () => {
    setIsFocused(false);
  };

  useEffect(() => {
    setNewTitle(openOntology.title);
  }, [openOntology.title]);

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
    const addSubOntology = () => {
      setOpenOntology((openOntology: IOntology) => {
        const _openOntology = { ...openOntology };
        _openOntology[type].push({
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
      >
        New {title}
      </Button>
    );
  };

  const handleEditTitle = (e: any) => {
    setNewTitle(e.target.value);
  };
  const handleEditDescription = (e: any) => {
    setDescription(e.target.value);
  };

  const SaveOntologyTitle = useCallback(async () => {
    try {
      console.info("openOntology.id", openOntology.id, newTitle);
      const ontologyRef = doc(collection(db, "ontology"), openOntology.id);
      await updateDoc(ontologyRef, {
        title: newTitle,
      });

      setOntologyPath((ontologyPath: any) => {
        const _path = [...ontologyPath];
        const pathIdx = _path.findIndex(p => p.id === openOntology.id);
        if (pathIdx !== -1) {
          _path[pathIdx].title = newTitle;
        }
        return _path;
      });

      setOpenOntology((openOntology: any) => {
        const _openOntology = { ...openOntology };
        _openOntology.title = newTitle;
        return _openOntology;
      });

      setSnackbarMessage("Updated Successufly");
    } catch (error) {
      console.error(error);
    }
  }, [db, newTitle, openOntology]);

  const SaveOntologyDescription = useCallback(async () => {
    try {
      console.info(openOntology.id, description, isFocused);
      const ontologyRef = doc(collection(db, "ontology"), openOntology.id);
      await updateDoc(ontologyRef, {
        description,
      });
      const _openOntology = { ...openOntology };
      _openOntology.title = newTitle;
      const _path = [...ontologyPath];
      const pathIdx = _path.findIndex(p => p.id === openOntology.id);
      _path[pathIdx].description = description;
      setOpenOntology(_openOntology);
      setSnackbarMessage("Updated Successufly");
    } catch (error) {
      console.error(error);
    }
  }, [db, description, openOntology, setOpenOntology]);

  const addNote = () => {
    // if (!user) return;
    setOpenOntology(() => {
      const _openOntology = { ...openOntology };
      _openOntology.notes.push({
        id: newId(db),
        note: "",
        sender: "user.uname",
        editMode: true,
      });
      return _openOntology;
    });
  };
  const cancelTitleChanges = () => {
    setNewTitle(openOntology.title);
  };
  const cancelDescriptionChanges = () => {
    setDescription(openOntology.description);
  };

  return (
    <Box
      sx={{
        padding: "40px 40px 40px 40px",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <TextField
          placeholder={``}
          variant="standard"
          fullWidth
          multiline
          value={newTitle}
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
                {newTitle !== openOntology.title && (
                  <Tooltip title="Cancel">
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
                  </Tooltip>
                )}
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
          value={description}
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
                {description !== openOntology.description && (
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
                )}
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
                          onChange={() => {}}
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
                                    onClick={() => {}}
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
                                    onClick={() => {}}
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
                            width: {
                              xs: "100%",
                              md: "50%",
                            },
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
          >
            Add Note
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Ontology;
