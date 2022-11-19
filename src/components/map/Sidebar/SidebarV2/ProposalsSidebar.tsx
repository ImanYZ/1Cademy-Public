import { Box, CircularProgress, Tab, Tabs } from "@mui/material";
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
  selectedNode,
  db,
}: ProposalsSidebarProps) => {
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    fetchProposals(setIsAdmin, setIsRetrieving, setProposals, "Primero");
    // CHECK: a warning in happening here in fetchProposals (is trying to update the state while is rendering)
    // Try to solve adding await
    // next-dev.js?3515:24 Warning: Cannot update a component (`Proposals`) while rendering a different component (`Dashboard`)
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    //setOpenProposalItem(false);
    if (selectedNode) {
      fetchProposals(setIsAdmin, setIsRetrieving, setProposals, "Segundo");
    }
    // CHECK: a warning in happening here in fetchProposals (is trying to update the state while is rendering)
    // Try to solve adding await
    // next-dev.js?3515:24 Warning: Cannot update a component (`Proposals`) while rendering a different component (`Dashboard`)
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode]);

  const proposalsWithId = useMemo(() => {
    return proposals.map((cur: any) => ({ ...cur, newNodeId: newId(db) }));
  }, [db, proposals]);

  const tabsItems = [
    {
      title: "Pending Proposals",
      content: !isRetrieving ? (
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
      ) : (
        <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "20px" }}>
          <CircularProgress />
        </div>
      ),
    },
    {
      title: "Approved Proposals",
      content: !isRetrieving ? (
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
      ) : (
        <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "20px" }}>
          <CircularProgress />
        </div>
      ),
    },
  ];
  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  return (
    <SidebarWrapper
      title="Proposals"
      headerImage={theme === "Dark" ? referencesDarkTheme : referencesLightTheme}
      open={open}
      onClose={onClose}
      width={window.innerWidth > 899 ? 430 : window.innerWidth}
      height={window.innerWidth > 899 ? 100 : 35}
      anchor="left"
      contentSignalState={tabsItems}
      SidebarOptions={
        <Box>
          <Box>
            <div id="ProposalButtonsCollection">
              {/* <h6 style={{ margin: '0px' }}>Here Edit proposal component</h6> */}
              {/* CHECK: I commented this */}
              {/* <EditProposal
                openProposal={openProposalItem}
                proposeNodeImprovement={proposeNodeImprovement}
                selectedNode={selectedNode}
              />
              <div
                id="ProposalButtonsRow"
                style={{ border: "solid 0px pink", display: "flex", justifyContent: "space-around" }}
              >
                {(Object.keys(proposedChildTypesIcons) as ProposedChildTypesIcons[]).map(
                  (childNodeType: ProposedChildTypesIcons) => {
                    return (
                      <NewChildProposal
                        key={childNodeType}
                        childNodeType={childNodeType}
                        icon={proposedChildTypesIcons[childNodeType]}
                        openProposal={openProposalItem}
                        setOpenProposal={setOpenProposalItem}
                        proposeNewChild={proposeNewChild}
                      />
                    );
                  }
                )}
              </div> */}
            </div>
          </Box>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
              width: "100%",
            }}
          >
            <Tabs value={value} onChange={handleChange} aria-label={"Bookmarks Tabs"}>
              {tabsItems.map((tabItem: any, idx: number) => (
                <Tab key={tabItem.title} label={tabItem.title} {...a11yProps(idx)} />
              ))}
            </Tabs>
          </Box>
        </Box>
      }
      SidebarContent={<Box sx={{ px: "10px", paddingTop: "10px" }}>{tabsItems[value].content}</Box>}
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
