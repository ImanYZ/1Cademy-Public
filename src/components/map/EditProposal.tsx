// import "./EditProposal.css";

import CreateIcon from "@mui/icons-material/Create";
import { Button } from "@mui/material";
import React, { useCallback } from "react";

// import { useRecoilValue } from "recoil";
// import { selectedNodeState } from "../../../../../store/MapAtoms";
// import MetaButton from "../../../MetaButton/MetaButton";

type EditProposalProps = {
  proposeNodeImprovement: any;
  openProposal: any;
  selectedNode: any;
};

const EditProposal = (props: EditProposalProps) => {
  // const selectedNode = useRecoilValue(selectedNodeState);

  const proposeNodeImprovementClick = useCallback(
    (event: any) => props.proposeNodeImprovement(event),
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.proposeNodeImprovement]
  );

  return (
    <div id="ProposeImprovementContainer">
      <Button
        onClick={props.openProposal !== "ProposeEditTo" + props.selectedNode ? proposeNodeImprovementClick : undefined}
      >
        <div id="ProposeImprovementButton">
          <CreateIcon fontSize="small" />
          Edit/Improve
        </div>
      </Button>
      {/* <MetaButton
        onClick={
          props.openProposal !== "ProposeEditTo" + selectedNode
            ? proposeNodeImprovementClick
            : undefined
        }
      >
        <div id="ProposeImprovementButton">
          <i className={"material-icons orange-text"}>create</i>
          Edit/Improve
        </div>
      </MetaButton> */}
    </div>
  );
};

export default React.memo(EditProposal);
