import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import EditIcon from "@mui/icons-material/Edit";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Divider, Link, TableContainer, useMediaQuery, useTheme } from "@mui/material";
import { Button } from "@mui/material";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { collection, getDocs, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import LinkNext from "next/link";
import React, { useEffect, useState } from "react";

import { InstructorLayoutPage, InstructorsLayout } from "@/components/layouts/InstructorsLayout";

import { postWithToken } from "../../../src/lib/mapApi";
import CSVBtn from "../../components/CSVBtn";
import DeleteButton from "../../components/DeleteButton";
import { StudentFilters, StudentsProfile } from "../../components/instructors/Drawers";
import OptimizedAvatar from "../../components/OptimizedAvatar";

const filterChoices: any = {
  "Total Poitns": "totalPoints",
  Wrongs: "wrongs",
  Corrects: "corrects",
  Awards: "awards",
  "New Proposals": "newProposals",
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
  "newProposals",
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
  "New Proposals": "newProposals",
  "Edit Node Proposals": "editNodeProposals",
  "Proposals Points": "proposalsPoints",
  Questions: "questions",
  "Question Points": "questionPoints",
  Vote: "vote",
  "Vote Points": "votePoints",
  "Last Activity": "lastActivity",
};

export const Students: InstructorLayoutPage = ({ /* selectedSemester, */ selectedCourse, currentSemester }) => {
  const [rows, setRows] = useState<any>([]);
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
  const [usersStatus, setUsersStatus] = useState([]);
  const [newStudents, setNewStudents] = useState([]);
  const open = Boolean(anchorEl);
  const db = getFirestore();

  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    if (isMovil) setEditMode(false);
    if (!isMovil) setOpenProfile(false);
  }, [isMovil]);
  useEffect(() => {
    if (!db) return;
    if (!currentSemester) return;
    const getStats = async () => {
      const semestersStatsRef = collection(db, "semesterStudentVoteStats");
      const statusRef = collection(db, "status");
      const qeStatus = query(statusRef);
      const statusDoc = await getDocs(qeStatus);
      const qe = query(semestersStatsRef, where("tagId", "==", currentSemester.tagId));
      const semestersStatsDoc = await getDocs(qe);
      let statsData: any = [];
      let status: any = [];
      if (semestersStatsDoc.docs.length > 0) {
        for (let doc of semestersStatsDoc.docs) {
          const data = doc.data();
          statsData.push(data);
        }
      }
      if (statusDoc.docs.length > 0) {
        for (let doc of statusDoc.docs) {
          const data = doc.data();
          status.push(data);
        }
      }
      setUsersStatus(status);
      setStates(statsData);
    };
    getStats();
  }, [db, currentSemester]);

  useEffect(() => {
    if (!db) return;
    if (!currentSemester) return;
    if (states.length === 0) return;
    const semestersRef = collection(db, "semesters");
    const q = query(semestersRef, where("tagId", "==", currentSemester.tagId));
    const semestersSnapshot = onSnapshot(q, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) return;
      for (let change of docChanges) {
        if (change.type === "added" || change.type === "modified") {
          const _students = change.doc.data().students;
          const { numPoints, numProposalPerDay } = change.doc.data().nodeProposals;
          const _rows: any = [];
          for (let student of _students) {
            const stats: any = states.filter((elm: any) => elm.uname === student.uname)[0];
            const userStat: any = usersStatus.filter((elm: any) => elm.uname === student.uname)[0];
            _rows.push({
              id: student.uname,
              username: student.uname,
              avatar: student.imageUrl,
              online: userStat?.state,
              firstName: student.fName,
              lastName: student.lName,
              email: student.email,
              totalPoints: stats?.totalPoints || 0,
              newProposals: stats?.newNodes || 0,
              editNodeProposals: stats?.improvements || 0,
              proposalsPoints: stats?.improvements * (numPoints / numProposalPerDay) || 0, //TO-DO
              corrects: stats?.upVotes || 0,
              wrongs: stats?.downVotes || 0,
              awards: stats?.instVotes || 0,
              questions: stats?.questions || 0,
              questionPoints: stats?.questionPoints || 0,
              vote: stats?.votes || 0,
              votePoints: stats?.votePoints || 0,
              lastActivity: stats?.lastActivity
                ? new Date(
                    stats?.lastActivity.seconds * 1000 + stats?.lastActivity.nanoseconds / 1000000
                  ).toLocaleDateString()
                : new Date().toLocaleDateString(),
            });
          }
          setTableRows(_rows.slice());
          setRows(_rows.slice());
        }
      }
    });
    return () => {
      semestersSnapshot();
    };
  }, [db, states, currentSemester, usersStatus]);

  const handleOpenCloseFilter = () => setOpenFilter(!openFilter);
  const handleOpenCloseProfile = () => setOpenProfile(!openProfile);

  //this to filter the results
  const handleFilterBy = (filters: any, fromDash: boolean) => {
    let _tableRows = rows.slice();
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

  const saveTableChanges = async () => {
    let _tableRow: any = tableRows.slice();
    let students = [];

    for (let row of _tableRow) {
      if (!row.firstName || !row.lastName || !row.email) {
        _tableRow = _tableRow.filter((elm: any) => !(elm === row));
      }
    }
    setTableRows(_tableRow);
    for (let row of _tableRow) {
      students.push({
        email: row.email.trim(),
        fName: row.firstName,
        lName: row.lastName,
      });
    }
    const payloadAPI = { students };
    setEditMode(!editMode);
    if (!currentSemester) return;
    const mapUrl = "/instructor/students/" + currentSemester.tagId + "/signup";
    try {
      await postWithToken(mapUrl, payloadAPI);
    } catch (error) {
      console.log(error);
    }
    return;
  };

  const discardTableChanges = () => {
    window.scrollTo(0, 0);
    const _savedTableState = savedTableState.slice();
    setTableRows(_savedTableState);
    setSavedTableState([]);
    setEditMode(!editMode);
  };

  const editValues = (column: any, index: any, event: any) => {
    event.preventDefault();
    let _tableRows: any = tableRows.slice();
    _tableRows[index][column] = event.target.value;
    const _savedTableState: any = new Set(savedTableState);
    const _newStudents = _tableRows.filter((row: any) => {
      return !_savedTableState.has(row);
    });
    setNewStudents(_newStudents);
    setTableRows([..._tableRows]);
  };

  const handleClick = (colmn: any, event: any) => {
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
    const _tableRows = rows.slice();

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
      username: "",
      avatar: "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png",
      firstName: "",
      lastName: "",
      email: "",
    });
    setTableRows(_tableRow);
  };
  const handleNewSearh = (event: any) => {
    setSearchValue(event.target.value);
    if (!event.target.value) return setTableRows(rows.slice());
    searchByNameEmail(event.target.value.toLowerCase().trim());
  };

  const handleEditAndAdd = () => {
    window.scrollTo(0, document.body.scrollHeight);
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
      username: "",
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
          height: "100%",
          maxWidth: "100%",
          pt: "10px",
          pb: !isMovil ? "200px" : "",
          m: "auto",
          px: "10px",
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: isMovil ? "column" : "row",
              py: "20px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
                gap: "15px",
              }}
            >
              <Typography sx={{ fontFamily: "math" }} variant="h2" component="h2">
                {selectedCourse?.split(" ")[0]}
              </Typography>
              <Typography sx={{ fontFamily: "fangsong" }} component="h2">
                Students:
              </Typography>
              <Typography sx={{ fontFamily: "fangsong" }} component="h2">
                {rows.length}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: "10px",
                justifyContent: "space-between",
                fontWeight: "700",
                alignItems: "center",
              }}
            >
              <TextField
                size="small"
                sx={{
                  alignSelf: "center",
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
                    }}
                  >
                    <EditIcon /> Add
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
        <Divider />
        <Box
          sx={{
            py: "10px",
            borderRightWidth: 0,
            borderLeftWidth: 0,
          }}
        >
          <TableContainer component={Paper}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {!isMovil && <TableCell sx={{ px: "0px", width: "70px" }}>{""}</TableCell>}
                  {keys.map((key: string, keyIndex: number) => (
                    <TableCell
                      size="small"
                      key={keyIndex}
                      sx={
                        ["First Name", "Last Name"].includes(key) && isMovil
                          ? {
                              position: "sticky",
                              left: key === "Last Name" ? 60 : 0,
                              backgroundColor: theme =>
                                theme.palette.mode === "dark"
                                  ? theme.palette.common.darkGrayBackground
                                  : theme.palette.common.white,
                              fontWeight: "10px",
                              fontSize: "14px",
                            }
                          : isMovil
                          ? { fontWeight: "10px", fontSize: "14px" }
                          : { fontSize: "12px", px: "1px", width: "100px" }
                      }
                      align="left"
                    >
                      <Box sx={{ display: "flex", flexDirection: "row" }}>
                        <>
                          <div>{key}</div>
                          {!isMovil && (
                            <IconButton
                              id={id}
                              onClick={event => handleClick(key, event)}
                              sx={{
                                "&:hover": {
                                  background: "none",
                                },
                                px: "0px",
                              }}
                            >
                              <ArrowDropDownIcon viewBox="1 9 24 24" />
                            </IconButton>
                          )}
                        </>
                      </Box>
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
                        <Box
                          sx={{
                            width: "152px",
                            height: "93px",
                            color: "black",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Button
                            size="small"
                            sx={{
                              p: 2,
                              fontSize: "15px",
                              color: theme.palette.mode === "dark" ? "white" : "#757575",
                            }}
                            onClick={sortLowHigh}
                          >
                            Sort Low to High
                          </Button>
                          <Button
                            size="small"
                            sx={{
                              p: 2,
                              fontSize: "15px",
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
                  {editMode && <TableCell sx={{ px: "1px", width: "20px" }}>{""}</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((row: any, rowIndex: number) => (
                  <TableRow key={rowIndex} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    {!isMovil && (
                      <TableCell align="left" size="small" sx={{ px: "10px" }}>
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
                        size="small"
                        sx={
                          ["firstName", "lastName"].includes(colmn) && isMovil
                            ? {
                                position: "sticky",
                                left: colmn === "lastName" ? 80 : 0,
                                backgroundColor: theme =>
                                  theme.palette.mode === "dark"
                                    ? theme.palette.common.darkGrayBackground
                                    : theme.palette.common.white,
                                fontWeight: "10px",
                                fontSize: "14px",
                              }
                            : isMovil
                            ? { fontWeight: "10px", fontSize: "14px" }
                            : { fontSize: "12px", pr: colmn === "email" ? "18px" : "0px", pl: "0px" }
                        }
                        align="left"
                      >
                        {editMode &&
                        !savedTableState.find((elm: any) => elm.username === row.username) &&
                        ["firstName", "lastName", "email"].includes(colmn) ? (
                          <TextField
                            style={{ width: colmn === "email" ? "150px" : "90px" }}
                            value={row[colmn]}
                            onChange={event => editValues(colmn, rowIndex, event)}
                            autoFocus={colmn === "firstName"}
                            size="small"
                            id="outlined-basic"
                            variant="outlined"
                            helperText={
                              savedTableState.find((elm: any) => elm.email === row["email"].trim()) && colmn === "email"
                                ? "This Email already exist in this course"
                                : ""
                            }
                            error={savedTableState.find((elm: any) => elm.email === row["email"].trim())}
                            label={{ firstName: "First Name", lastName: "Last Name", email: "Email" }[colmn]}
                          />
                        ) : (
                          <>
                            {["firstName", "lastName"].includes(colmn) ? (
                              <LinkNext href={isMovil ? "#" : "/instructors/dashboard/" + row.username}>
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
                      <TableCell sx={{ px: "1px", width: "20px" }} align="right" size="small">
                        <DeleteButton
                          variant="text"
                          deleteRow={() => deleteRow(rowIndex)}
                          buttonStyles={{
                            ":hover": {
                              backgroundColor: "#bdbdbd",
                            },
                            backgroundColor: "#EDEDED",
                            fontSize: 16,
                            fontWeight: "700",
                            my: { xs: "0px", md: "auto" },
                            mt: { xs: "15px", md: "auto" },
                            marginRight: "40px",
                            paddingX: "30px",
                            borderRadius: 1,
                            textAlign: "center",
                            alignSelf: "center",
                          }}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        {editMode && (
          <Box sx={{ display: "flex", justifyContent: "space-between", paddingTop: "25px" }}>
            <Box>
              <CSVBtn
                variant="text"
                addNewData={addNewData}
                buttonStyles={{
                  ":hover": {
                    backgroundColor: "#bdbdbd",
                  },
                  backgroundColor: "#EDEDED",
                  fontSize: 16,
                  fontWeight: "700",
                  my: { xs: "0px", md: "auto" },
                  mt: { xs: "15px", md: "auto" },
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
                  ":hover": {
                    backgroundColor: "#bdbdbd",
                  },
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
                  background: theme => theme.palette.common.black,
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
                disabled={savedTableState.some((elment: any) =>
                  newStudents.some((elmen: any) => elment.email.trim() === elmen.email.trim())
                )}
                sx={{
                  color: theme => theme.palette.common.white,
                  background: theme => theme.palette.common.orange,
                  fontSize: 16,
                  fontWeight: "700",
                  my: { xs: "0px", md: "auto" },
                  marginLeft: { xs: "0px", md: "32px" },
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
    </>
  );
};

// This wrapper expose the shared variables from filters
const PageWrapper = () => {
  return <InstructorsLayout>{props => <Students {...props} />}</InstructorsLayout>;
};
export default PageWrapper;
