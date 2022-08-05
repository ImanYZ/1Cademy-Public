import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { OpenPart } from '../../nodeBookTypes'

type NodeProps = {
  content: string,
  title: string,
  identifier: string,
  left: number,
  top: number,
  width: number,
  nodeChanged: (nodeRef: any, nodeId: string, content: string | null, title: string | null, imageLoaded: boolean, openPart: OpenPart) => void
}

const Node = ({ title, content, left, top, width, identifier, nodeChanged }: NodeProps) => {

  // GLOBAL STATES
  const choosingNode = useState(null); // <--- this was useRecoilValue
  const [, setChosenNode] = useState<string | null>(null); // <--- this was useSetRecoilState
  const [, setChosenNodeTitle] = useState<string | null>(null); // <--- this was useSetRecoilState

  // LOCAL STATES
  const [openPart, setOpenPart] = useState<OpenPart>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const nodeRef = useRef(null);

  // this call a nodeClicked from in map.js
  // IMPORTANT we need to move the node clicked here
  // const nodeClickHandler = useCallback(
  //   (event: React.MouseEventHandler<HTMLDivElement> | undefined) => {
  //     console.log('Click in node handel')
  //     if (choosingNode) {
  //       setChosenNode(identifier);
  //       setChosenNodeTitle(title);
  //     } else if (
  //       event &&
  //       "activeElement" in event.currentTarget &&
  //       "nodeName" in event.currentTarget.activeElement &&
  //       event.currentTarget.activeElement.nodeName !== "INPUT"
  //     ) {
  //       console.log('will try to call nodeClicked from map.js')
  //       nodeClicked(event, identifier, nodeType, setOpenPart);
  //     }
  //   },
  //   [choosingNode, identifier, title, nodeClicked, nodeType]
  // );
  const nodeClickHandler = () => console.log('Click in node handel')

  const locationSizeChange = useCallback(() => {
    nodeChanged(nodeRef, identifier, null, null, imageLoaded, openPart);
  }, [nodeChanged, nodeRef, identifier, imageLoaded, openPart]);

  useEffect(() => {
    setTimeout(() => {
      locationSizeChange();
    }, 700);
  }, [
    locationSizeChange,
    openPart,
    imageLoaded,
    // props.left,
    // props.top,
    nodeImage,
    open,
    editable,
    unaccepted,
    isNew,
    isTag,
    references.length,
    tags.length,
    parents.length,
    children.length,
    title,
    content,
    // Reasonably, we should not invoke props.nodeChanged when the following change, but otherwise, it does not fit the nodes vertically!
    // props.nodeChanged,
    // props.markedCorrect,
    // props.markedWrong,
    // props.viewers,
    // props.correctNum,
    // props.wrongNum,
    // props.commentsNum,
    // props.proposalsNum,
    // props.lastVisit,
    // props.studied,
    // props.isStudied,
    // props.changed,
    // props.changedAt,
    // props.bookmarked,
    // props.bookmarks,
  ]);

  return (
    <Box
      ref={nodeRef}
      id={identifier}
      onClick={nodeClickHandler}
      className='Node card'
      style={{
        left: left ? left : 1000,
        top: top ? top : 1000,
        width: width,
      }}>
      <Typography variant='h1' component={'h1'}>
        {title}
      </Typography>
      <Typography component={'p'}>
        {content}
      </Typography>
    </Box >
  )
}

export const MemoizedNode = React.memo(Node)
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useRecoilValue, useSetRecoilState } from "recoil";

// import {
//   choosingNodeState,
//   choosingTypeState,
//   chosenNodeState,
//   chosenNodeTitleState,
// } from "../../../store/NodeAtoms";
// import { openMediaState } from "../../../store/MapAtoms";

// import HyperEditor from "../../Editor/HyperEditor/HyperEditorWrapper";
// import NodeHeader from "./NodeHeader/NodeHeader";
// import NodeFooter from "./NodeFooter/NodeFooter";
// import LinkingWords from "./LinkingWords/LinkingWords";
// import QuestionChoices from "./QuestionChoices/QuestionChoices";
// import MetaButton from "../MetaButton/MetaButton";
// // import { Draft } from "../../Editor";
// // import { compareLinks, compareChoices, compareImages } from "../MapUtils";
// // import boxShadowCSSGenerator from "../../../utils/boxShadowCSSGenerator";

// import "./Node.css";

