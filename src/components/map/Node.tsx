import AdapterMomentJs from "@date-io/moment";
import { keyframes } from "@emotion/react";
import AddIcon from "@mui/icons-material/Add";
import CodeIcon from "@mui/icons-material/Code";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SearchIcon from "@mui/icons-material/Search";
import ShareIcon from "@mui/icons-material/Share";
import { Box, Button, Fab, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import moment from "moment";
import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { DispatchNodeBookActions, FullNodeData, OpenPart, TNodeUpdates } from "src/nodeBookTypes";

import { useNodeBook } from "@/context/NodeBookContext";
import { getSearchAutocomplete } from "@/lib/knowledgeApi";
import { Post } from "@/lib/mapApi";
import { findDiff, getVideoDataByUrl, momentDateToSeconds } from "@/lib/utils/utils";
import { OpenSidebar } from "@/pages/notebook";

import { useAuth } from "../../context/AuthContext";
import { KnowledgeChoice } from "../../knowledgeTypes";
import { SearchNodesResponse } from "../../knowledgeTypes";
import { TNodeBookState } from "../../nodeBookTypes";
import { NodeType } from "../../types";
// import { FullNodeData } from "../../noteBookTypes";
import { Editor } from "../Editor";
import HtmlTooltip from "../HtmlTooltip";
import MarkdownRender from "../Markdown/MarkdownRender";
import NodeTypeIcon from "../NodeTypeIcon2";
// import LeaderboardChip from "../LeaderboardChip";
// import NodeTypeIcon from "../NodeTypeIcon";
// import EditProposal from "./EditProposal";
import LinkingWords from "./LinkingWords/LinkingWords";
import { MemoizedMetaButton } from "./MetaButton";
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
  nodeBookDispatch: React.Dispatch<DispatchNodeBookActions>;
  nodeUpdates: TNodeUpdates;
  setNodeUpdates: (updates: TNodeUpdates) => void;
  notebookRef: MutableRefObject<TNodeBookState>;
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
  nodeType: any;
  isTag: boolean;
  isNew: any;
  title: string;
  content: string;
  nodeImage: string;
  nodeVideo: string;
  nodeVideoStartTime: number;
  nodeVideoEndTime: number;
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
  openAllParent: any;
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
  contributors: any;
  institutions: any;
  openUserInfoSidebar: (uname: string, imageUrl: string, fullName: string, chooseUname: string) => void;
  disabled?: boolean;
  enableChildElements?: string[];
  // defaultOpenPart?: OpenPart; // this is only to configure default open part value in tutorial
  // showProposeTutorial?: boolean; // this flag is to enable tutorial first time user click in pencil
  // setCurrentTutorial: (newValue: TutorialType) => void;
  ableToPropose: boolean;
  setAbleToPropose: (newValue: boolean) => void;
};

const proposedChildTypesIcons: { [key in ProposedChildTypesIcons]: string } = {
  Concept: "local_library",
  Relation: "share",
  Question: "help_outline",
  Code: "code",
  Reference: "menu_book",
  Idea: "emoji_objects",
};

type Pagination = {
  data: any[];
  lastPageLoaded: number;
  totalPage: number;
  totalResults: number;
};

const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];

