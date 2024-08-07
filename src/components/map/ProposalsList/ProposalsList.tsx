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
import MarkdownRender from "@/components/Markdown/MarkdownRender";
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
  rateProposal: any;
  selectProposal: any;
  deleteProposal: any;
  editHistory: boolean;
  proposeNewChild: any;
  openProposal: string;
  username: string;
  ratingProposal: boolean;
  userVotesOnProposals: { [key: string]: { wrong: boolean; correct: boolean } };
  setUserVotesOnProposals: any;
  openComments?: (refId: string, type: string, proposal?: any) => void;
  commentNotifications?: any;
};

const ProposalsList = ({
  proposals,
  setProposals,
  rateProposal,
  selectProposal,
  deleteProposal,
  editHistory,
  openProposal,
  username,
  ratingProposal,
  userVotesOnProposals,
  setUserVotesOnProposals,
  openComments,
  commentNotifications,
}: ProposalsListProps) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const { confirmIt, ConfirmDialog } = useConfirmationDialog();
  const rateProposalClick = useCallback(
    (proposal: INodeVersion, proposalIdx: number, correct: boolean, wrong: boolean, award: boolean) => {
      return rateProposal({
        proposals: proposals,
        setProposals: setProposals,
        userVotesOnProposals,
        setUserVotesOnProposals,
        proposalId: proposal.id,
        proposalIdx: proposalIdx,
        correct: correct,
        wrong: wrong,
        award: award,
        newNodeId: proposal.newNodeId,
      });
    },
    [proposals, rateProposal, setProposals, setUserVotesOnProposals, userVotesOnProposals]
  );

  const deleteProposalClick = useCallback(
    async (proposal: any, proposalIdx: any) => {
      let deleteOK: any = false;
      deleteOK = await confirmIt(
        "You are going to permanently delete this proposal. Are you sure?",
        "Delete Proposal",
        "Keep Proposal"
      );
      if (!deleteOK) return;

      setIsDeleting(true);
      await deleteProposal(event, proposals, setProposals, proposal.id, proposalIdx);
      setIsDeleting(false);
    },
    [deleteProposal, proposals, setProposals]
  );

  // const shouldDisableButton = (proposal: any, isAdmin: boolean, username: string) => {
  //   return !isAdmin || proposal.proposer === username;
  // };

  return (
    <Box>
      {proposals.map((proposal: any, proposalIdx: number) => {
        const proposalSummaries = proposalSummariesGenerator(proposal);
        // const isDisabled = shouldDisableButton(proposal, isAdmin, username);

        if ((editHistory && proposal.accepted) || (!editHistory && !proposal.accepted)) {
          if (openProposal === proposal.id) {
            // this will display selected proposal
            return (
              <Box key={proposal.id} sx={{ display: "flex", flexDirection: "column", mt: "5px" }}>
                <SelectedProposalItem
                  key={proposal.id}
                  deleteProposalClick={deleteProposalClick}
                  isDeleting={isDeleting}
                  proposal={proposal}
                  proposalIdx={proposalIdx}
                  proposalSummaries={proposalSummaries}
                  rateProposalClick={rateProposalClick}
                  selectProposal={selectProposal}
                  ratingProposal={ratingProposal}
                  username={username}
                  userVotesOnProposals={userVotesOnProposals}
                />
              </Box>
            );
          } else {
            // THIS Show pending proposal and approved proposals
            return (
              <Box key={proposal.id} sx={{ display: "flex", flexDirection: "column", mt: "5px" }}>
                <ProposalItem
                  key={proposal.id}
                  proposal={proposal}
                  selectProposal={selectProposal}
                  proposalSummaries={proposalSummaries}
                  shouldSelectProposal={true}
                  showTitle={true}
                  openLinkedNode={() => {}}
                  userVotesOnProposals={userVotesOnProposals}
                  openComments={openComments}
                  commentNotifications={commentNotifications}
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
  ratingProposal: boolean;
  userVotesOnProposals: { [key: string]: { wrong: boolean; correct: boolean } };
};

const SelectedProposalItem = ({
  proposal,
  proposalSummaries,
  rateProposalClick,
  proposalIdx,
  deleteProposalClick,
  username,
  isDeleting,
  ratingProposal,
  userVotesOnProposals,
}: SelectedProposalItemType) => {
  const canRemoveProposal = useMemo(
    () => !isDeleting && !proposal.accepted && proposal.proposer === username,
    [isDeleting, proposal.accepted, proposal.proposer, username]
  );
  const upVoteProposal = (e: any) => {
    e.stopPropagation();

    rateProposalClick(proposal, proposalIdx, true, false, false);
  };
  const downVoteProposal = (e: any) => {
    e.stopPropagation();
    rateProposalClick(proposal, proposalIdx, false, true, false);
  };

  return (
    <Paper
      key={`Proposal${proposal.id}`}
      elevation={3}
      sx={{
        display: "flex",
        padding: "15px",
        flexDirection: "column",
        position: "relative",
        border: "2px solid #ff8a33",
        cursor: "auto!important",
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
          <MarkdownRender
            text={proposal.title}
            customClass={"custom-react-markdown"}
            sx={{ fontWeight: 400, letterSpacing: "inherit" }}
          />
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
        {proposal.proposal.trim() && <Typography sx={{ mb: "5px" }}>Explanation: {proposal.proposal}</Typography>}
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
              onClick={upVoteProposal}
              sx={{
                borderRadius: "52px 0px 0px 52px",
                background: theme => (theme.palette.mode === "dark" ? "#404040" : "#E1E4E9"),
                ":hover": {
                  borderWidth: "0px",
                  background: theme => (theme.palette.mode === "dark" ? "#4E4D4D" : "#D0D5DD"),
                },
              }}
              disabled={ratingProposal}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit" }}>
                <DoneIcon
                  sx={{
                    fill:
                      userVotesOnProposals[proposal.id] && userVotesOnProposals[proposal.id].correct
                        ? "rgb(0, 211, 105)"
                        : "inherit",
                    fontSize: "19px",
                  }}
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
              title="Click if you find this proposal Unhelpful."
              onClick={downVoteProposal}
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
                    fill:
                      userVotesOnProposals[proposal.id] && userVotesOnProposals[proposal.id].wrong
                        ? "rgb(255, 29, 29)"
                        : "inherit",
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
  );
};

export default React.memo(ProposalsList);
