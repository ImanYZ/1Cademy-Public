import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import GradeIcon from "@mui/icons-material/Grade";
import { CircularProgress, Paper } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback, useState } from "react";

import { Editor } from "@/components/Editor";

import { proposalSummariesGenerator } from "../../../lib/utils/proposalSummariesGenerator";
import shortenNumber from "../../../lib/utils/shortenNumber";
import { ContainedButton } from "../ContainedButton";
// import { MemoizedMetaButton } from "../MetaButton";
import ProposalItem from "./ProposalItem/ProposalItem";

dayjs.extend(relativeTime);

type ProposalsListProps = {
  proposals: any[];
  setProposals: any;
  proposeNodeImprovement: any;
  fetchProposals: any;
  rateProposal: any;
  selectProposal: any;
  deleteProposal: any;
  editHistory: boolean;
  proposeNewChild: any;
  openProposal: any;
  isAdmin: boolean;
  username: string;
};

const ProposalsList = ({ username, ...props }: ProposalsListProps) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const rateProposalClick = useCallback(
    (proposal: any, proposalIdx: any, correct: any, wrong: any, award: any) => {
      return props.rateProposal(
        event,
        props.proposals,
        props.setProposals,
        proposal.id,
        proposalIdx,
        correct,
        wrong,
        award,
        proposal.newNodeId
      );
    },
    [props]
  );

  const deleteProposalClick = useCallback(
    async (proposal: any, proposalIdx: any) => {
      let deleteOK = false;
      deleteOK = window.confirm("You are going to permanently delete this proposal. Are you sure?");
      if (!deleteOK) return;

      setIsDeleting(true);
      await props.deleteProposal(event, props.proposals, props.setProposals, proposal.id, proposalIdx);
      setIsDeleting(false);
    },
    // TODO: >heck dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.deleteProposal, props.proposals]
  );

  const shouldDisableButton = (proposal: any, isAdmin: boolean, username: string) => {
    return !isAdmin || proposal.proposer === username;
  };

  return (
    <>
      {props.proposals.map((proposal: any, proposalIdx: number) => {
        const proposalSummaries = proposalSummariesGenerator(proposal);
        const isDisabled = shouldDisableButton(proposal, props.isAdmin, username);

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
                <Paper elevation={3} sx={{ display: "flex", padding: "10px 20px", flexDirection: "column" }}>
                  <Box
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
                      <ContainedButton
                        title="Click if you find this proposal Unhelpful."
                        onClick={() => rateProposalClick(proposal, proposalIdx, false, true, false)}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit" }}>
                          <CloseIcon
                            fontSize="inherit"
                            sx={{ fill: proposal.wrong ? "rgb(255, 29, 29)" : "inherit" }}
                          />
                          <span style={{ color: "inherit" }}>{shortenNumber(proposal.wrongs, 2, false)}</span>
                        </Box>
                      </ContainedButton>

                      <ContainedButton
                        title="Click if you find this proposal helpful."
                        onClick={() => rateProposalClick(proposal, proposalIdx, true, false, false)}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit" }}>
                          <DoneIcon
                            fontSize="inherit"
                            sx={{ fill: proposal.correct ? "rgb(0, 211, 105)" : "inherit" }}
                          />
                          <span style={{ color: "inherit" }}>{shortenNumber(proposal.corrects, 2, false)}</span>
                        </Box>
                      </ContainedButton>

                      <ContainedButton
                        title={adminTooltip}
                        onClick={() => {
                          !props.isAdmin || proposal.proposer === username
                            ? false
                            : rateProposalClick(proposal, proposalIdx, false, false, true);
                        }}
                        disabled={isDisabled}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit" }}>
                          <GradeIcon
                            fontSize="inherit"
                            sx={{ fill: proposal.award ? "rgb(255, 166, 0)" : "inherit" }}
                          />
                          <span style={{ color: "inherit" }}>{shortenNumber(proposal.awards, 2, false)}</span>
                        </Box>
                      </ContainedButton>
                      {isDeleting && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit", paddingY: "5px" }}
                        >
                          <CircularProgress size={24} />
                        </Box>
                      )}
                      {!isDeleting && !proposal.accepted && proposal.proposer === username && (
                        <ContainedButton
                          title={"Delete your proposal"}
                          onClick={() => deleteProposalClick(proposal, proposalIdx)}
                        >
                          <Box
                            sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit", paddingY: "5px" }}
                          >
                            <DeleteForeverIcon fontSize="inherit" sx={{ fill: "inherit" }} />
                          </Box>
                        </ContainedButton>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", flexGrow: "1" }}>
                    <div className="title Time" style={{ fontSize: "12px" }}>
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
                                  theme.palette.mode === "light"
                                    ? theme.palette.common.black
                                    : theme.palette.common.white,
                              }}
                              key={"Summary" + proposal.id + sIdx}
                            >
                              {prSummary}
                            </Box>
                          );
                        })
                      ) : (
                        <Editor label="" readOnly value={proposal.summary} setValue={() => {}}></Editor>
                      )}
                    </div>
                    <div className="ProposalBody">
                      <Editor label="" readOnly value={proposal.proposal} setValue={() => {}}></Editor>
                    </div>
                  </Box>
                </Paper>
              </li>
            );
          } else {
            // THIS Show pending proposal and approved proposals
            return (
              <Box key={proposal.id} sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <ProposalItem
                  key={proposal.id}
                  proposal={proposal}
                  selectProposal={props.selectProposal}
                  proposalSummaries={proposalSummaries}
                  shouldSelectProposal={true}
                  showTitle={true}
                />
              </Box>
            );
          }
        }
      })}
    </>
  );
};

export default React.memo(ProposalsList);
