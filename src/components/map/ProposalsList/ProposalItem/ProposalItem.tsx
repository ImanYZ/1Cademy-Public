// import "./ProposalItem.css";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Box, Divider, Paper, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback } from "react";

import NodeTypeIcon from "@/components/NodeTypeIcon2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { proposalSummariesGenerator } from "../../../../lib/utils/proposalSummariesGenerator";
import shortenNumber from "../../../../lib/utils/shortenNumber";
import { Editor } from "../../../Editor";

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
};

const ProposalItem = ({ isClickable = true, ...props }: ProposalItemProps) => {
  const openLinkedNodeClick = useCallback(
    (proposal: any) => (event: any) => {
      if (props.shouldSelectProposal) {
        props.selectProposal(event, proposal, proposal.newNodeId);
      } else {
        props.openLinkedNode(proposal.node);
      }
    },
    [props]
    // [props.openLinkedNode, props.shouldSelectProposal, props.selectProposal]
  );

  let proposalSummaries;

  if (props.proposalSummaries) {
    proposalSummaries = props.proposalSummaries;
  } else {
    proposalSummaries = proposalSummariesGenerator(props.proposal);
  }

  return (
    <Paper
      elevation={3}
      className="CollapsedProposal collection-item avatar"
      key={`Proposal${props.proposal.id}`}
      onClick={isClickable ? openLinkedNodeClick(props.proposal) : undefined}
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: { xs: "5px 10px", sm: "15px" },
        borderRadius: "8px",
        boxShadow: theme =>
          theme.palette.mode === "light"
            ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)"
            : undefined,
        background: theme => (theme.palette.mode === "dark" ? "#242425" : "#F2F4F7"),
        ...(isClickable && {
          cursor: "pointer",
          ":hover": {
            background: theme => (theme.palette.mode === "dark" ? "#2F2F2F" : "#EAECF0"),
          },
        }),
      }}
    >
      {/* <h6>{props.proposal.newNodeId}</h6> */}
      <Box>
        <Box>
          {props.showTitle && (
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: "500",
                lineHeight: "24px",
              }}
            >
              {props.proposal.title}
            </Typography>
          )}
          {/* <p>Proposal Summary:</p> */}
          <Box
            sx={{
              paddingY: "10px",
            }}
          >
            {proposalSummaries.length > 0
              ? proposalSummaries.map((prSummary: string, prSummaryIdx: number) => {
                  return (
                    <Box
                      component="p"
                      sx={{
                        margin: "0px",
                        color: theme =>
                          theme.palette.mode === "light" ? theme.palette.common.black : theme.palette.common.white,
                      }}
                      key={"Summary" + props.proposal.id + prSummaryIdx}
                    >
                      {prSummary}
                    </Box>
                  );
                })
              : props.proposal.summary && (
                  <Editor label="" readOnly setValue={doNothing} value={props.proposal.summary} />
                )}
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
              <NodeTypeIcon nodeType={props.proposal.nodeType || ""} fontSize="inherit" />
            </Box>
            <Box
              sx={{
                fontSize: "12px",
                marginLeft: "5px",
                color: theme => (theme.palette.mode === "dark" ? "#A4A4A4" : "#667085"),
              }}
            >
              {dayjs(props.proposal.createdAt).fromNow()}
            </Box>
          </Box>
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
                  sx={{ color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467") }}
                />
                <Typography
                  sx={{
                    color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467"),
                  }}
                >
                  {shortenNumber(props.proposal.corrects, 2, false)}
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
                  sx={{ color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467") }}
                />
                <Typography
                  sx={{
                    color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467"),
                  }}
                >
                  {shortenNumber(props.proposal.wrongs, 2, false)}
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
                <StarRoundedIcon
                  fontSize="small"
                  sx={{ color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467") }}
                />
                <Typography
                  sx={{
                    color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467"),
                  }}
                >
                  {shortenNumber(props.proposal.awards, 2, false)}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default React.memo(ProposalItem);
