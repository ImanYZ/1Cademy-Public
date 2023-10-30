import CancelIcon from "@mui/icons-material/Cancel";
// import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Link, TextField, Tooltip } from "@mui/material";
import { collection, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { IOntology, ISubOntology } from "src/types/IOntology";

import useConfirmDialog from "@/hooks/useConfirmDialog";

type ISubOntologyProps = {
  subOntology: ISubOntology;
  openOntology: IOntology;
  sx: any;
  type: string;
  setOpenOntology: (openOntology: any) => void;
  handleLinkNavigation: any;
  saveSubOntology: any;
  setSnackbarMessage: (message: any) => void;
};

const SubOntology = ({
  subOntology,
  sx,
  type,
  setOpenOntology,
  openOntology,
  handleLinkNavigation,
  saveSubOntology,
}: ISubOntologyProps) => {
  const db = getFirestore();
  const { confirmIt, ConfirmDialog } = useConfirmDialog();
  const handleEditSubOntologyChange = (e: any) => {
    const _openOntology: any = { ...openOntology };
    const subOntologyIdx = _openOntology[type].findIndex((sub: any) => sub.id === subOntology.id);
    if (subOntologyIdx !== -1) {
      _openOntology[type][subOntologyIdx].title = e.target.value;
      setOpenOntology(_openOntology);
    }
  };

  const cancelSubOntology = () => {
    setOpenOntology((openOntology: any) => {
      const _openOntology: any = { ...openOntology };
      const subOntologyIdx = _openOntology[type].findIndex((sub: any) => sub.id === subOntology.id);
      if (subOntologyIdx !== -1) {
        _openOntology[type][subOntologyIdx].editMode = false;
      }
      if (subOntologyIdx !== -1 && _openOntology[type][subOntologyIdx].new) {
        _openOntology[type].splice(subOntologyIdx, 1);
      }
      return _openOntology;
    });
  };

  const linkNavigation = () => {
    handleLinkNavigation({ id: subOntology.id, title: subOntology.title });
  };

  const handleSaveSubOntology = () => {
    saveSubOntology(subOntology, type);
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

  const removeSubOntology = ({ ontologyData, id }: any) => {
    for (let type of ["Actor", "Process", "Roles", "Evaluation Dimensions"]) {
      if ((ontologyData.subOntologies[type] || []).length > 0) {
        const subOntologyIdx = ontologyData.subOntologies[type].findIndex((sub: any) => sub.id === id);
        if (subOntologyIdx !== -1) {
          ontologyData.subOntologies[type].splice(subOntologyIdx, 1);
        }
      }
    }
  };
  const deleteSubOntologyEditable = async () => {
    try {
      console.info("deleteSubOntologyEditable");
      if (await confirmIt("Are you sure you want to delete?")) {
        const ontologyDoc = await getDoc(doc(collection(db, "ontology"), openOntology.id));
        if (ontologyDoc.exists()) {
          const ontologyData = ontologyDoc.data();
          const subOntologyIdx = ontologyData.subOntologies[type].findIndex((sub: any) => sub.id === subOntology.id);
          if (subOntologyIdx !== -1) {
            ontologyData.subOntologies[type].splice(subOntologyIdx, 1);
          }
          const subOntologyDoc = await getDoc(doc(collection(db, "ontology"), subOntology.id));

          if (subOntologyDoc.exists()) {
            const subOntologyData = subOntologyDoc.data();
            const parents = subOntologyData.parents;
            for (let parent of parents) {
              const ontologyDoc = await getDoc(doc(collection(db, "ontology"), parent));
              if (ontologyDoc.exists()) {
                const ontologyData = ontologyDoc.data();
                removeSubOntology({ ontologyData, id: subOntology.id });
                await updateDoc(ontologyDoc.ref, ontologyData);
              }
            }
            // await deleteDoc(subOntologyDoc.ref);
          }

          await updateDoc(ontologyDoc.ref, ontologyData);
        }
        setOpenOntology((openOntology: any) => {
          const _openOntology: any = { ...openOntology };
          const subOntologyIdx = _openOntology.subOntologies[type].findIndex((sub: any) => sub.id === subOntology.id);
          if (subOntologyIdx !== -1) {
            _openOntology.subOntologies[type].splice(subOntologyIdx, 1);
          }
          return _openOntology;
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box key={subOntology.id} sx={{ ...sx }}>
      {false ? (
        <TextField
          placeholder={``}
          variant="standard"
          fullWidth
          value={subOntology.title}
          multiline
          onChange={handleEditSubOntologyChange}
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
                    onClick={handleSaveSubOntology}
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
                    onClick={cancelSubOntology}
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
          <Link underline="hover" onClick={linkNavigation} sx={{ cursor: "pointer", color: "white" }}>
            {" "}
            {subOntology.title}
          </Link>
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
              onClick={deleteSubOntologyEditable}
            />
          </Tooltip>
        </Box>
      )}
      {ConfirmDialog}
    </Box>
  );
};

export default SubOntology;
