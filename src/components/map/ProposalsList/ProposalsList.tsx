import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import GradeIcon from "@mui/icons-material/Grade";
import { Paper } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback } from "react";

// import { VictoryBar } from "victory";
import { Editor } from "@/components/Editor";

// import { useRecoilValue } from "recoil";
import { useAuth } from "../../../context/AuthContext";
import { proposalSummariesGenerator } from "../../../lib/utils/proposalSummariesGenerator";
import shortenNumber from "../../../lib/utils/shortenNumber";
import { MemoizedMetaButton } from "../MetaButton";
import ProposalItem from "./ProposalItem/ProposalItem";
// import UserHeader from "./UserHeader/UserHeader";
// import { usernameState } from "../../../../../store/AuthAtoms";
// import shortenNumber from "../../../../../utils/shortenNumber";
// import HyperEditor from "../../../../Editor/HyperEditor/HyperEditorWrapper";
// import MetaButton from "../../../MetaButton/MetaButton";
// import proposalSummariesGenerator from "../proposalSummariesGenerator";
// import ProposalItem from "./ProposalItem/ProposalItem";
// import UserHeader from "./UserHeader/UserHeader";

// import "./ProposalsList.css";

// const doNothing = () => {};

dayjs.extend(relativeTime);

type ProposalsListProps = {
  proposals: any;
  setProposals: any;
  proposeNodeImprovement: any;
  fetchProposals: any;
  rateProposal: any;
  selectProposal: any;
  deleteProposal: any;
  editHistory: boolean;
  proposeNewChild: any;
  openProposal: any;
  isAdmin: any;
};

