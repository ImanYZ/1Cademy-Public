import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import { Divider, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback, useMemo, useState } from "react";
import { INodeVersion } from "src/types/INodeVersion";

import { Editor } from "@/components/Editor";
import NodeTypeIcon from "@/components/NodeTypeIcon2";
import useConfirmationDialog from "@/hooks/useConfirmDialog";

import { proposalSummariesGenerator } from "../../../lib/utils/proposalSummariesGenerator";
import shortenNumber from "../../../lib/utils/shortenNumber";
import { ContainedButton } from "../ContainedButton";
// import { MemoizedMetaButton } from "../MetaButton";
import ProposalItem from "./ProposalItem/ProposalItem";

dayjs.extend(relativeTime);

type ProposalsListProps = {
  proposals: INodeVersion[];
  setProposals: any;
  proposeNodeImprovement: any;
  fetchProposals: any;
  rateProposal: any;
  selectProposal: any;
  deleteProposal: any;
  editHistory: boolean;
  proposeNewChild: any;
  openProposal: string;
  isAdmin: boolean;
  username: string;
  ratingProposale: boolean;
};

const ProposalsList = ({ deleteProposal, ratingProposale, ...props }: ProposalsListProps) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const { confirmIt, ConfirmDialog } = useConfirmationDialog();
  const rateProposalClick = useCallback(
    (proposal: INodeVersion, proposalIdx: number, correct: boolean, wrong: boolean, award: boolean) => {
      return props.rateProposal({
        proposals: props.proposals,
        setProposals: props.setProposals,
        proposalId: proposal.id,
        proposalIdx: proposalIdx,
        correct: correct,
        wrong: wrong,
        award: award,
        newNodeId: proposal.newNodeId,
      });
    },
    [props]
  );

  const deleteProposalClick = useCallback(
    async (proposal: any, proposalIdx: any) => {
      let deleteOK: any = false;
      deleteOK = await confirmIt("You are going to permanently delete this proposal. Are you sure?");
      if (!deleteOK) return;

      setIsDeleting(true);
      await deleteProposal(event, props.proposals, props.setProposals, proposal.id, proposalIdx);
      setIsDeleting(false);
    },
    [deleteProposal, props.proposals, props.setProposals]
  );

  // const shouldDisableButton = (proposal: any, isAdmin: boolean, username: string) => {
  //   return !isAdmin || proposal.proposer === username;
  // };

  return (
    <Box>
      {props.proposals.map((proposal: any, proposalIdx: number) => {
        const proposalSummaries = proposalSummariesGenerator(proposal);
        // const isDisabled = shouldDisableButton(proposal, props.isAdmin, username);

        if ((props.editHistory && proposal.accepted) || (!props.editHistory && !proposal.accepted)) {
          if (props.openProposal === proposal.id) {
            // this will display selected proposal
            return (
              <SelectedProposalItem
                key={proposal.id}
                deleteProposalClick={deleteProposalClick}
                isDeleting={isDeleting}
                proposal={proposal}
                proposalIdx={proposalIdx}
                proposalSummaries={proposalSummaries}
                rateProposalClick={rateProposalClick}
                selectProposal={props.selectProposal}
                ratingProposale={ratingProposale}
                username={props.username}
              />
            );
          } else {
            // THIS Show pending proposal and approved proposals
            return (
              <Box key={proposal.id} sx={{ display: "flex", flexDirection: "column", gap: "4px", mt: "5px" }}>
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
      {ConfirmDialog}
    </Box>
  );
};

type SelectedProposalItemType = {
  proposal: any;
  selectProposal: any;
  proposalSummaries: string[];
  rateProposalClick: any;
  proposalIdx: number;
  deleteProposalClick: any;
  username: string;
  isDeleting: boolean;
  ratingProposale: boolean;
};

const SelectedProposalItem = ({
  proposal,
  selectProposal,
  proposalSummaries,
  rateProposalClick,
  proposalIdx,
  deleteProposalClick,
  username,
  isDeleting,
  ratingProposale,
}: SelectedProposalItemType) => {
  const canRemoveProposal = useMemo(
    () => !isDeleting && !proposal.accepted && proposal.proposer === username,
    [isDeleting, proposal.accepted, proposal.proposer, username]
  );
  const upvoteProposal = (e: any) => {
    e.stopPropagation();
    rateProposalClick(proposal, proposalIdx, true, false, false);
  };

  return (
    <li className="collection-item avatar" key={`Proposal${proposal.id}`}>
      <Paper
        onClick={(e: any) => selectProposal(e, "", null)}
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
                        theme.palette.mode === "light" ? theme.palette.common.black : theme.palette.common.white,
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
                title="Click if you find this proposal helpful."
                onClick={upvoteProposal}
                sx={{
                  borderRadius: "52px 0px 0px 52px",
                  background: theme => (theme.palette.mode === "dark" ? "#404040" : "#E1E4E9"),
                  ":hover": {
                    borderWidth: "0px",
                    background: theme => (theme.palette.mode === "dark" ? "#4E4D4D" : "#D0D5DD"),
                  },
                }}
                disabled={ratingProposale}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit" }}>
                  <DoneIcon sx={{ fill: proposal.correct ? "rgb(0, 211, 105)" : "inherit", fontSize: "19px" }} />
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
                title="Click if you find this proposal Unhelpful."
                onClick={(e: any) => {
                  e.stopPropagation();
                  rateProposalClick(proposal, proposalIdx, false, true, false);
                }}
                sx={{
                  borderRadius: canRemoveProposal ? "0px" : "0px 52px 52px 0px",
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

              {canRemoveProposal && (
                <React.Fragment>
                  <Divider
                    orientation="vertical"
                    variant="middle"
                    flexItem
                    sx={{ borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit") }}
                  />
                  <ContainedButton
                    title={"Delete your proposal"}
                    onClick={() => deleteProposalClick(proposal, proposalIdx)}
                    // disabled={isDisabled}
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
                      <DeleteIcon sx={{ fill: "inherit", fontSize: "19px" }} />
                    </Box>
                  </ContainedButton>
                </React.Fragment>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </li>
  );
};

export default React.memo(ProposalsList);
