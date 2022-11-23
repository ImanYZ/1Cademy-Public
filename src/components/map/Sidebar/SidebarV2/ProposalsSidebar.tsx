import { Box, CircularProgress, Tab, Tabs, Typography } from "@mui/material";
import { Firestore } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { UserTheme } from "src/knowledgeTypes";

import referencesDarkTheme from "../../../../../public/references-dark-theme.jpg";
import referencesLightTheme from "../../../../../public/references-light-theme.jpg";
import { newId } from "../../../../lib/utils/newid";
import ProposalsList from "../../ProposalsList/ProposalsList";
import { SidebarWrapper } from "./SidebarWrapper";

type ProposalsSidebarProps = {
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  proposeNodeImprovement: any;
  fetchProposals: any;
  rateProposal: any;
  selectProposal: any;
  deleteProposal: any;
  proposeNewChild: any;
  openProposal: any;
  selectedNode: string | null;
  db: Firestore;
  innerHeight?: number;
};

const ProposalsSidebar = ({
  open,
  onClose,
  theme,
  proposeNodeImprovement,
  fetchProposals,
  rateProposal,
  selectProposal,
  deleteProposal,
  proposeNewChild,
  openProposal,
  db,
  innerHeight,
  selectedNode,
}: ProposalsSidebarProps) => {
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (selectedNode && open) {
      fetchProposals(setIsAdmin, setIsRetrieving, setProposals);
    }
  }, [fetchProposals, selectedNode, open]);

  const proposalsWithId = useMemo(() => {
    return proposals.map((cur: any) => ({ ...cur, newNodeId: newId(db) }));
  }, [db, proposals]);

  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const contentSignalState = useMemo(() => {
    return { updated: true };
  }, [isRetrieving, proposals]);

  return (
    <SidebarWrapper
      title="Proposals"
      headerImage={theme === "Dark" ? referencesDarkTheme : referencesLightTheme}
      open={open}
      onClose={onClose}
      width={window.innerWidth > 899 ? 430 : window.innerWidth}
      height={window.innerWidth > 899 ? 100 : 35}
      innerHeight={innerHeight}
      anchor="left"
      contentSignalState={contentSignalState}
      SidebarOptions={
        <Box>
          <Box>
            <div id="ProposalButtonsCollection">{/* TODO: check proposal options in 1cademy private repo */}</div>
          </Box>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
              width: "100%",
            }}
          >
            <Tabs value={value} onChange={handleChange} aria-label={"Bookmarks Tabs"}>
              {["Pending Proposals", "Approved Proposals"].map((tabItem: string, idx: number) => (
                <Tab key={tabItem} label={tabItem} {...a11yProps(idx)} />
              ))}
            </Tabs>
          </Box>
        </Box>
      }
      SidebarContent={
        <Box sx={{ px: "10px", paddingTop: "10px" }}>
          {isRetrieving && (
            <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "20px" }}>
              <CircularProgress />
            </div>
          )}

          {!isRetrieving && !proposalsWithId.filter(cur => (value === 0 ? !cur.accepted : cur.accepted)).length && (
            <Box sx={{ minHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ color: "rgba(120,120,120,0.8)", textAlign: "center" }}>
                There is not proposals yet
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
                proposals={proposalsWithId}
                setProposals={setProposals}
                proposeNodeImprovement={proposeNodeImprovement}
                fetchProposals={fetchProposals}
                rateProposal={rateProposal}
                selectProposal={selectProposal}
                deleteProposal={deleteProposal}
                editHistory={false}
                proposeNewChild={proposeNewChild}
                openProposal={openProposal}
                isAdmin={isAdmin}
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
                proposals={proposalsWithId}
                setProposals={setProposals}
                proposeNodeImprovement={proposeNodeImprovement}
                fetchProposals={fetchProposals}
                rateProposal={rateProposal}
                selectProposal={selectProposal}
                deleteProposal={deleteProposal}
                editHistory={true}
                proposeNewChild={proposeNewChild}
                openProposal={openProposal}
                isAdmin={isAdmin}
              />
            </Box>
          )}
        </Box>
      }
    />
  );
};

export const MemoizedProposalsSidebar = React.memo(ProposalsSidebar, (prev, next) => {
  return (
    prev.theme === next.theme &&
    prev.open === next.open &&
    prev.fetchProposals === next.fetchProposals &&
    prev.openProposal === next.openProposal
  );
});
