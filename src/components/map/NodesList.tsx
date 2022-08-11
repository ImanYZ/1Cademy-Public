import React from "react";
import { OpenPart } from "src/nodeBookTypes";

import { useNodeBook } from "@/context/NodeBookContext";
import { NODE_WIDTH } from "@/lib/utils/Map.utils";

import Node from "./Node";

type NodeListProps = {
  nodes: any;
  // selectionType: any,
  // NODE_WIDTH: number,
  bookmark: any;
  markStudied: any;
  nodeChanged: (
    nodeRef: any,
    nodeId: string,
    content: string | null,
    title: string | null,
    imageLoaded: boolean,
    openPart: OpenPart
  ) => void;
  chosenNodeChanged: any;
  referenceLabelChange: any;
  deleteLink: any;
  openLinkedNode: any;
  openAllChildren: any;
  hideNodeHandler: any;
  hideOffsprings: any;
  toggleNode: any;
  openNodePart: any;
  selectNode: any;
  nodeClicked: any;
  correctNode: any;
  wrongNode: any;
  uploadNodeImage: any;
  removeImage: any;
  changeChoice: any;
  changeFeedback: any;
  switchChoice: any;
  deleteChoice: any;
  addChoice: any;
  onNodeTitleBlur: any;
  saveProposedChildNode: any;
  saveProposedImprovement: any;
  closeSideBar: any;
  reloadPermanentGrpah: any;
};

const NodesList = ({
  nodes,
  nodeChanged,
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
  changeChoice,
  changeFeedback,
  switchChoice,
  deleteChoice,
  addChoice,
  onNodeTitleBlur,
  saveProposedChildNode,
  saveProposedImprovement,
  closeSideBar,
  reloadPermanentGrpah
}: NodeListProps) => {
  const { nodeBookState } = useNodeBook();

  return (<>
    {
      Object.keys(nodes).map(nId => {
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
          <Node
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
            references={nodes[nId].references}
            tags={nodes[nId].tags}
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
            nodeChanged={nodeChanged}
            chosenNodeChanged={chosenNodeChanged}
            referenceLabelChange={referenceLabelChange}
            deleteLink={deleteLink}
            openLinkedNode={openLinkedNode}
            openAllChildren={openAllChildren}
            hideNodeHandler={hideNodeHandler}
            hideOffsprings={hideOffsprings}
            toggleNode={toggleNode}
            openNodePart={openNodePart}
            selectNode={selectNode}
            nodeClicked={nodeClicked}
            correctNode={correctNode}
            wrongNode={wrongNode}
            uploadNodeImage={uploadNodeImage}
            removeImage={removeImage}
            changeChoice={changeChoice}
            changeFeedback={changeFeedback}
            switchChoice={switchChoice}
            deleteChoice={deleteChoice}
            addChoice={addChoice}
            onNodeTitleBLur={onNodeTitleBlur}
            saveProposedChildNode={saveProposedChildNode}
            saveProposedImprovement={saveProposedImprovement}
            closeSideBar={closeSideBar}
            reloadPermanentGrpah={reloadPermanentGrpah}
          />
        );
      })
    }
  </>);
};
export default NodesList;

// import React from "react";
// import { useRecoilValue } from "recoil";

// import { selectedNodeState } from "../../store/MapAtoms";

// import Node from "./Node/Node";

// import { compareNodes } from "./MapUtils";

// const NodesList = ({
//   nodes,
//   selectionType,
//   NODE_WIDTH,
//   bookmark,
//   markStudied,
//   nodeChanged,
//   chosenNodeChanged,
//   referenceLabelChange,
//   deleteLink,
//   openLinkedNode,
//   openAllChildren,
//   hideNodeHandler,
//   hideOffsprings,
//   toggleNode,
//   openNodePart,
//   selectNode,
//   nodeClicked,
//   correctNode,
//   wrongNode,
//   uploadNodeImage,
//   removeImage,
//   changeChoice,
//   changeFeedback,
//   switchChoice,
//   deleteChoice,
//   addChoice,
//   onNodeTitleBlur,
//   saveProposedChildNode,
//   saveProposedImprovement,
//   closeSideBar,
//   reloadPermanentGrpah,
// }) => {
//   const selectedNode = useRecoilValue(selectedNodeState);

