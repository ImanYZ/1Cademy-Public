import LockIcon from "@mui/icons-material/Lock";
import { Box, Button, TextField, Tooltip, Typography } from "@mui/material";
import { collection, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

import MarkdownRender from "../Markdown/MarkdownRender";

type ISubOntologyProps = {
  openOntology: any;
  setOpenOntology: any;
  type: string;
  setSnackbarMessage: (message: any) => void;
  text: string;
  editOntology?: any;
  setEditOntology?: any;
  lockedOntology?: any;
  addLock: any;
  user: any;
  recordLogs: any;
  deleteSubOntologyEditable?: any;
};
const SubPlainText = ({
  text,
  type,
  openOntology,
  setOpenOntology,
  editOntology = null,
  setEditOntology,
  lockedOntology,
  addLock,
  user,
  recordLogs,
  deleteSubOntologyEditable = () => {},
}: ISubOntologyProps) => {
  const db = getFirestore();
  const [editMode, setEditMode] = useState(false);
  const textFieldRef = useRef<any>(null);

  const capitalizeFirstLetter = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const editTitleSubOntology = ({ parentData, newTitle, id }: any) => {
    for (let type in parentData.subOntologies) {
      for (let category in parentData.subOntologies[type] || {}) {
        if ((parentData.subOntologies[type][category].ontologies || []).length > 0) {
          const subOntologyIdx = parentData.subOntologies[type][category].ontologies.findIndex(
            (sub: any) => sub.id === id
          );
          if (subOntologyIdx !== -1) {
            parentData.subOntologies[type][category].ontologies[subOntologyIdx].title = newTitle;
          }
        }
      }
    }
  };

  useEffect(() => {
    if (type === "title" && editOntology) {
      setEditMode(editOntology === openOntology.id);
    }
  }, [editOntology, openOntology]);

  const editSaveText = async () => {
    setEditMode(edit => !edit);
    if (editMode) {
      const ontologyDoc = await getDoc(doc(collection(db, "ontology"), openOntology.id));
      if (ontologyDoc.exists()) {
        const ontologyData = ontologyDoc.data();

        if (type === "title") {
          setEditOntology(null);
          for (let parentId of openOntology?.parents || []) {
            const parentRef = doc(collection(db, "ontology"), parentId);
            const parentDoc = await getDoc(parentRef);
            const parentData = parentDoc.data();
            editTitleSubOntology({ parentData, newTitle: openOntology.title, id: openOntology.id });
            await updateDoc(parentRef, parentData);
          }
        }
        let previousValue = "";
        let newValue = "";
        if (["description", "title"].includes(type)) {
          previousValue = ontologyData[type];
          newValue = openOntology[type];
          ontologyData[type] = openOntology[type];
        } else {
          previousValue = ontologyData.plainText[type];
          newValue = openOntology.plainText[type];
          ontologyData.plainText[type] = openOntology.plainText[type] || "";
        }
        await updateDoc(ontologyDoc.ref, ontologyData);
        await addLock(openOntology.id, type, "remove");
        await recordLogs({
          action: "Edited a field",
          field: type,
          previousValue,
          newValue,
        });
      }
    } else {
      await addLock(openOntology.id, type, "add");
    }
  };

  const handleEditText = (e: any) => {
    setOpenOntology((openOntology: any) => {
      const _openOntology = { ...openOntology };
      if (["description", "title"].includes(type)) {
        _openOntology[type] = e.target.value;
      } else {
        _openOntology.plainText[type] = e.target.value;
      }

      return _openOntology;
    });
  };
  const handleFocus = (event: any) => {
    if (type === "title" && editOntology === openOntology.id) {
      event.target.select();
    }
  };

  return (
    <Box>
      {type !== "title" && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ fontSize: "19px" }}>{capitalizeFirstLetter(type)}:</Typography>
          {lockedOntology[type] && user.uname !== lockedOntology[type].uname ? (
            <Tooltip title={"Locked"} sx={{ ml: "5px" }}>
              <LockIcon />
            </Tooltip>
          ) : (
            <Tooltip title={editMode ? "Save" : "Edit"}>
              <Button onClick={editSaveText} sx={{ ml: "5px" }}>
                {editMode ? "Save" : "Edit"}
              </Button>
            </Tooltip>
          )}
        </Box>
      )}
      {editMode ? (
        <TextField
          placeholder={type}
          variant="standard"
          fullWidth
          value={text}
          multiline
          onChange={handleEditText}
          InputProps={{
            style: { fontSize: type === "title" ? "30px" : "" },
            endAdornment: (
              <Box style={{ marginRight: "18px", cursor: "pointer", display: "flex" }}>
                {type === "title" && (
                  <Tooltip title={"Save"}>
                    <Button onClick={editSaveText} sx={{ ml: "5px" }}>
                      {editMode ? "Save" : "Edit"}
                    </Button>
                  </Tooltip>
                )}
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
            width: "100%",
            display: "block",
          }}
          focused={editMode}
          autoFocus
          inputRef={textFieldRef}
          onFocus={handleFocus}
        />
      ) : (
        <Box style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
          <MarkdownRender text={text} sx={{ fontSize: type === "title" ? "30px" : "" }} />
          {type === "title" && !openOntology.locked && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {lockedOntology[type] && user.uname !== lockedOntology[type].uname ? (
                <Tooltip title={"Locked"} sx={{ ml: "5px" }}>
                  <LockIcon />
                </Tooltip>
              ) : (
                <Tooltip title={editMode ? "Save" : "Edit"}>
                  <Button onClick={editSaveText} sx={{ ml: "5px" }}>
                    {editMode ? "Save" : "Edit"}
                  </Button>
                </Tooltip>
              )}
              <Tooltip title={"Delete Ontology"} sx={{ ml: "5px" }}>
                <Button onClick={deleteSubOntologyEditable} sx={{ ml: "5px" }}>
                  Delete
                </Button>
              </Tooltip>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SubPlainText;
