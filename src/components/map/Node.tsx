import AddIcon from "@mui/icons-material/Add";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, InputLabel, Switch, TextField, Typography } from "@mui/material";
import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { FullNodeData, OpenPart } from "src/nodeBookTypes";

import { useNodeBook } from "@/context/NodeBookContext";
import { getSearchAutocomplete } from "@/lib/knowledgeApi";
import { findDiff, getVideoDataByUrl } from "@/lib/utils/utils";
import { OpenSidebar } from "@/pages/notebook";

import { useAuth } from "../../context/AuthContext";
import { KnowledgeChoice } from "../../knowledgeTypes";
// import { FullNodeData } from "../../noteBookTypes";
import { Editor } from "../Editor";
import EditProposal from "./EditProposal";
import LinkingWords from "./LinkingWords/LinkingWords";
import { MemoizedMetaButton } from "./MetaButton";
import NewChildProposal from "./NewChildProposal";
import { MemoizedNodeVideo } from "./Node/NodeVideo";
import { MemoizedNodeFooter } from "./NodeFooter";
import { MemoizedNodeHeader } from "./NodeHeader";
import QuestionChoices from "./QuestionChoices";

// CHECK: Improve this passing Full Node Data
// this Node need to become testeable
// also split the in (Node and FormNode) to reduce the complexity

type EditorOptions = "EDIT" | "PREVIEW";
type ProposedChildTypesIcons = "Concept" | "Relation" | "Question" | "Code" | "Reference" | "Idea";
type NodeProps = {
  identifier: string;
  setFocusView: (state: { selectedNode: string; isEnabled: boolean }) => void;
  activeNode: any;
  citationsSelected: any;
  proposalsSelected: any;
  acceptedProposalsSelected: any;
  commentsSelected: any;
  open: boolean;
  left: number;
  top: number;
  width: number;
  editable: boolean;
  unaccepted: any;
  nodeType: string;
  isTag: boolean;
  isNew: any;
  title: string;
  content: string;
  nodeImage: string;
  nodeVideo: string;
  viewers: number;
  correctNum: any;
  markedCorrect: any;
  wrongNum: any;
  markedWrong: any;
  references: string[];
  disableVotes: boolean;
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
  changed: any;
  changedAt: string;
  simulated?: boolean;
  bookmarked: boolean;
  bookmarks: any;
  bookmark: any;
  markStudied: any;
  chosenNodeChanged: any;
  referenceLabelChange: any;
  deleteLink: any;
  openLinkedNode: any;
  openAllChildren: any;
  onHideNode: any;
  hideOffsprings: any;
  toggleNode: (event: any, id: string) => void;
  openNodePart: (event: any, id: string, partType: any, openPart: any, setOpenPart: any, tags: any) => void; //
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
  onNodeTitleBLur: (newTitle: string) => void;
  saveProposedChildNode: any;
  saveProposedImprovement: any;
  closeSideBar: any;
  reloadPermanentGrpah: any;
  setOpenMedia: (imagUrl: string) => void;
  setOpenSearch: any;
  setNodeParts: (nodeId: string, callback: (thisNode: FullNodeData) => FullNodeData) => void;
  citations: { [key: string]: Set<string> };
  setOpenSideBar: (sidebar: OpenSidebar) => void;
  proposeNodeImprovement: any;
  proposeNewChild: any;
  scrollToNode: any;
  openSidebar: OpenSidebar;
  locked: boolean;
  setOperation: (operation: string) => void;
};

const proposedChildTypesIcons: { [key in ProposedChildTypesIcons]: string } = {
  Concept: "local_library",
  Relation: "share",
  Question: "help_outline",
  Code: "code",
  Reference: "menu_book",
  Idea: "emoji_objects",
};

