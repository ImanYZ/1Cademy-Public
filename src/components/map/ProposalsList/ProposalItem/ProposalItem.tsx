// import "./ProposalItem.css";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import GradeIcon from "@mui/icons-material/Grade";
import { Paper } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback } from "react";

import { proposalSummariesGenerator } from "../../../../lib/utils/proposalSummariesGenerator";
import shortenNumber from "../../../../lib/utils/shortenNumber";
import { Editor } from "../../../Editor";
import { MemoizedMetaButton } from "../../MetaButton";

// import shortenNumber from "../../../../../../utils/shortenNumber";
// import HyperEditor from "../../../../../Editor/HyperEditor/HyperEditor";
// import MetaButton from "../../../../MetaButton/MetaButton";
// import proposalSummariesGenerator from "../../proposalSummariesGenerator";

const doNothing = () => {};

dayjs.extend(relativeTime);

const ProposalItem = (props: any) => {
  const openLinkedNodeClick = useCallback(
    (proposal: any) => (event: any) => {
      if (props.shouldSelectProposal) {
        props.selectProposal(event, proposal);
      } else {
        props.openLinkedNode(proposal.node);
      }
    },
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.openLinkedNode, props.shouldSelectProposal, props.selectProposal]
  );

  let proposalSummaries;
  if (props.proposalSummaries) {
    proposalSummaries = props.proposalSummaries;
  } else {
    proposalSummaries = proposalSummariesGenerator(props.proposal);
  }
  const deleteProposalClick = useCallback(
    (proposal: any, proposalIdx: any) => (event: any) =>
      props.deleteProposal(event, props.proposals, props.setProposals, proposal.id, proposalIdx),
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.deleteProposal, props.proposals]
  );
  return (
    <Paper
      elevation={3}
      className="CollapsedProposal collection-item avatar"
      key={`Proposal${props.proposal.id}`}
      onClick={openLinkedNodeClick(props.proposal)}
      style={{ display: "flex", flexDirection: "column", padding: "10px 20px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="title Time" style={{ fontSize: "12px" }}>
          {dayjs(props.proposal.createdAt).fromNow()}
        </div>
        <div
          className="secondary-content"
          style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "16px" }}
        >
          <MemoizedMetaButton
            tooltip="# of 1Cademists who have found this proposal unhelpful."
            tooltipPosition="bottom-start"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "16px" }}>
              <CloseIcon className={props.proposal.wrong ? "red-text" : "grey-text"} sx={{ fontSize: "inherit" }} />
              <span>{shortenNumber(props.proposal.wrongs, 2, false)}</span>
            </div>
          </MemoizedMetaButton>
          <MemoizedMetaButton
            tooltip="# of 1Cademists who have found this proposal helpful."
            tooltipPosition="bottom-start"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "16px" }}>
              <DoneIcon className={props.proposal.correct ? "green-text" : "grey-text"} sx={{ fontSize: "inherit" }} />
              <span>{shortenNumber(props.proposal.corrects, 2, false)}</span>
            </div>
          </MemoizedMetaButton>
          <MemoizedMetaButton tooltip="# of 1Admins who have awarded this proposal." tooltipPosition="bottom-start">
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "16px" }}>
              <GradeIcon className={props.proposal.award ? "amber-text" : "grey-text"} sx={{ fontSize: "inherit" }} />
              <span>{shortenNumber(props.proposal.awards, 2, false)}</span>
            </div>
          </MemoizedMetaButton>
          {!props.accepted && props.proposal.proposer === props.username && (
            <MemoizedMetaButton
              onClick={deleteProposalClick(props.proposal, props.proposalIdx)}
              tooltip="Delete your proposal."
              tooltipPosition="bottom-start"
            >
              <DeleteForeverIcon className="grey-text" fontSize="inherit"></DeleteForeverIcon>
            </MemoizedMetaButton>
          )}
        </div>
      </div>
      <div>
        <div className="ProposalTitle">
          {props.showTitle && <Editor label="" readOnly setValue={doNothing} value={props.proposal.title} />}
          {/* <p>Proposal Summary:</p> */}
          {proposalSummaries.length > 0
            ? proposalSummaries.map((prSummary: string, prSummaryIdx: number) => {
                return (
                  <p style={{ margin: "0px" }} key={"Summary" + props.proposal.id + prSummaryIdx}>
                    {prSummary}
                  </p>
                );
              })
            : props.proposal.summary && (
                <Editor label="" readOnly setValue={doNothing} value={props.proposal.summary} />
              )}
        </div>
      </div>
    </Paper>
  );
};

export default React.memo(ProposalItem);