// const Node = (props) => {
//   const choosingNode = useRecoilValue(choosingNodeState);
//   const choosingType = useRecoilValue(choosingTypeState);
//   const setChosenNode = useSetRecoilState(chosenNodeState);
//   const setChosenNodeTitle = useSetRecoilState(chosenNodeTitleState);
//   const setOpenMedia = useSetRecoilState(openMediaState);

//   const [openPart, setOpenPart] = useState(null);
//   const [isHiding, setIsHiding] = useState(false);
//   const [imageLoaded, setImageLoaded] = useState(false);
//   // const [summary, setSummary] = useState("");
//   const [reason, setReason] = useState("");

//   const nodeRef = useRef(null);

//   const nodeClickHandler = useCallback(
//     (event) => {
//       if (choosingNode) {
//         setChosenNode(props.identifier);
//         setChosenNodeTitle(props.title);
//       } else if (
//         "activeElement" in event.currentTarget &&
//         "nodeName" in event.currentTarget.activeElement &&
//         event.currentTarget.activeElement.nodeName !== "INPUT"
//       ) {
//         props.nodeClicked(event, props.identifier, props.nodeType, setOpenPart);
//       }
//     },
//     [choosingNode, props.identifier, props.title, props.nodeClicked, props.nodeType]
//   );

//   const hideNodeHandler = useCallback(
//     () => props.hideNodeHandler(props.identifier, setIsHiding),
//     [props.hideNodeHandler, props.identifier]
//   );

//   const hideOffspringsHandler = useCallback(
//     () => props.hideOffsprings(props.identifier),
//     [props.hideOffsprings, props.identifier]
//   );

//   const toggleNodeHandler = useCallback(
//     (event) => {
//       event.persist();
//       props.toggleNode(event, props.identifier, props.open);
//     },
//     [props.toggleNode, props.identifier, props.open]
//   );

//   const removeImageHandler = useCallback(() => {
//     props.removeImage(nodeRef, props.identifier);
//   }, [nodeRef, props.removeImage, props.identifier]);

//   const onImageLoad = useCallback(() => setImageLoaded(true), []);

//   const onImageClick = useCallback(() => setOpenMedia(props.nodeImage), [props.nodeImage]);

//   const addChoiceHandler = useCallback(
//     () => props.addChoice(nodeRef, props.identifier),
//     [props.addChoice, nodeRef, props.identifier]
//   );

//   const markStudiedHandler = useCallback(
//     (event) => props.markStudied(event, props.identifier),
//     [props.markStudied, props.identifier]
//   );

//   const bookmarkHandler = useCallback(
//     (event) => props.bookmark(event, props.identifier),
//     [props.bookmark, props.identifier]
//   );

//   const openNodePartHandler = useCallback(
//     (event, partType) =>
//       props.openNodePart(event, props.identifier, partType, openPart, setOpenPart, props.tags),
//     [props.identifier, openPart, props.tags]
//   );

//   const selectNodeHandler = useCallback(
//     (event, chosenType) => props.selectNode(event, props.identifier, chosenType, props.nodeType),
//     [props.selectNode, props.identifier, props.nodeType]
//   );

//   const correctNodeHandler = useCallback(
//     (event) => props.correctNode(event, props.identifier, props.nodeType),
//     [props.correctNode, props.identifier, props.nodeType]
//   );

//   const wrongNodeHandler = useCallback(
//     (event) =>
//       props.wrongNode(
//         event,
//         props.identifier,
//         props.nodeType,
//         props.markedWrong,
//         props.markedCorrect,
//         props.wrongNum,
//         props.correctNum
//       ),
//     [
//       props.wrongNode,
//       props.identifier,
//       props.nodeType,
//       props.markedWrong,
//       props.wrongNum,
//       props.correctNum,
//     ]
//   );

//   const uploadNodeImageHandler = useCallback(
//     (event, isUploading, setIsUploading, setPercentageUploaded) =>
//       props.uploadNodeImage(
//         event,
//         nodeRef,
//         props.identifier,
//         isUploading,
//         setIsUploading,
//         setPercentageUploaded
//       ),
//     [props.uploadNodeImage, nodeRef, props.identifier]
//   );

//   const referenceLabelChangeHandler = useCallback(
//     (event, referenceIdx) => {
//       return props.referenceLabelChange(event, props.identifier, referenceIdx);
//     },
//     [props.referenceLabelChange, props.identifier]
//   );

