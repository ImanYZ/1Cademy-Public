import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, TextField, Tooltip, Typography } from "@mui/material";
// import { collection, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { IOntology } from "src/types/IOntology";

import MarkdownRender from "../Markdown/MarkdownRender";

type ISubOntologyProps = {
  openOntology: IOntology;
  type: string;
  setSnackbarMessage: (message: any) => void;
  text: string;
};
const SubPlainText = ({ text, type }: ISubOntologyProps) => {
  // const db = getFirestore();
  const [editMode, setEditMode] = useState(false);

  // const handleSavePlainText = useCallback(async () => {
  //   try {
  //     if (!openOntology.id) return;
  //     const ontologyRef = doc(collection(db, "ontology"), openOntology.id);
  //     const ontologyDoc = await getDoc(ontologyRef);
  //     if (ontologyDoc.exists()) {
  //       const ontologydata = ontologyDoc.data();
  //       const subOntologyIdx = ontologydata.plainText[type].findIndex((sub: any) => sub.id === subOntology.id);
  //       if (subOntologyIdx === -1) {
  //         ontologydata.plainText[type].push({
  //           id: subOntology.id,
  //           title: subOntology.title,
  //         });
  //       } else {
  //         ontologydata.plainText[type][subOntologyIdx].title = subOntology.title;
  //       }
  //       await updateDoc(ontologyDoc.ref, ontologydata);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }, [openOntology.id, db, type, subOntology.id, subOntology.title]);
  const capitalizeFirstLetter = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };
  const editSaveText = () => {
    setEditMode(edit => !edit);
  };
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography sx={{ fontSize: "19px" }}>{capitalizeFirstLetter(type)}:</Typography>
        <Tooltip title={"Select"}>
          <Button onClick={editSaveText} sx={{ ml: "5px" }}>
            {editMode ? "Save" : "Edit"}
          </Button>
        </Tooltip>
      </Box>
      {editMode ? (
        <TextField
          placeholder={`... `}
          variant="standard"
          fullWidth
          value={text}
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
                </Tooltip>{" "}
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
        <Box style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
          <MarkdownRender text={text} />
        </Box>
      )}
    </Box>
  );
};

export default SubPlainText;
