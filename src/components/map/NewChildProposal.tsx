import "./NewChildProposal.css";

import React, { useCallback } from "react";

import MetaButton from "./MetaButton";

type NewChildProposalProps = {
  key: any,
  childNodeType: string,
  icon: any,
  openProposal: any,
  setOpenProposal: any,
  proposeNewChild: any,
}

const NewChildProposal = (props: NewChildProposalProps) => {
  const proposeNewChildClick = useCallback(
    (event: any) => props.proposeNewChild(event, props.childNodeType, props.setOpenProposal),
    [props.proposeNewChild, props.childNodeType, props.setOpenProposal]
  );

  return (
    <span>
      <MetaButton
        onClick={
          props.openProposal !== "ProposeNew" + props.childNodeType + "ChildNode"
            ? proposeNewChildClick
            : undefined
        }
      >
        <div className="NewProposalButton">
          <div className="NewProposalIcons">
            <i className="material-icons orange-text">add</i>
            <i className={"material-icons orange-text"}>{props.icon}</i>
          </div>
          <div className="NewProposalButtonText">{props.childNodeType}</div>
        </div>
      </MetaButton>
    </span>
  );
};

export default React.memo(NewChildProposal);
