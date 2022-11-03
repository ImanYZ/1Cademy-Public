import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
// import { createStyles, makeStyles } from '@mui/styles';
import EditIcon from "@mui/icons-material/Edit";
import { Box } from "@mui/material";
import { Button } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  // GridCallbackDetails,
  // GridCellEditCommitParams,
  GridColumns,
  // GridRenderEditCellParams,
  GridRowsProp,
  // GridValueSetterParams,
  // MuiBaseEvent,
  // MuiEvent,
} from "@mui/x-data-grid";
import { randomTraderName, randomUpdatedDate } from "@mui/x-data-grid-generator";
import React, { useState } from "react";

import PageWrapper from "./tmp";
// const useStyles = makeStyles(() => ({
//   editableMode: {

//   },
// }));
const rows: GridRowsProp = [
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
  {
    id: 1,
    firstName: randomTraderName(),
    lastName: randomTraderName(),
    email: "samirbes@umich.edu",
    totalPoints: 10,
    newPorposals: 10,
    editNodeProposals: 10,
    proposalsPoints: 10,
    questions: 10,
    questionPoints: 10,
    vote: 10,
    votePoints: 10,
    lastActivity: randomUpdatedDate(),
  },
];

export const Students = () => {
  const [tableRows, setTableRows] = useState<GridRowsProp>(rows);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tableColumns, setTableColumns] = useState(dataGridColumns({ editMode: true }));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updatedTableData, setUpdatedTableData] = useState(rows);
  const [openFilter, setOpenFilter] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dataGridLoading, setDataGridLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<
    {
      title: string;
      operation: string;
      value: number;
    }[]
  >([]);
  const lessGreatThan: GridColumns = [
    { field: "<", headerName: "Less" },
    { field: ">", headerName: "Great" },
  ];

  // const classes = useStyles();

  // const setUpdatedValue = (params: GridValueSetterParams, fieldName: string) => {
  //   return { ...params.row, [fieldName]: updatedValue };
  // };

  const handleOpenCloseFilter = () => setOpenFilter(!openFilter);

  const handleFilterBy = () => {};

  const changeFilter = (value: string) => {
    const newFilter = {
      title: value,
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
  };

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
                return (
                  <Paper key={index} elevation={6} sx={{ mb: "13px" }}>
                    <Box sx={{ textAlign: "right" }}>
                      <IconButton onClick={() => deleteFilter(index)}>
                        <DeleteForeverIcon />
                      </IconButton>
                    </Box>
                    <Autocomplete
                      id="field"
                      // value={getNameFromInstitutionSelected()}
                      // onChange={(_, value) => changeFilter(value?.field)}
                      // onInputChange={(_, value) => {
                      //   onChangeInstitution(value);
                      // }}
                      // onBlur={() => setTouched({ ...touched, institution: true })}
                      options={tableColumns}
                      getOptionLabel={(option: any) => option.field}
                      renderInput={params => <TextField {...params} placeholder="Feild" />}
                      renderOption={(props, option: any) => (
                        <li {...props}>
                          <div style={{ paddingLeft: "7px" }}>{option.field}</div>
                        </li>
                      )}
                      isOptionEqualToValue={(option: any, value: any) => option.field === value.field}
                      fullWidth
                      sx={{ mb: "16px", width: "96%", ml: "10px", textAlign: "center" }}
                    />
                    <Box sx={{ display: "flex", flexDirection: "row" }}>
                      <Autocomplete
                        id="field"
                        // value={getNameFromInstitutionSelected()}
                        // onChange={(_, value) => changeFilter(value?.field)}
                        // onInputChange={(_, value) => {
                        //   onChangeInstitution(value);
                        // }}
                        // onBlur={() => setTouched({ ...touched, institution: true })}
                        options={lessGreatThan}
                        getOptionLabel={(option: any) => option.field}
                        renderInput={params => <TextField {...params} placeholder="" />}
                        renderOption={(props, option: any) => (
                          <li {...props}>
                            <div style={{ paddingLeft: "7px" }}>{option.field}</div>
                          </li>
                        )}
                        isOptionEqualToValue={(option: any, value: any) => option.field === value.field}
                        fullWidth
                        sx={{ mb: "16px", width: "20%", ml: "10px", textAlign: "center" }}
                      />
                      <TextField
                        sx={{ height: "5px", width: "70%" }}
                        id="outlined-basic"
                        placeholder="Enter a value"
                        variant="outlined"
                      />
                    </Box>
                  </Paper>
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
            <Autocomplete
              id="field"
              // value={getNameFromInstitutionSelected()}
              onChange={(_, value: any) => changeFilter(value?.field)}
              // onInputChange={(_, value) => {
              //   onChangeInstitution(value);
              // }}
              // onBlur={() => setTouched({ ...touched, institution: true })}
              options={tableColumns}
              getOptionLabel={option => option.field}
              renderInput={params => <TextField {...params} placeholder="Feild" />}
              renderOption={(props, option) => (
                <li {...props}>
                  <div style={{ paddingLeft: "7px" }}>{option.field}</div>
                </li>
              )}
              isOptionEqualToValue={(option, value) => option.field === value.field}
              fullWidth
              sx={{ mb: "16px" }}
            />
          )}
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={handleFilterBy}
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
    setTableRows([...tableRows]);
    setUpdatedTableData([]);
  };

  // console.log({ filters, editMode });
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
        <hr />
        <Box className="student-dashboard-table" sx={{ height: "500px", mt: "40px", mr: "70px", ml: "40px" }}>
          <DataGrid
            rows={tableRows.map((x, index) => {
              x.id = index;
              return x;
            })}
            columns={tableColumns}
            autoPageSize
            components={{
              LoadingOverlay: LinearProgress,
            }}
            hideFooter
            loading={dataGridLoading}
            // onCellEditCommit={(params: any, event: MuiEvent<MuiBaseEvent>, details: GridCallbackDetails) => {
            //   console.log({
            //     params,
            //     event,
            //     details,
            //   });
            //   // const updatedValue = params.value;
            //   const tableData = [...tableRows];
            //   const rowData = params?.row;
            //   const { id } = rowData;
            //   const findStudentIndex = tableData.findIndex(row => row.id === id);
            //   tableData[findStudentIndex] = rowData;
            //   setUpdatedTableData(tableData);
            // }}
            /* 
        we shouldn't use this as this is for experimental purpose,
        only use if it is marked stable by MUI 
      */
            // experimentalFeatures={{ newEditingApi: true }}
          />
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

