import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
// import { createStyles, makeStyles } from '@mui/styles';
import EditIcon from "@mui/icons-material/Edit";
import { Box } from "@mui/material";
import { Button } from "@mui/material";
import Chip from "@mui/material/Chip";
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
// import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  // GridCallbackDetails,
  // GridCellEditCommitParams,
  // GridRenderEditCellParams,
  GridRowsProp,
  // GridValueSetterParams,
  // MuiBaseEvent,
  // MuiEvent,
} from "@mui/x-data-grid";
import React, { useState } from "react";

import OptimizedAvatar from "../../components/OptimizedAvatar";
import PageWrapper from "./tmp";
// const useStyles = makeStyles(() => ({
//   editableMode: {

//   },
// }));
const rows: GridRowsProp = [
  {
    id: 0,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
      online: true,
    },
    firstName: "Derrick ",
    lastName: "Schultz",
    email: "samirbes@umich.edu",
    totalPoints: 74,
    corrects: 40,
    wrongs: 51,
    awards: 86,
    newPorposals: 31,
    editNodeProposals: 67,
    proposalsPoints: 77,
    questions: 10,
    questionPoints: 63,
    vote: 17,
    votePoints: 86,
    lastActivity: "02/22/22",
  },
  {
    id: 1,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
    },
    firstName: "Edna ",
    lastName: " Roberts",
    email: "samirbes@umich.edu",
    totalPoints: 50,
    corrects: 68,
    wrongs: 67,
    awards: 79,
    newPorposals: 71,
    editNodeProposals: 38,
    proposalsPoints: 87,
    questions: 12,
    questionPoints: 81,
    vote: 39,
    votePoints: 83,
    lastActivity: "02/22/22",
  },
  {
    id: 2,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
    },
    firstName: "Belle ",
    lastName: " Douglas",
    email: "samirbes@umich.edu",
    totalPoints: 60,
    corrects: 80,
    wrongs: 7,
    awards: 97,
    newPorposals: 49,
    editNodeProposals: 24,
    proposalsPoints: 97,
    questions: 17,
    questionPoints: 95,
    vote: 99,
    votePoints: 93,
    lastActivity: "02/22/22",
  },
  {
    id: 3,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
      online: true,
    },
    firstName: "Jay",
    lastName: "Tyler",
    email: "samirbes@umich.edu",
    totalPoints: 92,
    corrects: 95,
    wrongs: 77,
    awards: 3,
    newPorposals: 6,
    editNodeProposals: 58,
    proposalsPoints: 80,
    questions: 72,
    questionPoints: 24,
    vote: 96,
    votePoints: 41,
    lastActivity: "02/22/22",
  },
  {
    id: 4,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
      online: true,
    },
    firstName: "Darrell",
    lastName: "Harrington",
    email: "samirbes@umich.edu",
    totalPoints: 43,
    corrects: 61,
    wrongs: 76,
    awards: 62,
    newPorposals: 88,
    editNodeProposals: 88,
    proposalsPoints: 46,
    questions: 35,
    questionPoints: 49,
    vote: 25,
    votePoints: 59,
    lastActivity: "02/22/22",
  },
  {
    id: 5,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
      online: true,
    },
    firstName: "Johanna",
    lastName: "Bailey",
    email: "samirbes@umich.edu",
    totalPoints: 46,
    corrects: 27,
    wrongs: 95,
    awards: 23,
    newPorposals: 77,
    editNodeProposals: 78,
    proposalsPoints: 81,
    questions: 63,
    questionPoints: 36,
    vote: 74,
    votePoints: 14,
    lastActivity: "02/22/22",
  },
  {
    id: 6,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
      online: true,
    },
    firstName: "Effie",
    lastName: "Vega",
    email: "samirbes@umich.edu",
    totalPoints: 5,
    corrects: 54,
    wrongs: 13,
    awards: 32,
    newPorposals: 62,
    editNodeProposals: 76,
    proposalsPoints: 24,
    questions: 83,
    questionPoints: 93,
    vote: 26,
    votePoints: 84,
    lastActivity: "02/22/22",
  },
  {
    id: 7,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
    },
    firstName: "Lida",
    lastName: "Jordan",
    email: "samirbes@umich.edu",
    totalPoints: 90,
    corrects: 94,
    wrongs: 55,
    awards: 15,
    newPorposals: 23,
    editNodeProposals: 54,
    proposalsPoints: 2,
    questions: 60,
    questionPoints: 31,
    vote: 29,
    votePoints: 95,
    lastActivity: "02/22/22",
  },
  {
    id: 8,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
    },
    firstName: "Genevieve",
    lastName: "Todd",
    email: "samirbes@umich.edu",
    totalPoints: 11,
    corrects: 98,
    wrongs: 30,
    awards: 45,
    newPorposals: 72,
    editNodeProposals: 21,
    proposalsPoints: 84,
    questions: 36,
    questionPoints: 4,
    vote: 9,
    votePoints: 56,
    lastActivity: "02/22/22",
  },
  {
    id: 9,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
    },
    firstName: "Wayne",
    lastName: "Edwards",
    email: "samirbes@umich.edu",
    totalPoints: 17,
    corrects: 3,
    wrongs: 24,
    awards: 89,
    newPorposals: 58,
    editNodeProposals: 53,
    proposalsPoints: 90,
    questions: 24,
    questionPoints: 50,
    vote: 97,
    votePoints: 74,
    lastActivity: "02/22/22",
  },
  {
    id: 10,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
    },
    firstName: "Isaac",
    lastName: "Thompson",
    email: "samirbes@umich.edu",
    totalPoints: 40,
    corrects: 69,
    wrongs: 16,
    awards: 28,
    newPorposals: 15,
    editNodeProposals: 95,
    proposalsPoints: 78,
    questions: 90,
    questionPoints: 72,
    vote: 38,
    votePoints: 80,
    lastActivity: "02/22/22",
  },
  {
    id: 11,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
    },
    firstName: "Rosetta",
    lastName: "Lucas",
    email: "samirbes@umich.edu",
    totalPoints: 5,
    corrects: 32,
    wrongs: 46,
    awards: 5,
    newPorposals: 7,
    editNodeProposals: 26,
    proposalsPoints: 4,
    questions: 86,
    questionPoints: 56,
    vote: 60,
    votePoints: 19,
    lastActivity: "02/22/22",
  },
  {
    id: 12,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
    },
    firstName: "Harold ",
    lastName: "Robbins",
    email: "samirbes@umich.edu",
    totalPoints: 94,
    corrects: 41,
    wrongs: 32,
    awards: 66,
    newPorposals: 41,
    editNodeProposals: 99,
    proposalsPoints: 1,
    questions: 92,
    questionPoints: 95,
    vote: 22,
    votePoints: 5,
    lastActivity: "02/22/22",
  },
  {
    id: 13,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
    },
    firstName: "Alan",
    lastName: "Medina",
    email: "samirbes@umich.edu",
    totalPoints: 74,
    corrects: 81,
    wrongs: 11,
    awards: 27,
    newPorposals: 98,
    editNodeProposals: 22,
    proposalsPoints: 71,
    questions: 5,
    questionPoints: 69,
    vote: 81,
    votePoints: 66,
    lastActivity: "02/22/22",
  },
  {
    id: 14,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
    },
    firstName: "Ray",
    lastName: "Phelps",
    email: "samirbes@umich.edu",
    totalPoints: 77,
    corrects: 61,
    wrongs: 61,
    awards: 3,
    newPorposals: 87,
    editNodeProposals: 86,
    proposalsPoints: 10,
    questions: 4,
    questionPoints: 7,
    vote: 57,
    votePoints: 87,
    lastActivity: "02/22/22",
  },
  {
    id: 15,
    user: {
      username: "username",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
    },
    firstName: "Lilly",
    lastName: "McKinney",
    email: "samirbes@umich.edu",
    totalPoints: 80,
    corrects: 77,
    wrongs: 57,
    awards: 56,
    newPorposals: 2,
    editNodeProposals: 51,
    proposalsPoints: 70,
    questions: 25,
    questionPoints: 6,
    vote: 65,
    votePoints: 71,
    lastActivity: "02/22/22",
  },
  {
    id: 16,
    user: {
      username: "Harry Potter",
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
    },
    firstName: "Bertie",
    lastName: "Collins",
    email: "samirbes@umich.edu",
    totalPoints: 42,
    corrects: 94,
    wrongs: 99,
    awards: 55,
    newPorposals: 47,
    editNodeProposals: 67,
    proposalsPoints: 99,
    questions: 89,
    questionPoints: 24,
    vote: 26,
    votePoints: 45,
    lastActivity: "02/22/22",
  },
];
const filterChoices: any = {
  "Total Poitns": "totalPoints",
  Wrongs: "wrongs",
  Corrects: "corrects",
  Awards: "awards",
  "New Proposals": "newPorposals",
  "Edit Node Proposals": "editNodeProposals",
  "Proposals Points": "proposalsPoints",
  Questions: "questions",
  "Question Points": "questionPoints",
  Vote: "vote",
  "Vote Points": "votePoints",
  "Last Activity": "lastActivity",
};

