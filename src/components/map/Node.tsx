import AddIcon from "@mui/icons-material/Add";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SearchIcon from "@mui/icons-material/Search";
import { Box } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FullNodeData, OpenPart } from "src/nodeBookTypes";

import { useNodeBook } from "@/context/NodeBookContext";

import { useAuth } from "../../context/AuthContext";
import { KnowledgeChoice } from "../../knowledgeTypes";
// import { FullNodeData } from "../../noteBookTypes";
import { Editor } from "../Editor";
import LinkingWords from "./LinkingWords/LinkingWords";
import { MemoizedMetaButton } from "./MetaButton";
import { MemoizedNodeFooter } from "./NodeFooter";
import { MemoizedNodeHeader } from "./NodeHeader";
import QuestionChoices from "./QuestionChoices";

// import HyperEditor from "../../Editor/HyperEditor/HyperEditorWrapper";
// import NodeHeader from "./NodeHeader/NodeHeader";
// import NodeFooter from "./NodeFooter/NodeFooter";
// import LinkingWords from "./LinkingWords/LinkingWords";
// import QuestionChoices from "./QuestionChoices/QuestionChoices";
// import { admin } from "@/lib/firestoreServer/admin";
// import { Draft } from "../../Editor";
// import { compareLinks, compareChoices, compareImages } from "../MapUtils";
// import boxShadowCSSGenerator from "../../../utils/boxShadowCSSGenerator";

// import "./Node.css";