const Node = ({
  identifier,
  nodeBookDispatch,
  setNodeUpdates,
  notebookRef,
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
  isNew,
  title,
  content,
  nodeImage,
  nodeVideo,
  nodeVideoStartTime,
  nodeVideoEndTime,
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
  openAllParent,
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
  saveProposedChildNode,
  saveProposedImprovement,
  closeSideBar,
  reloadPermanentGrpah,
  setOpenMedia,
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
  contributors,
  institutions,
  openUserInfoSidebar,
  disabled = false,
  enableChildElements = [],
  // defaultOpenPart: defaultOpenPartByTutorial = "LinkingWords",
  // showProposeTutorial = false,
  // setCurrentTutorial,
  ableToPropose,
  setAbleToPropose,
}: NodeProps) => {
  const [{ user }] = useAuth();
  const { nodeBookState } = useNodeBook();
  const [option, setOption] = useState<EditorOptions>("EDIT");

  const [openPart, setOpenPart] = useState<OpenPart>(null);
  const [isHiding, setIsHiding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [reason, setReason] = useState("");
  const [addVideo, setAddVideo] = useState(!!nodeVideo);
  const [videoUrl, setVideoUrl] = useState(nodeVideo);
  const [videoStartTime, setVideoStartTime] = useState<any>(nodeVideoStartTime ? nodeVideoStartTime : 0);
  const [videoEndTime, setVideoEndTime] = useState<any>(nodeVideoEndTime ? nodeVideoEndTime : 0);
  const nodeRef = useRef(null);
  const previousHeightRef = useRef<number>(0);
  const previousTopRef = useRef<string>("0px");
  const observer = useRef<ResizeObserver | null>(null);
  const [titleCopy, setTitleCopy] = useState(title);
  const [titleUpdated, setTitleUpdated] = useState(false);
  const [searchResults, setSearchResults] = useState<Pagination>({
    data: [],
    lastPageLoaded: 0,
    totalPage: 0,
    totalResults: 0,
  });
  const [nodeTitleHasIssue, setNodeTitleHasIssue] = useState<boolean>(false);
  const [explainationDesc, setExplainationDesc] = useState<boolean>(false);
  const [openProposal, setOpenProposal] = useState<any>(false);
  const [startTimeValue, setStartTimeValue] = React.useState<any>(moment.utc(nodeVideoStartTime * 1000));
  const [endTimeValue, setEndTimeValue] = React.useState<any>(moment.utc(nodeVideoEndTime * 1000));
  const [timePickerError, setTimePickerError] = React.useState<any>(false);
  const [error, setError] = useState<any>(null);
  const [contentCopy, setContentCopy] = useState(content);
  const [isLoading, startTransition] = useTransition();
  const childNodeButtonsAnimation = keyframes({
    from: { left: "500px", zIndex: -999 },
    to: { left: "600px", zIndex: 0 },
  });

  const disableTitle = disabled && !enableChildElements.includes(`${identifier}-node-title`);
  const disableContent = disabled && !enableChildElements.includes(`${identifier}-node-content`);
  const disableWhy = disabled && !enableChildElements.includes(`${identifier}-node-why`);
  const disableSwitchPreview = disabled;
  const disableProposeButton = disabled && !enableChildElements.includes(`${identifier}-button-propose-proposal`);
  const disableCancelButton = disabled && !enableChildElements.includes(`${identifier}-button-cancel-proposal`);

  useEffect(() => {
    setTitleCopy(title);
    setContentCopy(content);
  }, [title, content]);

  useEffect(() => {
    setVideoUrl(videoUrl => {
      return videoUrl !== nodeVideo ? nodeVideo : videoUrl;
    });
    setVideoStartTime((videoStartTime: any) => {
      return videoStartTime !== nodeVideoStartTime ? nodeVideoStartTime : videoStartTime;
    });

    setStartTimeValue((startTime: any) => {
      return !moment(startTime).isSame(moment(nodeVideoStartTime * 1000))
        ? moment.utc(nodeVideoStartTime * 1000)
        : moment.utc(startTime);
    });

    setEndTimeValue((endTime: any) => {
      return !moment(endTime).isSame(moment(nodeVideoEndTime * 1000))
        ? moment.utc(nodeVideoEndTime * 1000)
        : moment.utc(endTime);
    });

    setVideoEndTime((videoEndTime: any) => {
      return videoEndTime !== nodeVideoEndTime ? nodeVideoEndTime : videoEndTime;
    });
  }, [nodeVideo, nodeVideoStartTime, nodeVideoEndTime]);

  const videoData = useMemo(() => {
    const startTime = parseInt(videoStartTime);
    const endTime = parseInt(videoEndTime);
    if (
      typeof startTime !== "undefined" &&
      typeof endTime !== "undefined" &&
      !isNaN(startTime) &&
      !isNaN(endTime) &&
      startTime > endTime
    ) {
      setTimePickerError(true);
    } else {
      if (timePickerError) {
        setTimePickerError(false);
      }
    }

    return getVideoDataByUrl(videoUrl, startTime, endTime);
  }, [videoUrl, videoStartTime, videoEndTime]);

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
      if (notebookRef.current.choosingNode && notebookRef.current.choosingNode.id !== identifier) {
        // The first Nodes exist, Now is clicking the Chosen Node
        notebookRef.current.chosenNode = {
          id: identifier,
          title,
        };
        nodeBookDispatch({ type: "setChosenNode", payload: { id: identifier, title } });
        chosenNodeChanged(notebookRef.current.choosingNode.id);
        setAbleToPropose(true);
        scrollToNode(notebookRef.current.selectedNode);
      } else if (
        "activeElement" in event.currentTarget &&
        "nodeName" in event.currentTarget.activeElement &&
        event.currentTarget.activeElement.nodeName !== "INPUT" &&
        !notebookRef.current.choosingNode
      ) {
        nodeClicked(event, identifier, nodeType, setOpenPart);
      }

      if (!notebookRef.current.choosingNode && notebookRef.current.selectedNode !== identifier) {
        const updatedNodeIds: string[] = [notebookRef.current.selectedNode!, identifier];
        notebookRef.current.selectedNode = identifier;
        nodeBookDispatch({ type: "setSelectedNode", payload: identifier });
        setNodeUpdates({
          nodeIds: updatedNodeIds,
          updatedAt: new Date(),
        });
      }
    },
    [identifier, title, nodeClicked, nodeType]
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
    const hasContent = !!contentCopy.trim().length;
    const hasImage = !!imageLoaded;
    setAbleToPropose(newTitle.trim().length > 0 && (hasContent || hasImage));
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
          console.log("PROPOSE NEW");
          saveProposedChildNode(identifier, "", reason, () => setAbleToPropose(true));
          if (!firstParentId) return;
          notebookRef.current.selectedNode = firstParentId.node;
          nodeBookDispatch({ type: "setSelectedNode", payload: firstParentId.node });
          return;
        }
        console.log("PROPOSE");

        saveProposedImprovement("", reason, () => setAbleToPropose(true));
        notebookRef.current.selectedNode = identifier;
        nodeBookDispatch({ type: "setSelectedNode", payload: identifier });
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
    notebookRef.current.selectedNode = scrollTo;
    nodeBookDispatch({ type: "setSelectedNode", payload: scrollTo });
    setOperation("CancelProposals");
    closeSideBar();
  };

  const proposeNodeImprovementHandler = useCallback(
    (event: any, nodeId: string = "") => {
      setOpenPart("References");
      setReason("");
      cleanEditorLink();
      proposeNodeImprovement(event, nodeId);
    },
    [setOpenPart, setReason, cleanEditorLink]
  );

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
      setAbleToPropose(false);
    }
  }, [editable, activeNode]);

  const onBlurContent = useCallback((newContent: string) => {
    setNodeParts(identifier, thisNode => ({ ...thisNode, content: newContent }));
  }, []);

  const onBlurNodeTitle = useCallback(
    async (newTitle: string) => {
      setNodeParts(identifier, thisNode => ({ ...thisNode, title: newTitle }));
      if (titleUpdated && newTitle.trim().length > 0) {
        notebookRef.current.searchByTitleOnly = true;
        nodeBookDispatch({ type: "setSearchByTitleOnly", payload: true });
        let nodes: any = await getSearchAutocomplete(newTitle);
        let exactMatchingNode = nodes.results.filter((title: any) => title === newTitle);
        let diff = findDiff(nodes.results[0] ?? "", newTitle);
        if (!explainationDesc) {
          if (exactMatchingNode.length > 0 || diff.length <= 1) {
            onSearch(1, newTitle.trim());
            setNodeTitleHasIssue(true);
            setAbleToPropose(false);
          } else {
            setSearchResults({
              data: [],
              lastPageLoaded: 0,
              totalPage: 0,
              totalResults: 0,
            });
            setError(null);
            if (contentCopy.trim().length > 0 || imageLoaded) setAbleToPropose(true);
          }
        }
        setTitleUpdated(false);
      }
      notebookRef.current.nodeTitleBlured = true;
      notebookRef.current.searchQuery = newTitle;

      // setOpenSideBar("SEARCHER_SIDEBAR");
      // nodeBookDispatch({ type: "setNodeTitleBlured", payload: true });
      // nodeBookDispatch({ type: "setSearchQuery", payload: newTitle });
    },
    [titleUpdated]
  );

  const onSearch = useCallback(async (page: number, q: string) => {
    try {
      if (page < 1) {
        setSearchResults({
          data: [],
          lastPageLoaded: 0,
          totalPage: 0,
          totalResults: 0,
        });
      }
      const data: SearchNodesResponse = await Post<SearchNodesResponse>("/searchNodesInNotebook", {
        q,
        nodeTypes: NODE_TYPES_ARRAY,
        tags: [],
        nodesUpdatedSince: 1000,
        sortOption: "NOT_SELECTED",
        sortDirection: "DESCENDING",
        page,
        onlyTitle: nodeBookState.searchByTitleOnly,
      });

      const newData = page === 1 ? data.data : [...searchResults.data, ...data.data];
      setSearchResults({
        data: newData,
        lastPageLoaded: data.page,
        totalPage: Math.ceil((data.numResults || 0) / (data.perPage || 10)),
        totalResults: data.numResults,
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

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
        (nodeType === "Reference" ? " Choosable" : "")
      }
      style={{
        left: left ? left : 1000,
        top: top ? top : 1000,
        width: width,
        transition: "0.3s",
        padding: "13px 13px 13px 13px",
      }}
    >
      {/* INFO: uncomment this only on develope */}
      {process.env.NODE_ENV === "development" && (
        <Typography sx={{ position: "absolute", top: "-2px" }}>{identifier}</Typography>
      )}

      {open ? (
        <>
          <div className="card-content">
            {/* <div className="card-title" data-hoverable={true}> */}
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
                id={`${identifier}-preview-edit`}
                sx={{
                  display: "flex",
                  justifyContent: "end",
                  alignItems: "center",
                  position: "relative",
                  top: "-5px",
                }}
              >
                <Typography
                  onClick={() => setOption("PREVIEW")}
                  sx={{ cursor: "pointer", fontSize: "14px", fontWeight: 490, color: "inherit" }}
                >
                  Preview
                </Typography>
                <Switch
                  disabled={disableSwitchPreview}
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

            {!editable && !unaccepted && !notebookRef.current.choosingNode /* && !choosingNode */ && (
              <MemoizedNodeHeader
                id={identifier}
                open={open}
                onToggleNode={toggleNodeHandler}
                onHideOffsprings={hideOffspringsHandler}
                onHideNodeHandler={hideNodeHandler}
                disabled={disabled}
                enableChildElements={enableChildElements}
                sx={{ float: "right" }}
                // sx={{ position: "absolute", right: "10px", top: "0px" }}
              />
            )}

            <div id={`${identifier}-node-body`} className="NodeContent" data-hoverable={true}>
              <Editor
                id={`${identifier}-node-title`}
                label="Enter the node title:"
                value={titleCopy}
                setValue={onSetTitle}
                onBlurCallback={onBlurNodeTitle}
                readOnly={!editable}
                sxPreview={{ fontSize: "25px", fontWeight: 300 }}
                error={error ? true : false}
                helperText={error ? error : ""}
                showEditPreviewSection={false}
                editOption={option}
                disabled={disableTitle}
              />
              {editable && searchResults.data.length > 0 && (
                <Box sx={{ background: "#183658", mb: "12px", padding: "5px 0px 0px 15px" }}>
                  <Typography
                    sx={{
                      color: theme => theme.palette.common.white,
                      fontSize: "17px",
                    }}
                    variant="h4"
                  >
                    Make sure the node title you propose is different from the following:
                  </Typography>
                  <Box className="node-suggestions" sx={{ height: "70px", marginTop: "5px", overflowY: "scroll" }}>
                    {searchResults.data.map((resNode, idx) => {
                      return (
                        <Box key={idx}>
                          <HtmlTooltip
                            title={
                              <Typography variant="body2" component="div">
                                <MarkdownRender text={resNode.content} />
                              </Typography>
                            }
                            placement={"right"}
                          >
                            <Button
                              onClick={() => openLinkedNode(resNode.id, "Searcher")}
                              sx={{
                                ":hover": {
                                  background: "transparent",
                                },
                              }}
                            >
                              <Stack direction={"row"} spacing={2}>
                                <NodeTypeIcon nodeType={resNode.nodeType} fontSize="inherit" />
                                <Typography
                                  sx={{
                                    color: theme => theme.palette.common.white,
                                  }}
                                  fontSize={13}
                                  variant="subtitle1"
                                >
                                  {resNode.title}
                                </Typography>
                              </Stack>
                            </Button>
                          </HtmlTooltip>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
              {/* </div> */}

              <Box
                sx={{
                  mt: editable ? "12px" : undefined,
                }}
                id={`${identifier}-node-content`}
              >
                <Editor
                  label="Edit the node content:"
                  value={contentCopy}
                  setValue={onSetContent}
                  onBlurCallback={value => onBlurContent(value)}
                  readOnly={!editable}
                  sxPreview={{ marginTop: "13px" }}
                  showEditPreviewSection={false}
                  editOption={option}
                  disabled={disableContent}
                />
                {editable && <Box sx={{ mb: "12px" }}></Box>}

                <div id={`${identifier}-node-content-media`}>
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
                  {!editable && nodeVideo && (
                    <>
                      <MemoizedNodeVideo addVideo={true} videoData={videoData} />
                      <Box sx={{ mb: "12px" }}></Box>
                    </>
                  )}
                </div>
              </Box>

              {editable && (
                <>
                  <Editor
                    id={`${identifier}-node-why`}
                    label={
                      "Explain why you propose this " +
                      (isNew ? nodeType + " child node" : "new version") +
                      " to expedite your proposal review:"
                    }
                    value={reason}
                    setValue={setReason}
                    readOnly={false}
                    onBlurCallback={onBlurExplainDesc}
                    showEditPreviewSection={false}
                    editOption={option}
                    disabled={disableWhy}
                  />
                </>
              )}

              {editable && addVideo && (
                <>
                  <Box sx={{ mb: "12px" }}></Box>
                  <TextField
                    label={"Enter a YouTube URL:"}
                    onChange={e => setVideoUrl(e.target.value)}
                    onBlur={() => {
                      if (videoUrl !== nodeVideo) {
                        setNodeParts(identifier, node => ({ ...node, nodeVideo: videoUrl }));
                      }
                    }}
                    value={videoUrl}
                    variant="outlined"
                    fullWidth
                    sx={{ p: "0px", m: "0px", fontWeight: 400, lineHeight: "24px" }}
                  />
                  <Box sx={{ mb: "12px" }}></Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-around",
                    }}
                  >
                    <Box
                      sx={{
                        width: "49.5%",
                      }}
                    >
                      {/* <TextField
                        type={"number"}
                        label={"Start Time:"}
                        onChange={e => {
                          let startTime = parseInt(e.target.value);
                          setVideoStartTime(!isNaN(startTime) ? startTime : "");
                        }}
                        onBlur={() => {
                          if (nodeVideoStartTime !== videoStartTime) {
                            setNodeParts(identifier, node => ({ ...node, nodeVideoStartTime: videoStartTime }));
                          }
                        }}
                        value={videoStartTime}
                        variant="outlined"
                        fullWidth
                        sx={{ p: "0px", m: "0px", fontWeight: 400, lineHeight: "24px" }}
                      /> */}
                      <LocalizationProvider dateAdapter={AdapterMomentJs}>
                        <TimePicker
                          ampm={false}
                          openTo="hours"
                          views={["hours", "minutes", "seconds"]}
                          inputFormat="HH:mm:ss"
                          mask="__:__:__"
                          label="Start Time"
                          value={startTimeValue}
                          onChange={newValue => {
                            setStartTimeValue(newValue);
                            startTransition(() => {
                              if (nodeVideoStartTime !== momentDateToSeconds(moment(newValue))) {
                                setNodeParts(identifier, node => ({
                                  ...node,
                                  nodeVideoStartTime: momentDateToSeconds(moment(newValue)),
                                }));
                              }
                            });
                          }}
                          renderInput={params => <TextField {...params} />}
                        />
                      </LocalizationProvider>
                    </Box>

                    <Box
                      sx={{
                        width: "49.5%",
                      }}
                    >
                      {/* <TextField
                        type={"number"}
                        label={"End Time:"}
                        onChange={e => {
                          let endTime = parseInt(e.target.value);
                          setVideoEndTime(!isNaN(endTime) ? endTime : "");
                        }}
                        onBlur={() => {
                          if (nodeVideoEndTime !== videoEndTime) {
                            setNodeParts(identifier, node => ({ ...node, nodeVideoEndTime: videoEndTime }));
                          }
                        }}
                        value={videoEndTime}
                        variant="outlined"
                        fullWidth
                        sx={{ p: "0px", m: "0px", fontWeight: 400, lineHeight: "24px" }}
                      /> */}

                      <LocalizationProvider dateAdapter={AdapterMomentJs}>
                        <TimePicker
                          ampm={false}
                          openTo="hours"
                          views={["hours", "minutes", "seconds"]}
                          inputFormat="HH:mm:ss"
                          mask="__:__:__"
                          label="End Time"
                          value={endTimeValue}
                          onChange={newValue => {
                            setEndTimeValue(newValue);
                            startTransition(() => {
                              if (nodeVideoEndTime !== momentDateToSeconds(moment(newValue))) {
                                setNodeParts(identifier, node => ({
                                  ...node,
                                  nodeVideoEndTime: momentDateToSeconds(moment(newValue)),
                                }));
                              }
                            });
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              error={timePickerError}
                              helperText={timePickerError ? "Should be greater than start time" : ""}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Box>
                  </Box>
                  <Box sx={{ mb: "12px" }}></Box>
                  <MemoizedNodeVideo addVideo={addVideo} videoData={videoData} />
                </>
              )}
            </div>
            <MemoizedNodeFooter
              open={true}
              addVideo={addVideo}
              setAddVideo={setAddVideo}
              identifier={identifier}
              notebookRef={notebookRef}
              nodeBookDispatch={nodeBookDispatch}
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
              contributors={contributors}
              institutions={institutions}
              openUserInfoSidebar={openUserInfoSidebar}
              proposeNodeImprovement={proposeNodeImprovementHandler}
              setOperation={setOperation}
              disabled={disabled}
              enableChildElements={enableChildElements}
            />
          </div>
          {(openPart === "LinkingWords" || openPart === "Tags" || openPart === "References") && (
            <LinkingWords
              identifier={identifier}
              notebookRef={notebookRef}
              nodeBookDispatch={nodeBookDispatch}
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
              openAllParent={openAllParent}
              saveProposedChildNode={saveProposedChildNode}
              saveProposedImprovement={saveProposedImprovement}
              closeSideBar={closeSideBar}
              setAbleToPropose={setAbleToPropose}
              ableToPropose={ableToPropose}
              isLoading={isLoading}
              onResetButton={newValue => setAbleToPropose(newValue)}
              setOperation={setOperation}
              disabled={disabled}
              enableChildElements={enableChildElements}
              nodeType={nodeType}
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
                id={`${identifier}-button-propose-cancel`}
                className="ProposalCommentSubmitButton"
                sx={{
                  textAlign: "center",
                  display: "flex",
                  margin: "10px",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  id={`${identifier}-button-cancel-proposal`}
                  color="error"
                  variant="contained"
                  className="btn waves-effect waves-light hoverable red"
                  onClick={onCancelProposal}
                  disabled={disableCancelButton}
                  sx={{
                    padding: "6px",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  id={`${identifier}-button-propose-proposal`}
                  color="success"
                  variant="contained"
                  className="btn waves-effect waves-light hoverable green"
                  onClick={proposalSubmit}
                  disabled={(!ableToPropose ?? false) || disableProposeButton}
                  sx={{
                    padding: "6px",
                  }}
                >
                  Propose
                </Button>
                {/* <div
                    id="ProposalButtonsRow"
                    style={{
                      border: "solid 0px pink",
                      display: !isNew && nodeType !== "Reference" ? "flex" : "none",
                      justifyContent: "space-around",
                    }}
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
                  </div> */}
              </Box>
            </>
          )}
        </>
      ) : (
        <div className="card-content">
          {!notebookRef.current.choosingNode && (
            <MemoizedNodeHeader
              id={identifier}
              // setFocusView={() => setFocusView({ isEnabled: true, selectedNode: identifier })}
              open={open}
              onToggleNode={toggleNodeHandler}
              onHideOffsprings={hideOffspringsHandler}
              onHideNodeHandler={hideNodeHandler}
              disabled={disabled}
              enableChildElements={enableChildElements}
              sx={{ float: "right" }}
              // sx={{ position: "absolute", right: "10px", top: "0px" }}
            />
          )}
          {/* <div className="card-title"> */}
          <div className="NodeTitleClosed">
            <Editor
              disabled={disabled}
              label="title"
              value={titleCopy}
              setValue={setTitleCopy}
              readOnly={true}
              sxPreview={{ fontSize: "25px" }}
            />
          </div>
          <div className="footer">
            <MemoizedNodeFooter
              open={false}
              addVideo={addVideo}
              setAddVideo={setAddVideo}
              identifier={identifier}
              notebookRef={notebookRef}
              nodeBookDispatch={nodeBookDispatch}
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
              contributors={contributors}
              institutions={institutions}
              openUserInfoSidebar={openUserInfoSidebar}
              proposeNodeImprovement={proposeNodeImprovement}
              setOperation={setOperation}
              disabled={disabled}
            />
          </div>
        </div>
      )}
      {/* {openSidebar === "PROPOSALS" && !simulated && !isNew && nodeBookState.selectedNode == identifier ? (
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
                style={{
                  border: "solid 0px pink",
                  display: nodeType !== "Reference" ? "flex" : "none",
                  justifyContent: "space-around",
                }}
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

      ) : null} */}
      {!isNew && nodeType !== "Reference" && editable && (
        <Box
          id={`${identifier}_childNodes`}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            position: "absolute",
            top:
              (parseFloat(String(document.getElementById(identifier)?.clientHeight)) -
                parseFloat(String(document.getElementById(identifier + "_" + "childNodes")?.clientHeight))) *
                0.5 +
              "px",
            animation: `${childNodeButtonsAnimation} 1s forwards`,
          }}
        >
          {(Object.keys(proposedChildTypesIcons) as ProposedChildTypesIcons[]).map(
            (childNodeType: ProposedChildTypesIcons, index: number) => {
              return (
                <Tooltip title={`Propose a ${childNodeType} child`} placement="right" key={index}>
                  <Fab
                    id={`${identifier}-propose-${childNodeType.toLowerCase()}-child`}
                    disabled={disabled}
                    color="primary"
                    sx={{
                      background: "#1F1F1F",
                      ":hover": {
                        background: "#525151",
                      },
                    }}
                    aria-label="add"
                    onClick={(event: any) => {
                      return openProposal !== "ProposeNew" + childNodeType + "ChildNode"
                        ? proposeNewChild(event, childNodeType, setOpenProposal)
                        : undefined;
                    }}
                  >
                    <>
                      {proposedChildTypesIcons[childNodeType] === "local_library" && (
                        <LocalLibraryIcon sx={{ color: "white!important" }} />
                      )}
                      {proposedChildTypesIcons[childNodeType] === "help_outline" && (
                        <HelpOutlineIcon sx={{ color: "#fff" }} />
                      )}
                      {proposedChildTypesIcons[childNodeType] === "code" && <CodeIcon sx={{ color: "#fff" }} />}
                      {proposedChildTypesIcons[childNodeType] === "share" && <ShareIcon sx={{ color: "#fff" }} />}
                      {proposedChildTypesIcons[childNodeType] === "menu_book" && (
                        <MenuBookIcon sx={{ color: "#fff" }} />
                      )}
                      {proposedChildTypesIcons[childNodeType] === "emoji_objects" && (
                        <EmojiObjectsIcon sx={{ color: "#fff" }} />
                      )}
                    </>
                  </Fab>
                </Tooltip>
              );
            }
          )}
        </Box>
      )}
    </div>
  );
};

export const MemoizedNode = React.memo(Node, (prev, next) => {
  const basicChanges =
    prev.top === next.top &&
    prev.left === next.left &&
    prev.activeNode === next.activeNode &&
    prev.proposalsSelected === next.proposalsSelected &&
    prev.acceptedProposalsSelected === next.acceptedProposalsSelected &&
    prev.commentsSelected === next.commentsSelected &&
    prev.unaccepted === next.unaccepted &&
    prev.disableVotes === next.disableVotes &&
    (!next.activeNode || prev.ableToPropose === next.ableToPropose);
  if (
    !basicChanges ||
    (prev.nodeUpdates.updatedAt !== next.nodeUpdates.updatedAt && prev.nodeUpdates.nodeIds.includes(prev.identifier)) ||
    (prev.nodeUpdates.updatedAt !== next.nodeUpdates.updatedAt && next.nodeUpdates.nodeIds.includes(next.identifier))
  ) {
    if (next.identifier === "pQbAryhwz1QQSCLz2p7P") {
      console.log("chosenNode children", next.references);
    }
    return false;
  }

  return true;
});
