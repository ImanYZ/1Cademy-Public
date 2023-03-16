import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CloseIcon from "@mui/icons-material/Close";
import CodeIcon from "@mui/icons-material/Code";
import HelpIcon from "@mui/icons-material/Help";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { Masonry } from "@mui/lab";
import {
  Button,
  CircularProgress,
  Container,
  Divider,
  Drawer,
  IconButton,
  Modal,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  Query,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import Image from "next/image";
import NextImage from "next/image";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
/* eslint-disable */ //This wrapper comments it to use react-map-interaction without types
// @ts-ignore
import { MapInteractionCSS } from "react-map-interaction";
import { INodeType } from "src/types/INodeType";
/* eslint-enable */
import { INotificationNum } from "src/types/INotification";

import withAuthUser from "@/components/hoc/withAuthUser";
import { MemoizedCommunityLeaderboard } from "@/components/map/CommunityLeaderboard/CommunityLeaderboard";
import { MemoizedFocusedNotebook } from "@/components/map/FocusedNotebook/FocusedNotebook";
import { MemoizedLivelinessBar } from "@/components/map/Liveliness/LivelinessBar";
import { MemoizedReputationlinessBar } from "@/components/map/Liveliness/ReputationBar";
import { MemoizedBookmarksSidebar } from "@/components/map/Sidebar/SidebarV2/BookmarksSidebar";
import { CitationsSidebar } from "@/components/map/Sidebar/SidebarV2/CitationsSidebar";
import { MemoizedNotificationSidebar } from "@/components/map/Sidebar/SidebarV2/NotificationSidebar";
import { MemoizedPendingProposalSidebar } from "@/components/map/Sidebar/SidebarV2/PendingProposalSidebar";
import { MemoizedProposalsSidebar } from "@/components/map/Sidebar/SidebarV2/ProposalsSidebar";
import { MemoizedSearcherSidebar } from "@/components/map/Sidebar/SidebarV2/SearcherSidebar";
import { MemoizedUserInfoSidebar } from "@/components/map/Sidebar/SidebarV2/UserInfoSidebar";
import { MemoizedUserSettingsSidebar } from "@/components/map/Sidebar/SidebarV2/UserSettigsSidebar";
import { useAuth } from "@/context/AuthContext";
import { useTagsTreeView } from "@/hooks/useTagsTreeView";
import { addSuffixToUrlGMT } from "@/lib/utils/string.utils";
import {
  RECONCILING_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
  RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
} from "@/lib/utils/tutorials/reconcilingProposalsTutorialSteps";

import LoadingImg from "../../public/animated-icon-1cademy.gif";
import focusViewLogo from "../../public/focus.svg";
import focusViewDarkLogo from "../../public/focus-dark.svg";
import { TooltipTutorial } from "../components/interactiveTutorial/Tutorial";
import { MemoizedClustersList } from "../components/map/ClustersList";
import { MemoizedLinksList } from "../components/map/LinksList";
import { MemoizedNodeList } from "../components/map/NodesList";
import { MemoizedToolbarSidebar } from "../components/map/Sidebar/SidebarV2/ToolbarSidebar";
import { NodeItemDashboard } from "../components/NodeItemDashboard";
import { Portal } from "../components/Portal";
import { MemoizedTutorialTableOfContent } from "../components/tutorial/TutorialTableOfContent";
import { NodeBookProvider, useNodeBook } from "../context/NodeBookContext";
import {
  getTutorialStep,
  removeStyleFromTarget,
  TargetClientRect,
  useInteractiveTutorial,
} from "../hooks/useInteractiveTutorial3";
import { useMemoizedCallback } from "../hooks/useMemoizedCallback";
import { useWindowSize } from "../hooks/useWindowSize";
import { useWorkerQueue } from "../hooks/useWorkerQueue";
import { NodeChanges, ReputationSignal } from "../knowledgeTypes";
import { idToken, retrieveAuthenticatedUser } from "../lib/firestoreClient/auth";
import { Post, postWithToken } from "../lib/mapApi";
import { createGraph, dagreUtils } from "../lib/utils/dagre.util";
import { devLog } from "../lib/utils/develop.util";
import { getTypedCollections } from "../lib/utils/getTypedCollections";
import {
  changedNodes,
  citations,
  COLUMN_GAP,
  compareAndUpdateNodeLinks,
  compareChoices,
  compareFlatLinks,
  compareLinks,
  compareProperty,
  copyNode,
  createActionTrack,
  generateReputationSignal,
  getSelectionText,
  hideNodeAndItsLinks,
  NODE_WIDTH,
  removeDagAllEdges,
  removeDagEdge,
  removeDagNode,
  setDagEdge,
  setDagNode,
  setNewParentChildrenEdges,
  tempNodes,
} from "../lib/utils/Map.utils";
import { newId } from "../lib/utils/newid";
import {
  buildFullNodes,
  fillDagre,
  getNodes,
  getUserNodeChanges,
  mergeAllNodes,
} from "../lib/utils/nodesSyncronization.utils";
import {
  CHILD_CODE_PROPOSAL_COMPLETE,
  CHILD_CONCEPT_PROPOSAL_COMPLETE,
  CHILD_IDEA_PROPOSAL_COMPLETE,
  CHILD_PROPOSAL_COMPLETE,
  CHILD_QUESTION_PROPOSAL_COMPLETE,
  CHILD_REFERENCE_PROPOSAL_COMPLETE,
  CHILD_RELATION_PROPOSAL_COMPLETE,
} from "../lib/utils/tutorials/childrenProposalTutorialStep";
import { NAVIGATION_STEPS_COMPLETE } from "../lib/utils/tutorials/navigationTutorialSteps";
import { NODE_CODE } from "../lib/utils/tutorials/nodeCodeTutorialSteps";
import { NODE_IDEA } from "../lib/utils/tutorials/nodeIdeaTutorialSteps";
import { NODE_QUESTION } from "../lib/utils/tutorials/nodeQuestionStepTutorialStep";
import { NODE_REFERENCE } from "../lib/utils/tutorials/nodeReferenceTutorialSteps";
import { NODE_RELATION } from "../lib/utils/tutorials/nodeRelationTutorialSteps";
import { NODES_STEPS_COMPLETE } from "../lib/utils/tutorials/nodeTutorialSteps";
import { PROPOSING_CODE_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalCodeTutorialStep";
import { PROPOSING_CONCEPT_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalConceptTutorialStep";
import { PROPOSING_IDEA_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalIdeaTutorialSteps";
import { PROPOSING_QUESTION_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalQuestionTutorialSteps";
import { PROPOSING_REFERENCE_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalReferenceTutorialSteps";
import { PROPOSING_RELATION_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalRelationTutorialSteps";
import { PROPOSAL_STEPS_COMPLETE } from "../lib/utils/tutorials/proposalTutorialSteps";
import { SEARCHER_STEPS_COMPLETE } from "../lib/utils/tutorials/searcherTutorialSteps";
import { gtmEvent, imageLoaded, isValidHttpUrl } from "../lib/utils/utils";
import {
  ChoosingType,
  EdgesData,
  FullNodeData,
  FullNodesData,
  // NodeTutorialState,
  TNodeBookState,
  TNodeUpdates,
  TutorialTypeKeys,
  // TutorialType,
  UserNodes,
  UserNodesData,
  UserTutorial,
  UserTutorials,
} from "../nodeBookTypes";
import { NodeType, SimpleNode2 } from "../types";
import { doNeedToDeleteNode, getNodeTypesFromNode, isVersionApproved } from "../utils/helpers";

// export type TutorialKeys = TutorialTypeKeys | null;

type DashboardProps = {};

export type OpenSidebar =
  | "SEARCHER_SIDEBAR"
  | "NOTIFICATION_SIDEBAR"
  | "PENDING_PROPOSALS"
  | "BOOKMARKS_SIDEBAR"
  | "USER_INFO"
  | "PROPOSALS"
  | "USER_SETTINGS"
  | "CITATIONS"
  | null;

type Graph = { nodes: FullNodesData; edges: EdgesData };
/**
 * 1. NODES CHANGES - LISTENER with SNAPSHOT
 *      Type: useEffect
 *     - Get UserNodesData (userNodeChanges)
 *     - Get NodeData for every userNode
 *     - Build Full Nodes (Merge nodeData and userNodeData)
 *     - SYNCHRONIZATION: merge FullNodes into Nodes
 *         Type: useEffect
 *         Description:
 *
 *  --- render nodes, every node when its heigh is changed will add task
 *
 *  4. WORKER QUEUE: will add tasks to a queue
 *     - is working: add task to the queue
 *     - is NOT working: will merge all tasks from queue and execute in one
 *
 *  3. WORKER: (n)
 *      Type: useEffect
 *      Flag: mapChanged
 *      Description: will calculate the [nodes] and [edges] positions
 *
 *  --- render nodes
 */
let arrowKeyMapTransitionInitialized = false;
const Dashboard = ({}: DashboardProps) => {
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // GLOBAL STATES
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  const { nodeBookState, nodeBookDispatch } = useNodeBook();
  const [{ user, reputation, settings }, { dispatch }] = useAuth();
  const { allTags, allTagsLoaded } = useTagsTreeView();
  const db = getFirestore();
  const theme = useTheme();

  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // LOCAL STATES
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  // used for triggering useEffect after nodes or usernodes change
  const [userNodeChanges /*setUserNodeChanges*/] = useState<UserNodes[]>([]);
  const [nodeChanges /*setNodeChanges*/] = useState<NodeChanges[]>([]);
  // nodes: dictionary of all nodes visible on map for specific user
  // edges: dictionary of all edges visible on map for specific user
  const [graph, setGraph] = useState<Graph>({ nodes: {}, edges: {} });
  const [nodeUpdates, setNodeUpdates] = useState<TNodeUpdates>({
    nodeIds: [],
    updatedAt: new Date(),
  });
  // this allNodes is DEPRECATED
  const [allNodes, setAllNodes] = useState<FullNodesData>({});
  // as map grows, width and height grows based on the nodes shown on the map
  const [mapWidth, setMapWidth] = useState(700);
  const [mapHeight, setMapHeight] = useState(400);
  const [reputationSignal, setReputationSignal] = useState<ReputationSignal[]>([]);
  // mapRendered: flag for first time map is rendered (set to true after first time)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mapRendered, setMapRendered] = useState(false);

  const notebookRef = useRef<TNodeBookState>({
    sNode: null,
    isSubmitting: false,
    choosingNode: null,
    chosenNode: null,
    initialProposal: null,
    selectedNode: null,
    selectionType: null,
    selectedTags: [],
    openToolbar: false,
    selectedUser: null,
    searchQuery: "",
    searchByTitleOnly: false,
    nodeTitleBlured: false,
    openEditButton: false,
    nodeId: null,
    isMenuOpen: false,
    lastOperation: "CancelProposals",
    contributorsNodeId: null,
    showContributors: false,
  });

  // scale and translation of the viewport over the map for the map interactions module
  const [mapInteractionValue, setMapInteractionValue] = useState({
    scale: 1,
    translation: { x: 0, y: 0 },
  });

  const [openSidebar, setOpenSidebar] = useState<OpenSidebar>(null);

  // object of cluster boundaries
  const [clusterNodes, setClusterNodes] = useState({});

  // flag for when scrollToNode is called
  const scrollToNodeInitialized = useRef(false);

  // link that is currently selected
  const [selectedRelation, setSelectedRelation] = useState<string | null>(null);

  // node type that is currently selected
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType | null>(null);

  // selectedUser is the user whose profile is in sidebar (such as through clicking a user icon through leader board or on nodes)
  const [selectedUser, setSelectedUser] = useState(null);

  // proposal id of open proposal (proposal whose content and changes reflected on the map are shown)
  const [openProposal, setOpenProposal] = useState<string>("");

  // when proposing improvements, lists of added/removed parent/child links
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updatedLinks, setUpdatedLinks] = useState<{
    addedParents: string[];
    addedChildren: string[];
    removedParents: string[];
    removedChildren: string[];
  }>({
    addedParents: [],
    addedChildren: [],
    removedParents: [],
    removedChildren: [],
  });
  // const [addedParents, setAddedParents] = useState<string[]>([]);
  // const [addedChildren, setAddedChildren] = useState<string[]>([]);
  // const [removedParents, setRemovedParents] = useState<string[]>([]);
  // const [removedChildren, setRemovedChildren] = useState<string[]>([]);

  const tutorialStateWasSetUpRef = useRef(false);
  // const forcedTutorial = useRef<TutorialTypeKeys | null>(null);
  const [forcedTutorial, setForcedTutorial] = useState<TutorialTypeKeys | null>(null);
  const [firstLoading, setFirstLoading] = useState(true);
  const [pendingProposalsLoaded /* , setPendingProposalsLoaded */] = useState(true);

  const previousLengthNodes = useRef(0);
  const previousLengthEdges = useRef(0);
  const g = useRef(dagreUtils.createGraph());

  const [targetClientRect, setTargetClientRect] = useState<TargetClientRect>({ width: 0, height: 0, top: 0, left: 0 });

  //Notifications
  const [uncheckedNotificationsNum, setUncheckedNotificationsNum] = useState(0);
  const [bookmarkUpdatesNum, setBookmarkUpdatesNum] = useState(0);
  const [pendingProposalsNum, setPendingProposalsNum] = useState(0);

  const lastNodeOperation = useRef<string>("");
  const proposalTimer = useRef<any>(null);

  const [openProgressBar, setOpenProgressBar] = useState(false);
  const [, /* openProgressBarMenu */ setOpenProgressBarMenu] = useState(false);

  // Scroll to node configs

  const { width: windowWith, height: windowHeight } = useWindowSize();
  const windowInnerTop = windowWith < 899 ? 360 : 50;
  const windowInnerLeft = (windowWith * 10) / 100 + (windowWith > 899 ? (openSidebar ? 430 : 80) : 10);
  const windowInnerRight = (windowWith * 10) / 100;
  const windowInnerBottom = 50;
  const [showRegion, setShowRegion] = useState<boolean>(false);
  const [innerHeight, setInnerHeight] = useState<number>(0);
  const [focusView, setFocusView] = useState<{
    selectedNode: string;
    isEnabled: boolean;
  }>({
    selectedNode: "",
    isEnabled: false,
  });

  const {
    startTutorial,
    tutorial,
    setTutorial,
    currentStep,
    onNextStep,
    onPreviousStep,
    isPlayingTheTutorialRef,
    setTargetId,
    targetId,
    userTutorialLoaded,
    setUserTutorial,
    userTutorial,
  } = useInteractiveTutorial({ user });
  const onNodeInViewport = useCallback(
    (nodeId: string) => {
      const originalNode = document.getElementById(nodeId);
      if (!originalNode) {
        return false;
      }
      var bounding = originalNode.getBoundingClientRect();

      const nodeLeft = bounding.left;
      const nodeRight = bounding.right;
      const nodeBottom = bounding.bottom;
      const nodeTop = bounding.top;
      const nodeCenterX = bounding.left + bounding.width / 2;
      const nodeCenterY = bounding.top + bounding.height / 2;

      const BL =
        nodeLeft >= windowInnerLeft &&
        nodeLeft <= windowWith - windowInnerRight &&
        nodeBottom >= windowInnerTop &&
        nodeBottom <= windowHeight - windowInnerBottom;
      const BR =
        nodeRight >= windowInnerLeft &&
        nodeRight <= windowWith - windowInnerRight &&
        nodeBottom >= windowInnerTop &&
        nodeBottom <= windowHeight - windowInnerBottom;
      const TL =
        nodeLeft >= windowInnerLeft &&
        nodeLeft <= windowWith - windowInnerRight &&
        nodeTop >= windowInnerTop &&
        nodeTop <= windowHeight - windowInnerBottom;
      const TR =
        nodeRight >= windowInnerLeft &&
        nodeRight <= windowWith - windowInnerRight &&
        nodeTop >= windowInnerTop &&
        nodeTop <= windowHeight - windowInnerBottom;
      const Inside =
        nodeCenterX >= windowInnerLeft &&
        nodeCenterX <= windowWith - windowInnerRight &&
        nodeCenterY >= windowInnerTop &&
        nodeCenterY <= windowHeight - windowInnerBottom;

      const isInViewport = BL || BR || TL || TR || Inside;

      return isInViewport;
    },
    [windowHeight, windowInnerLeft, windowInnerRight, windowInnerTop, windowWith]
  );

  useEffect(() => {
    setInnerHeight(window.innerHeight);
  }, [user?.uname]);

  const scrollToNode = useCallback(
    (nodeId: string, tries = 0) => {
      devLog("scroll To Node", { nodeId, tries });
      if (tries === 10) return;

      if (!scrollToNodeInitialized.current) {
        setTimeout(() => {
          const originalNode = document.getElementById(nodeId);
          if (!originalNode) {
            return;
          }
          const isSearcher = ["Searcher"].includes(lastNodeOperation.current);
          if (isSearcher) {
            lastNodeOperation.current = "";
          }

          if (!isPlayingTheTutorialRef.current && onNodeInViewport(nodeId) && !isSearcher) return;

          if (
            originalNode &&
            "offsetLeft" in originalNode &&
            originalNode.offsetLeft !== 0 &&
            "offsetTop" in originalNode &&
            originalNode.offsetTop !== 0
          ) {
            scrollToNodeInitialized.current = true;
            setTimeout(() => {
              scrollToNodeInitialized.current = false;
            }, 1300);

            setMapInteractionValue(() => {
              const windowSize = window.innerWidth;
              let defaultScale;
              if (windowSize < 400) {
                defaultScale = 0.45;
              } else if (windowSize < 600) {
                defaultScale = 0.575;
              } else if (windowSize < 1260) {
                defaultScale = 0.8;
              } else {
                defaultScale = 0.92;
              }

              return {
                scale: defaultScale,
                translation: {
                  x: (window.innerWidth / 2.6 - originalNode.offsetLeft) * defaultScale,
                  y: (window.innerHeight / 3.4 - originalNode.offsetTop) * defaultScale,
                },
              };
            });
          } else {
            scrollToNode(nodeId, tries + 1);
          }
        }, 400);
      }
    },
    [isPlayingTheTutorialRef, onNodeInViewport]
  );

  useEffect(() => {
    let timeoutId: any;
    const getTooltipClientRect = () => {
      if (!currentStep) return setTargetClientRect({ width: 0, height: 0, top: 0, left: 0 });

      devLog("GET_TOOLTIP_CLIENT_RECT", { currentStep, targetId });

      if (currentStep.anchor) {
        timeoutId = setTimeout(() => {
          if (!currentStep.childTargetId) return;

          const targetElement = document.getElementById(currentStep.childTargetId);
          if (!targetElement) return;

          targetElement.classList.add(currentStep.largeTarget ? "tutorial-target-large" : "tutorial-target");
          const { width, height, top, left } = targetElement.getBoundingClientRect();

          setTargetClientRect({ width, height, top, left });
        }, currentStep.targetDelay);

        return;
      }

      // console.log(22);
      if (!targetId) return;

      // console.log(23);
      const thisNode = graph.nodes[targetId];
      if (!thisNode) return;

      // console.log(24);
      let { top, left, width = NODE_WIDTH, height = 0 } = thisNode;
      let offsetChildTop = 0;
      let offsetChildLeft = 0;

      if (currentStep.childTargetId) {
        const targetElement = document.getElementById(`${targetId}-${currentStep.childTargetId}`);
        if (!targetElement) return;

        targetElement.classList.add(currentStep.largeTarget ? "tutorial-target-large" : "tutorial-target");

        const { offsetTop, offsetLeft } = targetElement;
        const { height: childrenHeight, width: childrenWidth } = targetElement.getBoundingClientRect();

        offsetChildTop = offsetTop;
        offsetChildLeft = offsetLeft;
        height = childrenHeight;
        width = childrenWidth;
      }

      setTargetClientRect({
        top: top + offsetChildTop,
        left: left + offsetChildLeft,
        width,
        height,
      });
    };
    getTooltipClientRect();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentStep, graph.nodes, setTargetClientRect, nodeBookState.selectedNode, targetId]);

  const onCompleteWorker = useCallback(() => {
    if (!nodeBookState.selectedNode) return;

    scrollToNode(nodeBookState.selectedNode);
  }, [nodeBookState.selectedNode, scrollToNode]);

  const setOperation = useCallback((operation: string) => {
    lastNodeOperation.current = operation;
  }, []);

  const { addTask, isQueueWorking, queueFinished } = useWorkerQueue({
    setNodeUpdates,
    g,
    graph,
    setGraph,
    setMapWidth,
    setMapHeight,
    mapWidth,
    mapHeight,
    allTags,
    onComplete: onCompleteWorker,
    setClusterNodes,
    withClusters: settings.showClusterOptions,
  });

  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // FLAGS
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  const [openDeveloperMenu, setOpenDeveloperMenu] = useState(false);
  // flag for whether cursor is not on text
  // for determining whether the map should move if the user clicks and drags
  const [mapHovered, setMapHovered] = useState(false);

  // flag for whether all tags data is downloaded from server
  // const [allTagsLoaded, setAllTagsLoaded] = useState(false);

  // // flag for whether tutorial state was loaded
  // const [userTutorialLoaded, setUserTutorialLoaded] = useState(false);

  // flag for whether users' nodes data is downloaded from server
  const [, /* userNodesLoaded */ setUserNodesLoaded] = useState(false);

  // flag set to true when sending request to server
  const [isSubmitting, setIsSubmitting] = useState(false);

  // flag to open proposal sidebar
  // const [openProposals, setOpenProposals] = useState(false);

  // flag for if pending proposals for a selected node is open
  const [openPendingProposals, setOpenPendingProposals] = useState(false);

  // flag for if chat is open
  const [openChat, setOpenChat] = useState(false);

  // flag for if notifications is open
  const [openNotifications, setOpenNotifications] = useState(false);

  // flag for if presentations is open
  const [openPresentations, setOpenPresentations] = useState(false);

  // // flag for is search is open
  // const [openToolbar, setOpenToolbar] = useState(false);

  // flag for is search is open
  const [openSearch, setOpenSearch] = useState(false);

  // flag for whether bookmarks is open
  const [openBookmarks, setOpenBookmarks] = useState(false);

  // flag for whether recentNodes is open
  const [openRecentNodes, setOpenRecentNodes] = useState(false);

  // flag for whether trends is open
  const [openTrends, setOpenTrends] = useState(false);

  // flag for whether media is full-screen
  const [openMedia, setOpenMedia] = useState<string | boolean>(false);

  const [firstScrollToNode, setFirstScrollToNode] = useState(false);

  const [, /* showNoNodesFoundMessage */ setNoNodesFoundMessage] = useState(false);
  const [notebookChanged, setNotebookChanges] = useState({ updated: true });

  const [usersOnlineStatusLoaded, setUsersOnlineStatusLoaded] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // FUNCTIONS
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  const [urlNodeProcess, setUrlNodeProcess] = useState(false);

  /**
   * get Node data
   * iterate over children and update updatedAt field
   * iterate over parents and update updatedAt field
   * get userNode data
   *  - if exist: update visible and updatedAt field
   *  - else: create
   * build fullNode then call makeNodeVisibleInItsLinks and createOrUpdateNode
   * scroll
   * update selectedNode
   */
  const sidebarWidth = () => {
    let width: number = 0;
    if (openSidebar) {
      if (windowWith >= theme.breakpoints.values.md) {
        width = 480;
      } else if (windowWith >= theme.breakpoints.values.sm) {
        width = 320;
      } else {
        width = windowWith;
      }
    }
    return width;
  };
  const openNodeHandler = useMemoizedCallback(
    async (nodeId: string, openWithDefaultValues: Partial<UserNodesData> = {}) => {
      devLog("OPEN_NODE_HANDLER", { nodeId, openWithDefaultValues });

      let linkedNodeRef;
      let userNodeRef = null;
      let userNodeData: UserNodesData | null = null;

      const nodeRef = doc(db, "nodes", nodeId);
      const nodeDoc = await getDoc(nodeRef);
      const batch = writeBatch(db);
      if (nodeDoc.exists() && user) {
        const thisNode: any = { ...nodeDoc.data(), id: nodeId };

        try {
          for (let child of thisNode.children) {
            linkedNodeRef = doc(db, "nodes", child.node);
            batch.update(linkedNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
          }
          for (let parent of thisNode.parents) {
            linkedNodeRef = doc(db, "nodes", parent.node);
            batch.update(linkedNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
          }
          const userNodesRef = collection(db, "userNodes");
          const q = query(userNodesRef, where("node", "==", nodeId), where("user", "==", user.uname), limit(1));
          const userNodeDoc = await getDocs(q);
          let userNodeId = null;
          if (userNodeDoc.docs.length > 0) {
            // if exist documents update the first
            userNodeId = userNodeDoc.docs[0].id;
            const userNodeRef = doc(db, "userNodes", userNodeId);
            const userNodeDataTmp = userNodeDoc.docs[0].data() as UserNodesData;
            userNodeData = {
              ...userNodeDataTmp,
              ...openWithDefaultValues,
            };
            userNodeData.visible = true;
            userNodeData.updatedAt = Timestamp.fromDate(new Date());
            batch.update(userNodeRef, userNodeData);
          } else {
            // if NOT exist documents create a document
            userNodeRef = collection(db, "userNodes");

            userNodeData = {
              ...openWithDefaultValues,
              changed: true,
              correct: false,
              createdAt: Timestamp.fromDate(new Date()),
              updatedAt: Timestamp.fromDate(new Date()),
              deleted: false,
              isStudied: false,
              bookmarked: false,
              node: nodeId,
              open: true,
              user: user.uname,
              visible: true,
              wrong: false,
            };
            batch.set(doc(userNodeRef), userNodeData);
          }
          batch.update(nodeRef, {
            viewers: thisNode.viewers + 1,
            updatedAt: Timestamp.fromDate(new Date()),
          });
          const userNodeLogRef = collection(db, "userNodesLog");

          const userNodeLogData = {
            ...userNodeData,
            createdAt: Timestamp.fromDate(new Date()),
          };

          batch.set(doc(userNodeLogRef), userNodeLogData);
          await batch.commit();

          notebookRef.current.selectedNode = nodeId; // CHECK: THIS DOESN'T GUARANTY CORRECT SELECTED NODE, WE NEED TO DETECT WHEN GRAPH UPDATE HIS VALUES
          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId }); // CHECK: SAME FOR THIS
          /* setTimeout(() => {
            scrollToNode(nodeId);
          }, 2000); */
        } catch (err) {
          console.error(err);
        }
      }
    },
    [user, allTags]
  );

  const setNodeParts = useCallback((nodeId: string, innerFunc: (thisNode: FullNodeData) => FullNodeData) => {
    setGraph(({ nodes: oldNodes, edges }) => {
      setSelectedNodeType(oldNodes[nodeId].nodeType);
      const thisNode = { ...oldNodes[nodeId] };
      const newNode = { ...oldNodes, [nodeId]: innerFunc(thisNode) };
      return { nodes: newNode, edges };
    });
    setNodeUpdates({
      nodeIds: [nodeId],
      updatedAt: new Date(),
    });
  }, []);

  //Getting the node from the Url to open and scroll to that node in the first render
  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let noodeIdFromDashboard = urlParams.get("nodeId");
    if (!noodeIdFromDashboard) return setUrlNodeProcess(true);
    if (!firstScrollToNode) {
      const selectedNodeGraph = graph.nodes[noodeIdFromDashboard];
      if (!selectedNodeGraph) openNodeHandler(noodeIdFromDashboard);
    }
    setTimeout(() => {
      if (!noodeIdFromDashboard) return;
      const selectedNodeDash = graph.nodes[noodeIdFromDashboard];
      if (selectedNodeDash?.top === 0) return;
      if (selectedNodeDash) return;
      notebookRef.current.selectedNode = noodeIdFromDashboard;
      nodeBookDispatch({ type: "setSelectedNode", payload: noodeIdFromDashboard });
      scrollToNode(noodeIdFromDashboard);
    }, 1000);
  }, [firstScrollToNode, graph.nodes, nodeBookDispatch, openNodeHandler, scrollToNode]);

  // useEffect(() => {
  //   // fetch user tutorial state first time

  //   if (!user) return;
  //   if (userTutorialLoaded) return;

  //   devLog("USE_EFFECT: FETCH_USER_TUTORIAL", { userTutorialLoaded, user });
  //   const getTutorialState = async () => {
  //     const tutorialRef = doc(db, "userTutorial", user.uname);
  //     const tutorialDoc = await getDoc(tutorialRef);

  //     if (tutorialDoc.exists()) {
  //       const tutorial = tutorialDoc.data() as UserTutorials;
  //       setUserTutorial(prev => ({ ...prev, ...tutorial }));
  //     }

  //     setUserTutorialLoaded(true);
  //   };

  //   getTutorialState();
  // }, [db, setCurrentTutorial, user, user?.userId, userTutorialLoaded]);

  //  bd => state (first render)
  useEffect(() => {
    setTimeout(() => {
      if (!user) return;
      if (firstScrollToNode) return;
      if (!queueFinished) return;
      if (!urlNodeProcess) return;

      if (user.sNode && user.sNode === nodeBookState.selectedNode) {
        const selectedNode = graph.nodes[user.sNode];
        if (selectedNode && selectedNode.top === 0) {
          if (selectedNode.top === 0) return;

          nodeBookDispatch({ type: "setSelectedNode", payload: user.sNode });
          notebookRef.current.selectedNode = user.sNode;
          setNodeUpdates({
            nodeIds: [user.sNode],
            updatedAt: new Date(),
          });
          scrollToNode(user.sNode);
          setFirstScrollToNode(true);
        }
      }
      setIsSubmitting(false);
      setFirstLoading(false);
    }, 1000);
  }, [
    firstScrollToNode,
    graph.nodes,
    nodeBookDispatch,
    nodeBookState.selectedNode,
    queueFinished,
    scrollToNode,
    urlNodeProcess,
    user,
  ]);

  // called after first time map is rendered
  useEffect(() => {
    window.location.hash = "no-back-button";

    // Again because Google Chrome doesn't insert
    // the first hash into the history
    window.location.hash = "Again-No-back-button";

    window.onhashchange = function () {
      window.location.hash = "no-back-button";
    };

    window.onbeforeunload = function (e) {
      e = e || window.event;

      // For IE and Firefox prior to version 4
      if (e) {
        e.returnValue = "Do you want to close 1Cademy?";
      }

      // For Safari
      return "Do you want to close 1Cademy?";
    };

    // movement through map using keyboard arrow keys
    document.addEventListener("keydown", event => {
      if (!document.activeElement) return;
      if (
        // mapHovered &&
        getSelectionText() === "" &&
        document.activeElement.tagName !== "TEXTAREA" &&
        document.activeElement.tagName !== "INPUT" &&
        !arrowKeyMapTransitionInitialized
      ) {
        arrowKeyMapTransitionInitialized = true;
        setMapInteractionValue(oldValue => {
          const translationValue = { ...oldValue.translation };
          switch (event.key) {
            case "ArrowLeft":
              translationValue.x += 10;
              break;
            case "ArrowRight":
              translationValue.x -= 10;
              break;
            case "ArrowUp":
              translationValue.y += 10;
              break;
            case "ArrowDown":
              translationValue.y -= 10;
              break;
          }
          setTimeout(() => {
            arrowKeyMapTransitionInitialized = false;
          }, 10);
          return { scale: oldValue.scale, translation: translationValue };
        });
      }
    });
  }, []);

  // list of online users
  useEffect(() => {
    if (!user) return;

    const usersStatusQuery = query(collection(db, "status"), where("state", "==", "online"));
    const unsubscribe = onSnapshot(usersStatusQuery, snapshot => {
      const docChanges = snapshot.docChanges();
      setOnlineUsers(oldOnlineUsers => {
        const onlineUsersSet = new Set(oldOnlineUsers);
        for (let change of docChanges) {
          const { user: statusUname } = change.doc.data();
          if (change.type === "removed" && user.uname !== statusUname) {
            onlineUsersSet.delete(statusUname);
          } else if (change.type === "added" || change.type === "modified") {
            onlineUsersSet.add(statusUname);
          }
        }
        return Array.from(onlineUsersSet);
      });
      setUsersOnlineStatusLoaded(true);
    });
    return () => unsubscribe();
  }, [user]);

  const snapshot = useCallback(
    (q: Query<DocumentData>) => {
      const userNodesSnapshot = onSnapshot(
        q,
        async snapshot => {
          const docChanges = snapshot.docChanges();

          devLog("1:userNodes Snapshot:changes", docChanges);
          if (!docChanges.length) {
            setIsSubmitting(false);
            setFirstLoading(false);
            setNoNodesFoundMessage(true);
            return null;
          }

          setNoNodesFoundMessage(false);
          const userNodeChanges = getUserNodeChanges(docChanges);

          const nodeIds = userNodeChanges.map(cur => cur.uNodeData.node);
          const nodesData = await getNodes(db, nodeIds);
          devLog("3:user Nodes Snapshot:Nodes Data", nodesData);

          const fullNodes = buildFullNodes(userNodeChanges, nodesData);
          devLog("4:user Nodes Snapshot:Full nodes", fullNodes);

          const visibleFullNodes = fullNodes.filter(cur => cur.visible || cur.nodeChangeType === "modified");

          setAllNodes(oldAllNodes => mergeAllNodes(fullNodes, oldAllNodes));

          setGraph(({ nodes, edges }) => {
            const visibleFullNodesMerged = visibleFullNodes.map(cur => {
              const tmpNode = nodes[cur.node];
              if (tmpNode) {
                if (tmpNode.hasOwnProperty("simulated")) {
                  delete tmpNode["simulated"];
                }
                if (tmpNode.hasOwnProperty("isNew")) {
                  delete tmpNode["isNew"];
                }
              }

              const hasParent = cur.parents.length;
              // IMPROVE: we need to pass the parent which open the node
              // to use his current position
              // in this case we are checking first parent
              // if this doesn't exist will set top:0 and left: 0 + NODE_WIDTH + COLUMN_GAP
              const nodeParent = hasParent ? nodes[cur.parents[0].node] : null;
              const topParent = nodeParent?.top ?? 0;

              const leftParent = nodeParent?.left ?? 0;

              return {
                ...cur,
                left: tmpNode?.left ?? leftParent + NODE_WIDTH + COLUMN_GAP,
                top: tmpNode?.top ?? topParent,
              };
            });

            devLog("5:user Nodes Snapshot:visible Full Nodes Merged", visibleFullNodesMerged);
            const updatedNodeIds: string[] = [];
            const { newNodes, newEdges } = fillDagre(
              g.current,
              visibleFullNodesMerged,
              nodes,
              edges,
              settings.showClusterOptions,
              allTags,
              updatedNodeIds
            );

            setNodeUpdates({
              nodeIds: updatedNodeIds,
              updatedAt: new Date(),
            });

            if (!Object.keys(newNodes).length) {
              setNoNodesFoundMessage(true);
            }
            return { nodes: newNodes, edges: newEdges };
          });
          devLog("user Nodes Snapshot", {
            userNodeChanges,
            nodeIds,
            nodesData,
            fullNodes,
            visibleFullNodes,
          });
          setUserNodesLoaded(true);
        },
        error => console.error(error)
      );

      return () => userNodesSnapshot();
    },
    [allTags, db, settings.showClusterOptions]
  );

  // this useEffect manage states when sidebar is opened or closed
  useEffect(() => {
    if (!openSidebar) {
      nodeBookDispatch({ type: "setChoosingNode", payload: null });
    }
    if (openSidebar !== "PROPOSALS") {
      setOpenProposal("");
    }
  }, [nodeBookDispatch, openSidebar]);

  useEffect(() => {
    if (!db) return;
    if (!user) return;
    if (!user.uname) return;
    if (!allTagsLoaded) return;
    if (!userTutorialLoaded) return;

    devLog("USE_EFFECT", "nodes synchronization");

    const userNodesRef = collection(db, "userNodes");
    const q = query(
      userNodesRef,
      where("user", "==", user.uname),
      where("visible", "==", true),
      where("deleted", "==", false)
    );

    const killSnapshot = snapshot(q);
    return () => {
      killSnapshot();
    };
    //IMPORTANT: notebookChanged used in dependecies because of the redraw graph (magic wand button)
  }, [allTagsLoaded, db, snapshot, user, userTutorialLoaded, notebookChanged]);

  useEffect(() => {
    if (!db) return;
    if (!user?.uname) return;
    if (!allTagsLoaded) return;
    if (tutorial) return;
    if (currentStep) return;

    const userNodesRef = collection(db, "userNodes");
    const q = query(
      userNodesRef,
      where("user", "==", user.uname),
      where("bookmarked", "==", true),
      where("isStudied", "==", false),
      where("deleted", "==", false)
    );
    const bookmarkSnapshot = onSnapshot(q, async snapshot => {
      const docChanges = snapshot.docChanges();

      if (!docChanges.length) {
        setBookmarkUpdatesNum(0);
      } else {
        for (let change of docChanges) {
          if (change.type === "added") {
            setBookmarkUpdatesNum(oldbookmarkNum => oldbookmarkNum + 1);
          } else if (change.type === "removed") {
            setBookmarkUpdatesNum(oldbookmarkNum => oldbookmarkNum - 1);
          }
        }
      }
    });
    return () => {
      bookmarkSnapshot();
    };
  }, [allTagsLoaded, db, user?.uname, currentStep, tutorial]);

  useEffect(() => {
    if (!db) return;
    if (!user?.uname) return;
    if (!user?.tagId) return;
    if (!allTagsLoaded) return;
    if (currentStep) return;

    const versionsSnapshots: any[] = [];
    const versions: { [key: string]: any } = {};
    const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];
    for (let nodeType of NODE_TYPES_ARRAY) {
      const { versionsColl, userVersionsColl } = getTypedCollections(db, nodeType);
      if (!versionsColl || !userVersionsColl) continue;

      const versionsQuery = query(
        versionsColl,
        where("accepted", "==", false),
        where("tagIds", "array-contains", user.tagId),
        where("deleted", "==", false)
      );

      const versionsSnapshot = onSnapshot(versionsQuery, async snapshot => {
        const docChanges = snapshot.docChanges();
        if (docChanges.length > 0) {
          for (let change of docChanges) {
            const versionId = change.doc.id;
            const versionData = change.doc.data();
            if (change.type === "removed") {
              delete versions[versionId];
            }
            if (change.type === "added" || change.type === "modified") {
              versions[versionId] = {
                ...versionData,
                id: versionId,
                createdAt: versionData.createdAt.toDate(),
                award: false,
                correct: false,
                wrong: false,
              };
              delete versions[versionId].deleted;
              delete versions[versionId].updatedAt;

              const q = query(
                userVersionsColl,
                where("version", "==", versionId),
                where("user", "==", user?.uname),
                limit(1)
              );

              const userVersionsDocs = await getDocs(q);

              for (let userVersionsDoc of userVersionsDocs.docs) {
                const userVersion = userVersionsDoc.data();
                delete userVersion.version;
                delete userVersion.updatedAt;
                delete userVersion.createdAt;
                delete userVersion.user;
                versions[versionId] = {
                  ...versions[versionId],
                  ...userVersion,
                };
              }
            }
          }

          const pendingProposals = { ...versions };
          const proposalsTemp = Object.values(pendingProposals);
          setPendingProposalsNum(proposalsTemp.length);
        }
      });
      versionsSnapshots.push(versionsSnapshot);
    }
    ``;
    return () => {
      for (let vSnapshot of versionsSnapshots) {
        vSnapshot();
      }
    };
  }, [allTagsLoaded, db, user?.tagId, user?.uname, currentStep]);

  useEffect(() => {
    if (!db) return;
    if (!user?.uname) return;
    if (!allTagsLoaded) return;
    if (currentStep) return;

    const notificationNumsCol = collection(db, "notificationNums");
    const q = query(notificationNumsCol, where("uname", "==", user.uname));

    const notificationsSnapshot = onSnapshot(q, async snapshot => {
      if (!snapshot.docs.length) {
        const notificationNumRef = collection(db, "notificationNums");
        setDoc(doc(notificationNumRef), {
          uname: user.uname,
          nNum: 0,
        } as INotificationNum);
      } else {
        const notificationNum = snapshot.docs[0].data() as INotificationNum;
        setUncheckedNotificationsNum(notificationNum.nNum);
      }
    });
    return () => {
      notificationsSnapshot();
    };
  }, [db, user?.uname, allTagsLoaded, currentStep]);

  useEffect(() => {
    const currentLengthNodes = Object.keys(graph.nodes).length;
    if (currentLengthNodes < previousLengthNodes.current) {
      devLog("CHANGE NH 🚀", "recalculate by length nodes");
      addTask(null);
    }
    previousLengthNodes.current = currentLengthNodes;
  }, [addTask, graph.nodes]);

  useEffect(() => {
    g.current = createGraph();
    setGraph({ nodes: {}, edges: {} });
    setNodeUpdates({
      nodeIds: [],
      updatedAt: new Date(),
    });
    devLog("CHANGE NH 🚀", { showClusterOptions: settings.showClusterOptions });
  }, [settings.showClusterOptions]);

  useEffect(() => {
    const currentLengthEdges = Object.keys(graph.edges).length;
    if (currentLengthEdges !== previousLengthEdges.current) {
      devLog("CHANGE NH 🚀", "recalculate by length edges");
      addTask(null);
    }
    previousLengthEdges.current = currentLengthEdges;
  }, [addTask, graph.edges]);

  // called whenever isSubmitting changes
  // changes style of cursor
  useEffect(() => {
    if (isSubmitting) {
      document.body.style.cursor = "wait";
    } else {
      document.body.style.cursor = "initial";
    }
  }, [isSubmitting]);

  // state => bd
  useEffect(() => {
    const changeSelectedNode = async () => {
      if (!user?.uname) return;
      if (!nodeBookState.selectedNode) return;
      if (user?.sNode === nodeBookState.selectedNode) return;

      const usersRef = collection(db, "users");
      const userRef = doc(usersRef, user.uname);

      await updateDoc(userRef, { sNode: nodeBookState.selectedNode });

      const userNodeSelectLogRef = collection(db, "userNodeSelectLog");
      setDoc(doc(userNodeSelectLogRef), {
        nodeId: nodeBookState.selectedNode,
        uname: user.uname,
        createdAt: Timestamp.fromDate(new Date()),
      });
    };
    changeSelectedNode();
  }, [db, nodeBookState.selectedNode, user?.sNode, user?.uname]);

  /**
   * Will revert the graph from last changes (temporal Nodes or other changes)
   */
  const reloadPermanentGraph = useCallback(() => {
    devLog("RELOAD PERMANENT GRAPH");

    setGraph(({ nodes: oldNodes, edges: oldEdges }) => {
      const updatedNodeIds: string[] = [];

      if (tempNodes.size > 0 || Object.keys(changedNodes).length > 0) {
        oldNodes = { ...oldNodes };
        oldEdges = { ...oldEdges };
      }

      tempNodes.forEach(tempNode => {
        oldEdges = removeDagAllEdges(g.current, tempNode, oldEdges, updatedNodeIds);
        oldNodes = removeDagNode(g.current, tempNode, oldNodes);
        updatedNodeIds.push(tempNode);
        tempNodes.delete(tempNode);
      });

      for (let cId of Object.keys(changedNodes)) {
        const changedNode = changedNodes[cId];
        if (cId in oldNodes) {
          oldEdges = compareAndUpdateNodeLinks(g.current, oldNodes[cId], cId, changedNode, oldEdges);
        } else {
          oldEdges = setNewParentChildrenEdges(g.current, cId, changedNode, oldEdges);
        }
        oldNodes = setDagNode(
          g.current,
          cId,
          copyNode(changedNode),
          oldNodes,
          allTags,
          settings.showClusterOptions,
          null
        );
        updatedNodeIds.push(cId);
        delete changedNodes[cId];
      }

      setTimeout(() => {
        setNodeUpdates({
          nodeIds: updatedNodeIds,
          updatedAt: new Date(),
        });
      }, 200);
      return {
        nodes: oldNodes,
        edges: oldEdges,
      };
    });
  }, [setGraph, allTags, settings.showClusterOptions]);

  const openUserInfoSidebar = useCallback(
    (uname: string, imageUrl: string, fullName: string, chooseUname: string) => {
      const userUserInfoCollection = collection(db, "userUserInfoLog");

      nodeBookDispatch({
        type: "setSelectedUser",
        payload: {
          username: uname,
          imageUrl,
          fullName,
          chooseUname,
        },
      });

      nodeBookDispatch({
        type: "setSelectionType",
        payload: "UserInfo",
      });
      setOpenSidebar("USER_INFO");
      reloadPermanentGraph();
      addDoc(userUserInfoCollection, {
        uname: user?.uname,
        uInfo: uname,
        createdAt: Timestamp.fromDate(new Date()),
      });
    },
    [db, nodeBookDispatch, user?.uname, setOpenSidebar, reloadPermanentGraph]
  );

  const resetAddedRemovedParentsChildren = useCallback(() => {
    // CHECK: this could be improve merging this 4 states in 1 state object
    // so we reduce the rerenders, also we can set only the empty array here
    setUpdatedLinks({
      addedParents: [],
      addedChildren: [],
      removedChildren: [],
      removedParents: [],
    });
  }, []);

  const getMapGraph = useCallback(
    async (mapURL: string, postData: any = false, resetGraph: boolean = true) => {
      if (resetGraph) {
        setTimeout(() => reloadPermanentGraph(), 200);
      }

      try {
        await postWithToken(mapURL, postData);
      } catch (err) {
        console.error(err);
        try {
          await idToken();
          await postWithToken(mapURL, { ...postData });
        } catch (err) {
          console.error(err);
          // window.location.reload();
        }
      }
      let { reputation } = await retrieveAuthenticatedUser(user!.userId, null);
      if (reputation) {
        dispatch({ type: "setReputation", payload: reputation });
      }
      setSelectedRelation(null);
      resetAddedRemovedParentsChildren();
      setIsSubmitting(false);
    },
    // TODO: check dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetAddedRemovedParentsChildren]
  );

  const getFirstParent = (childId: string) => {
    const parents: any = g.current.predecessors(childId);

    if (!parents) return null;
    if (!parents.length) return null;
    return parents[0];
  };

  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // NODE FUNCTIONS
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  const getColumnRows = useCallback((nodes: FullNodesData, column: number) => {
    let rows: string[] = [];
    for (const nodeId in nodes) {
      const node = nodes[nodeId];
      if (node.left === column) {
        rows.push(nodeId);
      }
    }
    rows.sort((n1, n2) => (nodes[n1]!.top < nodes[n2]!.top ? -1 : 1));
    return rows;
  }, []);

  const processHeightChange = useCallback(
    (nodeId: string) => {
      setTimeout(() => {
        setGraph(graph => {
          const updatedNodeIds: string[] = [];
          const nodes = { ...graph.nodes };
          const nodeEl = document.getElementById(nodeId)! as HTMLElement;
          let height: number = nodeEl.clientHeight;
          if (isNaN(height)) {
            height = nodes[nodeId]!.height ?? 0; //take a look with Ameer Hamza
          }

          let nodesUpdated = false;
          const nodeData = nodes[nodeId]!;
          const column = nodeData.left;
          const rows = getColumnRows(nodes, column);
          if (rows) {
            const nodeIdx = rows.indexOf(nodeId);
            const heightDiff = height - (nodes[nodeId]!.height ?? 0); //take a look with Ameer Hamza

            let lastHeight = height;
            let lastTop = nodes[nodeId]!.top;

            // below of bound
            for (let idx = nodeIdx + 1; idx < rows.length; idx++) {
              const _nodeId = rows[idx];
              const _nodeData = copyNode(nodes[_nodeId]);

              // if next node doesn't need to move on graph
              if (_nodeData.top > lastHeight + lastTop) {
                break;
              }

              _nodeData.top += heightDiff;

              lastHeight = _nodeData.height ?? 0; //take a look with Ameer Hamza
              lastTop = _nodeData.top;

              nodesUpdated = true;
              updatedNodeIds.push(_nodeId);
              nodes[_nodeId] = _nodeData;
            }
          }

          if (!nodesUpdated) {
            return graph;
          }

          setTimeout(() => {
            setNodeUpdates({
              nodeIds: updatedNodeIds,
              updatedAt: new Date(),
            });
          }, 100);
          return {
            nodes: { ...nodes },
            edges: graph.edges,
          };
        });
      }, 200);
    },
    [setGraph, getColumnRows]
  );

  const chosenNodeChanged = useCallback(
    (nodeId: string) => {
      setUpdatedLinks(updatedLinks => {
        setGraph(({ nodes: oldNodes, edges: oldEdges }) => {
          const updatedNodeIds: string[] = [];
          if (!notebookRef.current.choosingNode || !notebookRef.current.chosenNode)
            return { nodes: oldNodes, edges: oldEdges };
          if (nodeId !== notebookRef.current.choosingNode.id) return { nodes: oldNodes, edges: oldEdges };

          updatedNodeIds.push(nodeId);
          updatedNodeIds.push(notebookRef.current.chosenNode.id);
          const thisNode = copyNode(oldNodes[nodeId]);
          const chosenNodeObj = copyNode(oldNodes[notebookRef.current.chosenNode.id]);

          let newEdges: EdgesData = oldEdges;

          const validLink =
            (notebookRef.current.choosingNode.type === "Reference" &&
              /* thisNode.referenceIds.filter(l => l === nodeBookState.chosenNode?.id).length === 0 &&*/
              notebookRef.current.chosenNode.id !== nodeId &&
              chosenNodeObj.nodeType === notebookRef.current.choosingNode.type) ||
            (notebookRef.current.choosingNode.type === "Tag" &&
              thisNode.tagIds.filter(l => l === notebookRef.current.chosenNode?.id).length === 0) ||
            (notebookRef.current.choosingNode.type === "Parent" &&
              notebookRef.current.choosingNode.id !== notebookRef.current.chosenNode.id &&
              thisNode.parents.filter((l: any) => l.node === notebookRef.current.chosenNode?.id).length === 0) ||
            (notebookRef.current.choosingNode.type === "Child" &&
              notebookRef.current.choosingNode.id !== notebookRef.current.chosenNode.id &&
              thisNode.children.filter((l: any) => l.node === notebookRef.current.chosenNode?.id).length === 0);

          if (!validLink) return { nodes: oldNodes, edges: oldEdges };

          if (notebookRef.current.choosingNode.type === "Reference") {
            thisNode.references = [...thisNode.references, chosenNodeObj.title];
            thisNode.referenceIds = [...thisNode.referenceIds, notebookRef.current.chosenNode.id];
            thisNode.referenceLabels = [...thisNode.referenceLabels, ""];
          } else if (notebookRef.current.choosingNode.type === "Tag") {
            thisNode.tags = [...thisNode.tags, chosenNodeObj.title];
            thisNode.tagIds = [...thisNode.tagIds, notebookRef.current.chosenNode.id];
          } else if (notebookRef.current.choosingNode.type === "Parent") {
            thisNode.parents = [
              ...thisNode.parents,
              {
                node: notebookRef.current.chosenNode.id,
                title: chosenNodeObj.title,
                label: "",
                type: chosenNodeObj.nodeType,
              },
            ];
            if (!(notebookRef.current.chosenNode.id in changedNodes)) {
              changedNodes[notebookRef.current.chosenNode.id] = copyNode(oldNodes[notebookRef.current.chosenNode.id]);
            }
            chosenNodeObj.children = [
              ...chosenNodeObj.children,
              {
                node: notebookRef.current.choosingNode.id,
                title: thisNode.title,
                label: "",
                type: chosenNodeObj.nodeType,
              },
            ];
            const chosenNodeId = notebookRef.current.chosenNode.id;
            if (updatedLinks.removedParents.includes(notebookRef.current.chosenNode.id)) {
              updatedLinks.removedParents = updatedLinks.removedParents.filter((nId: string) => nId !== chosenNodeId);
            } else {
              updatedLinks.addedParents = [...updatedLinks.addedParents, chosenNodeId];
            }

            if (notebookRef.current.chosenNode && notebookRef.current.choosingNode) {
              newEdges = setDagEdge(
                g.current,
                notebookRef.current.chosenNode.id,
                notebookRef.current.choosingNode.id,
                { label: "" },
                { ...oldEdges }
              );
            }
          } else if (notebookRef.current.choosingNode.type === "Child") {
            thisNode.children = [
              ...thisNode.children,
              {
                node: notebookRef.current.chosenNode.id,
                title: chosenNodeObj.title,
                label: "",
                type: chosenNodeObj.nodeType,
              },
            ];
            if (!(notebookRef.current.chosenNode.id in changedNodes)) {
              changedNodes[notebookRef.current.chosenNode.id] = copyNode(oldNodes[notebookRef.current.chosenNode.id]);
            }
            chosenNodeObj.parents = [
              ...chosenNodeObj.parents,
              {
                node: notebookRef.current.choosingNode.id,
                title: thisNode.title,
                label: "",
                type: chosenNodeObj.nodeType,
              },
            ];
            if (notebookRef.current.chosenNode && notebookRef.current.choosingNode) {
              newEdges = setDagEdge(
                g.current,
                notebookRef.current.choosingNode.id,
                notebookRef.current.chosenNode.id,
                { label: "" },
                { ...oldEdges }
              );
            }
            if (updatedLinks.removedChildren.includes(notebookRef.current.chosenNode.id)) {
              const chosenNodeId = notebookRef.current.choosingNode.id;
              updatedLinks.removedChildren = updatedLinks.removedChildren.filter(nId => nId !== chosenNodeId);
            } else {
              updatedLinks.addedChildren = [...updatedLinks.addedChildren, notebookRef.current.chosenNode.id];
            }
          }

          const chosenNode = notebookRef.current.chosenNode.id;
          notebookRef.current.choosingNode = null;
          notebookRef.current.chosenNode = null;
          nodeBookDispatch({ type: "setChoosingNode", payload: null });
          nodeBookDispatch({ type: "setChosenNode", payload: null });

          const newNodes = {
            ...oldNodes,
            [nodeId]: thisNode,
            [chosenNode]: chosenNodeObj,
          };
          setTimeout(() => {
            setNodeUpdates({
              nodeIds: updatedNodeIds,
              updatedAt: new Date(),
            });
          }, 200);
          return { nodes: newNodes, edges: newEdges };
        });
        return { ...updatedLinks };
      });
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notebookRef.current.choosingNode, notebookRef.current.chosenNode]
  );

  const deleteLink = useCallback(
    (nodeId: string, linkIdx: number, linkType: ChoosingType) => {
      setUpdatedLinks(updatedLinks => {
        setGraph(({ nodes, edges }) => {
          const updatedNodeIds: string[] = [nodeId];
          let oldNodes = { ...nodes };
          let newEdges = { ...edges };
          const thisNode = copyNode(oldNodes[nodeId]);

          if (linkType === "Parent") {
            let parentNode = null;
            const parentId = thisNode.parents[linkIdx].node;
            thisNode.parents = [...thisNode.parents];
            thisNode.parents.splice(linkIdx, 1);
            if (updatedLinks.addedParents.includes(parentId)) {
              updatedLinks.addedParents = updatedLinks.addedParents.filter(nId => nId !== parentId);
            } else {
              updatedLinks.removedParents = [...updatedLinks.removedParents, parentId];
            }
            if (parentId in oldNodes) {
              parentNode = copyNode(oldNodes[parentId]);
              newEdges = removeDagEdge(g.current, parentId, nodeId, { ...newEdges });
              if (!(parentId in changedNodes)) {
                changedNodes[parentId] = copyNode(oldNodes[parentId]);
              }
              parentNode.children = parentNode.children.filter(l => l.node !== nodeId);
              oldNodes[parentId] = parentNode;
            }
          } else if (linkType === "Child") {
            let childNode = null;
            const childId = thisNode.children[linkIdx].node;
            thisNode.children = [...thisNode.children];
            thisNode.children.splice(linkIdx, 1);
            if (updatedLinks.addedChildren.includes(childId)) {
              updatedLinks.addedChildren = updatedLinks.addedChildren.filter(nId => nId !== childId);
            } else {
              updatedLinks.removedChildren = [...updatedLinks.removedChildren, childId];
            }
            if (childId in oldNodes) {
              childNode = oldNodes[childId];
              newEdges = removeDagEdge(g.current, nodeId, childId, { ...newEdges });
              if (!(childId in changedNodes)) {
                changedNodes[childId] = copyNode(oldNodes[childId]);
              }
              childNode.parents = childNode.parents.filter(l => l.node !== nodeId);
              oldNodes[childId] = childNode;
            }
          } else if (linkType === "Reference") {
            thisNode.references = [...thisNode.references];
            thisNode.references.splice(linkIdx, 1);
            thisNode.referenceIds.splice(linkIdx, 1);
            thisNode.referenceLabels.splice(linkIdx, 1);
          } else if (linkType === "Tag") {
            thisNode.tags = [...thisNode.tags];
            thisNode.tags.splice(linkIdx, 1);
            thisNode.tagIds.splice(linkIdx, 1);
          }
          oldNodes[nodeId] = thisNode;
          setNodeUpdates({
            nodeIds: updatedNodeIds,
            updatedAt: new Date(),
          });
          return { nodes: oldNodes, edges: newEdges };
        });

        return { ...updatedLinks };
      });
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setGraph]
  );

  const nodeClicked = useCallback((event: any, nodeId: string, nodeType: any, setOpenPart: any) => {
    devLog("node Clicked");
    if (notebookRef.current.selectionType === "AcceptedProposals" || notebookRef.current.selectionType === "Proposals")
      return;
    notebookRef.current.selectedNode = nodeId;
    nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });

    setSelectedNodeType(nodeType);
    setOpenPart("LinkingWords");

    processHeightChange(nodeId);
  }, []);

  const recursiveOffsprings = useCallback((nodeId: string): any[] => {
    // CHECK: this could be improve changing recursive function to iterative
    // because the recursive has a limit of call in stack memory
    // TODO: check type of children
    const children: any = g.current.successors(nodeId);
    let offsprings: any[] = [];
    if (children && children.length > 0) {
      for (let child of children) {
        offsprings = [...offsprings, child, ...recursiveOffsprings(child)];
      }
    }
    return offsprings;
  }, []);

  const hideOffsprings = useMemoizedCallback(
    nodeId => {
      if (notebookRef.current.choosingNode || !user) return;

      setGraph(graph => {
        (async () => {
          const updatedNodeIds: string[] = [];
          const offsprings = recursiveOffsprings(nodeId);
          notebookRef.current.selectedNode = nodeId;
          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });

          const batch = writeBatch(db);
          try {
            for (let offspring of offsprings) {
              const thisNode = graph.nodes[offspring];
              const { nodeRef, userNodeRef } = initNodeStatusChange(offspring, thisNode.userNodeId);
              const userNodeData = {
                changed: thisNode.changed,
                correct: thisNode.correct,
                createdAt: Timestamp.fromDate(thisNode.firstVisit),
                updatedAt: Timestamp.fromDate(new Date()),
                deleted: false,
                isStudied: thisNode.isStudied,
                bookmarked: "bookmarked" in thisNode ? thisNode.bookmarked : false,
                node: offspring,
                open: thisNode.open,
                user: user.uname,
                visible: false,
                wrong: thisNode.wrong,
              };

              userNodeRef ? batch.set(userNodeRef, userNodeData) : null;
              const userNodeLogData: any = {
                ...userNodeData,
                createdAt: Timestamp.fromDate(new Date()),
              };
              const changeNode: any = {
                viewers: (thisNode.viewers || 0) - 1, // CHECK I add 0
                updatedAt: Timestamp.fromDate(new Date()),
              };
              if (userNodeData.open && "openHeight" in thisNode) {
                changeNode.height = thisNode.openHeight;
                userNodeLogData.height = thisNode.openHeight;
              } else if ("closedHeight" in thisNode) {
                changeNode.closedHeight = thisNode.closedHeight;
                userNodeLogData.closedHeight = thisNode.closedHeight;
              }
              batch.update(nodeRef, changeNode);

              const userNodeLogRef = collection(db, "userNodesLog");
              batch.set(doc(userNodeLogRef), userNodeLogData);
            }

            await batch.commit();

            // TODO: need to discuss about these
            let oldNodes = { ...graph.nodes };
            let oldEdges = { ...graph.edges };
            for (let offspring of offsprings) {
              ({ oldNodes, oldEdges } = hideNodeAndItsLinks(g.current, offspring, oldNodes, oldEdges, updatedNodeIds));
            }
            setNodeUpdates({
              nodeIds: updatedNodeIds,
              updatedAt: new Date(),
            });
          } catch (err) {
            console.error(err);
          }
        })();

        return graph;
      });
    },
    [recursiveOffsprings, isPlayingTheTutorialRef]
  );

  const openLinkedNode = useCallback(
    (linkedNodeID: string, typeOperation?: string) => {
      devLog("open Linked Node", {
        linkedNodeID,
        typeOperation,
        isPlayingTheTutorialRef: isPlayingTheTutorialRef.current,
      });

      if (notebookRef.current.choosingNode) return;

      createActionTrack(
        db,
        "NodeOpen",
        "",
        {
          fullname: `${user?.fName} ${user?.lName}`,
          chooseUname: !!user?.chooseUname,
          uname: String(user?.uname),
          imageUrl: String(user?.imageUrl),
        },
        linkedNodeID,
        []
      );

      gtmEvent("Interaction", {
        customType: "NodeOpen",
      });

      let linkedNode = document.getElementById(linkedNodeID);
      if (typeOperation) {
        lastNodeOperation.current = "Searcher";
      }
      const isInitialProposal = String(typeOperation).startsWith("initialProposal-");
      if (isInitialProposal) {
        nodeBookDispatch({
          type: "setInitialProposal",
          payload: String(typeOperation).replace("initialProposal-", ""),
        });
        notebookRef.current.initialProposal = String(typeOperation).replace("initialProposal-", "");
        setOpenSidebar("PROPOSALS");
      }

      if (linkedNode) {
        notebookRef.current.selectedNode = linkedNodeID;
        nodeBookDispatch({ type: "setSelectedNode", payload: linkedNodeID });
        setTimeout(() => {
          scrollToNode(linkedNodeID);
        }, 1500);
      } else {
        openNodeHandler(linkedNodeID, isInitialProposal ? typeOperation : "Searcher");
      }

      if (typeOperation === "CitationSidebar") {
        setOpenSidebar(null);
      }
    },

    [
      db,
      isPlayingTheTutorialRef,
      nodeBookDispatch,
      openNodeHandler,
      scrollToNode,
      user?.chooseUname,
      user?.fName,
      user?.imageUrl,
      user?.lName,
      user?.uname,
    ]
  );

  const getNodeUserNode = useCallback(
    (nodeId: string, userNodeId: string) => {
      const nodeRef = doc(db, "nodes", nodeId);
      const userNodeRef = doc(db, "userNodes", userNodeId);
      return { nodeRef, userNodeRef };
    },
    [db]
  );

  const clearInitialProposal = useCallback(() => {
    nodeBookDispatch({ type: "setInitialProposal", payload: null });
  }, [nodeBookDispatch]);

  const initNodeStatusChange = useCallback(
    (nodeId: string, userNodeId: string) => {
      return getNodeUserNode(nodeId, userNodeId);
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [/*resetAddedRemovedParentsChildren, reloadPermanentGraph,*/ getNodeUserNode]
  );

  const hideNodeHandler = useCallback(
    (nodeId: string) => {
      /**
       * changes in DB
       * change userNode
       * change node
       * create userNodeLog
       */

      setGraph(graph => {
        const parentNode = getFirstParent(nodeId);

        const thisNode = graph.nodes[nodeId];
        const { nodeRef, userNodeRef } = initNodeStatusChange(nodeId, thisNode.userNodeId);

        // flagged closing node as visible = false in parents
        for (const parent of thisNode.parents) {
          if (!graph.nodes[parent.node]) continue;
          const childIdx = graph.nodes[parent.node].children.findIndex(child => child.node === nodeId);
          if (childIdx !== -1) {
            graph.nodes[parent.node] = { ...graph.nodes[parent.node] };
            graph.nodes[parent.node].children = [...graph.nodes[parent.node].children];
            const child = graph.nodes[parent.node].children[childIdx];
            child.visible = false;
          }
        }

        (async () => {
          const batch = writeBatch(db);
          const username = user?.uname;
          if (notebookRef.current.choosingNode) return;
          if (!username) return;

          const userNodeData = {
            changed: thisNode.changed || false,
            correct: thisNode.correct,
            createdAt: Timestamp.fromDate(thisNode.firstVisit),
            updatedAt: Timestamp.fromDate(new Date()),
            deleted: false,
            isStudied: thisNode.isStudied,
            bookmarked: "bookmarked" in thisNode ? thisNode.bookmarked : false,
            node: nodeId,
            open: thisNode.open,
            user: username,
            visible: false,
            wrong: thisNode.wrong,
          };
          if (userNodeRef) {
            batch.set(userNodeRef, userNodeData);
          }
          const userNodeLogData: any = {
            ...userNodeData,
            createdAt: Timestamp.fromDate(new Date()),
          };

          const changeNode: any = {
            viewers: thisNode.viewers - 1,
            updatedAt: Timestamp.fromDate(new Date()),
          };
          if (userNodeData.open && "openHeight" in thisNode) {
            changeNode.height = thisNode.openHeight;
            userNodeLogData.height = thisNode.openHeight;
          } else if ("closedHeight" in thisNode) {
            changeNode.closedHeight = thisNode.closedHeight;
            userNodeLogData.closedHeight = thisNode.closedHeight;
          }

          batch.update(nodeRef, changeNode);
          const userNodeLogRef = collection(db, "userNodesLog");
          batch.set(doc(userNodeLogRef), userNodeLogData);
          await batch.commit();

          gtmEvent("Interaction", {
            customType: "NodeHide",
          });

          createActionTrack(
            db,
            "NodeHide",
            "",
            {
              fullname: `${user?.fName} ${user?.lName}`,
              chooseUname: !!user?.chooseUname,
              uname: String(user?.uname),
              imageUrl: String(user?.imageUrl),
            },
            nodeId,
            []
          );

          notebookRef.current.selectedNode = parentNode;
          nodeBookDispatch({ type: "setSelectedNode", payload: parentNode });
        })();

        return graph;
      });
    },
    [
      db,
      user?.uname,
      user?.fName,
      user?.lName,
      user?.chooseUname,
      user?.imageUrl,
      initNodeStatusChange,
      nodeBookDispatch,
    ]
  );

  const openAllChildren = useCallback((nodeId: string) => {
    if (notebookRef.current.choosingNode || !user) return;

    let linkedNode = null;
    let linkedNodeId = null;
    let linkedNodeRef = null;
    let userNodeRef = null;
    let userNodeData = null;
    const batch = writeBatch(db);

    setGraph(graph => {
      const thisNode = graph.nodes[nodeId];

      (async () => {
        try {
          for (const child of thisNode.children) {
            linkedNodeId = child.node as string;
            linkedNode = document.getElementById(linkedNodeId);
            if (linkedNode) continue;

            const nodeRef = doc(db, "nodes", linkedNodeId);
            const nodeDoc = await getDoc(nodeRef);

            if (!nodeDoc.exists()) continue;
            const thisNode: any = { ...nodeDoc.data(), id: linkedNodeId };

            for (let chi of thisNode.children) {
              linkedNodeRef = doc(db, "nodes", chi.node);
              batch.update(linkedNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
            }

            for (let parent of thisNode.parents) {
              linkedNodeRef = doc(db, "nodes", parent.node);
              batch.update(linkedNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
            }

            const userNodesRef = collection(db, "userNodes");
            const userNodeQuery = query(
              userNodesRef,
              where("node", "==", linkedNodeId),
              where("user", "==", user.uname),
              limit(1)
            );
            const userNodeDoc = await getDocs(userNodeQuery);

            if (userNodeDoc.docs.length > 0) {
              userNodeRef = doc(db, "userNodes", userNodeDoc.docs[0].id);
              userNodeData = userNodeDoc.docs[0].data();
              userNodeData.visible = true;
              userNodeData.updatedAt = Timestamp.fromDate(new Date());
              batch.update(userNodeRef, userNodeData);
            } else {
              userNodeData = {
                changed: true,
                correct: false,
                createdAt: Timestamp.fromDate(new Date()),
                updatedAt: Timestamp.fromDate(new Date()),
                deleted: false,
                isStudied: false,
                bookmarked: false,
                node: linkedNodeId,
                open: true,
                user: user.uname,
                visible: true,
                wrong: false,
              };
              userNodeRef = await addDoc(collection(db, "userNodes"), userNodeData);
            }

            batch.update(nodeRef, {
              viewers: thisNode.viewers + 1,
              updatedAt: Timestamp.fromDate(new Date()),
            });
            const userNodeLogRef = collection(db, "userNodesLog");
            const userNodeLogData = {
              ...userNodeData,
              createdAt: Timestamp.fromDate(new Date()),
            };

            batch.set(doc(userNodeLogRef), userNodeLogData);
          }

          notebookRef.current.selectedNode = nodeId;
          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
          await batch.commit();
        } catch (err) {
          console.error(err);
        }
      })();

      return graph;
    });
    lastNodeOperation.current = "OpenAllChildren";
  }, []);

  const openAllParent = useCallback((nodeId: string) => {
    if (notebookRef.current.choosingNode || !user) return;

    let linkedNode = null;
    let linkedNodeId = null;
    let linkedNodeRef = null;
    let userNodeRef = null;
    let userNodeData = null;
    const batch = writeBatch(db);

    setGraph(graph => {
      const thisNode = graph.nodes[nodeId];

      (async () => {
        try {
          for (const parent of thisNode.parents) {
            linkedNodeId = parent.node as string;
            linkedNode = document.getElementById(linkedNodeId);
            if (linkedNode) continue;

            const nodeRef = doc(db, "nodes", linkedNodeId);
            const nodeDoc = await getDoc(nodeRef);

            if (!nodeDoc.exists()) continue;
            const thisNode: any = { ...nodeDoc.data(), id: linkedNodeId };

            for (let chi of thisNode.children) {
              linkedNodeRef = doc(db, "nodes", chi.node);
              batch.update(linkedNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
            }

            for (let par of thisNode.parents) {
              linkedNodeRef = doc(db, "nodes", par.node);
              batch.update(linkedNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
            }

            const userNodesRef = collection(db, "userNodes");
            const userNodeQuery = query(
              userNodesRef,
              where("node", "==", linkedNodeId),
              where("user", "==", user.uname),
              limit(1)
            );
            const userNodeDoc = await getDocs(userNodeQuery);

            if (userNodeDoc.docs.length > 0) {
              userNodeRef = doc(db, "userNodes", userNodeDoc.docs[0].id);
              userNodeData = userNodeDoc.docs[0].data();
              userNodeData.visible = true;
              userNodeData.updatedAt = Timestamp.fromDate(new Date());
              batch.update(userNodeRef, userNodeData);
            } else {
              userNodeData = {
                changed: true,
                correct: false,
                createdAt: Timestamp.fromDate(new Date()),
                updatedAt: Timestamp.fromDate(new Date()),
                deleted: false,
                isStudied: false,
                bookmarked: false,
                node: linkedNodeId,
                open: true,
                user: user.uname,
                visible: true,
                wrong: false,
              };
              userNodeRef = await addDoc(collection(db, "userNodes"), userNodeData);
            }

            batch.update(nodeRef, {
              viewers: thisNode.viewers + 1,
              updatedAt: Timestamp.fromDate(new Date()),
            });
            const userNodeLogRef = collection(db, "userNodesLog");
            const userNodeLogData = {
              ...userNodeData,
              createdAt: Timestamp.fromDate(new Date()),
            };

            batch.set(doc(userNodeLogRef), userNodeLogData);
          }

          notebookRef.current.selectedNode = nodeId;
          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
          await batch.commit();
        } catch (err) {
          console.error(err);
        }
      })();

      return graph;
    });
    lastNodeOperation.current = "OpenAllParent";
  }, []);

  const toggleNode = useCallback(
    (event: any, nodeId: string) => {
      if (notebookRef.current.choosingNode) return;

      notebookRef.current.selectedNode = nodeId;

      lastNodeOperation.current = "ToggleNode";
      setGraph(({ nodes: oldNodes, edges }) => {
        const thisNode = oldNodes[nodeId];

        notebookRef.current.selectedNode = nodeId;
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        const { nodeRef, userNodeRef } = initNodeStatusChange(nodeId, thisNode.userNodeId);
        const changeNode: any = {
          updatedAt: Timestamp.fromDate(new Date()),
        };
        if (thisNode.open && "openHeight" in thisNode) {
          changeNode.height = thisNode.openHeight;
        } else if ("closedHeight" in thisNode) {
          changeNode.closedHeight = thisNode.closedHeight;
        }

        updateDoc(nodeRef, changeNode);

        updateDoc(userNodeRef, {
          open: !thisNode.open,
          updatedAt: Timestamp.fromDate(new Date()),
        });
        const userNodeLogRef = collection(db, "userNodesLog");
        const userNodeLogData: any = {
          changed: thisNode.changed,
          correct: thisNode.correct,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
          deleted: false,
          isStudied: thisNode.isStudied,
          bookmarked: "bookmarked" in thisNode ? thisNode.bookmarked : false,
          node: nodeId,
          open: !thisNode.open,
          user: user?.uname,
          visible: true,
          wrong: thisNode.wrong,
        };
        if ("openHeight" in thisNode) {
          userNodeLogData.height = thisNode.openHeight;
        } else if ("closedHeight" in thisNode) {
          userNodeLogData.closedHeight = thisNode.closedHeight;
        }

        setDoc(doc(userNodeLogRef), userNodeLogData);

        gtmEvent("Interaction", {
          customType: "NodeCollapse",
        });

        createActionTrack(
          db,
          "NodeCollapse",
          "",
          {
            fullname: `${user?.fName} ${user?.lName}`,
            chooseUname: !!user?.chooseUname,
            uname: String(user?.uname),
            imageUrl: String(user?.imageUrl),
          },
          nodeId,
          []
        );
        return { nodes: oldNodes, edges };
      });

      if (event) {
        event.currentTarget.blur();
      }
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, initNodeStatusChange]
  );

  const openNodePart = useCallback(
    (event: any, nodeId: string, partType: any, openPart: any, setOpenPart: any) => {
      lastNodeOperation.current = partType;
      if (notebookRef.current.choosingNode) return;

      if (partType === "PendingProposals") {
        // TODO: refactor to use only one state to open node options
        return; // HERE we are breakin the code, for now this part is manage by setOpenEditButton, change after refactor
      }
      if (openPart === partType) {
        // is opened, so will close
        setOpenPart(null);
        event.currentTarget.blur();
      } else {
        setOpenPart(partType);
        if (user) {
          const userNodePartsLogRef = collection(db, "userNodePartsLog");
          setDoc(doc(userNodePartsLogRef), {
            nodeId,
            uname: user?.uname,
            partType,
            createdAt: Timestamp.fromDate(new Date()),
          });
        }
        if (
          partType === "Tags" &&
          notebookRef.current.selectionType !== "AcceptedProposals" &&
          notebookRef.current.selectionType !== "Proposals"
        ) {
          // tags;
          setOpenRecentNodes(true);
        }
      }

      processHeightChange(nodeId);
      nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
      notebookRef.current.selectedNode = nodeId;
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user /*selectionType*/, processHeightChange]
  );

  const onNodeShare = useCallback(
    (nodeId: string, platform: string) => {
      gtmEvent("Interaction", {
        customType: "NodeShare",
      });

      createActionTrack(
        db,
        "NodeShare",
        platform,
        {
          fullname: `${user?.fName} ${user?.lName}`,
          chooseUname: !!user?.chooseUname,
          uname: String(user?.uname),
          imageUrl: String(user?.imageUrl),
        },
        nodeId,
        []
      );
    },
    [user]
  );

  const referenceLabelChange = useCallback(
    (newLabel: string, nodeId: string, referenceIdx: number) => {
      devLog("REFERENCE_LABEL_CHANGE", { newLabel, nodeId, referenceIdx });

      setGraph(({ nodes, edges }) => {
        const thisNode = { ...nodes[nodeId] };
        let referenceLabelsCopy = [...thisNode.referenceLabels];
        referenceLabelsCopy[referenceIdx] = newLabel;
        thisNode.referenceLabels = referenceLabelsCopy;
        return {
          nodes: { ...nodes, [nodeId]: thisNode },
          edges,
        };
      });
    },
    [setGraph]
  );

  const markStudied = useCallback(
    (event: any, nodeId: string) => {
      if (notebookRef.current.choosingNode) return;
      setGraph(({ nodes: oldNodes, edges }) => {
        const thisNode = oldNodes[nodeId];
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        notebookRef.current.selectedNode = nodeId;

        const { nodeRef, userNodeRef } = initNodeStatusChange(nodeId, thisNode.userNodeId);
        let studiedNum = 0;
        if ("studied" in thisNode) {
          studiedNum = thisNode.studied;
        }
        const changeNode: any = {
          studied: studiedNum + (thisNode.isStudied ? -1 : 1),
          updatedAt: Timestamp.fromDate(new Date()),
        };
        if (thisNode.open && "openHeight" in thisNode) {
          changeNode.height = thisNode.openHeight;
        } else if ("closedHeight" in thisNode) {
          changeNode.closedHeight = thisNode.closedHeight;
        }
        updateDoc(nodeRef, changeNode);
        updateDoc(userNodeRef, {
          changed: thisNode.isStudied ? thisNode.changed : false,
          isStudied: !thisNode.isStudied,
          updatedAt: Timestamp.fromDate(new Date()),
        });
        const userNodeLogRef = collection(db, "userNodesLog");
        const userNodeLogData: any = {
          correct: thisNode.correct,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
          deleted: false,
          changed: thisNode.isStudied ? thisNode.changed : false,
          isStudied: !thisNode.isStudied,
          bookmarked: "bookmarked" in thisNode ? thisNode.bookmarked : false,
          node: nodeId,
          open: !thisNode.open,
          user: user?.uname,
          visible: true,
          wrong: thisNode.wrong,
        };
        if ("openHeight" in thisNode) {
          userNodeLogData.height = thisNode.openHeight;
        } else if ("closedHeight" in thisNode) {
          userNodeLogData.closedHeight = thisNode.closedHeight;
        }

        if (!thisNode.isStudied) {
          gtmEvent("Interaction", {
            customType: "NodeStudied",
          });

          createActionTrack(
            db,
            "NodeStudied",
            "",
            {
              fullname: `${user?.fName} ${user?.lName}`,
              chooseUname: !!user?.chooseUname,
              uname: String(user?.uname),
              imageUrl: String(user?.imageUrl),
            },
            nodeId,
            []
          );
        }

        setDoc(doc(userNodeLogRef), userNodeLogData);
        return { nodes: oldNodes, edges };
      });
      event.currentTarget.blur();
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, initNodeStatusChange]
  );

  const bookmark = useCallback(
    (event: any, nodeId: string) => {
      if (notebookRef.current.choosingNode) return;
      setGraph(({ nodes: oldNodes, edges }) => {
        const updatedNodeIds: string[] = [];
        updatedNodeIds.push(nodeId);

        const thisNode = oldNodes[nodeId];
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        notebookRef.current.selectedNode = nodeId;

        const { nodeRef, userNodeRef } = initNodeStatusChange(nodeId, thisNode.userNodeId);
        const bookmarks = thisNode.bookmarks || 0;
        const changeNode: any = {
          bookmarks: bookmarks + ("bookmarked" in thisNode && thisNode.bookmarked ? -1 : 1),
          updatedAt: Timestamp.fromDate(new Date()),
        };
        if (thisNode.open && "openHeight" in thisNode) {
          changeNode.height = thisNode.openHeight;
        } else if ("closedHeight" in thisNode) {
          changeNode.closedHeight = thisNode.closedHeight;
        }
        updateDoc(nodeRef, changeNode);
        updateDoc(userNodeRef, {
          bookmarked: "bookmarked" in thisNode ? !thisNode.bookmarked : true,
          updatedAt: Timestamp.fromDate(new Date()),
        });
        const userNodeLogRef = collection(db, "userNodesLog");
        const userNodeLogData: any = {
          changed: thisNode.changed,
          isStudied: thisNode.isStudied,
          correct: thisNode.correct,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
          deleted: false,
          bookmarked: "bookmarked" in thisNode ? !thisNode.bookmarked : true,
          node: nodeId,
          open: !thisNode.open,
          user: user?.uname,
          visible: true,
          wrong: thisNode.wrong,
        };

        if ("openHeight" in thisNode) {
          userNodeLogData.height = thisNode.openHeight;
        } else if ("closedHeight" in thisNode) {
          userNodeLogData.closedHeight = thisNode.closedHeight;
        }
        setDoc(doc(userNodeLogRef), userNodeLogData);

        gtmEvent("Interaction", {
          customType: "NodeBookmark",
        });

        createActionTrack(
          db,
          "NodeBookmark",
          "",
          {
            fullname: `${user?.fName} ${user?.lName}`,
            chooseUname: !!user?.chooseUname,
            uname: String(user?.uname),
            imageUrl: String(user?.imageUrl),
          },
          nodeId,
          []
        );
        setNodeUpdates({
          nodeIds: updatedNodeIds,
          updatedAt: new Date(),
        });
        return { nodes: oldNodes, edges };
      });
      event.currentTarget.blur();
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, initNodeStatusChange]
  );

  const correctNode = useCallback(
    (event: any, nodeId: string) => {
      devLog("CORRECT NODE", { nodeId });
      if (notebookRef.current.choosingNode) return;

      notebookRef.current.selectedNode = nodeId;
      nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });

      getMapGraph(`/correctNode/${nodeId}`).then(() => {
        setNodeParts(nodeId, node => {
          return { ...node, disableVotes: false };
        });
      });
      setNodeParts(nodeId, node => {
        const correct = node.correct;
        const wrong = node.wrong;

        const correctChange = correct ? -1 : 1;
        const wrongChange = !correct && wrong ? -1 : 0;
        const corrects = node.corrects + correctChange;
        const wrongs = node.wrongs + wrongChange;

        generateReputationSignal(db, node, user, correctChange, "Correct", nodeId, setReputationSignal);

        return { ...node, correct: !correct, wrong: false, corrects, wrongs, disableVotes: true };
      });
      event.currentTarget.blur();
    },
    [getMapGraph, setNodeParts, setReputationSignal]
  );

  const wrongNode = useCallback(
    async (
      event: any,
      nodeId: string,
      nodeType: NodeType,
      wrong: any,
      correct: any,
      wrongs: number,
      corrects: number,
      locked: boolean
    ) => {
      if (notebookRef.current.choosingNode) return;

      let deleteOK = true;
      notebookRef.current.selectedNode = nodeId;
      nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });

      const correctChange = !wrong && correct ? -1 : 0;
      const wrongChange = wrong ? -1 : 1;
      const _corrects = corrects + correctChange;
      const _wrongs = wrongs + wrongChange;

      setGraph(graph => {
        const updatedNodeIds: string[] = [nodeId];
        const node = graph.nodes[nodeId];

        const willRemoveNode = doNeedToDeleteNode(_corrects, _wrongs, locked);
        if (willRemoveNode) {
          if (node?.children.length > 0) {
            window.alert(
              "To be able to delete this node, you should first delete its children or move them under other parent node."
            );
            deleteOK = false;
          } else {
            deleteOK = window.confirm("You are going to permanently delete this node by downvoting it. Are you sure?");
          }
        }

        if (!deleteOK) return graph;

        if (node?.locked) return graph;
        generateReputationSignal(db, node, user, wrongChange, "Wrong", nodeId, setReputationSignal);

        let nodes = graph.nodes;
        let edges = graph.edges;

        if (willRemoveNode) {
          edges = removeDagAllEdges(g.current, nodeId, edges, updatedNodeIds);
          nodes = removeDagNode(g.current, nodeId, nodes);

          notebookRef.current.selectedNode = node.parents[0]?.node ?? null;
          updatedNodeIds.push(notebookRef.current.selectedNode!);
          nodeBookDispatch({ type: "setSelectedNode", payload: node.parents[0]?.node ?? null });
        } else {
          nodes[nodeId] = {
            ...node,
            wrong: !wrong,
            correct: false,
            wrongs: _wrongs,
            corrects: _corrects,
            disableVotes: true,
          };
        }

        (async () => {
          try {
            await idToken();
            await getMapGraph(`/wrongNode/${nodeId}`);
          } catch (e) {}

          if (!willRemoveNode) {
            setNodeParts(nodeId, node => {
              return { ...node, disableVotes: false };
            });
          }
        })();

        setNodeUpdates({
          nodeIds: updatedNodeIds,
          updatedAt: new Date(),
        });
        return { nodes, edges };
      });
    },
    [getMapGraph, setNodeParts]
  );

  /////////////////////////////////////////////////////
  // Node Improvement Functions

  /**
   * This function is called only when NODE HIGHT was changed
   */
  const changeNodeHight = useCallback(
    (nodeId: string, height: number) => {
      devLog("CHANGE 🚀", `H:${height.toFixed(1)}, nId:${nodeId}`);
      addTask({ id: nodeId, height });
    },
    [addTask]
  );

  const changeChoice = useCallback(
    (nodeRef: any, nodeId: string, value: string, choiceIdx: number) => {
      devLog("CHANGE CHOICE");

      setNodeParts(nodeId, (thisNode: FullNodeData) => {
        const choices = [...thisNode.choices];
        const choice = { ...choices[choiceIdx] };
        choice.choice = value;
        choices[choiceIdx] = choice;
        thisNode.choices = choices;
        return { ...thisNode };
      });
    },
    [setNodeParts]
  );

  const changeFeedback = useCallback(
    (nodeRef: any, nodeId: string, value: string, choiceIdx: number) => {
      devLog("CHANGE FEEDBACK");
      setNodeParts(nodeId, (thisNode: FullNodeData) => {
        const choices = [...thisNode.choices];
        const choice = { ...choices[choiceIdx] };
        choice.feedback = value;
        choices[choiceIdx] = choice;
        thisNode.choices = choices;
        return { ...thisNode };
      });
    },
    [setNodeParts]
  );

  const switchChoice = useCallback(
    (nodeId: string, choiceIdx: number) => {
      devLog("SWITCH CHOICE");

      setNodeParts(nodeId, (thisNode: FullNodeData) => {
        const choices = [...thisNode.choices];
        const choice = { ...choices[choiceIdx] };
        choice.correct = !choice.correct;
        choices[choiceIdx] = choice;
        thisNode.choices = choices;
        return { ...thisNode };
      });
    },
    [setNodeParts]
  );

  const deleteChoice = useCallback(
    (nodeRef: any, nodeId: string, choiceIdx: number) => {
      devLog("DELETE CHOICE");

      setNodeParts(nodeId, (thisNode: FullNodeData) => {
        const choices = [...thisNode.choices];
        choices.splice(choiceIdx, 1);
        thisNode.choices = choices;
        return { ...thisNode };
      });
    },
    [setNodeParts]
  );

  const addChoice = useCallback(
    (nodeRef: any, nodeId: string) => {
      devLog("ADD CHOICE");

      setNodeParts(nodeId, (thisNode: FullNodeData) => {
        const choices = [...thisNode.choices];
        choices.push({
          choice: "Replace this with the choice.",
          correct: true,
          feedback: "Replace this with the choice-specific feedback.",
        });
        thisNode.choices = choices;
        return { ...thisNode };
      });
    },
    [setNodeParts]
  );

  /////////////////////////////////////////////////////
  // Sidebar Functions

  const closeSideBar = useMemoizedCallback(() => {
    devLog("In closeSideBar");

    // TODO: call closeSidebar every close sidebar action
    if (!user) return;

    if (tempNodes.size || nodeChanges) {
      reloadPermanentGraph();
    }
    let sidebarType: any = nodeBookState.selectionType;
    if (openPendingProposals) {
      sidebarType = "PendingProposals";
    } else if (openChat) {
      sidebarType = "Chat";
    } else if (openNotifications) {
      sidebarType = "Notifications";
    } else if (openPresentations) {
      sidebarType = "Presentations";
      // } else if (openToolbar) {
    } else if (nodeBookState.openToolbar) {
      sidebarType = "UserSettings";
    } else if (openSearch) {
      sidebarType = "Search";
    } else if (openBookmarks) {
      sidebarType = "Bookmarks";
    } else if (openRecentNodes) {
      sidebarType = "RecentNodes";
    } else if (openTrends) {
      sidebarType = "Trends";
    } else if (openMedia) {
      sidebarType = "Media";
    }

    nodeBookDispatch({ type: "setChoosingNode", payload: null });
    nodeBookDispatch({ type: "setChosenNode", payload: null });
    nodeBookDispatch({ type: "setSelectionType", payload: null });
    setSelectedUser(null);
    setOpenPendingProposals(false);
    setOpenChat(false);
    setOpenNotifications(false);
    setOpenPresentations(false);
    nodeBookDispatch({ type: "setOpenToolbar", payload: false });
    setOpenSearch(false);
    setOpenBookmarks(false);
    setOpenRecentNodes(false);
    setOpenTrends(false);
    setOpenMedia(false);
    setOpenProposal("");
    if (
      nodeBookState.selectedNode &&
      nodeBookState.selectedNode !== "" &&
      g.current.hasNode(nodeBookState.selectedNode)
    ) {
      scrollToNode(nodeBookState.selectedNode);
    }

    const userClosedSidebarLogRef = collection(db, "userClosedSidebarLog");
    setDoc(doc(userClosedSidebarLogRef), {
      uname: user.uname,
      sidebarType,
      createdAt: Timestamp.fromDate(new Date()),
    });
  }, [
    user,
    graph.nodes,
    nodeBookState.selectedNode,
    nodeBookState.selectionType,
    openPendingProposals,
    openChat,
    openNotifications,
    openPresentations,
    nodeBookState.openToolbar,
    openSearch,
    openBookmarks,
    openRecentNodes,
    openTrends,
    openMedia,
    reloadPermanentGraph,
  ]);

  /////////////////////////////////////////////////////
  // Proposals Functions

  const proposeNodeImprovement = useCallback(
    (event: any, nodeId: string = "") => {
      devLog("PROPOSE_NODE_IMPROVEMENT", nodeId);
      // event.preventDefault();
      const selectedNode = nodeId || notebookRef.current.selectedNode;
      if (!selectedNode) return;
      setOpenProposal("ProposeEditTo" + selectedNode);
      reloadPermanentGraph();

      setGraph(({ nodes: oldNodes, edges }) => {
        if (!selectedNode) return { nodes: oldNodes, edges };

        if (!(selectedNode in changedNodes)) {
          changedNodes[selectedNode] = copyNode(oldNodes[selectedNode]);
        }
        const thisNode = { ...oldNodes[selectedNode] };
        thisNode.editable = true;
        const newNodes = {
          ...oldNodes,
          [selectedNode]: thisNode,
        };
        return { nodes: newNodes, edges };
      });
      setNodeUpdates({
        nodeIds: [selectedNode],
        updatedAt: new Date(),
      });
      processHeightChange(nodeId);
      //setOpenSidebar(null);
      scrollToNode(selectedNode);
    },
    [processHeightChange, reloadPermanentGraph, scrollToNode]
  );

  const selectNode = useCallback(
    (event: any, nodeId: string, chosenType: any, nodeType: any) => {
      devLog("SELECT_NODE", {
        choosingNode: notebookRef.current.choosingNode,
        nodeId,
        chosenType,
        nodeType,
        openSidebar,
      });
      if (notebookRef.current.choosingNode) return;

      if (
        notebookRef.current.selectionType === "AcceptedProposals" ||
        notebookRef.current.selectionType === "Proposals"
      ) {
        reloadPermanentGraph();
      }

      if (chosenType === "Proposals") {
        if (openSidebar === "PROPOSALS" && nodeId === notebookRef.current.selectedNode) {
          setOpenSidebar(null);
        } else {
          setOpenSidebar("PROPOSALS");
          setSelectedNodeType(nodeType);
          notebookRef.current.selectionType = chosenType;
          notebookRef.current.selectedNode = nodeId;
          nodeBookDispatch({ type: "setSelectionType", payload: chosenType });
          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        }
        return;
      }

      if (chosenType === "Citations") {
        if (openSidebar === "CITATIONS") {
          setOpenSidebar(null);
          return;
        }
        setOpenSidebar("CITATIONS");
        setSelectedNodeType(nodeType);
        notebookRef.current.selectionType = chosenType;
        notebookRef.current.selectedNode = nodeId;
        nodeBookDispatch({ type: "setSelectionType", payload: chosenType });
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        return;
      }

      if (notebookRef.current.selectedNode === nodeId && notebookRef.current.selectionType === chosenType) {
        notebookRef.current.selectionType = null;
        nodeBookDispatch({ type: "setSelectionType", payload: null });
        setSelectedNodeType(null);
        setOpenPendingProposals(false);
        setOpenChat(false);
        setOpenNotifications(false);
        notebookRef.current.openToolbar = false;
        nodeBookDispatch({ type: "setOpenToolbar", payload: false });
        setOpenSearch(false);
        setOpenRecentNodes(false);
        setOpenTrends(false);
        setOpenMedia(false);
        resetAddedRemovedParentsChildren();
        setOpenSidebar(null);
        event.currentTarget.blur();
      } else {
        setOpenSidebar("PROPOSALS");
        setSelectedNodeType(nodeType);
        notebookRef.current.selectionType = chosenType;
        notebookRef.current.selectedNode = nodeId;
        nodeBookDispatch({ type: "setSelectionType", payload: chosenType });
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
      }
    },
    [reloadPermanentGraph, openSidebar, resetAddedRemovedParentsChildren]
  );

  const saveProposedImprovement = useCallback(
    (summary: any, reason: any, onFail: any) => {
      if (!notebookRef.current.selectedNode) return;

      notebookRef.current.chosenNode = null;
      notebookRef.current.choosingNode = null;
      nodeBookDispatch({ type: "setChosenNode", payload: null });
      nodeBookDispatch({ type: "setChoosingNode", payload: null });
      let referencesOK = true;

      setUpdatedLinks(updatedLinks => {
        setGraph(graph => {
          const selectedNodeId = notebookRef.current.selectedNode!;
          const updatedNodeIds: string[] = [selectedNodeId];

          if (
            (graph.nodes[selectedNodeId].nodeType === "Concept" ||
              graph.nodes[selectedNodeId].nodeType === "Relation" ||
              graph.nodes[selectedNodeId].nodeType === "Question" ||
              graph.nodes[selectedNodeId].nodeType === "News") &&
            graph.nodes[selectedNodeId].references.length === 0
          ) {
            referencesOK = window.confirm("You are proposing a node without any reference. Are you sure?");
          }

          if (!referencesOK) return graph;

          gtmEvent("Propose", {
            customType: "improvement",
          });
          gtmEvent("Interaction", {
            customType: "improvement",
          });
          gtmEvent("Reputation", {
            value: 1,
          });

          const newNode = { ...graph.nodes[selectedNodeId] };
          if (newNode.children.length > 0) {
            const newChildren = [];
            for (let child of newNode.children) {
              newChildren.push({
                node: child.node,
                title: child.title,
                label: child.label,
                type: child.type,
              });
            }
            newNode.children = newChildren;
            const newParents = [];
            for (let parent of newNode.parents) {
              newParents.push({
                node: parent.node,
                title: parent.title,
                label: parent.label,
                type: parent.type,
              });
            }
            newNode.parents = newParents;
          }
          const keyFound = changedNodes.hasOwnProperty(selectedNodeId);
          if (!keyFound) return graph;

          const oldNode = changedNodes[selectedNodeId] as FullNodeData;
          let isTheSame =
            newNode.title === oldNode.title &&
            newNode.content === oldNode.content &&
            newNode.nodeType === oldNode.nodeType;
          isTheSame = isTheSame && compareProperty(oldNode, newNode, "nodeImage");
          if (
            ("nodeVideo" in oldNode && "nodeVideo" in newNode) ||
            (!("nodeVideo" in oldNode) && newNode["nodeVideo"] !== "")
          ) {
            isTheSame = isTheSame && compareProperty(oldNode, newNode, "nodeVideo");
          }
          isTheSame = compareFlatLinks(oldNode.tagIds, newNode.tagIds, isTheSame); // CHECK: O checked only ID changes
          isTheSame = compareFlatLinks(oldNode.referenceIds, newNode.referenceIds, isTheSame); // CHECK: O checked only ID changes
          isTheSame = compareLinks(oldNode.parents, newNode.parents, isTheSame, false);
          isTheSame = compareLinks(oldNode.children, newNode.children, isTheSame, false);
          isTheSame = compareFlatLinks(oldNode.referenceLabels, newNode.referenceLabels, isTheSame);

          isTheSame = compareChoices(oldNode, newNode, isTheSame);
          if (isTheSame) {
            onFail();
            setTimeout(() => {
              window.alert("You've not changed anything yet!");
            });
            return graph;
          }

          const postData: any = {
            ...newNode,
            id: notebookRef.current.selectedNode,
            summary: summary,
            proposal: reason,
            addedParents: updatedLinks.addedParents,
            addedChildren: updatedLinks.addedChildren,
            removedParents: updatedLinks.removedParents,
            removedChildren: updatedLinks.removedChildren,
          };
          delete postData.isStudied;
          delete postData.bookmarked;
          delete postData.correct;
          delete postData.updatedAt;
          delete postData.open;
          delete postData.visible;
          delete postData.deleted;
          delete postData.wrong;
          delete postData.createdAt;
          delete postData.firstVisit;
          delete postData.lastVisit;
          delete postData.versions;
          delete postData.viewers;
          delete postData.comments;
          delete postData.wrongs;
          delete postData.corrects;
          delete postData.studied;
          delete postData.editable;
          delete postData.left;
          delete postData.top;
          delete postData.height;

          const willBeApproved = isVersionApproved({ corrects: 1, wrongs: 0, nodeData: newNode });

          if (willBeApproved) {
            const newParentIds: string[] = newNode.parents.map(parent => parent.node);
            const newChildIds: string[] = newNode.children.map(child => child.node);
            const oldParentIds: string[] = oldNode.parents.map(parent => parent.node);
            const oldChildIds: string[] = oldNode.children.map(child => child.node);
            const idsToBeRemoved = Array.from(
              new Set<string>([
                ...newParentIds,
                ...newChildIds,
                notebookRef.current.selectedNode!,
                ...oldParentIds,
                ...oldChildIds,
              ])
            );
            idsToBeRemoved.forEach(idToBeRemoved => {
              if (changedNodes.hasOwnProperty(idToBeRemoved)) {
                delete changedNodes[idToBeRemoved];
              }
            });
          }

          const nodes = {
            ...graph.nodes,
            [selectedNodeId]: {
              ...graph.nodes[selectedNodeId],
              editable: false,
            },
          };

          getMapGraph("/proposeNodeImprovement", postData, !willBeApproved);

          setTimeout(() => {
            scrollToNode(selectedNodeId);
          }, 200);

          setNodeUpdates({
            nodeIds: updatedNodeIds,
            updatedAt: new Date(),
          });

          return {
            nodes,
            edges: graph.edges,
          };
        });

        return updatedLinks;
      });
    },
    [isPlayingTheTutorialRef, nodeBookDispatch, getMapGraph, scrollToNode]
  );

  const proposeNewChild = useCallback(
    (event: any, childNodeType: string) => {
      // TODO: add types ChildNodeType
      if (!user) return;

      devLog("PROPOSE_NEW_CHILD", { childNodeType });
      event && event.preventDefault();
      setOpenProposal("ProposeNew" + childNodeType + "ChildNode");
      reloadPermanentGraph();
      const newNodeId = newId(db);
      setGraph(graph => {
        const updatedNodeIds: string[] = [];

        const { nodes: oldNodes, edges } = graph;
        const selectedNodeId = notebookRef.current.selectedNode!;
        if (!selectedNodeId) return graph; // CHECK: I added this to validate

        if (!(selectedNodeId in changedNodes)) {
          changedNodes[selectedNodeId] = copyNode(oldNodes[selectedNodeId]);
        }
        if (!tempNodes.has(newNodeId)) {
          tempNodes.add(newNodeId);
        }
        const thisNode = copyNode(oldNodes[selectedNodeId]);

        const newChildNode: any = {
          isStudied: true,
          bookmarked: false,
          isNew: true,
          correct: true,
          updatedAt: new Date(),
          open: true,
          user: user.uname,
          visible: true,
          deleted: false,
          wrong: false,
          createdAt: new Date(),
          firstVisit: new Date(),
          lastVisit: new Date(),
          versions: 1,
          viewers: 1,
          children: [],
          nodeType: childNodeType,
          parents: [{ node: selectedNodeId, label: "", title: thisNode.title, type: thisNode.nodeType }],
          comments: 0,
          tags: thisNode.tags.filter(tag => tag === user.tag).length > 0 ? thisNode.tags : [...thisNode.tags, user.tag],
          tagIds:
            thisNode.tagIds.filter(tagId => tagId === user.tagId).length > 0
              ? thisNode.tagIds
              : [...thisNode.tagIds, user.tagId],
          title: "",
          wrongs: 0,
          corrects: 1,
          content: "",
          nodeImage: "",
          studied: 1,
          references: [],
          referenceIds: [],
          referenceLabels: [],
          choices: [],
          editable: true,
          width: NODE_WIDTH,
          node: newNodeId,
          left: thisNode.left + NODE_WIDTH + COLUMN_GAP,
          top: thisNode.top,
        };
        if (childNodeType === "Question") {
          newChildNode.choices = [
            {
              choice: "Replace this with the choice.",
              correct: true,
              feedback: "Replace this with the choice-specific feedback.",
            },
          ];
        }

        const newNodes = setDagNode(
          g.current,
          newNodeId,
          newChildNode,
          { ...oldNodes },
          { ...allTags },
          settings.showClusterOptions,
          () => {}
        );
        if (!selectedNodeId) return { nodes: newNodes, edges };
        const newEdges = setDagEdge(g.current, selectedNodeId, newNodeId, { label: "" }, { ...edges });
        updatedNodeIds.push(selectedNodeId, newNodeId);

        console.log("willupdateselectedNode");
        notebookRef.current.selectedNode = newNodeId;
        nodeBookDispatch({ type: "setSelectedNode", payload: newNodeId });
        setTimeout(() => {
          scrollToNode(newNodeId);
        }, 3500);

        setNodeUpdates({
          nodeIds: updatedNodeIds,
          updatedAt: new Date(),
        });
        return { nodes: newNodes, edges: newEdges };
      });
    },
    [user, reloadPermanentGraph, db, allTags, settings.showClusterOptions, nodeBookDispatch, scrollToNode]
  );

  const onNodeTitleBlur = useCallback(async (newTitle: string) => {
    setOpenSidebar("SEARCHER_SIDEBAR");

    notebookRef.current.nodeTitleBlured = true;
    notebookRef.current.searchQuery = newTitle;
    nodeBookDispatch({ type: "setNodeTitleBlured", payload: true });
    nodeBookDispatch({ type: "setSearchQuery", payload: newTitle });
  }, []);

  const saveProposedChildNode = useCallback(
    (newNodeId: string, summary: string, reason: string, onComplete: () => void) => {
      devLog("save Proposed Child Node", { newNodeId, summary, reason });

      notebookRef.current.choosingNode = null;
      notebookRef.current.chosenNode = null;
      nodeBookDispatch({ type: "setChoosingNode", payload: null });
      nodeBookDispatch({ type: "setChosenNode", payload: null });

      setGraph(graph => {
        const updatedNodeIds: string[] = [newNodeId];
        const newNode = graph.nodes[newNodeId];

        if (!newNode.title) {
          console.error("title required");
          return graph;
        }

        if (newNode.nodeType === "Question" && !Boolean(newNode.choices.length)) {
          console.error("choices required");
          return graph;
        }

        if (!newNodeId) {
          return graph;
        }

        let referencesOK = true;
        if (
          (newNode.nodeType === "Concept" ||
            newNode.nodeType === "Relation" ||
            newNode.nodeType === "Question" ||
            newNode.nodeType === "News") &&
          newNode.references.length === 0
        ) {
          referencesOK = window.confirm("You are proposing a node without citing any reference. Are you sure?");
        }

        if (!referencesOK) {
          return graph;
        }

        if (newNode.tags.length == 0) {
          setTimeout(() => {
            window.alert("Please add relevant tag(s) to your proposed node.");
          });
          return graph;
        }

        if (newNode.title === "" || newNode.title === "Replace this new node title!") return graph;

        gtmEvent("Propose", {
          customType: "newChild",
        });
        gtmEvent("Interaction", {
          customType: "newChild",
        });
        gtmEvent("Reputation", {
          value: 1,
        });

        let { nodes, edges } = graph;

        const postData: any = {
          ...newNode,
          parentId: newNode.parents[0].node,
          parentType: graph.nodes[newNode.parents[0].node].nodeType,
          summary: summary,
          proposal: reason,
          versionNodeId: newNodeId,
        };
        delete postData.isStudied;
        delete postData.bookmarked;
        delete postData.isNew;
        delete postData.correct;
        delete postData.updatedAt;
        delete postData.open;
        delete postData.visible;
        delete postData.deleted;
        delete postData.wrong;
        delete postData.createdAt;
        delete postData.firstVisit;
        delete postData.lastVisit;
        delete postData.versions;
        delete postData.viewers;
        delete postData.comments;
        delete postData.wrongs;
        delete postData.corrects;
        delete postData.studied;
        delete postData.editable;
        delete postData.left;
        delete postData.top;
        delete postData.height;

        const parentNode = graph.nodes[newNode.parents[0].node];
        const willBeApproved = isVersionApproved({ corrects: 1, wrongs: 0, nodeData: parentNode });

        const nodePartChanges = {
          editable: false,
          unaccepted: true,
          simulated: false,
        };
        // if version is approved from simulation then remove it from changedNodes and tempNodes
        if (willBeApproved) {
          if (tempNodes.has(newNodeId)) {
            tempNodes.delete(newNodeId);
          }
          if (changedNodes.hasOwnProperty(newNode.parents[0].node)) {
            delete changedNodes[newNode.parents[0].node];
          }
          nodePartChanges.unaccepted = false;
          nodePartChanges.simulated = true;
        }

        nodes = { ...nodes, [newNodeId]: { ...nodes[newNodeId], changedAt: new Date(), ...nodePartChanges } };

        getMapGraph("/proposeChildNode", postData, !willBeApproved);
        scrollToNode(newNodeId);

        setTimeout(() => {
          onComplete();
        }, 200);
        setNodeUpdates({
          nodeIds: updatedNodeIds,
          updatedAt: new Date(),
        });
        return { nodes, edges };
      });
    },
    [setGraph, getMapGraph]
  );

  const fetchProposals = useCallback(
    async (
      setIsAdmin: (value: boolean) => void,
      setIsRetrieving: (value: boolean) => void,
      setProposals: (value: any) => void
    ) => {
      if (!user) return;
      if (!selectedNodeType) return;

      setGraph(({ nodes: oldNodes, edges }) => {
        (async () => {
          setIsRetrieving(true);
          if (nodeBookState.selectedNode && nodeBookState.selectedNode in oldNodes) {
            setIsAdmin(oldNodes[nodeBookState.selectedNode].admin === user.uname);
          }

          const currentNode = oldNodes[String(nodeBookState.selectedNode)];
          if (!currentNode) return;

          const nodeTypes: INodeType[] = getNodeTypesFromNode(currentNode as any);

          const versions: any = {};
          let versionId;
          const versionIds: string[] = [];
          const comments: any = {};
          const userVersionsRefs: Query<DocumentData>[] = [];
          const versionsCommentsRefs: Query<DocumentData>[] = [];
          const userVersionsCommentsRefs: Query<DocumentData>[] = [];

          for (const nodeType of nodeTypes) {
            const { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl } =
              getTypedCollections(db, nodeType);

            if (!versionsColl || !userVersionsColl || !versionsCommentsColl || !userVersionsCommentsColl) continue;

            const versionsQuery = query(
              versionsColl,
              where("node", "==", nodeBookState.selectedNode),
              where("deleted", "==", false)
            );

            const versionsData = await getDocs(versionsQuery);

            // iterate version and push userVersion and versionComments
            versionsData.forEach(versionDoc => {
              versionIds.push(versionDoc.id);
              const versionData = versionDoc.data();

              versions[versionDoc.id] = {
                ...versionData,
                nodeType,
                id: versionDoc.id,
                createdAt: versionData.createdAt.toDate(),
                award: false,
                correct: false,
                wrong: false,
                comments: [],
              };
              delete versions[versionDoc.id].deleted;
              delete versions[versionDoc.id].updatedAt;
              delete versions[versionDoc.id].node;
              const userVersionsQuery = query(
                userVersionsColl,
                where("version", "==", versionDoc.id),
                where("user", "==", user.uname)
              );
              userVersionsRefs.push(userVersionsQuery);
              const versionsCommentsQuery = query(
                versionsCommentsColl,
                where("version", "==", versionDoc.id),
                where("deleted", "==", false)
              );
              versionsCommentsRefs.push(versionsCommentsQuery);
            });

            // merge version and userVersion: version[id] = {...version[id],userVersion}
            if (userVersionsRefs.length > 0) {
              await Promise.all(
                userVersionsRefs.map(async userVersionsRef => {
                  const userVersionsDocs = await getDocs(userVersionsRef);
                  userVersionsDocs.forEach(userVersionsDoc => {
                    const userVersion = userVersionsDoc.data();
                    versionId = userVersion.version;
                    delete userVersion.version;
                    delete userVersion.updatedAt;
                    delete userVersion.createdAt;
                    delete userVersion.user;
                    if (userVersion.hasOwnProperty("id")) {
                      delete userVersion.id;
                    }
                    versions[versionId] = {
                      ...versions[versionId],
                      ...userVersion,
                    };
                  });
                })
              );
            }

            // build version comments {}
            if (versionsCommentsRefs.length > 0) {
              await Promise.all(
                versionsCommentsRefs.map(async versionsCommentsRef => {
                  const versionsCommentsDocs = await getDocs(versionsCommentsRef);
                  versionsCommentsDocs.forEach(versionsCommentsDoc => {
                    const versionsComment = versionsCommentsDoc.data();
                    delete versionsComment.updatedAt;
                    comments[versionsCommentsDoc.id] = {
                      ...versionsComment,
                      id: versionsCommentsDoc.id,
                      createdAt: versionsComment.createdAt.toDate(),
                    };
                    const userVersionsCommentsQuery = query(
                      userVersionsCommentsColl,
                      where("versionComment", "==", versionsCommentsDoc.id),
                      where("user", "==", user.uname)
                    );

                    userVersionsCommentsRefs.push(userVersionsCommentsQuery);
                  });
                })
              );

              // merge comments and userVersionComment
              if (userVersionsCommentsRefs.length > 0) {
                await Promise.all(
                  userVersionsCommentsRefs.map(async userVersionsCommentsRef => {
                    const userVersionsCommentsDocs = await getDocs(userVersionsCommentsRef);
                    userVersionsCommentsDocs.forEach(userVersionsCommentsDoc => {
                      const userVersionsComment = userVersionsCommentsDoc.data();
                      const versionCommentId = userVersionsComment.versionComment;
                      delete userVersionsComment.versionComment;
                      delete userVersionsComment.updatedAt;
                      delete userVersionsComment.createdAt;
                      delete userVersionsComment.user;
                      comments[versionCommentId] = {
                        ...comments[versionCommentId],
                        ...userVersionsComment,
                      };
                    });
                  })
                );
              }
            }

            // merge comments into versions
            Object.values(comments).forEach((comment: any) => {
              versionId = comment.version;
              delete comment.version;
              versions[versionId].comments.push(comment);
            });
          }

          const proposalsTemp = Object.values(versions);
          const orderedProposals = proposalsTemp.sort(
            (a: any, b: any) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
          );
          setProposals(orderedProposals);
          setIsRetrieving(false);
        })();

        return { nodes: oldNodes, edges };
      });
    },
    [user, selectedNodeType, db, nodeBookState.selectedNode]
  );

  /////////////////////////////////////////////////////
  // Inner functions
  const selectProposal = useMemoizedCallback(
    (event, proposal, newNodeId: string) => {
      if (proposalTimer.current) {
        clearTimeout(proposalTimer.current);
      }
      proposalTimer.current = setTimeout(() => {
        if (!proposal) {
          setOpenProposal("");
          reloadPermanentGraph();
          return;
        }
        devLog("SELECT PROPOSAL", { proposal });
        if (!user?.uname) return;
        event.preventDefault();
        setOpenProposal(proposal.id);
        reloadPermanentGraph();

        const updatedNodeIds: string[] = [nodeBookState.selectedNode!, newNodeId];
        setGraph(({ nodes: oldNodes, edges }) => {
          if (!nodeBookState.selectedNode) return { nodes: oldNodes, edges };
          if (!(nodeBookState.selectedNode in changedNodes)) {
            changedNodes[nodeBookState.selectedNode] = copyNode(oldNodes[nodeBookState.selectedNode]);
          }
          const thisNode = copyNode(oldNodes[nodeBookState.selectedNode]);
          if ("childType" in proposal && proposal.childType !== "") {
            tempNodes.add(newNodeId);
            const newChildNode: any = {
              unaccepted: true,
              isStudied: false,
              bookmarked: false,
              correct: false,
              updatedAt: proposal.createdAt,
              open: true,
              user: user.uname,
              admin: proposal.proposer,
              aImgUrl: proposal.imageUrl,
              aChooseUname: proposal.chooseUname,
              aFullname: proposal.fullname,
              visible: true,
              deleted: false,
              wrong: false,
              changedAt: proposal.createdAt,
              createdAt: proposal.createdAt,
              firstVisit: proposal.createdAt,
              lastVisit: proposal.createdAt,
              versions: 1,
              viewers: 1,
              children: proposal.children,
              nodeType: proposal.childType,
              parents: proposal.parents,
              comments: 0,
              tagIds: proposal.tagIds,
              tags: proposal.tags,
              referenceIds: proposal.referenceIds,
              referenceLabels: proposal.referenceLabels,
              references: proposal.references,
              title: proposal.title,
              wrongs: 0,
              corrects: 1,
              content: proposal.content,
              nodeImage: proposal.nodeImage,
              nodeVideo: proposal.nodeVideo,
              videoStartTime: proposal.nodeVideoStartTime,
              videoEndTime: proposal.nodeVideoEndTime,
              studied: 1,
              choices: [],
              // If we define it as false, then the users will be able to up/down vote on unaccepted proposed nodes!
              editable: false,
              width: NODE_WIDTH,
              node: newNodeId,
              simulated: true,
            };
            if (proposal.childType === "Question") {
              newChildNode.choices = proposal.choices;
            }
            let newNodes = { ...oldNodes };
            let newEdges: any = { ...edges };
            const nodeN = g.current.node(newNodeId);
            // ------------------- this is required to simulate pure function
            if (!nodeN) {
              newNodes = setDagNode(
                g.current,
                newNodeId,
                newChildNode,
                newNodes,
                allTags,
                settings.showClusterOptions,
                null
              );
              newEdges = setDagEdge(g.current, nodeBookState.selectedNode, newNodeId, { label: "" }, { ...newEdges });
            } else {
              const newNode = copyNode(newChildNode);
              newNodes[newNodeId] = newNode;

              const from = nodeBookState.selectedNode;
              const to = newNodeId;
              if (g.current.hasNode(from) && g.current.hasNode(to)) {
                const edgeId = from + "-" + to;
                newEdges[edgeId] = { label: "" };
              }
            }
            setTimeout(() => {
              scrollToNode(newNodeId);
            }, 1500);
            return { nodes: newNodes, edges: newEdges };
          } else {
            // here builds the proposal
            const oldEdges = compareAndUpdateNodeLinks(
              g.current,
              thisNode,
              nodeBookState.selectedNode,
              proposal,
              edges
            );
            thisNode.nodeType = proposal.nodeType || thisNode.nodeType;
            thisNode.title = proposal.title;
            thisNode.content = proposal.content;
            thisNode.nodeVideo = proposal.nodeVideo;
            thisNode.nodeVideoStartTime = proposal.nodeVideoStartTime;
            thisNode.nodeVideoEndTime = proposal.nodeVideoEndTime;
            thisNode.nodeImage = proposal.nodeImage;
            thisNode.references = proposal.references;
            thisNode.children = proposal.children;
            thisNode.parents = proposal.parents;
            thisNode.tags = proposal.tags;
            if (proposal.nodeType === "Question") {
              thisNode.choices = proposal.choices;
            }
            const newNodes = setDagNode(
              g.current,
              nodeBookState.selectedNode,
              thisNode,
              oldNodes,
              allTags,
              settings.showClusterOptions,
              null
            );
            return { nodes: newNodes, edges: oldEdges };
          }
        });

        setTimeout(() => {
          setNodeUpdates({
            nodeIds: updatedNodeIds,
            updatedAt: new Date(),
          });
        }, 200);
        if (nodeBookState.selectedNode) scrollToNode(nodeBookState.selectedNode);
      }, 1000);
    },
    [user?.uname, nodeBookState.selectedNode, allTags, reloadPermanentGraph, settings.showClusterOptions]
  );

  const deleteProposal = useCallback(
    async (event: any, proposals: any, setProposals: any, proposalId: string, proposalIdx: number) => {
      if (!nodeBookState.choosingNode) {
        if (!nodeBookState.selectedNode) return;
        reloadPermanentGraph();
        const postData = {
          versionId: proposalId,
          nodeType: selectedNodeType,
          nodeId: nodeBookState.selectedNode,
        };
        // setIsSubmitting(true);
        await postWithToken("/deleteVersion", postData);

        let proposalsTemp = [...proposals];
        proposalsTemp.splice(proposalIdx, 1);
        setProposals(proposalsTemp);
        // setIsSubmitting(false);
        scrollToNode(nodeBookState.selectedNode);
      }
    },
    [nodeBookState.choosingNode, nodeBookState.selectedNode, reloadPermanentGraph, scrollToNode, selectedNodeType]
  );
  const mapContentMouseOver = useCallback((event: any) => {
    if (event.target?.parentNode?.parentNode?.getAttribute("id") !== "MapContent") {
      setMapHovered(true);
    } else {
      setMapHovered(false);
    }
  }, []);

  const onMouseClick = useCallback((e: any) => {
    if (e.button !== 1) return; // is not mouse well

    e.preventDefault();
  }, []);

  const uploadNodeImage = useCallback(
    (
      event: any,
      nodeRef: any,
      nodeId: string,
      isUploading: boolean,
      setIsUploading: any,
      setPercentageUploaded: any
    ) => {
      if (!user) return;

      devLog("UPLOAD NODE IMAGES", { nodeId, isUploading, setIsUploading, setPercentageUploaded });
      const storage = getStorage();
      if (isUploading || notebookRef.current.choosingNode) return;

      try {
        event.preventDefault();
        const image = event.target.files[0];
        if (
          image.type !== "image/jpg" &&
          image.type !== "image/jpeg" &&
          image.type !== "image/gif" &&
          image.type !== "image/png"
        ) {
          alert("We only accept JPG, JPEG, PNG, or GIF images. Please upload another image.");
        } else {
          let userName = prompt(
            "Type your full name below to consent that you have all the rights to upload this image and the image does not violate any laws."
          );
          if (userName != `${user?.fName} ${user?.lName}`) {
            alert("Entered full name is not correct");
            return;
          }
          setIsSubmitting(true);
          setIsUploading(true);

          let bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? "onecademy-dev.appspot.com";
          if (isValidHttpUrl(bucket)) {
            const { hostname } = new URL(bucket);
            bucket = hostname;
          }
          const rootURL = "https://storage.googleapis.com/" + bucket + "/";
          const picturesFolder = rootURL + "UploadedImages/";
          const imageNameSplit = image.name.split(".");
          const imageExtension = imageNameSplit[imageNameSplit.length - 1];
          let imageFileName = user.userId + "/" + new Date().toUTCString() + "." + imageExtension;

          const storageRef = ref(storage, picturesFolder + imageFileName);

          const task = uploadBytesResumable(storageRef, image);
          task.on(
            "state_changed",
            function progress(snapshot: any) {
              setPercentageUploaded(Math.ceil((100 * snapshot.bytesTransferred) / snapshot.totalBytes));
            },
            function error(err: any) {
              console.error("Image Upload Error: ", err);
              setIsSubmitting(false);
              setIsUploading(false);
              alert(
                "There is an error with uploading your image. Please upload it again! If the problem persists, please try another image."
              );
            },
            async function complete() {
              const imageGeneratedUrl = await getDownloadURL(storageRef);
              const imageUrlFixed = addSuffixToUrlGMT(imageGeneratedUrl, "_430x1300");
              setIsSubmitting(false);
              setIsUploading(false);
              await imageLoaded(imageUrlFixed);
              if (imageUrlFixed && imageUrlFixed !== "") {
                setNodeParts(nodeId, (thisNode: any) => {
                  thisNode.nodeImage = imageUrlFixed;
                  return { ...thisNode };
                });
              }
              setPercentageUploaded(100);
            }
          );
        }
      } catch (err) {
        console.error("Image Upload Error: ", err);
        setIsUploading(false);
        setIsSubmitting(false);
      }
    },
    [user, setNodeParts]
  );

  const rateProposal = useCallback(
    async (
      e: any,
      proposals: any,
      setProposals: any,
      proposalId: string,
      proposalIdx: number,
      correct: any,
      wrong: any,
      award: any,
      newNodeId: string
    ) => {
      devLog("RATE PROPOSAL", { proposals, setProposals, proposalId, proposalIdx, correct, wrong, award, newNodeId });

      if (!user) return;

      if (!nodeBookState.choosingNode) {
        const proposalsTemp = [...proposals];
        let interactionValue = 0;
        let voteType: string = "";
        if (correct) {
          interactionValue += proposalsTemp[proposalIdx].correct ? -1 : 1;
          if (!proposalsTemp[proposalIdx].correct) {
            voteType = "Correct";
          }
          proposalsTemp[proposalIdx].wrongs += proposalsTemp[proposalIdx].wrong ? -1 : 0;
          proposalsTemp[proposalIdx].wrong = false;
          proposalsTemp[proposalIdx].corrects += proposalsTemp[proposalIdx].correct ? -1 : 1;
          proposalsTemp[proposalIdx].correct = !proposalsTemp[proposalIdx].correct;
        } else if (wrong) {
          if (!proposalsTemp[proposalIdx].wrong) {
            voteType = "Wrong";
          }
          interactionValue += proposalsTemp[proposalIdx].wrong ? 1 : -1;
          proposalsTemp[proposalIdx].corrects += proposalsTemp[proposalIdx].correct ? -1 : 0;
          proposalsTemp[proposalIdx].correct = false;
          proposalsTemp[proposalIdx].wrongs += proposalsTemp[proposalIdx].wrong ? -1 : 1;
          proposalsTemp[proposalIdx].wrong = !proposalsTemp[proposalIdx].wrong;
        } else if (award) {
          if (!proposalsTemp[proposalIdx].award) {
            voteType = "Award";
          }
          interactionValue += proposalsTemp[proposalIdx].award ? -1 : 1;
          proposalsTemp[proposalIdx].awards += proposalsTemp[proposalIdx].award ? -1 : 1;
          proposalsTemp[proposalIdx].award = !proposalsTemp[proposalIdx].award;
        }

        if (voteType) {
          gtmEvent("Interaction", {
            customType: "RateVersion",
            subType: voteType,
          });
        }

        if (interactionValue) {
          gtmEvent("Reputation", {
            value: interactionValue,
          });
        }

        const postData = {
          versionId: proposalId,
          nodeType: selectedNodeType,
          nodeId: nodeBookState.selectedNode,
          correct,
          wrong,
          award,
          uname: user.uname,
          versionNodeId: newNodeId,
        };
        try {
          Post("/rateVersion", postData);
        } catch (error) {
          console.error(error);
        }
        const updatedNodeIds: string[] = [nodeBookState.selectedNode!, newNodeId];
        setGraph(({ nodes: oldNodes, edges }) => {
          if (!nodeBookState.selectedNode) return { nodes: oldNodes, edges };
          if (
            isVersionApproved({
              corrects: proposalsTemp[proposalIdx].corrects,
              wrongs: proposalsTemp[proposalIdx].wrongs,
              nodeData: oldNodes[nodeBookState.selectedNode],
            })
          ) {
            proposalsTemp[proposalIdx].accepted = true;
            if (changedNodes.hasOwnProperty(nodeBookState.selectedNode)) {
              delete changedNodes[nodeBookState.selectedNode];
            }
            if ("childType" in proposalsTemp[proposalIdx] && proposalsTemp[proposalIdx].childType !== "") {
              oldNodes[newNodeId] = { ...oldNodes[newNodeId], unaccepted: false, simulated: true };
              if (tempNodes.has(newNodeId)) {
                tempNodes.delete(newNodeId);
              }
            }
          }
          setProposals(proposalsTemp);
          return { nodes: oldNodes, edges };
        });
        setNodeUpdates({
          nodeIds: updatedNodeIds,
          updatedAt: new Date(),
        });
      }
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, nodeBookState, selectedNodeType, reloadPermanentGraph]
  );
  const removeImage = useCallback(
    (nodeRef: any, nodeId: string) => {
      setNodeParts(nodeId, (thisNode: any) => {
        thisNode.nodeImage = "";
        return { ...thisNode };
      });
    },
    [setNodeParts]
  );

  const edgeIds = Object.keys(graph.edges);

  const navigateWhenNotScrolling = (newMapInteractionValue: any) => {
    if (!scrollToNodeInitialized.current) {
      return setMapInteractionValue(newMapInteractionValue);
    }
  };

  const onOpenSideBar = (sidebar: OpenSidebar) => {
    setOpenSidebar(sidebar);
  };

  // this method was required to cleanup editor added, removed child and parent list
  const cleanEditorLink = useCallback(() => {
    setUpdatedLinks({
      addedParents: [],
      addedChildren: [],
      removedChildren: [],
      removedParents: [],
    });
  }, []);

  const onScrollToLastNode = () => {
    if (!nodeBookState.selectedNode) return;
    scrollToNode(nodeBookState.selectedNode);
  };

  const onCloseSidebar = useCallback(() => {
    reloadPermanentGraph();
    if (notebookRef.current.selectedNode) scrollToNode(notebookRef.current.selectedNode);
    setOpenSidebar(null);
  }, [setOpenSidebar, reloadPermanentGraph]);

  const onRedrawGraph = useCallback(() => {
    setGraph(() => {
      return { nodes: {}, edges: {} };
    });
    setNodeUpdates({
      nodeIds: [],
      updatedAt: new Date(),
    });
    g.current = createGraph();
    setTimeout(() => {
      setNotebookChanges({ updated: true });
    }, 200);
  }, [setNotebookChanges]);

  const setSelectedNode = useCallback(
    (nodeId: string) => {
      notebookRef.current.selectedNode = nodeId;
      nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
      scrollToNode(nodeId);
    },
    [nodeBookDispatch]
  );

  const handleCloseProgressBarMenu = useCallback(() => {
    setOpenProgressBarMenu(false);
  }, []);

  // const disableForceTutorial = useCallback(
  //   (tutorialName: TutorialTypeKeys) => {
  //     setUserTutorial(userTutorial => {
  //       const tutorialUpdated: UserTutorial = {
  //         ...userTutorial[tutorialName],
  //       };
  //       const userTutorialUpdated = { ...userTutorial, [tutorialName]: tutorialUpdated };
  //       return userTutorialUpdated;
  //     });
  //   },
  //   [setUserTutorial]
  // );

  const onSkipTutorial = useCallback(async () => {
    if (!user) return;
    if (!currentStep) return;
    if (!tutorial) return;

    const tutorialUpdated: UserTutorial = {
      ...userTutorial[tutorial.name],
      currentStep: tutorial.step,
      skipped: true,
    };
    const userTutorialUpdated = { ...userTutorial, [tutorial.name]: tutorialUpdated };
    const wasForcedTutorial = tutorial.name === forcedTutorial;
    setUserTutorial(userTutorialUpdated);
    setOpenSidebar(null);
    setTutorial(null);

    if (wasForcedTutorial) return setForcedTutorial(null);

    const tutorialRef = doc(db, "userTutorial", user.uname);
    const tutorialDoc = await getDoc(tutorialRef);

    if (tutorialDoc.exists()) {
      await updateDoc(tutorialRef, userTutorialUpdated);
    } else {
      await setDoc(tutorialRef, userTutorialUpdated);
    }
  }, [user, currentStep, tutorial, userTutorial, forcedTutorial, setUserTutorial, setTutorial, db]);

  const onFinalizeTutorial = useCallback(async () => {
    if (!user) return;
    if (!currentStep) return;
    if (!tutorial) return;

    console.log(11111);
    if (tutorial.name === "tmpEditNode") {
      if (currentStep.isClickeable) {
        console.log(11112);
        proposeNodeImprovement(null, targetId);
      }
      console.log(11113);
      setTutorial(null);
      return;
    }

    console.log(111);

    const tmpChildrenMap = new Map<TutorialTypeKeys, NodeType>();
    tmpChildrenMap.set("tmpProposalConceptChild", "Concept");
    tmpChildrenMap.set("tmpProposalRelationChild", "Relation");
    tmpChildrenMap.set("tmpProposalReferenceChild", "Reference");
    tmpChildrenMap.set("tmpProposalQuestionChild", "Question");
    tmpChildrenMap.set("tmpProposalIdeaChild", "Idea");
    tmpChildrenMap.set("tmpProposalCodeChild", "Code");

    if (tmpChildrenMap.has(tutorial.name)) {
      console.log(112);
      if (currentStep.isClickeable) {
        proposeNewChild(null, tmpChildrenMap.get(tutorial.name) as string);
        console.log(113);
      }
      console.log(114);
      return;
    }

    const tutorialUpdated: UserTutorial = {
      ...userTutorial[tutorial.name],
      currentStep: currentStep.currentStepName,
      done: true,
    };

    const userTutorialUpdated: UserTutorials = { ...userTutorial, [tutorial.name]: tutorialUpdated };
    const wasForcedTutorial = tutorial.name === forcedTutorial;

    setTutorial(null);
    setUserTutorial(userTutorialUpdated);

    console.log(wasForcedTutorial);
    if (wasForcedTutorial) return setForcedTutorial(null);

    const tutorialRef = doc(db, "userTutorial", user.uname);
    const tutorialDoc = await getDoc(tutorialRef);

    if (tutorialDoc.exists()) {
      await updateDoc(tutorialRef, userTutorialUpdated);
    } else {
      await setDoc(tutorialRef, userTutorialUpdated);
    }
  }, [
    currentStep,
    db,
    forcedTutorial,
    proposeNewChild,
    proposeNodeImprovement,
    setTutorial,
    setUserTutorial,
    targetId,
    tutorial,
    user,
    userTutorial,
  ]);

  /**
   * Detect the trigger to call a tutorial
   * if graph is invalid, DB is modified with correct state
   * then we wait until graph has correct state to call tutorial
   */
  const detectAndForceTutorial = useCallback(
    (
      tutorialName: TutorialTypeKeys,
      targetId: string,
      targetIsValid: (node: FullNodeData) => boolean,
      defaultStates: Partial<FullNodeData> = { open: true }
    ) => {
      if (forcedTutorial !== tutorialName) return false;

      const thisNode = graph.nodes[targetId];
      if (!targetIsValid(thisNode)) {
        if (!tutorialStateWasSetUpRef.current) {
          openNodeHandler(targetId, defaultStates);
          tutorialStateWasSetUpRef.current = true;
        }
        return true;
      }
      tutorialStateWasSetUpRef.current = false;
      nodeBookDispatch({ type: "setSelectedNode", payload: targetId });
      notebookRef.current.selectedNode = targetId;

      startTutorial(
        [
          "proposal",
          "proposalConcept",
          "proposalRelation",
          "proposalReference",
          "proposalQuestion",
          "proposalIdea",
          "proposalCode",
        ].includes(tutorialName)
          ? "tmpEditNode"
          : tutorialName
      );
      setTargetId(targetId);

      setNodeUpdates({
        nodeIds: [targetId],
        updatedAt: new Date(),
      });

      return true;
    },
    [forcedTutorial, graph.nodes, nodeBookDispatch, openNodeHandler, setTargetId, startTutorial]
  );

  const detectAndRemoveTutorial = useCallback(
    (tutorialName: TutorialTypeKeys, targetIsValid: (node: FullNodeData) => boolean) => {
      if (!tutorial) return;
      if (tutorial.name !== tutorialName) return;

      const node = graph.nodes[targetId];
      if (!targetIsValid(node)) {
        setTutorial(null);
        setForcedTutorial(null);
      }
    },
    [graph.nodes, setTutorial, targetId, tutorial]
  );

  /**
   * Detect the trigger to call a tutorial
   * if graph is invalid, DB is modified with correct state
   * then we wait until graph has correct state to call tutorial
   */
  const detectAndCallTutorial = useCallback(
    (tutorialName: TutorialTypeKeys, targetIsValid: (node: FullNodeData) => boolean) => {
      const canDetect = !userTutorial[tutorialName].done && !userTutorial[tutorialName].skipped && !forcedTutorial;

      console.log("x111", { tutorialName });
      const isValidForcedTutorial = forcedTutorial
        ? (forcedTutorial === "nodes" && ["nodes"].includes(tutorialName)) ||
          (forcedTutorial === "proposal" && ["proposal", "tmpEditNode"].includes(tutorialName)) ||
          (forcedTutorial === "proposalConcept" && ["proposalConcept", "tmpEditNode"].includes(tutorialName)) ||
          (forcedTutorial === "proposalRelation" && ["proposalRelation", "tmpEditNode"].includes(tutorialName)) ||
          (forcedTutorial === "proposalReference" && ["proposalReference", "tmpEditNode"].includes(tutorialName)) ||
          (forcedTutorial === "proposalQuestion" && ["proposalQuestion", "tmpEditNode"].includes(tutorialName)) ||
          (forcedTutorial === "proposalIdea" && ["proposalIdea", "tmpEditNode"].includes(tutorialName)) ||
          (forcedTutorial === "proposalCode" && ["proposalCode", "tmpEditNode"].includes(tutorialName)) ||
          (forcedTutorial === "childProposal" &&
            ["childProposal", "tmpProposalConceptChild", "tmpEditNode"].includes(tutorialName)) ||
          // (forcedTutorial === "tmpEditNode" && ["tmpEditNode"].includes(tutorialName)) ||
          // (forcedTutorial === "tmpProposalConceptChild" && ["tmpProposalConceptChild"].includes(tutorialName)) ||
          (forcedTutorial === "childConcept" &&
            ["childConcept", "tmpProposalConceptChild", "tmpEditNode"].includes(tutorialName)) ||
          (forcedTutorial === "childRelation" &&
            ["childRelation", "tmpProposalRelationChild", "tmpEditNode"].includes(tutorialName)) ||
          (forcedTutorial === "childReference" &&
            ["childReference", "tmpProposalReferenceChild", "tmpEditNode"].includes(tutorialName)) ||
          (forcedTutorial === "childQuestion" &&
            ["childQuestion", "tmpProposalQuestionChild", "tmpEditNode"].includes(tutorialName)) ||
          (forcedTutorial === "childIdea" &&
            ["childIdea", "tmpProposalIdeaChild", "tmpEditNode"].includes(tutorialName)) ||
          (forcedTutorial === "childCode" &&
            ["childCode", "tmpProposalCodeChild", "tmpEditNode"].includes(tutorialName))
        : !["tmpProposalConceptChild", "tmpEditNode"].includes(tutorialName);

      console.log({
        1: forcedTutorial === "nodes" && ["nodes"].includes(tutorialName),
        2: forcedTutorial === "proposal" && ["proposal", "tmpEditNode"].includes(tutorialName),
        3: forcedTutorial === "proposalConcept" && ["proposalConcept", "tmpEditNode"].includes(tutorialName),
        4: forcedTutorial === "proposalRelation" && ["proposalRelation", "tmpEditNode"].includes(tutorialName),
        5: forcedTutorial === "proposalReference" && ["proposalReference", "tmpEditNode"].includes(tutorialName),
        6: forcedTutorial === "proposalQuestion" && ["proposalQuestion", "tmpEditNode"].includes(tutorialName),
        7: forcedTutorial === "proposalIdea" && ["proposalIdea", "tmpEditNode"].includes(tutorialName),
        8: forcedTutorial === "proposalCode" && ["proposalCode", "tmpEditNode"].includes(tutorialName),
        9:
          forcedTutorial === "childProposal" &&
          ["childProposal", "tmpProposalConceptChild", "tmpEditNode"].includes(tutorialName),
        // (forcedTutorial === "tmpEditNode" && ["tmpEditNode"].includes(tutorialName)) ||
        // (forcedTutorial === "tmpProposalConceptChild" && ["tmpProposalConceptChild"].includes(tutorialName)) ||
        10:
          forcedTutorial === "childConcept" &&
          ["childConcept", "tmpProposalConceptChild", "tmpEditNode"].includes(tutorialName),
        11:
          forcedTutorial === "childRelation" &&
          ["childRelation", "tmpProposalRelationChild", "tmpEditNode"].includes(tutorialName),
        12:
          forcedTutorial === "childReference" &&
          ["childReference", "tmpProposalReferenceChild", "tmpEditNode"].includes(tutorialName),
        13:
          forcedTutorial === "childQuestion" &&
          ["childQuestion", "tmpProposalQuestionChild", "tmpEditNode"].includes(tutorialName),
        14:
          forcedTutorial === "childIdea" && ["childIdea", "tmpProposalIdeaChild", "tmpEditNode"].includes(tutorialName),
      });
      console.log({ isValidForcedTutorial, thisone: "" });
      // if (!isValidForcedTutorial) return false;

      if (!canDetect && !isValidForcedTutorial) return false;

      devLog("DETECT_AND_CALL_TUTORIAL", { tutorialName, node: nodeBookState.selectedNode });

      const newTargetId = nodeBookState.selectedNode ?? "";
      console.log("111.5", newTargetId);

      if (!newTargetId) return false;

      console.log("112", newTargetId);
      const thisNode = graph.nodes[newTargetId];
      console.log("112.5", { thisNode });
      if (!thisNode) return false;
      console.log({ result: targetIsValid(thisNode) });
      if (!targetIsValid(thisNode)) return false;

      console.log("113");
      startTutorial(tutorialName);
      setTargetId(newTargetId);
      return true;
    },
    [forcedTutorial, graph.nodes, nodeBookState.selectedNode, setTargetId, startTutorial, userTutorial]
  );

  const detectAndCallChildTutorial = useCallback(
    (tutorialName: TutorialTypeKeys, targetIsValid: (node: FullNodeData) => boolean) => {
      const tutorialsIsForced = forcedTutorial === tutorialName;
      const canDetect = tutorialsIsForced || (!userTutorial[tutorialName].done && !userTutorial[tutorialName].skipped);
      const isValidForcedTutorial = forcedTutorial
        ? forcedTutorial === "childConcept" && ["childConcept"].includes(tutorialName)
        : !["tmpProposalConceptChild", "tmpEditNode"].includes(tutorialName);

      console.log("111");
      if (!isValidForcedTutorial) return false;
      if (!canDetect) return false;

      devLog("DETECT_AND_CALL_CHILD_TUTORIAL", { tutorialName });

      const newTargetId = nodeBookState.selectedNode ?? "";
      if (!newTargetId) return false;

      console.log("112", newTargetId);
      const thisNode = graph.nodes[newTargetId]; // this is the child node
      if (!thisNode) return false;
      if (!targetIsValid(thisNode)) return false;

      console.log("113");
      startTutorial(tutorialName);
      setTargetId(newTargetId);
      return true;
    },
    [forcedTutorial, graph.nodes, nodeBookState.selectedNode, setTargetId, startTutorial, userTutorial]
  );

  // const detectAndCallEditNodeTutorial = useCallback(
  //   (
  //     tutorialName: TutorialTypeKeys,
  //     targetId: string,
  //     targetIsInvalid: (node: FullNodeData) => boolean,
  //     defaultStates: Partial<FullNodeData> = { open: true }
  //   ) => {
  //     const tutorialsIsForced = forcedTutorial === tutorialName;
  //     if (!tutorialsIsForced && (userTutorial[tutorialName].done || userTutorial[tutorialName].skipped)) return;

  //     devLog("DETECT_AND_CALL_EDIT_NODE_TUTORIAL");

  //     const newTargetId = tutorialsIsForced ? targetId : nodeBookState.selectedNode ?? "";
  //     console.log(11);
  //     if (!newTargetId) return;

  //     console.log(12);
  //     const thisNode = graph.nodes[newTargetId];
  //     if ((tutorialsIsForced && !thisNode) || targetIsInvalid(thisNode)) {
  //       if (!tutorialStateWasSetUpRef.current) {
  //         console.log(13);
  //         openNodeHandler(newTargetId, defaultStates);
  //         tutorialStateWasSetUpRef.current = true;
  //       }
  //       return;
  //     }

  //     if (!tutorialsIsForced && !changedNodes[newTargetId]) return;
  //     console.log(14, { newTargetId });
  //     // disableForceTutorial(tutorialName);
  //     tutorialStateWasSetUpRef.current = false;
  //     startTutorial(tutorialName);
  //     setTargetId(newTargetId);
  //     return;
  //   },
  //   [forcedTutorial, graph.nodes, nodeBookState.selectedNode, openNodeHandler, setTargetId, startTutorial, userTutorial]
  // );

  // const detectAndCallChildNodeTutorial = useCallback(
  //   (
  //     tutorialName: TutorialTypeKeys,
  //     targetId: string,
  //     targetIsInvalid: (node: FullNodeData) => boolean,
  //     defaultStates: Partial<FullNodeData> = { open: true }
  //   ) => {
  //     const tutorialsIsForced = forcedTutorial.current === tutorialName;
  //     if (tutorialsIsForced || userTutorial[tutorialName].done || userTutorial[tutorialName].skipped) return;

  //     const newTargetId = tutorialsIsForced ? targetId : nodeBookState.selectedNode ?? "";
  //     // newTargetId: in forced is a parent, in normal is a new child

  //     if (!newTargetId) return;

  //     const thisNode = graph.nodes[newTargetId];
  //     if ((tutorialsIsForced && !thisNode) || targetIsInvalid(thisNode)) {
  //       // isNew:true
  //       if (!tutorialStateWasSetUpRef.current) {
  //         openNodeHandler(newTargetId, defaultStates);
  //         tutorialStateWasSetUpRef.current = true;
  //       }
  //       return;
  //     }

  //     if (!tutorialsIsForced && !changedNodes[newTargetId]) return;

  //     disableForceTutorial(tutorialName);
  //     tutorialStateWasSetUpRef.current = false;
  //     startTutorial(tutorialName);
  //     setTargetId(newTargetId);
  //   },
  //   [
  //     disableForceTutorial,
  //     graph.nodes,
  //     nodeBookState.selectedNode,
  //     openNodeHandler,
  //     setTargetId,
  //     startTutorial,
  //     userTutorial,
  //   ]
  // );

  // const forceTutorial = useCallback(
  //   (targetId: string, tutorialName: TutorialTypeKeys, openWithDefaultValues: Partial<FullNodeData> = {}) => {
  //     devLog("FORCE_TUTORIAL", { idTarget: targetId, tutorialName, openWithDefaultValues });
  //     // const targetElement = document.getElementById(idTarget);
  //     const thisNode = graph.nodes[targetId];
  //     if (!thisNode || !thisNode.open) {
  //       return openNodeHandler(targetId, openWithDefaultValues);
  //     }
  //     // const targetElement = document.getElementById(idTarget);
  //     // if (!targetElement) {
  //     //   return openNodeHandler(idTarget);
  //     // }

  //     // setNodeParts(idTarget, node => ({ ...node, ...openWithDefaultValues }));
  //     // nodeBookDispatch({ type: "setSelectedNode", payload: idTarget });
  //     // notebookRef.current.selectedNode = idTarget;
  //     // startTutorial(tutorialName);

  //     // openLinkedNode(targetId);

  //     if (openWithDefaultValues?.editable) proposeNodeImprovement(null, targetId);
  //     setTargetId(targetId);
  //   },
  //   [graph.nodes, openNodeHandler, proposeNodeImprovement, setTargetId]
  // );

  useEffect(() => {
    /**
     * This useEffect with detect conditions to call a tutorial
     * we need selected node over required node
     * This useEffect executed 2 times when we force tutorial
     * 1. first time will set up required states
     * 2. second time will run tutorial
     */
    const detectTriggerTutorial = () => {
      console.log({ userTutorialLoaded, firstLoading, tutorial });
      if (!userTutorialLoaded) return;
      if (firstLoading) return;
      if (tutorial) return;

      devLog("USE_EFFECT: DETECT_TRIGGER_TUTORIAL", { userTutorial });

      // --------------------------

      if ((!userTutorial.navigation.done && !userTutorial.navigation.skipped) || forcedTutorial === "navigation") {
        startTutorial("navigation");
        // TODO: force 1cademy node  if there isn't nodes
        return;
      }

      // --------------------------

      // const selectedNodeFromGraph: FullNodeData | null = nodeBookState.selectedNode
      //   ? graph.nodes[nodeBookState.selectedNode]
      //   : null;

      // --------------------------

      const nodesTutorialIsValid = (node: FullNodeData) => node && node.open;

      const nodesTutorialLaunched = detectAndCallTutorial("nodes", nodesTutorialIsValid);
      if (nodesTutorialLaunched) return;

      if (forcedTutorial === "nodes") {
        const defaultStates = { open: true };
        const newTargetId = "r98BjyFDCe4YyLA3U8ZE";
        const thisNode = graph.nodes[newTargetId];
        // console.log("nodes", 11);
        if (!nodesTutorialIsValid(thisNode)) {
          if (!tutorialStateWasSetUpRef.current) {
            // console.log("nodes", 12);
            openNodeHandler(newTargetId, defaultStates);
            tutorialStateWasSetUpRef.current = true;
          }
          return;
        }

        // console.log("nodes", 13);
        tutorialStateWasSetUpRef.current = false;
        nodeBookDispatch({ type: "setSelectedNode", payload: newTargetId });
        notebookRef.current.selectedNode = newTargetId;
        startTutorial("nodes");
        setTargetId(newTargetId);

        setNodeUpdates({
          nodeIds: [newTargetId],
          updatedAt: new Date(),
        });

        return;
      }

      // --------------------------

      // // // detectAndForceTutorial("nodes", "r98BjyFDCe4YyLA3U8ZE", thisNode => thisNode && !thisNode.open);
      // if (userTutorial.nodes.forceTutorial || (!userTutorial.nodes.done && !userTutorial.nodes.skipped)) {
      //   const newTargetId = userTutorial.nodes.forceTutorial
      //     ? "r98BjyFDCe4YyLA3U8ZE"
      //     : nodeBookState.selectedNode ?? "";

      //   if (!newTargetId) return;

      //   const thisNode = graph.nodes[newTargetId];
      //   const targetIsInvalid = thisNode && !thisNode.open;
      //   if (!thisNode || targetIsInvalid) {
      //     if (!tutorialStateWasSetUpRef.current) {
      //       openNodeHandler(newTargetId, { open: true });
      //       tutorialStateWasSetUpRef.current = true;
      //     }
      //     return;
      //   }

      //   disableForceTutorial("nodes");
      //   tutorialStateWasSetUpRef.current = false;
      //   startTutorial("nodes");
      //   setTargetId(newTargetId);
      //   return;
      // }

      // // if(userTutorial.nodes.forceTutorial)

      // // if (userTutorial.nodes.forceTutorial) {
      // //   // const thisNode = graph.nodes[targetId];
      // //   if (!thisNode || !thisNode.open) {
      // //     openNodeHandler(newTargetId, {open:true});
      // //   }
      // //   // return forceTutorial("r98BjyFDCe4YyLA3U8ZE", "nodes", { open: true });
      // // }

      // // if (selectedNodeFromGraph && !userTutorial.nodes.done && !userTutorial.nodes.skipped) {
      // //   const thisNode = graph.nodes[newTargetId];
      // //   if (!thisNode || !thisNode.open) {
      // //     openNodeHandler(newTargetId, {open:true});
      // //   }
      // //   // setTutorial({ name: "nodes", step: 1, steps: [] });
      // //   // setTargetId(selectedNodeFromGraph.node);
      // //   // return;
      // }

      // // if ((!tutorialStep.nodes.done && !tutorialStep.nodes.skipped) || tutorialStep.nodes.forceTutorial) {
      // //   const nodeTargetId =
      // //     (nodeBookState.selectedNode && graph.nodes[nodeBookState.selectedNode]?.open && nodeBookState.selectedNode) ||
      // //     "";

      // //   if (!nodeTargetId) {
      // //     if (!tutorialStep.nodes.forceTutorial) return;

      // //     const idTarget = "r98BjyFDCe4YyLA3U8ZE";
      // //     const targetElement = document.getElementById(idTarget);
      // //     if (!targetElement) return openNodeHandler(idTarget, { open: true });

      // //     notebookRef.current.selectedNode = idTarget;
      // //     nodeBookDispatch({ type: "setSelectedNode", payload: idTarget });
      // //     setNodeParts(idTarget, node => ({ ...node, open: true }));
      // //     scrollToNode(idTarget);
      // //     return;
      // //   }

      // //   if(userTutorial.nodes.forceTutorial)

      // // if (userTutorial.nodes.forceTutorial) {
      // //   // const thisNode = graph.nodes[targetId];
      // //   if (!thisNode || !thisNode.open) {
      // //     openNodeHandler(newTargetId, {open:true});
      // //   }
      // //   // return forceTutorial("r98BjyFDCe4YyLA3U8ZE", "nodes", { open: true });
      // // }

      // // if (selectedNodeFromGraph && !userTutorial.nodes.done && !userTutorial.nodes.skipped) {
      // //   const thisNode = graph.nodes[newTargetId];
      // //   if (!thisNode || !thisNode.open) {
      // //     openNodeHandler(newTargetId, {open:true});
      // //   }
      // //   // setTutorial({ name: "nodes", step: 1, steps: [] });
      // //   // setTargetId(selectedNodeFromGraph.node);
      // //   // return;
      // }

      // // if ((!tutorialStep.nodes.done && !tutorialStep.nodes.skipped) || tutorialStep.nodes.forceTutorial) {
      // //   const nodeTargetId =
      // //     (nodeBookState.selectedNode && graph.nodes[nodeBookState.selectedNode]?.open && nodeBookState.selectedNode) ||
      // //

      // --------------------------
      if (
        (!userTutorial.searcher.done && !userTutorial.searcher.skipped && openSidebar === "SEARCHER_SIDEBAR") ||
        forcedTutorial === "searcher"
      ) {
        if (openSidebar !== "SEARCHER_SIDEBAR") {
          if (forcedTutorial !== "searcher") return;

          setOpenSidebar("SEARCHER_SIDEBAR");
          return;
        }
        setTutorial({ name: "searcher", step: 1, steps: [] });
        return;
      }

      // --------------------------

      const launchedtutorial = detectAndCallTutorial(
        "proposal",
        thisNode => thisNode && thisNode.open && thisNode.editable
      );

      // console.log({ launchedtutorial, forcedTutorial });
      if (launchedtutorial) return;

      if (forcedTutorial === "proposal") {
        const defaultStates = { open: true };
        const targetIsInvalid = (node: FullNodeData) => !node.open || node.editable;
        const newTargetId = "r98BjyFDCe4YyLA3U8ZE";
        const thisNode = graph.nodes[newTargetId];
        console.log(11);
        if (!thisNode || targetIsInvalid(thisNode)) {
          if (!tutorialStateWasSetUpRef.current) {
            console.log(12);
            openNodeHandler(newTargetId, defaultStates);
            tutorialStateWasSetUpRef.current = true;
          }
          return;
        }

        console.log(13);
        // disableForceTutorial("proposal");
        tutorialStateWasSetUpRef.current = false;
        nodeBookDispatch({ type: "setSelectedNode", payload: newTargetId });
        notebookRef.current.selectedNode = newTargetId;
        startTutorial("tmpEditNode");
        setTargetId(newTargetId);

        setNodeUpdates({
          nodeIds: [newTargetId],
          updatedAt: new Date(),
        });

        return;
        // detectAndForceTutorial("tmpEditNode", "r98BjyFDCe4YyLA3U8ZE", thisNode => thisNode.open, { open: true });
      }

      // --------------------------

      const codeProposalTutorialIsValid = (node: FullNodeData) =>
        node && node.open && node.editable && node.nodeType === "Code";
      const codeProposalTutorialIsValidForced = (node: FullNodeData) => node && node.open && node.nodeType === "Code";

      const codeProposalTutorialLaunched = detectAndCallTutorial("proposalCode", codeProposalTutorialIsValid);
      if (codeProposalTutorialLaunched) return;

      if (forcedTutorial === "proposalCode") {
        const defaultStates = { open: true };
        const newTargetId = "E1nIWQ7RIC3pRLvk0Bk5";
        const thisNode = graph.nodes[newTargetId];
        if (!codeProposalTutorialIsValidForced(thisNode)) {
          if (!tutorialStateWasSetUpRef.current) {
            openNodeHandler(newTargetId, defaultStates);
            tutorialStateWasSetUpRef.current = true;
          }
          return;
        }
        tutorialStateWasSetUpRef.current = false;
        nodeBookDispatch({ type: "setSelectedNode", payload: newTargetId });
        notebookRef.current.selectedNode = newTargetId;
        startTutorial("tmpEditNode");
        setTargetId(newTargetId);

        setNodeUpdates({
          nodeIds: [newTargetId],
          updatedAt: new Date(),
        });

        return;
      }
      // --------------------------

      const conceptProposalTutorialIsValid = (node: FullNodeData) =>
        node && node.open && node.editable && node.nodeType === "Concept";
      const conceptProposalTutorialIsValidForced = (node: FullNodeData) =>
        node && node.open && node.nodeType === "Concept";

      const conceptProposalTutorialLaunched = detectAndCallTutorial("proposalConcept", conceptProposalTutorialIsValid);
      if (conceptProposalTutorialLaunched) return;

      const conceptProposalForcedTutorialLaunched = detectAndForceTutorial(
        "proposalConcept",
        "r98BjyFDCe4YyLA3U8ZE",
        conceptProposalTutorialIsValidForced
      );
      if (conceptProposalForcedTutorialLaunched) return;
      // --------------------------

      const relationProposalTutorialIsValid = (node: FullNodeData) =>
        node && node.open && node.editable && node.nodeType === "Relation";
      const relationProposalTutorialIsValidForced = (node: FullNodeData) =>
        node && node.open && node.nodeType === "Relation";

      const relationProposalTutorialLaunched = detectAndCallTutorial(
        "proposalRelation",
        relationProposalTutorialIsValid
      );
      if (relationProposalTutorialLaunched) return;

      const relationProposalForcedTutorialLaunched = detectAndForceTutorial(
        "proposalRelation",
        "zYYmaXvhab7hH2uRI9Up",
        relationProposalTutorialIsValidForced
      );
      if (relationProposalForcedTutorialLaunched) return;

      // --------------------------

      const referenceProposalTutorialIsValid = (node: FullNodeData) =>
        node && node.open && node.editable && node.nodeType === "Reference";
      const referenceProposalTutorialIsValidForced = (node: FullNodeData) =>
        node && node.open && node.nodeType === "Reference";

      const referenceProposalTutorialLaunched = detectAndCallTutorial(
        "proposalReference",
        referenceProposalTutorialIsValid
      );
      if (referenceProposalTutorialLaunched) return;

      const referenceProposalForcedTutorialLaunched = detectAndForceTutorial(
        "proposalReference",
        "P631lWeKsBtszZRDlmsM",
        referenceProposalTutorialIsValidForced
      );
      if (referenceProposalForcedTutorialLaunched) return;

      // --------------------------

      const questionProposalTutorialIsValid = (node: FullNodeData) =>
        node && node.open && node.editable && node.nodeType === "Question";
      const questionProposalTutorialIsValidForced = (node: FullNodeData) =>
        node && node.open && node.nodeType === "Question";

      const questionProposalTutorialLaunched = detectAndCallTutorial(
        "proposalQuestion",
        questionProposalTutorialIsValid
      );
      if (questionProposalTutorialLaunched) return;

      const questionProposalForcedTutorialLaunched = detectAndForceTutorial(
        "proposalQuestion",
        "qO9uK6UdYRLWm4Olihlw",
        questionProposalTutorialIsValidForced
      );
      if (questionProposalForcedTutorialLaunched) return;

      // --------------------------

      const ideaProposalTutorialIsValid = (node: FullNodeData) =>
        node && node.open && node.editable && node.nodeType === "Idea";
      const ideaProposalTutorialIsValidForced = (node: FullNodeData) => node && node.open && node.nodeType === "Idea";

      const ideaProposalTutorialLaunched = detectAndCallTutorial("proposalIdea", ideaProposalTutorialIsValid);
      if (ideaProposalTutorialLaunched) return;

      const ideaProposalForcedTutorialLaunched = detectAndForceTutorial(
        "proposalIdea",
        "v9wGPxRCI4DRq11o7uH2",
        ideaProposalTutorialIsValidForced
      );
      if (ideaProposalForcedTutorialLaunched) return;

      // --------------------------

      const conceptTutorialIsValid = (thisNode: FullNodeData) =>
        thisNode && thisNode.open && thisNode.nodeType === "Concept";
      const conceptTutorialLaunched = detectAndCallTutorial("concept", conceptTutorialIsValid);
      if (conceptTutorialLaunched) return;

      const conceptForcedTutorialLaunched = detectAndForceTutorial(
        "concept",
        "r98BjyFDCe4YyLA3U8ZE",
        conceptTutorialIsValid
      );
      if (conceptForcedTutorialLaunched) return;
      // --------------------------

      const relationTutorialIsValid = (thisNode: FullNodeData) =>
        thisNode && thisNode.open && thisNode.nodeType === "Relation";
      const relationTutorialLaunched = detectAndCallTutorial("relation", relationTutorialIsValid);
      if (relationTutorialLaunched) return;

      const relationForcedTutorialLaunched = detectAndForceTutorial(
        "relation",
        "zYYmaXvhab7hH2uRI9Up",
        relationTutorialIsValid
      );
      if (relationForcedTutorialLaunched) return;

      // --------------------------
      const referenceTutorialIsValid = (thisNode: FullNodeData) =>
        thisNode && thisNode.open && thisNode.nodeType === "Reference";
      const referenceTutorialLaunched = detectAndCallTutorial("reference", referenceTutorialIsValid);
      if (referenceTutorialLaunched) return;

      const referenceForcedTutorialLaunched = detectAndForceTutorial(
        "reference",
        "P631lWeKsBtszZRDlmsM",
        referenceTutorialIsValid
      );
      if (referenceForcedTutorialLaunched) return;

      // --------------------------

      const questionTutorialIsValid = (thisNode: FullNodeData) =>
        thisNode && thisNode.open && thisNode.nodeType === "Question";
      const questionTutorialLaunched = detectAndCallTutorial("question", questionTutorialIsValid);
      if (questionTutorialLaunched) return;

      const questionForcedTutorialLaunched = detectAndForceTutorial(
        "question",
        "qO9uK6UdYRLWm4Olihlw",
        questionTutorialIsValid
      );
      if (questionForcedTutorialLaunched) return;

      // --------------------------

      const ideaTutorialIsValid = (thisNode: FullNodeData) => thisNode && thisNode.open && thisNode.nodeType === "Idea";
      const ideaTutorialLaunched = detectAndCallTutorial("idea", ideaTutorialIsValid);
      if (ideaTutorialLaunched) return;

      const ideaForcedTutorialLaunched = detectAndForceTutorial("idea", "v9wGPxRCI4DRq11o7uH2", ideaTutorialIsValid);
      if (ideaForcedTutorialLaunched) return;

      // --------------------------

      const codeTutorialIsValid = (thisNode: FullNodeData) => thisNode && thisNode.open && thisNode.nodeType === "Code";
      const codeTutorialLaunched = detectAndCallTutorial("code", codeTutorialIsValid);
      if (codeTutorialLaunched) return;

      const codeForcedTutorialLaunched = detectAndForceTutorial("code", "E1nIWQ7RIC3pRLvk0Bk5", codeTutorialIsValid);
      if (codeForcedTutorialLaunched) return;

      // --------------------------
      // if (forcedTutorial === "concept") {
      //   const defaultStates = { open: true };
      //   const newTargetId = "r98BjyFDCe4YyLA3U8ZE";
      //   const thisNode = graph.nodes[newTargetId];
      //   if (!conceptTutorialIsValid(thisNode)) {
      //     if (!tutorialStateWasSetUpRef.current) {
      //       openNodeHandler(newTargetId, defaultStates);
      //       tutorialStateWasSetUpRef.current = true;
      //     }
      //     return;
      //   }
      //   tutorialStateWasSetUpRef.current = false;
      //   nodeBookDispatch({ type: "setSelectedNode", payload: newTargetId });
      //   notebookRef.current.selectedNode = newTargetId;
      //   startTutorial("concept");
      //   setTargetId(newTargetId);

      //   setNodeUpdates({
      //     nodeIds: [newTargetId],
      //     updatedAt: new Date(),
      //   });

      //   return;
      // }

      // --------------------------

      // const selectedNodeFromChangedNodes: FullNodeData = nodeBookState.selectedNode
      //   ? changedNodes[nodeBookState.selectedNode]
      //   : null;

      // --------------------------

      // if (!userTutorial.proposal.forceTutorial) {

      // }

      // if (userTutorial.proposal.forceTutorial) {
      //   return forceTutorial("r98BjyFDCe4YyLA3U8ZE", "proposal", { open: true, editable: true });
      // }

      // if (selectedNodeFromChangedNodes && !userTutorial.proposal.done && !userTutorial.proposal.skipped) {
      //   setTutorial({ name: "proposal", step: 1, steps: [] });
      //   setTargetId(selectedNodeFromChangedNodes.node);
      //   return;
      // }

      // // --------------------------

      // if (userTutorial.proposalConcept.forceTutorial) {
      //   return forceTutorial("r98BjyFDCe4YyLA3U8ZE", "proposalConcept", { open: true, editable: true });
      // }

      // if (
      //   selectedNodeFromChangedNodes &&
      //   !userTutorial.proposalConcept.done &&
      //   !userTutorial.proposalConcept.skipped &&
      //   selectedNodeFromChangedNodes.nodeType === "Concept"
      // ) {
      //   setTutorial({ name: "proposalConcept", step: 1, steps: [] });
      //   setTargetId(selectedNodeFromChangedNodes.node);
      //   return;
      // }

      // // --------------------------

      // if (userTutorial.proposalRelation.forceTutorial) {
      //   return forceTutorial("zYYmaXvhab7hH2uRI9Up", "proposalRelation", { open: true, editable: true });
      // }

      // if (
      //   selectedNodeFromChangedNodes &&
      //   !userTutorial.proposalRelation.done &&
      //   !userTutorial.proposalRelation.skipped &&
      //   selectedNodeFromChangedNodes.nodeType === "Relation"
      // ) {
      //   setTutorial({ name: "proposalRelation", step: 1, steps: [] });
      //   setTargetId(selectedNodeFromChangedNodes.node);
      //   return;
      // }

      // // --------------------------

      // if (userTutorial.proposalReference.forceTutorial) {
      //   return forceTutorial("P631lWeKsBtszZRDlmsM", "proposalReference", { open: true, editable: true });
      // }

      // if (
      //   selectedNodeFromChangedNodes &&
      //   !userTutorial.proposalReference.done &&
      //   !userTutorial.proposalReference.skipped &&
      //   selectedNodeFromChangedNodes.nodeType === "Reference"
      // ) {
      //   setTutorial({ name: "proposalReference", step: 1, steps: [] });
      //   setTargetId(selectedNodeFromChangedNodes.node);
      //   return;
      // }

      // // --------------------------

      // if (userTutorial.proposalIdea.forceTutorial) {
      //   return forceTutorial("v9wGPxRCI4DRq11o7uH2", "proposalIdea", { open: true, editable: true });
      // }

      // if (
      //   selectedNodeFromChangedNodes &&
      //   !userTutorial.proposalIdea.done &&
      //   !userTutorial.proposalIdea.skipped &&
      //   selectedNodeFromChangedNodes.nodeType === "Idea"
      // ) {
      //   setTutorial({ name: "proposalIdea", step: 1, steps: [] });
      //   setTargetId(selectedNodeFromChangedNodes.node);
      //   return;
      // }

      // // --------------------------

      // if (userTutorial.proposalQuestion.forceTutorial) {
      //   return forceTutorial("qO9uK6UdYRLWm4Olihlw", "proposalQuestion", { open: true, editable: true });
      // }

      // if (
      //   selectedNodeFromChangedNodes &&
      //   !userTutorial.proposalQuestion.done &&
      //   !userTutorial.proposalQuestion.skipped &&
      //   selectedNodeFromChangedNodes.nodeType === "Question"
      // ) {
      //   setTutorial({ name: "proposalQuestion", step: 1, steps: [] });
      //   setTargetId(selectedNodeFromChangedNodes.node);
      //   return;
      // }

      // // --------------------------

      // if (userTutorial.proposalCode.forceTutorial) {
      //   return forceTutorial("E1nIWQ7RIC3pRLvk0Bk5", "proposalCode", { open: true, editable: true });
      // }

      // if (
      //   selectedNodeFromChangedNodes &&
      //   !userTutorial.proposalCode.done &&
      //   !userTutorial.proposalCode.skipped &&
      //   selectedNodeFromChangedNodes.nodeType === "Code"
      // ) {
      //   setTutorial({ name: "proposalCode", step: 1, steps: [] });
      //   setTargetId(selectedNodeFromChangedNodes.node);
      //   return;
      // }

      // // --------------------------

      // // const selectedNodeFromGraph = graph.nodes[nodeBookState.selectedNode ?? ""];

      // // --------------------------

      // if (userTutorial.concept.forceTutorial) {
      //   return forceTutorial("r98BjyFDCe4YyLA3U8ZE", "concept", { open: true });
      // }

      // if (
      //   selectedNodeFromGraph &&
      //   selectedNodeFromGraph.nodeType === "Concept" &&
      //   !userTutorial.concept.done &&
      //   !userTutorial.concept.skipped
      // ) {
      //   setTargetId(selectedNodeFromGraph.node);
      //   setTutorial({ name: "concept", step: 1, steps: [] });
      //   return;
      // }

      // // --------------------------

      // if (userTutorial.relation.forceTutorial) {
      //   return forceTutorial("zYYmaXvhab7hH2uRI9Up", "relation", { open: true });
      // }

      // if (
      //   selectedNodeFromGraph &&
      //   selectedNodeFromGraph.nodeType === "Relation" &&
      //   !userTutorial.relation.done &&
      //   !userTutorial.relation.skipped
      // ) {
      //   setTargetId(selectedNodeFromGraph.node);
      //   setTutorial({ name: "relation", step: 1, steps: [] });
      //   return;
      // }

      // // --------------------------

      // if (userTutorial.reference.forceTutorial) {
      //   return forceTutorial("P631lWeKsBtszZRDlmsM", "reference", { open: true });
      // }

      // if (
      //   selectedNodeFromGraph &&
      //   selectedNodeFromGraph.nodeType === "Reference" &&
      //   !userTutorial.reference.done &&
      //   !userTutorial.reference.skipped
      // ) {
      //   setTargetId(selectedNodeFromGraph.node);
      //   setTutorial({ name: "reference", step: 1, steps: [] });
      //   return;
      // }

      // // --------------------------

      // if (userTutorial.question.forceTutorial) {
      //   return forceTutorial("P631lWeKsBtszZRDlmsM", "question", { open: true });
      // }

      // if (
      //   selectedNodeFromGraph &&
      //   selectedNodeFromGraph.nodeType === "Reference" &&
      //   !userTutorial.question.done &&
      //   !userTutorial.question.skipped
      // ) {
      //   setTargetId(selectedNodeFromGraph.node);
      //   setTutorial({ name: "question", step: 1, steps: [] });
      //   return;
      // }

      // // --------------------------

      // if (userTutorial.idea.forceTutorial) {
      //   return forceTutorial("v9wGPxRCI4DRq11o7uH2", "idea", { open: true });
      // }

      // if (
      //   selectedNodeFromGraph &&
      //   selectedNodeFromGraph.nodeType === "Idea" &&
      //   !userTutorial.idea.done &&
      //   !userTutorial.idea.skipped
      // ) {
      //   setTargetId(selectedNodeFromGraph.node);
      //   setTutorial({ name: "idea", step: 1, steps: [] });
      //   return;
      // }

      // // --------------------------

      // if (userTutorial.code.forceTutorial) {
      //   return forceTutorial("E1nIWQ7RIC3pRLvk0Bk5", "code", { open: true });
      // }

      // if (
      //   selectedNodeFromGraph &&
      //   selectedNodeFromGraph.nodeType === "Code" &&
      //   !userTutorial.code.done &&
      //   !userTutorial.code.skipped
      // ) {
      //   setTargetId(selectedNodeFromGraph.node);
      //   setTutorial({ name: "code", step: 1, steps: [] });
      //   return;
      // }

      // // --------------------------

      // if (userTutorial.reconcilingAcceptedProposal.forceTutorial) {
      //   return forceTutorial("zp6PeUOlmejdQTAqK2xX", "reconcilingAcceptedProposal", { open: true });
      // }

      // if (
      //   selectedNodeFromGraph &&
      //   lastNodeOperation.current === "ProposeProposals" &&
      //   !userTutorial.reconcilingAcceptedProposal.done &&
      //   !userTutorial.reconcilingAcceptedProposal.skipped
      // ) {
      //   const willBeApproved = isVersionApproved({
      //     corrects: 1,
      //     wrongs: 0,(
      // // //   tutorialName: TutorialTypeKeys,
      // // //   targetId: string,
      // // //   targetIsInvalid: (node: FullNodeData) => boolean,
      // // //   defaultStates: Partial<FullNodeData> = { open: true }
      // // // ) => {
      // // //   if (
      // // //     userTutorial[tutorialName].forceTutorial &&
      // // //     userTutorial[tutorialName].done &&
      // // //     userTutorial[tutorialName].skipped
      // // //   )
      // // //     return;

      // // //   const newTargetId = userTutorial[tutorialName].forceTutorial ? targetId : nodeBookState.selectedNode ?? "";

      // // //   if (!newTargetId) return;

      // // //   const thisNode = graph.nodes[newTargetId];
      // // //   // const targetIsInvalid = thisNode && !thisNode.open;
      // // //   if (!thisNode || targetIsInvalid(thisNode)) {
      // // //     if (!tutorialStateWasSetUpRef.current) {
      // // //       openNodeHandler(newTargetId, defaultStates);
      // // //       tutorialStateWasSetUpRef.current = true;
      // // //     }
      // // //     return;
      // // //   }

      // // //   disableForceTutorial(tutorialName);
      // // //   tutorialStateWasSetUpRef.current = false;
      // // //   startTutorial(tutorialName);
      // // //   setTargetId(newTargetId);
      // // //   return;
      // // // }
      //     nodeData: selectedNodeFromGraph,
      //   });
      //   if (!willBeApproved) return;

      //   setTutorial({ name: "reconcilingAcceptedProposal", step: 1, steps: [] });
      //   setTargetId(willBeApproved.node);
      //   return;
      // }

      // // --------------------------

      // if (userTutorial.reconcilingNotAcceptedProposal.forceTutorial) {
      //   setOpenSidebar("PROPOSALS");
      //   return forceTutorial("r98BjyFDCe4YyLA3U8ZE", "reconcilingNotAcceptedProposal", { open: true });
      // }

      // if (
      //   selectedNodeFromGraph &&
      //   lastNodeOperation.current === "ProposeProposals" &&
      //   !userTutorial.reconcilingNotAcceptedProposal.done &&
      //   !userTutorial.reconcilingNotAcceptedProposal.skipped
      // ) {
      //   const willBeApproved = isVersionApproved({
      //     corrects: 1,
      //     wrongs: 0,
      //     nodeData: selectedNodeFromGraph,
      //   });
      //   if (willBeApproved) return;

      //   setTutorial({ name: "reconcilingNotAcceptedProposal", step: 1, steps: [] });
      //   setOpenSidebar("PROPOSALS");
      //   setTargetId(willBeApproved.node);
      //   return;
      // }

      // // --------------------------

      // const selectedNodeIdFromTemporalNodes: string =
      //   nodeBookState.selectedNode && tempNodes.has(nodeBookState.selectedNode) ? nodeBookState.selectedNode : "";
      // const selectedNodeFromTemporalNode = graph.nodes[selectedNodeIdFromTemporalNodes];

      // // --------------------------

      // // if (userTutorial.childProposal.forceTutorial || userTutorial.childConcept.forceTutorial) {
      // //   return forceTutorial("r98BjyFDCe4YyLA3U8ZE", "PRE_STEP_CHILD_PROPOSAL");
      // // }

      // // --------------------------

      // if (userTutorial.childProposal.forceTutorial) {
      //   return forceTutorial("r98BjyFDCe4YyLA3U8ZE", "childProposal", { open: true });
      // }

      // if (selectedNodeFromTemporalNode && !userTutorial.childProposal.done && !userTutorial.childProposal.skipped) {
      //   setTargetId(selectedNodeFromTemporalNode.node);
      //   setTutorial({ name: "childProposal", step: 1, steps: [] });

      //   return;
      // }

      // // --------------------------
      const proposalConceptChildLaunched = detectAndCallTutorial(
        "tmpProposalConceptChild",
        node => node && node.open && node.editable
      );
      console.log({ proposalConceptChildLaunched });
      if (proposalConceptChildLaunched) return;

      // ------------------------

      const proposalRelationChildLaunched = detectAndCallTutorial(
        "tmpProposalRelationChild",
        node => node && node.open && node.editable
      );
      console.log({ proposalRelationChildLaunched });
      if (proposalRelationChildLaunched) return;

      // ------------------------

      const proposalReferenceChildLaunched = detectAndCallTutorial(
        "tmpProposalReferenceChild",
        node => node && node.open && node.editable
      );
      console.log({ proposalReferenceChildLaunched });
      if (proposalReferenceChildLaunched) return;

      // ------------------------

      const proposalQuestionChildLaunched = detectAndCallTutorial(
        "tmpProposalQuestionChild",
        node => node && node.open && node.editable
      );
      console.log({ proposalQuestionChildLaunched });
      if (proposalQuestionChildLaunched) return;

      // ------------------------

      const proposalIdeaChildLaunched = detectAndCallTutorial(
        "tmpProposalIdeaChild",
        node => node && node.open && node.editable
      );
      console.log({ proposalIdeaChildLaunched });
      if (proposalIdeaChildLaunched) return;

      // ------------------------

      const proposalCodeChildLaunched = detectAndCallTutorial(
        "tmpProposalCodeChild",
        node => node && node.open && node.editable
      );
      console.log({ proposalCodeChildLaunched });
      if (proposalCodeChildLaunched) return;

      // ------------------------
      // ------------------------
      const tmpEditNodeIsValid = (node: FullNodeData) => node && node.open && !node.editable;
      // node child ./
      const childProposalLaunched = detectAndCallChildTutorial(
        "childProposal",
        node => node && Boolean(node.isNew) && node.open && node.editable
      );
      console.log({ childProposalLaunched });
      if (childProposalLaunched) return;

      //------------------------

      const childConceptProposalIsValid = (node: FullNodeData) =>
        node && Boolean(node.isNew) && node.open && node.editable && node.nodeType === "Concept";
      const childConceptProposalLaunched = detectAndCallChildTutorial("childConcept", childConceptProposalIsValid);
      if (childConceptProposalLaunched) return;

      //------------------------

      const relationChildProposalIsValid = (node: FullNodeData) =>
        node && Boolean(node.isNew) && node.open && node.editable && node.nodeType === "Relation";
      const childRelationProposalLaunched = detectAndCallChildTutorial("childRelation", relationChildProposalIsValid);
      if (childRelationProposalLaunched) return;

      // ------------------------

      const referenceChildProposalIsValid = (node: FullNodeData) =>
        node && Boolean(node.isNew) && node.open && node.editable && node.nodeType === "Reference";
      const childReferenceProposalLaunched = detectAndCallChildTutorial(
        "childReference",
        referenceChildProposalIsValid
      );
      if (childReferenceProposalLaunched) return;

      // ------------------------

      const questionChildProposalIsValid = (node: FullNodeData) =>
        node && Boolean(node.isNew) && node.open && node.editable && node.nodeType === "Question";
      const childQuestionProposalLaunched = detectAndCallChildTutorial("childQuestion", questionChildProposalIsValid);
      if (childQuestionProposalLaunched) return;

      // ------------------------

      const ideaChildProposalIsValid = (node: FullNodeData) =>
        node && Boolean(node.isNew) && node.open && node.editable && node.nodeType === "Idea";
      const childIdeaProposalLaunched = detectAndCallChildTutorial("childIdea", ideaChildProposalIsValid);
      if (childIdeaProposalLaunched) return;

      // ------------------------

      const codeChildProposalIsValid = (node: FullNodeData) =>
        node && Boolean(node.isNew) && node.open && node.editable && node.nodeType === "Code";
      const childCodeProposalLaunched = detectAndCallChildTutorial("childCode", codeChildProposalIsValid);
      if (childCodeProposalLaunched) return;

      // ------------------------

      const childTypes: TutorialTypeKeys[] = [
        "childProposal",
        "childConcept",
        "childRelation",
        "childReference",
        "childQuestion",
        "childIdea",
        "childCode",
      ];

      if (forcedTutorial && childTypes.includes(forcedTutorial)) {
        const defaultStates = { open: true };
        // const targetIsInvalid = (node: FullNodeData) => !node.open || node.editable;
        const newTargetId = "r98BjyFDCe4YyLA3U8ZE";
        const thisNode = graph.nodes[newTargetId];
        console.log(11);
        if (!tmpEditNodeIsValid(thisNode)) {
          if (!tutorialStateWasSetUpRef.current) {
            console.log(12);
            openNodeHandler(newTargetId, defaultStates);
            tutorialStateWasSetUpRef.current = true;
          }
          return;
        }

        console.log(13);
        // disableForceTutorial("proposal");
        tutorialStateWasSetUpRef.current = false;
        nodeBookDispatch({ type: "setSelectedNode", payload: newTargetId });
        notebookRef.current.selectedNode = newTargetId;
        console.log("tmpEditNode is launched");
        startTutorial("tmpEditNode");
        setTargetId(newTargetId);

        setNodeUpdates({
          nodeIds: [newTargetId],
          updatedAt: new Date(),
        });

        return;
        // detectAndForceTutorial("tmpEditNode", "r98BjyFDCe4YyLA3U8ZE", thisNode => thisNode.open, { open: true });
      }

      // // --------------------------

      // if (userTutorial.childConcept.forceTutorial) {
      //   return forceTutorial("r98BjyFDCe4YyLA3U8ZE", "childConcept", { open: true });
      // }

      // if (
      //   selectedNodeFromTemporalNode &&
      //   selectedNodeFromTemporalNode.nodeType === "Concept" &&
      //   !userTutorial.childConcept.done &&
      //   !userTutorial.childConcept.skipped
      // ) {
      //   setTargetId(selectedNodeFromTemporalNode.node);
      //   setTutorial({ name: "childConcept", step: 1, steps: [] });
      //   return;
      // }
    };
    detectTriggerTutorial();
  }, [
    detectAndCallChildTutorial,
    detectAndCallTutorial,
    detectAndForceTutorial,
    firstLoading,
    forcedTutorial,
    graph.nodes,
    nodeBookDispatch,
    nodeBookState.selectedNode,
    openNodeHandler,
    openSidebar,
    setTargetId,
    setTutorial,
    startTutorial,
    tutorial,
    userTutorial,
    userTutorialLoaded,
  ]);

  useEffect(() => {
    if (!userTutorialLoaded) return;
    if (firstLoading) return;
    if (!tutorial) return;

    devLog("USE_EFFECT: DETECT_TO_REMOVE_TUTORIAL", tutorial);

    if (tutorial.name === "nodes") {
      const nodesTutorialIsValid = (node: FullNodeData) => node && node.open;
      const node = graph.nodes[targetId];
      if (!nodesTutorialIsValid(node)) {
        setTutorial(null);
        setForcedTutorial(null);
        // tutorialStateWasSetUpRef.current = false;
        // console.log("remove node t");
      }
    }
    const conceptTutorialIsValid = (thisNode: FullNodeData) =>
      thisNode && thisNode.open && thisNode.nodeType === "Concept";
    detectAndRemoveTutorial("concept", conceptTutorialIsValid);

    // --------------------------

    const relationTutorialIsValid = (thisNode: FullNodeData) =>
      thisNode && thisNode.open && thisNode.nodeType === "Relation";
    detectAndRemoveTutorial("relation", relationTutorialIsValid);

    // --------------------------
    const referenceTutorialIsValid = (thisNode: FullNodeData) =>
      thisNode && thisNode.open && thisNode.nodeType === "Reference";
    detectAndRemoveTutorial("reference", referenceTutorialIsValid);

    // --------------------------
    const questionTutorialIsValid = (thisNode: FullNodeData) =>
      thisNode && thisNode.open && thisNode.nodeType === "Question";
    detectAndRemoveTutorial("question", questionTutorialIsValid);

    // --------------------------
    const ideaTutorialIsValid = (thisNode: FullNodeData) => thisNode && thisNode.open && thisNode.nodeType === "Idea";
    detectAndRemoveTutorial("idea", ideaTutorialIsValid);

    // --------------------------
    const codeTutorialIsValid = (thisNode: FullNodeData) => thisNode && thisNode.open && thisNode.nodeType === "Code";
    detectAndRemoveTutorial("code", codeTutorialIsValid);
    // --------------------------
    const conceptProposalTutorialIsValid = (thisNode: FullNodeData) =>
      thisNode && thisNode.open && thisNode.editable && thisNode.nodeType === "Concept";
    detectAndRemoveTutorial("proposalConcept", conceptProposalTutorialIsValid);
    // --------------------------
    const relationProposalTutorialIsValid = (thisNode: FullNodeData) =>
      thisNode && thisNode.open && thisNode.editable && thisNode.nodeType === "Relation";
    detectAndRemoveTutorial("proposalRelation", relationProposalTutorialIsValid);
    // --------------------------
    const referenceProposalTutorialIsValid = (thisNode: FullNodeData) =>
      thisNode && thisNode.open && thisNode.editable && thisNode.nodeType === "Reference";
    detectAndRemoveTutorial("proposalReference", referenceProposalTutorialIsValid);
    // --------------------------
    const questionProposalTutorialIsValid = (thisNode: FullNodeData) =>
      thisNode && thisNode.open && thisNode.editable && thisNode.nodeType === "Question";
    detectAndRemoveTutorial("proposalQuestion", questionProposalTutorialIsValid);
    // --------------------------
    const ideaProposalTutorialIsValid = (thisNode: FullNodeData) =>
      thisNode && thisNode.open && thisNode.editable && thisNode.nodeType === "Idea";
    detectAndRemoveTutorial("proposalIdea", ideaProposalTutorialIsValid);
    // --------------------------
    const codeProposalTutorialIsValid = (thisNode: FullNodeData) =>
      thisNode && thisNode.open && thisNode.editable && thisNode.nodeType === "Code";
    detectAndRemoveTutorial("proposalCode", codeProposalTutorialIsValid);
    // --------------------------
    // if (tutorial.name === "concept") {
    //   const node = graph.nodes[targetId];
    //   if (!conceptTutorialIsValid(node)) {
    //     setTutorial(null);
    //     setForcedTutorial(null);
    //   }
    // }
    // --------------------------

    // --------------------------
    if (tutorial.name === "childConcept") {
      const childConceptProposalIsValid = (node: FullNodeData) =>
        node && Boolean(node.isNew) && node.open && node.editable && node.nodeType === "Concept";

      const node = graph.nodes[targetId];
      if (!childConceptProposalIsValid(node)) {
        setTutorial(null);
        setForcedTutorial(null);
      }
    }
    if (tutorial.name === "tmpEditNode") {
      console.log("111aaa");
      const tmpEditNodeIsValid = (node: FullNodeData) => node && node.open && !node.editable;
      const node = graph.nodes[targetId];
      if (!tmpEditNodeIsValid(node)) {
        console.log("222aaa");
        setTutorial(null);
        if (node && node.editable) return;
        console.log("333aaa");

        setForcedTutorial(null);
      }
    }
    if (tutorial.name === "tmpProposalConceptChild") {
      console.log("aaaaaaaa");
      const isValid = (node: FullNodeData) => node && node.open && node.editable;
      const node = graph.nodes[targetId];
      if (!isValid(node)) {
        console.log("bbbb");
        setTutorial(null);
        if (node && !node.editable) return;
        console.log("ccccc");
        setForcedTutorial(null);
      }
    }
  }, [detectAndRemoveTutorial, firstLoading, graph.nodes, setTutorial, targetId, tutorial, userTutorialLoaded]);

  useEffect(() => {
    if (!tutorial) return;
    if (tutorial.name === "childProposal") {
      const thisNode = graph.nodes[targetId];
      if (!thisNode) return;

      const childTargetId = thisNode.children.map(cur => cur.node).find(cur => tempNodes.has(cur));
      if (!childTargetId) return;

      setTargetId(childTargetId);
    }
  }, [graph.nodes, setTargetId, targetId, tutorial]);

  return (
    <div className="MapContainer" style={{ overflow: "hidden" }}>
      {currentStep?.anchor && (
        <Portal anchor="portal">
          {tutorial && (
            <TooltipTutorial
              tutorialStep={currentStep}
              tutorial={tutorial}
              targetClientRect={targetClientRect}
              handleCloseProgressBarMenu={handleCloseProgressBarMenu}
              onSkip={onSkipTutorial}
              onFinalize={onFinalizeTutorial}
              onNextStep={onNextStep}
              onPreviousStep={onPreviousStep}
              stepsLength={tutorial.steps.length}
              node={graph.nodes[nodeBookState.selectedNode ?? ""]}
            />
          )}
        </Portal>
      )}
      <Box
        id="Map"
        className={
          notebookRef.current.choosingNode && notebookRef.current.choosingNode.type !== "Reference"
            ? "ChoosableNotebook"
            : ""
        }
        sx={{
          overflow: "hidden",
          position: "relative",
          background:
            settings.background === "Color"
              ? theme =>
                  settings.theme === "Dark"
                    ? theme.palette.common.darkGrayBackground
                    : theme.palette.common.lightGrayBackground
              : undefined,
        }}
      >
        {nodeBookState.choosingNode && (
          <div id="ChoosingNodeMessage">
            Click the node you'd like to link to...{" "}
            <Button
              onClick={() => {
                notebookRef.current.choosingNode = null;
                notebookRef.current.selectedNode = null;
                notebookRef.current.chosenNode = null;
                nodeBookDispatch({ type: "setChoosingNode", payload: null });
                nodeBookDispatch({ type: "setSelectedNode", payload: null });
                nodeBookDispatch({ type: "setChosenNode", payload: null });
              }}
            >
              <CloseIcon fontSize="large" />
            </Button>
          </div>
        )}
        <Box sx={{ width: "100vw", height: "100vh" }}>
          {
            <Drawer anchor={"right"} open={openDeveloperMenu} onClose={() => setOpenDeveloperMenu(false)}>
              {/* Data from map, don't REMOVE */}
              <Box>
                Interaction map from '{user?.uname}' with [{Object.entries(graph.nodes).length}] Nodes
              </Box>

              <Divider />

              <Typography>Global states:</Typography>
              <Box>
                <Button onClick={() => console.log(graph.nodes)}>nodes</Button>
                <Button onClick={() => console.log(graph.edges)}>edges</Button>
                <Button onClick={() => console.log(allTags)}>allTags</Button>
              </Box>
              <Box>
                <Button onClick={() => console.log("DAGGER", g)}>Dagre</Button>
                <Button onClick={() => console.log(nodeBookState)}>nodeBookState</Button>
                <Button onClick={() => console.log(notebookRef)}>notebookRef</Button>
                <Button onClick={() => console.log(user)}>user</Button>
                <Button onClick={() => console.log(settings)}>setting</Button>
                <Button onClick={() => console.log(reputation)}>reputation</Button>
                <Button onClick={() => console.log(openSidebar)}>open sidebar</Button>
              </Box>
              <Box>
                <Button onClick={() => console.log(nodeChanges)}>node changes</Button>
                <Button onClick={() => console.log(mapRendered)}>map rendered</Button>
                <Button onClick={() => console.log(userNodeChanges)}>user node changes</Button>
                <Button onClick={() => console.log(nodeBookState)}>show global state</Button>
                <Button
                  onClick={() =>
                    setReputationSignal([
                      {
                        uname: "1man",
                        reputation: 1,
                        type: ["All Time", "Weekly"],
                      },
                    ])
                  }
                >
                  Test Increment Reputation
                </Button>
                <Button
                  onClick={() =>
                    setReputationSignal([
                      {
                        uname: "1man",
                        reputation: -1,
                        type: ["All Time", "Weekly"],
                      },
                    ])
                  }
                >
                  Test Decrement Reputation
                </Button>
              </Box>
              <Box>
                <Button onClick={() => console.log(tempNodes)}>tempNodes</Button>
                <Button onClick={() => console.log({ ...changedNodes })}>changedNodes</Button>
              </Box>

              <Divider />

              <Box>
                <Button onClick={() => console.log(allNodes)}>All Nodes</Button>
                <Button onClick={() => console.log(citations)}>citations</Button>
                <Button onClick={() => console.log(clusterNodes)}>clusterNodes</Button>
              </Box>

              <Divider />

              <Typography>Tutorial:</Typography>
              <Box>
                <Button onClick={() => console.log(tutorial)}>Tutorial</Button>
                <Button onClick={() => console.log(userTutorial)}>userTutorial</Button>
                <Button onClick={() => console.log(targetId)}>targetId</Button>
                <Button onClick={() => console.log(forcedTutorial)}>forcedTutorial</Button>
              </Box>

              <Divider />

              <Typography>Functions:</Typography>
              <Box>
                <Button onClick={() => nodeBookDispatch({ type: "setSelectionType", payload: "Proposals" })}>
                  Toggle Open proposals
                </Button>
                <Button onClick={() => nodeBookDispatch({ type: "setSelectionType", payload: "Proposals" })}>
                  Open Proposal
                </Button>
                <Button onClick={() => openNodeHandler("r98BjyFDCe4YyLA3U8ZE")}>Open Node Handler</Button>
                <Button onClick={() => setShowRegion(prev => !prev)}>Show Region</Button>
              </Box>
            </Drawer>
          }
          {user && reputation && (userTutorial.navigation.done || userTutorial.navigation.skipped) && (
            <Box
              sx={{
                "& .GainedPoint, & .LostPoint": {
                  borderRadius: "50%",
                },
              }}
            >
              <MemoizedToolbarSidebar
                open={true}
                onClose={() => setOpenSidebar(null)}
                reloadPermanentGrpah={reloadPermanentGraph}
                user={user}
                reputationSignal={reputationSignal}
                reputation={reputation}
                theme={settings.theme}
                setOpenSideBar={onOpenSideBar}
                mapRendered={true}
                selectedUser={selectedUser}
                uncheckedNotificationsNum={uncheckedNotificationsNum}
                bookmarkUpdatesNum={bookmarkUpdatesNum}
                pendingProposalsNum={pendingProposalsNum}
                openSidebar={openSidebar}
                windowHeight={windowHeight}
                onlineUsers={onlineUsers}
                usersOnlineStatusLoaded={usersOnlineStatusLoaded}
                disableToolbar={Boolean(["TutorialStep"].includes("TOOLBAR"))}
                // setCurrentTutorial={setCurrentTutorial}
                userTutorial={userTutorial}
              />

              <MemoizedBookmarksSidebar
                theme={settings.theme}
                openLinkedNode={openLinkedNode}
                username={user.uname}
                open={openSidebar === "BOOKMARKS_SIDEBAR"}
                onClose={() => setOpenSidebar(null)}
                sidebarWidth={sidebarWidth()}
                innerHeight={innerHeight}
                innerWidth={windowWith}
                bookmark={bookmark}
              />
              <MemoizedSearcherSidebar
                notebookRef={notebookRef}
                openLinkedNode={openLinkedNode}
                open={openSidebar === "SEARCHER_SIDEBAR"}
                onClose={() => setOpenSidebar(null)}
                sidebarWidth={sidebarWidth()}
                innerHeight={innerHeight}
                innerWidth={windowWith}
                disableSearcher={Boolean(["TT"].includes("SEARCHER_SIDEBAR"))}
                enableElements={[]}
              />
              <MemoizedNotificationSidebar
                theme={settings.theme}
                openLinkedNode={openLinkedNode}
                username={user.uname}
                open={openSidebar === "NOTIFICATION_SIDEBAR"}
                onClose={() => setOpenSidebar(null)}
                sidebarWidth={sidebarWidth()}
                innerHeight={innerHeight}
                innerWidth={windowWith}
              />
              <MemoizedPendingProposalSidebar
                theme={settings.theme}
                openLinkedNode={openLinkedNode}
                username={user.uname}
                tagId={user.tagId}
                open={openSidebar === "PENDING_PROPOSALS"}
                onClose={() => onCloseSidebar()}
                sidebarWidth={sidebarWidth()}
                innerHeight={innerHeight}
                innerWidth={windowWith}
              />
              <MemoizedUserInfoSidebar
                theme={settings.theme}
                openLinkedNode={openLinkedNode}
                username={user.uname}
                open={openSidebar === "USER_INFO"}
                onClose={() => setOpenSidebar(null)}
              />

              <MemoizedProposalsSidebar
                theme={settings.theme}
                open={openSidebar === "PROPOSALS"}
                onClose={() => onCloseSidebar()}
                clearInitialProposal={clearInitialProposal}
                initialProposal={nodeBookState.initialProposal}
                nodeLoaded={graph.nodes.hasOwnProperty(String(nodeBookState.selectedNode))}
                proposeNodeImprovement={proposeNodeImprovement}
                fetchProposals={fetchProposals}
                selectedNode={nodeBookState.selectedNode}
                rateProposal={rateProposal}
                selectProposal={selectProposal}
                deleteProposal={deleteProposal}
                proposeNewChild={proposeNewChild}
                openProposal={openProposal}
                db={db}
                sidebarWidth={sidebarWidth()}
                innerHeight={innerHeight}
                innerWidth={windowWith}
                username={user.uname}
              />

              <MemoizedUserSettingsSidebar
                notebookRef={notebookRef}
                openLinkedNode={openLinkedNode}
                theme={settings.theme}
                open={openSidebar === "USER_SETTINGS"}
                onClose={() => setOpenSidebar(null)}
                dispatch={dispatch}
                nodeBookDispatch={nodeBookDispatch}
                nodeBookState={nodeBookState}
                userReputation={reputation}
                user={user}
                scrollToNode={scrollToNode}
                settings={settings}
              />
              {nodeBookState.selectedNode && (
                <CitationsSidebar
                  open={openSidebar === "CITATIONS"}
                  onClose={() => setOpenSidebar(null)}
                  openLinkedNode={openLinkedNode}
                  identifier={nodeBookState.selectedNode}
                  sidebarWidth={sidebarWidth()}
                  innerHeight={innerHeight}
                  innerWidth={windowWith}
                />
              )}
            </Box>
          )}

          <MemoizedCommunityLeaderboard
            userTagId={user?.tagId ?? ""}
            pendingProposalsLoaded={pendingProposalsLoaded}
            disabled={Boolean(["TT"].includes("COMMUNITY_LEADERBOARD"))}
          />

          {isQueueWorking && (
            <CircularProgress
              size={46}
              sx={{
                position: "fixed",
                top: {
                  xs: !openSidebar
                    ? "7px"
                    : openSidebar && openSidebar !== "SEARCHER_SIDEBAR"
                    ? `${innerHeight * 0.35 + 7}px`
                    : `${innerHeight * 0.25 + 7}px`,
                  sm: "7px",
                },

                right: "157px",
                zIndex: "1300",
              }}
            />
          )}
          {nodeBookState.selectedNode && (
            <Tooltip title="Scroll to last Selected Node" placement="left">
              {/* <span> */}
              <IconButton
                color="secondary"
                onClick={onScrollToLastNode}
                disabled={["TT"].includes("SCROLL_TO_NODE_BUTTON")}
                sx={{
                  position: "fixed",
                  top: {
                    xs: !openSidebar
                      ? "10px"
                      : openSidebar && openSidebar !== "SEARCHER_SIDEBAR"
                      ? `${innerHeight * 0.35 + 10}px`
                      : `${innerHeight * 0.25 + 10}px`,
                    sm: "10px",
                  },
                  right: "160px",
                  zIndex: "1300",

                  transition: "all 1s ease",
                  background: theme => (theme.palette.mode === "dark" ? "#1f1f1f" : "#f0f0f0"),
                  ":hover": {
                    background: theme => (theme.palette.mode === "dark" ? "#454545" : "#d6d4d4"),
                  },
                  ":disabled": {
                    pointerEvents: "auto!important",
                    background: theme => (theme.palette.mode === "dark" ? "#1f1f1fb9" : "#f0f0f0be"),
                    cursor: "not-allowed!important",
                  },
                }}
              >
                <MyLocationIcon />
              </IconButton>
              {/* </span> */}
            </Tooltip>
          )}
          <Tooltip
            title="Redraw graph"
            placement="left"
            sx={{
              position: "fixed",
              top: {
                // xs: !openSidebar
                //   ? "60px"
                //   : openSidebar && openSidebar !== "SEARCHER_SIDEBAR"
                //   ? `${innerHeight * 0.35 + 65}px`
                //   : `${innerHeight * 0.25 + 65}px`,
                // sm: "60px",
                xs: !openSidebar
                  ? "10px"
                  : openSidebar && openSidebar !== "SEARCHER_SIDEBAR"
                  ? `${innerHeight * 0.35 + 10}px`
                  : `${innerHeight * 0.25 + 10}px`,
                sm: "10px",
              },
              right: "110px",
              zIndex: "1300",
              background: theme => (theme.palette.mode === "dark" ? "#1f1f1f" : "#f0f0f0"),
              ":hover": {
                background: theme => (theme.palette.mode === "dark" ? "#454545" : "#d6d4d4"),
              },
              transition: "all 1s ease",
            }}
          >
            <IconButton color="secondary" onClick={onRedrawGraph}>
              <AutoFixHighIcon />
            </IconButton>
          </Tooltip>

          {
            <Tooltip
              title="Start tutorial"
              placement="left"
              sx={{
                position: "fixed",
                top: {
                  // xs: !openSidebar
                  //   ? "60px"
                  //   : openSidebar && openSidebar !== "SEARCHER_SIDEBAR"
                  //   ? `${innerHeight * 0.35 + 65}px`
                  //   : `${innerHeight * 0.25 + 65}px`,
                  // sm: "60px",
                  xs: !openSidebar
                    ? "10px"
                    : openSidebar && openSidebar !== "SEARCHER_SIDEBAR"
                    ? `${innerHeight * 0.35 + 10}px`
                    : `${innerHeight * 0.25 + 10}px`,
                  sm: "10px",
                },
                right: "10px",
                zIndex: "1300",
                background: theme => (theme.palette.mode === "dark" ? "#1f1f1f" : "#f0f0f0"),
                ":hover": {
                  background: theme => (theme.palette.mode === "dark" ? "#454545" : "#d6d4d4"),
                },
                transition: "all 1s ease",
              }}
            >
              <IconButton
                color="secondary"
                onClick={() => {
                  setOpenProgressBar(true);
                }}
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>
          }

          {process.env.NODE_ENV === "development" && (
            <Tooltip
              title={"Watch geek data"}
              sx={{
                position: "fixed",
                bottom: "60px",
                left: "10px",
                zIndex: "99999",
                transition: "all 1s ease",
                background: theme => (theme.palette.mode === "dark" ? "#1f1f1f" : "#f0f0f0"),
                ":hover": {
                  background: theme => (theme.palette.mode === "dark" ? "#454545" : "#d6d4d4"),
                },
              }}
            >
              {/* DEVTOOLS */}
              <IconButton onClick={() => setOpenDeveloperMenu(!openDeveloperMenu)}>
                <CodeIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Focused view for selected node" placement="left">
            <IconButton
              color="secondary"
              onClick={() => {
                setFocusView({ isEnabled: true, selectedNode: nodeBookState.selectedNode || "" });
              }}
              disabled={["TT"].includes("FOCUS_MODE_BUTTON")}
              sx={{
                position: "fixed",
                top: {
                  // xs: !openSidebar
                  //   ? "110px"
                  //   : openSidebar && openSidebar !== "SEARCHER_SIDEBAR"
                  //   ? `${innerHeight * 0.35 + 120}px`
                  //   : `${innerHeight * 0.25 + 120}px`,
                  // sm: "110px",
                  xs: !openSidebar
                    ? "10px"
                    : openSidebar && openSidebar !== "SEARCHER_SIDEBAR"
                    ? `${innerHeight * 0.35 + 10}px`
                    : `${innerHeight * 0.25 + 10}px`,
                  sm: "10px",
                },
                right: "60px",
                zIndex: "1300",
                background: theme => (theme.palette.mode === "dark" ? "#1f1f1f" : "#f0f0f0"),
                ":hover": {
                  background: theme => (theme.palette.mode === "dark" ? "#454545" : "#d6d4d4"),
                },
                transition: "all 1s ease",
                ":disabled": {
                  pointerEvents: "auto!important",
                  background: theme => (theme.palette.mode === "dark" ? "#1f1f1fb9" : "#f0f0f0be"),
                  cursor: "not-allowed!important",
                },
              }}
            >
              <NextImage
                src={theme.palette.mode === "light" ? focusViewLogo : focusViewDarkLogo}
                alt="logo 1cademy"
                width="24px"
                height="24px"
              />
            </IconButton>
          </Tooltip>
          {/* end Data from map */}

          {window.innerHeight > 399 && user?.livelinessBar === "interaction" && (
            <MemoizedLivelinessBar
              authEmail={user?.email}
              openUserInfoSidebar={openUserInfoSidebar}
              onlineUsers={onlineUsers}
              db={db}
            />
          )}

          {window.innerHeight > 399 && user?.livelinessBar === "reputation" && (
            <MemoizedReputationlinessBar
              authEmail={user?.email}
              openUserInfoSidebar={openUserInfoSidebar}
              onlineUsers={onlineUsers}
              db={db}
              user={user}
            />
          )}

          {focusView.isEnabled && (
            <MemoizedFocusedNotebook
              setSelectedNode={setSelectedNode}
              db={db}
              graph={graph}
              setFocusView={setFocusView}
              focusedNode={focusView.selectedNode}
              openLinkedNode={openLinkedNode}
            />
          )}

          {settings.view === "Graph" && (
            <Box
              id="MapContent"
              className={scrollToNodeInitialized.current ? "ScrollToNode" : undefined}
              onMouseOver={mapContentMouseOver}
              onTouchStart={mapContentMouseOver}
              onMouseUp={onMouseClick}
            >
              <MapInteractionCSS
                textIsHovered={mapHovered}
                /*identifier={'xdf'}*/
                value={mapInteractionValue}
                onChange={navigateWhenNotScrolling}
              >
                {!currentStep?.anchor && tutorial && (
                  <TooltipTutorial
                    tutorial={tutorial}
                    tutorialStep={currentStep}
                    targetClientRect={targetClientRect}
                    handleCloseProgressBarMenu={handleCloseProgressBarMenu}
                    onSkip={onSkipTutorial}
                    onFinalize={onFinalizeTutorial}
                    onNextStep={onNextStep}
                    onPreviousStep={onPreviousStep}
                    stepsLength={tutorial.steps.length}
                    node={graph.nodes[nodeBookState.selectedNode ?? ""]}
                    // tutorialState={stateNodeTutorial}
                    // onChangeStep={onChangeStep}
                    // targetClientRect={targetClientRect}
                    // handleCloseProgressBarMenu={handleCloseProgressBarMenu}
                    // onSkipTutorial={onSkipTutorial}
                  />
                )}
                {settings.showClusterOptions && settings.showClusters && (
                  <MemoizedClustersList clusterNodes={clusterNodes} />
                )}
                <MemoizedLinksList edgeIds={edgeIds} edges={graph.edges} selectedRelation={selectedRelation} />
                <MemoizedNodeList
                  nodeUpdates={nodeUpdates}
                  notebookRef={notebookRef}
                  setNodeUpdates={setNodeUpdates}
                  setFocusView={setFocusView}
                  nodes={graph.nodes}
                  bookmark={bookmark}
                  markStudied={markStudied}
                  chosenNodeChanged={chosenNodeChanged}
                  referenceLabelChange={referenceLabelChange}
                  deleteLink={deleteLink}
                  cleanEditorLink={cleanEditorLink}
                  openLinkedNode={openLinkedNode}
                  openAllChildren={openAllChildren}
                  openAllParent={openAllParent}
                  hideNodeHandler={hideNodeHandler}
                  hideOffsprings={hideOffsprings}
                  toggleNode={toggleNode}
                  openNodePart={openNodePart}
                  onNodeShare={onNodeShare}
                  selectNode={selectNode}
                  nodeClicked={nodeClicked} // CHECK when is used
                  correctNode={correctNode}
                  wrongNode={wrongNode}
                  uploadNodeImage={uploadNodeImage}
                  removeImage={removeImage}
                  setOpenMedia={(imgUrl: string | boolean) => {
                    setOpenMedia(imgUrl);
                  }}
                  changeNodeHight={changeNodeHight}
                  changeChoice={changeChoice}
                  changeFeedback={changeFeedback}
                  switchChoice={switchChoice}
                  deleteChoice={deleteChoice}
                  addChoice={addChoice}
                  onNodeTitleBlur={onNodeTitleBlur}
                  setOpenSearch={setOpenSearch}
                  saveProposedChildNode={saveProposedChildNode}
                  saveProposedImprovement={saveProposedImprovement}
                  closeSideBar={closeSideBar}
                  reloadPermanentGrpah={reloadPermanentGraph}
                  setNodeParts={setNodeParts}
                  citations={citations}
                  setOpenSideBar={setOpenSidebar}
                  proposeNodeImprovement={proposeNodeImprovement}
                  proposeNewChild={proposeNewChild}
                  scrollToNode={scrollToNode}
                  openSidebar={openSidebar}
                  setOperation={setOperation}
                  openUserInfoSidebar={openUserInfoSidebar}
                  disabledNodes={[]}
                  enableChildElements={[]}
                />
              </MapInteractionCSS>
              {showRegion && (
                <Box
                  sx={{
                    position: "absolute",
                    top: windowInnerTop,
                    bottom: windowInnerBottom,
                    left: windowInnerLeft,
                    right: windowInnerRight,
                    background: "rgba(255,255,255,.125)",
                    pointerEvents: "none",
                    borderRadius: "4px",
                    border: "dashed 4px #f09816",
                  }}
                ></Box>
              )}

              <Suspense fallback={<div></div>}>
                <Modal
                  open={Boolean(openMedia)}
                  onClose={() => setOpenMedia(false)}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <>
                    <CloseIcon
                      sx={{ position: "absolute", top: "60px", right: "50px", zIndex: "99" }}
                      onClick={() => setOpenMedia(false)}
                    />
                    <MapInteractionCSS>
                      {/* TODO: change open Media variable to string to not validate */}
                      {typeof openMedia === "string" && (
                        <Paper
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100vh",
                            width: "100vw",
                            background: "transparent",
                          }}
                        >
                          {/* TODO: change to Next Image */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={openMedia} alt="Node image" className="responsive-img" />
                        </Paper>
                      )}
                    </MapInteractionCSS>
                  </>
                </Modal>
                {(isSubmitting || (!queueFinished && firstLoading)) && (
                  <div className="CenterredLoadingImageContainer">
                    <Image
                      className="CenterredLoadingImage"
                      loading="lazy"
                      src={LoadingImg}
                      alt="Loading"
                      width={250}
                      height={250}
                    />
                  </div>
                )}
              </Suspense>
            </Box>
          )}

          {settings.view === "Masonry" && (
            <Box sx={{ height: "100vh", overflow: "auto" }}>
              <Container>
                <Masonry sx={{ my: 4, mx: { md: "0px" } }} columns={{ xm: 1, md: 2 }} spacing={4} defaultHeight={450}>
                  {Object.keys(graph.nodes)
                    .map(key => graph.nodes[key])
                    .map(fullNode => {
                      const simpleNode: SimpleNode2 = {
                        id: fullNode.node,
                        choices: fullNode.choices,
                        contributors: Object.keys(fullNode.contributors).map(key => ({
                          fullName: fullNode.contributors[key].fullname,
                          imageUrl: fullNode.contributors[key].imageUrl,
                          username: key,
                        })),
                        institutions: Object.keys(fullNode.institutions).map(key => ({ name: key })),
                        nodeType: fullNode.nodeType,
                        tags: fullNode.tags,
                        versions: fullNode.versions ?? 0,
                        changedAt: fullNode.changedAt.toString(),
                        content: fullNode.content,
                        corrects: fullNode.corrects,
                        nodeImage: fullNode.nodeImage,
                        studied: fullNode.isStudied,
                        title: fullNode.title,
                        wrongs: fullNode.wrongs,
                      };
                      return simpleNode;
                    })
                    .map((simpleNode: SimpleNode2) => (
                      <NodeItemDashboard
                        key={simpleNode.id}
                        node={simpleNode}
                        userId={user?.userId}
                        identifier={simpleNode.id}
                        onHideNode={hideNodeHandler}
                      />
                    ))}
                </Masonry>
              </Container>
              <Suspense fallback={<div></div>}>
                {(isSubmitting || (!queueFinished && firstLoading)) && (
                  <div className="CenterredLoadingImageContainer">
                    <Image className="CenterredLoadingImage" src={LoadingImg} alt="Loading" width={250} height={250} />
                  </div>
                )}
              </Suspense>
            </Box>
          )}
          {/* <MemoizedProgressBarMenu
            open={openProgressBarMenu}
            handleOpenProgressBar={handleOpenProgressBar}
            currentStep={stateNodeTutorial?.currentStepName ?? 0}
          /> */}
          <MemoizedTutorialTableOfContent
            open={openProgressBar}
            reloadPermanentGraph={reloadPermanentGraph}
            handleCloseProgressBar={() => setOpenProgressBar(false)}
            tutorials={{
              navigation: { title: "x Navigation", steps: NAVIGATION_STEPS_COMPLETE },
              nodes: { title: "x Node", steps: NODES_STEPS_COMPLETE },
              searcher: { title: "x Searcher", steps: SEARCHER_STEPS_COMPLETE },
              proposal: { title: "x Proposal", steps: PROPOSAL_STEPS_COMPLETE },
              proposalCode: { title: "x Proposal Code", steps: PROPOSING_CODE_EDIT_COMPLETE },
              proposalConcept: { title: "x Proposal Concept", steps: PROPOSING_CONCEPT_EDIT_COMPLETE },
              proposalIdea: { title: "x Proposal Idea", steps: PROPOSING_IDEA_EDIT_COMPLETE },
              proposalQuestion: { title: "x Proposal Question", steps: PROPOSING_QUESTION_EDIT_COMPLETE },
              proposalReference: { title: "x Proposal Reference", steps: PROPOSING_REFERENCE_EDIT_COMPLETE },
              proposalRelation: { title: "x Proposal Relation", steps: PROPOSING_RELATION_EDIT_COMPLETE },
              concept: { title: "x Concept Node", steps: NODE_CODE },
              relation: { title: "x Relation Node", steps: NODE_RELATION },
              reference: { title: "x Reference Node", steps: NODE_REFERENCE },
              question: { title: "x Question Node", steps: NODE_QUESTION },
              idea: { title: "x Idea Node", steps: NODE_IDEA },
              code: { title: "x Code Node", steps: NODE_CODE },
              reconcilingAcceptedProposal: {
                title: "Accepted Proposals",
                steps: RECONCILING_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
              },
              reconcilingNotAcceptedProposal: {
                title: "Not Accepted Proposal",
                steps: RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
              },
              childProposal: { title: "x Child Proposal", steps: CHILD_PROPOSAL_COMPLETE },
              childConcept: { title: "x Propose Child Concept Node", steps: CHILD_CONCEPT_PROPOSAL_COMPLETE },
              childRelation: { title: "Propose Child Relation Node", steps: CHILD_RELATION_PROPOSAL_COMPLETE },
              childReference: { title: "Propose Child Reference Node", steps: CHILD_REFERENCE_PROPOSAL_COMPLETE },
              childQuestion: { title: "Propose Child Question Node", steps: CHILD_QUESTION_PROPOSAL_COMPLETE },
              childIdea: { title: "Propose Child Idea Node", steps: CHILD_IDEA_PROPOSAL_COMPLETE },
              childCode: { title: "Propose Child Code Node", steps: CHILD_CODE_PROPOSAL_COMPLETE },

              tmpEditNode: { title: "Temporal Edit Node", steps: [], hide: true },
              tmpProposalConceptChild: { title: "Temporal Concept Node", steps: [], hide: true },
              tmpProposalRelationChild: { title: "Temporal Relation Node", steps: [], hide: true },
              tmpProposalQuestionChild: { title: "Temporal Question Node", steps: [], hide: true },
              tmpProposalReferenceChild: { title: "Temporal Reference Node", steps: [], hide: true },
              tmpProposalCodeChild: { title: "Temporal Code Node", steps: [], hide: true },
              tmpProposalIdeaChild: { title: "Temporal Idea Node", steps: [], hide: true },
            }}
            userTutorialState={userTutorial}
            onCancelTutorial={() =>
              setTutorial(p => {
                const previousStep = getTutorialStep(p);
                console.log({ previousStep });
                if (previousStep?.childTargetId) removeStyleFromTarget(previousStep.childTargetId, targetId); // TODO: check this

                return null;
              })
            }
            onForceTutorial={setForcedTutorial}
          />
        </Box>
      </Box>
    </div>
  );
};

const NodeBook = () => (
  <NodeBookProvider>
    <Dashboard />
  </NodeBookProvider>
);
export default withAuthUser({
  shouldRedirectToLogin: true,
  shouldRedirectToHomeIfAuthenticated: false,
})(NodeBook);
