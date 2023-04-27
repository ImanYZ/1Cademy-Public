import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import React, { useCallback, useEffect, useState } from "react";

import { KnowledgeChoice } from "../../knowledgeTypes";
import MarkdownRender from "../Markdown/MarkdownRender";

type BasicQuestionChoicesProps = {
  choices: KnowledgeChoice[];
  idx: number;
  choice: KnowledgeChoice;
};

const BasicQuestionChoices = ({ choices, idx, choice }: BasicQuestionChoicesProps) => {
  const [choicesOpen, setChoicesOpen] = useState<boolean[]>([]);

  useEffect(() => {
    const choices: boolean[] = [];
    for (let i = 0; i < choices.length; i++) {
      choices[i] = false;
    }
    setChoicesOpen(choices);
  }, [choices.length]);

  const choiceClick = useCallback(() => {
    const choices = [...choicesOpen];
    choices[idx] = !choices[idx];
    setChoicesOpen(choices);
  }, [idx, choicesOpen]);

  return (
    <li className="QuestionChoices">
      <div
        className="collapsible-header"
        onClick={choiceClick}
        style={{ display: "flex", cursor: "pointer", alignItems: "center" }}
      >
        {choicesOpen[idx] ? (
          choice.correct ? (
            <DoneIcon className="green-text" sx={{ marginRight: "8px" }} />
          ) : (
            <CloseIcon className="red-text" sx={{ marginRight: "8px" }} />
          )
        ) : (
          <CheckBoxOutlineBlankIcon sx={{ marginRight: "8px" }} />
        )}
        <MarkdownRender
          text={choice.choice}
          customClass={"custom-react-markdown"}
          sx={{ fontSize: "25px", fontWeight: 400, letterSpacing: "inherit" }}
        />
        {/* <Editor
          label=""
          readOnly={true}
          value={choice.choice}
          setValue={doNothing}
          showEditPreviewSection={false}
          editOption={option}
        /> */}
      </div>
      {choicesOpen[idx] && (
        <div
          className="collapsible-body"
          style={{ display: "block", borderBottom: "solid 1px #fff", paddingLeft: "32px" }}
        >
          <MarkdownRender
            text={choice.feedback}
            customClass={"custom-react-markdown"}
            sx={{ fontSize: "25px", fontWeight: 400, letterSpacing: "inherit" }}
          />
          {/* <Editor
            label=""
            readOnly={true}
            value={choice.feedback}
            setValue={doNothing}
            showEditPreviewSection={false}
            editOption={option}
          /> */}
        </div>
      )}
    </li>
  );
};

export const MemoizedBasicQuestionChoices = React.memo(BasicQuestionChoices);
