import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import GradeIcon from "@mui/icons-material/Grade";
import { Divider, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback } from "react";

import { Editor } from "@/components/Editor";
import NodeTypeIcon from "@/components/NodeTypeIcon2";

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
  const rateProposalClick = useCallback(
    (e: any, proposal: any, proposalIdx: any, correct: any, wrong: any, award: any) => {
      return props.rateProposal(
        e,
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

  // const deleteProposalClick = useCallback(
  //   async (proposal: any, proposalIdx: any) => {
  //     let deleteOK = false;
  //     deleteOK = window.confirm("You are going to permanently delete this proposal. Are you sure?");
  //     if (!deleteOK) return;

  //     setIsDeleting(true);
  //     await props.deleteProposal(event, props.proposals, props.setProposals, proposal.id, proposalIdx);
  //     setIsDeleting(false);
  //   },
  //   // TODO: >heck dependencies to remove eslint-disable-next-line
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [props.deleteProposal, props.proposals]
  // );

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
                <Paper
                  onClick={(e: any) => props.selectProposal(e, "", null)}
                  elevation={3}
                  sx={{
                    display: "flex",
                    padding: "15px",
                    flexDirection: "column",
                    position: "relative",
                    border: "2px solid #ff8a33",
                    ":hover": {
                      boxShadow: theme =>
                        theme.palette.mode === "dark"
                          ? "0px 1px 2px rgba(16, 24, 40, 0.05), 0px 0px 0px 4px #62544B"
                          : "0px 1px 2px rgba(16, 24, 40, 0.05), 0px 0px 0px 4px #ECCFBD",
                    },
                    background: theme => (theme.palette.mode === "dark" ? "#242425" : "#F2F4F7"),
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column", flexGrow: "1" }}>
                    <Box className="title Time" sx={{ fontSize: "12px" }}>
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontWeight: "500",
                          lineHeight: "24px",
                        }}
                      >
                        {proposal.title}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        paddingY: "10px",
                      }}
                    >
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
                    </Box>
                    <Box className="ProposalBody">
                      <Editor label="" readOnly value={proposal.proposal} setValue={() => {}}></Editor>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: theme => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <NodeTypeIcon nodeType={proposal.nodeType || ""} fontSize="inherit" />
                      </Box>
                      <Box
                        sx={{
                          fontSize: "12px",
                          marginLeft: "5px",
                          color: theme => (theme.palette.mode === "dark" ? "#A4A4A4" : "#667085"),
                        }}
                      >
                        {dayjs(proposal.createdAt).fromNow()}
                      </Box>
                    </Box>
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          background: theme => (theme.palette.mode === "dark" ? "#404040" : "#E1E4E9"),
                          borderRadius: "52px",
                          marginLeft: "15px",
                        }}
                      >
                        <ContainedButton
                          title="Click if you find this proposal Unhelpful."
                          onClick={(e: any) => {
                            e.stopPropagation();
                            rateProposalClick(e, proposal, proposalIdx, false, true, false);
                          }}
                          sx={{
                            borderRadius: "52px 0px 0px 52px",
                            background: theme => (theme.palette.mode === "dark" ? "#404040" : "#E1E4E9"),
                            ":hover": {
                              borderWidth: "0px",
                              background: theme => (theme.palette.mode === "dark" ? "#4E4D4D" : "#D0D5DD"),
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit" }}>
                            <DoneIcon
                              sx={{ fill: proposal.correct ? "rgb(0, 211, 105)" : "inherit", fontSize: "19px" }}
                            />
                            <Typography
                              sx={{
                                color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467"),
                                mt: "3px",
                              }}
                            >
                              {shortenNumber(proposal.corrects, 2, false)}
                            </Typography>
                          </Box>
                        </ContainedButton>
                        <Divider
                          orientation="vertical"
                          variant="middle"
                          flexItem
                          sx={{ borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit") }}
                        />
                        <ContainedButton
                          title="Click if you find this proposal helpful."
                          onClick={(e: any) => {
                            e.stopPropagation();
                            rateProposalClick(e, proposal, proposalIdx, true, false, false);
                          }}
                          sx={{
                            borderRadius: "0px",
                            background: theme => (theme.palette.mode === "dark" ? "#404040" : "#E1E4E9"),
                            ":hover": {
                              borderWidth: "0px",
                              background: theme => (theme.palette.mode === "dark" ? "#4E4D4D" : "#D0D5DD"),
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit" }}>
                            <CloseIcon
                              sx={{
                                fill: proposal.wrong ? "rgb(255, 29, 29)" : "inherit",
                                fontSize: "19px",
                                color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467"),
                              }}
                            />
                            <Typography
                              sx={{
                                color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467"),
                                mt: "3px",
                              }}
                            >
                              {shortenNumber(proposal.wrongs, 2, false)}
                            </Typography>
                          </Box>
                        </ContainedButton>
                        <Divider
                          orientation="vertical"
                          variant="middle"
                          flexItem
                          sx={{ borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit") }}
                        />
                        <ContainedButton
                          title={adminTooltip}
                          onClick={(e: any) => {
                            e.stopPropagation();
                            !props.isAdmin || proposal.proposer === username
                              ? false
                              : rateProposalClick(e, proposal, proposalIdx, false, false, true);
                          }}
                          disabled={isDisabled}
                          sx={{
                            borderRadius: "0px 52px 52px 0px",
                            background: theme => (theme.palette.mode === "dark" ? "#404040" : "#E1E4E9"),
                            ":hover": {
                              borderWidth: "0px",
                              background: theme => (theme.palette.mode === "dark" ? "#4E4D4D" : "#D0D5DD"),
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit" }}>
                            <GradeIcon
                              sx={{ fill: proposal.award ? "rgb(255, 166, 0)" : "inherit", fontSize: "19px" }}
                            />
                            <Typography
                              sx={{
                                color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467"),
                                mt: "3px",
                              }}
                            >
                              {shortenNumber(proposal.awards, 2, false)}
                            </Typography>
                          </Box>
                        </ContainedButton>
                      </Box>
                    </Box>
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
                  openLinkedNode={() => {}}
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