const dataGridColumns = ({ editMode }: any) => [
  {
    field: "firstName",
    headerName: "First Name",
    description: "First Name",
    // valueSetter: (params: GridValueSetterParams) => ({ ...params.row, firstName: params.value }),
    cellClassName: () => `${editMode ? "editable-cell" : "not-editable-cell"}`,
    width: 250,
    editable: true,
  },
  {
    field: "lastName",
    headerName: "Last Name",
    description: "Last Name",
    cellClassName: () => `${editMode ? "editable-cell" : "not-editable-cell"}`,
    width: 200,
    editable: true,
  },
  {
    field: "email",
    headerName: "Email",
    description: "Email",
    cellClassName: () => `${editMode ? "editable-cell" : "not-editable-cell"}`,
    // renderEditCell: (params: GridRenderEditCellParams) => (
    //   <TextField className="edit-text" value={params.value} style={{ width: "100%" }} />
    // ),
    width: 300,
    editable: true,
  },
  {
    field: "totalPoints",
    headerName: "Total Poitns",
    description: "Total Points",
    width: 100,
    editable: false,
  },
  {
    field: "newPorposals",
    headerName: "New Proposals",
    description: "New Proposals",
    width: 100,
    editable: false,
  },
  {
    field: "editNodeProposals",
    headerName: "Edit Node Proposals",
    description: "Edit Node Proposals",
    width: 200,
    editable: false,
  },
  {
    field: "proposalsPoints",
    headerName: "Proposals Points",
    description: "Proposals Points",
    width: 200,
    editable: false,
  },
  {
    field: "questions",
    headerName: "Questions",
    description: "Questions",
    width: 200,
    editable: false,
  },
  {
    field: "questionPoints",
    headerName: "Question Points",
    description: "Question Points",
    width: 200,
    editable: false,
  },
  {
    field: "vote",
    headerName: "Vote",
    description: "Vote",
    width: 100,
    editable: false,
  },
  {
    field: "votePoints",
    headerName: "Vote Points",
    description: "Vote Points",
    width: 100,
    editable: false,
  },
  {
    field: "lastActivity",
    headerName: "Last Activity",
    description: "Last Activity",
    type: "dateTime",
    width: 220,
    editable: false,
  },
];
