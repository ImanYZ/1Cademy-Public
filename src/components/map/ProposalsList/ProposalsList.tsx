import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import GradeIcon from "@mui/icons-material/Grade";
import { Button, Paper, Tooltip, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback } from "react";

import { Editor } from "@/components/Editor";

import { useAuth } from "../../../context/AuthContext";
import { proposalSummariesGenerator } from "../../../lib/utils/proposalSummariesGenerator";
import shortenNumber from "../../../lib/utils/shortenNumber";
// import { MemoizedMetaButton } from "../MetaButton";
import ProposalItem from "./ProposalItem/ProposalItem";

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
  const [user] = useAuth();
  const theme = useTheme();

  const username = user.user?.uname;

  const rateProposalClick = useCallback(
    (proposal: any, proposalIdx: any, correct: any, wrong: any, award: any) => {
      console.log("proposal", proposal);
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
    (proposal: any, proposalIdx: any) =>
      props.deleteProposal(event, props.proposals, props.setProposals, proposal.id, proposalIdx),
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.deleteProposal, props.proposals]
  );

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
                  <Tooltip title={"Click if you find this proposal Unhelpful."} placement={"bottom-start"}>
                    <Button
                      onClick={() => rateProposalClick(proposal, proposalIdx, false, true, false)}
                      variant="contained"
                      size="small"
                      sx={{
                        borderRadius: "52px",
                        // padding: "0px 8px",
                        minWidth: "50px",
                        background: theme => (theme.palette.mode === "dark" ? "#4f5154" : "#dbd9d9"),
                        ":hover": {
                          background: theme => (theme.palette.mode === "dark" ? "#65696d" : "#b7b3b3"),
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {/* <i className={"material-icons " + (proposal.wrong ? "red-text" : "grey-text")}>close</i> */}

                        <CloseIcon
                          className={proposal.wrong ? "red-text" : "grey-text"}
                          fontSize="inherit"
                          sx={{
                            color:
                              theme.palette.mode === "dark"
                                ? theme.palette.common.white
                                : theme.palette.common.darkGrayBackground,
                          }}
                        ></CloseIcon>
                        <span
                          style={{
                            color:
                              theme.palette.mode === "dark"
                                ? theme.palette.common.white
                                : theme.palette.common.darkGrayBackground,
                          }}
                          className="grey-text"
                        >
                          {shortenNumber(proposal.wrongs, 2, false)}
                        </span>
                      </Box>
                    </Button>
                  </Tooltip>

                  <Tooltip title={"Click if you find this proposal helpful."} placement={"bottom-start"}>
                    <Button
                      size="small"
                      onClick={() => rateProposalClick(proposal, proposalIdx, true, false, false)}
                      variant="contained"
                      sx={{
                        borderRadius: "52px",
                        //padding: "0px 8px",
                        minWidth: "50px",
                        background: theme => (theme.palette.mode === "dark" ? "#4f5154" : "#dbd9d9"),
                        ":hover": {
                          background: theme => (theme.palette.mode === "dark" ? "#65696d" : "#b7b3b3"),
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {/* <i
                      className={
                        proposal.correct ? "material-icons DoneIcon green-text" : "material-icons DoneIcon grey-text"
                      }
                    >
                      done
                    </i> */}
                        <DoneIcon
                          className={proposal.correct ? "green-text" : "grey-text"}
                          fontSize="inherit"
                          sx={{
                            color:
                              theme.palette.mode === "dark"
                                ? theme.palette.common.white
                                : theme.palette.common.darkGrayBackground,
                          }}
                        ></DoneIcon>
                        <span
                          style={{
                            color:
                              theme.palette.mode === "dark"
                                ? theme.palette.common.white
                                : theme.palette.common.darkGrayBackground,
                          }}
                        >
                          {shortenNumber(proposal.corrects, 2, false)}
                        </span>
                      </Box>
                    </Button>
                  </Tooltip>

                  <Tooltip title={adminTooltip} placement={"bottom-start"}>
                    <Button
                      onClick={() => {
                        !props.isAdmin || proposal.proposer === username
                          ? false
                          : rateProposalClick(proposal, proposalIdx, false, false, true);
                      }}
                      disabled={!props.isAdmin || proposal.proposer === username}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: "52px",
                        // padding: "0px 8px",
                        minWidth: "50px",
                        background: theme => (theme.palette.mode === "dark" ? "#4f5154" : "#dbd9d9"),
                        ":hover": {
                          background: theme => (theme.palette.mode === "dark" ? "#65696d" : "#b7b3b3"),
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {/* <i className={"material-icons " + (proposal.award ? "amber-text" : "grey-text")}>grade</i> */}
                        <GradeIcon
                          className={proposal.award ? "amber-text" : "grey-text"}
                          fontSize="inherit"
                          sx={{
                            color:
                              theme.palette.mode === "dark"
                                ? !props.isAdmin || proposal.proposer === username
                                  ? "dimgrey"
                                  : undefined
                                : !props.isAdmin || proposal.proposer === username
                                ? "rgba(0, 0, 0, 0.26)"
                                : undefined,
                          }}
                        ></GradeIcon>
                        <span
                          className="grey-text"
                          style={{
                            color:
                              theme.palette.mode === "dark"
                                ? !props.isAdmin || proposal.proposer === username
                                  ? "dimgrey"
                                  : undefined
                                : !props.isAdmin || proposal.proposer === username
                                ? "rgba(0, 0, 0, 0.26)"
                                : undefined,
                          }}
                        >
                          {shortenNumber(proposal.awards, 2, false)}
                        </span>
                      </Box>
                    </Button>
                  </Tooltip>
                  {!proposal.accepted && proposal.proposer === username && (
                    <Tooltip title={"Delete your proposal"} placement={"bottom-start"}>
                      <Button
                        onClick={() => deleteProposalClick(proposal, proposalIdx)}
                        variant="outlined"
                        sx={{ borderRadius: "52px", padding: "0px", minWidth: "50px", border: "solid 1px #585858" }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", paddingY: "5px" }}>
                          <DeleteForeverIcon className="grey-text" fontSize="inherit" />
                        </Box>
                      </Button>
                    </Tooltip>
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
                </div>
                <div className="ProposalBody">
                  <Editor label="" readOnly value={proposal.proposal} setValue={() => {}}></Editor>
                </div>
              </Box>
            </Paper>
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
            />
          </Box>
        );
      }
    }
  });
};

export default React.memo(ProposalsList);