//   const deleteLinkHandler = useCallback(
//     (linkIdx, linkType) => props.deleteLink(props.identifier, linkIdx, linkType),
//     [props.deleteLink, props.identifier]
//   );

//   const titleChange = useCallback(
//     (value) => {
//       props.nodeChanged(nodeRef, props.identifier, null, value, imageLoaded, openPart);
//     },
//     [props.nodeChanged, nodeRef, props.identifier, imageLoaded, openPart]
//   );

//   const contentChange = useCallback(
//     (value) => {
//       props.nodeChanged(nodeRef, props.identifier, value, null, imageLoaded, openPart);
//     },
//     [props.nodeChanged, nodeRef, props.identifier, imageLoaded, openPart]
//   );

//   const locationSizeChange = useCallback(() => {
//     props.nodeChanged(nodeRef, props.identifier, null, null, imageLoaded, openPart);
//   }, [props.nodeChanged, nodeRef, props.identifier, imageLoaded, openPart]);

//   useEffect(() => {
//     setTimeout(() => {
//       locationSizeChange();
//     }, 700);
//   }, [
//     locationSizeChange,
//     openPart,
//     imageLoaded,
//     // props.left,
//     // props.top,
//     props.nodeImage,
//     props.open,
//     props.editable,
//     props.unaccepted,
//     props.isNew,
//     props.isTag,
//     props.references.length,
//     props.tags.length,
//     props.parents.length,
//     props.children.length,
//     props.title,
//     props.content,
//     // Reasonably, we should not invoke props.nodeChanged when the following change, but otherwise, it does not fit the nodes vertically!
//     // props.nodeChanged,
//     // props.markedCorrect,
//     // props.markedWrong,
//     // props.viewers,
//     // props.correctNum,
//     // props.wrongNum,
//     // props.commentsNum,
//     // props.proposalsNum,
//     // props.lastVisit,
//     // props.studied,
//     // props.isStudied,
//     // props.changed,
//     // props.changedAt,
//     // props.bookmarked,
//     // props.bookmarks,
//   ]);

//   useEffect(() => {
//     if (props.editable) {
//       setOpenPart("References");
//     }
//   }, [props.editable]);

//   useEffect(() => {
//     if (!props.editable && !props.activeNode) {
//       setOpenPart(null);
//     }
//   }, [props.editable, props.activeNode]);

