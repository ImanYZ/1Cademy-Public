// import "./ProposalItem.css";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import { Badge, Box, Button, Divider, Paper, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback } from "react";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import NodeTypeIcon from "@/components/NodeTypeIcon2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { proposalSummariesGenerator } from "../../../../lib/utils/proposalSummariesGenerator";
import shortenNumber from "../../../../lib/utils/shortenNumber";
import { Editor } from "../../../Editor";
import { ContainedButton } from "../../ContainedButton";

// import shortenNumber from "../../../../../../utils/shortenNumber";
// import HyperEditor from "../../../../../Editor/HyperEditor/HyperEditor";
// import MetaButton from "../../../../MetaButton/MetaButton";
// import proposalSummariesGenerator from "../../proposalSummariesGenerator";

const doNothing = () => {};

dayjs.extend(relativeTime);

type ProposalItemProps = {
  proposal: any;
  shouldSelectProposal?: boolean;
  showTitle: boolean;
  selectProposal?: any;
  openLinkedNode: any;
  proposalSummaries?: any;
  isClickable?: boolean;
  userVotesOnProposals?: { [key: string]: any };
  openComments?: (refId: string, type: string, proposal?: any) => void;
  commentNotifications?: any;
};

const ProposalItem = ({
  isClickable = true,
  userVotesOnProposals = {},
  proposal,
  shouldSelectProposal,
  showTitle,
  selectProposal,
  openLinkedNode,
  proposalSummaries,
  openComments,
  commentNotifications,
}: ProposalItemProps) => {
  const openLinkedNodeClick = useCallback(
    (proposal: any) => (event: any) => {
      if (shouldSelectProposal) {
        selectProposal(event, proposal, proposal.newNodeId);
      } else {
        openLinkedNode(proposal.node);
      }
    },
    []
    // [openLinkedNode, shouldSelectProposal, selectProposal]
  );

  let _proposalSummaries;

  if (proposalSummaries) {
    _proposalSummaries = proposalSummaries;
  } else {
    _proposalSummaries = proposalSummariesGenerator(proposal);
  }

  return (
    <Paper
      elevation={3}
      className="CollapsedProposal collection-item avatar"
      key={`Proposal${proposal.id}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: { xs: "5px 10px", sm: "15px" },
        borderRadius: "8px",
        boxShadow: theme =>
          theme.palette.mode === "light"
            ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)"
            : undefined,
        cursor: "auto!important",
        background: theme => (theme.palette.mode === "dark" ? "#242425" : "#F2F4F7"),
        ...(isClickable && {
          ":hover": {
            background: theme => (theme.palette.mode === "dark" ? "#2F2F2F" : "#EAECF0"),
          },
        }),
      }}
    >
      {/* <h6>{proposal.newNodeId}</h6> */}
      <Box>
        <Box>
          {showTitle && (
            <MarkdownRender
              text={proposal.title}
              customClass={"custom-react-markdown"}
              sx={{ fontWeight: 400, letterSpacing: "inherit" }}
            />
          )}
          {/* <p>Proposal Summary:</p> */}
          <Box
            sx={{
              paddingY: "10px",
            }}
          >
            {_proposalSummaries.length > 0
              ? _proposalSummaries.map((prSummary: string, prSummaryIdx: number) => {
                  return (
                    <Box
                      component="p"
                      sx={{
                        margin: "0px",
                        color: theme =>
                          theme.palette.mode === "light" ? theme.palette.common.black : theme.palette.common.white,
                      }}
                      key={"Summary" + proposal.id + prSummaryIdx}
                    >
                      {prSummary}
                    </Box>
                  );
                })
              : proposal.summary && <Editor label="" readOnly setValue={doNothing} value={proposal.summary} />}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                p: "2px 8px",

                borderRadius: "24px",
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray250,
              }}
            >
              <Tooltip title="# of 1Admins who have awarded this proposal." placement="bottom-start">
                <Box style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "16px" }}>
                  <DoneRoundedIcon
                    fontSize="small"
                    sx={{
                      color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467"),
                      fill:
                        userVotesOnProposals[proposal.id] && userVotesOnProposals[proposal.id].correct
                          ? "rgb(0, 211, 105)"
                          : "",
                    }}
                  />
                  <Typography
                    sx={{
                      color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467"),
                    }}
                  >
                    {shortenNumber(proposal.corrects, 2, false)}
                  </Typography>
                </Box>
              </Tooltip>
              <Divider
                orientation="vertical"
                variant="middle"
                flexItem
                sx={{
                  borderColor: DESIGN_SYSTEM_COLORS.notebookG300,
                }}
              />

              <Tooltip title="# of 1Admins who have awarded this proposal." placement="bottom-start">
                <Box style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "16px" }}>
                  <CloseRoundedIcon
                    fontSize="small"
                    sx={{
                      color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467"),
                      fill:
                        userVotesOnProposals[proposal.id] && userVotesOnProposals[proposal.id].wrong
                          ? "rgb(255, 29, 29)"
                          : "",
                    }}
                  />
                  <Typography
                    sx={{
                      color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467"),
                    }}
                  >
                    {shortenNumber(proposal.wrongs, 2, false)}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
            {openComments && (
              <ContainedButton
                title="Open comments"
                onClick={() =>
                  openComments(proposal.id, "version", {
                    id: proposal.id,
                    title: proposal.title,
                    node: proposal.node,
                    summary: proposal.summary,
                    _proposalSummaries: _proposalSummaries,
                    corrects: proposal.corrects,
                    wrongs: proposal.wrongs,
                    nodeType: proposal.nodeType,
                    createdAt: proposal.createdAt,
                  })
                }
                tooltipPosition="top"
                sx={{
                  background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
                  fontWeight: 400,
                  color: "inherit",
                  ":hover": {
                    borderWidth: "0px",
                    background: (theme: any) =>
                      theme.palette.mode === "dark"
                        ? theme.palette.common.darkBackground2
                        : theme.palette.common.lightBackground2,
                  },
                  padding: "7px 7px",
                  minWidth: "30px",
                  height: "30px",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit" }}>
                  <Badge
                    badgeContent={
                      commentNotifications.filter((notification: any) => notification.refId === proposal.id).length
                    }
                    color="error"
                  >
                    <ChatBubbleIcon sx={{ fontSize: "16px" }} />
                  </Badge>
                </Box>
              </ContainedButton>
            )}
          </Box>
          <Button
            sx={{ borderRadius: "20px" }}
            variant="contained"
            onClick={isClickable ? openLinkedNodeClick(proposal) : undefined}
          >
            Compare
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default React.memo(ProposalItem);
