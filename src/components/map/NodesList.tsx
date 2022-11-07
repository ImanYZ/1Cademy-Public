import React from "react";
import { FullNodeData } from "src/nodeBookTypes";

import { useNodeBook } from "@/context/NodeBookContext";
import { compareNodes, NODE_WIDTH } from "@/lib/utils/Map.utils";
import { OpenSidebar } from "@/pages/dashboard";

// import { FullNodeData } from "../../noteBookTypes";
import { MemoizedNode } from "./Node";

type NodeListProps = {
  nodes: { [key: string]: any };
  // selectionType: any,
  // NODE_WIDTH: number,
  bookmark: any;
  markStudied: any;
  chosenNodeChanged: any;
  referenceLabelChange: any;
  deleteLink: any;
  openLinkedNode: any;
  openAllChildren: any;
  hideNodeHandler: any;
  hideOffsprings: any;
  toggleNode: (event: any, id: string) => void;
  openNodePart: any;
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
};

const NodesList = ({
  nodes,
  bookmark,
  markStudied,
  chosenNodeChanged,
  referenceLabelChange,
  deleteLink,
  openLinkedNode,
  openAllChildren,
  hideOffsprings,
  hideNodeHandler,
  toggleNode,
  openNodePart,
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
}: NodeListProps) => {
  const { nodeBookState } = useNodeBook();

  // console.log(1, nodes);
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
        if (nodeBookState.selectedNode === nId) {
          activeNode = true;
        }
        let citationsSelected = false;
        if (nodeBookState.selectedNode === nId && nodeBookState.selectionType === "Citations") {
          citationsSelected = true;
        }
        let proposalsSelected = false;
        if (nodeBookState.selectedNode === nId && nodeBookState.selectionType === "Proposals") {
          proposalsSelected = true;
        }
        let acceptedProposalsSelected = false;
        if (nodeBookState.selectedNode === nId && nodeBookState.selectionType === "AcceptedProposals") {
          acceptedProposalsSelected = true;
        }
        let commentsSelected = false;
        if (nodeBookState.selectedNode === nId && nodeBookState.selectionType === "Comments") {
          commentsSelected = true;
        }

        return (
          <MemoizedNode
            key={nId}
            identifier={nId}
            activeNode={activeNode}
            citationsSelected={citationsSelected}
            proposalsSelected={proposalsSelected}
            acceptedProposalsSelected={acceptedProposalsSelected}
            commentsSelected={commentsSelected}
            open={nodes[nId].open}
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
            }))} // CHECK: I added this because we need id and title
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
            bookmarked={bookmarked}
            bookmarks={bookmarks}
            bookmark={bookmark}
            markStudied={markStudied}
            chosenNodeChanged={chosenNodeChanged}
            referenceLabelChange={referenceLabelChange}
            deleteLink={deleteLink}
            openLinkedNode={openLinkedNode}
            openAllChildren={openAllChildren}
            onHideNode={hideNodeHandler}
            hideOffsprings={hideOffsprings}
            toggleNode={toggleNode}
            openNodePart={openNodePart}
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
          />
        );
      })}
    </>
  );
};
// export default NodesList;
// export const MemoizedNodeList = NodesList;
export const MemoizedNodeList = React.memo(NodesList, (prev, next) => {
  const compareNodesResult = compareNodes(prev.nodes, next.nodes);
  console.log("compareNodesResult", { compareNodesResult, prev: prev.nodes, next: next.nodes });
  return (
    compareNodes(prev.nodes, next.nodes) &&
    // prev.selectionType === next.selectionType &&
    // prev.NODE_WIDTH === next.NODE_WIDTH &&
    prev.bookmark === next.bookmark &&
    prev.markStudied === next.markStudied &&
    // prev.nodeChanged === next.nodeChanged &&
    prev.chosenNodeChanged === next.chosenNodeChanged &&
    prev.referenceLabelChange === next.referenceLabelChange &&
    prev.deleteLink === next.deleteLink &&
    prev.openLinkedNode === next.openLinkedNode &&
    prev.openAllChildren === next.openAllChildren &&
    prev.hideNodeHandler === next.hideNodeHandler &&
    prev.hideOffsprings === next.hideOffsprings &&
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
    prev.openSidebar === prev.openSidebar
  );
});

// export default React.memo(NodesList);
// // export default React.memo(NodesList, (prevProps, nextProps) => {
// //   {
// //     console.log(
// //       "compareNodes(prevProps.nodes, nextProps.nodes):",
// //       compareNodes(prevProps.nodes, nextProps.nodes)
// //     );
// //     if (compareNodes(prevProps.nodes, nextProps.nodes)) {
// //       console.log(prevProps.nodes);
// //       console.log(nextProps.nodes);
// //     }
// //   }
// //   return (
// //     compareNodes(prevProps.nodes, nextProps.nodes) &&
// //     prevProps.selectionType === nextProps.selectionType &&
// //     prevProps.NODE_WIDTH === nextProps.NODE_WIDTH &&
// //     prevProps.bookmark === nextProps.bookmark &&
// //     prevProps.markStudied === nextProps.markStudied &&
// //     prevProps.nodeChanged === nextProps.nodeChanged &&
// //     prevProps.chosenNodeChanged === nextProps.chosenNodeChanged &&
// //     prevProps.referenceLabelChange === nextProps.referenceLabelChange &&
// //     prevProps.deleteLink === nextProps.deleteLink &&
// //     prevProps.openLinkedNode === nextProps.openLinkedNode &&
// //     prevProps.openAllChildren === nextProps.openAllChildren &&
// //     prevProps.hideNodeHandler === nextProps.hideNodeHandler &&
// //     prevProps.hideOffsprings === nextProps.hideOffsprings &&
// //     prevProps.toggleNode === nextProps.toggleNode &&
// //     prevProps.openNodePart === nextProps.openNodePart &&
// //     prevProps.selectNode === nextProps.selectNode &&
// //     prevProps.nodeClicked === nextProps.nodeClicked &&
// //     prevProps.correctNode === nextProps.correctNode &&
// //     prevProps.wrongNode === nextProps.wrongNode &&
// //     prevProps.uploadNodeImage === nextProps.uploadNodeImage &&
// //     prevProps.removeImage === nextProps.removeImage &&
// //     prevProps.changeChoice === nextProps.changeChoice &&
// //     prevProps.changeFeedback === nextProps.changeFeedback &&
// //     prevProps.switchChoice === nextProps.switchChoice &&
// //     prevProps.deleteChoice === nextProps.deleteChoice &&
// //     prevProps.addChoice === nextProps.addChoice &&
// //     prevProps.saveProposedChildNode === nextProps.saveProposedChildNode &&
// //     prevProps.saveProposedImprovement === nextProps.saveProposedImprovement &&
// //     prevProps.closeSideBar === nextProps.closeSideBar &&
// //     prevProps.reloadPermanentGrpah === nextProps.reloadPermanentGrpah
// //   );
// // });
