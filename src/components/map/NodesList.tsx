import React, { MutableRefObject, useCallback } from "react";
import { FullNodeData, OpenPart, TNodeBookState, TNodeUpdates } from "src/nodeBookTypes";

import { useNodeBook } from "@/context/NodeBookContext";
import { NODE_WIDTH } from "@/lib/utils/Map.utils";
import { OpenSidebar } from "@/pages/notebook";

import { MemoizedNode } from "./Node";

type NodeListProps = {
  nodeUpdates: TNodeUpdates;
  notebookRef: MutableRefObject<TNodeBookState>;
  setNodeUpdates: (updates: TNodeUpdates) => void;
  setFocusView: (state: { selectedNode: string; isEnabled: boolean }) => void;
  nodes: { [key: string]: any };
  bookmark: any;
  markStudied: any;
  chosenNodeChanged: any;
  referenceLabelChange: any;
  deleteLink: any;
  openLinkedNode: any;
  openAllChildren: any;
  openAllParent: any;
  hideNodeHandler: any;
  hideDescendants: any;
  toggleNode: (event: any, id: string) => void;
  openNodePart: any;
  onNodeShare: (nodeId: string, platform: string) => void;
  selectNode: any;
  nodeClicked: any;
  correctNode: any;
  wrongNode: any;
  uploadNodeImage: any;
  removeImage: any;
  changeNodeHight: any;
  changeChoice: any;
  changeFeedback: any;
  switchChoice: any;
  deleteChoice: any;
  addChoice: any;
  cleanEditorLink: () => void;
  onNodeTitleBlur: (newTitle: string) => void;
  setOpenSearch: any;
  saveProposedChildNode: any;
  saveProposedImprovement: any;
  closeSideBar: any;
  reloadPermanentGrpah: any;
  setOpenMedia: (imagUrl: string) => void;
  setNodeParts: (nodeId: string, callback: (thisNode: FullNodeData) => FullNodeData) => void;
  citations: { [key: string]: Set<string> };
  setOpenSideBar: (sidebar: OpenSidebar) => void;
  proposeNodeImprovement: any;
  proposeNewChild: any;
  scrollToNode: any;
  openSidebar: OpenSidebar;
  setOperation: (operation: string) => void;
  openUserInfoSidebar: (uname: string, imageUrl: string, fullName: string, chooseUname: string) => void;
  disabledNodes: string[];
  enableChildElements: string[];
  // showProposeTutorial?: boolean; // this flag is to enable tutorial first time user click in pencil
  // setCurrentTutorial: (newValue: TutorialType) => void;
  ableToPropose: boolean;
  setAbleToPropose: (newValue: boolean) => void;
  setOpenPart: (nodeId: string, newOpenPart: OpenPart) => void;
  scaleThreshold: number;
};

