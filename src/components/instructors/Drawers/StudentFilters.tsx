import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Box } from "@mui/material";
import { Button } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React from "react";

const StudentFilters = ({
  isMovil,
  filters,
  addFilter,
  openFilter,
  deleteFilter,
  filterChoices,
  handleFilterBy,
  editFilterValue,
  handleChangeChoice,
  handleChangeFilter,
  handleOpenCloseFilter,
  handleChangeOperation,
}: any) => (
  <Drawer anchor={"right"} open={openFilter} onClose={handleOpenCloseFilter}>
    <Box sx={{ textAlign: "right" }}>
      <IconButton onClick={handleOpenCloseFilter}>
        <CloseIcon />
      </IconButton>
    </Box>

    <Box
      role="presentation"
      sx={{
        width: isMovil ? "300px" : "350px",
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
            {filters.map((filter: any, index: any) => {
              return (
                <>
                  <Paper key={index} elevation={6} sx={{ mb: "13px", width: !isMovil ? "80%" : "100%" }}>
                    <Box sx={{ textAlign: "right" }}>
                      <IconButton onClick={() => deleteFilter(index, false)}>
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
  </Drawer>
);

export default StudentFilters;
