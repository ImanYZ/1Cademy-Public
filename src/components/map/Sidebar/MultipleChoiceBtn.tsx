// import "./MultipleChoiceBtn.css";

import React from "react";

import { MemoizedMetaButton } from "../MetaButton";

// import MetaButton from "../MetaButton";

type MultipleChoiceBtnProps = {
  choices: { label: string; choose: any }[];
  onClose: any;
};

const MultipleChoiceBtn = (props: MultipleChoiceBtnProps) => {
  return (
    <div id="MultipleChoiceBtnContainer">
      {props.choices.map(choice => {
        return (
          <div key={choice.label}>
            <MemoizedMetaButton onClick={choice.choose}>
              <>{choice.label}</>
            </MemoizedMetaButton>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(MultipleChoiceBtn);
