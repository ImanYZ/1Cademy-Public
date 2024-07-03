import AdapterMomentJs from "@date-io/moment";
import { keyframes } from "@emotion/react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CodeIcon from "@mui/icons-material/Code";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ShareIcon from "@mui/icons-material/Share";
import { LoadingButton } from "@mui/lab";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Fab,
  Paper,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import moment from "moment";
import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { DispatchNodeBookActions, FullNodeData, OpenPart, TNodeUpdates } from "src/nodeBookTypes";

import { useNodeBook } from "@/context/NodeBookContext";
import { Post } from "@/lib/mapApi";
import { useCreateActionTrack } from "@/lib/utils/Map.utils";
import { getVideoDataByUrl, momentDateToSeconds } from "@/lib/utils/utils";
import {
  ChosenType,
  OnChangeChosenNode,
  onForceRecalculateGraphInput,
  OnSelectNodeInput,
  OpenLeftSidebar,
} from "@/pages/notebook";

import { useAuth } from "../../context/AuthContext";
import { KnowledgeChoice } from "../../knowledgeTypes";
import { SearchNodesResponse } from "../../knowledgeTypes";
import { TNodeBookState } from "../../nodeBookTypes";
// import { NodeType } from "../../types";
// import { FullNodeData } from "../../noteBookTypes";
import { Editor } from "../Editor";
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

dayjs.extend(relativeTime);
// CHECK: Improve this passing Full Node Data
// this Node need to become testeable
// also split the in (Node and FormNode) to reduce the complexity

type EditorOptions = "EDIT" | "PREVIEW";
type ProposedChildTypesIcons = "Concept" | "Relation" | "Question" | "Code" | "Reference" | "Idea";

type Parent = {
  node: string;
  label: string;
  title: string;
  type: string;
  visible: boolean;
};