// CHECK: Improve this passing Full Node Data
// this Node need to become testeable
// also split the in (Node and FormNode) to reduce the complexity
type NodeProps = {
  identifier: string;
  activeNode: any; //organize this i a better forme
  citationsSelected: any; //
  proposalsSelected: any; //
  acceptedProposalsSelected: any; //
  commentsSelected: any;
  open: boolean;
  left: number;
  top: number;
  width: number;
  editable: boolean;
  unaccepted: any; //
  nodeType: string;
  isTag: boolean;
  isNew: any; //
  title: string;
  content: string;
  nodeImage: string;
  viewers: number;
  correctNum: any; //
  markedCorrect: any; //
  wrongNum: any; //
  markedWrong: any; //
  references: string[];
  tags: string[] | { node: string; title?: string; label?: string }[];
  parents: string[];
  nodesChildren: string[] | { node: string; title?: string; label?: string }[];
  choices: KnowledgeChoice[];
  commentsNum: number;
  proposalsNum: number;
  admin: string;
  aImgUrl: string;
  aFullname: string;
  aChooseUname: boolean;
  lastVisit: string;
  studied: number;
  isStudied: boolean;
  changed: any; //
  changedAt: string;
  bookmarked: boolean;
  bookmarks: any; //
  bookmark: any; //
  markStudied: any; //
  nodeChanged: (
    nodeRef: any,
    nodeId: string,
    content: string | null,
    title: string | null,
    imageLoaded: boolean,
    openPart: OpenPart
  ) => void;
  chosenNodeChanged: any; //
  referenceLabelChange: any; //
  deleteLink: any; //
  openLinkedNode: any; //
  openAllChildren: any; //
  onHideNode: any; //
  hideOffsprings: any; //
  toggleNode: (event: any, id: string) => void; //
  openNodePart: (event: any, id: string, partType: any, openPart: any, setOpenPart: any, tags: any) => void; //
  selectNode: any; //
  nodeClicked: any; //
  correctNode: any; //
  wrongNode: any; //
  uploadNodeImage: any; //
  removeImage: any; //
  changeNodeHight: any;
  changeChoice: any; //
  changeFeedback: any; //
  switchChoice: any; //
  deleteChoice: any; //
  addChoice: any; //
  onNodeTitleBLur: any; //
  saveProposedChildNode: any; //
  saveProposedImprovement: any; //
  closeSideBar: any; //
  reloadPermanentGrpah: any; //
  setOpenMedia: (imagUrl: string) => void;
  setNodeParts: (nodeId: string, callback: (thisNode: FullNodeData) => FullNodeData) => void;
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
  nodesChildren,
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
  onHideNode,
  hideOffsprings: onHideOffsprings,
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
  onNodeTitleBLur,
  saveProposedChildNode,
  saveProposedImprovement,
  closeSideBar,
  reloadPermanentGrpah,
  setOpenMedia,
  setNodeParts,
}: NodeProps) => {
  // const choosingNode = useRecoilValue(choosingNodeState);
  // const choosingType = useRecoilValue(choosingTypeState);
  // const setChosenNode = useSetRecoilState(chosenNodeState);
  // const setChosenNodeTitle = useSetRecoilState(chosenNodeTitleState);
  // const setOpenMedia = useSetRecoilState(openMediaState);

  const [{ user }] = useAuth();
  const { nodeBookState, nodeBookDispatch } = useNodeBook();

  const [openPart, setOpenPart] = useState<OpenPart>(null);
  const [isHiding, setIsHiding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  // const [summary, setSummary] = useState("");
  // const [titleCopy, setTitleCopy] = useState(title);
  // const [contentCopy, setContentCopy] = useState(content);
  const [reason, setReason] = useState("");

  const nodeRef = useRef(null);
  const previousRef = useRef<number>(0);
  const observer = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    observer.current = new ResizeObserver(entries => {
      try {
        const { blockSize } = entries[0].borderBoxSize[0];
        // console.log("[observer]", { prevHight: previousRef.current, curHeight: blockSize, editable });
        const isSimilar = blockSize === previousRef.current;
        previousRef.current = blockSize;
        if (isSimilar) return;

        changeNodeHight(identifier, blockSize);
      } catch (err) {
        console.warn("invalid entry", err);
      }
    });

    if (!nodeRef.current) return;

    observer.current.observe(nodeRef.current);

    // observer.current.unobserve();
    return () => {
      if (!observer.current) return;
      return observer.current.disconnect();
    };
  }, [title, content, tags, editable]);

  const nodeClickHandler = useCallback(
    (event: any) => {
      if (nodeBookState.choosingNode) {
        // The first Nodes exist, Now is clicking the Chosen Node
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

  const hideNodeHandler = useCallback(
    (event: any) => {
      event.preventDefault();
      event.stopPropagation();
      onHideNode(identifier, setIsHiding);
    },
    [onHideNode, identifier]
  );

  const hideOffspringsHandler = useCallback(() => onHideOffsprings(identifier), [onHideOffsprings, identifier]);

  const toggleNodeHandler = useCallback(
    (event: any) => {
      // event.persist();
      toggleNode(event, identifier /*open*/);
    },
    [toggleNode, identifier, open]
  );
  const removeImageHandler = useCallback(() => {
    removeImage(nodeRef, identifier);
  }, [nodeRef, removeImage, identifier]);

  const onImageLoad = useCallback(() => setImageLoaded(true), []);

  const onImageClick = useCallback(() => setOpenMedia(nodeImage), [nodeImage]);

  const addChoiceHandler = useCallback(() => addChoice(nodeRef, identifier), [addChoice, nodeRef, identifier]);

  const markStudiedHandler = useCallback(
    (event: any) => {
      markStudied(event, identifier);
    },

    [markStudied, identifier]
  );

  const bookmarkHandler = useCallback((event: any) => bookmark(event, identifier), [bookmark, identifier]);

  const openNodePartHandler = useCallback(
    (event: any, partType: any) => {
      openNodePart(event, identifier, partType, openPart, setOpenPart, tags);
    },

    [identifier, openPart, tags]
  );

  const selectNodeHandler = useCallback(
    (event: any, chosenType: any) => selectNode(event, identifier, chosenType, nodeType),
    // () => console.log('uploadNodeImageHandler'),
    [selectNode, identifier, nodeType]
  );

  const correctNodeHandler = useCallback(
    (event: any) => correctNode(event, identifier, nodeType),
    // () => console.log('uploadNodeImageHandler'),
    [correctNode, identifier, nodeType]
  );

  const wrongNodeHandler = useCallback(
    (event: any) => wrongNode(event, identifier, nodeType, markedWrong, markedCorrect, wrongNum, correctNum),
    [wrongNode, identifier, nodeType, markedWrong, wrongNum, correctNum]
  );

  const uploadNodeImageHandler = useCallback(
    (event: any, isUploading: boolean, setIsUploading: any, setPercentageUploaded: any) => {
      uploadNodeImage(event, nodeRef, identifier, isUploading, setIsUploading, setPercentageUploaded);
    },
    [uploadNodeImage, nodeRef, identifier]
  );

  const referenceLabelChangeHandler = useCallback(
    (event: any, referenceIdx: string) => {
      console.log("referenceLabelChangeHandler", { event, identifier, referenceIdx });
      return referenceLabelChange(event, identifier, referenceIdx);
    },
    [referenceLabelChange, identifier]
  );

  const deleteLinkHandler = useCallback(
    (linkIdx: any, linkType: any) => deleteLink(identifier, linkIdx, linkType),
    [deleteLink, identifier]
  );

  // CHECK: I think we can improve the other function to update content
  // if only update nodes, because the observer will update the positions
  const titleChange = useCallback(
    (value: string) => {
      // nodeChanged(nodeRef, identifier, null, value, imageLoaded, openPart)
      // changeTitle(nodeRef, identifier, value);
      // setTitleCopy(title);
      setNodeParts(identifier, thisNode => ({ ...thisNode, title: value }));
    },
    [/*nodeChanged,*/ setNodeParts, nodeRef, identifier, imageLoaded, openPart]
  );

  const contentChange = useCallback(
    (value: string) => {
      // nodeChanged(nodeRef, identifier, value, null, imageLoaded, openPart);
      setNodeParts(identifier, thisNode => ({ ...thisNode, content: value }));
    },
    [/*nodeChanged,*/ setNodeParts, nodeRef, identifier, imageLoaded, openPart]
  );

  // const locationSizeChange = useCallback(() => {
  //   console.log("[NODE]: will call nodeChanged");
  //   nodeChanged(nodeRef, identifier, null, null, imageLoaded, openPart);
  // }, [nodeChanged, nodeRef, identifier, imageLoaded, openPart]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     locationSizeChange();
  //   }, 700);
  // }, [
  //   locationSizeChange,
  //   openPart,
  //   imageLoaded,
  //   // left,
  //   // top,
  //   nodeImage,
  //   open,
  //   editable,
  //   unaccepted,
  //   isNew,
  //   isTag,
  //   references.length,
  //   tags.length,
  //   parents.length,
  //   nodesChildren.length,
  //   // title,
  //   // content,
  //   choices.length,
  //   // Reasonably, we should not invoke nodeChanged when the following change, but otherwise, it does not fit the nodes vertically!
  //   // nodeChanged,
  //   // markedCorrect,
  //   // markedWrong,
  //   // viewers,
  //   // correctNum,
  //   // wrongNum,
  //   // commentsNum,
  //   // proposalsNum,
  //   // lastVisit,
  //   // studied,
  //   // isStudied,
  //   // changed,
  //   // changedAt,
  //   // bookmarked,
  //   // bookmarks,
  // ]);

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

  if (!user) {
    return null;
  }

  return (
    // const boxShadowCSS = boxShadowCSSGenerator(selectionType);
    <div
      ref={nodeRef}
      // ref={divRef}
      id={identifier}
      onClick={nodeClickHandler}
      data-hoverable={true}
      className={
        "Node card" +
        (activeNode
          ? //   &&
            // ["AcceptedProposals", "Proposals", "Comments"].includes(selectionType)
            " active"
          : "") +
        (changed || !isStudied ? " Changed" : "") +
        (isHiding ? " IsHiding" : "") +
        (nodeBookState.choosingNode /*choosingNode*/ &&
        nodeBookState.choosingNode.id /*choosingNode*/ !== identifier &&
        !activeNode &&
        (nodeBookState.choosingNode.type /*choosingType*/ !== "Reference" || nodeType === "Reference")
          ? " Choosable"
          : "")
      }
      style={{
        left: left ? left : 1000,
        top: top ? top : 1000,
        width: width,
        transition: "0.5s",
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
      {/* INFO: uncomment this only on develope */}
      {/* {identifier} */}
      {open ? (
        <>
          <div className="card-content">
            <div className="card-title" data-hoverable={true}>
              {editable &&
                (isNew ? (
                  <>
                    {/* New Node with inputs */}
                    <p className="NewChildProposalWarning">Before proposing,</p>
                    <p className="NewChildProposalWarning" style={{ display: "flex", alignItems: "center" }}>
                      <span>- Search </span>
                      <SearchIcon sx={{ color: "orange", mx: "5px", fontSize: "16px" }} />
                      <span> to ensure the node does not exist.</span>
                    </p>
                    {(nodeType === "Concept" ||
                      nodeType === "Relation" ||
                      nodeType === "Question" ||
                      nodeType === "News") &&
                      references.length === 0 && (
                        <p className="NewChildProposalWarning">
                          - Make the reference nodes that you'd like to cite, visible on your map view.
                        </p>
                      )}
                    {/* <p id="NewChildProposalTitleHint">Please enter the node title below:</p> */}
                  </>
                ) : (
                  // <p id="NewChildProposalTitleHint">Please edit the node title below:</p>
                  <></>
                ))}
              {/* CHECK: I commented this */}
              <Editor
                label="Please enter the node title below:"
                // label={titleCopy}
                value={title}
                // value={titleCopy}
                // onChangeContent={setReason}
                setValue={titleChange}
                // setValue={setTitleCopy}
                readOnly={!editable}
                sxPreview={{ fontSize: "25px", fontWeight: 300 }}
              />
              {editable && <Box sx={{ mb: "12px" }}></Box>}
              {/* <HyperEditor
                readOnly={!editable}
                onChange={titleChange}
                onBlur={onNodeTitleBLur(title)}
                content={title}
                width={width}
               /> */}
              {/* {title} */}
              {!editable && !unaccepted && !nodeBookState.choosingNode /* && !choosingNode */ && (
                <MemoizedNodeHeader
                  open={open}
                  onToggleNode={toggleNodeHandler}
                  onHideOffsprings={hideOffspringsHandler}
                  onHideNodeHandler={hideNodeHandler}
                  sx={{ position: "absolute", right: "10px", top: "0px" }}
                />
                // <NodeHeader
                //   identifier={identifier}
                //   open={true}
                //   nodeType={nodeType}
                //   setIsHiding={setIsHiding}
                //   parentsNum={parents.length}
                //   hideNodeHandler={hideNodeHandler}
                //   hideOffsprings={hideOffspringsHandler}
                //   toggleNode={toggleNodeHandler}
                // />
              )}
            </div>
            <div className="NodeContent" data-hoverable={true}>
              {/* {editable && <p>Please edit the node content below:</p>} */}
              <Editor
                label="Please edit the node content below:"
                value={content}
                setValue={contentChange}
                // setValue={setContentCopy}
                readOnly={!editable}
                sxPreview={{ fontSize: "15px" }}
              />
              {editable && <Box sx={{ mb: "12px" }}></Box>}
              {/* CHECK: I commmented  this */}
              {/* <HyperEditor
                readOnly={!editable}
                onChange={contentChange}
                content={content}
                width={width}
               /> */}
              {/* {content} */}
              {nodeImage !== "" && (
                <>
                  {editable && (
                    <div className="RemoveImageDIV">
                      <MemoizedMetaButton onClick={removeImageHandler} tooltip="Click to remove the image.">
                        <DeleteForeverIcon sx={{ fontSize: "16px" }} />
                      </MemoizedMetaButton>
                    </div>
                  )}
                  {/* <a href={nodeImage} target="_blank"> */}

                  {/* TODO: change to Next Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={nodeImage}
                    alt="Node image"
                    className="responsive-img NodeImage"
                    onLoad={onImageLoad}
                    onClick={onImageClick}
                  />
                </>
              )}
              {nodeType === "Question" /*&& "choices" in props*/ && (
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <ul className="collapsible" style={{ padding: "0px" }}>
                    {choices.map((choice, idx) => {
                      return (
                        <QuestionChoices
                          key={identifier + "Choice" + idx}
                          identifier={identifier}
                          nodeRef={nodeRef}
                          editable={editable}
                          choices={choices}
                          idx={idx}
                          choicesNum={choices.length}
                          choice={choice}
                          deleteChoice={deleteChoice}
                          switchChoice={switchChoice}
                          changeChoice={changeChoice}
                          changeFeedback={changeFeedback}
                          // nodeChanged={locationSizeChange}
                        />
                      );
                    })}
                  </ul>
                  {editable && (
                    <Box sx={{ alignSelf: "flex-end" }}>
                      <MemoizedMetaButton
                        onClick={addChoiceHandler}
                        tooltip="Click to add a new choice to this question."
                      >
                        <>
                          <AddIcon className="green-text" sx={{ fontSize: "16px" }} />
                          <span>Add Choice</span>
                        </>
                      </MemoizedMetaButton>
                    </Box>
                  )}
                </Box>
              )}
              {editable && (
                <>
                  <Editor
                    label={
                      "To expedite your proposal review, explain why you propose this " +
                      (isNew ? nodeType + " child node:" : "new version:")
                    }
                    value={reason}
                    setValue={setReason}
                    readOnly={false}
                  />
                </>
              )}
              <MemoizedNodeFooter
                open={true}
                identifier={identifier}
                activeNode={activeNode}
                citationsSelected={citationsSelected}
                proposalsSelected={proposalsSelected}
                acceptedProposalsSelected={acceptedProposalsSelected}
                commentsSelected={commentsSelected}
                editable={editable}
                title={title} // x
                content={content} // x
                unaccepted={unaccepted}
                openPart={openPart}
                nodeType={nodeType}
                isNew={isNew} // x
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
                nodesChildren={nodesChildren}
                commentsNum={commentsNum}
                proposalsNum={proposalsNum}
                studied={studied}
                isStudied={isStudied}
                changed={changed} // x
                changedAt={changedAt}
                bookmarked={bookmarked}
                bookmarks={bookmarks}
                reloadPermanentGrpah={reloadPermanentGrpah}
                markStudied={markStudiedHandler} // x
                bookmark={bookmarkHandler} // x
                nodeChanged={nodeChanged}
                // nodeChanged={locationSizeChange}
                openNodePart={openNodePartHandler}
                selectNode={selectNodeHandler}
                correctNode={correctNodeHandler}
                wrongNode={wrongNodeHandler}
                uploadNodeImage={uploadNodeImageHandler}
                user={user}
              />
              {/* <NodeFooter
                open={true}
                identifier={identifier}
                activeNode={activeNode}
                citationsSelected={citationsSelected}
                proposalsSelected={proposalsSelected}
                acceptedProposalsSelected={acceptedProposalsSelected}
                commentsSelected={commentsSelected}
                editable={editable}
                title={title}                  // x
                content={content}              // x
                unaccepted={unaccepted}
                openPart={openPart}
                nodeType={nodeType}
                isNew={isNew}                  // x
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
                changed={changed}              // x
                changedAt={changedAt}
                bookmarked={bookmarked}
                bookmarks={bookmarks}
                reloadPermanentGrpah={reloadPermanentGrpah}
                markStudied={markStudiedHandler}     // x
                bookmark={bookmarkHandler}           // x
                nodeChanged={locationSizeChange}
                openNodePart={openNodePartHandler}
                selectNode={selectNodeHandler}
                correctNode={correctNodeHandler}
                wrongNode={wrongNodeHandler}
                uploadNodeImage={uploadNodeImageHandler}
               /> */}
            </div>
          </div>
          {/* <div className="card-action"> */}
          {(openPart === "LinkingWords" || openPart === "Tags" || openPart === "References") && (
            // CHECK: I commented this
            <LinkingWords
              identifier={identifier}
              editable={editable}
              isNew={isNew}
              openPart={openPart}
              title={title}
              reason={reason}
              references={references}
              tags={tags}
              parents={parents}
              nodesChildren={nodesChildren}
              chosenNodeChanged={chosenNodeChanged}
              referenceLabelChange={referenceLabelChangeHandler}
              deleteLink={deleteLinkHandler}
              openLinkedNode={openLinkedNode}
              openAllChildren={openAllChildren}
              saveProposedChildNode={saveProposedChildNode}
              saveProposedImprovement={saveProposedImprovement}
              closeSideBar={closeSideBar}
            />
            // <div style={{ border: 'dashed 2px royalBlue', padding: '20px' }}>
            //   LinkingWords component
            //   <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nobis earum adipisci aliquam praesentium, suscipit in quisquam error autem? Illum, quia quod veritatis praesentium voluptatem at voluptatum temporibus in corrupti porro.</p>
            // </div>
          )}
          {/* </div> */}
        </>
      ) : (
        <div className="card-content">
          <div className="card-title">
            <div className="NodeTitleClosed">
              {/* CHECK: I commented this */}
              {/* <HyperEditor
                readOnly={true}
                onChange={titleChange}
                content={title}
                width={width}
               /> */}
              {/* {title} */}

              <Editor
                label="title"
                value={title}
                setValue={titleChange}
                // setValue={setTitleCopy}
                readOnly={true}
                sxPreview={{ fontSize: "25px" }}
              />
            </div>
            {!nodeBookState.choosingNode /* && choosingNode */ && (
              <MemoizedNodeHeader
                open={open}
                onToggleNode={toggleNodeHandler}
                onHideOffsprings={hideOffspringsHandler}
                onHideNodeHandler={hideNodeHandler}
                sx={{ position: "absolute", right: "10px", top: "0px" }}
              />
              // <NodeHeader
              //   identifier={identifier}
              //   open={false}
              //   nodeType={nodeType}
              //   setIsHiding={setIsHiding}
              //   parentsNum={parents.length}
              //   hideNodeHandler={hideNodeHandler}
              //   hideOffsprings={hideOffspringsHandler}
              //   toggleNode={toggleNodeHandler}
              // />
            )}
            <div className="footer">
              <MemoizedNodeFooter
                open={false}
                identifier={identifier}
                activeNode={activeNode}
                citationsSelected={citationsSelected}
                proposalsSelected={proposalsSelected}
                acceptedProposalsSelected={acceptedProposalsSelected}
                commentsSelected={commentsSelected}
                editable={editable}
                title={title} // x
                content={content} // x
                unaccepted={unaccepted}
                openPart={openPart}
                nodeType={nodeType}
                isNew={isNew} // x
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
                nodesChildren={nodesChildren}
                commentsNum={commentsNum}
                proposalsNum={proposalsNum}
                studied={studied}
                isStudied={isStudied}
                changed={changed} // x
                changedAt={changedAt}
                bookmarked={bookmarked}
                bookmarks={bookmarks}
                reloadPermanentGrpah={reloadPermanentGrpah}
                markStudied={markStudiedHandler} // x
                bookmark={bookmarkHandler} // x
                // nodeChanged={locationSizeChange}
                nodeChanged={nodeChanged}
                openNodePart={openNodePartHandler}
                selectNode={selectNodeHandler}
                correctNode={correctNodeHandler}
                wrongNode={wrongNodeHandler}
                uploadNodeImage={uploadNodeImageHandler}
                user={user}
              />
              {/* <NodeFooter
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
               /> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MemoizedNode = React.memo(Node);

// export default React.memo(Node);
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
