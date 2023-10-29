import CancelIcon from "@mui/icons-material/Cancel";
// import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { Box, TextField, Tooltip, Typography } from "@mui/material";
import { collection, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useCallback } from "react";
import { IOntology, ISubOntology } from "src/types/IOntology";

import useConfirmDialog from "@/hooks/useConfirmDialog";

type ISubOntologyProps = {
  subOntology: ISubOntology;
  openOntology: IOntology;
  sx: any;
  type: string;
  setOpenOntology: (openOntology: any) => void;
  savePlainText: any;
  setSnackbarMessage: (message: any) => void;
};

const SubPlainText = ({ subOntology, sx, type, setOpenOntology, openOntology }: ISubOntologyProps) => {
  const db = getFirestore();
  const { confirmIt, ConfirmDialog } = useConfirmDialog();

  const handleEditPlainText = (e: any) => {
    const _openOntology: any = { ...openOntology };
    const subOntologyIdx = _openOntology.plainText[type].findIndex((sub: any) => sub.id === subOntology.id);
    if (subOntologyIdx !== -1) {
      _openOntology.plainText[type][subOntologyIdx].title = e.target.value;
      setOpenOntology(_openOntology);
    }
  };

  const cancelPlainText = () => {
    setOpenOntology((openOntology: any) => {
      const _openOntology: any = { ...openOntology };
      const subOntologyIdx = _openOntology.plainText[type].findIndex((sub: any) => sub.id === subOntology.id);
      if (subOntologyIdx !== -1) {
        _openOntology.plainText[type][subOntologyIdx].editMode = false;
      }
      if (subOntologyIdx !== -1 && _openOntology.plainText[type][subOntologyIdx].new) {
        _openOntology.plainText[type].splice(subOntologyIdx, 1);
      }
      return _openOntology;
    });
  };

  // const makeSubOntologyEditable = () => {
  //   console.info("makeSubOntologyEditable");
  //   setOpenOntology((openOntology: any) => {
  //     const _openOntology: any = { ...openOntology };
  //     const subOntologyIdx = _openOntology[type].findIndex((sub: any) => sub.id === subOntology.id);
  //     if (subOntologyIdx !== -1) {
  //       _openOntology[type][subOntologyIdx].editMode = true;
  //     }
  //     return _openOntology;
  //   });
  // };
  const deletePlainText = async () => {
    try {
      console.info("deleteSubOntologyEditable");
      if (await confirmIt("Are you sure you want to delete?")) {
        const ontologyDoc = await getDoc(doc(collection(db, "ontology"), openOntology.id));
        if (ontologyDoc.exists()) {
          const ontologyData = ontologyDoc.data();

          const subOntologyIdx = ontologyData.plainText[type].findIndex((sub: any) => sub.id === subOntology.id);
          if (subOntologyIdx !== -1) {
            ontologyData.plainText[type].splice(subOntologyIdx, 1);
          }
          await updateDoc(ontologyDoc.ref, ontologyData);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSavePlainText = useCallback(async () => {
    try {
      if (!openOntology.id) return;
      const ontologyRef = doc(collection(db, "ontology"), openOntology.id);
      const ontologyDoc = await getDoc(ontologyRef);
      if (ontologyDoc.exists()) {
        const ontologydata = ontologyDoc.data();
        const subOntologyIdx = ontologydata.plainText[type].findIndex((sub: any) => sub.id === subOntology.id);
        if (subOntologyIdx === -1) {
          ontologydata.plainText[type].push({
            id: subOntology.id,
            title: subOntology.title,
          });
        } else {
          ontologydata.plainText[type][subOntologyIdx].title = subOntology.title;
        }
        await updateDoc(ontologyDoc.ref, ontologydata);
      }
    } catch (error) {
      console.error(error);
    }
  }, [openOntology.id, db, type, subOntology.id, subOntology.title]);

  return (
    <Box key={subOntology.id} sx={{ ...sx }}>
      {subOntology.editMode ? (
        <TextField
          placeholder={``}
          variant="standard"
          fullWidth
          value={subOntology.title}
          multiline
          onChange={handleEditPlainText}
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
                    onClick={handleSavePlainText}
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
                    onClick={cancelPlainText}
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
        <Box key={subOntology.id} style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
          <Typography>{subOntology.title}</Typography>

          {/* <Tooltip title={"Edit"}>
            <CreateIcon
              sx={{
                cursor: "pointer",
                color: "#757575",
                marginLeft: "15px",
                marginTop: "auto",
                marginBottom: "auto",
                ":hover": {
                  color: theme => theme.palette.common.orange,
                },
              }}
              fontSize="small"
              onClick={makeSubOntologyEditable}
            />
          </Tooltip> */}
          <Tooltip title={"Delete"}>
            <DeleteIcon
              sx={{
                cursor: "pointer",
                color: "#757575",
                marginLeft: "10px",
                marginTop: "auto",
                marginBottom: "auto",
                ":hover": {
                  color: theme => theme.palette.common.orange,
                },
              }}
              fontSize="small"
              onClick={deletePlainText}
            />
          </Tooltip>
        </Box>
      )}
      {ConfirmDialog}
    </Box>
  );
};

export default SubPlainText;
