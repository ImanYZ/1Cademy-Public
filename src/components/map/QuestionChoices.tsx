import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import { Box, IconButton, Switch, Typography } from "@mui/material";
// import "./QuestionChoices.css"
import React, { startTransition, useCallback, useEffect, useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { KnowledgeChoice } from "../../knowledgeTypes";
import { Editor } from "../Editor";
// import { MemoizedMetaButton } from "./MetaButton";

// import HyperEditor from "../../../Editor/HyperEditor/HyperEditorWrapper"
// import MetaButton from "../../MetaButton/MetaButton"

const doNothing = () => {};
type EditorOptions = "EDIT" | "PREVIEW";
type QuestionChoicesProps = {
  identifier: string;
  nodeRef: any;
  editable: any;
  choices: KnowledgeChoice[];
  idx: number;
  choicesNum: any;
  choice: KnowledgeChoice;
  deleteChoice: any;
  switchChoice: any;
  changeChoice: any;
  changeFeedback: any;
  option?: EditorOptions;
  // nodeChanged: any;
};

const QuestionChoices = ({
  identifier,
  nodeRef,
  editable,
  choices,
  idx,
  choicesNum,
  choice,
  deleteChoice,
  switchChoice,
  changeChoice,
  changeFeedback,
  option,
}: QuestionChoicesProps) => {
  const [choicesOpen, setChoicesOpen] = useState<boolean[]>([]);
  const [choiceCopy, setChoiceCopy] = useState(choice.choice);
  const [feedbackCopy, setFeedbackCopy] = useState(choice.feedback);

  // update choices
  useEffect(() => {
    startTransition(() => {
      setChoiceCopy(choice.choice);
      setFeedbackCopy(choice.feedback);
    });
  }, [choice]);

  useEffect(() => {
    const choices: boolean[] = [];
    for (let i = 0; i < choices.length; i++) {
      choices[i] = false;
    }
    setChoicesOpen(choices);
  }, [choices.length]);

  const onSetChoiseCopy = (newChoise: string) => {
    setChoiceCopy(newChoise);
    startTransition(() => {
      // value => setNodeParts(identifier, thisNode => ({ ...thisNode, title: value }))
      changeChoice(nodeRef, identifier, newChoise, idx);
    });
  };

  const onSetFeedbackCopy = (newFeedback: string) => {
    setFeedbackCopy(newFeedback);
    startTransition(() => {
      // value => setNodeParts(identifier, thisNode => ({ ...thisNode, title: value }))
      changeFeedback(nodeRef, identifier, newFeedback, idx);
    });
  };

  const choiceClick = useCallback(() => {
    const choices = [...choicesOpen];
    choices[idx] = !choices[idx];
    setChoicesOpen(choices);
    // setTimeout(() => {
    //   nodeChanged();
    // }, 400);
  }, [idx, choicesOpen /*, nodeChanged*/]);

  const deleteChoiceHandler = useCallback(
    () => deleteChoice(nodeRef, identifier, idx),
    [deleteChoice, identifier, idx, nodeRef]
  );

  const switchChoiceHandler = useCallback(() => switchChoice(identifier, idx), [identifier, idx, switchChoice]);

  // const changeChoiceHandler = useCallback(

  //   (value: any) => {
  //     startTransition(() => {
  //       changeChoice(nodeRef, identifier, value, idx);
  //     });
  //   },
  //   [props]
  // );

  // const changeFeedbackHandler = useCallback(
  //   (value: any) => changeFeedback(nodeRef, identifier, value, idx),
  //   [props]
  // );
  const getLetter = (index: number): string => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    if (index < 26) {
      return letters[index];
    } else {
      const firstIndex = Math.floor(index / 26) - 1;
      const secondIndex = index % 26;
      return `${letters[firstIndex]}.${letters[secondIndex]}`;
    }
  };

  if (editable) {
    return (
      <Box
        sx={{
          mb: 2,
          p: 3,
          pt: 0,
          borderRadius: "17px",
          background: theme =>
            theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray250,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: "7px" }}>
          <Typography> {`${getLetter(idx)})-`}</Typography>
          <Typography sx={{ color: "red", ml: "10px" }}>Wrong</Typography>

          {choice.correct ? (
            <Switch checked={true} onClick={switchChoiceHandler} color="success" />
          ) : (
            <Switch checked={false} defaultChecked onClick={switchChoiceHandler} />
          )}
          <Typography sx={{ color: "green" }}>Correct</Typography>
        </Box>
        <Box style={{ display: "flex", alignItems: "center" }}>
          {/* TODO: Keep the state of readonly after render */}
          <Editor
            label="Replace this with the choice."
            readOnly={false}
            value={choiceCopy}
            setValue={onSetChoiseCopy}
            showEditPreviewSection={false}
            editOption={option}
            // onBlurCallback={changeChoiceHandler}
          />
          {choicesNum > 1 && (
            <Box sx={{ ml: "7px" }}>
              <IconButton onClick={deleteChoiceHandler}>
                <DeleteForeverIcon className="red-text" sx={{ fontSize: "28px" }} />
              </IconButton>
            </Box>
          )}
        </Box>
        <Box sx={{ display: "block", mt: 4 }}>
          {/* TODO: Keep the state of readonly after render */}
          <Editor
            label="Replace this with the choice-specific feedback."
            readOnly={false}
            setValue={onSetFeedbackCopy}
            value={feedbackCopy}
            showEditPreviewSection={false}
            editOption={option}
            // onBlurCallback={changeFeedbackHandler}
          />
        </Box>
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          mb: 2,
          px: 2,
          background: theme =>
            theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray250,
        }}
      >
        <Box
          className="collapsible-header"
          onClick={choiceClick}
          style={{ display: "flex", cursor: "pointer", alignItems: "center" }}
        >
          {choicesOpen[idx] ? (
            choice.correct ? (
              <DoneIcon className="green-text" sx={{ mr: "8px" }} />
            ) : (
              <CloseIcon className="red-text" sx={{ mr: "8px" }} />
            )
          ) : (
            <CheckBoxOutlineBlankIcon sx={{ mr: "8px" }} />
          )}
          <Editor
            label="Replace this with the choice."
            readOnly={true}
            value={choice.choice}
            setValue={doNothing}
            showEditPreviewSection={false}
            editOption={option}
          />
        </Box>
        {choicesOpen[idx] && (
          <Box className="collapsible-body" sx={{ display: "block", pl: "32px" }}>
            <Editor
              label="Replace this with the choice-specific feedback."
              readOnly={true}
              value={choice.feedback}
              setValue={doNothing}
              showEditPreviewSection={false}
              editOption={option}
            />
          </Box>
        )}
      </Box>
    );
  }
};

export default React.memo(QuestionChoices);
