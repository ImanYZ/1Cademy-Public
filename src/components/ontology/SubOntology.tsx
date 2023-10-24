import CancelIcon from "@mui/icons-material/Cancel";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Link, TextField, Tooltip } from "@mui/material";
import { IOntology, ISubOntology } from "src/types/IOntology";

type ISubOntologyProps = {
  subOntology: ISubOntology;
  openOntology: IOntology;
  sx: any;
  type:
    | "contributors"
    | "actors"
    | "preconditions"
    | "postconditions"
    | "evaluations"
    | "processes"
    | "specializations";
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

  const makeSubOntologyEditable = () => {
    console.info("makeSubOntologyEditable");
    setOpenOntology((openOntology: any) => {
      const _openOntology: any = { ...openOntology };
      const subOntologyIdx = _openOntology[type].findIndex((sub: any) => sub.id === subOntology.id);
      if (subOntologyIdx !== -1) {
        _openOntology[type][subOntologyIdx].editMode = true;
      }
      return _openOntology;
    });
  };
  const deleteSubOntologyEditable = () => {
    console.info("deleteSubOntologyEditable");

    setOpenOntology((openOntology: any) => {
      const _openOntology: any = { ...openOntology };
      const subOntologyIdx = _openOntology[type].findIndex((sub: any) => sub.id === subOntology.id);
      if (subOntologyIdx !== -1) {
        _openOntology[type].splice(subOntologyIdx, 1);
      }
      return _openOntology;
    });
  };

  return (
    <Box key={subOntology.id} sx={{ ...sx }}>
      {subOntology.editMode ? (
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
          <Tooltip title={"Edit"}>
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
          </Tooltip>
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
    </Box>
  );
};

export default SubOntology;
