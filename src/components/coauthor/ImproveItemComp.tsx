import React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import QuestionMarkIcon from "@mui/icons-material/HelpOutline";

interface Improvement {
  id?: string;
  reasoning: string;
  action: string;
  sentence: string;
  new_sentence: string;
}

interface Props {
  improvement: Improvement;
  theme: any;
  findScrollAndSelect: (text: string) => Promise<void> | Promise<HTMLElement>;
  excludeCurrentModification?: (id: string) => null | void;
}

const ImproveItemComp: React.FC<Props> = ({ improvement, theme, findScrollAndSelect, excludeCurrentModification }) => {
  const implementAction = async (
    improvement: Improvement,
    excludeCurrentModification: (id: string) => null | void = () => null
  ) => {
    const matchedElement: HTMLElement = (await findScrollAndSelect(improvement?.sentence)) as HTMLElement;
    if (matchedElement) {
      if (improvement?.action === "modify") {
        if (improvement?.new_sentence) {
          matchedElement.innerHTML = improvement.new_sentence;
        }
      } else if (improvement?.action === "add") {
        if (improvement?.new_sentence) {
          matchedElement.innerHTML += " " + improvement.new_sentence;
        }
      } else if (improvement?.action === "delete") {
        if (matchedElement) {
          matchedElement.innerHTML = "";
        }
      }
      excludeCurrentModification(improvement.id || "");
    }
  };

  return (
    <>
      <Paper
        sx={{
          mt: "10px",
          display: "flex",
          borderRadius: "7px",
        }}
      >
        <Box
          sx={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            color: theme.palette.mode === "dark" ? "white" : "black",
            padding: "16px",
          }}
        >
          {improvement?.action === "modify" || improvement?.action === "add"
            ? improvement?.new_sentence
            : improvement?.sentence}
        </Box>
        <Button
          onClick={() => implementAction(improvement, excludeCurrentModification)}
          sx={{
            width: "10px",
            minWidth: "10px",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            borderTopLeftRadius: "7px",
            borderBottomLeftRadius: "7px",
            backgroundColor:
              improvement?.action === "modify"
                ? "darkorange"
                : improvement?.action === "delete"
                ? "error.main"
                : improvement?.action === "add"
                ? "success.dark"
                : "transparent",
            "&:hover": {
              backgroundColor:
                improvement?.action === "modify"
                  ? "orange"
                  : improvement?.action === "delete"
                  ? "error.light"
                  : improvement?.action === "add"
                  ? "success.main"
                  : "transparent",
            },
          }}
        >
          {improvement?.action === "modify" ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EditIcon />
              <Box
                sx={{
                  writingMode: "vertical-lr",
                  textOrientation: "upright",
                }}
              >
                Edit
              </Box>
            </Box>
          ) : improvement?.action === "delete" ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DeleteIcon />
              <Box
                sx={{
                  writingMode: "vertical-lr",
                  textOrientation: "upright",
                }}
              >
                Delete
              </Box>
            </Box>
          ) : improvement?.action === "add" ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AddIcon />
              <Box
                sx={{
                  writingMode: "vertical-lr",
                  textOrientation: "upright",
                }}
              >
                Add
              </Box>
            </Box>
          ) : null}
        </Button>
      </Paper>
      <Paper
        sx={{
          mt: "10px",
          mb: "10px",
          display: "flex",
          borderRadius: "7px",
        }}
      >
        <Box
          sx={{
            width: "10px",
            backgroundColor: "gray",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            borderTopLeftRadius: "7px",
            borderBottomLeftRadius: "7px",
          }}
        >
          <QuestionMarkIcon />
        </Box>
        <Box
          sx={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            color: theme.palette.mode === "dark" ? "white" : "black",
            padding: "16px",
          }}
        >
          {improvement?.reasoning}
        </Box>
      </Paper>
    </>
  );
};

export default ImproveItemComp;
