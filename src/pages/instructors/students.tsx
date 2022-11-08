import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Link, useMediaQuery, useTheme } from "@mui/material";
import { Button } from "@mui/material";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
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
  /* addDoc, */
  collection,
  /*   doc,
  DocumentData,
  getDoc,*/
  getDocs,
  getFirestore,
  /*   limit, */
  onSnapshot,
  query,
  /*  Query,
  setDoc,
  Timestamp,
  updateDoc,
   */
  where,
  /*   writeBatch, */
} from "firebase/firestore";
import LinkNext from "next/link";
import React, { useEffect, useState } from "react";

import { InstructorLayoutPage, InstructorsLayout } from "@/components/layouts/InstructorsLayout";

import CSVBtn from "../../components/CSVBtn";
import { StudentFilters, StudentsProfile } from "../../components/instructors/Drawers";
import OptimizedAvatar from "../../components/OptimizedAvatar";

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

const keysColumns: any = {
  "First Name": "firstName",
  "Last Name": "lastName",
  Email: "email",
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

export const Students: InstructorLayoutPage = ({ /* selectedSemester, */ selectedCourse, currentSemester }) => {
  const [tableRows, setTableRows] = useState<any>([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filters, setFilters] = useState<
    {
      title: string;
      operation: string;
      value: number;
    }[]
  >([]);
  const [searchValue, setSearchValue] = useState("");
  const theme = useTheme();
  const isMovil = useMediaQuery(theme.breakpoints.down("md"));
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [openedProfile, setOpenedProfile] = useState(tableRows.slice()[0]);
  const [savedTableState, setSavedTableState] = useState([]);
  const [states, setStates] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const db = getFirestore();

  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    if (isMovil) setEditMode(false);
  }, [isMovil]);
  useEffect(() => {
    if (!db) return;
    if (!currentSemester) return;
    const getStats = async () => {
      const semestersStatsRef = collection(db, "semesterStudentVoteStats");
      const qe = query(semestersStatsRef, where("tagId", "==", currentSemester.tagId));
      const semestersStatsDoc = await getDocs(qe);
      let statsData: any = [];
      if (semestersStatsDoc.docs.length > 0) {
        for (let doc of semestersStatsDoc.docs) {
          const data = doc.data();
          statsData.push(data);
        }
      }
      setStates(statsData);
    };
    getStats();
  }, [db, currentSemester]);

  useEffect(() => {
    if (!db) return;
    if (!currentSemester) return;
    if (states.length === 0) return;
    console.log(":::::: :: ::: states :::: ", states);
    const semestersRef = collection(db, "semesters");
    const q = query(semestersRef, where("tagId", "==", currentSemester.tagId));
    const semestersSnapshot = onSnapshot(q, async snapshot => {
      // console.log("on snapshot");
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) return;
      for (let change of docChanges) {
        if (change.type === "added" || change.type === "modified") {
          const _students = change.doc.data().students;
          const _rows: any = [];
          for (let student of _students) {
            const stats: any = states.filter((elm: any) => elm.uname === student.uname)[0];
            console.log(stats);
            _rows.push({
              id: student.uname,
              username: student.uname,
              avatar: student.imageUrl,
              online: true,
              firstName: student.fName,
              lastName: student.lName,
              email: student.email,
              totalPoints: stats.totalPoints || 0,
              corrects: stats.corrects || 0,
              wrongs: stats.wrongs || 0,
              awards: stats.awards || 0,
              newPorposals: stats.newPorposals || 0,
              editNodeProposals: stats.editNodeProposals || 0,
              proposalsPoints: stats.proposalsPoints || 0,
              questions: stats.questions || 0,
              questionPoints: stats.questionPoints || 0,
              vote: stats.vote || 0,
              votePoints: stats.votePoints || 0,
              lastActivity: new Date(
                stats.lastActivity.seconds * 1000 + stats.lastActivity.nanoseconds / 1000000
              ).toLocaleDateString(),
            });
          }
          setTableRows(_rows.slice());
        }
      }
    });
    return () => {
      semestersSnapshot();
    };
  }, [db, states, currentSemester]);

  const handleOpenCloseFilter = () => setOpenFilter(!openFilter);
  const handleOpenCloseProfile = () => setOpenProfile(!openProfile);

  //this to filter the results
  const handleFilterBy = (filters: any, fromDash: boolean) => {
    let _tableRows = tableRows.slice();
    for (let filter of filters) {
      if (filter.operation === "<") {
        _tableRows = _tableRows.filter((row: any) => row[filterChoices[filter.title]] <= filter.value);
      } else if (filter.operation === ">") {
        _tableRows = _tableRows.filter((row: any) => row[filterChoices[filter.title]] >= filter.value);
      }
    }
    setTableRows(_tableRows);
    if (openFilter && !fromDash) {
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

  //TO-DO
  const updateTableRows = () => {
    let addNewRow = true;
    let _tableRows: any = tableRows.slice();
    for (let row of tableRows) {
      if (!row["firstName"] && !row["lastName"] && !row["email"]) {
        addNewRow = false;
      }
    }
    if (addNewRow) {
      _tableRows.push({
        id: Math.floor(Math.random() * 100),
        username: "Harry Potter",
        avatar: "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png",
        firstName: "",
        lastName: "",
        email: "",
      });
    }
    setTableRows(_tableRows);
  };

  const deleteFilter = (index: any, fromDash: boolean) => {
    const _oldFilters = [...filters];
    _oldFilters.splice(index, 1);
    setFilters(_oldFilters);
    handleFilterBy(_oldFilters, fromDash);
  };

  const handleChangeOperation = (index: number, event: any) => {
    const _filters = [...filters];
    _filters[index] = {
      ..._filters[index],
      operation: event.target.value,
    };
    setFilters(_filters);
  };

  const handleChangeChoice = (index: number, event: any) => {
    const _filters = [...filters];
    _filters[index] = {
      ..._filters[index],
      title: event.target.value,
    };
    setFilters(_filters);
  };

  const editFilterValue = (index: number, event: any) => {
    const _filters = [...filters];
    _filters[index] = {
      ..._filters[index],
      value: event.target.value,
    };
    setFilters(_filters);
  };

  const addFilter = () => {
    const newFilter = {
      title: "Total Poitns",
      operation: "<",
      value: 10,
    };
    const updateFilters = [...filters, newFilter];
    setFilters(updateFilters);
  };

  const openThisProfile = (row: any) => {
    if (!isMovil) return;
    setOpenedProfile(row);
    handleOpenCloseProfile();
  };

  const saveTableChanges = () => {
    const _tableRow: any = tableRows.slice();
    let students = [];

    for (let row of _tableRow) {
      if (!row.firstName || !row.lastName || !row.email) {
        _tableRow.splice(_tableRow.indexOf(row), 1);
      }
    }
    setTableRows(_tableRow);
    for (let row of _tableRow) {
      students.push({
        email: row.email,
        fName: row.firstName,
        lName: row.lastName,
      });
    }
    const payloadAPI = { students };
    console.log(payloadAPI);
    setEditMode(!editMode);
    return;
  };

  const discardTableChanges = () => {
    const _savedTableState = savedTableState.slice();
    setTableRows(_savedTableState);
    setSavedTableState([]);
    setEditMode(!editMode);
  };

  const editValues = (column: any, index: any, event: any) => {
    event.preventDefault();
    let _tableRows: any = tableRows.slice();
    _tableRows[index][column] = event.target.value;
    console.log({ column, index, tableRow: _tableRows[index][column] });
    setTableRows([..._tableRows]);
  };

  const handleClick = (colmn: any, event: any) => {
    // console.log("handleClick", colmn);
    setSelectedColumn(keysColumns[colmn]);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const sortLowHigh = () => {
    const _tableRows = tableRows.slice();
    if (["firstName", "lastName", "email"].includes(selectedColumn)) {
      _tableRows.sort((a: any, b: any) => {
        const nameA = a[selectedColumn].toUpperCase();
        const nameB = b[selectedColumn].toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
    } else {
      _tableRows.sort((a: any, b: any) => a[selectedColumn] - b[selectedColumn]);
    }
    setTableRows(_tableRows);
    handleClose();
  };

  const sortHighLow = () => {
    const _tableRows = tableRows.slice();
    if (["firstName", "lastName", "email"].includes(selectedColumn)) {
      _tableRows.sort((a: any, b: any) => {
        const nameA = a[selectedColumn].toUpperCase();
        const nameB = b[selectedColumn].toUpperCase();
        if (nameA > nameB) {
          return -1;
        }
        if (nameA < nameB) {
          return 1;
        }
        return 0;
      });
    } else {
      _tableRows.sort((a: any, b: any) => b[selectedColumn] - a[selectedColumn]);
    }
    setTableRows(_tableRows);
    handleClose();
  };

  const deleteRow = (index: number) => {
    const _tableRows = tableRows.slice();
    _tableRows.splice(index, 1);
    setTableRows(_tableRows);
  };

  const searchByNameEmail = (newValue: string) => {
    const _tableRows = tableRows.slice();

    const newTable = _tableRows.filter((row: any) => {
      return (
        row.firstName.toLowerCase().includes(newValue) ||
        row.lastName.toLowerCase().includes(newValue) ||
        row.email.toLowerCase().includes(newValue)
      );
    });
    setTableRows(newTable);
  };

  const addNewStudent = () => {
    const _tableRow: any = tableRows.slice();
    _tableRow.push({
      id: Math.floor(Math.random() * 100),
      username: "Harry Potter",
      avatar: "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png",
      firstName: "",
      lastName: "",
      email: "",
    });
    setTableRows(_tableRow);
  };

  const handleNewSearh = (event: any) => {
    setSearchValue(event.target.value);
    if (!event.target.value) return setTableRows(tableRows.slice());
    searchByNameEmail(event.target.value.toLowerCase());
  };

  const handleEditAndAdd = () => {
    const _tableRow: any = tableRows.slice();
    if (editMode) {
      saveTableChanges();
      return setEditMode(!editMode);
    } else {
      const _tableRows = tableRows.slice();
      setSavedTableState(_tableRows);
      updateTableRows();
    }
    _tableRow.push({
      id: Math.floor(Math.random() * 100),
      username: "Harry Potter",
      avatar: "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png",
      firstName: "",
      lastName: "",
      email: "",
    });
    setTableRows(_tableRow);
    setEditMode(!editMode);
  };

  const addNewData = (dataFromCSV: any) => {
    const _tableRow: any = tableRows.slice();
    const CSVData = dataFromCSV;
    const email = CSVData.columns.find((elm: any) => elm?.includes("Email"));
    const fName = CSVData.columns.find((elm: any) => elm?.includes("First Name"));
    const lName = CSVData.columns.find((elm: any) => elm?.includes("Last Name"));
    for (let row of CSVData.rows) {
      const newObject: any = {
        username: "username",
        avatar: "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png",
        firstName: row[fName],
        lastName: row[lName],
        email: row[email],
      };
      _tableRow.push(newObject);
    }
    setTableRows(_tableRow);
  };
  //TO-DO
  if (!currentSemester) return <Typography>You don't have semester</Typography>;
  // if (!tableRows.length) return <Typography>you don't a user </Typography>;
  return (
    <>
      {/* Drawers */}
      <StudentFilters
        isMovil={isMovil}
        filters={filters}
        addFilter={addFilter}
        openFilter={openFilter}
        deleteFilter={deleteFilter}
        filterChoices={filterChoices}
        handleFilterBy={handleFilterBy}
        editFilterValue={editFilterValue}
        handleChangeChoice={handleChangeChoice}
        handleChangeFilter={handleChangeFilter}
        handleOpenCloseFilter={handleOpenCloseFilter}
        handleChangeOperation={handleChangeOperation}
      />
      <StudentsProfile
        openProfile={openProfile}
        openedProfile={openedProfile}
        handleOpenCloseProfile={handleOpenCloseProfile}
      />
      {/* Main Component */}
      <Box
        className="student-dashboard"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          width: "100%",
          height: "100%",
          px: "20px",
        }}
      >
        <Box sx={{}}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: isMovil ? "column" : "row",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "500px",
                flexDirection: "row",
                px: "15px",
              }}
            >
              <Typography sx={{ fontFamily: "math", px: "15px" }} variant="h1" component="h2">
                {selectedCourse}
              </Typography>
              <Typography sx={{ fontFamily: "fangsong" }} component="h2">
                Students:
              </Typography>
              <Typography sx={{ fontFamily: "fangsong" }} component="h2">
                {tableRows.length}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", fontWeight: "700", flexDirection: "row", paddingBottom: "15px" }}>
              <TextField
                sx={{
                  width: { sm: 200, md: 300 },
                  "& .MuiInputBase-root": {
                    height: isMovil ? 40 : 60,
                  },
                  alignSelf: "center",
                  pl: isMovil ? "10px" : "0px",
                  pt: isMovil ? "14px" : "0px",
                  backgroundColor: theme.palette.mode === "dark" ? theme.palette.common.darkGrayBackground : "#F5F5F5",
                }}
                id="outlined-basic"
                value={searchValue}
                onChange={handleNewSearh}
                placeholder={!isMovil ? "search name or email" : "search"}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => {
                        searchByNameEmail(searchValue.toLowerCase());
                      }}
                    >
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
              {!isMovil ? (
                <>
                  <Button
                    variant="contained"
                    disabled={editMode}
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
                      paddingX: "30px",
                      borderRadius: 1,
                      textAlign: "center",
                      alignSelf: "center",
                    }}
                  >
                    Filter By
                  </Button>
                  <Button
                    variant="contained"
                    disabled={editMode}
                    onClick={handleEditAndAdd}
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
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    onClick={handleOpenCloseFilter}
                    sx={{
                      color: theme => theme.palette.common.white,
                      background: theme => theme.palette.common.black,
                      height: { xs: "40px", md: "55px" },
                      my: { xs: "0px", md: "auto" },
                      mt: { xs: "15px", md: "auto" },
                      ml: "15px",
                    }}
                  >
                    <FilterAltIcon /> Filter
                  </Button>
                </>
              )}
            </Box>
          </Box>
          <Box>
            {filters.length > 0 && !openFilter && (
              <Stack direction="row" spacing={2} sx={{ py: "10px", px: "10px" }}>
                {filters?.map((filter, index) => {
                  return (
                    <>
                      <Chip
                        key={index}
                        label={filter.title + " " + filter.operation + " " + filter.value}
                        onDelete={() => deleteFilter(index, false)}
                        sx={{ fontSize: isMovil ? "10px" : "20px" }}
                      />
                      {filters.length - 1 !== index && <Chip key={index} label={"AND"} />}
                    </>
                  );
                })}{" "}
              </Stack>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            border: "1px solid #fff",
            borderRightWidth: 0,
            borderLeftWidth: 0,
          }}
        >
          <TableContainer
            component={Paper}
            sx={{
              // maxHeight: 500,
              height: 600,
            }}
          >
            <Table
              stickyHeader
              aria-label="simple table"
              sx={
                {
                  // height: "max-content",
                }
              }
            >
              <TableHead>
                <TableRow>
                  {!isMovil && <TableCell>{""}</TableCell>}
                  {keys.map((colmn: string, keyIndex: number) => (
                    <TableCell
                      key={keyIndex}
                      sx={
                        ["firstName", "lastName"].includes(colmn) && isMovil
                          ? {
                              position: "sticky",
                              left: colmn === "lastName" ? 90 : 0,
                              backgroundColor: theme =>
                                theme.palette.mode === "dark" ? theme.palette.common.darkGrayBackground : "#FFFFFF",
                              fontWeight: "10px",
                              fontSize: "14px",
                            }
                          : isMovil
                          ? { fontWeight: "10px", fontSize: "14px" }
                          : { fontSize: "14px" }
                      }
                      align="left"
                    >
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <>
                          <div>{colmn}</div>
                          {!isMovil && (
                            <IconButton
                              id={id}
                              onClick={event => handleClick(colmn, event)}
                              sx={{
                                "&:hover": {
                                  background: "none",
                                },
                              }}
                            >
                              <ArrowDropDownIcon viewBox="1 9 24 24" />
                            </IconButton>
                          )}
                        </>
                      </div>
                      <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "left",
                        }}
                        elevation={1}
                      >
                        <Box sx={{ width: "200px", color: "black", display: "flex", flexDirection: "column" }}>
                          <Button
                            sx={{
                              p: 2,
                              fontSize: "14px",
                              color: theme.palette.mode === "dark" ? "white" : "#757575",
                            }}
                            onClick={sortLowHigh}
                          >
                            Sort Low to High
                          </Button>
                          <Button
                            sx={{
                              p: 2,
                              fontSize: "14px",
                              color: theme.palette.mode === "dark" ? "white" : "#757575",
                            }}
                            onClick={sortHighLow}
                          >
                            Sort High to Low
                          </Button>
                        </Box>
                      </Popover>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((row: any, rowIndex: number) => (
                  <TableRow key={rowIndex} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    {!isMovil && (
                      <TableCell align="left">
                        <OptimizedAvatar
                          name={row.username}
                          imageUrl={row.avatar}
                          renderAsAvatar={true}
                          contained={false}
                        />
                        <div className={row.online ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"}></div>
                      </TableCell>
                    )}
                    {columns.map((colmn: string, columnIndex: number) => (
                      <TableCell
                        key={columnIndex}
                        sx={
                          ["firstName", "lastName"].includes(colmn) && isMovil
                            ? {
                                position: "sticky",
                                left: colmn === "lastName" ? 90 : 0,
                                backgroundColor: theme =>
                                  theme.palette.mode === "dark" ? theme.palette.common.darkGrayBackground : "#FFFFFF",
                                fontWeight: "10px",
                                fontSize: "14px",
                              }
                            : isMovil
                            ? { fontWeight: "10px", fontSize: "14px" }
                            : { fontSize: "14px" }
                        }
                        align="left"
                      >
                        {editMode && ["firstName", "lastName", "email"].includes(colmn) ? (
                          <TextField
                            style={{ width: colmn === "email" ? "200px" : "150px" }}
                            value={row[colmn]}
                            onChange={event => editValues(colmn, rowIndex, event)}
                            id="outlined-basic"
                            variant="outlined"
                          />
                        ) : (
                          <>
                            {["firstName", "lastName"].includes(colmn) ? (
                              <LinkNext href={isMovil ? "#" : "#"}>
                                <Link onClick={() => openThisProfile(row)}>
                                  {" "}
                                  <>{row[colmn]}</>
                                </Link>
                              </LinkNext>
                            ) : (
                              <>{row[colmn]}</>
                            )}
                          </>
                        )}
                      </TableCell>
                    ))}
                    {editMode && (
                      <TableCell align="right">
                        <IconButton onClick={() => deleteRow(rowIndex)}>
                          <DeleteIcon
                            color="error"
                            sx={{
                              borderRadius: "50%",
                            }}
                          />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        {editMode ? (
          <Box sx={{ display: "flex", justifyContent: "space-between", paddingTop: "25px" }}>
            <Box>
              <CSVBtn
                variant="text"
                addNewData={addNewData}
                buttonStyles={{
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
                BtnText={"Add students from a csv file"}
              />
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
                onClick={addNewStudent}
              >
                <AddIcon /> Add a new student
              </Button>
            </Box>
            <Box>
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
        ) : (
          <div></div>
        )}
      </Box>
    </>
  );
};

// This wrapper expose the shared variables from filters
const PageWrapper = () => {
  return <InstructorsLayout>{props => <Students {...props} />}</InstructorsLayout>;
};
export default PageWrapper;