const columns: string[] = [
  "firstName",
  "lastName",
  "email",
  "totalPoints",
  "wrongs",
  "corrects",
  "awards",
  "newPorposals",
  "editNodeProposals",
  "proposalsPoints",
  "questions",
  "questionPoints",
  "vote",
  "votePoints",
  "lastActivity",
  "actions",
];

const keys = [
  "First Name",
  "Last Name",
  "Email",
  "Total Poitns",
  "Wrongs",
  "Corrects",
  "Awards",
  "New Proposals",
  "Edit Node Proposals",
  "Proposals Points",
  "Questions",
  "Question Points",
  "Vote",
  "Vote Points",
  "Last Activity",
];
export const Students = () => {
  const [tableRows, setTableRows] = useState<GridRowsProp>(rows.slice());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updatedTableData, setUpdatedTableData] = useState(rows);
  const [openFilter, setOpenFilter] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // const [tableColumns /* , setTableColumns */] = useState(dataGridColumns({ editMode: false }));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dataGridLoading, setDataGridLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<
    {
      title: string;
      operation: string;
      value: number;
    }[]
  >([]);

  const handleOpenCloseFilter = () => setOpenFilter(!openFilter);
  console.log("tableRows", tableRows);

  const handleFilterBy = (filters: any) => {
    let _tableRows = rows.slice();
    for (let filter of filters) {
      console.log(filterChoices[filter.title]);
      if (filter.operation === "<") {
        _tableRows = _tableRows.filter(row => row[filterChoices[filter.title]] <= filter.value);
      } else if (filter.operation === ">") {
        _tableRows = _tableRows.filter(row => row[filterChoices[filter.title]] >= filter.value);
      }
    }
    setTableRows(_tableRows);
    if (openFilter) {
      handleOpenCloseFilter();
    }
  };

  const handleChangeFilter = (event: any) => {
    const newFilter = {
      title: event.target.value,
      operation: "<",
      value: 10,
    };
    const updateFilters = [...filters, newFilter];
    setFilters(updateFilters);
  };

  const addFilter = () => {
    const newFilter = {
      title: "",
      operation: "<",
      value: 10,
    };
    const updateFilters = [...filters, newFilter];
    setFilters(updateFilters);
  };

  const deleteFilter = (index: any) => {
    console.log(index);
    const _oldFilters = [...filters];
    _oldFilters.splice(index, 1);
    setFilters(_oldFilters);
    handleFilterBy(_oldFilters);
  };
  const handleChangeOperation = (index: number, event: any) => {
    console.log(event.target.value);
    const _filters = [...filters];
    _filters[index] = {
      ..._filters[index],
      operation: event.target.value,
    };
    setFilters(_filters);
    console.log("handleChangeOperation");
  };

  const handleChangeChoice = (index: number, event: any) => {
    console.log(index);
    const _filters = [...filters];
    _filters[index] = {
      ..._filters[index],
      title: event.target.value,
    };
    setFilters(_filters);
  };

  const editFilterValue = (index: number, event: any) => {
    console.log(event.target.value);
    const _filters = [...filters];
    _filters[index] = {
      ..._filters[index],
      value: event.target.value,
    };
    setFilters(_filters);
  };
  console.log("filters", filters);
  const list = () => (
    <>
      <Box sx={{ textAlign: "right" }}>
        <IconButton onClick={handleOpenCloseFilter}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        role="presentation"
        sx={{
          width: "489px",
          display: "flex",
          flexDirection: "column",
          height: "90%",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ ml: "50px", width: "400px" }}>
          <Typography sx={{ mb: "10px" }}>Filter By</Typography>

          {filters.length > 0 ? (
            <>
              {filters.map((filter, index) => {
                console.log(filter.operation);
                return (
                  <>
                    <Paper key={index} elevation={6} sx={{ mb: "13px" }}>
                      <Box sx={{ textAlign: "right" }}>
                        <IconButton onClick={() => deleteFilter(index)}>
                          <DeleteForeverIcon />
                        </IconButton>
                      </Box>
                      <Box sx={{ width: "367px", ml: "5px", mr: "10px", paddingBottom: "10px" }}>
                        <FormControl fullWidth>
                          <Select value={filter.title} onChange={event => handleChangeChoice(index, event)}>
                            {Object.keys(filterChoices).map((choice, index) => {
                              return (
                                <MenuItem key={index} value={choice}>
                                  {choice}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "row", paddingBottom: "25px" }}>
                        <Box sx={{ minWidth: 80, ml: "5px", mr: "10px" }}>
                          <FormControl fullWidth>
                            <Select value={filter.operation} onChange={event => handleChangeOperation(index, event)}>
                              <MenuItem value={"<"}>{"<"}</MenuItem>
                              <MenuItem value={">"}>{">"}</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        <TextField
                          sx={{ height: "5px", width: "70%" }}
                          id="outlined-basic"
                          placeholder="Enter a value"
                          variant="outlined"
                          onChange={event => editFilterValue(index, event)}
                          value={filter.value}
                        />
                      </Box>
                    </Paper>
                    <>{filters.length - 1 !== index && <>AND</>}</>
                  </>
                );
              })}
              <Box sx={{ mt: "10px" }}>
                <IconButton onClick={addFilter}>
                  <AddIcon />
                </IconButton>
                {"Add a Filter"}
              </Box>
            </>
          ) : (
            <Box sx={{ width: "367px", ml: "5px", mr: "10px", paddingBottom: "10px" }}>
              <FormControl fullWidth>
                <Select displayEmpty name="Enter a value" onChange={handleChangeFilter}>
                  {Object.keys(filterChoices).map((choice, index) => {
                    return (
                      <MenuItem key={index} value={choice}>
                        {choice}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={() => handleFilterBy(filters)}
            sx={{
              color: theme => theme.palette.common.white,
              background: theme => theme.palette.common.orange,
              height: { xs: "40px", md: "55px" },
              width: { xs: "50%", md: "auto" },
              fontSize: 16,
              fontWeight: "700",
              marginLeft: { xs: "0px", md: "32px" },
              marginRight: "40px",
              paddingX: "30px",
              borderRadius: 1,
            }}
          >
            Filter result
          </Button>
        </Box>
      </Box>
    </>
  );

  const saveTableChanges = () => {
    // console.log(apiRef?.current?.getRowModels());
    // setTableRows([]);
    // setDataGridLoading(true);
    // setTimeout(() => {
    //   setTableRows([...updatedTableData]);
    //   setDataGridLoading(false);
    // }, 1000);
  };

  const discardTableChanges = () => {
    setEditMode(!editMode);
    setTableRows([...tableRows]);
    setUpdatedTableData([]);
  };

  console.log("tableRows :::: :::: ", tableRows);
  return (
    <>
      <PageWrapper />
      <Box className="student-dashboard" sx={{ padding: "20px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            m: "25px 30px",
          }}
        >
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              width: "30%",
              justifyContent: "space-evenly",
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "row" }}>
              <Typography variant="h1" component="h2">
                Sl 106
              </Typography>
              <Typography sx={{ ml: "5px", mt: "20px", fontSize: "14.5px" }} variant="h5" component="h2">
                Fall 22
              </Typography>
            </Box>

            <Typography sx={{ fontSize: "14.5px" }} variant="h5" component="h2">
              Students: 50
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              onClick={handleOpenCloseFilter}
              sx={{
                color: theme => theme.palette.common.white,
                background: theme => theme.palette.common.orange,
                height: { xs: "40px", md: "55px" },
                width: { xs: "50%", md: "auto" },
                fontSize: 16,
                fontWeight: "700",
                my: { xs: "0px", md: "auto" },
                mt: { xs: "15px", md: "auto" },
                marginLeft: { xs: "0px", md: "32px" },
                marginRight: "40px",
                paddingX: "30px",
                borderRadius: 1,
                textAlign: "center",
                alignSelf: "center",
              }}
            >
              Filter By
            </Button>
            <TextField
              sx={{ height: "5px", width: "500px" }}
              id="outlined-basic"
              placeholder="search name or email"
              variant="outlined"
            />
            <Button
              variant="contained"
              onClick={() => setEditMode(!editMode)}
              sx={{
                color: theme => theme.palette.common.white,
                background: theme => theme.palette.common.black,
                height: { xs: "40px", md: "55px" },
                width: { xs: "50%", md: "auto" },
                fontSize: 16,
                fontWeight: "700",
                my: { xs: "0px", md: "auto" },
                mt: { xs: "15px", md: "auto" },
                marginLeft: { xs: "0px", md: "32px" },
                marginRight: "40px",
                paddingX: "30px",
                borderRadius: 1,
                textAlign: "center",
                alignSelf: "center",
              }}
            >
              <EditIcon /> Edit/Add
            </Button>

            <Drawer anchor={"right"} open={openFilter} onClose={handleOpenCloseFilter}>
              {list()}
            </Drawer>
          </Box>
        </Box>
        {filters.length > 0 && !openFilter && (
          <Stack direction="row" spacing={2}>
            {filters?.map((filter, index) => {
              return (
                <>
                  <Chip
                    key={index}
                    label={filter.title + " " + filter.operation + " " + filter.value}
                    onDelete={() => deleteFilter(index)}
                    sx={{ fontSize: "20px" }}
                  />
                  {filters.length - 1 !== index && <Chip key={index} label={"AND"} />}
                </>
              );
            })}{" "}
          </Stack>
        )}

        <hr />
        <Box
          className="student-dashboard-table"
          sx={{ height: "500px", mt: "40px", mr: "70px", ml: "30px", mb: "90px" }}
        >
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="right"> {""}</TableCell>
                  {keys.map(colmn => {
                    return (
                      <TableCell align="left" key={colmn}>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <div> {colmn}</div>
                          <IconButton style={{ paddingTop: "10px" }}>
                            {" "}
                            <ArrowDropDownIcon viewBox="1 9 24 24" />
                          </IconButton>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map(row => (
                  <TableRow key={row.firstName} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell align="left">
                      <OptimizedAvatar
                        name={row.user.username}
                        imageUrl={row.user.avatar}
                        renderAsAvatar={true}
                        contained={false}
                      />
                      <div className={row.user.online ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"}></div>
                    </TableCell>
                    {columns.map(colm => {
                      return (
                        <TableCell key={colm} align="left">
                          {row[colm]}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {editMode && (
            <Box sx={{ mt: "50px" }}>
              <Button
                variant="text"
                sx={{
                  color: theme => theme.palette.common.black,
                  backgroundColor: "#EDEDED",
                  fontSize: 16,
                  fontWeight: "700",
                  my: { xs: "0px", md: "auto" },
                  mt: { xs: "15px", md: "auto" },
                  marginLeft: { xs: "0px", md: "32px" },
                  marginRight: "40px",
                  paddingX: "30px",
                  borderRadius: 1,
                  textAlign: "center",
                  alignSelf: "center",
                }}
                onClick={() => discardTableChanges()}
              >
                Add students from a csv file
              </Button>

              <Box sx={{ textAlign: "right" }}>
                <Button
                  variant="text"
                  sx={{
                    color: theme => theme.palette.common.white,
                    fontSize: 16,
                    fontWeight: "700",
                    my: { xs: "0px", md: "auto" },
                    marginLeft: { xs: "0px", md: "32px" },
                    marginRight: "40px",
                    paddingX: "30px",
                    borderRadius: 1,
                    textAlign: "center",
                    alignSelf: "center",
                  }}
                  onClick={() => discardTableChanges()}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    color: theme => theme.palette.common.white,
                    background: theme => theme.palette.common.orange,
                    fontSize: 16,
                    fontWeight: "700",
                    my: { xs: "0px", md: "auto" },
                    marginLeft: { xs: "0px", md: "32px" },
                    marginRight: "40px",
                    paddingX: "30px",
                    borderRadius: 1,
                    textAlign: "center",
                    alignSelf: "center",
                  }}
                  onClick={() => saveTableChanges()}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Students;