type NodeProps = {
  identifier: string;
  nodeBookDispatch: React.Dispatch<DispatchNodeBookActions>;
  nodeUpdates: TNodeUpdates;
  setNodeUpdates: (updates: TNodeUpdates) => void;
  notebookRef: MutableRefObject<TNodeBookState>;
  setFocusView: (state: { selectedNode: string; isEnabled: boolean }) => void;
  activeNode: any;
  // citationsSelected: any;
  isProposalsSelected: boolean;
  isAcceptedProposalSelected: boolean;
  // acceptedProposalsSelected: any;
  // commentsSelected: any;
  left: number;
  top: number;
  width: number;
  editable: boolean;
  unaccepted: boolean;
  nodeType: any;
  isTag: boolean;
  isNew: boolean;
  newParent: boolean;
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
  tags:
    | string[]
    | {
        node: string;
        title?: string;
        label?: string;
      }[];
  tagIds: string[];
  parents: Parent[];
  nodesChildren:
    | string[]
    | {
        node: string;
        title?: string;
        label?: string;
      }[];
  removedTags: string[];
  addedTags: any;
  addedReferences: any;
  removedReferences: any;
  addedParents: any;
  removedParents: any;
  addedChildren: any;
  removedChildren: any;
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
  hideDescendants: any;
  toggleNode: (event: any, id: string) => void;
  openNodePart: (event: any, id: string, partType: any, openPart: any, setOpenPart: any, tags: any) => void; //
  onNodeShare: (nodeId: string, platform: string) => void;
  selectNode: (params: OnSelectNodeInput) => void;
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
  saveProposedParentNode: any;
  saveProposedImprovement: any;
  closeSideBar: any;
  reloadPermanentGraph: any;
  setOpenMedia: (imagUrl: string) => void;
  // setOpenSearch: any;
  setNodeParts: (nodeId: string, callback: (thisNode: FullNodeData) => FullNodeData) => void;
  citations: { [key: string]: Set<string> };
  setOpenSideBar: (sidebar: OpenLeftSidebar) => void;
  proposeNodeImprovement: any;
  proposeNewChild: any;
  proposeNewParent: any;
  scrollToNode: any;
  openSidebar: OpenLeftSidebar;
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
  openPart: OpenPart;
  setOpenPart: (newOpenPart: OpenPart) => void;
  // notebooks: string[];
  // expands: boolean[];
  // selectedNotebookId: string;
  open: boolean;
  nodeHeight: number;
  hideNode: boolean;
  setAssistantSelectNode: (newValue: boolean) => void;
  assistantSelectNode: boolean;
  onForceRecalculateGraph: (props: onForceRecalculateGraphInput) => void;
  setSelectedProposalId: (newValue: string) => void;
  onChangeChosenNode: (props: OnChangeChosenNode) => void;
  editingModeNode: boolean;
  setEditingModeNode: (newValue: boolean) => void;
  displayParentOptions: boolean;
  findDescendantNodes: (selectedNode: string, searchNode: string) => boolean;
  findAncestorNodes: (selectedNode: string, searchNode: string) => boolean;
  onlineUsers: { [uname: string]: boolean };
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

// const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];

const Node = ({
  identifier,
  nodeBookDispatch,
  setNodeUpdates,
  notebookRef,
  activeNode,
  // citationsSelected,
  isProposalsSelected,
  // acceptedProposalsSelected,
  // commentsSelected,
  left,
  top,
  width,
  editable,
  unaccepted,
  nodeType,
  isTag,
  isNew,
  newParent,
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
  removedTags,
  addedTags,
  addedReferences,
  removedReferences,
  addedParents,
  removedParents,
  addedChildren,
  removedChildren,
  tags,
  tagIds,
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
  hideDescendants: onHideDescendants,
  toggleNode,
  openNodePart,
  onNodeShare,
  selectNode,
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
  saveProposedParentNode,
  saveProposedImprovement,
  closeSideBar,
  reloadPermanentGraph,
  setOpenMedia,
  setNodeParts,
  citations,
  setOpenSideBar,
  proposeNodeImprovement,
  proposeNewChild,
  proposeNewParent,
  cleanEditorLink,
  openSidebar,
  locked,
  setOperation,
  contributors,
  institutions,
  openUserInfoSidebar,
  disabled = false,
  enableChildElements = [],
  open,
  // defaultOpenPart: defaultOpenPartByTutorial = "LinkingWords",
  // showProposeTutorial = false,
  // setCurrentTutorial,
  ableToPropose,
  setAbleToPropose,
  openPart,
  setOpenPart,
  hideNode,
  nodeHeight,
  setAssistantSelectNode,
  assistantSelectNode,
  onForceRecalculateGraph,
  setSelectedProposalId,
  onChangeChosenNode,
  editingModeNode,
  setEditingModeNode,
  displayParentOptions,
  findDescendantNodes,
  findAncestorNodes,
  onlineUsers,
}: NodeProps) => {
  const [{ user }] = useAuth();
  const { nodeBookState } = useNodeBook();
  const [option, setOption] = useState<EditorOptions>("EDIT");
  const [showSimilarNodes, setShowSimilarNodes] = useState(true);
  // const [openPart, setOpenPart] = useState<OpenPart>(null);
  const [isHiding, setIsHiding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [addVideo, setAddVideo] = useState(!!nodeVideo);
  const [videoUrl, setVideoUrl] = useState(nodeVideo);
  const [videoStartTime, setVideoStartTime] = useState<any>(nodeVideoStartTime ? nodeVideoStartTime : 0);
  const [videoEndTime, setVideoEndTime] = useState<any>(nodeVideoEndTime ? nodeVideoEndTime : 0);
  const nodeRef = useRef<HTMLDivElement>(null);
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
  const createActionTrack = useCreateActionTrack();

  const [openProposalType, setOpenProposalType] = useState<any>(false);
  const [startTimeValue, setStartTimeValue] = React.useState<any>(moment.utc(nodeVideoStartTime * 1000));
  const [endTimeValue, setEndTimeValue] = React.useState<any>(moment.utc(nodeVideoEndTime * 1000));
  const [timePickerError, setTimePickerError] = React.useState<any>(false);
  const [contentCopy, setContentCopy] = useState(content);
  const [isLoading, startTransition] = useTransition();
  const [imageHeight, setImageHeight] = useState(100);
  const [proposeLoading, setProposeLoading] = useState<boolean>(false);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  const childNodeButtonsAnimation = keyframes({
    from: { left: "500px", zIndex: -999 },
    to: { left: "600px", zIndex: 0 },
  });

  const [toBeEligible, setToBeEligible] = useState(false);
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
  }, [videoStartTime, videoEndTime, videoUrl, timePickerError]);

  useEffect(() => {
    if (!addVideo) {
      setNodeParts(identifier, node => ({ ...node, nodeVideo: "" }));
    }
  }, [addVideo, identifier, setNodeParts]);

  useEffect(() => {
    observer.current = new ResizeObserver(entries => {
      try {
        const { blockSize } = entries[0].borderBoxSize[0];
        const topPosition = (entries[0].target as any)?.style?.top;
        const thereIsSignificantChanges = Math.abs(blockSize - previousHeightRef.current) < 10;
        previousHeightRef.current = blockSize;
        previousTopRef.current = topPosition;
        if (thereIsSignificantChanges) return;

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
  }, [changeNodeHight, identifier]);

  const nodeClickHandler = useCallback(() => {
    if (editingModeNode) return;
    if (!notebookRef.current.choosingNode && notebookRef.current.selectedNode !== identifier) {
      const updatedNodeIds: string[] = [notebookRef.current.selectedNode!, identifier];
      notebookRef.current.selectedNode = identifier;
      nodeBookDispatch({ type: "setSelectedNode", payload: identifier });
      setNodeUpdates({
        nodeIds: updatedNodeIds,
        updatedAt: new Date(),
      });
      if (openSidebar === "PROPOSALS") {
        reloadPermanentGraph();
        notebookRef.current.selectionType = null;
        nodeBookDispatch({ type: "setSelectionType", payload: null });
        setSelectedProposalId("");
      }
    }
  }, [
    editingModeNode,
    notebookRef,
    identifier,
    nodeBookDispatch,
    setNodeUpdates,
    openSidebar,
    reloadPermanentGraph,
    setSelectedProposalId,
  ]);

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

  useEffect(() => {
    if (!user) return;
    if (!editable) return;
    const timeoutId = setTimeout(() => {
      createActionTrack({
        action: "NodeTitleChanged",
        nodeId: identifier,
      });
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [titleCopy]);

  useEffect(() => {
    if (!user) return;
    if (!editable) return;
    const timeoutId = setTimeout(() => {
      createActionTrack({
        action: "NodeContentChanged",
        nodeId: identifier,
      });
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [contentCopy]);

  const hideDescendantsHandler = useCallback(() => onHideDescendants(identifier), [onHideDescendants, identifier]);

  // const open = useMemo(() => {
  //   const idx = notebooks.findIndex(notebook => notebook === selectedNotebook);
  //   return expands[idx];
  // }, [expands, notebooks, selectedNotebook]);

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
    if (imageElementRef.current) {
      setImageHeight(imageElementRef.current.clientHeight);
    }
  }, [setAbleToPropose, titleCopy]);

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
    (chosenType: ChosenType) => selectNode({ chosenType, nodeId: identifier, nodeType }),
    [selectNode, identifier, nodeType]
  );

  const correctNodeHandler = useCallback(
    (event: any) => correctNode(event, identifier, nodeType),
    [correctNode, identifier, nodeType]
  );

  const wrongNodeHandler = useCallback(
    (event: any) =>
      wrongNode(event, identifier, nodeType, markedWrong, markedCorrect, wrongNum, correctNum, locked, tagIds),
    [wrongNode, identifier, nodeType, markedWrong, markedCorrect, wrongNum, correctNum, locked]
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
      setProposeLoading(true);
      // here disable button
      setTimeout(async () => {
        const firstParentId: Parent = parents[0];
        setEditingModeNode(false);

        if (newParent) {
          await saveProposedParentNode(identifier, "", reason, tagIds, () => setAbleToPropose(true));
          setProposeLoading(false);
          return;
        }

        if (isNew) {
          await saveProposedChildNode(identifier, "", reason, () => setAbleToPropose(true));
          if (!firstParentId) return;
          notebookRef.current.selectedNode = firstParentId.node;
          nodeBookDispatch({ type: "setSelectedNode", payload: firstParentId.node });
          setProposeLoading(false);
          return;
        }

        await saveProposedImprovement("", reason, tagIds, () => setAbleToPropose(true));
        setProposeLoading(false);
        notebookRef.current.selectedNode = identifier;
        notebookRef.current.selectedNode = identifier;
        nodeBookDispatch({ type: "setSelectedNode", payload: identifier });
      }, 500);
    },

    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isNew, identifier, reason, saveProposedChildNode, saveProposedImprovement]
  );

  const onCancelProposal = () => {
    reloadPermanentGraph();
    const firstParentId: any = parents[0];
    if (firstParentId) {
      const scrollTo = isNew ? firstParentId.node ?? undefined : identifier;
      if (scrollTo) {
        notebookRef.current.selectedNode = scrollTo;
        notebookRef.current.choosingNode = null;
        notebookRef.current.selectedNode = null;
        notebookRef.current.chosenNode = null;
        nodeBookDispatch({ type: "setSelectedNode", payload: scrollTo });
      }
    }
    nodeBookDispatch({ type: "setChoosingNode", payload: null });
    nodeBookDispatch({ type: "setSelectedNode", payload: null });
    nodeBookDispatch({ type: "setChosenNode", payload: null });
    setOperation("CancelProposals");
    setEditingModeNode(false);
    window.dispatchEvent(new CustomEvent("next-flashcard"));
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

  /**
   * when node is removed, force dagre recalculate because there are not changes on nodes height
   */
  useEffect(() => {
    return () => onForceRecalculateGraph({ id: identifier, by: "remove-nodes" });
  }, [identifier, onForceRecalculateGraph]);

  useEffect(() => {
    if (!editable) {
      if (searchResults.data.length > 0) {
        setSearchResults({ data: [], lastPageLoaded: 0, totalPage: 0, totalResults: 0 });
      }
      if (ableToPropose) {
        setAbleToPropose(false);
      }
    }
    if (editable) {
      setOpenPart("References");
      setReason("");
      cleanEditorLink();
    }
  }, [editable]);

  useEffect(() => {
    if (!editable && !activeNode) {
      setOpenPart(undefined);
    }
  }, [editable, activeNode]);

  const onBlurContent = useCallback(
    (newContent: string) => {
      setNodeParts(identifier, thisNode => ({ ...thisNode, content: newContent }));
    },
    [identifier, setNodeParts]
  );

  const onSearch = useCallback(
    async (page: number, q: string) => {
      try {
        setIsFetching(true);
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
          nodeTypes: [nodeType],
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
        setAbleToPropose(true);
        if (newData.filter(data => data.title === q).length > 0) {
          setAbleToPropose(false);
        }
        setIsFetching(false);
      } catch (err) {
        console.error(err);
      }
    },
    [nodeType]
  );

  const onBlurNodeTitle = useCallback(
    async (newTitle: string) => {
      setNodeParts(identifier, thisNode => ({ ...thisNode, title: newTitle }));
      if (titleUpdated && newTitle.trim().length > 0) {
        nodeBookDispatch({ type: "setSearchByTitleOnly", payload: true });
        notebookRef.current.searchByTitleOnly = true;
        onSearch(1, newTitle.trim());
        setTitleUpdated(false);
      }
      notebookRef.current.nodeTitleBlured = true;
      notebookRef.current.searchQuery = newTitle;

      // setOpenSideBar("SEARCHER_SIDEBAR");
      // nodeBookDispatch({ type: "setNodeTitleBlured", payload: true });
      // nodeBookDispatch({ type: "setSearchQuery", payload: newTitle });
    },
    [identifier, nodeBookDispatch, notebookRef, onSearch, setNodeParts, titleUpdated]
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

  const onMouseOverHandler = () => {
    if (!notebookRef.current.choosingNode) return;
    if (notebookRef.current.choosingNode.id === identifier) return;

    if (notebookRef.current.choosingNode.type === "Reference" && nodeType !== "Reference") {
      setToBeEligible(false);
      return;
    }
    if (notebookRef.current.choosingNode?.type === "Tag") {
      if (isTag) {
        setToBeEligible(true);
      }
    } else {
      setToBeEligible(true);
    }
  };

  const onMouseLeaveHandler = () => {
    if (notebookRef.current.choosingNode && notebookRef.current.choosingNode.id !== identifier) {
      setToBeEligible(false);
    }
  };

  const onChangeChosenNodeHandler = useCallback(() => {
    if (editable) return;
    if (assistantSelectNode) {
      if (notebookRef?.current?.choosingNode?.type) {
        const nodeClickEvent = new CustomEvent("node-selected", {
          detail: {
            id: identifier,
            title,
            content,
            nodeSelectionType: notebookRef?.current?.choosingNode?.type,
          },
        });
        window.dispatchEvent(nodeClickEvent);
      }
      nodeBookDispatch({ type: "setChoosingNode", payload: null });
      notebookRef.current.choosingNode = null;
      nodeBookDispatch({ type: "setChosenNode", payload: null });
      notebookRef.current.chosenNode = null;
      setAssistantSelectNode(false);
      // // assistantSelectNode.current = false;
      return;
    }
    onChangeChosenNode({ nodeId: identifier, title });
  }, [
    assistantSelectNode,
    content,
    editable,
    identifier,
    nodeBookDispatch,
    notebookRef,
    onChangeChosenNode,
    setAssistantSelectNode,
    title,
  ]);

  useEffect(() => {
    setImageLoaded(true);
  }, [nodeImage]);
  const flagLinks = (current: any, added: any, removed: any) => {
    const addedHash: any = {};
    const removedHash: any = {};
    added.forEach((p: { node: string }) => {
      addedHash[p.node] = true;
    });
    removed.forEach((p: { node: string }) => {
      removedHash[p.node] = true;
    });
    for (let element of current) {
      if (addedHash[element.node]) {
        element.added = true;
      } else if (removedHash[element.node]) {
        element.removed = true;
      }
    }
    return current;
  };
  if (hideNode && !editable) {
    return (
      <Box
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
          height: nodeHeight,
          maxHeight: nodeHeight,
          left: left ? left : 1000,
          top: top ? top : 1000,
          width,
          transition: "0.3s",
          padding: "13px 13px 13px 12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* currentScaleThreshold > 0.2 ? 8 / currentScaleThreshold : 8 / 0.2 */}
        {/* <Typography fontSize={`${currentScale > 0.32 ? 16 / currentScale : 16 / 0.32}px`}>{title}</Typography> */}
        <Box
          sx={{
            position: "relative",
            display: "grid",
            placeItems: "center",
            height: "100%",
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            "& > p": {
              margin: 0,
              lineHeight: "1.2em",
              maxHeight: "2.4em",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        >
          {isProposalsSelected && (
            <Box
              dangerouslySetInnerHTML={{ __html: titleCopy }}
              sx={{
                fontSize: "25px",
                fontWeight: 500,
                textAlign: "center",
                textOverflow: "ellipsis",
              }}
            />
          )}
          {!isProposalsSelected && (
            <MarkdownRender
              text={titleCopy}
              sx={{
                fontSize: "60px",
                fontWeight: 500,
                textAlign: "center",
                textOverflow: "ellipsis",
              }}
            />
          )}
          <NodeTypeIcon
            nodeType={nodeType}
            tooltipPlacement="bottom"
            sx={{ fontSize: `${30}px`, position: "absolute", bottom: "4px", left: "4px" }}
          />
        </Box>
      </Box>
    );
  }
  return (
    <Box
      ref={nodeRef}
      id={identifier}
      onClick={nodeClickHandler}
      onMouseEnter={onMouseOverHandler}
      onMouseLeave={onMouseLeaveHandler}
      data-hoverable={true}
      className={
        "Node card" +
        (activeNode ? " active" : "") +
        (changed || !isStudied ? " Changed" : "") +
        (isHiding ? " IsHiding" : "") +
        (toBeEligible ? " Choosable" : " ")
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

      <Box sx={{ float: "right" }}>
        {!editable && !unaccepted && !simulated && (
          <MemoizedNodeHeader
            id={identifier}
            open={open}
            onToggleNode={toggleNodeHandler}
            onHideDescendants={hideDescendantsHandler}
            onHideNodeHandler={hideNodeHandler}
            disabled={disabled}
            enableChildElements={enableChildElements}
          />
        )}
      </Box>
      <Box className="card-content">
        {/* preview edit options */}
        {open && editable && (
          <Box sx={{ display: "flex", justifyContent: "end" }}>
            <Box
              id={`${identifier}-preview-edit`}
              sx={{
                display: "flex",
                alignItems: "center",
                position: "relative",
                top: "-5px",
                borderRadius: "10px",
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
          </Box>
        )}

        {open && (
          <Box id={`${identifier}-node-body`} className="NodeContent">
            <Editor
              id={`${identifier}-node-title`}
              label="Enter the node title:"
              value={titleCopy}
              setValue={onSetTitle}
              onBlurCallback={onBlurNodeTitle}
              readOnly={!editable}
              sxPreview={{ fontSize: "25px", fontWeight: 300 }}
              showEditPreviewSection={false}
              editOption={option}
              disabled={disableTitle}
              proposalsSelected={isProposalsSelected}
              focus={true}
            />
            {editable && (
              <Box sx={{ marginTop: "5px" }}>
                {!isFetching && searchResults.data.length > 0 && (
                  <Accordion
                    sx={{ background: "transparent" }}
                    expanded={showSimilarNodes}
                    onChange={() => setShowSimilarNodes(!showSimilarNodes)}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1d-content"
                      id="panel1d-header"
                      sx={{
                        border: theme => (theme.palette.mode === "dark" ? "solid 1px #404040" : "solid 1px #D0D5DD"),
                        minHeight: "50px!important",
                        height: "50px",
                      }}
                    >
                      <Typography>Similar Nodes</Typography>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{
                        borderWidth: "0px 1px 1px 1px",
                        borderStyle: "solid",
                        borderColor: theme => (theme.palette.mode === "dark" ? "#404040" : "#D0D5DD"),
                      }}
                    >
                      <Typography
                        sx={{
                          color: theme =>
                            theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black,
                          fontSize: "17px",
                          marginY: "5px",
                        }}
                        variant="h4"
                      >
                        Make sure the node title you propose is different from the following:
                      </Typography>
                      <Box
                        className="node-suggestions"
                        sx={{
                          height: "150px",
                          overflowY: "scroll",
                        }}
                      >
                        {searchResults.data.map((resNode, idx) => {
                          return (
                            <Paper
                              elevation={3}
                              key={`resNode${idx}`}
                              onClick={() => {
                                openLinkedNode(resNode.id, "Searcher");
                              }}
                              sx={{
                                listStyle: "none",
                                padding: "10px",
                                borderLeft:
                                  "studied" in resNode && resNode.studied ? "solid 6px #EAAA08" : "solid 6px #FD7373",
                                cursor: "pointer",
                                opacity: "1",
                                borderRadius: "8px",
                                margin: "5px 2px 0px 0px",
                                background: theme => (theme.palette.mode === "dark" ? "#2F2F2F" : "#F2F4F7"),
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                                className="SearchResultTitle"
                              >
                                {/* CHECK: here is causing problems to hide scroll */}
                                <Editor
                                  sxPreview={{
                                    fontSize: {
                                      xs: "14px",
                                      sm: "16px",
                                    },
                                  }}
                                  label=""
                                  readOnly={true}
                                  setValue={() => {}}
                                  value={resNode.title}
                                />
                                <Box
                                  sx={{
                                    width: "25px",
                                    height: "25px",
                                    borderRadius: "50%",
                                    background: theme => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <NodeTypeIcon nodeType={resNode.nodeType} fontSize="inherit" />
                                </Box>
                              </Box>
                            </Paper>
                          );
                        })}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}

                {isFetching && (
                  <Box sx={{ marginTop: "20px", textAlign: "center" }}>
                    <CircularProgress />
                  </Box>
                )}
              </Box>
            )}

            <Box sx={{ mt: editable ? "12px" : undefined }} id={`${identifier}-node-content`}>
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
                proposalsSelected={isProposalsSelected}
              />
              {editable && <Box sx={{ mb: "12px" }}></Box>}

              <Box id={`${identifier}-node-content-media`}>
                {nodeImage && (
                  <Box sx={{ position: "relative", minHeight: imageHeight, p: "5px", pb: "15px" }}>
                    {/* TODO: change to Next Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}

                    {editable && (
                      <Tooltip title={"Remove Image"} placement="top">
                        <CloseIcon
                          className="close-icon"
                          sx={{
                            backgroundColor: "grey",
                            color: "black",
                            borderRadius: "50%",
                            cursor: "pointer",
                            ":hover": {
                              backgroundColor: "black",
                              color: "white",
                            },
                            zIndex: 10,
                            position: "absolute",
                            top: "0px",
                            right: "0px",
                            padding: "5px",
                          }}
                          onClick={removeImageHandler}
                        />
                      </Tooltip>
                    )}
                    <img
                      ref={imageElementRef}
                      src={nodeImage}
                      alt="Node image"
                      className="responsive-img NodeImage"
                      onLoad={onImageLoad}
                      onClick={onImageClick}
                      style={{
                        borderRadius: "11px",
                        cursor: "pointer",
                      }}
                    />
                    {/* TODO: add loading background */}
                  </Box>
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
              </Box>
            </Box>

            {editable && (
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
                showEditPreviewSection={false}
                editOption={option}
                disabled={disableWhy}
              />
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
                  <Box sx={{ width: "49.5%" }}>
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

                  <Box sx={{ width: "49.5%" }}>
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
          </Box>
        )}

        {open && user && (
          <MemoizedNodeFooter
            open={true}
            addVideo={addVideo}
            setAddVideo={setAddVideo}
            identifier={identifier}
            notebookRef={notebookRef}
            nodeBookDispatch={nodeBookDispatch}
            // activeNode={activeNode}
            // citationsSelected={citationsSelected}
            proposalsSelected={isProposalsSelected}
            // acceptedProposalsSelected={acceptedProposalsSelected}
            // commentsSelected={commentsSelected}
            editable={editable}
            setNodeParts={setNodeParts}
            title={title}
            content={content}
            unaccepted={unaccepted}
            openPart={openPart}
            nodeType={nodeType}
            isNew={isNew}
            isTag={isTag}
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
            removedTags={removedTags}
            addedTags={addedTags}
            addedReferences={addedReferences}
            removedReferences={removedReferences}
            addedParents={addedParents}
            removedParents={removedParents}
            addedChildren={addedChildren}
            removedChildren={removedChildren}
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
            reloadPermanentGraph={reloadPermanentGraph}
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
            disabled={disabled}
            enableChildElements={enableChildElements}
            setAbleToPropose={setAbleToPropose}
            choosingNode={notebookRef.current.choosingNode}
            onChangeChosenNode={onChangeChosenNodeHandler}
            findDescendantNodes={findDescendantNodes}
            findAncestorNodes={findAncestorNodes}
            onlineUsers={onlineUsers}
          />
        )}

        {open && (openPart === "LinkingWords" || openPart === "Tags" || openPart === "References") && (
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
            parents={flagLinks(parents, addedParents, removedParents)}
            nodesChildren={flagLinks(nodesChildren, addedChildren, removedChildren)}
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

        {open && editable && (
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
              <LoadingButton
                id={`${identifier}-button-propose-proposal`}
                color="success"
                variant="contained"
                className="btn waves-effect waves-light hoverable green"
                onClick={proposalSubmit}
                disabled={(!ableToPropose ?? false) || disableProposeButton}
                sx={{
                  padding: "6px",
                }}
                loading={proposeLoading}
              >
                Propose
              </LoadingButton>
            </Box>
          </>
        )}

        {!open && (
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
        )}

        {!open && user && (
          <Box className="footer">
            <MemoizedNodeFooter
              open={false}
              addVideo={addVideo}
              setAddVideo={setAddVideo}
              identifier={identifier}
              notebookRef={notebookRef}
              nodeBookDispatch={nodeBookDispatch}
              // activeNode={activeNode}
              // citationsSelected={citationsSelected}
              proposalsSelected={isProposalsSelected}
              // acceptedProposalsSelected={acceptedProposalsSelected}
              // commentsSelected={commentsSelected}
              editable={editable}
              setNodeParts={setNodeParts}
              title={title}
              content={content}
              unaccepted={unaccepted}
              openPart={openPart}
              nodeType={nodeType}
              isTag={isTag}
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
              removedTags={removedTags}
              addedTags={addedTags}
              addedReferences={addedReferences}
              removedReferences={removedReferences}
              addedParents={addedParents}
              removedParents={removedParents}
              addedChildren={addedChildren}
              removedChildren={removedChildren}
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
              reloadPermanentGraph={reloadPermanentGraph}
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
              disabled={disabled}
              setAbleToPropose={setAbleToPropose}
              choosingNode={notebookRef.current.choosingNode}
              onChangeChosenNode={onChangeChosenNodeHandler}
              findDescendantNodes={findDescendantNodes}
              findAncestorNodes={findAncestorNodes}
              onlineUsers={onlineUsers}
            />
          </Box>
        )}
      </Box>
      {!isNew && nodeType !== "Reference" && editable && user && displayParentOptions && (
        <Box
          id={`${identifier}-new-parent-nodes-buttons`}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            position: "absolute",
            top: (parseFloat(String(document.getElementById(identifier)?.clientHeight)) - 396) * 0.5 + "px",
            animation: `${childNodeButtonsAnimation} 1s backwards`,
            borderRadius: "25px",
            right: "590px",
          }}
        >
          {(Object.keys(proposedChildTypesIcons) as ProposedChildTypesIcons[]).map(
            (parentNodeType: ProposedChildTypesIcons, index: number) => {
              return (
                <Tooltip title={`Propose a ${parentNodeType} parent`} placement="left" key={index}>
                  <Fab
                    id={`${identifier}-propose-${parentNodeType.toLowerCase()}-parent`}
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
                      return openProposalType !== "ProposeNew" + parentNodeType + "ParentNode"
                        ? proposeNewParent(event, parentNodeType, false, setOpenProposalType)
                        : undefined;
                    }}
                  >
                    <>
                      {proposedChildTypesIcons[parentNodeType] === "local_library" && (
                        <LocalLibraryIcon sx={{ color: "white!important" }} />
                      )}
                      {proposedChildTypesIcons[parentNodeType] === "help_outline" && (
                        <HelpOutlineIcon sx={{ color: "#fff" }} />
                      )}
                      {proposedChildTypesIcons[parentNodeType] === "code" && <CodeIcon sx={{ color: "#fff" }} />}
                      {proposedChildTypesIcons[parentNodeType] === "share" && <ShareIcon sx={{ color: "#fff" }} />}
                      {proposedChildTypesIcons[parentNodeType] === "menu_book" && (
                        <MenuBookIcon sx={{ color: "#fff" }} />
                      )}
                      {proposedChildTypesIcons[parentNodeType] === "emoji_objects" && (
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
      {!isNew && nodeType !== "Reference" && editable && (
        <Box
          id={`${identifier}-new-children-nodes-buttons`}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            position: "absolute",
            top: (parseFloat(String(document.getElementById(identifier)?.clientHeight)) - 396) * 0.5 + "px",
            animation: `${childNodeButtonsAnimation} 1s forwards`,
            borderRadius: "25px",
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
                      return openProposalType !== "ProposeNew" + childNodeType + "ChildNode"
                        ? proposeNewChild(event, childNodeType, setOpenProposalType)
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
    </Box>
  );
};

export const MemoizedNode = React.memo(Node, (prev, next) => {
  const basicChanges =
    prev.top === next.top &&
    prev.left === next.left &&
    prev.activeNode === next.activeNode &&
    prev.isProposalsSelected === next.isProposalsSelected &&
    prev.isAcceptedProposalSelected === next.isAcceptedProposalSelected &&
    // prev.commentsSelected === next.commentsSelected &&
    prev.unaccepted === next.unaccepted &&
    prev.simulated === next.simulated &&
    prev.disableVotes === next.disableVotes &&
    prev.openPart === next.openPart &&
    prev.openSidebar === next.openSidebar &&
    prev.hideNode === next.hideNode &&
    (!next.activeNode || prev.ableToPropose === next.ableToPropose);
  if (
    !basicChanges ||
    (prev.nodeUpdates.updatedAt !== next.nodeUpdates.updatedAt && prev.nodeUpdates.nodeIds.includes(prev.identifier)) ||
    (prev.nodeUpdates.updatedAt !== next.nodeUpdates.updatedAt && next.nodeUpdates.nodeIds.includes(next.identifier))
  ) {
    return false;
  }

  return true;
});
