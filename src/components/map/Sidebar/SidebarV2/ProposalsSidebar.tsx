import { Box, CircularProgress, MenuItem, Select, Tab, Tabs, Typography } from "@mui/material";
import { Firestore } from "firebase/firestore";
import NextImage from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { UserTheme } from "src/knowledgeTypes";

import NoProposalDarkIcon from "../../../../../public/no-proposals-dark-mode.svg";
import NoProposalLightIcon from "../../../../../public/no-proposals-light-mode.svg";
import { newId } from "../../../../lib/utils/newFirestoreId";
import ProposalsList from "../../ProposalsList/ProposalsList";
import { SidebarWrapper } from "./SidebarWrapper";

type ProposalsSidebarProps = {
  open: boolean;
  onClose: () => void;
  clearInitialProposal: () => void;
  initialProposal: string | null;
  nodeLoaded: boolean;
  theme: UserTheme;
  proposeNodeImprovement: any;
  fetchProposals: any;
  rateProposal: any;
  ratingProposale: boolean;
  selectProposal: any;
  deleteProposal: any;
  proposeNewChild: any;
  openProposal: any;
  selectedNode: string | null;
  db: Firestore;
  sidebarWidth: number;
  innerHeight?: number;
  innerWidth: number;
  username: string;
};

const ProposalsSidebar = ({
  open,
  onClose,
  clearInitialProposal,
  initialProposal,
  nodeLoaded,
  theme,
  proposeNodeImprovement,
  fetchProposals,
  rateProposal,
  ratingProposale,
  selectProposal,
  deleteProposal,
  proposeNewChild,
  openProposal,
  db,
  sidebarWidth,
  innerHeight,
  innerWidth,
  selectedNode,
  username,
}: ProposalsSidebarProps) => {
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [value, setValue] = React.useState(0);
  const [type, setType] = useState<string>("all");

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (selectedNode && open && nodeLoaded) {
      fetchProposals(setIsAdmin, setIsRetrieving, setProposals);
    }
  }, [fetchProposals, selectedNode, open, nodeLoaded]);

  const proposalsWithId = useMemo(() => {
    return proposals.map((cur: any) => ({ ...cur, newNodeId: newId(db) }));
  }, [db, proposals]);

  useEffect(() => {
    if (selectedNode && open && initialProposal && !isRetrieving) {
      const proposal = proposalsWithId.find(_proposal => _proposal.id === initialProposal);
      if (proposal) {
        clearInitialProposal();
        selectProposal({ preventDefault: () => {} }, proposal, proposal.newNodeId);
      }
    }
  }, [isRetrieving, initialProposal, selectedNode, open, proposalsWithId, clearInitialProposal, selectProposal]);

  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const contentSignalState = useMemo(() => {
    return { updated: true };
  }, [isRetrieving, proposals, openProposal, initialProposal, value, type]);

  return (
    <SidebarWrapper
      id="sidebar-wrapper-proposals"
      title="Proposals"
      open={open}
      onClose={onClose}
      width={sidebarWidth}
      height={innerWidth > 599 ? 100 : 35}
      innerHeight={innerHeight}
      anchor="left"
      contentSignalState={contentSignalState}
      sx={{
        boxShadow: "none",
      }}
      SidebarOptions={
        <Box
          sx={{
            marginTop: "30px",
          }}
        >
          <Box
            sx={{
              borderBottom: 1,
              borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
              width: "100%",
            }}
          >
            <Tabs
              id="focused-tabs"
              value={value}
              onChange={handleChange}
              aria-label={"Proposal Tabs"}
              variant="fullWidth"
            >
              {["Pending", "Approved"].map((tabItem: string, idx: number) => (
                <Tab key={tabItem} label={tabItem} {...a11yProps(idx)} />
              ))}
            </Tabs>
          </Box>
        </Box>
      }
      SidebarContent={
        <Box sx={{ px: "10px", paddingTop: "10px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "right",
              py: "10px",
            }}
          >
            <Typography>Show</Typography>
            <Select
              sx={{
                marginLeft: "10px",
                height: "35px",
                width: "120px",
              }}
              MenuProps={{
                sx: {
                  "& .MuiMenu-paper": {
                    backgroundColor: theme => (theme.palette.mode === "dark" ? "#1B1A1A" : "#F9FAFB"),
                    color: "text.white",
                  },
                  "& .MuiMenuItem-root:hover": {
                    backgroundColor: theme => (theme.palette.mode === "dark" ? "##2F2F2F" : "#EAECF0"),
                    color: "text.white",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "transparent!important",
                    color: "#FF8134",
                  },
                  "& .Mui-selected:hover": {
                    backgroundColor: "transparent",
                  },
                },
              }}
              labelId="demo-select-small"
              id="demo-select-small"
              value={type}
              onChange={e => {
                setType(e.target.value);
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Concept">Concepts</MenuItem>
              <MenuItem value="Relation">Relations</MenuItem>
              <MenuItem value="Question">Questions</MenuItem>
              <MenuItem value="Idea">Ideas</MenuItem>
              <MenuItem value="Code">Codes</MenuItem>
              <MenuItem value="Reference">References</MenuItem>
            </Select>
          </Box>

          {isRetrieving && (
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", padding: "20px" }}>
              <CircularProgress />
            </Box>
          )}

          {!isRetrieving && !proposalsWithId.filter(cur => (value === 0 ? !cur.accepted : cur.accepted)).length && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "40%",
              }}
            >
              <NextImage src={theme === "Dark" ? NoProposalDarkIcon : NoProposalLightIcon} alt="Notification icon" />
              <Typography
                sx={{
                  fontSize: "20px",

                  fontWeight: "500",
                }}
              >
                You've not checked off any notifications
              </Typography>
            </Box>
          )}
          {!isRetrieving && value === 0 && (
            <Box
              component="ul"
              className="collection"
              sx={{ padding: "0px", margin: "0px", display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <ProposalsList
                proposals={
                  type === "all" ? proposalsWithId : proposalsWithId.filter(proposal => proposal.nodeType === type)
                }
                setProposals={setProposals}
                proposeNodeImprovement={proposeNodeImprovement}
                fetchProposals={fetchProposals}
                rateProposal={rateProposal}
                selectProposal={selectProposal}
                deleteProposal={deleteProposal}
                editHistory={false}
                ratingProposale={ratingProposale}
                proposeNewChild={proposeNewChild}
                openProposal={openProposal}
                isAdmin={isAdmin}
                username={username}
              />
            </Box>
          )}
          {!isRetrieving && value === 1 && (
            <Box
              component="ul"
              className="collection"
              sx={{ padding: "0px", margin: "0px", display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <ProposalsList
                proposals={
                  type === "all" ? proposalsWithId : proposalsWithId.filter(proposal => proposal.nodeType === type)
                }
                setProposals={setProposals}
                proposeNodeImprovement={proposeNodeImprovement}
                fetchProposals={fetchProposals}
                rateProposal={rateProposal}
                ratingProposale={ratingProposale}
                selectProposal={selectProposal}
                deleteProposal={deleteProposal}
                editHistory={true}
                proposeNewChild={proposeNewChild}
                openProposal={openProposal}
                isAdmin={isAdmin}
                username={username}
              />
            </Box>
          )}
        </Box>
      }
    />
  );
};

export const MemoizedProposalsSidebar = React.memo(ProposalsSidebar);