//   return Object.keys(nodes).map((nId) => {
//     let unaccepted = false;
//     if ("unaccepted" in nodes[nId]) {
//       unaccepted = nodes[nId].unaccepted;
//     }
//     let bookmarks = 0;
//     if ("bookmarks" in nodes[nId] && Number(nodes[nId].bookmarks)) {
//       bookmarks = nodes[nId].bookmarks;
//     }
//     let bookmarked = false;
//     if ("bookmarked" in nodes[nId]) {
//       bookmarked = nodes[nId].bookmarked;
//     }
//     let activeNode = false;
//     if (selectedNode === nId) {
//       activeNode = true;
//     }
//     let citationsSelected = false;
//     if (selectedNode === nId && selectionType === "Citations") {
//       citationsSelected = true;
//     }
//     let proposalsSelected = false;
//     if (selectedNode === nId && selectionType === "Proposals") {
//       proposalsSelected = true;
//     }
//     let acceptedProposalsSelected = false;
//     if (selectedNode === nId && selectionType === "AcceptedProposals") {
//       acceptedProposalsSelected = true;
//     }
//     let commentsSelected = false;
//     if (selectedNode === nId && selectionType === "Comments") {
//       commentsSelected = true;
//     }
//     return (
//       <Node
//         key={nId}
//         identifier={nId}
//         activeNode={activeNode}
//         citationsSelected={citationsSelected}
//         proposalsSelected={proposalsSelected}
//         acceptedProposalsSelected={acceptedProposalsSelected}
//         commentsSelected={commentsSelected}
//         open={nodes[nId].open}
//         left={nodes[nId].left}
//         top={nodes[nId].top}
//         width={NODE_WIDTH}
//         editable={nodes[nId].editable}
//         unaccepted={unaccepted}
//         nodeType={nodes[nId].nodeType}
//         isTag={nodes[nId].hasOwnProperty("isTag") && nodes[nId].isTag}
//         isNew={nodes[nId].hasOwnProperty("isNew") && nodes[nId].isNew}
//         title={nodes[nId].title}
//         content={nodes[nId].content}
//         nodeImage={nodes[nId].nodeImage}
//         viewers={nodes[nId].viewers}
//         correctNum={nodes[nId].corrects}
//         markedCorrect={nodes[nId].correct}
//         wrongNum={nodes[nId].wrongs}
//         markedWrong={nodes[nId].wrong}
//         references={nodes[nId].references}
//         tags={nodes[nId].tags}
//         parents={nodes[nId].parents}
//         children={nodes[nId].children}
//         choices={nodes[nId].choices}
//         commentsNum={nodes[nId].comments}
//         proposalsNum={nodes[nId].versions}
//         admin={nodes[nId].admin}
//         aImgUrl={nodes[nId].aImgUrl}
//         aFullname={nodes[nId].aFullname}
//         aChooseUname={nodes[nId].aChooseUname}
//         lastVisit={nodes[nId].lastVisit}
//         studied={nodes[nId].studied}
//         isStudied={nodes[nId].isStudied}
//         changed={nodes[nId].changed}
//         changedAt={nodes[nId].changedAt}
//         bookmarked={bookmarked}
//         bookmarks={bookmarks}
//         bookmark={bookmark}
//         markStudied={markStudied}
//         nodeChanged={nodeChanged}
//         chosenNodeChanged={chosenNodeChanged}
//         referenceLabelChange={referenceLabelChange}
//         deleteLink={deleteLink}
//         openLinkedNode={openLinkedNode}
//         openAllChildren={openAllChildren}
//         hideNodeHandler={hideNodeHandler}
//         hideOffsprings={hideOffsprings}
//         toggleNode={toggleNode}
//         openNodePart={openNodePart}
//         selectNode={selectNode}
//         nodeClicked={nodeClicked}
//         correctNode={correctNode}
//         wrongNode={wrongNode}
//         uploadNodeImage={uploadNodeImage}
//         removeImage={removeImage}
//         changeChoice={changeChoice}
//         changeFeedback={changeFeedback}
//         switchChoice={switchChoice}
//         deleteChoice={deleteChoice}
//         addChoice={addChoice}
//         onNodeTitleBLur={onNodeTitleBlur}
//         saveProposedChildNode={saveProposedChildNode}
//         saveProposedImprovement={saveProposedImprovement}
//         closeSideBar={closeSideBar}
//         reloadPermanentGrpah={reloadPermanentGrpah}
//       />
//     );
//   });
// };

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