const NodesList = ({
  nodeUpdates,
  notebookRef,
  setNodeUpdates,
  setFocusView,
  nodes,
  bookmark,
  markStudied,
  chosenNodeChanged,
  referenceLabelChange,
  deleteLink,
  openLinkedNode,
  openAllChildren,
  openAllParent,
  hideDescendants,
  hideNodeHandler,
  toggleNode,
  openNodePart,
  onNodeShare,
  selectNode,
  nodeClicked,
  correctNode,
  wrongNode,
  uploadNodeImage,
  removeImage,
  changeNodeHight,
  changeChoice,
  changeFeedback,
  switchChoice,
  deleteChoice,
  addChoice,
  onNodeTitleBlur,
  setOpenSearch,
  saveProposedChildNode,
  saveProposedImprovement,
  closeSideBar,
  reloadPermanentGrpah,
  setOpenMedia,
  setNodeParts,
  cleanEditorLink,
  citations,
  setOpenSideBar,
  proposeNodeImprovement,
  proposeNewChild,
  scrollToNode,
  openSidebar,
  setOperation,
  openUserInfoSidebar,
  disabledNodes = [],
  enableChildElements = [],
  ableToPropose,
  setAbleToPropose,
  setOpenPart,
  scaleThreshold,
}: NodeListProps) => {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { nodeBookDispatch } = useNodeBook();

  const setOpenPartNode = useCallback(
    (nodeId: string) => (newOpenPart: OpenPart) => setOpenPart(nodeId, newOpenPart),
    [setOpenPart]
  );

  return (
    <>
      {Object.keys(nodes).map(nId => {
        let unaccepted = false;
        if ("unaccepted" in nodes[nId]) {
          unaccepted = nodes[nId].unaccepted;
        }
        let bookmarks = 0;
        if ("bookmarks" in nodes[nId] && Number(nodes[nId].bookmarks)) {
          bookmarks = nodes[nId].bookmarks;
        }
        let bookmarked = false;
        if ("bookmarked" in nodes[nId]) {
          bookmarked = nodes[nId].bookmarked;
        }
        let activeNode = false;
        if (notebookRef.current.selectedNode === nId) {
          activeNode = true;
        }
        let citationsSelected = false;
        if (notebookRef.current.selectedNode === nId && notebookRef.current.selectionType === "Citations") {
          citationsSelected = true;
        }
        let proposalsSelected = false;
        if (notebookRef.current.selectedNode === nId && notebookRef.current.selectionType === "Proposals") {
          proposalsSelected = true;
        }
        let acceptedProposalsSelected = false;
        if (notebookRef.current.selectedNode === nId && notebookRef.current.selectionType === "AcceptedProposals") {
          acceptedProposalsSelected = true;
        }
        let commentsSelected = false;
        if (notebookRef.current.selectedNode === nId && notebookRef.current.selectionType === "Comments") {
          commentsSelected = true;
        }

        // const notebookIdx = (nodes[nId].notebooks ?? []).findIndex((cur: string) => cur === selectedNotebookId);
        // if (notebookIdx < 0) return null;

        // const open = (nodes[nId].expands ?? [])[notebookIdx];
        // if (open === undefined) return null;

        return (
          <MemoizedNode
            key={nId}
            identifier={nId}
            nodeBookDispatch={nodeBookDispatch}
            nodeUpdates={nodeUpdates}
            setNodeUpdates={setNodeUpdates}
            notebookRef={notebookRef}
            setFocusView={setFocusView}
            activeNode={activeNode}
            citationsSelected={citationsSelected}
            proposalsSelected={proposalsSelected}
            acceptedProposalsSelected={acceptedProposalsSelected}
            commentsSelected={commentsSelected}
            left={nodes[nId].left}
            top={nodes[nId].top}
            width={NODE_WIDTH}
            editable={nodes[nId].editable}
            cleanEditorLink={cleanEditorLink}
            unaccepted={unaccepted}
            nodeType={nodes[nId].nodeType}
            isTag={nodes[nId].hasOwnProperty("isTag") && nodes[nId].isTag}
            isNew={nodes[nId].hasOwnProperty("isNew") && nodes[nId].isNew}
            title={nodes[nId].title}
            content={nodes[nId].content}
            nodeImage={nodes[nId].nodeImage}
            nodeVideo={nodes[nId].nodeVideo || ""}
            nodeVideoStartTime={nodes[nId].nodeVideoStartTime || 0}
            nodeVideoEndTime={nodes[nId].nodeVideoEndTime || 0}
            viewers={nodes[nId].viewers}
            correctNum={nodes[nId].corrects}
            markedCorrect={nodes[nId].correct}
            wrongNum={nodes[nId].wrongs}
            markedWrong={nodes[nId].wrong}
            references={nodes[nId].references.map((cur: string, idx: number) => ({
              title: cur,
              node: nodes[nId].referenceIds[idx],
              label: nodes[nId].referenceLabels[idx],
            }))}
            tags={nodes[nId].tags.map((cur: string, idx: number) => ({
              node: nodes[nId].tagIds[idx],
              title: cur,
            }))}
            parents={nodes[nId].parents}
            nodesChildren={nodes[nId].children}
            choices={nodes[nId].choices}
            commentsNum={nodes[nId].comments}
            proposalsNum={nodes[nId].versions}
            admin={nodes[nId].admin}
            aImgUrl={nodes[nId].aImgUrl}
            aFullname={nodes[nId].aFullname}
            aChooseUname={nodes[nId].aChooseUname}
            lastVisit={nodes[nId].lastVisit}
            studied={nodes[nId].studied}
            isStudied={nodes[nId].isStudied}
            changed={nodes[nId].changed}
            changedAt={nodes[nId].changedAt}
            simulated={nodes[nId]?.simulated}
            bookmarked={bookmarked}
            bookmarks={bookmarks}
            bookmark={bookmark}
            markStudied={markStudied}
            chosenNodeChanged={chosenNodeChanged}
            referenceLabelChange={referenceLabelChange}
            deleteLink={deleteLink}
            openLinkedNode={openLinkedNode}
            openAllChildren={openAllChildren}
            openAllParent={openAllParent}
            onHideNode={hideNodeHandler}
            hideDescendants={hideDescendants}
            toggleNode={toggleNode}
            openNodePart={openNodePart}
            onNodeShare={onNodeShare}
            selectNode={selectNode}
            nodeClicked={nodeClicked}
            correctNode={correctNode}
            wrongNode={wrongNode}
            uploadNodeImage={uploadNodeImage}
            removeImage={removeImage}
            changeNodeHight={changeNodeHight}
            changeChoice={changeChoice}
            changeFeedback={changeFeedback}
            switchChoice={switchChoice}
            deleteChoice={deleteChoice}
            addChoice={addChoice}
            onNodeTitleBLur={onNodeTitleBlur}
            setOpenSearch={setOpenSearch}
            saveProposedChildNode={saveProposedChildNode}
            saveProposedImprovement={saveProposedImprovement}
            closeSideBar={closeSideBar}
            reloadPermanentGrpah={reloadPermanentGrpah}
            setOpenMedia={setOpenMedia}
            setNodeParts={setNodeParts}
            citations={citations}
            setOpenSideBar={setOpenSideBar}
            proposeNodeImprovement={proposeNodeImprovement}
            proposeNewChild={proposeNewChild}
            scrollToNode={scrollToNode}
            openSidebar={openSidebar}
            locked={nodes[nId].locked}
            disableVotes={!!nodes[nId].disableVotes}
            setOperation={setOperation}
            contributors={nodes[nId].contributors}
            institutions={nodes[nId].institutions}
            openUserInfoSidebar={openUserInfoSidebar}
            disabled={disabledNodes.includes(nId)}
            enableChildElements={enableChildElements}
            // defaultOpenPart={nodes[nId].defaultOpenPart}
            // showProposeTutorial={showProposeTutorial}
            // setCurrentTutorial={setCurrentTutorial}
            ableToPropose={ableToPropose}
            setAbleToPropose={setAbleToPropose}
            openPart={nodes[nId].localLinkingWords}
            setOpenPart={setOpenPartNode(nId)}
            // selectedNotebookId={selectedNotebookId}
            // expands={nodes[nId].expands}
            // notebooks={nodes[nId].notebooks}
            open={nodes[nId].open}
            scaleThreshold={scaleThreshold}
          />
        );
      })}
    </>
  );
};

