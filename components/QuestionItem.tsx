import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Checkbox, FormControlLabel, IconButton, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import React, { FC, useState } from "react";

import { KnowledgeChoice } from "../src/knowledgeTypes";
import MarkdownRender from "./Markdown/MarkdownRender";

type Props = {
  choices?: KnowledgeChoice[];
};

const QuestionItem: FC<Props> = ({ choices }) => {
  const initialChoicesState = new Array(choices?.length || 0).fill(false);

  const [choicesState, setChoicesState] = useState<boolean[]>(initialChoicesState);

  const handleToggleQuestion = (index: number) => {
    setChoicesState(previousChoiceState => {
      const oldPreviousChoiceState = [...previousChoiceState];
      oldPreviousChoiceState[index] = !oldPreviousChoiceState[index];
      return oldPreviousChoiceState;
    });
  };

  if (!choices) {
    return null;
  }

  return (
    <>
      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {choices.map((value, idx) => {
          return (
            <Box key={idx} sx={{ width: "100%" }}>
              <ListItem sx={{ width: "100%", py: "10px" }}>
                <ListItemIcon sx={{ width: "100%" }}>
                  <FormControlLabel
                    label={<MarkdownRender text={value.choice} />}
                    sx={{ width: "calc(100%) - 46px" }}
                    control={
                      <>
                        {!choicesState[idx] && (
                          <Checkbox checked={choicesState[idx]} onChange={() => handleToggleQuestion(idx)} />
                        )}
                        {choicesState[idx] && !value.correct && (
                          <IconButton onClick={() => handleToggleQuestion(idx)}>
                            <CloseIcon color="error" />
                          </IconButton>
                        )}
                        {choicesState[idx] && value.correct && (
                          <IconButton onClick={() => handleToggleQuestion(idx)}>
                            <CheckIcon color="success" />
                          </IconButton>
                        )}
                      </>
                    }
                  />
                </ListItemIcon>
              </ListItem>

              {choicesState[idx] && (
                <ListItem disablePadding>
                  <ListItemText primary={value.feedback} />
                </ListItem>
              )}
            </Box>
          );
        })}
      </List>
    </>
  );
};

export default QuestionItem;
