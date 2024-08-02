import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import React from "react";

import { Editor } from "@/components/Editor";
import { CustomButton } from "@/components/map/Buttons/Buttons";

type EditorOptions = "EDIT" | "PREVIEW";
type RubricFormProps = {
  rubrics: RubricItemType[];
  handleAddRubric: () => void;
  handleDeleteRubric: (idx: number) => void;
  handleRubricItem: (value: string, idx: number) => void;
  handleRubricPoints: (value: string, idx: number) => void;
  option: EditorOptions;
};
type RubricItemType = { item: string; point: number };
const RubricItems = ({
  rubrics,
  handleAddRubric,
  handleDeleteRubric,
  handleRubricItem,
  handleRubricPoints,
  option,
}: RubricFormProps) => {
  return (
    <Box>
      <table style={{ borderSpacing: option === "EDIT" ? "5px 15px" : "0px 0px" }}>
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
                <td
                  style={{
                    width: "100%",
                    ...(option === "PREVIEW" && {
                      borderBottom: "solid 1px #606163",
                      padding: "10px",
                    }),
                  }}
                >
                  <Editor
                    label=""
                    value={rubric?.item}
                    setValue={value => handleRubricItem(value, index)}
                    showEditPreviewSection={false}
                    editOption={option}
                    readOnly={option === "PREVIEW"}
                  />
                </td>
                <td
                  style={{
                    ...(option === "PREVIEW" && {
                      borderBottom: "solid 1px #606163",
                      padding: "10px",
                    }),
                  }}
                >
                  <Editor
                    label=""
                    value={option === "PREVIEW" ? rubric?.points.toString() : rubric?.points}
                    setValue={value => handleRubricPoints(value, index)}
                    readOnly={option === "PREVIEW"}
                    sxPreview={{ textAlign: "center", overflow: "hidden" }}
                    showEditPreviewSection={false}
                    editOption={option}
                    sx={{ width: "50px" }}
                    multiline={false}
                  />
                </td>
                {option === "EDIT" && (
                  <td>
                    <Tooltip title="Remove Rubric Item">
                      <IconButton type="button" onClick={() => handleDeleteRubric(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {option === "EDIT" && (
        <Box mt={1} sx={{ display: "flex", justifyContent: "center" }}>
          <CustomButton variant="contained" type="button" color="secondary" onClick={() => handleAddRubric()}>
            Add Rubric Item <AddIcon />
          </CustomButton>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(RubricItems);
