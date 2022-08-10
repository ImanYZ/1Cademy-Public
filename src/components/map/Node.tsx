/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { OpenPart } from "src/nodeBookTypes";

import { useNodeBook } from "@/context/NodeBookContext";
import { Box } from "@mui/material";

// import HyperEditor from "../../Editor/HyperEditor/HyperEditorWrapper";
// import NodeHeader from "./NodeHeader/NodeHeader";
// import NodeFooter from "./NodeFooter/NodeFooter";
// import LinkingWords from "./LinkingWords/LinkingWords";
// import QuestionChoices from "./QuestionChoices/QuestionChoices";
// import MetaButton from "../MetaButton/MetaButton";
// import { admin } from "@/lib/firestoreServer/admin";
// import { Draft } from "../../Editor";
// import { compareLinks, compareChoices, compareImages } from "../MapUtils";
// import boxShadowCSSGenerator from "../../../utils/boxShadowCSSGenerator";

// import "./Node.css";

type NodeProps = {
  identifier: string;
  activeNode: any;//organize this i a better forme
  citationsSelected: any;//
  proposalsSelected: any;//
  acceptedProposalsSelected: any;//
  commentsSelected: any;
  open: boolean;
  left: number;
  top: number;
  width: number;
  editable: boolean;
  unaccepted: any;//
  nodeType: string;
  isTag: boolean;
  isNew: any;//
  title: string;
  content: string;
  nodeImage: string;
  viewers: number;
  correctNum: any;//
  markedCorrect: any;//
  wrongNum: any;//
  markedWrong: any;//
  references: string[];
  tags: string[] | { node: string; title?: string; label?: string }[];
  parents: string[];
  children: string[] | { node: string; title?: string; label?: string }[];
  choices: string[];
  commentsNum: number;
  proposalsNum: number;
  admin: string;
  aImgUrl: string;
  aFullname: string;
  aChooseUname: boolean;
  lastVisit: string;
  studied: number;
  isStudied: boolean;
  changed: any;//
  changedAt: string;
  bookmarked: boolean;
  bookmarks: any;//
  bookmark: any;//
  markStudied: any;//
  nodeChanged: (
    nodeRef: any,
    nodeId: string,
    content: string | null,
    title: string | null,
    imageLoaded: boolean,
    openPart: OpenPart
  ) => void;
  chosenNodeChanged: any;//
  referenceLabelChange: any;//
  deleteLink: any;//
  openLinkedNode: any;//
  openAllChildren: any;//
  hideNodeHandler: any;//
  hideOffsprings: any;//
  toggleNode: any;//
  openNodePart: any;//
  selectNode: any;//
  nodeClicked: any;//
  correctNode: any;//
  wrongNode: any;//
  uploadNodeImage: any;//
  removeImage: any;//
  changeChoice: any;//
  changeFeedback: any;//
  switchChoice: any;//
  deleteChoice: any;//
  addChoice: any;//
  onNodeTitleBLur: any;//
  saveProposedChildNode: any;//
  saveProposedImprovement: any;//
  closeSideBar: any;//
  reloadPermanentGrpah: any;//
};
const Node = ({
  identifier,
  activeNode,
  citationsSelected,
  proposalsSelected,
  acceptedProposalsSelected,
  commentsSelected,
  open,
  left,
  top,
  width,
  editable,
  unaccepted,
  nodeType,
  isTag,
  isNew,
  title,
  content,
  nodeImage,
  viewers,
  correctNum,
  markedCorrect,
  wrongNum,
  markedWrong,
  references,
  tags,
  parents,
  children,
  choices,
  commentsNum,
  proposalsNum,
  admin,
  aImgUrl,
  aFullname,
  aChooseUname,
  lastVisit,
  studied,
  isStudied,
  changed,
  changedAt,
  bookmarked,
  bookmarks,
  bookmark,
  markStudied,
  nodeChanged,
  chosenNodeChanged,
  referenceLabelChange,
  deleteLink,
  openLinkedNode,
  openAllChildren,
  hideNodeHandler,
  hideOffsprings,
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
  onNodeTitleBLur,
  saveProposedChildNode,
  saveProposedImprovement,
  closeSideBar,
  reloadPermanentGrpah,
}: NodeProps) => {

  // const choosingNode = useRecoilValue(choosingNodeState);
  // const choosingType = useRecoilValue(choosingTypeState);
  // const setChosenNode = useSetRecoilState(chosenNodeState);
  // const setChosenNodeTitle = useSetRecoilState(chosenNodeTitleState);
  // const setOpenMedia = useSetRecoilState(openMediaState);

  const { nodeBookState, nodeBookDispatch } = useNodeBook();

  const [openPart, setOpenPart] = useState<OpenPart>(null);
  const [isHiding, setIsHiding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  // const [summary, setSummary] = useState("");
  const [reason, setReason] = useState("");

  const nodeRef = useRef(null);

  const nodeClickHandler = useCallback(
    (event: any) => {
      if (nodeBookState.choosingNode) {
        nodeBookDispatch({ type: "setChosenNode", payload: { id: identifier, title } });
        // setChosenNode(identifier);
        // setChosenNodeTitle(title);
      } else if (
        "activeElement" in event.currentTarget &&
        "nodeName" in event.currentTarget.activeElement &&
        event.currentTarget.activeElement.nodeName !== "INPUT"
      ) {
        nodeClicked(event, identifier, nodeType, setOpenPart);
      }
    },
    [nodeBookState.choosingNode, identifier, title, nodeClicked, nodeType]
  );

  ///::::::::::::::::::::::::::::::::::::::::::added by sam::::::::::::::::::::
  // const hideNodeHandler = useCallback(
  //   () => hideNodeHandler(identifier, setIsHiding),
  //   [hideNodeHandler, identifier]
  // );

  // const hideOffspringsHandler = useCallback(
  //   () => hideOffsprings(identifier),
  //   [hideOffsprings, identifier]
  // );

  // const toggleNodeHandler = useCallback(
  //   (event:any) => {
  //     event.persist();
  //     toggleNode(event, identifier, open);
  //   },
  //   [toggleNode, identifier, open]
  // );

  // const removeImageHandler = useCallback(() => {
  //   removeImage(nodeRef, identifier);
  // }, [nodeRef, removeImage, identifier]);

  // const onImageLoad = useCallback(() => setImageLoaded(true), []);

  // const onImageClick = useCallback(() => setOpenMedia(nodeImage), [nodeImage]);

  // const addChoiceHandler = useCallback(
  //   () => addChoice(nodeRef, identifier),
  //   [addChoice, nodeRef, identifier]
  // );

  // const markStudiedHandler = useCallback(
  //   (event:any) => markStudied(event, identifier),
  //   [markStudied, identifier]
  // );

  // const bookmarkHandler = useCallback(
  //   (event:any) => bookmark(event, identifier),
  //   [bookmark, identifier]
  // );

  // const openNodePartHandler = useCallback(
  //   (event:any, partType:any) => openNodePart(event, identifier, partType, openPart, setOpenPart, tags),
  //   [identifier, openPart, tags]
  // );

  // const selectNodeHandler = useCallback(
  //   (event:any, chosenType:any) => selectNode(event, identifier, chosenType, nodeType),
  //   [selectNode, identifier, nodeType]
  // );

  // const correctNodeHandler = useCallback(
  //   (event:any) => correctNode(event, identifier, nodeType),
  //   [correctNode, identifier, nodeType]
  // );

  // const wrongNodeHandler = useCallback(
  //   (event:any) =>
  //     wrongNode(
  //       event,
  //       identifier,
  //       nodeType,
  //       markedWrong,
  //       markedCorrect,
  //       wrongNum,
  //       correctNum
  //     ),
  //   [wrongNode, identifier, nodeType, markedWrong, wrongNum, correctNum]
  // );

  // const uploadNodeImageHandler = useCallback(
  //   (event:any, isUploading:boolean, setIsUploading:any, setPercentageUploaded:any) =>
  //     uploadNodeImage(event, nodeRef, identifier, isUploading, setIsUploading, setPercentageUploaded),
  //   [uploadNodeImage, nodeRef, identifier]
  // );

  // const referenceLabelChangeHandler = useCallback(
  //   (event:any, referenceIdx:string) => {
  //     return referenceLabelChange(event, identifier, referenceIdx);
  //   },
  //   [referenceLabelChange, identifier]
  // );

  // const deleteLinkHandler = useCallback(
  //   (linkIdx, linkType) => deleteLink(identifier, linkIdx, linkType),
  //   [deleteLink, identifier]
  // );

  // const titleChange = useCallback(
  //   value => {
  //     nodeChanged(nodeRef, identifier, null, value, imageLoaded, openPart);
  //   },
  //   [nodeChanged, nodeRef, identifier, imageLoaded, openPart]
  // );

  // const contentChange = useCallback(
  //   value => {
  //     nodeChanged(nodeRef, identifier, value, null, imageLoaded, openPart);
  //   },
  //   [nodeChanged, nodeRef, identifier, imageLoaded, openPart]
  // );
  ///::::::::::::::::::::::::::::::::::::::::::added by sam:::::::::::::::::::://////

  const locationSizeChange = useCallback(() => {
    console.log('[NODE]: will call nodeChanged')
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
    // left,
    // top,
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
    content
    // Reasonably, we should not invoke nodeChanged when the following change, but otherwise, it does not fit the nodes vertically!
    // nodeChanged,
    // markedCorrect,
    // markedWrong,
    // viewers,
    // correctNum,
    // wrongNum,
    // commentsNum,
    // proposalsNum,
    // lastVisit,
    // studied,
    // isStudied,
    // changed,
    // changedAt,
    // bookmarked,
    // bookmarks,
  ]);

  useEffect(() => {
    if (editable) {
      setOpenPart("References");
    }
  }, [editable]);

  useEffect(() => {
    if (!editable && !activeNode) {
      setOpenPart(null);
    }
  }, [editable, activeNode]);

  return (
    // const boxShadowCSS = boxShadowCSSGenerator(selectionType);
    <Box
      ref={nodeRef}
      id={identifier}
      onClick={nodeClickHandler}
      className={
        "Node card" +
        (activeNode
          ? //   &&
          // ["AcceptedProposals", "Proposals", "Comments"].includes(selectionType)
          " active"
          : "") +
        (changed || !isStudied ? " Changed" : "") +
        (isHiding ? " IsHiding" : "") +
        (nodeBookState.choosingNode &&
          nodeBookState.choosingNode.id !== identifier &&
          !activeNode &&
          (nodeBookState.choosingNode.type !== "Reference" || nodeType === "Reference")
          ? " Choosable"
          : "")
      }
      style={{
        left: left ? left : 1000,
        top: top ? top : 1000,
        width: width,
        transition: '0.5s'
      }}
    // style={
    //   activeNode
    //     ? {
    //         left: left,
    //         top: top,
    //         width: width,
    //         WebkitBoxShadow: boxShadowCSS,
    //         MozBoxShadow: boxShadowCSS,
    //         boxShadow: boxShadowCSS
    //       }
    //     : {
    //         left: left,
    //         top: top,
    //         width: width
    //       }
    // }
    >
      {open ? (
        <div className="card-content">
          <div className="card-title">
            {title}
          </div>
          <p>
            {content}
          </p>

          <div style={{ border: 'dashed 2px royalBlue', padding: '20px' }}>
            LinkingWords component
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nobis earum adipisci aliquam praesentium, suscipit in quisquam error autem? Illum, quia quod veritatis praesentium voluptatem at voluptatum temporibus in corrupti porro.</p>
          </div>
        </div>

        // <>
        //   <div className="card-content">
        //     <div className="card-title">
        //       {editable &&
        //         (isNew ? (
        //           <>
        //             <p className="NewChildProposalWarning">Before proposing,</p>
        //             <p className="NewChildProposalWarning">
        //               - Search <i className="material-icons EditingNodeSearchIcon">search</i> to ensure the node does
        //               not exist.
        //             </p>
        //             {(nodeType === "Concept" ||
        //               nodeType === "Relation" ||
        //               nodeType === "Question" ||
        //               nodeType === "News") &&
        //               references.length === 0 && (
        //                 <p className="NewChildProposalWarning">
        //                   - Make the reference nodes that you'd like to cite, visible on your map view.
        //                 </p>
        //               )}
        //             <p id="NewChildProposalTitleHint">Please enter the node title below:</p>
        //           </>
        //         ) : (
        //           <p id="NewChildProposalTitleHint">Please edit the node title below:</p>
        //         ))}
        //       <HyperEditor
        //         readOnly={!editable}
        //         onChange={titleChange}
        //         onBlur={onNodeTitleBLur(title)}
        //         content={title}
        //         width={width}
        //       />
        //       {!editable && !unaccepted && !choosingNode && (
        //         <NodeHeader
        //           identifier={identifier}
        //           open={true}
        //           nodeType={nodeType}
        //           setIsHiding={setIsHiding}
        //           parentsNum={parents.length}
        //           hideNodeHandler={hideNodeHandler}
        //           hideOffsprings={hideOffspringsHandler}
        //           toggleNode={toggleNodeHandler}
        //         />
        //       )}
        //     </div>
        //     <div className="NodeContent">
        //       {editable && <p>Please edit the node content below:</p>}
        //       <HyperEditor
        //         readOnly={!editable}
        //         onChange={contentChange}
        //         content={content}
        //         width={width}
        //       />
        //       {nodeImage !== "" && (
        //         <>
        //           {editable && (
        //             <div className="RemoveImageDIV">
        //               <MetaButton onClick={removeImageHandler} tooltip="Click to remove the image.">
        //                 <div className="CloseButton">
        //                   <i className="material-icons orange-text">delete_forever</i>
        //                 </div>
        //               </MetaButton>
        //             </div>
        //           )}
        //           {/* iman */}
        //           {/* <a href={nodeImage} target="_blank"> */}
        //           <img
        //             src={nodeImage}
        //             alt="Node image"
        //             className="responsive-img NodeImage"
        //             onLoad={onImageLoad}
        //             onClick={onImageClick}
        //           />
        //           {/* </a> */}
        //         </>
        //       )}
        //       {/* {nodeType === "Question"  && (
        //         <>
        //           <ul className="collapsible">
        //             {choices.map((choice, idx) => {
        //               return (
        //                 <QuestionChoices
        //                   key={identifier + "Choice" + idx}
        //                   identifier={identifier}
        //                   nodeRef={nodeRef}
        //                   editable={editable}
        //                   choices={choices}
        //                   idx={idx}
        //                   choicesNum={choices.length}
        //                   choice={choice}
        //                   deleteChoice={deleteChoice}
        //                   switchChoice={switchChoice}
        //                   changeChoice={changeChoice}
        //                   changeFeedback={changeFeedback}
        //                   nodeChanged={locationSizeChange}
        //                 />
        //               );
        //             })}
        //           </ul>
        //           {editable && (
        //             <div className="QuestionAddChoice">
        //               <MetaButton onClick={addChoiceHandler} tooltip="Click to add a new choice to this question.">
        //                 <i className="material-icons green-text">add</i> Add Choice
        //               </MetaButton>
        //             </div>
        //           )}
        //         </>
        //       )} */}
        //       {/* {editable && (
        //         <>
        //           <p className="ProposalTitle">
        //             {"To expedite your proposal review, explain why you propose this " +
        //               (isNew ? nodeType + " child node:" : "new version:")}
        //           </p>
        //           <HyperEditor content={reason} readOnly={false} onChange={setReason} />
        //           ::::: ::::::: :::::: ::::: iman code :::::::: ::::: :::: 
        //           <p className="ProposalTitle">
        //               Please write a few words to summarize what you've proposed
        //               in this version:
        //             </p>
        //             <HyperEditor
        //               content={summary}
        //               readOnly={false}
        //               onChange={setSummary}
        //             />
        //           ::::: ::::::: :::::: ::::: iman code :::::::: ::::: :::: 
        //         </>
        //       )} */}
        //       {/* <NodeFooter
        //         open={true}
        //         identifier={identifier}
        //         activeNode={activeNode}
        //         citationsSelected={citationsSelected}
        //         proposalsSelected={proposalsSelected}
        //         acceptedProposalsSelected={acceptedProposalsSelected}
        //         commentsSelected={commentsSelected}
        //         editable={editable}
        //         title={title}
        //         content={content}
        //         unaccepted={unaccepted}
        //         openPart={openPart}
        //         nodeType={nodeType}
        //         isNew={isNew}
        //         admin={admin}
        //         aImgUrl={aImgUrl}
        //         aFullname={aFullname}
        //         aChooseUname={aChooseUname}
        //         viewers={viewers}
        //         correctNum={correctNum}
        //         markedCorrect={markedCorrect}
        //         wrongNum={wrongNum}
        //         markedWrong={markedWrong}
        //         references={references}
        //         tags={tags}
        //         parents={parents}
        //         children={children}
        //         commentsNum={commentsNum}
        //         proposalsNum={proposalsNum}
        //         studied={studied}
        //         isStudied={isStudied}
        //         changed={changed}
        //         changedAt={changedAt}
        //         bookmarked={bookmarked}
        //         bookmarks={bookmarks}
        //         reloadPermanentGrpah={reloadPermanentGrpah}
        //         markStudied={markStudiedHandler}
        //         bookmark={bookmarkHandler}
        //         nodeChanged={locationSizeChange}
        //         openNodePart={openNodePartHandler}
        //         selectNode={selectNodeHandler}
        //         correctNode={correctNodeHandler}
        //         wrongNode={wrongNodeHandler}
        //         uploadNodeImage={uploadNodeImageHandler}
        //       /> */}
        //     </div>
        //   </div>
        //   {/* {(openPart === "LinkingWords" || openPart === "Tags" || openPart === "References") && (
        //     <LinkingWords
        //       identifier={identifier}
        //       editable={editable}
        //       isNew={isNew}
        //       openPart={openPart}
        //       title={title}
        //       reason={reason}
        //       references={references}
        //       tags={tags}
        //       parents={parents}
        //       children={children}
        //       chosenNodeChanged={chosenNodeChanged}
        //       referenceLabelChange={referenceLabelChangeHandler}
        //       deleteLink={deleteLinkHandler}
        //       openLinkedNode={openLinkedNode}
        //       openAllChildren={openAllChildren}
        //       saveProposedChildNode={saveProposedChildNode}
        //       saveProposedImprovement={saveProposedImprovement}
        //       closeSideBar={closeSideBar}
        //     />
        //   )} */}
        // </>
      ) : (
        <div className="card-content">
          <div className="card-title">
            <div className="NodeTitleClosed">
              <h3>{title}</h3>
              <p>
                {content}
              </p>
              {/* <HyperEditor readOnly={true} onChange={titleChange} content={title} width={width} /> */}
            </div>
            {/* {!choosingNode && (
              <NodeHeader
                identifier={identifier}
                open={false}
                nodeType={nodeType}
                setIsHiding={setIsHiding}
                parentsNum={parents.length}
                hideNodeHandler={hideNodeHandler}
                hideOffsprings={hideOffspringsHandler}
                toggleNode={toggleNodeHandler}
              />
            )} */}
            {/* <div className="footer">
              <NodeFooter
                open={false}
                identifier={identifier}
                activeNode={activeNode}
                citationsSelected={citationsSelected}
                proposalsSelected={proposalsSelected}
                acceptedProposalsSelected={acceptedProposalsSelected}
                commentsSelected={commentsSelected}
                editable={editable}
                unaccepted={unaccepted}
                openPart={openPart}
                nodeType={nodeType}
                admin={admin}
                aImgUrl={aImgUrl}
                aFullname={aFullname}
                aChooseUname={aChooseUname}
                viewers={viewers}
                correctNum={correctNum}
                markedCorrect={markedCorrect}
                wrongNum={wrongNum}
                markedWrong={markedWrong}
                references={references}
                tags={tags}
                parents={parents}
                children={children}
                commentsNum={commentsNum}
                proposalsNum={proposalsNum}
                studied={studied}
                isStudied={isStudied}
                changedAt={changedAt}
                bookmarked={bookmarked}
                bookmarks={bookmarks}
                reloadPermanentGrpah={reloadPermanentGrpah}
                nodeChanged={locationSizeChange}
                openNodePart={openNodePartHandler}
                selectNode={selectNodeHandler}
                correctNode={correctNodeHandler}
                wrongNode={wrongNodeHandler}
                uploadNodeImage={uploadNodeImageHandler}
              />
            </div> */}
          </div>
        </div>
      )
      }
    </Box >
  );
};

export default React.memo(Node);
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