const Node = ({
  identifier,
  setFocusView,
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
  nodeVideo,
  viewers,
  correctNum,
  markedCorrect,
  wrongNum,
  markedWrong,
  references,
  disableVotes,
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
  simulated,
  bookmarked,
  bookmarks,
  bookmark,
  markStudied,
  chosenNodeChanged,
  referenceLabelChange,
  deleteLink,
  openLinkedNode,
  openAllChildren,
  onHideNode,
  hideOffsprings: onHideOffsprings,
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
  onNodeTitleBLur,
  saveProposedChildNode,
  saveProposedImprovement,
  closeSideBar,
  reloadPermanentGrpah,
  setOpenMedia,
  setOpenSearch,
  setNodeParts,
  citations,
  setOpenSideBar,
  proposeNodeImprovement,
  proposeNewChild,
  cleanEditorLink,
  scrollToNode,
  openSidebar,
  locked,
  setOperation,
}: NodeProps) => {
  const [{ user }] = useAuth();
  const { nodeBookState, nodeBookDispatch } = useNodeBook();
  const [option, setOption] = useState<EditorOptions>("EDIT");

  const [openPart, setOpenPart] = useState<OpenPart>(null);
  const [isHiding, setIsHiding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [reason, setReason] = useState("");
  const [addVideo, setAddVideo] = useState(!!nodeVideo);
  const [videoUrl, setVideoUrl] = useState(nodeVideo);

  const nodeRef = useRef(null);
  const previousHeightRef = useRef<number>(0);
  const previousTopRef = useRef<string>("0px");
  const observer = useRef<ResizeObserver | null>(null);
  const [titleCopy, setTitleCopy] = useState(title);
  const [titleUpdated, setTitleUpdated] = useState(false);
  const [ableToPropose, setAbleToPropose] = useState(false);
  const [nodeTitleHasIssue, setNodeTitleHasIssue] = useState<boolean>(false);
  const [explainationDesc, setExplainationDesc] = useState<boolean>(false);
  const [openProposal, setOpenProposal] = useState(false);

  const [error, setError] = useState<any>(null);
  const [contentCopy, setContentCopy] = useState(content);

  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    setTitleCopy(title);
    setContentCopy(content);
  }, [title, content]);

  const videoData = useMemo(() => {
    return getVideoDataByUrl(videoUrl);
  }, [videoUrl]);

  useEffect(() => {
    if (!addVideo) {
      setNodeParts(identifier, node => ({ ...node, nodeVideo: "" }));
    }
  }, [addVideo]);

  useEffect(() => {
    observer.current = new ResizeObserver(entries => {
      try {
        const { blockSize } = entries[0].borderBoxSize[0];
        const topPosition = (entries[0].target as any)?.style?.top;
        const isSimilar = blockSize === previousHeightRef.current;
        previousHeightRef.current = blockSize;
        previousTopRef.current = topPosition;
        if (isSimilar) return;

        changeNodeHight(identifier, blockSize);
      } catch (err) {
        console.warn("invalid entry", err);
      }
    });

    if (nodeRef.current) {
      observer.current.observe(nodeRef.current);
    }

    return () => {
      if (!observer.current) return;
      return observer.current.disconnect();
    };
  }, [identifier]);

  const nodeClickHandler = useCallback(
    (event: any) => {
      if (nodeBookState.choosingNode) {
        // The first Nodes exist, Now is clicking the Chosen Node
        nodeBookDispatch({ type: "setChosenNode", payload: { id: identifier, title } });
        scrollToNode(nodeBookState.selectedNode);
      } else if (
        "activeElement" in event.currentTarget &&
        "nodeName" in event.currentTarget.activeElement &&
        event.currentTarget.activeElement.nodeName !== "INPUT"
      ) {
        nodeClicked(event, identifier, nodeType, setOpenPart);
      }
      if (event.target.type === "textarea" || event.target.type === "text") {
        nodeBookDispatch({ type: "setSelectedNode", payload: identifier });
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

  const onSetTitle = (newTitle: string) => {
    setTitleCopy(newTitle);
    if (newTitle.trim().length > 0) {
      if (contentCopy.trim().length > 0 || imageLoaded) setAbleToPropose(true);
    } else {
      setAbleToPropose(false);
    }
    setTitleUpdated(true);
  };
  const onSetContent = (newContent: string) => {
    setContentCopy(newContent);
    if (newContent.trim().length > 0) {
      setAbleToPropose(true);
    } else {
      if (!imageLoaded && !videoUrl) {
        setAbleToPropose(false);
      }
    }
  };
  const hideOffspringsHandler = useCallback(() => onHideOffsprings(identifier), [onHideOffsprings, identifier]);

  const toggleNodeHandler = useCallback(
    (event: any) => {
      toggleNode(event, identifier);
    },
    [toggleNode, identifier, open]
  );
  const removeImageHandler = useCallback(() => {
    if (contentCopy.trim().length == 0 && !videoUrl) {
      setAbleToPropose(false);
    }
    setImageLoaded(false);
    removeImage(nodeRef, identifier);
  }, [nodeRef, removeImage, identifier, contentCopy]);

  const onImageLoad = useCallback(() => {
    if (titleCopy.trim().length > 0) {
      setAbleToPropose(true);
    }
    setImageLoaded(true);
  }, []);

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
    [selectNode, identifier, nodeType]
  );

  const correctNodeHandler = useCallback(
    (event: any) => correctNode(event, identifier, nodeType),
    [correctNode, identifier, nodeType]
  );

  const wrongNodeHandler = useCallback(
    (event: any) => wrongNode(event, identifier, nodeType, markedWrong, markedCorrect, wrongNum, correctNum, locked),
    [wrongNode, identifier, nodeType, markedWrong, wrongNum, correctNum, locked]
  );

  const uploadNodeImageHandler = useCallback(
    (event: any, isUploading: boolean, setIsUploading: any, setPercentageUploaded: any) => {
      uploadNodeImage(event, nodeRef, identifier, isUploading, setIsUploading, setPercentageUploaded);
    },
    [uploadNodeImage, nodeRef, identifier]
  );

  const deleteLinkHandler = useCallback(
    (linkIdx: any, linkType: any) => deleteLink(identifier, linkIdx, linkType),
    [deleteLink, identifier]
  );

  const proposalSubmit = useCallback(
    () => {
      // here disable button
      setAbleToPropose(false);
      setTimeout(() => {
        const firstParentId: any = parents[0];

        if (isNew) {
          saveProposedChildNode(identifier, "", reason, () => setAbleToPropose(true));
          if (!firstParentId) return;
          nodeBookDispatch({ type: "setSelectedNode", payload: firstParentId.node });
          return;
        }
        saveProposedImprovement("", reason, () => setAbleToPropose(true));
        nodeBookDispatch({ type: "setSelectedNode", payload: identifier });
        setOperation("ProposeProposals");
      }, 500);
    },

    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isNew, identifier, reason, saveProposedChildNode, saveProposedImprovement]
  );

  const onCancelProposal = () => {
    const firstParentId: any = parents[0];
    const scrollTo = isNew ? firstParentId.node ?? undefined : identifier;
    if (!scrollTo) return;
    setAbleToPropose(false);
    nodeBookDispatch({ type: "setSelectedNode", payload: scrollTo });
    setOperation("CancelProposals");
    closeSideBar();
  };

  useEffect(() => {
    if (editable) {
      setOpenPart("References");
      setReason("");
      cleanEditorLink();
    }
  }, [editable]);

  useEffect(() => {
    if (!editable && !activeNode) {
      setOpenPart(null);
    }
  }, [editable, activeNode]);

  const onBlurContent = useCallback((newContent: string) => {
    setNodeParts(identifier, thisNode => ({ ...thisNode, content: newContent }));
  }, []);

  const onBlurNodeTitle = useCallback(
    async (newTitle: string) => {
      setNodeParts(identifier, thisNode => ({ ...thisNode, title: newTitle }));
      if (titleUpdated && newTitle.trim().length > 0) {
        nodeBookDispatch({ type: "setSearchByTitleOnly", payload: true });
        let nodes: any = await getSearchAutocomplete(newTitle);
        let exactMatchingNode = nodes.results.filter((title: any) => title === newTitle);
        let diff = findDiff(nodes.results[0] ?? "", newTitle);
        if (!explainationDesc) {
          if (exactMatchingNode.length > 0 || diff.length <= 3) {
            setError(
              "This title is too close to another node's title shown in the search results on the left. Please differentiate this from other node titles by making it more specific, or in the reasoning section below carefully explain why the title should be as you entered."
            );
            setNodeTitleHasIssue(true);
            setAbleToPropose(false);
          } else {
            setError(null);
            if (contentCopy.trim().length > 0 || imageLoaded) setAbleToPropose(true);
          }
        }
        setTitleUpdated(false);
      }
      setOpenSideBar("SEARCHER_SIDEBAR");
      nodeBookDispatch({ type: "setNodeTitleBlured", payload: true });
      nodeBookDispatch({ type: "setSearchQuery", payload: newTitle });
    },
    [nodeBookDispatch, titleUpdated]
  );

  const onBlurExplainDesc = useCallback(
    async (text: string) => {
      setExplainationDesc(true);
      if (nodeTitleHasIssue) {
        if (text.trim().length > 0) {
          if (!ableToPropose && (imageLoaded || contentCopy.trim().length > 0)) {
            setAbleToPropose(true);
          }
          setError(null);
        } else {
          setAbleToPropose(false);
          setError(
            "This title is too close to another node's title shown in the search results on the left. Please differentiate this from other node titles by making it more specific, or in the reasoning section below carefully explain why the title should be as you entered."
          );
        }
      }
    },
    [ableToPropose]
  );

  const onChangeOption = useCallback(
    (newOption: boolean) => {
      setOption(newOption ? "PREVIEW" : "EDIT");
    },
    [setOption]
  );

  const onKeyEnter = (e: any) => {
    if (e.keyCode === 13) {
      onChangeOption(option === "EDIT");
    }
  };

  if (!user) {
    return null;
  }
  return (
    <div
      ref={nodeRef}
      id={identifier}
      onClick={nodeClickHandler}
      data-hoverable={true}
      className={
        "Node card" +
        (activeNode ? " active" : "") +
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
        transition: "0.3s",
      }}
    >
      {/* INFO: uncomment this only on develope */}
      {process.env.NODE_ENV === "development" && identifier}
      {open ? (
        <>
          <div className="card-content">
            <div className="card-title" data-hoverable={true}>
              {editable && isNew && (
                <>
                  {/* New Node with inputs */}
                  <p className="NewChildProposalWarning" style={{ display: "flex", alignItems: "center" }}>
                    <span> Before proposing, search </span>
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
                </>
              )}
              {/* CHECK: I commented this */}

              {editable && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "end",
                    alignItems: "center",
                    position: "relative",
                    top: "-10px",
                  }}
                >
                  <Typography
                    onClick={() => setOption("PREVIEW")}
                    sx={{ cursor: "pointer", fontSize: "14px", fontWeight: 490, color: "inherit" }}
                  >
                    Preview
                  </Typography>
                  <Switch
                    checked={option === "EDIT"}
                    onClick={() => onChangeOption(option === "EDIT")}
                    size="small"
                    onKeyDown={onKeyEnter}
                  />
                  <Typography
                    onClick={() => setOption("EDIT")}
                    sx={{ cursor: "pointer", fontSize: "14px", fontWeight: 490, color: "inherit" }}
                  >
                    Edit
                  </Typography>
                </Box>
              )}

              <Editor
                label="Please enter the node title below:"
                value={titleCopy}
                setValue={onSetTitle}
                onBlurCallback={onBlurNodeTitle}
                focus
                readOnly={!editable}
                sxPreview={{ fontSize: "25px", fontWeight: 300 }}
                error={error ? true : false}
                helperText={error ? error : ""}
                showEditPreviewSection={false}
                editOption={option}
              />
              {editable && <Box sx={{ mb: "12px" }}></Box>}
              {!editable && !unaccepted && !nodeBookState.choosingNode /* && !choosingNode */ && (
                <MemoizedNodeHeader
                  setFocusView={() => setFocusView({ isEnabled: true, selectedNode: identifier })}
                  open={open}
                  onToggleNode={toggleNodeHandler}
                  onHideOffsprings={hideOffspringsHandler}
                  onHideNodeHandler={hideNodeHandler}
                  sx={{ position: "absolute", right: "10px", top: "0px" }}
                />
              )}
            </div>
            <div className="NodeContent" data-hoverable={true}>
              <Editor
                label="Please edit the node content below:"
                value={contentCopy}
                setValue={onSetContent}
                onBlurCallback={value => onBlurContent(value)}
                readOnly={!editable}
                sxPreview={{ marginTop: "13px" }}
                showEditPreviewSection={false}
                editOption={option}
              />
              {editable && <Box sx={{ mb: "12px" }}></Box>}

              {nodeImage !== "" && (
                <>
                  {editable && (
                    <div className="RemoveImageDIV">
                      <MemoizedMetaButton onClick={removeImageHandler} tooltip="Click to remove the image.">
                        <DeleteForeverIcon sx={{ fontSize: "16px" }} />
                      </MemoizedMetaButton>
                    </div>
                  )}

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
              {nodeType === "Question" && (
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
                          option={option}
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
                    onBlurCallback={onBlurExplainDesc}
                    showEditPreviewSection={false}
                    editOption={option}
                  />
                </>
              )}
              {editable && addVideo && (
                <>
                  <Box sx={{ mb: "12px" }}></Box>
                  <InputLabel sx={{ fontWeight: 490 }}>
                    {"Please enter the video url below (Youtube and Vimeo are allowed):"}
                  </InputLabel>
                  <TextField
                    onChange={e => setVideoUrl(e.target.value)}
                    onBlur={() => {
                      if (videoUrl !== nodeVideo) {
                        setNodeParts(identifier, node => ({ ...node, nodeVideo: videoUrl }));
                      }
                    }}
                    value={videoUrl}
                    variant="standard"
                    fullWidth
                    sx={{ p: "0px", m: "0px", fontWeight: 400, lineHeight: "24px" }}
                  />
                  <Box sx={{ mb: "12px" }}></Box>
                  <MemoizedNodeVideo addVideo={addVideo} videoData={videoData} />
                </>
              )}
              {!editable && nodeVideo && (
                <>
                  <MemoizedNodeVideo addVideo={true} videoData={videoData} />
                  <Box sx={{ mb: "12px" }}></Box>
                </>
              )}
              <MemoizedNodeFooter
                open={true}
                addVideo={addVideo}
                setAddVideo={setAddVideo}
                identifier={identifier}
                activeNode={activeNode}
                citationsSelected={citationsSelected}
                proposalsSelected={proposalsSelected}
                acceptedProposalsSelected={acceptedProposalsSelected}
                commentsSelected={commentsSelected}
                editable={editable}
                setNodeParts={setNodeParts}
                title={title}
                content={content}
                unaccepted={unaccepted}
                openPart={openPart}
                nodeType={nodeType}
                isNew={isNew}
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
                changed={changed}
                changedAt={changedAt}
                simulated={simulated}
                bookmarked={bookmarked}
                bookmarks={bookmarks}
                reloadPermanentGrpah={reloadPermanentGrpah}
                onNodeShare={onNodeShare}
                markStudied={markStudiedHandler}
                bookmark={bookmarkHandler}
                openNodePart={openNodePartHandler}
                selectNode={selectNodeHandler}
                correctNode={correctNodeHandler}
                wrongNode={wrongNodeHandler}
                disableVotes={disableVotes}
                uploadNodeImage={uploadNodeImageHandler}
                user={user}
                citations={citations}
                setOpenSideBar={setOpenSideBar}
                locked={locked}
                openSidebar={openSidebar}
              />
            </div>
          </div>
          {(openPart === "LinkingWords" || openPart === "Tags" || openPart === "References") && (
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
              referenceLabelChange={referenceLabelChange}
              deleteLink={deleteLinkHandler}
              openLinkedNode={openLinkedNode}
              openAllChildren={openAllChildren}
              saveProposedChildNode={saveProposedChildNode}
              saveProposedImprovement={saveProposedImprovement}
              closeSideBar={closeSideBar}
              setAbleToPropose={setAbleToPropose}
              ableToPropose={ableToPropose}
              isLoading={isLoading}
              onResetButton={newValue => setAbleToPropose(newValue)}
              setOperation={setOperation}
            />
          )}
          {editable && (
            <>
              <Box
                sx={{
                  mx: "10px",
                  borderTop: theme =>
                    theme.palette.mode === "dark" ? `solid 1px ${theme.palette.common.borderColor}` : "solid 1px",
                }}
              />
              <Box
                className="ProposalCommentSubmitButton"
                sx={{
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "10px",
                }}
              >
                <Button
                  color="error"
                  variant="contained"
                  className="btn waves-effect waves-light hoverable red"
                  onClick={onCancelProposal}
                >
                  Cancel
                </Button>
                <Button
                  color="success"
                  variant="contained"
                  className="btn waves-effect waves-light hoverable green"
                  onClick={proposalSubmit}
                  disabled={!ableToPropose ?? false}
                >
                  Propose
                </Button>
              </Box>
            </>
          )}
        </>
      ) : (
        <div className="card-content">
          <div className="card-title">
            <div className="NodeTitleClosed">
              <Editor
                label="title"
                value={titleCopy}
                setValue={setTitleCopy}
                readOnly={true}
                sxPreview={{ fontSize: "25px" }}
              />
            </div>
            {!nodeBookState.choosingNode && (
              <MemoizedNodeHeader
                setFocusView={() => setFocusView({ isEnabled: true, selectedNode: identifier })}
                open={open}
                onToggleNode={toggleNodeHandler}
                onHideOffsprings={hideOffspringsHandler}
                onHideNodeHandler={hideNodeHandler}
                sx={{ position: "absolute", right: "10px", top: "0px" }}
              />
            )}
            <div className="footer">
              <MemoizedNodeFooter
                open={false}
                addVideo={addVideo}
                setAddVideo={setAddVideo}
                identifier={identifier}
                activeNode={activeNode}
                citationsSelected={citationsSelected}
                proposalsSelected={proposalsSelected}
                acceptedProposalsSelected={acceptedProposalsSelected}
                commentsSelected={commentsSelected}
                editable={editable}
                setNodeParts={setNodeParts}
                title={title}
                content={content}
                unaccepted={unaccepted}
                openPart={openPart}
                nodeType={nodeType}
                isNew={isNew}
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
                changed={changed}
                changedAt={changedAt}
                bookmarked={bookmarked}
                bookmarks={bookmarks}
                reloadPermanentGrpah={reloadPermanentGrpah}
                onNodeShare={onNodeShare}
                markStudied={markStudiedHandler}
                bookmark={bookmarkHandler}
                openNodePart={openNodePartHandler}
                selectNode={selectNodeHandler}
                correctNode={correctNodeHandler}
                wrongNode={wrongNodeHandler}
                disableVotes={disableVotes}
                uploadNodeImage={uploadNodeImageHandler}
                user={user}
                citations={citations}
                setOpenSideBar={setOpenSideBar}
                locked={locked}
                openSidebar={openSidebar}
              />
            </div>
          </div>
        </div>
      )}
      {openSidebar === "PROPOSALS" && !isNew && nodeBookState.selectedNode == identifier ? (
        <>
          <Box
            sx={{
              mx: "10px",
              borderTop: theme =>
                theme.palette.mode === "dark" ? `solid 1px ${theme.palette.common.borderColor}` : "solid 1px",
            }}
          />
          <Box sx={{ p: "13px 10px" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <EditProposal
                identifier={identifier}
                openProposal={openProposal}
                proposeNodeImprovement={proposeNodeImprovement}
                selectedNode={nodeBookState.selectedNode}
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
                        openProposal={openProposal}
                        setOpenProposal={setOpenProposal}
                        proposeNewChild={proposeNewChild}
                      />
                    );
                  }
                )}
              </div>
            </Box>
          </Box>
        </>
      ) : null}
    </div>
  );
};

export const MemoizedNode = React.memo(Node);
