// import "./ProposalItem.css";
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import GradeIcon from '@mui/icons-material/Grade';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AnyARecord } from "dns";
import React, { useCallback } from "react";

import { proposalSummariesGenerator } from "../../../../lib/utils/proposalSummariesGenerator";
import shortenNumber from "../../../../lib/utils/shortenNumber";
import { Editor } from "../../../Editor";
import MetaButton from "../../MetaButton";

// import shortenNumber from "../../../../../../utils/shortenNumber";
// import HyperEditor from "../../../../../Editor/HyperEditor/HyperEditor";
// import MetaButton from "../../../../MetaButton/MetaButton";
// import proposalSummariesGenerator from "../../proposalSummariesGenerator";

const doNothing = () => { };

dayjs.extend(relativeTime);

const ProposalItem = (props: any) => {
  const openLinkedNodeClick = useCallback(
    (proposal: any) => (event: any) => {
      console.log({ shouldSelectProposal: props.shouldSelectProposal, proposal });
      if (props.shouldSelectProposal) {
        props.selectProposal(event, proposal);
      } else {
        props.openLinkedNode(proposal.node);
      }
    },
    [props.openLinkedNode, props.shouldSelectProposal, props.selectProposal]
  );

  let proposalSummaries;
  if (props.proposalSummaries) {
    proposalSummaries = props.proposalSummaries;
  } else {
    proposalSummaries = proposalSummariesGenerator(props.proposal);
  }
  return (
    <li
      className="CollapsedProposal collection-item avatar"
      key={`Proposal${props.proposal.id}`}
      onClick={openLinkedNodeClick(props.proposal)}
      style={{ display: 'flex', flexDirection: 'column', padding: '10px 20px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="title Time">{dayjs(props.proposal.createdAt).fromNow()}</div>
        <div className="secondary-content" style={{ display: 'flex', alignItems: 'center' }}>
          <MetaButton
            tooltip="# of 1Cademists who have found this proposal unhelpful."
            tooltipPosition="bottom-start"
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* <i className={"material-icons " + (props.proposal.wrong ? "red-text" : "grey-text")}>
                close
              </i> */}
              <CloseIcon fontSize='small' />
              <span>{shortenNumber(props.proposal.wrongs, 2, false)}</span>
            </div>
          </MetaButton>
          <MetaButton
            tooltip="# of 1Cademists who have found this proposal helpful."
            tooltipPosition="bottom-start"
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* <i
                className={
                  "material-icons DoneIcon " + (props.proposal.correct ? "green-text" : "grey-text")
                }
              >
                done
              </i> */}
              <DoneIcon fontSize='small' />
              <span>{shortenNumber(props.proposal.corrects, 2, false)}</span>
            </div>
          </MetaButton>
          <MetaButton
            tooltip="# of 1Admins who have awarded this proposal."
            tooltipPosition="bottom-start"
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* <i className={"material-icons " + (props.proposal.award ? "amber-text" : "grey-text")}>
                grade
              </i> */}
              <GradeIcon fontSize='small' />
              <span>{shortenNumber(props.proposal.awards, 2, false)}</span>
            </div>
          </MetaButton>
        </div>
      </div>
      <div>
        <div className="ProposalTitle">
          {/* <p>Node title:</p> */}
          {props.showTitle && (
            // <h1>props.proposal.title</h1>
            <Editor label="" readOnly setValue={doNothing} value={props.proposal.title} />
            // CHECKL i commented this
            // <HyperEditor readOnly={true} onChange={doNothing} content={props.proposal.title} />
          )}
          {/* <p>Proposal Summary:</p> */}
          {proposalSummaries.length > 0
            ? proposalSummaries.map((prSummary: string, prSummaryIdx: number) => {
              return <p style={{ margin: '0px' }} key={"Summary" + props.proposal.id + prSummaryIdx}>{prSummary}</p>;
            })
            : props.proposal.summary && (
              // CHECK: I commented this
              // <HyperEditor readOnl={true} onChange={doNothing} content={props.proposal.summary} />
              <Editor label="" readOnly setValue={doNothing} value={props.proposal.summary} />
              // <p>{props.proposal.summary}</p>
            )}
        </div>
      </div>
    </li>
  );
};

export default React.memo(ProposalItem);
