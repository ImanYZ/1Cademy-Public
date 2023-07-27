import AddIcon from "@mui/icons-material/Add";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Chip,
  Link,
  Paper,
  Popover,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { CourseTag } from "src/instructorsTypes";
import { ISemester, ISemesterStudentVoteStat } from "src/types/ICourse";
import { v4 as uuidv4 } from "uuid";

import CSVBtn from "@/components/CSVBtn";
import DeleteButton from "@/components/DeleteButton";
import { StudentFilters, StudentsProfile } from "@/components/instructors/Drawers";
import OptimizedAvatar from "@/components/OptimizedAvatar";
import { Post } from "@/lib/mapApi";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { calculateVoteStatPoints } from "@/lib/utils/charts.utils";

import { Z_INDEX } from "../../../lib/utils/constants";
import ROUTES from "../../../lib/utils/routes";
import { SnapshotChangesTypes } from "../../../types";
import { ToolbarView } from "./DashboardWrapper";

const filterChoices: any = {
  "Total Points": "totalPoints",
  Wrongs: "wrongs",
  Corrects: "corrects",
  Awards: "awards",
  "Child Proposals": "newProposals",
  "Edit  Proposals": "editNodeProposals",
  "Proposal Points": "proposalsPoints",
  Questions: "questions",
  "Question Points": "questionPoints",
  Vote: "vote",
  "Vote Points": "votePoints",
};