//   return (
//     // const boxShadowCSS = boxShadowCSSGenerator(selectionType);
//     <div
//       ref={nodeRef}
//       id={props.identifier}
//       onClick={nodeClickHandler}
//       className={
//         "Node card" +
//         (props.activeNode
//           ? //   &&
//             // ["AcceptedProposals", "Proposals", "Comments"].includes(selectionType)
//             " active"
//           : "") +
//         (props.changed || !props.isStudied ? " Changed" : "") +
//         (isHiding ? " IsHiding" : "") +
//         (choosingNode &&
//         choosingNode !== props.identifier &&
//         !props.activeNode &&
//         (choosingType !== "Reference" || props.nodeType === "Reference")
//           ? " Choosable"
//           : "")
//       }
//       style={{
//         left: props.left ? props.left : 1000,
//         top: props.top ? props.top : 1000,
//         width: props.width,
//       }}
//       // style={
//       //   props.activeNode
//       //     ? {
//       //         left: props.left,
//       //         top: props.top,
//       //         width: props.width,
//       //         WebkitBoxShadow: boxShadowCSS,
//       //         MozBoxShadow: boxShadowCSS,
//       //         boxShadow: boxShadowCSS
//       //       }
//       //     : {
//       //         left: props.left,
//       //         top: props.top,
//       //         width: props.width
//       //       }
//       // }
//     >
//       {props.open ? (
//         <>
//           <div className="card-content">
//             <div className="card-title">
//               {props.editable &&
//                 (props.isNew ? (
//                   <>
//                     <p className="NewChildProposalWarning">Before proposing,</p>
//                     <p className="NewChildProposalWarning">
//                       - Search <i className="material-icons EditingNodeSearchIcon">search</i> to
//                       ensure the node does not exist.
//                     </p>
//                     {(props.nodeType === "Concept" ||
//                       props.nodeType === "Relation" ||
//                       props.nodeType === "Question" ||
//                       props.nodeType === "News") &&
//                       props.references.length === 0 && (
//                         <p className="NewChildProposalWarning">
//                           - Make the reference nodes that you'd like to cite, visible on your map
//                           view.
//                         </p>
//                       )}
//                     <p id="NewChildProposalTitleHint">Please enter the node title below:</p>
//                   </>
//                 ) : (
//                   <p id="NewChildProposalTitleHint">Please edit the node title below:</p>
//                 ))}
//               <HyperEditor
//                 readOnly={!props.editable}
//                 onChange={titleChange}
//                 onBlur={props.onNodeTitleBLur(props.title)}
//                 content={props.title}
//                 width={props.width}
//               />
//               {!props.editable && !props.unaccepted && !choosingNode && (
//                 <NodeHeader
//                   identifier={props.identifier}
//                   open={true}
//                   nodeType={props.nodeType}
//                   setIsHiding={setIsHiding}
//                   parentsNum={props.parents.length}
//                   hideNodeHandler={hideNodeHandler}
//                   hideOffsprings={hideOffspringsHandler}
//                   toggleNode={toggleNodeHandler}
//                 />
//               )}
//             </div>
//             <div className="NodeContent">
//               {props.editable && <p>Please edit the node content below:</p>}
//               <HyperEditor
//                 readOnly={!props.editable}
//                 onChange={contentChange}
//                 content={props.content}
//                 width={props.width}
//               />
//               {"nodeImage" in props && props.nodeImage !== "" && (
//                 <>
//                   {props.editable && (
//                     <div className="RemoveImageDIV">
//                       <MetaButton onClick={removeImageHandler} tooltip="Click to remove the image.">
//                         <div className="CloseButton">
//                           <i className="material-icons orange-text">delete_forever</i>
//                         </div>
//                       </MetaButton>
//                     </div>
//                   )}
//                   {/* <a href={props.nodeImage} target="_blank"> */}
//                   <img
//                     src={props.nodeImage}
//                     alt="Node image"
//                     className="responsive-img NodeImage"
//                     onLoad={onImageLoad}
//                     onClick={onImageClick}
//                   />
//                   {/* </a> */}
//                 </>
//               )}
//               {props.nodeType === "Question" && "choices" in props && (
//                 <>
//                   <ul className="collapsible">
//                     {props.choices.map((choice, idx) => {
//                       return (
//                         <QuestionChoices
//                           key={props.identifier + "Choice" + idx}
//                           identifier={props.identifier}
//                           nodeRef={nodeRef}
//                           editable={props.editable}
//                           choices={props.choices}
//                           idx={idx}
//                           choicesNum={props.choices.length}
//                           choice={choice}
//                           deleteChoice={props.deleteChoice}
//                           switchChoice={props.switchChoice}
//                           changeChoice={props.changeChoice}
//                           changeFeedback={props.changeFeedback}
//                           nodeChanged={locationSizeChange}
//                         />
//                       );
//                     })}
//                   </ul>
//                   {props.editable && (
//                     <div className="QuestionAddChoice">
//                       <MetaButton
//                         onClick={addChoiceHandler}
//                         tooltip="Click to add a new choice to this question."
//                       >
//                         <i className="material-icons green-text">add</i> Add Choice
//                       </MetaButton>
//                     </div>
//                   )}
//                 </>
//               )}
//               {props.editable && (
//                 <>
//                   <p className="ProposalTitle">
//                     {"To expedite your proposal review, explain why you propose this " +
//                       (props.isNew ? props.nodeType + " child node:" : "new version:")}
//                   </p>
//                   <HyperEditor content={reason} readOnly={false} onChange={setReason} />
//                   {/* <p className="ProposalTitle">
//                       Please write a few words to summarize what you've proposed
//                       in this version:
//                     </p>
//                     <HyperEditor
//                       content={summary}
//                       readOnly={false}
//                       onChange={setSummary}
//                     /> */}
//                 </>
//               )}
//               <NodeFooter
//                 open={true}
//                 identifier={props.identifier}
//                 activeNode={props.activeNode}
//                 citationsSelected={props.citationsSelected}
//                 proposalsSelected={props.proposalsSelected}
//                 acceptedProposalsSelected={props.acceptedProposalsSelected}
//                 commentsSelected={props.commentsSelected}
//                 editable={props.editable}
//                 title={props.title}
//                 content={props.content}
//                 unaccepted={props.unaccepted}
//                 openPart={openPart}
//                 nodeType={props.nodeType}
//                 isNew={props.isNew}
//                 admin={props.admin}
//                 aImgUrl={props.aImgUrl}
//                 aFullname={props.aFullname}
//                 aChooseUname={props.aChooseUname}
//                 viewers={props.viewers}
//                 correctNum={props.correctNum}
//                 markedCorrect={props.markedCorrect}
//                 wrongNum={props.wrongNum}
//                 markedWrong={props.markedWrong}
//                 references={props.references}
//                 tags={props.tags}
//                 parents={props.parents}
//                 children={props.children}
//                 commentsNum={props.commentsNum}
//                 proposalsNum={props.proposalsNum}
//                 studied={props.studied}
//                 isStudied={props.isStudied}
//                 changed={props.changed}
//                 changedAt={props.changedAt}
//                 bookmarked={props.bookmarked}
//                 bookmarks={props.bookmarks}
//                 reloadPermanentGrpah={props.reloadPermanentGrpah}
//                 markStudied={markStudiedHandler}
//                 bookmark={bookmarkHandler}
//                 nodeChanged={locationSizeChange}
//                 openNodePart={openNodePartHandler}
//                 selectNode={selectNodeHandler}
//                 correctNode={correctNodeHandler}
//                 wrongNode={wrongNodeHandler}
//                 uploadNodeImage={uploadNodeImageHandler}
//               />
//             </div>
//           </div>
//           {(openPart === "LinkingWords" || openPart === "Tags" || openPart === "References") && (
//             <LinkingWords
//               identifier={props.identifier}
//               editable={props.editable}
//               isNew={props.isNew}
//               openPart={openPart}
//               title={props.title}
//               reason={reason}
//               references={props.references}
//               tags={props.tags}
//               parents={props.parents}
//               children={props.children}
//               chosenNodeChanged={props.chosenNodeChanged}
//               referenceLabelChange={referenceLabelChangeHandler}
//               deleteLink={deleteLinkHandler}
//               openLinkedNode={props.openLinkedNode}
//               openAllChildren={props.openAllChildren}
//               saveProposedChildNode={props.saveProposedChildNode}
//               saveProposedImprovement={props.saveProposedImprovement}
//               closeSideBar={props.closeSideBar}
//             />
//           )}
//         </>
//       ) : (
//         <div className="card-content">
//           <div className="card-title">
//             <div className="NodeTitleClosed">
//               <HyperEditor
//                 readOnly={true}
//                 onChange={titleChange}
//                 content={props.title}
//                 width={props.width}
//               />
//             </div>
//             {!choosingNode && (
//               <NodeHeader
//                 identifier={props.identifier}
//                 open={false}
//                 nodeType={props.nodeType}
//                 setIsHiding={setIsHiding}
//                 parentsNum={props.parents.length}
//                 hideNodeHandler={hideNodeHandler}
//                 hideOffsprings={hideOffspringsHandler}
//                 toggleNode={toggleNodeHandler}
//               />
//             )}
//             <div className="footer">
//               <NodeFooter
//                 open={false}
//                 identifier={props.identifier}
//                 activeNode={props.activeNode}
//                 citationsSelected={props.citationsSelected}
//                 proposalsSelected={props.proposalsSelected}
//                 acceptedProposalsSelected={props.acceptedProposalsSelected}
//                 commentsSelected={props.commentsSelected}
//                 editable={props.editable}
//                 unaccepted={props.unaccepted}
//                 openPart={openPart}
//                 nodeType={props.nodeType}
//                 admin={props.admin}
//                 aImgUrl={props.aImgUrl}
//                 aFullname={props.aFullname}
//                 aChooseUname={props.aChooseUname}
//                 viewers={props.viewers}
//                 correctNum={props.correctNum}
//                 markedCorrect={props.markedCorrect}
//                 wrongNum={props.wrongNum}
//                 markedWrong={props.markedWrong}
//                 references={props.references}
//                 tags={props.tags}
//                 parents={props.parents}
//                 children={props.children}
//                 commentsNum={props.commentsNum}
//                 proposalsNum={props.proposalsNum}
//                 studied={props.studied}
//                 isStudied={props.isStudied}
//                 changedAt={props.changedAt}
//                 bookmarked={props.bookmarked}
//                 bookmarks={props.bookmarks}
//                 reloadPermanentGrpah={props.reloadPermanentGrpah}
//                 nodeChanged={locationSizeChange}
//                 openNodePart={openNodePartHandler}
//                 selectNode={selectNodeHandler}
//                 correctNode={correctNodeHandler}
//                 wrongNode={wrongNodeHandler}
//                 uploadNodeImage={uploadNodeImageHandler}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default React.memo(Node);













