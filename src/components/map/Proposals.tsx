// import "./Proposals.css";

// import { TabPanel } from "@mui/lab";
// import { Box, Tab, Tabs } from "@mui/material";
import React, { useEffect, useState } from "react";

// import { useRecoilState, useRecoilValue } from "recoil";
// import {
//   openProposalState,
//   selectedNodeState,
//   selectionTypeState,
// } from "../../../../../store/MapAtoms";
// import SidebarTabs from "../../SidebarTabs/SidebarTabs";
// import EditProposal from "../EditProposal/EditProposal";
// import NewChildProposal from "../NewChildProposal/NewChildProposal";
// import ProposalsList from "../ProposalsList/ProposalsList";
import NewChildProposal from "./NewChildProposal";
import ProposalsList from "./ProposalsList/ProposalsList";
import { MemoizedSidebarTabs } from "./SidebarTabs/SidebarTabs";

const proposedChildTypesIcons = {
  Concept: "local_library",
  Relation: "share",
  Question: "help_outline",
  Code: "code",
  Reference: "menu_book",
  Idea: "emoji_objects",
};

type ProposalsProps = {
  proposeNodeImprovement: any,
  fetchProposals: any,
  rateProposal: any,
  selectProposal: any,
  deleteProposal: any,
  proposeNewChild: any,
}

const Proposals = (props: ProposalsProps) => {
  const [selectedNode] = useState();
  const [selectionType] = useState();
  const [openProposal, setOpenProposal] = useState();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    props.fetchProposals(setIsAdmin, setIsRetrieving, setProposals);
  }, []);

  useEffect(() => {
    setOpenProposal(false);
    if (selectedNode) {
      props.fetchProposals(setIsAdmin, setIsRetrieving, setProposals);
    }
  }, [selectedNode]);

  useEffect(() => {
    setOpenProposal(false);
  }, [selectionType]);

  const tabsItems = [
    {
      title: "Pending Proposals",
      content: (
        <>
          pending proposals here
          <ProposalsList
            proposals={proposals}
            setProposals={setProposals}
            proposeNodeImprovement={props.proposeNodeImprovement}
            fetchProposals={props.fetchProposals}
            rateProposal={props.rateProposal}
            selectProposal={props.selectProposal}
            deleteProposal={props.deleteProposal}
            editHistory={false}
            proposeNewChild={props.proposeNewChild}
            openProposal={openProposal}
            isAdmin={isAdmin}
            isRetrieving={isRetrieving}
          />
        </>
      ),
    },
    {
      title: "Approved Proposals",
      content: (
        <>
          Aproved proposals here
          <ProposalsList
            proposals={proposals}
            setProposals={setProposals}
            proposeNodeImprovement={props.proposeNodeImprovement}
            fetchProposals={props.fetchProposals}
            rateProposal={props.rateProposal}
            selectProposal={props.selectProposal}
            deleteProposal={props.deleteProposal}
            editHistory={true}
            proposeNewChild={props.proposeNewChild}
            openProposal={openProposal}
            isAdmin={isAdmin}
            isRetrieving={isRetrieving}
          />
        </>
      ),
    },
  ];

  return (
    <div id="ProposalsContainer" style={{ border: 'dashed 2px yellow' }}>
      {/* <div id="ProposeNewChildImprovementTitle">
        <strong>Propose New Child / Improvement</strong>
      </div> */}
      <div id="ProposalButtonsCollection">
        <h6>Here Edit proposal component</h6>
        {/* CHECK: I commented this */}
        {/* <EditProposal
          openProposal={openProposal}
          proposeNodeImprovement={props.proposeNodeImprovement}
        /> */}
        <div id="ProposalButtonsRow" style={{ border: 'solid 0px pink' }}>
          {Object.keys(proposedChildTypesIcons).map((childNodeType) => {
            return (
              <NewChildProposal
                key={childNodeType}
                childNodeType={childNodeType}
                icon={proposedChildTypesIcons[childNodeType]}
                openProposal={openProposal}
                setOpenProposal={setOpenProposal}
                proposeNewChild={props.proposeNewChild}
              />
            );
          })}
        </div>
      </div>
      <br />
      <MemoizedSidebarTabs tabsTitle="Proposals tabs" tabsItems={tabsItems} />

    </div>
  );
};

export default React.memo(Proposals);