const defaultColumns: string[] = [
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

const defaultKeys = [
  "First Name",
  "Last Name",
  "Email",
  "Total Points",
  "Wrongs",
  "Corrects",
  "Awards",
  "Child Proposals",
  "Edit Proposals",
  "Proposal Points",
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
  "Total Points": "totalPoints",
  Wrongs: "wrongs",
  Corrects: "corrects",
  Awards: "awards",
  "Child Proposals": "newProposals",
  "Edit  Proposals": "editNodeProposals",
  "Proposal Points": "proposalsPoints",
  Questions: "questions",
  "Question Points": "questionPoints",
  Vote: "vote",
  "Vote Points": "votePoints",
  "Last Activity": "lastActivity",
};

type SemesterStudentVoteStatProcessed = ISemesterStudentVoteStat & {
  questionProposals: number;
  questionPoints: number;
  proposalPoints: number;
};

type DashboardStudentsProps = {
  currentSemester: CourseTag | null;
  onSelectUserHandler: (uname: string, view: ToolbarView) => void;
};

export const DashboardStudents = ({ currentSemester }: DashboardStudentsProps) => {
  const [keys, setKeys] = useState([...defaultKeys]);
  const [columns, setColumns] = useState([...defaultColumns]);
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
  const [semesterConfig, setSemesterConfig] = useState<ISemester | null>(null);
  const theme = useTheme();
  const isMovil = useMediaQuery(theme.breakpoints.down("md"));
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [openedProfile /* setOpenedProfile */] = useState(tableRows.slice()[0]);
  const [savedTableState, setSavedTableState] = useState([]);
  const [states, setStates] = useState<SemesterStudentVoteStatProcessed[]>([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [usersStatus, setUsersStatus] = useState<any>([]);
  const [newStudents, setNewStudents] = useState([]);
  const [disableEdit, setDisableEdit] = useState(false);
  const open = Boolean(anchorEl);
  const db = getFirestore();

  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    if (!currentSemester || !currentSemester.tagId) return;

    const semesterRef = collection(db, "semesters");
    const q = query(semesterRef, where("tagId", "==", currentSemester.tagId));
    const snapShotFunc = onSnapshot(q, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) {
        setSemesterConfig(null);
        return;
      }

      for (const change of docChanges) {
        const semesterDoc = change.doc;
        setSemesterConfig(semesterDoc.data() as ISemester);
      }
    });
    return () => snapShotFunc();
  }, [currentSemester, db]);

  useEffect(() => {
    if (isMovil) setEditMode(false);
    if (!isMovil) setOpenProfile(false);
  }, [isMovil]);

  useEffect(() => {
    if (!db) return;
    if (!currentSemester) return;
    if (!semesterConfig) return;

    const statusRef = collection(db, "status");
    const qeStatus = query(statusRef);
    let status: any = [];
    // let statsData: ISemesterStudentVoteStat[] = [];
    const statusSnapShotFunc = onSnapshot(qeStatus, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) {
        return;
      }

      for (const change of docChanges) {
        const data = change.doc.data();
        if (change.type === "added") {
          status.push(data);
        } else if (change.type === "modified") {
          const index = status.findIndex((sts: any) => sts.user === data.user);
          status[index] = data;
        } else if (change.type === "removed") {
          const index = status.findIndex((sts: any) => sts.user === data.user);
          status.splice(index, 1);
        }
      }
      setUsersStatus([...status]);
    });

    const semestersStatsRef = collection(db, "semesterStudentVoteStats");
    const qe = query(semestersStatsRef, where("tagId", "==", currentSemester.tagId));

    const snapShotFunc = onSnapshot(qe, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) {
        return;
      }

      setStates(prev => {
        let semesterStatsChanges: { type: SnapshotChangesTypes; data: ISemesterStudentVoteStat }[] = [];
        for (const change of docChanges) {
          semesterStatsChanges.push({ type: change.type, data: change.doc.data() as ISemesterStudentVoteStat });
        }

        return semesterStatsChanges.reduce((acu: SemesterStudentVoteStatProcessed[], { data, type }) => {
          const points = calculateVoteStatPoints(data, semesterConfig);
          if (type === "added") return [...acu, { ...data, ...points }];
          if (type === "modified") return acu.map(c => (c.uname === data.uname ? { ...data, ...points } : c));
          if (type === "removed") return acu.filter(c => c.uname !== data.uname);
          return acu;
        }, prev);
      });
    });

    return () => {
      statusSnapShotFunc();
      snapShotFunc();
    };
  }, [db, currentSemester, semesterConfig]);

  useEffect(() => {
    setKeys([...defaultKeys]);
    setColumns([...defaultColumns]);
  }, [currentSemester]);

  useEffect(() => {
    if (!db) return;
    if (!currentSemester) return;
    if (!semesterConfig) return;
    if (states.length === 0) return;
    const semestersRef = collection(db, "semesters");
    const q = query(semestersRef, where("tagId", "==", currentSemester.tagId));
    const semestersSnapshot = onSnapshot(q, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) return;
      for (let change of docChanges) {
        if (change.type === "added" || change.type === "modified") {
          const docData = change.doc.data();
          if (!docData?.isCastingVotesRequired) {
            const keysToRemove = ["Vote", "Vote Points"];
            keysToRemove.forEach(key => {
              const index = keys.indexOf(key);
              if (index !== -1) {
                keys.splice(index, 1);
              }
            });

            const columnsToRemove = ["vote", "votePoints"];
            columnsToRemove.forEach(key => {
              const index = columns.indexOf(key);
              if (index !== -1) {
                columns.splice(index, 1);
              }
            });
          }

          if (!docData?.isQuestionProposalRequired) {
            const keysToRemove = ["Questions", "Question Points"];
            keysToRemove.forEach(key => {
              const index = keys.indexOf(key);
              if (index !== -1) {
                keys.splice(index, 1);
              }
            });

            const columnsToRemove = ["questions", "questionPoints"];
            columnsToRemove.forEach(key => {
              const index = columns.indexOf(key);
              if (index !== -1) {
                columns.splice(index, 1);
              }
            });
          }

          if (!docData?.isProposalRequired) {
            const keysToRemove = ["Child Proposals", "Edit Proposals", "Proposal Points"];
            keysToRemove.forEach(key => {
              const index = keys.indexOf(key);
              if (index !== -1) {
                keys.splice(index, 1);
              }
            });

            const columnsToRemove = ["newProposals", "editNodeProposals", "proposalsPoints"];
            columnsToRemove.forEach(key => {
              const index = columns.indexOf(key);
              if (index !== -1) {
                columns.splice(index, 1);
              }
            });
          }

          if (!docData?.isGettingVotesRequired) {
            const keysToRemove = ["Wrongs", "Corrects", "Awards"];
            keysToRemove.forEach(key => {
              const index = keys.indexOf(key);
              if (index !== -1) {
                keys.splice(index, 1);
              }
            });

            const columnsToRemove = ["wrongs", "corrects", "awards"];
            columnsToRemove.forEach(key => {
              const index = columns.indexOf(key);
              if (index !== -1) {
                columns.splice(index, 1);
              }
            });
          }

          const _students = docData.students;
          const { onReceiveVote, onReceiveDownVote, onReceiveStar } = docData.votes;
          const _rows: any = [];
          for (let student of _students) {
            const stats: SemesterStudentVoteStatProcessed | undefined = states.find(elm => elm.uname === student.uname);
            if (!stats) continue;

            const userStat: any = usersStatus.filter((elm: any) => elm.user === student.uname)[0];

            let totalPoints: number = 0;
            let proposalsPoints: number = 0;
            let questionPoints: number = 0;
            let votePoints: number = 0;
            if (docData?.isGettingVotesRequired) {
              totalPoints +=
                (stats?.upVotes || 0) * onReceiveVote -
                (stats?.downVotes || 0) * onReceiveDownVote +
                (stats?.instVotes || 0) * onReceiveStar;
            }
            if (docData?.isCastingVotesRequired) {
              votePoints = stats.votePoints ?? 0;
              totalPoints += votePoints;
            }
            if (docData?.isQuestionProposalRequired) {
              questionPoints = stats.questionPoints;
              totalPoints += questionPoints;
            }
            if (docData?.isProposalRequired) {
              proposalsPoints = stats.proposalPoints;
              totalPoints += proposalsPoints;
            }
            _rows.push({
              id: uuidv4(),
              username: student.uname,
              avatar: student.imageUrl,
              online: userStat?.state === "online",
              firstName: student.fName,
              lastName: student.lName,
              email: student.email,
              totalPoints: totalPoints,
              newProposals: stats?.newNodes || 0,
              editNodeProposals: stats?.improvements || 0,
              proposalsPoints,
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
  }, [db, states, currentSemester, usersStatus, semesterConfig, keys, columns]);

  const handleOpenCloseFilter = () => setOpenFilter(!openFilter);
  const handleOpenCloseProfile = () => setOpenProfile(!openProfile);

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
        id: uuidv4(),
        username: "",
        avatar: "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png",
        firstName: "",
        lastName: "",
        email: "",
        online: false,
        totalPoints: 0,
        newProposals: 0,
        editNodeProposals: 0,
        proposalsPoints: 0,
        corrects: 0,
        wrongs: 0,
        awards: 0,
        questions: 0,
        questionPoints: 0,
        vote: 0,
        votePoints: 0,
      });
    }
    setTableRows(_tableRows);
  };

  const deleteFilter = (index: any, fromDash: boolean) => {
    const _oldFilters = [...filters];
    _oldFilters.splice(index, 1);
    setFilters(_oldFilters);
    if (fromDash) {
      handleFilterBy(_oldFilters, fromDash);
    }
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
      title: "Total Points",
      operation: "<",
      value: 10,
    };
    const updateFilters = [...filters, newFilter];
    setFilters(updateFilters);
  };

  const saveTableChanges = async () => {
    setDisableEdit(true);
    let _tableRow: any = tableRows.slice();
    let students = [];

    for (let row of _tableRow) {
      if (row.firstName === "" || row.lastName === "" || row.email === "") {
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
    try {
      await Post("/instructor/students/" + currentSemester.tagId + "/signup", payloadAPI);
      setNewStudents([]);
    } catch (error) {
      console.error(error);
    }
    setDisableEdit(false);
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
      id: uuidv4(),
      username: "",
      avatar: "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png",
      firstName: "",
      lastName: "",
      email: "",
      online: false,
      totalPoints: 0,
      newProposals: 0,
      editNodeProposals: 0,
      proposalsPoints: 0,
      corrects: 0,
      wrongs: 0,
      awards: 0,
      questions: 0,
      questionPoints: 0,
      vote: 0,
      votePoints: 0,
    });
    setTableRows(_tableRow);
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 10);
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
      id: uuidv4(),
      username: "",
      avatar: "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png",
      firstName: "",
      lastName: "",
      email: "",
      online: false,
      totalPoints: 0,
      newProposals: 0,
      editNodeProposals: 0,
      proposalsPoints: 0,
      corrects: 0,
      wrongs: 0,
      awards: 0,
      questions: 0,
      questionPoints: 0,
      vote: 0,
      votePoints: 0,
    });
    setTableRows(_tableRow);
    setEditMode(!editMode);
  };

  const addNewData = (dataFromCSV: any) => {
    const _tableRow: any = tableRows.slice();
    const CSVData = dataFromCSV;
    const fName = CSVData.columns[0];
    const lName = CSVData.columns[1];
    const email = CSVData.columns[2];
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

  if (!currentSemester) return <Typography>You don't have semester</Typography>;

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
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: "10px",
          gap: "15px",
        }}
      >
        <Stack direction={"row"} alignItems={"center"} spacing={"12px"}>
          <Typography variant="h2" component="h2" fontWeight={600}>
            {currentSemester.cTitle}
          </Typography>
          <Typography>Students:</Typography>
          <Typography>{rows.length}</Typography>
        </Stack>
        <Button
          variant="outlined"
          disabled={editMode || disableEdit}
          onClick={handleEditAndAdd}
          sx={{ borderRadius: "32px" }}
        >
          <AddRoundedIcon fontSize="small" /> Add Student
        </Button>
      </Box>
      <Box
        className="student-dashboard"
        sx={{
          height: "100%",
          maxWidth: "100%",
          pt: "10px",
          m: "auto",
          px: "10px",
        }}
      >
        <Box
          sx={{
            position: "sticky",
            top: "50px",

            zIndex: 200,
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              flexDirection: isMovil ? "column" : "row",

              py: "20px",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                gap: "10px",
                justifyContent: "space-between",
                fontWeight: "700",
                alignItems: "center",
              }}
            >
              <TextField
                fullWidth
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
                    disabled={editMode || disableEdit}
                    onClick={handleOpenCloseFilter}
                    sx={{
                      color: theme => theme.palette.common.white,
                      background: DESIGN_SYSTEM_COLORS.primary800,
                      ":hover": {
                        background: DESIGN_SYSTEM_COLORS.primary700,
                      },
                      whiteSpace: "nowrap",
                      borderRadius: "32px",
                      p: "8px 24px",
                    }}
                  >
                    Filter By
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
                        onDelete={() => deleteFilter(index, true)}
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
            py: "10px",
            borderRightWidth: 0,
            borderLeftWidth: 0,
            overflowX: "hidden",
          }}
        >
          <TableContainer
            sx={{
              overflowY: "hidden",
              backgroundColor:
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
            }}
            component={Paper}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "red" }}>
                  {!isMovil && <TableCell sx={{ px: "0px", width: "70px" }}>{""}</TableCell>}
                  {keys.map((key: string, keyIndex: number) => (
                    <TableCell
                      size="small"
                      key={keyIndex}
                      sx={
                        ["First Name", "Last Name"].includes(key) && isMovil
                          ? {
                              zIndex: 100,
                              position: "sticky",
                              left: key === "Last Name" ? 80 : 0,
                              backgroundColor: theme =>
                                theme.palette.mode === "dark"
                                  ? theme.palette.common.darkGrayBackground
                                  : theme.palette.common.white,
                              // fontWeight: "10px",
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
                          {!isMovil && key !== "Last Activity" && (
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
                        sx={{ zIndex: Z_INDEX["dashboard"] + 1 }}
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
                              <Link
                                href={`${ROUTES.studentDashboard}/${currentSemester.tagId}/${row.username}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {row[colmn]}
                              </Link>
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
          {(editMode || disableEdit) && (
            <Box sx={{ display: "flex", justifyContent: "space-between", paddingTop: "25px" }}>
              {!disableEdit && (
                <Box>
                  <CSVBtn
                    variant="text"
                    addNewData={addNewData}
                    disabled={disableEdit}
                    buttonStyles={{
                      ":hover": {
                        backgroundColor: "#bdbdbd",
                      },
                      backgroundColor: "#EDEDED",
                      fontSize: 16,
                      fontWeight: "700",
                      borderRadius: 1,
                      textAlign: "center",
                      alignSelf: "center",
                    }}
                    BtnText={"Add students from a csv file"}
                  />
                  <Button
                    variant="text"
                    disabled={disableEdit}
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
              )}
              <Box sx={disableEdit ? { position: "relative", left: `${document.body.offsetWidth - 200}px` } : {}}>
                {!disableEdit && (
                  <Button
                    variant="text"
                    disabled={disableEdit}
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
                )}
                <LoadingButton
                  loading={disableEdit}
                  variant="contained"
                  loadingPosition="start"
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
                  }}
                  onClick={() => saveTableChanges()}
                >
                  {disableEdit ? " Saving..." : "Save Changes"}
                </LoadingButton>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};