export const MemoizedNodeList = React.memo(NodesList, (prev, next) => {
  const validateTutorialProps = () => {
    // we use some to go out of the iteration the first time we can
    const disableNodesHasEqualsProperties = !prev.disabledNodes.some((el, idx) => el !== next.disabledNodes[idx]);
    const enableChildeElementsHasEqualsProperties = !prev.enableChildElements.some(
      (el, idx) => el !== next.enableChildElements[idx]
    );
    return (
      prev.disabledNodes.length === next.disabledNodes.length &&
      prev.enableChildElements.length === next.enableChildElements.length &&
      disableNodesHasEqualsProperties &&
      enableChildeElementsHasEqualsProperties
    );
  };

  return (
    prev.nodeUpdates.updatedAt === next.nodeUpdates.updatedAt &&
    prev.bookmark === next.bookmark &&
    prev.markStudied === next.markStudied &&
    prev.chosenNodeChanged === next.chosenNodeChanged &&
    prev.referenceLabelChange === next.referenceLabelChange &&
    prev.deleteLink === next.deleteLink &&
    prev.openLinkedNode === next.openLinkedNode &&
    prev.openAllChildren === next.openAllChildren &&
    prev.openAllParent === next.openAllParent &&
    prev.hideNodeHandler === next.hideNodeHandler &&
    prev.hideDescendants === next.hideDescendants &&
    prev.toggleNode === next.toggleNode &&
    prev.openNodePart === next.openNodePart &&
    prev.selectNode === next.selectNode &&
    prev.nodeClicked === next.nodeClicked &&
    prev.correctNode === next.correctNode &&
    prev.wrongNode === next.wrongNode &&
    prev.uploadNodeImage === next.uploadNodeImage &&
    prev.removeImage === next.removeImage &&
    prev.changeChoice === next.changeChoice &&
    prev.changeFeedback === next.changeFeedback &&
    prev.switchChoice === next.switchChoice &&
    prev.deleteChoice === next.deleteChoice &&
    prev.addChoice === next.addChoice &&
    prev.saveProposedChildNode === next.saveProposedChildNode &&
    prev.saveProposedImprovement === next.saveProposedImprovement &&
    prev.closeSideBar === next.closeSideBar &&
    prev.reloadPermanentGrpah === next.reloadPermanentGrpah &&
    prev.setOpenPart === next.setOpenPart &&
    prev.openSidebar === prev.openSidebar && // TODO: check this
    // prev.showProposeTutorial === next.showProposeTutorial &&
    prev.scaleThreshold === next.scaleThreshold &&
    prev.ableToPropose === next.ableToPropose &&
    prev.setNodeParts === next.setNodeParts &&
    // prev.selectedNotebookId === next.selectedNotebookId &&
    validateTutorialProps()
  );
});
