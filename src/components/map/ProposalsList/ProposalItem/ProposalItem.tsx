// import "./ProposalItem.css";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import GradeIcon from "@mui/icons-material/Grade";
import { Box, Button, Divider, Paper, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback } from "react";

import NodeTypeIcon from "@/components/NodeTypeIcon2";

import { proposalSummariesGenerator } from "../../../../lib/utils/proposalSummariesGenerator";
import shortenNumber from "../../../../lib/utils/shortenNumber";
import { Editor } from "../../../Editor";

// import shortenNumber from "../../../../../../utils/shortenNumber";
// import HyperEditor from "../../../../../Editor/HyperEditor/HyperEditor";
// import MetaButton from "../../../../MetaButton/MetaButton";
// import proposalSummariesGenerator from "../../proposalSummariesGenerator";

const doNothing = () => {};

dayjs.extend(relativeTime);

const ProposalItem = (props: any) => {
  const openLinkedNodeClick = useCallback(
    (proposal: any) => (event: any) => {
      if (props.shouldSelectProposal) {
        props.selectProposal(event, proposal, proposal.newNodeId);
      } else {
        props.openLinkedNode(proposal.node);
      }
    },
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.openLinkedNode, props.shouldSelectProposal, props.selectProposal]
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
      onClick={openLinkedNodeClick(props.proposal)}
      sx={{
        ":hover": {
          background: theme => (theme.palette.mode === "dark" ? "#2F2F2F" : "#EAECF0"),
        },

        display: "flex",
        flexDirection: "column",
        padding: {
          xs: "5px 10px",
          sm: "15px",
        },
        borderRadius: "8px",
        boxShadow: theme =>
          theme.palette.mode === "light"
            ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)"
            : undefined,
        background: theme => (theme.palette.mode === "dark" ? "#242425" : "#F2F4F7"),
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "16px",
              marginRight: "9px",
            }}
          >
            <Tooltip title="# of 1Cademists who have found this proposal helpful." placement="bottom-start">
              <Button
                sx={{
                  padding: "0",
                  minWidth: "0",
                  ":hover": {
                    background: "transparent",
                  },
                }}
              >
                <Box style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "16px" }}>
                  <DoneIcon
                    className={props.proposal.correct ? "green-text" : "grey-text"}
                    sx={{ fontSize: "19px", color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467") }}
                  />
                  <Typography
                    sx={{
                      color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467"),
                      mt: "3px",
                    }}
                  >
                    {shortenNumber(props.proposal.corrects, 2, false)}
                  </Typography>
                </Box>
              </Button>
            </Tooltip>
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{ borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit") }}
            />
            <Tooltip title="# of 1Cademists who have found this proposal unhelpful." placement="bottom-start">
              <Button
                sx={{
                  padding: "0",
                  minWidth: "0",
                  ":hover": {
                    background: "transparent",
                  },
                }}
              >
                <Box style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "16px" }}>
                  <CloseIcon
                    className={props.proposal.wrong ? "red-text" : "grey-text"}
                    sx={{ fontSize: "19px", color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467") }}
                  />
                  <Typography
                    sx={{
                      color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467"),
                      mt: "3px",
                    }}
                  >
                    {shortenNumber(props.proposal.wrongs, 2, false)}
                  </Typography>
                </Box>
              </Button>
            </Tooltip>

            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{ borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit") }}
            />

            <Tooltip title="# of 1Admins who have awarded this proposal." placement="bottom-start">
              <Button
                sx={{
                  padding: "0",
                  minWidth: "0",
                  ":hover": {
                    background: "transparent",
                  },
                }}
              >
                <Box style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "16px" }}>
                  <GradeIcon
                    className={props.proposal.award ? "amber-text" : "grey-text"}
                    sx={{ fontSize: "19px", color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467") }}
                  />
                  <Typography
                    sx={{
                      color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467"),
                      mt: "3px",
                    }}
                  >
                    {shortenNumber(props.proposal.awards, 2, false)}
                  </Typography>
                </Box>
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default React.memo(ProposalItem);
