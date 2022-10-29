import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import { IconButton } from "@mui/material";
// import "./QuestionChoices.css"
import React, { startTransition, useCallback, useEffect, useState } from "react";

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
  const [choiceCopy, setChoiceCopy] = useState(props.choice.choice);
  const [feedbackCopy, setFeedbackCopy] = useState(props.choice.feedback);

  useEffect(() => {
    const choices: boolean[] = [];
    for (let i = 0; i < props.choices.length; i++) {
      choices[i] = false;
    }
    setChoicesOpen(choices);
  }, [props.choices.length]);

  const onSetChoiseCopy = (newChoise: string) => {
    setChoiceCopy(newChoise);
    startTransition(() => {
      // value => setNodeParts(identifier, thisNode => ({ ...thisNode, title: value }))
      props.changeChoice(props.nodeRef, props.identifier, newChoise, props.idx);
    });
  };

  const onSetFeedbackCopy = (newFeedback: string) => {
    setFeedbackCopy(newFeedback);
    startTransition(() => {
      // value => setNodeParts(identifier, thisNode => ({ ...thisNode, title: value }))
      props.changeFeedback(props.nodeRef, props.identifier, newFeedback, props.idx);
    });
  };

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
    [props]
  );

  const switchChoiceHandler = useCallback(() => props.switchChoice(props.identifier, props.idx), [props]);

  // const changeChoiceHandler = useCallback(

  //   (value: any) => {
  //     startTransition(() => {
  //       props.changeChoice(props.nodeRef, props.identifier, value, props.idx);
  //     });
  //   },
  //   [props]
  // );

  // const changeFeedbackHandler = useCallback(
  //   (value: any) => props.changeFeedback(props.nodeRef, props.identifier, value, props.idx),
  //   [props]
  // );

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
          {/* TODO: Keep the state of readonly after render */}
          <Editor
            label=""
            readOnly={false}
            value={choiceCopy}
            setValue={onSetChoiseCopy}
            // onBlurCallback={changeChoiceHandler}
          />
          {props.choicesNum > 1 && (
            <div style={{ display: "flex", alignSelf: "flex-end", padding: "8px 0px" }}>
              <MemoizedMetaButton onClick={deleteChoiceHandler} tooltip="Delete this choice from this question.">
                <DeleteForeverIcon className="red-text" sx={{ fontSize: "16px" }} />
              </MemoizedMetaButton>
            </div>
          )}
        </div>
        <div className="collapsible-body" style={{ display: "block" }}>
          {/* TODO: Keep the state of readonly after render */}
          <Editor
            label=""
            readOnly={false}
            setValue={onSetFeedbackCopy}
            value={feedbackCopy}
            // onBlurCallback={changeFeedbackHandler}
          />
        </div>
      </li>
    );
  } else {
    return (
      <li className="QuestionChoices">
        <div
          className="collapsible-header"
          onClick={choiceClick}
          style={{ display: "flex", cursor: "pointer", alignItems: "center" }}
        >
          {choicesOpen[props.idx] ? (
            props.choice.correct ? (
              <DoneIcon className="green-text" sx={{ marginRight: "8px" }} />
            ) : (
              <CloseIcon className="red-text" sx={{ marginRight: "8px" }} />
            )
          ) : (
            <CheckBoxOutlineBlankIcon sx={{ marginRight: "8px" }} />
          )}
          <Editor label="" readOnly={true} value={props.choice.choice} setValue={doNothing} />
        </div>
        {choicesOpen[props.idx] && (
          <div
            className="collapsible-body"
            style={{ display: "block", borderBottom: "solid 1px #fff", paddingLeft: "32px" }}
          >
            <Editor label="" readOnly={true} value={props.choice.feedback} setValue={doNothing} />
          </div>
        )}
      </li>
    );
  }
};

export default React.memo(QuestionChoices);
