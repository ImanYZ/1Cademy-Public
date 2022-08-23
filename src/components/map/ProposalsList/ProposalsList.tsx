import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import React, { useCallback } from "react";

// import { useRecoilValue } from "recoil";
import LoadingImg from "../../../../public/1Cademy_Loading_Dots.gif";
import { useAuth } from "../../../context/AuthContext";
import { proposalSummariesGenerator } from "../../../lib/utils/proposalSummariesGenerator";
import shortenNumber from "../../../lib/utils/shortenNumber";
import MetaButton from "../MetaButton";
import ProposalItem from "./ProposalItem/ProposalItem";
import UserHeader from "./UserHeader/UserHeader";
// import { usernameState } from "../../../../../store/AuthAtoms";
// import shortenNumber from "../../../../../utils/shortenNumber";
// import HyperEditor from "../../../../Editor/HyperEditor/HyperEditorWrapper";
// import MetaButton from "../../../MetaButton/MetaButton";
// import proposalSummariesGenerator from "../proposalSummariesGenerator";
// import ProposalItem from "./ProposalItem/ProposalItem";
// import UserHeader from "./UserHeader/UserHeader";

// import "./ProposalsList.css";

const doNothing = () => { };

dayjs.extend(relativeTime);

type ProposalsListProps = {
  proposals: any,
  setProposals: any,
  proposeNodeImprovement: any,
  fetchProposals: any,
  rateProposal: any,
  selectProposal: any,
  deleteProposal: any,
  editHistory: boolean,
  proposeNewChild: any,
  openProposal: any,
  isAdmin: any,
  isRetrieving: any,
}

const ProposalsList = (props: ProposalsListProps) => {
  const [user] = useAuth();

  const username = user.user?.uname

  const rateProposalClick = useCallback(
    (proposal: any, proposalIdx: any, correct: any, wrong: any, award: any) => (event: any) =>
      props.rateProposal(
        event,
        props.proposals,
        props.setProposals,
        proposal.id,
        proposalIdx,
        correct,
        wrong,
        award
      ),
    [props.rateProposal, props.proposals]
  );

  const deleteProposalClick = useCallback(
    (proposal: any, proposalIdx: any) => (event: any) =>
      props.deleteProposal(event, props.proposals, props.setProposals, proposal.id, proposalIdx),
    [props.deleteProposal, props.proposals]
  );

  console.log(' ---> props.proposals', props.proposals)

  return !props.isRetrieving ? (
    props.proposals.map((proposal: any, proposalIdx: any) => {
      const proposalSummaries = proposalSummariesGenerator(proposal);
      if ((props.editHistory && proposal.accepted) || (!props.editHistory && !proposal.accepted)) {
        if (props.openProposal === proposal.id) {
          let adminTooltip = "# of 1Admins who have awarded this proposal.";
          if (!props.isAdmin) {
            adminTooltip +=
              " You cannot give this proposal an award, because you are not the 1Admin of this node.";
          } else {
            if (proposal.proposer === username) {
              adminTooltip += " You cannot give your own proposal an award!";
            } else {
              adminTooltip +=
                " You're the 1Admin of this node. Click to give this proposal an award, if you find it exceptionally helpful.";
            }
          }
          return (
            <li className="collection-item avatar" key={`Proposal${proposal.id}`}>
              <UserHeader imageUrl={proposal.imageUrl} />
              <div className="title Username">{proposal.proposer}</div>
              <div className="title Time">{dayjs(proposal.createdAt).fromNow()}</div>
              <div className="ProposalTitle">
                {proposalSummaries.length > 0 ? (
                  proposalSummaries.map((prSummary: any, sIdx: number) => {
                    return <p key={"Summary" + proposal.id + sIdx}>{prSummary}</p>;
                  })
                ) : (
                  <p>{proposal.summary}</p>
                  // CHECK: I commented this, uncomment when build the editor please
                  // <HyperEditor readOnly={true} onChange={doNothing} content={proposal.summary} />
                )}
              </div>
              <div className="ProposalBody">
                {/* CHECK: I commented this */}
                {/* <HyperEditor readOnly={true} onChange={doNothing} content={proposal.proposal} /> */}
                <p>{proposal.proposal}</p>
              </div>
              <div className="secondary-content">
                <MetaButton
                  onClick={rateProposalClick(proposal, proposalIdx, false, true, false)}
                  tooltip="Click if you find this proposal Unhelpful."
                  tooltipPosition="bottom-start"
                >
                  <>
                    <i className={"material-icons " + (proposal.wrong ? "red-text" : "grey-text")}>
                      close
                    </i>
                    <span>{shortenNumber(proposal.wrongs, 2, false)}</span>
                  </>
                </MetaButton>
                <MetaButton
                  onClick={rateProposalClick(proposal, proposalIdx, true, false, false)}
                  tooltip="Click if you find this proposal helpful."
                  tooltipPosition="bottom-start"
                >
                  <>
                    <i className={proposal.correct
                      ? "material-icons DoneIcon green-text"
                      : "material-icons DoneIcon grey-text"
                    }>
                      done
                    </i>
                    <span>{shortenNumber(proposal.corrects, 2, false)}</span>
                  </>
                </MetaButton>
                <MetaButton
                  onClick={
                    !props.isAdmin || proposal.proposer === username
                      ? false
                      : rateProposalClick(proposal, proposalIdx, false, false, true)
                  }
                  tooltip={adminTooltip}
                  tooltipPosition="bottom-start"
                >
                  <>
                    <i className={"material-icons " + (proposal.award ? "amber-text" : "grey-text")}>
                      grade
                    </i>
                    <span>{shortenNumber(proposal.awards, 2, false)}</span>
                  </>
                </MetaButton>
                {!proposal.accepted && proposal.proposer === username && (
                  <MetaButton
                    onClick={deleteProposalClick(proposal, proposalIdx)}
                    tooltip="Delete your proposal."
                    tooltipPosition="bottom-start"
                  >
                    <i className="material-icons grey-text">delete_forever</i>
                  </MetaButton>
                )}
              </div>

              {/* <CommentsList proposal={proposal} /> */}
            </li>
          );
        } else {
          return (
            <ProposalItem
              proposal={proposal}
              selectProposal={props.selectProposal}
              proposalSummaries={proposalSummaries}
              shouldSelectProposal={true}
              showTitle={true}
            />
          );
        }
      }
    })
  ) : (
    <div className="CenterredLoadingImageSidebar">
      {/* <img className="CenterredLoadingImage" src={LoadingImg} alt="Loading" /> */}
      <Image src={LoadingImg} alt="Loading" />
      {/* CHECK: this is not working */}
      {/* <div className="preloader-wrapper active big">
        <div className="spinner-layer spinner-yellow-only">
          <div className="circle-clipper left">
            <div className="circle"></div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default React.memo(ProposalsList);
