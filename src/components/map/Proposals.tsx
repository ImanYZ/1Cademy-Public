import "./Proposals.css";

import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import {
  openProposalState,
  selectedNodeState,
  selectionTypeState,
} from "../../../../../store/MapAtoms";
import SidebarTabs from "../../SidebarTabs/SidebarTabs";
import EditProposal from "../EditProposal/EditProposal";
// import NewChildProposal from "../NewChildProposal/NewChildProposal";
// import ProposalsList from "../ProposalsList/ProposalsList";
import NewChildProposal from "./NewChildProposal";

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
  const selectedNode = useRecoilValue(selectedNodeState);
  const selectionType = useRecoilValue(selectionTypeState);
  const [openProposal, setOpenProposal] = useRecoilState(openProposalState);

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
      ),
    },
    {
      title: "Approved Proposals",
      content: (
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
      ),
    },
  ];

  return (
    <div id="ProposalsContainer">
      {/* <div id="ProposeNewChildImprovementTitle">
        <strong>Propose New Child / Improvement</strong>
      </div> */}
      <div id="ProposalButtonsCollection">
        <EditProposal
          openProposal={openProposal}
          proposeNodeImprovement={props.proposeNodeImprovement}
        />
        <div id="ProposalButtonsRow">
          {Object.keys(proposedChildTypesIcons).map((childNodeType) => {
            return (
              <NewChildProposal
                key={childNodeType}
                childNodeType={childNodeType}
                icon={/*proposedChildTypesIcons[childNodeType]*/ 'name-icon'}
                openProposal={openProposal}
                setOpenProposal={setOpenProposal}
                proposeNewChild={props.proposeNewChild}
              />
            );
          })}
        </div>
      </div>
      <SidebarTabs tabsTitle="Proposals tabs" tabsItems={tabsItems} />
    </div>
  );
};

export default React.memo(Proposals);
