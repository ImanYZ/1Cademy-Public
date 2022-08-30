// import "./ProposalItem.css";
import CloseIcon from "@mui/icons-material/Close"
import DoneIcon from "@mui/icons-material/Done"
import GradeIcon from "@mui/icons-material/Grade"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { AnyARecord } from "dns"
import React, { useCallback } from "react"

import { proposalSummariesGenerator } from "../../../../lib/utils/proposalSummariesGenerator"
import shortenNumber from "../../../../lib/utils/shortenNumber"
import { Editor } from "../../../Editor"
import { MemoizedMetaButton } from "../../MetaButton"


// import shortenNumber from "../../../../../../utils/shortenNumber";
// import HyperEditor from "../../../../../Editor/HyperEditor/HyperEditor";
// import MetaButton from "../../../../MetaButton/MetaButton";
// import proposalSummariesGenerator from "../../proposalSummariesGenerator";

const doNothing = () => {}

dayjs.extend(relativeTime)

const ProposalItem = (props: any) => {
  const openLinkedNodeClick = useCallback(
    (proposal: any) => (event: any) => {
      if (props.shouldSelectProposal) {
        props.selectProposal(event, proposal)
      } else {
        props.openLinkedNode(proposal.node)
      }
    },
    [props.openLinkedNode, props.shouldSelectProposal, props.selectProposal]
  )

  let proposalSummaries
  if (props.proposalSummaries) {
    proposalSummaries = props.proposalSummaries
  } else {
    proposalSummaries = proposalSummariesGenerator(props.proposal)
  }

  return (
    <li
      className="CollapsedProposal collection-item avatar"
      key={`Proposal${props.proposal.id}`}
      onClick={openLinkedNodeClick(props.proposal)}
      style={{ display: "flex", flexDirection: "column", padding: "10px 20px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="title Time">{dayjs(props.proposal.createdAt).fromNow()}</div>
        <div className="secondary-content" style={{ display: "flex", alignItems: "center" }}>
          <MemoizedMetaButton
            tooltip="# of 1Cademists who have found this proposal unhelpful."
            tooltipPosition="bottom-start"
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <CloseIcon fontSize="small" className={props.proposal.wrong ? "red-text" : "grey-text"}/>
              <span>{shortenNumber(props.proposal.wrongs, 2, false)}</span>
            </div>
          </MemoizedMetaButton>
          <MemoizedMetaButton
            tooltip="# of 1Cademists who have found this proposal helpful."
            tooltipPosition="bottom-start"
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <DoneIcon fontSize="small" className={props.proposal.correct ? "green-text" : "grey-text"}/>
              <span>{shortenNumber(props.proposal.corrects, 2, false)}</span>
            </div>
          </MemoizedMetaButton>
          <MemoizedMetaButton tooltip="# of 1Admins who have awarded this proposal." tooltipPosition="bottom-start">
            <div style={{ display: "flex", alignItems: "center" }}>
              <GradeIcon fontSize="small" className={props.proposal.award ? "amber-text" : "grey-text"}/>
              <span>{shortenNumber(props.proposal.awards, 2, false)}</span>
            </div>
          </MemoizedMetaButton>
        </div>
      </div>
      <div>
        <div className="ProposalTitle">
          {props.showTitle && (
            <Editor label="" readOnly setValue={doNothing} value={props.proposal.title} />
          )}
          {/* <p>Proposal Summary:</p> */}
          {proposalSummaries.length > 0
            ? proposalSummaries.map((prSummary: string, prSummaryIdx: number) => {
                return (
                  <p style={{ margin: "0px" }} key={"Summary" + props.proposal.id + prSummaryIdx}>
                    {prSummary}
                  </p>
                )
              })
            : props.proposal.summary && (
                <Editor label="" readOnly setValue={doNothing} value={props.proposal.summary} />
              )}
        </div>
      </div>
    </li>
  )
}

export default React.memo(ProposalItem)
