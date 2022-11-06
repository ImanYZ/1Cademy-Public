import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Link, useMediaQuery, useTheme } from "@mui/material";
import { Button } from "@mui/material";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
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
  /* addDoc, */
  collection,
  /*   doc,
  DocumentData,
  getDoc,
  getDocs, */
  getFirestore,
  /*   limit, */
  onSnapshot,
  query,
  /*  Query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch, */
} from "firebase/firestore";
import LinkNext from "next/link";
import React, { useEffect, useState } from "react";

import { InstructorLayoutPage, InstructorsLayout } from "@/components/layouts/InstructorsLayout";

import CSVBtn from "../../components/instructors/CSVBtn";
import OptimizedAvatar from "../../components/OptimizedAvatar";

const rows = [
  {
    id: 0,
    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FDjVODLkqLFh1Q0cOQb2ZTeY61Ax1%2FFri%2C%2028%20May%202021%2023%3A12%3A42%20GMT.jpg?alt=media&token=28743d60-3af4-4ebc-8ea3-c017dd089759",
    online: true,
    firstName: "Derrick ",
    lastName: "Schultz",
    email: "ouhrac@gmail.com",
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

    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FDjVODLkqLFh1Q0cOQb2ZTeY61Ax1%2FFri%2C%2028%20May%202021%2023%3A12%3A42%20GMT.jpg?alt=media&token=28743d60-3af4-4ebc-8ea3-c017dd089759",

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

    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",

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

    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
    online: true,

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

    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",
    online: true,

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

    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F4C8KJnOpiiV8sAADc9NU4r2yX4H2%2FWed%2C%2009%20Jun%202021%2001%3A36%3A30%20GMT.png?alt=media&token=0b613e16-aead-4995-84a0-d60088c9b2d5",
    online: true,

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

    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F4C8KJnOpiiV8sAADc9NU4r2yX4H2%2FWed%2C%2009%20Jun%202021%2001%3A36%3A30%20GMT.png?alt=media&token=0b613e16-aead-4995-84a0-d60088c9b2d5",
    online: true,

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

    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",

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

    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",

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

    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",

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

    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F7ETTaIqUqNa8DnUJbqPr40EaELm1%2FMon%2C%2024%20May%202021%2018%3A53%3A14%20GMT.JPG?alt=media&token=fd53fbbc-f948-4437-9354-35d7ca1f0114",

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

    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F7ETTaIqUqNa8DnUJbqPr40EaELm1%2FMon%2C%2024%20May%202021%2018%3A53%3A14%20GMT.JPG?alt=media&token=fd53fbbc-f948-4437-9354-35d7ca1f0114",

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

    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",

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

    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F6SqMFFrfljRfTovuY4NsBEhh23G2%2FThu%2C%2021%20Jan%202021%2023%3A12%3A24%20GMT.png?alt=media&token=6c1c1afe-ab14-4c02-b42c-be6206987866",

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

    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F6SqMFFrfljRfTovuY4NsBEhh23G2%2FThu%2C%2021%20Jan%202021%2023%3A12%3A24%20GMT.png?alt=media&token=6c1c1afe-ab14-4c02-b42c-be6206987866",

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

    username: "username",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",

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

    username: "Harry Potter",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F06OY9XEv4nNKuxa7npr9ZGNrfnO2%2FSat%2C%2015%20Aug%202020%2019%3A53%3A08%20GMT.jpg?alt=media&token=12e62b7f-3889-48f7-b6ab-60f9f27e94f8",

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

export const Students: InstructorLayoutPage = () => {
  const [tableRows, setTableRows] = useState(rows.slice());
  const [CSVData, getCSVData] = useState<any>({
    columns: [],
    rows: [],
  });
  const [openFilter, setOpenFilter] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);
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
  const handleOpenCloseFilter = () => setOpenFilter(!openFilter);
  const handleOpenCloseProfile = () => setOpenProfile(!openProfile);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [openedProfile, setOpenedProfile] = useState(rows.slice()[0]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const db = getFirestore();

  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    if (isMovil) setEditMode(false);
  }, [isMovil]);

  useEffect(() => {
    if (!db) return;

    const semestersRef = collection(db, "semesters");
    const q = query(semestersRef);
    const semestersSnapshot = onSnapshot(q, async snapshot => {
      // console.log("on snapshot");
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) return;
      for (let change of docChanges) {
        if (change.type === "added" || change.type === "modified") {
          setTableRows(change.doc.data().students.splice());
          console.log(":::: :::: ::: :data from Database ::: ::::: ", change.doc.data().students.splice());
        }
      }
    });
    return () => {
      semestersSnapshot();
    };
  }, [db]);

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

  const saveTableChanges = () => {
    const _tableRow = tableRows.slice();
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

  const discardTableChanges = () => setEditMode(!editMode);

  const editValues = (column: any, index: any, event: any) => {
    event.preventDefault();
    console.log(event);
    let _tableRows: any = tableRows.slice();
    _tableRows[index][column] = event.target.value;
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
    const _tableRows = tableRows.slice();

    const newTable = _tableRows.filter(row => {
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
    if (!event.target.value) return setTableRows(rows.slice());
    searchByNameEmail(event.target.value.toLowerCase());
  };

  const handleEditAndAdd = () => {
    const _tableRow: any = tableRows.slice();
    if (editMode) {
      saveTableChanges();
      return setEditMode(!editMode);
    } else {
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

  const addNewData = () => {
    const _tableRow = tableRows.slice();
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
    setOpenUploadModal(false);
  };

  const filer = () => (
    <>
      <Box sx={{ textAlign: "right" }}>
        <IconButton onClick={handleOpenCloseFilter}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        role="presentation"
        sx={{
          width: isMovil ? "300px" : "500px",
          display: "flex",
          flexDirection: "column",
          height: "90%",
          px: "10px",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Typography sx={{ mb: "10px" }}>Filter By</Typography>

          {filters.length > 0 ? (
            <>
              {filters.map((filter, index) => {
                return (
                  <>
                    <Paper key={index} elevation={6} sx={{ mb: "13px", width: !isMovil ? "80%" : "100%" }}>
                      <Box sx={{ textAlign: "right" }}>
                        <IconButton onClick={() => deleteFilter(index, true)}>
                          <DeleteForeverIcon />
                        </IconButton>
                      </Box>
                      <Box sx={{ px: "10px" }}>
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
                      <Box sx={{ display: "flex", flexDirection: "row", p: "10px 10px 10px 10px" }}>
                        <Box sx={{ minWidth: 80, ml: "5px", mr: "10px" }}>
                          <FormControl fullWidth>
                            <Select value={filter.operation} onChange={event => handleChangeOperation(index, event)}>
                              <MenuItem value={"<"}>{"<"}</MenuItem>
                              <MenuItem value={">"}>{">"}</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        <TextField
                          sx={{ height: "5px" }}
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
            <Box sx={{ width: "100%", paddingBottom: "10px" }}>
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
            onClick={() => handleFilterBy(filters, false)}
            sx={{
              color: theme => theme.palette.common.white,
              background: theme => theme.palette.common.orange,
              fontSize: 16,
              fontWeight: "700",
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

  const studentsProfile = () => (
    <Box sx={{ borderRadius: "16px", m: 0, border: 1 }}>
      {"  "}
      <Box sx={{ textAlign: "right" }}>
        <IconButton onClick={handleOpenCloseProfile}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ textAlign: "center", height: "200px" }}>
        <Box sx={{ display: "flex", ml: "33%", mb: "5%", mt: "10%", flexDirection: "row" }}>
          <Box>
            <OptimizedAvatar
              name={openedProfile.username}
              imageUrl={openedProfile.avatar}
              renderAsAvatar={true}
              contained={false}
              sx={{ mr: "15px" }}
            />
            <div
              className={openedProfile.online ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"}
              style={{ fontSize: "1px", marginLeft: "35px" }}
            ></div>
          </Box>
          <LinkNext href={"#"}>
            <Link>
              {" "}
              <>{openedProfile.firstName + openedProfile.lastName}</>
            </Link>
          </LinkNext>
        </Box>

        <Box sx={{ mr: "30px" }}>{openedProfile.email}</Box>
        <Button
          variant="contained"
          onClick={() => {
            console.log("takemetothe profile");
          }}
          sx={{
            color: theme => theme.palette.common.white,
            background: theme => theme.palette.common.orange,
            fontSize: 13,
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
          See Profile
        </Button>
      </Box>
    </Box>
  );

  console.log("query");
  return (
    <>
      <Box className="student-dashboard" sx={{ width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: isMovil ? "column" : "row",
          }}
        >
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              width: "30%",
              justifyContent: "space-evenly",
              flexDirection: "row",
            }}
          >
            <Typography variant="h1" component="h2">
              Sl
            </Typography>
            <Typography variant="h1" component="h5">
              106
            </Typography>

            <Typography component="h2">Students:</Typography>
            <Typography component="h2">50</Typography>
          </Box>
          <Box sx={{ display: "flex", fontWeight: "700", flexDirection: "row" }}>
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
            <Drawer anchor={"right"} open={openFilter} onClose={handleOpenCloseFilter}>
              {filer()}
            </Drawer>
          </Box>
        </Box>
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

        <hr />
        <Box
          sx={{
            mt: "40px",
            mr: !isMovil ? "70px" : "0px",
            ml: !isMovil ? "30px" : "0px",
            mb: !isMovil ? "90px" : "0px",
          }}
        >
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  {keys.map((colmn, index) => {
                    return (
                      <TableCell
                        key={index}
                        sx={
                          ["First Name", "Last Name"].includes(colmn) && isMovil
                            ? {
                                position: "sticky",
                                left: colmn === "Last Name" ? 90 : 0,
                                backgroundColor: theme =>
                                  theme.palette.mode === "dark" ? theme.palette.common.darkGrayBackground : "#FFFFFF",
                                fontWeight: "10px",
                                fontSize: "14px",
                              }
                            : isMovil
                            ? { fontWeight: "10px", fontSize: "14px" }
                            : {}
                        }
                        align="left"
                      >
                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <div> {colmn}</div>
                          {!isMovil && (
                            <IconButton
                              id={id}
                              onClick={event => handleClick(colmn, event)}
                              style={{ paddingTop: "10px" }}
                            >
                              {" "}
                              <ArrowDropDownIcon viewBox="1 9 24 24" />
                            </IconButton>
                          )}
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
                                fontSize: "17px",
                                color: theme.palette.mode === "dark" ? "white" : "#757575",
                              }}
                              onClick={sortLowHigh}
                            >
                              Sort Low to High
                            </Button>
                            <Button
                              sx={{
                                p: 2,
                                fontSize: "17px",
                                color: theme.palette.mode === "dark" ? "white" : "#757575",
                              }}
                              onClick={sortHighLow}
                            >
                              Sort High to Low
                            </Button>
                          </Box>
                        </Popover>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((row: any, index) => (
                  <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
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
                    {columns.map((colmn, index) => {
                      return (
                        <TableCell
                          key={index}
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
                              : {}
                          }
                          align="left"
                        >
                          {editMode && ["firstName", "lastName", "email"].includes(colmn) ? (
                            <TextField
                              style={{ width: colmn === "email" ? "200px" : "150px" }}
                              value={row[colmn]}
                              onChange={event => editValues(colmn, index, event)}
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
                      );
                    })}
                    {editMode && (
                      <TableCell align="right">
                        <IconButton onClick={() => deleteRow(index)}>
                          <DeleteIcon
                            sx={{
                              color: "red",
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
                onClick={() => setOpenUploadModal(true)}
              >
                Add students from a csv file
              </Button>
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
        <Drawer
          sx={{ backgroundColor: "transparent" }}
          anchor={"bottom"}
          open={openProfile}
          onClose={handleOpenCloseProfile}
        >
          {studentsProfile()}
        </Drawer>
      </Box>
      <Dialog open={openUploadModal} onClose={() => setOpenUploadModal(false)}>
        <DialogTitle>
          <Typography variant="h3" fontWeight={"bold"} component="h2">
            Add students from a csv file
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <CSVBtn getCSVData={getCSVData} isOpen={openUploadModal} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={CSVData?.rows?.length <= 0} variant="contained" onClick={addNewData}>
            Add data to Table
          </Button>
          <Button variant="contained" onClick={() => setOpenUploadModal(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// This wrapper expose the shared variables from filters
const PageWrapper = () => {
  return <InstructorsLayout>{props => <Students {...props} />}</InstructorsLayout>;
};
export default PageWrapper;