// ------------------->>  ------------------->>  ------------------->>
// THIS CODE WAS COMMENTED

// export default React.memo(Node, (prevProps, nextProps) => {
//   {
//     // if (prevProps.identifier !== nextProps.identifier) console.log("title:", prevProps.title, "\nprevProps.identifier:", prevProps.identifier, "nextProps.identifier:", nextProps.identifier);
//     // if (prevProps.nodeType !== nextProps.nodeType) console.log("title:", prevProps.title, "\nprevProps.nodeType:", prevProps.nodeType, "nextProps.nodeType:", nextProps.nodeType);
//     // if (prevProps.left !== nextProps.left) console.log("title:", prevProps.title, "\nprevProps.left:", prevProps.left, "nextProps.left:", nextProps.left);
//     // if (prevProps.top !== nextProps.top) console.log("title:", prevProps.title, "\nprevProps.top:", prevProps.top, "nextProps.top:", nextProps.top);
//     // if (prevProps.width !== nextProps.width) console.log("title:", prevProps.title, "\nprevProps.width:", prevProps.width, "nextProps.width:", nextProps.width);
//     // if (prevProps.open !== nextProps.open) console.log("title:", prevProps.title, "\nprevProps.open:", prevProps.open, "nextProps.open:", nextProps.open);
//     // if (prevProps.editable !== nextProps.editable) console.log("title:", prevProps.title, "\nprevProps.editable:", prevProps.editable, "nextProps.editable:", nextProps.editable);
//     // if (prevProps.unaccepted !== nextProps.unaccepted) console.log("title:", prevProps.title, "\nprevProps.unaccepted:", prevProps.unaccepted, "nextProps.unaccepted:", nextProps.unaccepted);
//     // if (prevProps.isNew !== nextProps.isNew) console.log("title:", prevProps.title, "\nprevProps.isNew:", prevProps.isNew, "nextProps.isNew:", nextProps.isNew);
//     // if (prevProps.isTag !== nextProps.isTag) console.log("title:", prevProps.title, "\nprevProps.isTag:", prevProps.isTag, "nextProps.isTag:", nextProps.isTag);
//     // if (prevProps.title !== nextProps.title) console.log("title:", prevProps.title, "\nprevProps.title:", prevProps.title, "nextProps.title:", nextProps.title);
//     // if (prevProps.content !== nextProps.content) console.log("title:", prevProps.title, "\nprevProps.content:", prevProps.content, "nextProps.content:", nextProps.content);
//     // if (prevProps.viewers !== nextProps.viewers) console.log("title:", prevProps.title, "\nprevProps.viewers:", prevProps.viewers, "nextProps.viewers:", nextProps.viewers);
//     // if (prevProps.studied !== nextProps.studied) console.log("title:", prevProps.title, "\nprevProps.studied:", prevProps.studied, "nextProps.studied:", nextProps.studied);
//     // if (prevProps.isStudied !== nextProps.isStudied) console.log("title:", prevProps.title, "\nprevProps.isStudied:", prevProps.isStudied, "nextProps.isStudied:", nextProps.isStudied);
//     // if (prevProps.correctNum !== nextProps.correctNum) console.log("title:", prevProps.title, "\nprevProps.correctNum:", prevProps.correctNum, "nextProps.correctNum:", nextProps.correctNum);
//     // if (prevProps.markedCorrect !== nextProps.markedCorrect) console.log("title:", prevProps.title, "\nprevProps.markedCorrect:", prevProps.markedCorrect, "nextProps.markedCorrect:", nextProps.markedCorrect);
//     // if (prevProps.wrongNum !== nextProps.wrongNum) console.log("title:", prevProps.title, "\nprevProps.wrongNum:", prevProps.wrongNum, "nextProps.wrongNum:", nextProps.wrongNum);
//     // if (prevProps.markedWrong !== nextProps.markedWrong) console.log("title:", prevProps.title, "\nprevProps.markedWrong:", prevProps.markedWrong, "nextProps.markedWrong:", nextProps.markedWrong);
//     // if (prevProps.commentsNum !== nextProps.commentsNum) console.log("title:", prevProps.title, "\nprevProps.commentsNum:", prevProps.commentsNum, "nextProps.commentsNum:", nextProps.commentsNum);
//     // if (prevProps.proposalsNum !== nextProps.proposalsNum) console.log("title:", prevProps.title, "\nprevProps.proposalsNum:", prevProps.proposalsNum, "nextProps.proposalsNum:", nextProps.proposalsNum);
//     // if (prevProps.changedAt !== nextProps.changedAt) console.log("title:", prevProps.title, "\nprevProps.changedAt:", prevProps.changedAt, "nextProps.changedAt:", nextProps.changedAt);
//     // if (prevProps.nodeChanged !== nextProps.nodeChanged) console.log("title:", prevProps.title, "\nprevProps.nodeChanged:", prevProps.nodeChanged, "nextProps.nodeChanged:", nextProps.nodeChanged);
//     // if (!compareLinks(prevProps.references, nextProps.references, true)) console.log("title:", prevProps.title, "\nprevProps.references:", prevProps.references, "nextProps.references:", nextProps.references);
//     // if (!compareLinks(prevProps.tags, nextProps.tags, true)) console.log("title:", prevProps.title, "\nprevProps.tags:", prevProps.tags, "nextProps.tags:", nextProps.tags);
//     // if (!compareLinks(prevProps.parents, nextProps.parents, true)) console.log("title:", prevProps.title, "\nprevProps.parents:", prevProps.parents, "nextProps.parents:", nextProps.parents);
//     // if (!compareLinks(prevProps.children, nextProps.children, true)) console.log("title:", prevProps.title, "\nprevProps.children:", prevProps.children, "nextProps.children:", nextProps.children);
//     // if (!compareChoices(prevProps, nextProps, true)) console.log("title:", prevProps.title, "\nprevProps.choices:", prevProps.choices, "nextProps.choices:", nextProps.choices);
//     // if (!compareImages(prevProps, nextProps, true)) console.log("title:", prevProps.title, "\nprevProps.nodeImage:", prevProps.nodeImage, "nextProps.nodeImage:", nextProps.nodeImage);
//     // if (prevProps.nodeChanged !== nextProps.nodeChanged) console.log("title:", prevProps.title, "\nprevProps.nodeChanged:", prevProps.nodeChanged, "nextProps.nodeChanged:", nextProps.nodeChanged);
//     // if (prevProps.hideNodeHandler !== nextProps.hideNodeHandler) console.log("title:", prevProps.title, "\nprevProps.hideNodeHandler:", prevProps.hideNodeHandler, "nextProps.hideNodeHandler:", nextProps.hideNodeHandler);
//     // if (prevProps.hideOffsprings !== nextProps.hideOffsprings) console.log("title:", prevProps.title, "\nprevProps.hideOffsprings:", prevProps.hideOffsprings, "nextProps.hideOffsprings:", nextProps.hideOffsprings);
//     // if (prevProps.toggleNode !== nextProps.toggleNode) console.log("title:", prevProps.title, "\nprevProps.toggleNode:", prevProps.toggleNode, "nextProps.toggleNode:", nextProps.toggleNode);
//     // if (prevProps.removeImage !== nextProps.removeImage) console.log("title:", prevProps.title, "\nprevProps.removeImage:", prevProps.removeImage, "nextProps.removeImage:", nextProps.removeImage);
//     // if (prevProps.changeChoice !== nextProps.changeChoice) console.log("title:", prevProps.title, "\nprevProps.changeChoice:", prevProps.changeChoice, "nextProps.changeChoice:", nextProps.changeChoice);
//     // if (prevProps.changeFeedback !== nextProps.changeFeedback) console.log("title:", prevProps.title, "\nprevProps.changeFeedback:", prevProps.changeFeedback, "nextProps.changeFeedback:", nextProps.changeFeedback);
//     // if (prevProps.switchChoice !== nextProps.switchChoice) console.log("title:", prevProps.title, "\nprevProps.switchChoice:", prevProps.switchChoice, "nextProps.switchChoice:", nextProps.switchChoice);
//     // if (prevProps.deleteChoice !== nextProps.deleteChoice) console.log("title:", prevProps.title, "\nprevProps.deleteChoice:", prevProps.deleteChoice, "nextProps.deleteChoice:", nextProps.deleteChoice);
//     // if (prevProps.addChoice !== nextProps.addChoice) console.log("title:", prevProps.title, "\nprevProps.addChoice:", prevProps.addChoice, "nextProps.addChoice:", nextProps.addChoice);
//   }
//   return (
//     prevProps.identifier === nextProps.identifier &&
//     prevProps.activeNode === nextProps.activeNode &&
//     prevProps.citationsSelected === nextProps.citationsSelected &&
//     prevProps.proposalsSelected === nextProps.proposalsSelected &&
//     prevProps.acceptedProposalsSelected ===
//       nextProps.acceptedProposalsSelected &&
//     prevProps.commentsSelected === nextProps.commentsSelected &&
//     prevProps.nodeType === nextProps.nodeType &&
//     prevProps.admin === nextProps.admin &&
//     prevProps.aImgUrl === nextProps.aImgUrl &&
//     prevProps.left === nextProps.left &&
//     prevProps.top === nextProps.top &&
//     prevProps.width === nextProps.width &&
//     prevProps.open === nextProps.open &&
//     prevProps.editable === nextProps.editable &&
//     prevProps.unaccepted === nextProps.unaccepted &&
//     prevProps.isNew === nextProps.isNew &&
//     prevProps.isTag === nextProps.isTag &&
//     prevProps.title === nextProps.title &&
//     prevProps.content === nextProps.content &&
//     prevProps.viewers === nextProps.viewers &&
//     prevProps.correctNum === nextProps.correctNum &&
//     prevProps.markedCorrect === nextProps.markedCorrect &&
//     prevProps.wrongNum === nextProps.wrongNum &&
//     prevProps.markedWrong === nextProps.markedWrong &&
//     prevProps.commentsNum === nextProps.commentsNum &&
//     prevProps.proposalsNum === nextProps.proposalsNum &&
//     prevProps.studied === nextProps.studied &&
//     prevProps.isStudied === nextProps.isStudied &&
//     prevProps.changed === nextProps.changed &&
//     prevProps.changedAt === nextProps.changedAt &&
//     prevProps.lastVisit.getTime() === nextProps.lastVisit.getTime() &&
//     prevProps.bookmarked === nextProps.bookmarked &&
//     prevProps.bookmarks === nextProps.bookmarks &&
//     compareLinks(prevProps.references, nextProps.references, true, false) &&
//     compareLinks(prevProps.tags, nextProps.tags, true, false) &&
//     compareLinks(prevProps.parents, nextProps.parents, true, true) &&
//     compareLinks(prevProps.children, nextProps.children, true, true) &&
//     compareChoices(prevProps, nextProps, true) &&
//     compareImages(prevProps, nextProps, true) &&
//     prevProps.bookmark === nextProps.bookmark &&
//     prevProps.markStudied === nextProps.markStudied &&
//     prevProps.nodeChanged === nextProps.nodeChanged &&
//     prevProps.chosenNodeChanged === nextProps.chosenNodeChanged &&
//     prevProps.referenceLabelChange === nextProps.referenceLabelChange &&
//     prevProps.deleteLink === nextProps.deleteLink &&
//     prevProps.openLinkedNode === nextProps.openLinkedNode &&
//     prevProps.openAllChildren === nextProps.openAllChildren &&
//     prevProps.saveProposedChildNode === nextProps.saveProposedChildNode &&
//     prevProps.saveProposedImprovement === nextProps.saveProposedImprovement &&
//     prevProps.closeSideBar === nextProps.closeSideBar &&
//     prevProps.hideNodeHandler === nextProps.hideNodeHandler &&
//     prevProps.hideOffsprings === nextProps.hideOffsprings &&
//     prevProps.toggleNode === nextProps.toggleNode &&
//     prevProps.openNodePart === nextProps.openNodePart &&
//     prevProps.selectNode === nextProps.selectNode &&
//     prevProps.nodeClicked === nextProps.nodeClicked &&
//     prevProps.correctNode === nextProps.correctNode &&
//     prevProps.wrongNode === nextProps.wrongNode &&
//     prevProps.uploadNodeImage === nextProps.uploadNodeImage &&
//     prevProps.removeImage === nextProps.removeImage &&
//     prevProps.changeChoice === nextProps.changeChoice &&
//     prevProps.changeFeedback === nextProps.changeFeedback &&
//     prevProps.switchChoice === nextProps.switchChoice &&
//     prevProps.deleteChoice === nextProps.deleteChoice &&
//     prevProps.addChoice === nextProps.addChoice
//   );
// });
// <<-------------------  <<-------------------  <<-------------------