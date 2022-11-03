import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Box } from "@mui/material";
import { Button } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DataGrid, GridColumns, GridRowsProp } from "@mui/x-data-grid";
import { randomUpdatedDate } from "@mui/x-data-grid-generator";
import React, { useState } from "react";
export const StudentDashboard = () => {
  const [openFilter, setOpenFilter] = useState(false);
  const [filters, setFilters] = useState([]);
  const handleOpenCloseFilter = () => {
    setOpenFilter(oldOpenFilter => !oldOpenFilter);
  };
  const handleFilterBy = () => {};
  const changeFilter = (value: string) => {
    const newFilter = {
      title: value,
      opertaion: "<",
      value: 10,
    };
    setFilters(oldFilter => [...oldFilter, newFilter]);
    console.log(value);
  };

  const addFilter = () => {
    const newFilter = {
      title: "",
      opertaion: "<",
      value: 10,
    };
    setFilters(oldFilter => [...oldFilter, newFilter]);
  };
  const deleteFilter = index => {
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
          <Typography>Filter By</Typography>

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
                      options={columns}
                      getOptionLabel={option => option.field}
                      renderInput={params => <TextField {...params} placeholder="Feild" />}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <div style={{ paddingLeft: "7px" }}>{option.field}</div>
                        </li>
                      )}
                      isOptionEqualToValue={(option, value) => option.field === value.field}
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
                        getOptionLabel={option => option.field}
                        renderInput={params => <TextField {...params} placeholder="" />}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <div style={{ paddingLeft: "7px" }}>{option.field}</div>
                          </li>
                        )}
                        isOptionEqualToValue={(option, value) => option.field === value.field}
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
              onChange={(_, value) => changeFilter(value?.field)}
              // onInputChange={(_, value) => {
              //   onChangeInstitution(value);
              // }}
              // onBlur={() => setTouched({ ...touched, institution: true })}
              options={columns}
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
  console.log(filters);
  return (
    <Box className="student-dashboard">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: "40px",
        }}
      >
        <Box style={{ display: "inline-flex", marginTop: "40px" }}>
          <Box sx={{ ml: "40px", mr: "40px" }}>
            <Typography variant="h1" component="h2">
              Sl 106
            </Typography>
          </Box>

          <Typography sx={{ mr: "40px" }} variant="h5" component="h2">
            SFall: 22
          </Typography>
          <Typography variant="h5" component="h2">
            Students: 50
          </Typography>
        </Box>
        <Box sx={{ mt: "40px" }}>
          <TextField
            sx={{ height: "5px", width: "500px" }}
            id="outlined-basic"
            placeholder="search name or email"
            variant="outlined"
          />

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
          <Drawer anchor={"right"} open={openFilter} onClose={handleOpenCloseFilter}>
            {list()}
          </Drawer>
        </Box>
      </Box>
      <hr width="90%" />
      <Box sx={{ height: "500px", mt: "40px", mr: "70px", ml: "40px" }}>
        <DataGrid
          rows={[...rows, ...rows, ...rows, ...rows, ...rows, ...rows].map((x, index) => {
            x.id = index;
            return x;
          })}
          columns={columns}
          experimentalFeatures={{ newEditingApi: true }}
        />
      </Box>
    </Box>
  );
};

export default StudentDashboard;
const lessGreatThan: GridColumns = [
  { field: "<", headerName: "Less" },
  { field: ">", headerName: "Great" },
];
const columns: GridColumns = [
  { field: "name", headerName: "Name", width: 300, editable: true },
  { field: "email", headerName: "Email", width: 300, editable: true },
  {
    field: "totalPoints",
    headerName: "Total Poitns",
    width: 100,
    editable: false,
  },
  {
    field: "newPorposals",
    headerName: "New Proposals",
    width: 100,
    editable: false,
  },
  {
    field: "editNodeProposals",
    headerName: "Edit Node Proposals",
    width: 200,
    editable: false,
  },
  {
    field: "proposalsPoints",
    headerName: "Proposals Points",
    width: 200,
    editable: false,
  },
  {
    field: "questions",
    headerName: "Questions",
    width: 200,
    editable: false,
  },
  {
    field: "questionPoints",
    headerName: "Question Points",
    width: 200,
    editable: false,
  },
  {
    field: "vote",
    headerName: "Vote",
    width: 100,
    editable: false,
  },
  {
    field: "votePoints",
    headerName: "Vote Points",
    width: 100,
    editable: false,
  },
  {
    field: "lastActivity",
    headerName: "Last Activity",
    type: "dateTime",
    width: 220,
    editable: false,
  },
];

const rows: GridRowsProp = [
  {
    id: 1,
    name: "Samir Benson",
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
