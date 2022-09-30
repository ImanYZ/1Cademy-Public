import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import { IconButton } from "@mui/material";
// import "./QuestionChoices.css"
import React, { useCallback, useEffect, useState } from "react";

import { KnowledgeChoice } from "../../knowledgeTypes";
import { Editor } from "../Editor";
import { MemoizedMetaButton } from "./MetaButton";

// import HyperEditor from "../../../Editor/HyperEditor/HyperEditorWrapper"
// import MetaButton from "../../MetaButton/MetaButton"

const doNothing = () => {};

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
  // nodeChanged: any;
};

const QuestionChoices = (props: QuestionChoicesProps) => {
  const [choicesOpen, setChoicesOpen] = useState<boolean[]>([]);

  useEffect(() => {
    const choices: boolean[] = [];
    for (let i = 0; i < props.choices.length; i++) {
      choices[i] = false;
    }
    setChoicesOpen(choices);
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choiceClick = useCallback(() => {
    // console.log("choiceClick");
    const choices = [...choicesOpen];
    choices[props.idx] = !choices[props.idx];
    setChoicesOpen(choices);
    // setTimeout(() => {
    //   props.nodeChanged();
    // }, 400);
  }, [props.idx, choicesOpen /*, props.nodeChanged*/]);

  const deleteChoiceHandler = useCallback(
    () => props.deleteChoice(props.nodeRef, props.identifier, props.idx),
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.deleteChoice, props.nodeRef, props.identifier, props.idx]
  );

  const switchChoiceHandler = useCallback(
    () => props.switchChoice(props.identifier, props.idx),
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.switchChoice, props.identifier, props.idx]
  );

  const changeChoiceHandler = useCallback(
    (value: any) => props.changeChoice(props.nodeRef, props.identifier, value, props.idx),
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.changeChoice, props.nodeRef, props.identifier, props.idx]
  );

  const changeFeedbackHandler = useCallback(
    (value: any) => props.changeFeedback(props.nodeRef, props.identifier, value, props.idx),
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.changeFeedback, props.nodeRef, props.identifier, props.idx]
  );

  if (props.editable) {
    return (
      <li className="QuestionChoices">
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ alignSelf: "flex-end" }}>
            {props.choice.correct ? (
              <IconButton onClick={switchChoiceHandler}>
                <DoneIcon className="green-text" sx={{ fontSize: "16px" }} />
              </IconButton>
            ) : (
              <IconButton onClick={switchChoiceHandler}>
                <CloseIcon className="red-text" sx={{ fontSize: "16px" }} />
              </IconButton>
            )}
          </div>
          {/* <i
            onClick={switchChoiceHandler}
            className={"material-icons " + (props.choice.correct ? "green-text DoneIcon" : "red-text")}
          >
            {props.choice.correct ? "done" : "close"}
          </i> */}
          <Editor label="" readOnly={false} setValue={changeChoiceHandler} value={props.choice.choice} />
          {props.choicesNum > 1 && (
            // <div className="">
            <div style={{ display: "flex", alignItems: "center" }}>
              <MemoizedMetaButton onClick={deleteChoiceHandler} tooltip="Delete this choice from this question.">
                {/* <i className="material-icons red-text">delete_forever</i> */}
                <DeleteForeverIcon className="red-text" />
              </MemoizedMetaButton>
            </div>
            // </div>
          )}
        </div>
        <div className="collapsible-body" style={{ display: "block" }}>
          <Editor label="" readOnly={false} setValue={changeFeedbackHandler} value={props.choice.feedback} />
        </div>
      </li>
    );
  } else {
    return (
      <li className="QuestionChoices">
        <div
          className="collapsible-header"
          onClick={choiceClick}
          style={{ display: "flex", cursor: "pointer", border: "solid 1px white" }}
        >
          {choicesOpen[props.idx] ? (
            props.choice.correct ? (
              <DoneIcon className="green-text" />
            ) : (
              <CloseIcon className="red-text" />
            )
          ) : (
            <CheckBoxOutlineBlankIcon />
          )}
          <Editor label="" readOnly={true} value={props.choice.choice} setValue={doNothing} />
        </div>
        {choicesOpen[props.idx] && (
          <div className="collapsible-body" style={{ display: "block", border: "solid 1px white" }}>
            <Editor label="" readOnly={true} value={props.choice.feedback} setValue={doNothing} />
          </div>
        )}
      </li>
    );
  }
};

export default React.memo(QuestionChoices);
