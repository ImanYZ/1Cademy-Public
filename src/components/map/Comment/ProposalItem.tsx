import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import { Box, Divider, Paper, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useRef } from "react";

import { Editor } from "@/components/Editor";
import MarkdownRender from "@/components/Markdown/MarkdownRender";
import NodeTypeIcon from "@/components/NodeTypeIcon2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import shortenNumber from "@/lib/utils/shortenNumber";

const doNothing = () => {};

dayjs.extend(relativeTime);

type ProposalItemProps = {
  proposal: any;
  showTitle: boolean;
  proposalSummaries?: any;
  userVotesOnProposals?: { [key: string]: any };
};

const ProposalItem = ({ userVotesOnProposals = {}, proposal, showTitle }: ProposalItemProps) => {
  const eRef = useRef<any>(null);
  useEffect(() => {
    const element = document.getElementById("comments-section") as HTMLElement;
    if (element) {
      element.style.height = element.clientHeight - (eRef.current.clientHeight + 10) + "px";
    }
    return () => {
      if (element) {
        element.style.height = window.innerHeight - 200 + "px";
      }
    };
  }, []);

  return (
    <Paper
      ref={eRef}
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
        ":hover": {
          background: theme => (theme.palette.mode === "dark" ? "#2F2F2F" : "#EAECF0"),
        },
      }}
    >
      <Box>
        <Box>
          {showTitle && (
            <MarkdownRender
              text={proposal.title}
              customClass={"custom-react-markdown"}
              sx={{ fontWeight: 400, letterSpacing: "inherit" }}
            />
          )}
          <Box
            sx={{
              paddingY: "10px",
            }}
          >
            {proposal._proposalSummaries.length > 0
              ? proposal._proposalSummaries.map((prSummary: string, prSummaryIdx: number) => {
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
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default React.memo(ProposalItem);
