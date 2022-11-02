import { Box } from "@mui/material";
import { DataGrid, GridColumns, GridRowsProp } from "@mui/x-data-grid";
import { randomUpdatedDate } from "@mui/x-data-grid-generator";
import React from "react";

export const StudentDashboard = () => {
  return (
    <Box className="student-dashboard">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span>Sl 106</span>
          <span>Fall: 22</span>
          <span>Students: 50</span>
        </div>
        <div>
          <button>Filter By</button>

          <input type="text" />

          <button>Edit/Add</button>
        </div>
      </Box>
      <Box style={{ height: "500px", width: "100%" }}>
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
    width: 100,
    editable: false,
  },
  {
    field: "proposalsPoints",
    headerName: "Proposals Points",
    width: 100,
    editable: false,
  },
  {
    field: "questions",
    headerName: "Questions",
    width: 100,
    editable: false,
  },
  {
    field: "questionPoints",
    headerName: "Question Points",
    width: 100,
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
    // width: 220,
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
