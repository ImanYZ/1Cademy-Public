import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import React from "react";

import { CustomButton } from "@/components/map/Buttons/Buttons";
type RubricFormProps = {
  rubrics: RubricItemType[];
  handleAddRubric: () => void;
  handleDeleteRubric: (idx: number) => void;
  handleRubricItem: (value: string, idx: number) => void;
  handleRubricPoints: (value: string, idx: number) => void;
};
type RubricItemType = { item: string; point: number };
const RubricItems = ({
  rubrics,
  handleAddRubric,
  handleDeleteRubric,
  handleRubricItem,
  handleRubricPoints,
}: RubricFormProps) => {
  return (
    <Box>
      <table>
        <thead>
          <th>
            <Typography>Rubric item</Typography>
          </th>
          <th>
            <Typography>Points</Typography>
          </th>
          <th></th>
        </thead>
        <tbody>
          {rubrics.map((rubric: any, index: number) => {
            return (
              <tr key={index}>
                <td style={{ width: "100%" }}>
                  <TextField
                    label=""
                    name={`prompts.${index}.prompt`}
                    fullWidth
                    multiline
                    size="small"
                    onChange={e => handleRubricItem(e.target.value, index)}
                    value={rubric.item}
                  />
                </td>
                <td style={{ verticalAlign: "top" }}>
                  <TextField
                    label=""
                    id="points"
                    name={`prompts.${index}.point`}
                    onChange={e => handleRubricPoints(e.target.value, index)}
                    value={rubric.points}
                    size="small"
                    sx={{ width: "50px" }}
                    inputProps={{}}
                  />
                </td>
                <td style={{ verticalAlign: "top" }}>
                  <Tooltip title="Remove Rubric Item">
                    <IconButton type="button" onClick={() => handleDeleteRubric(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Box mt={1} sx={{ display: "flex", justifyContent: "center" }}>
        <CustomButton variant="contained" type="button" color="secondary" onClick={() => handleAddRubric()}>
          Add Rubric Item <AddIcon />
        </CustomButton>
      </Box>
    </Box>
  );
};

export default React.memo(RubricItems);