const ProposalsList = (props: ProposalsListProps) => {
  // console.log("ProposalsList", { props });
  const [user] = useAuth();

  const username = user.user?.uname;

  const rateProposalClick = useCallback(
    (proposal: any, proposalIdx: any, correct: any, wrong: any, award: any) => (event: any) =>
      props.rateProposal(event, props.proposals, props.setProposals, proposal.id, proposalIdx, correct, wrong, award),
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.rateProposal, props.proposals]
  );

  const deleteProposalClick = useCallback(
    (proposal: any, proposalIdx: any) => (event: any) =>
      props.deleteProposal(event, props.proposals, props.setProposals, proposal.id, proposalIdx),
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.deleteProposal, props.proposals]
  );

  // console.log("-> proposals", props.proposals);
  // console.log("props.openProposal ", props.proposals);

  return props.proposals.map((proposal: any, proposalIdx: number) => {
    const proposalSummaries = proposalSummariesGenerator(proposal);

    if ((props.editHistory && proposal.accepted) || (!props.editHistory && !proposal.accepted)) {
      if (props.openProposal === proposal.id) {
        let adminTooltip = "# of 1Admins who have awarded this proposal.";
        if (!props.isAdmin) {
          adminTooltip += " You cannot give this proposal an award, because you are not the 1Admin of this node.";
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
            {/* <UserHeader imageUrl={proposal.imageUrl} /> */}
            <Paper elevation={3} sx={{ display: "flex", padding: "10px 20px", flexDirection: "column" }}>
              <Box
                // className="secondary-content"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "5px",
                }}
              >
                <div className="title Time" style={{ fontSize: "12px" }}>
                  {dayjs(proposal.createdAt).fromNow()}
                </div>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <MemoizedMetaButton
                    onClick={rateProposalClick(proposal, proposalIdx, false, true, false)}
                    tooltip="Click if you find this proposal Unhelpful."
                    tooltipPosition="bottom-start"
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      {/* <i className={"material-icons " + (proposal.wrong ? "red-text" : "grey-text")}>close</i> */}
                      <CloseIcon className={proposal.wrong ? "red-text" : "grey-text"} fontSize="inherit"></CloseIcon>
                      <span>{shortenNumber(proposal.wrongs, 2, false)}</span>
                    </Box>
                  </MemoizedMetaButton>
                  <MemoizedMetaButton
                    onClick={rateProposalClick(proposal, proposalIdx, true, false, false)}
                    tooltip="Click if you find this proposal helpful."
                    tooltipPosition="bottom-start"
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      {/* <i
                      className={
                        proposal.correct ? "material-icons DoneIcon green-text" : "material-icons DoneIcon grey-text"
                      }
                    >
                      done
                    </i> */}
                      <DoneIcon className={proposal.correct ? "green-text" : "grey-text"} fontSize="inherit"></DoneIcon>
                      <span>{shortenNumber(proposal.corrects, 2, false)}</span>
                    </Box>
                  </MemoizedMetaButton>
                  <MemoizedMetaButton
                    onClick={
                      !props.isAdmin || proposal.proposer === username
                        ? false
                        : rateProposalClick(proposal, proposalIdx, false, false, true)
                    }
                    tooltip={adminTooltip}
                    tooltipPosition="bottom-start"
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      {/* <i className={"material-icons " + (proposal.award ? "amber-text" : "grey-text")}>grade</i> */}
                      <GradeIcon className={proposal.award ? "amber-text" : "grey-text"} fontSize="inherit"></GradeIcon>
                      <span>{shortenNumber(proposal.awards, 2, false)}</span>
                    </Box>
                  </MemoizedMetaButton>
                  {!proposal.accepted && proposal.proposer === username && (
                    <MemoizedMetaButton
                      onClick={deleteProposalClick(proposal, proposalIdx)}
                      tooltip="Delete your proposal."
                      tooltipPosition="bottom-start"
                    >
                      {/* <i className="material-icons grey-text">delete_forever</i> */}
                      <DeleteForeverIcon className="grey-text" fontSize="inherit"></DeleteForeverIcon>
                    </MemoizedMetaButton>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", flexGrow: "1" }}>
                <div className="title Time" style={{ fontSize: "12px" }}>
                  {/* <div className="title Username">{proposal.proposer}</div> */}
                  <div className="ProposalTitle" style={{ fontSize: "16px", fontWeight: "400" }}>
                    {proposal.title}
                  </div>
                </div>
                <div className="ProposalTitle">
                  {proposalSummaries.length > 0 ? (
                    proposalSummaries.map((prSummary: any, sIdx: number) => {
                      return (
                        <Box
                          component="p"
                          sx={{
                            margin: "0",
                            color: theme =>
                              theme.palette.mode === "light" ? theme.palette.common.black : theme.palette.common.white,
                          }}
                          key={"Summary" + proposal.id + sIdx}
                        >
                          {prSummary}
                        </Box>
                      );
                    })
                  ) : (
                    // <p>{proposal.summary}</p>
                    <Editor label="" readOnly value={proposal.summary} setValue={() => {}}></Editor>
                    // CHECK: I commented this, uncomment when build the editor please
                    // <HyperEditor readOnly={true} onChange={doNothing} content={proposal.summary} />
                  )}
                </div>
                <div className="ProposalBody">
                  {/* <HyperEditor readOnly={true} onChange={doNothing} content={proposal.proposal} /> */}
                  {/* <p>{proposal.proposal}</p> */}
                  <Editor label="" readOnly value={proposal.proposal} setValue={() => {}}></Editor>
                </div>
              </Box>
            </Paper>

            {/* <CommentsList proposal={proposal} /> */}
          </li>
        );
      } else {
        // THIS Show pending proposal and aproved proposals
        return (
          <Box key={proposal.id} sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <ProposalItem
              key={proposal.id}
              proposal={proposal}
              selectProposal={props.selectProposal}
              proposalSummaries={proposalSummaries}
              shouldSelectProposal={true}
              showTitle={true}
              // rateProposal={rateProposalClick(proposal, proposalIdx, true, false, false)}
            />
          </Box>
        );
      }
    }
  });
};

export default React.memo(ProposalsList);
