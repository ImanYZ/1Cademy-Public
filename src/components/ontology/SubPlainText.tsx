import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, TextField, Tooltip, Typography } from "@mui/material";
import { collection, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useState } from "react";

import MarkdownRender from "../Markdown/MarkdownRender";

type ISubOntologyProps = {
  openOntology: any;
  setOpenOntology: any;
  type: string;
  setSnackbarMessage: (message: any) => void;
  text: string;
};
const SubPlainText = ({ text, type, openOntology, setOpenOntology }: ISubOntologyProps) => {
  const db = getFirestore();
  const [editMode, setEditMode] = useState(false);

  const capitalizeFirstLetter = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const editTitleSubOntology = ({ parentData, newTitle, id }: any) => {
    for (let type of ["Actor", "Process", "Specializations", "Roles", "Evaluation Dimensions"]) {
      if ((parentData.subOntologies[type] || []).length > 0) {
        for (let subOnto of parentData.subOntologies[type]) {
          if (subOnto.id === id) {
            subOnto.title = newTitle;
          }
        }
      }
    }
  };

  const editSaveText = async () => {
    setEditMode(edit => !edit);
    if (editMode) {
      const ontologyDoc = await getDoc(doc(collection(db, "ontology"), openOntology.id));
      if (ontologyDoc.exists()) {
        const ontologyData = ontologyDoc.data();

        if (type === "title") {
          for (let parentId of openOntology?.parents || []) {
            const parentRef = doc(collection(db, "ontology"), parentId);
            const parentDoc = await getDoc(parentRef);
            const parentData = parentDoc.data();
            editTitleSubOntology({ parentData, newTitle: openOntology.title, id: openOntology.id });
            await updateDoc(parentRef, parentData);
          }
        }
        if (["description", "title"].includes(type)) {
          ontologyData[type] = openOntology[type];
        } else {
          ontologyData.plainText[type] = openOntology.plainText[type];
        }

        await updateDoc(ontologyDoc.ref, ontologyData);
      }
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

  return (
    <Box>
      {type !== "title" && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ fontSize: "19px" }}>{capitalizeFirstLetter(type)}:</Typography>
          <Tooltip title={editMode ? "Save" : "Edit"}>
            <Button onClick={editSaveText} sx={{ ml: "5px" }}>
              {editMode ? "Save" : "Edit"}
            </Button>
          </Tooltip>
        </Box>
      )}

      {editMode ? (
        <TextField
          placeholder={`... `}
          variant="standard"
          fullWidth
          value={text}
          multiline
          onChange={handleEditText}
          InputProps={{
            style: { fontSize: type === "title" ? "50px" : "" },
            endAdornment: (
              <Box style={{ marginRight: "18px", cursor: "pointer", display: "flex" }}>
                {type === "title" && (
                  <Tooltip title={"Save"}>
                    <SaveIcon
                      sx={{
                        color: "#757575",
                        ":hover": {
                          color: theme => theme.palette.common.orange,
                        },
                      }}
                      onClick={editSaveText}
                    />
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
        />
      ) : (
        <Box style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
          <MarkdownRender text={text} sx={{ fontSize: type === "title" ? "50px" : "" }} />
          {type === "title" && !openOntology.locked && (
            <Tooltip title={editMode ? "Save" : "Edit"}>
              <Button onClick={editSaveText} sx={{ ml: "5px" }}>
                {editMode ? "Save" : "Edit"}
              </Button>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SubPlainText;