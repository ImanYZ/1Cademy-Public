import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import CloseIcon from "@mui/icons-material/Close";
import CodeIcon from "@mui/icons-material/Code";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import UndoIcon from "@mui/icons-material/Undo";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { Masonry } from "@mui/lab";
import {
  Button,
  ClickAwayListener,
  Container,
  Divider,
  IconButton,
  Input,
  Modal,
  Paper,
  Stack,
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
import NextImage from "next/image";
import Image from "next/image";
import { useRouter } from "next/router";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
/* eslint-disable */ //This wrapper comments it to use react-map-interaction without types
// @ts-ignore
import { MapInteractionCSS } from "react-map-interaction";
import { IChannels, IConversation } from "src/chatTypes";
import { channelsChange, getChannelsSnapshot } from "src/client/firestore/channels.firesrtore";
import {
  channelNotificationChange,
  getchatNotificationsSnapshot,
} from "src/client/firestore/chatNotifications.firesrtore";
import { getCommentNotificationsSnapshot } from "src/client/firestore/commentNotifications.firestore";
import { conversationChange, getConversationsSnapshot } from "src/client/firestore/conversations.firesrtore";
import { addClientErrorLog } from "src/client/firestore/errors.firestore";
import { getNodeChangesSnapshot } from "src/client/firestore/nodeChanges.firestore";
import { getUserNodesByForce } from "src/client/firestore/userNodes.firestore";
import { Instructor } from "src/instructorsTypes";
import { IAssistantEventDetail } from "src/types/IAssistant";
import { INode } from "src/types/INode";
import { INodeType } from "src/types/INodeType";
import { INodeVersion } from "src/types/INodeVersion";

/* eslint-enable */
import withAuthUser from "@/components/hoc/withAuthUser";
import { MemoizedCommunityLeaderboard } from "@/components/map/CommunityLeaderboard/CommunityLeaderboard";
import { MemoizedFocusedNotebook } from "@/components/map/FocusedNotebook/FocusedNotebook";
// import { MemoizedLivelinessBar } from "@/components/map/Liveliness/LivelinessBar";
// import { Bar } from "@/components/map/Liveliness/Bar";
// import { MemoizedRelativeLivelinessBar } from "@/components/map/Liveliness/RelativeLivelinessBar";
import { MemoizedBookmarksSidebar } from "@/components/map/Sidebar/SidebarV2/BookmarksSidebar";
import { MemoizedChatSidebar } from "@/components/map/Sidebar/SidebarV2/ChatSidebar";
import { CitationsSidebar } from "@/components/map/Sidebar/SidebarV2/CitationsSidebar";
import { MemoizedCommentsSidebar } from "@/components/map/Sidebar/SidebarV2/CommentsSidebar";
import { MemoizedNotificationSidebar } from "@/components/map/Sidebar/SidebarV2/NotificationSidebar";
import { ParentsSidebarMemoized } from "@/components/map/Sidebar/SidebarV2/ParentsChildrenSidebar";
import { MemoizedPendingProposalSidebar } from "@/components/map/Sidebar/SidebarV2/PendingProposalSidebar";
import { MemoizedProposalsSidebar } from "@/components/map/Sidebar/SidebarV2/ProposalsSidebar";
import { ReferencesSidebarMemoized } from "@/components/map/Sidebar/SidebarV2/ReferencesSidebar";
import { MemoizedSearcherSidebar } from "@/components/map/Sidebar/SidebarV2/SearcherSidebar";
import { TagsSidebarMemoized } from "@/components/map/Sidebar/SidebarV2/TagsSidebar";
import { MemoizedUserInfoSidebar } from "@/components/map/Sidebar/SidebarV2/UserInfoSidebar";
import { MemoizedUserSettingsSidebar } from "@/components/map/Sidebar/SidebarV2/UserSettigsSidebar";
import { useAuth } from "@/context/AuthContext";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import { useHover } from "@/hooks/userHover";
// import usePrevious from "@/hooks/usePrevious";
import { useTagsTreeView } from "@/hooks/useTagsTreeView";
import { saveMessagingDeviceToken } from "@/lib/firestoreClient/messaging";
// import { UploadConfirmation, useUploadImage } from "@/hooks/useUploadImage";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { getTutorialTargetIdFromCurrentStep, removeStyleFromTarget } from "@/lib/utils/tutorials/tutorial.utils";

import LoadingImg from "../../public/animated-icon-1cademy.gif";
import EditIcon from "../../public/edit.svg";
import { TargetClientRect, TooltipTutorial } from "../components/interactiveTutorial/TooltipTutorial";
import { Assistant } from "../components/map/Assistant";
// import nodesData from "../../testUtils/mockCollections/nodes.data";
// import { Tutorial } from "../components/interactiveTutorial/Tutorial";
import { MemoizedClustersList } from "../components/map/ClustersList";
import { DashboardWrapper, DashboardWrapperRef } from "../components/map/dashboard/DashboardWrapper";
import { MemoizedLinksList } from "../components/map/LinksList";
import { MemoizedNodeList } from "../components/map/NodesList";
import { NotebookPopup } from "../components/map/Popup";
import { MemoizedToolbarSidebar } from "../components/map/Sidebar/SidebarV2/ToolbarSidebar";
import { MemoizedToolbox } from "../components/map/Toolbox";
import { NodeItemDashboard } from "../components/NodeItemDashboard";
import { Portal } from "../components/Portal";
import Leaderboard from "../components/practiceTool/Leaderboard";
import { UserStatus } from "../components/practiceTool/UserStatus";
import { MemoizedTutorialTableOfContent } from "../components/tutorial/TutorialTableOfContent";
import { NodeBookProvider, useNodeBook } from "../context/NodeBookContext";
import { detectElements as detectHtmlElements } from "../hooks/detectElements";
import { useInteractiveTutorial } from "../hooks/useInteractiveTutorial3";
import { useMemoizedCallback } from "../hooks/useMemoizedCallback";
import { useWindowSize } from "../hooks/useWindowSize";
import { useWorkerQueue } from "../hooks/useWorkerQueue";
import { NodeChanges, ReputationSignal } from "../knowledgeTypes";
import { getIdToken, retrieveAuthenticatedUser } from "../lib/firestoreClient/auth";
import { Post } from "../lib/mapApi";
import { NO_USER_IMAGE, Z_INDEX } from "../lib/utils/constants";
import { createGraph, dagreUtils } from "../lib/utils/dagre.util";
import { devLog } from "../lib/utils/develop.util";
import { getCollectionsQuery } from "../lib/utils/getTypedCollections";
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
  generateReputationSignal,
  getInteractiveMapDefaultScale,
  getSelectionText,
  NODE_WIDTH,
  removeDagAllEdges,
  removeDagEdge,
  removeDagNode,
  setDagEdge,
  setDagNode,
  setNewParentChildrenEdges,
  tempNodes,
  useCreateActionTrack,
} from "../lib/utils/Map.utils";
import { newId } from "../lib/utils/newFirestoreId";
import {
  buildFullNodes,
  getNodesPromises,
  getUserNodeChanges,
  synchronizeGraph,
} from "../lib/utils/nodesSyncronization.utils";
import { getGroupTutorials, LivelinessBar } from "../lib/utils/tutorials/grouptutorials";
import { delay, generateUserNode, gtmEvent, imageLoaded, isValidHttpUrl } from "../lib/utils/utils";
import {
  ChoosingType,
  EdgesData,
  FullNodeData,
  FullNodesData,
  OpenPart,
  // NodeTutorialState,
  TNodeBookState,
  TNodeUpdates,
  TutorialTypeKeys,
  UserNodeFirestore,
  // TutorialType,
  UserNodeSnapshot,
  UserTutorial,
  UserTutorials,
  VoiceAssistant,
} from "../nodeBookTypes";
import { INotebook, NodeType, NotebookDocument, SimpleNode2 } from "../types";
import {
  checkInstantApprovalForProposalVote,
  checkInstantDeleteForNode,
  childrenParentsDifferences,
  doNeedToDeleteNode,
  isVersionApproved,
  shouldInstantApprovalForProposal,
  showDifferences,
  tagsRefDifferences,
} from "../utils/helpers";

type NotebookProps = {};

type UpdateLinks = {
  addedParents: string[];
  addedChildren: string[];
  removedParents: string[];
  removedChildren: string[];
};
export type QuerySideBarSearch = {
  query: string;
  forced: boolean;
};

type ForceRecalculateType = "remove-nodes" | "add-edge" | "remove-edge";
export type onForceRecalculateGraphInput = { id: string; by: ForceRecalculateType };
export type ChosenType = "Proposals" | "Citations";
export type OnSelectNodeInput = { nodeId: string; chosenType: ChosenType; nodeType: any };
export type OnChangeChosenNode = { nodeId: string; title: string };

type RateProposal = {
  proposals: INodeVersion[];
  setProposals: (proposals: INodeVersion[]) => void;
  userVotesOnProposals: { [key: string]: { wrong: boolean; correct: boolean } };
  setUserVotesOnProposals: any;
  proposalId: string;
  proposalIdx: number;
  correct: boolean;
  wrong: boolean;
  award: boolean;
  newNodeId: string;
};
// when proposing improvements, lists of added/removed parent/child links
const getInitialUpdateLinks = (): UpdateLinks => ({
  addedParents: [],
  addedChildren: [],
  removedParents: [],
  removedChildren: [],
});

export type OpenLeftSidebar =
  | "SEARCHER_SIDEBAR"
  | "NOTIFICATION_SIDEBAR"
  | "PENDING_PROPOSALS"
  | "BOOKMARKS_SIDEBAR"
  | "USER_INFO"
  | "PROPOSALS"
  | "USER_SETTINGS"
  | "CITATIONS"
  | "CHAT"
  | "COMMENT"
  | null;

export type OpenRightSidebar = "LEADERBOARD" | "USER_STATUS" | null;

export type Graph = { nodes: FullNodesData; edges: EdgesData };
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
 *  --- render nodes, every node when its height is changed will add task
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
const Notebook = ({}: NotebookProps) => {
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // GLOBAL STATES
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  const { nodeBookState, nodeBookDispatch } = useNodeBook();
  const [{ user, reputation, settings }, { dispatch }] = useAuth();
  const { allTags, allTagsLoaded } = useTagsTreeView();
  const { confirmIt, promptIt, ConfirmDialog } = useConfirmDialog();
  const createActionTrack = useCreateActionTrack();
  const db = getFirestore();
  // const storage = getStorage();
  const theme = useTheme();
  const router = useRouter();

  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // LOCAL STATES
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  // used for triggering useEffect after nodes or usernodes change
  const [userNodeChanges /*setUserNodeChanges*/] = useState<UserNodeSnapshot[]>([]);
  const [nodeChanges /*setNodeChanges*/] = useState<NodeChanges[]>([]);
  // nodes: dictionary of all nodes visible on map for specific user
  // edges: dictionary of all edges visible on map for specific user
  const [graph, setGraph] = useState<Graph>({ nodes: {}, edges: {} });
  const [nodeUpdates, setNodeUpdates] = useState<TNodeUpdates>({
    nodeIds: [],
    updatedAt: new Date(),
  });
  // preLoadedNodes saves parents,children,tags and references from visible nodes, to reuse them without wait to DB
  const preLoadedNodesRef = useRef<FullNodesData>({});
  // as map grows, width and height grows based on the nodes shown on the map
  const [mapWidth, setMapWidth] = useState(700);
  const [mapHeight, setMapHeight] = useState(400);
  const [reputationSignal, setReputationSignal] = useState<ReputationSignal[]>([]);
  // mapRendered: flag for first time map is rendered (set to true after first time)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mapRendered, setMapRendered] = useState(false);
  // const [isWritingOnDB, setIsWritingOnDB] = useState(false);
  const isWritingOnDBRef = useRef(false);
  const notebookRef = useRef<TNodeBookState>({
    sNode: null,
    isSubmitting: false,
    choosingNode: null,
    previousNode: null,
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
    chatNode: null,
  });

  // scale and translation of the viewport over the map for the map interactions module
  const [mapInteractionValue, setMapInteractionValue] = useState({
    scale: 1,
    translation: { x: 0, y: 0 },
  });

  const [openSidebar, setOpenSidebar] = useState<OpenLeftSidebar>(null);
  const [displaySidebar, setDisplaySidebar] = useState<OpenRightSidebar>(null);
  // const [buttonsOpen, setButtonsOpen] = useState<boolean>(true);
  const [ableToPropose, setAbleToPropose] = useState(false);

  // object of cluster boundaries
  const [clusterNodes, setClusterNodes] = useState({});

  // flag for when scrollToNode is called
  const scrollToNodeInitialized = useRef(false);

  // // link that is currently selected
  // const [selectedRelation, setSelectedRelation] = useState<string | null>(null);

  // node type that is currently selected
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType | null>(null);

  // selectedUser is the user whose profile is in sidebar (such as through clicking a user icon through leader board or on nodes)
  const [selectedUser, setSelectedUser] = useState(null);

  // proposal id of open proposal (proposal whose content and changes reflected on the map are shown)
  const [selectedProposalId, setSelectedProposalId] = useState("");

  const updatedLinksRef = useRef<UpdateLinks>(getInitialUpdateLinks());

  const setUpdatedLinks = (cb: (prev: UpdateLinks) => UpdateLinks) => {
    const newValue = cb(updatedLinksRef.current);
    updatedLinksRef.current = newValue;
  };
  // const [updatedLinks, setUpdatedLinks] = useState<>();
  // const [addedParents, setAddedParents] = useState<string[]>([]);
  // const [addedChildren, setAddedChildren] = useState<string[]>([]);
  // const [removedParents, setRemovedParents] = useState<string[]>([]);
  // const [removedChildren, setRemovedChildren] = useState<string[]>([]);

  const tutorialStateWasSetUpRef = useRef(false);
  // const forcedTutorial = useRef<TutorialTypeKeys | null>(null);
  const [forcedTutorial, setForcedTutorial] = useState<TutorialTypeKeys | null>(null);
  const [firstLoading, setFirstLoading] = useState(true);
  const [showNextTutorialStep, setShowNextTutorialStep] = useState(false);
  const [pendingProposalsLoaded /* , setPendingProposalsLoaded */] = useState(true);

  const [pendingProposals, setPendingProposals] = useState<any>([]);

  // const previousLengthNodes = useRef(0);
  // const previousLengthEdges = useRef(0);
  const g = useRef(dagreUtils.createGraph());

  const [targetClientRect, setTargetClientRect] = useState<TargetClientRect>({ width: 0, height: 0, top: 0, left: 0 });

  //Notifications
  const [uncheckedNotificationsNum, setUncheckedNotificationsNum] = useState(0);
  const [bookmarkUpdatesNum, setBookmarkUpdatesNum] = useState(0);

  const lastNodeOperation = useRef<{ name: string; data: string } | null>(null);
  const proposalTimer = useRef<any>(null);

  const [openProgressBar, setOpenProgressBar] = useState(false);
  // const [ openProgressBarMenu,  setOpenProgressBarMenu] = useState(false);
  const [displayDashboard, setDisplayDashboard] = useState(false);
  const [rootQuery, setRootQuery] = useState<string | undefined>(undefined);

  // Scroll to node configs

  const { width: windowWith, height: windowHeight } = useWindowSize();
  const windowInnerTop = windowWith < 899 ? (openSidebar ? 350 : 50) : 50;
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

  const [openLivelinessBar] = useState(false);
  const [comLeaderboardOpen, setComLeaderboardOpen] = useState(false);
  const [assistantSelectNode, setAssistantSelectNode] = useState<boolean>(false);

  const [notificationsMessages, setNotificationsMessages] = useState<any>([]);
  const [commentNotifications, setCommentNotifications] = useState<any>([]);

  const [toolboxExpanded, setToolboxExpanded] = useState(false);
  const { ref: toolbarRef, isHovered } = useHover();

  const toolbarIsHovered = useMemo(() => isHovered, [isHovered]);
  //TUTORIAL STATES
  const {
    startTutorial,
    tutorial,
    setTutorial,
    currentStep,
    onNextStep,
    onPreviousStep,
    isPlayingTheTutorialRef,
    setDynamicTargetId,
    dynamicTargetId,
    userTutorialLoaded,
    setUserTutorial,
    userTutorial,
  } = useInteractiveTutorial({ user });

  // const pathwayRef = useRef({ node: "", parent: "", child: "" });
  const [notebooks, setNotebooks] = useState<INotebook[]>([]);
  const [selectedNotebookId, setSelectedNotebookId] = useState(user?.sNotebook || "");
  const selectedPreviousNotebookIdRef = useRef("");
  const [userIsAnsweringPractice, setUserIsAnsweringPractice] = useState<{ result: boolean }>({ result: true }); // this is used to trigger assistant sleep animation

  //states for the searcrh bar
  const [queryParentChildren, setQueryParentChildren] = useState<QuerySideBarSearch>({
    query: "",
    forced: false,
  });

  const [editingModeNode, setEditingModeNode] = useState(false);
  const [ratingProposal, setRatingProposal] = useState<boolean>(false);

  // const { isUploading, percentageUploaded, uploadImage } = useUploadImage({ storage });

  //last interaction date from the user
  const [lastInteractionDate, setLastInteractionDate] = useState<Date>(new Date(Date.now()));

  const [channels, setChannels] = useState<IChannels[]>([]);
  const [conversations, setConversations] = useState<IConversation[]>([]);

  const [openChatByNotification, setOpenChatByNotification] = useState<any>(null);

  const [commentSidebarInfo, setCommentSidebarInfo] = useState<{
    type: string;
    id: string;
    proposal?: any;
  }>({
    type: "",
    id: "",
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

  // flag for whether users' nodes data is downloaded from servermessages
  const [isSubmitting, setIsSubmitting] = useState(false);

  // flag to open proposal sidebar
  // const [openProposals, setOpenProposals] = useState(false);

  // flag for if pending proposals for a selected node is open
  // const [openPendingProposals, setOpenPendingProposals] = useState(false);

  // flag for if chat is open
  // const [openChat, setOpenChat] = useState(false);

  // flag for if notifications is open
  // const [openNotifications, setOpenNotifications] = useState(false);

  // flag for if presentations is open
  // const [openPresentations, setOpenPresentations] = useState(false);

  // // flag for is search is open
  // const [openToolbar, setOpenToolbar] = useState(false);

  // flag for is search is open
  // const [openSearch, setOpenSearch] = useState(false);

  // flag for whether bookmarks is open
  // const [openBookmarks, setOpenBookmarks] = useState(false);

  // flag for whether recentNodes is open
  // const [openRecentNodes, setOpenRecentNodes] = useState(false);

  // flag for whether trends is open
  // const [openTrends, setOpenTrends] = useState(false);

  // flag for whether media is full-screen
  const [openMedia, setOpenMedia] = useState<string>("");

  const [firstScrollToNode, setFirstScrollToNode] = useState(false);

  const [, /* showNoNodesFoundMessage */ setNoNodesFoundMessage] = useState(false);
  const [notebookChanged, setNotebookChanges] = useState({ updated: true });

  const [usersOnlineStatusLoaded, setUsersOnlineStatusLoaded] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<{ [uname: string]: boolean }>({});

  // this object represent the question by practice
  // if practice voice only us enable we have a value on question node
  // if we have a tag (semester id when user start practice tool), we can continue practicing from notebook
  const [voiceAssistant, setVoiceAssistant] = useState<VoiceAssistant>({ tagId: "", questionNode: null });

  const [startPractice, setStartPractice] = useState(false);

  const assistantRef = useRef<DashboardWrapperRef | null>(null);

  const [lockedNodes, setLockedNodes] = useState({});
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // FUNCTIONS
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  const [urlNodeProcess, setUrlNodeProcess] = useState(false);

  const userNodesSnapshotFn = useCallback(
    (q: Query<DocumentData>, uname: string, notebookId: string) => {
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
          // TODO: set synchronizationIsWorking true
          setNoNodesFoundMessage(false);
          const { userNodeChanges, nodeIds } = getUserNodeChanges(docChanges);
          devLog("2:Snapshot:userNodes Data", userNodeChanges);

          const nodesData = await getNodesPromises(db, nodeIds);
          devLog("3:Snapshot:Nodes Data", nodesData);

          const fullNodes = buildFullNodes(userNodeChanges, nodesData);
          devLog("4:Snapshot:Full nodes", fullNodes);

          setGraph(graph => {
            const nodesInEdition = [
              ...updatedLinksRef.current.addedParents,
              ...updatedLinksRef.current.removedParents,
              ...updatedLinksRef.current.addedChildren,
              ...updatedLinksRef.current.removedChildren,
            ];

            const res = synchronizeGraph({
              g: g.current,
              graph,
              fullNodes,
              selectedNotebookId: notebookId,
              allTags,
              setNodeUpdates,
              setNoNodesFoundMessage,
              nodesInEdition,
            });
            devLog("4:Snapshot:sync result", res);
            return res;
          });

          // preload data
          // const otherNodes = fullNodes.reduce(
          //   (acu: string[], cur) => [
          //     ...acu,
          //     ...cur.parents.map(c => c.node),
          //     ...cur.children.map(c => c.node),
          //     ...cur.tagIds,
          //     ...cur.referenceIds,
          //   ],
          //   []
          // );
          // onPreLoadNodes(otherNodes, fullNodes);
        },
        error => console.error(error)
      );

      return () => userNodesSnapshot();
    },
    [allTags, db]
  );

  useEffect(() => {
    if (!db) return;
    if (!user) return;
    if (!user.uname) return;
    if (!allTagsLoaded) return;
    if (!userTutorialLoaded) return;
    if (!selectedNotebookId) return;

    devLog("SYNCHRONIZATION", { selectedNotebookId });

    // db.collection("cities").where("regions", "array-contains", "west_coast").where("population", ">", 1000000).where("area", ">", 1000000)
    const userNodesRef = collection(db, "userNodes");
    const q = query(
      userNodesRef,
      where("user", "==", user.uname),
      where("notebooks", "array-contains", selectedNotebookId),
      // where("visible", "==", true),
      where("deleted", "==", false)
    );

    const killSnapshot = userNodesSnapshotFn(q, user.uname, selectedNotebookId);
    return () => {
      // INFO: if nodes from notebooks are colliding, we cant add a state
      // to determine when synchronization is complete,
      // to remove snapshot with previous Graph (nodes, edges)
      // and add snapshot with new Notebook Id
      if (selectedPreviousNotebookIdRef.current !== selectedNotebookId) {
        // if we change notebook, we need to clean graph
        selectedPreviousNotebookIdRef.current = selectedNotebookId;

        g.current = createGraph();
        setGraph(prev => {
          setNodeUpdates({
            nodeIds: Object.keys(prev.nodes),
            updatedAt: new Date(),
          });
          return { nodes: {}, edges: {} };
        });
      }
      killSnapshot();
    };
    // INFO: notebookChanged used in dependencies because of the redraw graph (magic wand button)
  }, [allTagsLoaded, db, userNodesSnapshotFn, user, userTutorialLoaded, notebookChanged, selectedNotebookId]);

  useEffect(() => {
    if (!user) return;
    const onSynchronize = (changes: any) => {
      setGraph(graph => {
        const fullNodes = { ...graph.nodes };
        if (Object.keys(fullNodes).length <= 0) return graph;

        for (let change of changes) {
          if (fullNodes[change.data.id]) {
            fullNodes[change.data.id] = { ...fullNodes[change.data.id], ...change.data.nodeData };
          }
        }
        const res = { nodes: fullNodes, edges: graph.edges };
        devLog("4:Snapshot:sync result", res);
        return res;
      });
    };
    const killSnapshot = getNodeChangesSnapshot(db, onSynchronize);
    return () => killSnapshot();
  }, [db, user]);

  const onChangeTagOfNotebookById = useCallback(
    (notebookId: string, data: { defaultTagId: string; defaultTagName: string }) => {
      setNotebooks(prev => {
        return prev.map(
          (cur): INotebook =>
            cur.id === notebookId
              ? { ...cur, defaultTagId: data.defaultTagId, defaultTagName: data.defaultTagName }
              : cur
        );
      });
    },
    []
  );

  const onNodeInViewport = useCallback(
    (nodeId: string, nodes: FullNodesData) => {
      const originalNode = document.getElementById(nodeId);
      const origin = document.getElementById("map-interaction-origin");

      const thisNode = nodes[nodeId];
      if (!originalNode) return false;
      if (!origin) return false;
      if (!thisNode) return false;

      const { width: nodeWidth, height: nodeHeight } = originalNode.getBoundingClientRect();
      const { top: originTop, left: originLeft } = origin.getBoundingClientRect();

      let nodeTop = originTop + thisNode.top * mapInteractionValue.scale;
      let nodeLeft = originLeft + thisNode.left * mapInteractionValue.scale;
      const regionWidth = windowWith - windowInnerLeft - windowInnerRight;
      const regionHeight = windowHeight - windowInnerTop - windowInnerBottom;
      const collide =
        nodeLeft + nodeWidth >= windowInnerLeft &&
        nodeLeft <= windowInnerLeft + regionWidth &&
        nodeTop + nodeHeight >= windowInnerTop &&
        nodeTop <= windowInnerTop + regionHeight;
      return collide;
    },
    [mapInteractionValue.scale, windowHeight, windowInnerLeft, windowInnerRight, windowInnerTop, windowWith]
  );
  useEffect(() => {
    if (!user) return;
    saveMessagingDeviceToken(user.userId);
  }, [user]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", event => {
        if (event.data && event.data.type === "NOTIFICATION_CLICKED") {
          if (event.data.notificationType === "chat") {
            setOpenSidebar("CHAT");
            setOpenChatByNotification(event.data);
          } else if (event.data.notificationType === "comment") {
            try {
              const sidebarInfoData = JSON.parse(event.data.commentSidebarInfo);
              setOpenSidebar("COMMENT");
              setCommentSidebarInfo(sidebarInfoData);
            } catch (err) {
              console.error(err, "sidebarInfo-JSON-err");
            }
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    setInnerHeight(window.innerHeight);
    // setButtonsOpen(window.innerHeight > 399 ? true : false);
  }, [user?.uname]);

  const pathway = useMemo(() => {
    const edgeObjects: { parent: string; child: string }[] = Object.keys(graph.edges).map(cur => {
      const [parent, child] = cur.split("-");
      return { parent, child };
    });
    const parents = edgeObjects.reduce((acu: { [key: string]: string[] }, cur) => {
      return { ...acu, [cur.parent]: acu[cur.parent] ? [...acu[cur.parent], cur.child] : [cur.child] };
    }, {});
    const pathways = edgeObjects.reduce(
      (acu: { node: string; parent: string; child: string }, cur) => {
        if (acu.node) return acu;
        if (parents[cur.child]) return { parent: cur.parent, node: cur.child, child: parents[cur.child][0] };
        return acu;
      },
      { node: "", parent: "", child: "" }
    );
    // console.log("03", { pathways, node: pathwayRef.current.node });
    // if (pathwayRef.current.node !== pathways.node && pathwayRef.current.node) {
    //   return { node: "", parent: "", child: "" };
    // }

    // pathwayRef.current = pathways;
    return pathways;
  }, [graph.edges]);

  /**
   * - scroll to node will try n times to try to access to the html element
   * get the properties and calculate the positions to make scroll to node
   * - this functions fits correctly when backend result is simulated on frontend,
   *  you don't need to set up setTimeouts
   */
  const scrollToNode = useCallback(
    async (nodeId: string, force = false, tries = 0): Promise<void> => {
      if (tries === 12) return;
      if (scrollToNodeInitialized.current) return;

      await delay(100);
      devLog("SCROLL_TO_NODE", { nodeId, tries });
      const originalNode = document.getElementById(nodeId);
      if (!originalNode) return scrollToNode(nodeId, force, tries + 1);

      const INITIAL_OFFSET_LEFT = 770;
      const INITIAL_OFFSET_TOP = 1000;
      const nodeGotCalculatedPosition =
        originalNode &&
        originalNode?.offsetLeft !== INITIAL_OFFSET_LEFT &&
        originalNode?.offsetTop !== INITIAL_OFFSET_TOP;

      if (!nodeGotCalculatedPosition) {
        console.warn("node is not on graph state, cant make scrollToNode");
        return scrollToNode(nodeId, force, tries + 1);
      }

      setGraph(graph => {
        const thisNode = graph.nodes[nodeId];
        if (!thisNode) return graph;
        const nodeInViewport = onNodeInViewport(nodeId, graph.nodes);

        const shouldIgnoreScrollToNode = !force && !forcedTutorial && nodeInViewport;
        if (shouldIgnoreScrollToNode) return graph;

        scrollToNodeInitialized.current = true;
        setTimeout(() => (scrollToNodeInitialized.current = false), 1300);

        setMapInteractionValue(() => {
          const windowSize = window.innerWidth;

          const regionWidth = windowWith - windowInnerLeft - windowInnerRight;
          const regionHeight = windowHeight - windowInnerTop - windowInnerBottom;
          const defaultScale = getInteractiveMapDefaultScale(windowSize);
          return {
            scale: defaultScale,
            translation: {
              x: windowInnerLeft + regionWidth / 2 - (thisNode.left + originalNode.offsetWidth / 2) * defaultScale,
              y: windowInnerTop + regionHeight / 2 - (thisNode.top + originalNode.offsetHeight / 2) * defaultScale,
            },
          };
        });
        return graph;
      });
    },
    [forcedTutorial, onNodeInViewport, windowHeight, windowInnerLeft, windowInnerRight, windowInnerTop, windowWith]
  );

  const tutorialTargetId = useMemo(
    () => getTutorialTargetIdFromCurrentStep(currentStep, dynamicTargetId),
    [currentStep, dynamicTargetId]
  );

  useEffect(() => {
    const getTooltipClientRect = () => {
      if (!currentStep) return setTargetClientRect({ width: 0, height: 0, top: 0, left: 0 });
      if (!tutorialTargetId) return setTargetClientRect({ width: 0, height: 0, top: 0, left: 0 });
      devLog("GET_TOOLTIP_CLIENT_RECT", { currentStep, targetId: dynamicTargetId, tutorialTargetId });

      const targetElement = document.getElementById(tutorialTargetId);
      if (!targetElement) return;

      targetElement.classList.add(`tutorial-target-${currentStep.outline}`);
      if (currentStep.anchor) {
        const { width, height, top, left } = targetElement.getBoundingClientRect();
        setTargetClientRect({ width, height, top, left });
        return;
      }

      let offsetChildTop = 0;
      let offsetChildLeft = 0;
      const thisNode = graph.nodes[dynamicTargetId];
      if (!thisNode) return;

      let { top, left, width = NODE_WIDTH, height = 0 } = thisNode;
      if (currentStep.childTargetId) {
        const { offsetTop, offsetLeft, clientWidth, clientHeight } = targetElement;
        offsetChildTop = offsetTop + currentStep.topOffset;
        offsetChildLeft = offsetLeft + currentStep.leftOffset;
        height = clientHeight;
        width = clientWidth;
      }
      setTargetClientRect({
        top: top + offsetChildTop,
        left: left + offsetChildLeft,
        width,
        height,
      });
    };

    let timeoutId: any;
    timeoutId = setTimeout(
      () => {
        getTooltipClientRect();
      },
      currentStep?.targetDelay || (tutorial?.step ?? 0) > 1 ? 100 : 500
    );

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    currentStep,
    graph.nodes,
    setTargetClientRect,
    nodeBookState.selectedNode,
    dynamicTargetId,
    toolbarIsHovered,
    tutorialTargetId,
    tutorial?.step,
  ]);

  const onCompleteWorker = useCallback(() => {
    setGraph(graph => {
      if (!nodeBookState.selectedNode) return graph;
      if (!graph.nodes[nodeBookState.selectedNode]) return graph;

      const operationIsFromSearchSidebar = lastNodeOperation.current?.name === "Searcher";
      lastNodeOperation.current = null;
      scrollToNode(nodeBookState.selectedNode, operationIsFromSearchSidebar);

      return graph;
    });
  }, [nodeBookState.selectedNode, scrollToNode]);

  const setOperation = useCallback((operation: string) => {
    lastNodeOperation.current = { name: operation, data: "" };
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

  const selectedNotebook = useMemo(() => {
    const thisNotebook = notebooks.find(c => c.id === selectedNotebookId);
    return thisNotebook ?? null;
  }, [notebooks, selectedNotebookId]);

  /**
   * 1. try to load from preloaded data
   * 2. needs to update the DB
   */
  const openNodeHandler = useMemoizedCallback(
    async (nodeId: string, openWithDefaultValues: Partial<UserNodeFirestore> = {}, selectNode = true) => {
      devLog("OPEN_NODE_HANDLER", { nodeId, openWithDefaultValues });
      const expanded = true;
      // update graph with preloaded data, to get changes immediately
      // update on DB, to save changes
      let userNodeRef = null;
      let userNodeData: UserNodeFirestore | null = null;
      if (user) {
        if (selectNode) {
          notebookRef.current.selectedNode = nodeId; // CHECK: THIS DOESN'T GUARANTY CORRECT SELECTED NODE, WE NEED TO DETECT WHEN GRAPH UPDATE HIS VALUES
          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId }); // CHECK: SAME FOR THIS
        }

        try {
          const userNodesRef = collection(db, "userNodes");
          const q = query(
            userNodesRef,
            where("node", "==", nodeId),
            where("user", "==", user.uname),
            where("deleted", "==", false),
            limit(1)
          );
          const userNodeDoc = await getDocs(q);
          let userNodeId = null;
          if (userNodeDoc.docs.length > 0) {
            // if exist documents update the first
            userNodeId = userNodeDoc.docs[0].id;
            const userNodeRef = doc(db, "userNodes", userNodeId);
            const userNodeDataOld = userNodeDoc.docs[0].data() as UserNodeFirestore;

            userNodeData = {
              ...userNodeDataOld,
              ...openWithDefaultValues,
            };
            const selectedNotebookIdx = (userNodeData.notebooks ?? []).findIndex(c => c === selectedNotebookId);
            if (selectedNotebookIdx < 0) {
              userNodeData.notebooks = [...(userNodeData.notebooks ?? []), selectedNotebookId];
              userNodeData.expands = [...(userNodeData.expands ?? []), expanded];
            } else {
              userNodeData.expands = (userNodeData.expands ?? []).map((c, i) =>
                i === selectedNotebookIdx ? expanded : c
              );
            }
            userNodeData.updatedAt = Timestamp.fromDate(new Date());
            delete userNodeData?.visible;
            delete userNodeData?.open;

            updateDoc(userNodeRef, userNodeData);
          } else {
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

              user: user.uname,
              wrong: false,
              notebooks: [selectedNotebookId],
              expands: [expanded],
            };
            userNodeRef = collection(db, "userNodes");
            const preloadedUserNodeId = preLoadedNodesRef.current[nodeId]?.userNodeId;
            if (preloadedUserNodeId) {
              setDoc(doc(userNodeRef, preloadedUserNodeId), userNodeData);
            } else {
              setDoc(doc(userNodeRef), userNodeData);
            }
          }
          const userNodeLogRef = collection(db, "userNodesLog");

          const userNodeLogData = {
            ...userNodeData,
            createdAt: Timestamp.fromDate(new Date()),
          };

          setDoc(doc(userNodeLogRef), userNodeLogData);
        } catch (err) {
          console.error(err);
          const errorData = {
            nodeId,
            openWithDefaultValues,
            selectNode,
            errorMessage: err instanceof Error ? err.message : "",
          };
          addClientErrorLog(db, { title: "OPEN_NODE", user: user.uname, data: errorData });
        }
      }
    },
    [user, allTags, selectedNotebookId]
  );

  const setNodeParts = useCallback((nodeId: string, innerFunc: (thisNode: FullNodeData) => FullNodeData) => {
    setGraph(({ nodes: oldNodes, edges }) => {
      if (!oldNodes[nodeId]) return { nodes: oldNodes, edges };
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

  const onChangeNotebook = useCallback((notebookId: string) => {
    setSelectedNotebookId(notebookId);
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

  useEffect(() => {
    const getLockedNodes = async () => {
      const locked: { [key: string]: boolean } = {};
      const lockedNodesDocs = await getDocs(query(collection(db, "nodes"), where("locked", "==", true)));
      for (let lockedDoc of lockedNodesDocs.docs) {
        locked[lockedDoc.id] = true;
      }
      setLockedNodes(locked);
    };
    getLockedNodes();
  }, [db]);
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
    if (!user) return;
    if (firstScrollToNode) return;
    if (!queueFinished) return;
    if (!urlNodeProcess) return;

    if (user.sNode) {
      const selectedNode = graph.nodes[user.sNode];
      if (selectedNode && selectedNode.top !== 0) {
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

    // window.onbeforeunload = function (e) {
    //   e = e || window.event;

    //   // For IE and Firefox prior to version 4
    //   if (e) {
    //     e.returnValue = "Do you want to close 1Cademy?";
    //   }

    //   // For Safari
    //   return "Do you want to close 1Cademy?";
    // };

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
        for (let change of docChanges) {
          const { user: statusUname } = change.doc.data();
          if (change.type === "removed" && user.uname !== statusUname) {
            delete oldOnlineUsers[statusUname];
          } else if (change.type === "added" || change.type === "modified") {
            oldOnlineUsers[statusUname] = true;
          }
        }
        return { ...oldOnlineUsers };
      });
      setUsersOnlineStatusLoaded(true);
    });
    return () => unsubscribe();
  }, [db, user]);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      const userAgent = navigator.userAgent;
      const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent);
      const isCtrlF = event.ctrlKey && event.key === "f";
      const isCmdF = isMac && event.metaKey && event.key === "f";

      if (isCtrlF || isCmdF) {
        event.preventDefault();
        setOpenSidebar("SEARCHER_SIDEBAR");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // const onPreLoadNodes = useCallback(
  //   async (nodeIds: string[], fullNodes: FullNodeData[]) => {
  //     if (!user?.uname) return;
  //     if (!selectedNotebookId) return;

  //     const preUserNodes = await getUserNodesByForce(db, nodeIds, user.uname, selectedNotebookId);
  //     const preNodesData = await getNodesPromises(db, nodeIds);
  //     const preFullNodes = buildFullNodes(
  //       preUserNodes.map(c => ({ cType: "added", uNodeId: c.id, uNodeData: c })),
  //       preNodesData
  //     );
  //     // Info: keep order of destructured parameters on mergeAllNodes
  //     preLoadedNodesRef.current = mergeAllNodes([...preFullNodes, ...fullNodes], preLoadedNodesRef.current);
  //   },
  //   [db, selectedNotebookId, user?.uname]
  // );

  // this useEffect manage states when sidebar is opened or closed
  useEffect(() => {
    if (openSidebar !== "PROPOSALS") {
      setSelectedProposalId("");
    }
  }, [nodeBookDispatch, openSidebar]);

  // will listen when sidebar is closed
  useEffect(() => {
    if (openSidebar) return;
    notebookRef.current.selectionType = null;
    nodeBookDispatch({ type: "setSelectionType", payload: null });
    setSelectedProposalId("");
  }, [nodeBookDispatch, openSidebar]);

  useEffect(() => {
    if (!db) return;
    if (!user?.uname) return;
    if (!allTagsLoaded) return;
    if (!userTutorialLoaded) return;
    // if (notebooksLoaded) return;

    devLog("NOTEBOOKS", { uname: user?.uname });

    const notebooksRef = collection(db, "notebooks");
    const q = query(notebooksRef, where("owner", "==", user.uname));

    const killSnapshot = onSnapshot(q, snapshot => {
      const docChanges = snapshot.docChanges();

      setNotebooks((prevNotebooks: any) =>
        docChanges.reduce(
          (prev: (any & { id: string })[], change: any) => {
            const docType = change.type;
            const curData = { id: change.doc.id, ...change.doc.data() };

            const prevIdx = prev.findIndex((m: any & { id: string }) => m.id === curData.id);
            if (docType === "added" && prevIdx === -1 && !curData.conversation) {
              prev.push({ ...curData, doc: change.doc });
            }
            if (docType === "modified" && prevIdx !== -1 && !curData.conversation) {
              prev[prevIdx] = { ...curData, doc: change.doc };
            }

            if (docType === "removed" && prevIdx !== -1) {
              prev.splice(prevIdx);
            }
            prev.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
            return prev;
          },
          [...prevNotebooks]
        )
      );
    });

    return () => {
      killSnapshot();
    };
  }, [allTagsLoaded, db, user?.uname, userTutorialLoaded]);

  useEffect(() => {
    const findSelectedNotebook = notebooks.findIndex(n => n.id === selectedNotebookId);
    if (findSelectedNotebook !== -1) return;
    if (!notebooks[0]) return;
    // first time we set as default the first notebook
    const firstNotebook = notebooks[0].id;

    setSelectedNotebookId(firstNotebook);
  }, [notebooks, selectedNotebookId]);

  useEffect(() => {
    // TODO: check if is possible to move this to a pure function and call when user change notebooks
    // this after merge with "share not public notebooks"

    if (!user) return;
    if (!selectedNotebookId) return;

    if (!selectedNotebook) return;
    if (!selectedNotebook.defaultTagId || !selectedNotebook.defaultTagName) return;
    if (user.tagId === selectedNotebook.defaultTagId) return; // is updated

    const updateDefaultTag = async (defaultTagId: string, defaultTagName: string) => {
      try {
        dispatch({
          type: "setAuthUser",
          payload: { ...user, tagId: defaultTagId, tag: defaultTagName },
        });
        onChangeTagOfNotebookById(selectedNotebookId, { defaultTagId: defaultTagId, defaultTagName });
        await Post(`/changeDefaultTag/${defaultTagId}`);
        // await updateNotebookTag(db, selectedNotebookId, { defaultTagId: defaultTagId, defaultTagName });

        let { reputation, user: userUpdated } = await retrieveAuthenticatedUser(user.userId, user.role, user.claims);
        if (!reputation) throw Error("Cant find Reputation");
        if (!userUpdated) throw Error("Cant find User");

        dispatch({ type: "setReputation", payload: reputation });
        dispatch({ type: "setAuthUser", payload: userUpdated });
      } catch (error) {
        console.error(error);
        const errorData = {
          defaultTagId,
          defaultTagName,
          errorMessage: error instanceof Error ? error.message : "",
        };
        addClientErrorLog(db, { title: "UPDATE_DEFAULT_TAG", user: user.uname, data: errorData });
      }
    };

    updateDefaultTag(selectedNotebook.defaultTagId, selectedNotebook.defaultTagName);
  }, [db, dispatch, notebooks, onChangeNotebook, selectedNotebook, selectedNotebookId, user, user?.role, user?.userId]);

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
    if (!user?.uname) return;
    if (!user?.tagId) return;

    const { versionsColl } = getCollectionsQuery(db);
    const versionsQuery = query(
      versionsColl,
      where("accepted", "==", false),
      where("tagIds", "array-contains", user?.tagId),
      where("deleted", "==", false),
      limit(40)
    );

    const versionsSnapshot = onSnapshot(versionsQuery, async snapshot => {
      const changes = snapshot.docChanges();
      if (changes.length > 0) {
        setPendingProposals((prev: any) =>
          changes.reduce((prev: any, change: any) => {
            const docType = change.type;
            const changeData = change.doc.data();
            const curData = {
              ...changeData,
              id: change.doc.id,
              createdAt: changeData.createdAt.toDate(),
              award: false,
              correct: false,
              wrong: false,
            } as any & { id: string };
            const prevIdx = prev.findIndex((v: any) => v.id === change.doc.id);

            if (docType === "added" && prevIdx === -1) {
              prev.push({ ...curData, doc: change.doc });
            }
            if (docType === "modified" && prevIdx !== -1) {
              prev[prevIdx] = { ...curData, doc: change.doc };
            }
            if (docType === "removed" && prevIdx !== -1) {
              prev.splice(prevIdx, 1);
            }
            return prev;
          }, prev)
        );
      }
    });

    return () => {
      versionsSnapshot();
    };
  }, [db, user, user?.tagId]);

  useEffect(() => {
    if (!db) return;
    if (!user?.uname) return;
    if (!allTagsLoaded) return;
    if (currentStep) return;

    const notificationNumsCol = collection(db, "notifications");
    const q = query(notificationNumsCol, where("proposer", "==", user.uname), where("checked", "==", false));
    const notificationsSnapshot = onSnapshot(q, async snapshot => {
      setUncheckedNotificationsNum(snapshot.docs.length);
    });
    return () => {
      notificationsSnapshot();
    };
  }, [db, user?.uname, allTagsLoaded, currentStep]);

  useEffect(() => {
    g.current = createGraph();
    setGraph({ nodes: {}, edges: {} });
    setNodeUpdates({
      nodeIds: [],
      updatedAt: new Date(),
    });
    devLog("CHANGE NH 🚀", { showClusterOptions: settings.showClusterOptions }, "WORKER");
  }, [settings.showClusterOptions]);

  const onForceRecalculateGraph = useCallback(
    ({ id, by }: onForceRecalculateGraphInput) => {
      devLog("FORCE_RECALCULATE_GRAPH 🚀", { id, by }, "WORKER");
      addTask(null);
    },
    [addTask]
  );

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

      await updateDoc(userRef, { sNode: nodeBookState.selectedNode, sNotebook: selectedNotebookId });

      const userNodeSelectLogRef = collection(db, "userNodeSelectLog");
      setDoc(doc(userNodeSelectLogRef), {
        nodeId: nodeBookState.selectedNode,
        uname: user.uname,
        createdAt: Timestamp.fromDate(new Date()),
      });
    };
    changeSelectedNode();
  }, [db, nodeBookState.selectedNode, user?.sNode, user?.uname]);

  const resetUpdateLink = () => (updatedLinksRef.current = getInitialUpdateLinks());

  const replaceTemporalNode = (newTempNodes: Set<string>) => {
    tempNodes.clear();
    newTempNodes.forEach(c => tempNodes.add(c));
  };

  const replaceChangedNodes = (newChangedNodes: any) => {
    Object.keys(changedNodes).forEach(c => delete changedNodes[c]);
    Object.keys(newChangedNodes).forEach(c => (changedNodes[c] = newChangedNodes[c]));
  };

  /**
   * Will revert the graph from last changes (temporal Nodes or other changes)
   */
  const revertNodesOnGraph = useCallback(() => {
    devLog("RELOAD PERMANENT GRAPH");

    setGraph(({ nodes, edges }) => {
      const { newChangedNodes, newEdges, newNodes, newTempNodes, updatedNodeIds } = revertNodeChanges({
        g: g.current,
        changedNodeIds: Object.keys(changedNodes),
        changedNodes,
        oldEdges: edges,
        oldNodes: nodes,
        tempNodeIds: Array.from(tempNodes),
        tempNodes,
        showClusterOptions: settings.showClusterOptions,
        allTags,
        resetUpdateLink,
      });

      replaceTemporalNode(newTempNodes);
      replaceChangedNodes(newChangedNodes);

      setTimeout(() => {
        setNodeUpdates({
          nodeIds: updatedNodeIds,
          updatedAt: new Date(),
        });
      }, 200);
      return {
        nodes: newNodes,
        edges: newEdges,
      };
    });
  }, [allTags, settings.showClusterOptions]);

  const openUserInfoSidebar = useCallback(
    (uname: string, imageUrl: string, fullName: string, chooseUname: string) => {
      const userUserInfoCollection = collection(db, "userUserInfoLog");

      nodeBookDispatch({
        type: "setSelectedUser",
        payload: {
          username: uname,
          imageUrl,
          fullName,
          chooseUname: Boolean(chooseUname),
        },
      });

      nodeBookDispatch({
        type: "setSelectionType",
        payload: "UserInfo",
      });
      setOpenSidebar("USER_INFO");
      revertNodesOnGraph();
      addDoc(userUserInfoCollection, {
        uname: user?.uname,
        uInfo: uname,
        createdAt: Timestamp.fromDate(new Date()),
      });
      if (user) {
        createActionTrack({ action: "openUserInfoSidebar" });
      }
    },
    [db, nodeBookDispatch, user, setOpenSidebar, revertNodesOnGraph]
  );

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
      if (notebookRef.current?.choosingNode?.id === "Tag") return; //INFO: this is important to update a community

      devLog("CHOSEN_NODE_CHANGE", {
        nodeId,
        choosingNode: notebookRef.current?.choosingNode?.id,
        chosenNode: notebookRef.current?.chosenNode?.id,
      });
      setGraph(({ nodes: oldNodes, edges: oldEdges }) => {
        const updatedNodeIds: string[] = [];
        if (!notebookRef.current.choosingNode || !notebookRef.current.chosenNode)
          return { nodes: oldNodes, edges: oldEdges };
        if (nodeId === notebookRef.current.choosingNode.id) return { nodes: oldNodes, edges: oldEdges };

        updatedNodeIds.push(nodeId);
        updatedNodeIds.push(notebookRef.current.choosingNode.id);
        // updatedNodeIds.push(notebookRef.current.chosenNode.id);
        let choosingNodeCopy = copyNode(oldNodes[notebookRef.current.choosingNode.id]);
        let chosenNodeObj = copyNode(oldNodes[notebookRef.current.chosenNode.id]);
        let newEdges: EdgesData = oldEdges;

        const validLink =
          (notebookRef.current.choosingNode.type === "Reference" &&
            /* thisNode.referenceIds.filter(l => l === nodeBookState.chosenNode?.id).length === 0 &&*/
            notebookRef.current.chosenNode.id !== notebookRef.current.choosingNode.id &&
            chosenNodeObj.nodeType === notebookRef.current.choosingNode.type) ||
          (notebookRef.current.choosingNode.type === "Tag" &&
            choosingNodeCopy.tagIds.filter(l => l === notebookRef.current.chosenNode?.id).length === 0) ||
          (notebookRef.current.choosingNode.type === "Parent" &&
            notebookRef.current.choosingNode.id !== notebookRef.current.chosenNode.id &&
            choosingNodeCopy.parents.filter((l: any) => l.node === notebookRef.current.chosenNode?.id).length === 0) ||
          (notebookRef.current.choosingNode.type === "Child" &&
            notebookRef.current.choosingNode.id !== notebookRef.current.chosenNode.id &&
            choosingNodeCopy.children.filter((l: any) => l.node === notebookRef.current.chosenNode?.id).length === 0);

        if (!validLink) return { nodes: oldNodes, edges: oldEdges };

        const chosenNodeId = notebookRef.current.chosenNode.id;
        const chosingNodeId = notebookRef.current.choosingNode.id;

        if (notebookRef.current.choosingNode.type === "Reference") {
          choosingNodeCopy.references = [...choosingNodeCopy.references, chosenNodeObj.title];
          choosingNodeCopy.referenceIds = [...choosingNodeCopy.referenceIds, notebookRef.current.chosenNode.id];
          choosingNodeCopy.referenceLabels = [...choosingNodeCopy.referenceLabels, ""];
        } else if (notebookRef.current.choosingNode.type === "Tag") {
          choosingNodeCopy.tags = [...choosingNodeCopy.tags, chosenNodeObj.title];
          choosingNodeCopy.tagIds = [...choosingNodeCopy.tagIds, notebookRef.current.chosenNode.id];
        } else if (notebookRef.current.choosingNode.type === "Parent") {
          choosingNodeCopy.parents = [
            ...choosingNodeCopy.parents,
            {
              node: notebookRef.current.chosenNode.id,
              title: chosenNodeObj.title,
              label: "",
              type: chosenNodeObj.nodeType,
            },
          ];
          // if (!(notebookRef.current.chosenNode.id in changedNodes)) {
          //   changedNodes[notebookRef.current.chosenNode.id] = copyNode(oldNodes[notebookRef.current.chosenNode.id]);
          // }

          if (!(notebookRef.current.choosingNode.id in changedNodes)) {
            changedNodes[notebookRef.current.choosingNode.id] = copyNode(oldNodes[notebookRef.current.choosingNode.id]);
          }
          chosenNodeObj.children = [
            ...chosenNodeObj.children,
            {
              node: notebookRef.current.choosingNode.id,
              title: choosingNodeCopy.title,
              label: "",
              type: choosingNodeCopy.nodeType,
            },
          ];
          //choosing:first node
          // chosen: second node
          if (updatedLinksRef.current.removedParents.includes(notebookRef.current.chosenNode.id)) {
            updatedLinksRef.current.removedParents = updatedLinksRef.current.removedParents.filter(
              (nId: string) => nId !== chosenNodeId
            );
          } else {
            updatedLinksRef.current.addedParents = [...updatedLinksRef.current.addedParents, chosenNodeId];
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
          choosingNodeCopy.children = [
            ...choosingNodeCopy.children,
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
              title: choosingNodeCopy.title,
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
          if (updatedLinksRef.current.removedChildren.includes(notebookRef.current.chosenNode.id)) {
            const chosenNodeId = notebookRef.current.choosingNode.id;
            updatedLinksRef.current.removedChildren = updatedLinksRef.current.removedChildren.filter(
              nId => nId !== chosenNodeId
            );
          } else {
            updatedLinksRef.current.addedChildren = [
              ...updatedLinksRef.current.addedChildren,
              notebookRef.current.chosenNode.id,
            ];
          }
        }

        const newNodesObj = {
          ...oldNodes,
          [chosingNodeId]: choosingNodeCopy,
          [chosenNodeId]: chosenNodeObj,
        };

        setTimeout(() => {
          setNodeUpdates({
            nodeIds: updatedNodeIds,
            updatedAt: new Date(),
          });
        }, 200);
        notebookRef.current.choosingNode = null;
        notebookRef.current.chosenNode = null;
        nodeBookDispatch({ type: "setChoosingNode", payload: null });
        nodeBookDispatch({ type: "setChosenNode", payload: null });
        return { nodes: newNodesObj, edges: newEdges };
      });
      // setUpdatedLinks(updatedLinks => {

      //   return { ...updatedLinks };
      // });
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notebookRef.current.choosingNode, notebookRef.current.chosenNode]
    // [notebookRef.current.choosingNode, notebookRef.current.chosenNode]
  );

  // assistant will allow to select a node
  useEffect(() => {
    const listener = (e: any) => {
      if (!e.detail.type) return;
      notebookRef.current.choosingNode = { id: "", type: e.detail.type };
      notebookRef.current.chosenNode = null;
      nodeBookDispatch({ type: "setChoosingNode", payload: { id: "", type: e.detail.type } });
      nodeBookDispatch({ type: "setChosenNode", payload: null });
      setAssistantSelectNode(true);
      setOpenSidebar(null);
    };
    window.addEventListener("node-selection", listener);
    return () => window.removeEventListener("node-selection", listener);
  }, [nodeBookDispatch, notebookRef]);

  const onChangeChosenNode = useCallback(
    async ({ nodeId, title }: OnChangeChosenNode) => {
      if (!notebookRef.current.choosingNode) return;
      if (notebookRef.current.choosingNode.id === nodeId) return;
      if (notebookRef.current.choosingNode.type === "Node") {
        nodeBookDispatch({ type: "setChatNode", payload: { id: nodeId, title } });
        nodeBookDispatch({ type: "setChoosingNode", payload: null });
        notebookRef.current.choosingNode = null;
        nodeBookDispatch({ type: "setChosenNode", payload: null });
        notebookRef.current.chosenNode = null;
        return;
      }
      notebookRef.current.chosenNode = { id: nodeId, title };
      nodeBookDispatch({ type: "setChosenNode", payload: { id: nodeId, title } });
      if (notebookRef.current.choosingNode.id === "Tag") return;
      openNodeHandler(nodeId, { open: true }, false);
      await detectHtmlElements({ ids: [nodeId] });
      await delay(500);
      if (assistantSelectNode) {
        if (notebookRef?.current?.choosingNode?.type) {
          const nodeClickEvent = new CustomEvent("node-selected", {
            detail: {
              id: nodeId,
              title,
              content: "",
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
        return;
      }
      chosenNodeChanged(nodeId);
      setAbleToPropose(true);
    },
    [assistantSelectNode, chosenNodeChanged, nodeBookDispatch, openNodeHandler]
  );

  const deleteLink = useCallback(
    (nodeId: string, linkIdx: number, linkType: ChoosingType) => {
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
          if (updatedLinksRef.current.addedParents.includes(parentId)) {
            updatedLinksRef.current.addedParents = updatedLinksRef.current.addedParents.filter(nId => nId !== parentId);
          } else {
            updatedLinksRef.current.removedParents = [...updatedLinksRef.current.removedParents, parentId];
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
          if (updatedLinksRef.current.addedChildren.includes(childId)) {
            updatedLinksRef.current.addedChildren = updatedLinksRef.current.addedChildren.filter(
              nId => nId !== childId
            );
          } else {
            updatedLinksRef.current.removedChildren = [...updatedLinksRef.current.removedChildren, childId];
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
      // setUpdatedLinks(updatedLinks => {

      //   return { ...updatedLinks };
      // });
    },
    [setGraph]
  );

  const recursiveDescendants = useCallback((nodeId: string): any[] => {
    // CHECK: this could be improve changing recursive function to iterative
    // because the recursive has a limit of call in stack memory
    // TODO: check type of children
    const children: any = g.current.successors(nodeId);
    let descendants: any[] = [];
    if (children && children.length > 0) {
      for (let child of children) {
        if (nodeId === child) continue;
        descendants = [...descendants, child, ...(child ? recursiveDescendants(child) : [])];
      }
    }
    return descendants;
  }, []);

  const hideDescendants = useMemoizedCallback(
    async nodeId => {
      if (notebookRef.current.choosingNode || !user) return;
      let descendants: string[] = [];
      try {
        descendants = recursiveDescendants(nodeId);
        notebookRef.current.selectedNode = nodeId;
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });

        const updatedGraph = (graph: any) => {
          const batch = writeBatch(db);
          for (let descendant of descendants) {
            const thisNode = graph.nodes[descendant];
            if (!thisNode.userNodeId) continue;
            const { userNodeRef } = initNodeStatusChange(descendant, thisNode.userNodeId);
            const notebookIdx = (thisNode.notebooks ?? []).findIndex((cur: string) => cur === selectedNotebookId);
            if (notebookIdx < 0) {
              console.error("'notebooks' property has invalid values");
              continue;
            }

            const newExpands = (thisNode.expands ?? []).filter((c: any, idx: number) => idx !== notebookIdx);
            const newNotebooks = (thisNode.notebooks ?? []).filter((cur: string) => cur !== selectedNotebookId);
            const userNodeData = {
              changed: thisNode.changed,
              correct: thisNode.correct,
              createdAt: Timestamp.fromDate(thisNode.firstVisit),
              updatedAt: Timestamp.fromDate(new Date()),
              deleted: false,
              isStudied: thisNode.isStudied,
              bookmarked: "bookmarked" in thisNode ? thisNode.bookmarked : false,
              node: descendant,
              notebooks: newNotebooks,
              expands: newExpands,
              // open: thisNode.open,
              user: user.uname,
              // visible: false,
              wrong: thisNode.wrong,
            };

            userNodeRef ? batch.set(userNodeRef, userNodeData) : null;
            const userNodeLogData: any = {
              ...userNodeData,
              createdAt: Timestamp.fromDate(new Date()),
            };
            const userNodeLogRef = collection(db, "userNodesLog");
            batch.set(doc(userNodeLogRef), userNodeLogData);
          }

          batch.commit();
          return graph;
        };

        setGraph((graph: any) => updatedGraph(graph));
      } catch (err) {
        console.error(err);
        const errorData = {
          nodeId,
          descendants,
          errorMessage: err instanceof Error ? err.message : "",
        };
        addClientErrorLog(db, { title: "HIDE_DESCENDANTS", user: user.uname, data: errorData });
      }
    },
    [recursiveDescendants, selectedNotebookId]
  );
  const openLinkedNode = useCallback(
    (linkedNodeID: string, typeOperation?: string) => {
      devLog("open Linked Node", {
        linkedNodeID,
        typeOperation,
        isPlayingTheTutorialRef: isPlayingTheTutorialRef.current,
      });

      if (notebookRef.current.choosingNode) return;
      if (!user) return;
      createActionTrack({
        action: "NodeOpen",
        nodeId: linkedNodeID,
      });

      gtmEvent("Interaction", {
        customType: "NodeOpen",
      });

      let linkedNode = document.getElementById(linkedNodeID);
      if (typeOperation) {
        lastNodeOperation.current = { name: "Searcher", data: "" };
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
      nodeBookDispatch({ type: "setPreviousNode", payload: notebookRef.current.selectedNode });
      if (linkedNode) {
        notebookRef.current.selectedNode = linkedNodeID;
        nodeBookDispatch({ type: "setSelectedNode", payload: linkedNodeID });
        scrollToNode(linkedNodeID, true);
      } else {
        // openNodeHandler(linkedNodeID, isInitialProposal ? typeOperation : "Searcher");
        openNodeHandler(linkedNodeID);
      }

      if (typeOperation === "CitationSidebar") {
        setOpenSidebar(null);
      }
    },

    [createActionTrack, isPlayingTheTutorialRef, nodeBookDispatch, openNodeHandler, scrollToNode, user]
  );

  const clearInitialProposal = useCallback(() => {
    nodeBookDispatch({ type: "setInitialProposal", payload: null });
  }, [nodeBookDispatch]);

  const initNodeStatusChange = useCallback(
    (nodeId: string, userNodeId: string) => {
      const nodeRef = doc(db, "nodes", nodeId);
      const userNodeRef = doc(db, "userNodes", userNodeId);
      return { nodeRef, userNodeRef };
    },
    [db]
  );

  const hideNodeHandler = useCallback(
    (thisNode: any) => {
      /**
       * changes in DB
       * change userNode
       * change node
       * create userNodeLog
       */
      devLog("HIDE_NODE_HANDLER", { nodeId: thisNode.node }, thisNode);
      const username = user?.uname;
      if (notebookRef.current.choosingNode) return;
      if (!username) return;
      const notebookIdx = (thisNode.notebooks ?? []).findIndex((cur: any) => cur === selectedNotebookId);
      const newExpands = (thisNode.expands ?? []).filter((c: any, idx: number) => idx !== notebookIdx);
      const { userNodeRef } = initNodeStatusChange(thisNode.node, thisNode.userNodeId);
      const userNodeData = {
        changed: thisNode.changed || false,
        correct: thisNode.correct,
        createdAt: Timestamp.fromDate(thisNode.firstVisit),
        updatedAt: Timestamp.fromDate(new Date()),
        deleted: false,
        isStudied: thisNode.isStudied,
        bookmarked: "bookmarked" in thisNode ? thisNode.bookmarked : false,
        node: thisNode.node,
        // open: thisNode.open,
        notebooks: (thisNode.notebooks ?? []).filter((cur: any) => cur !== selectedNotebookId),
        expands: newExpands,
        user: username,
        visible: false,
        wrong: thisNode.wrong,
      };
      setDoc(userNodeRef, userNodeData);
      const userNodeLogData: any = {
        ...userNodeData,
        createdAt: Timestamp.fromDate(new Date()),
      };

      const userNodeLogRef = collection(db, "userNodesLog");
      setDoc(doc(userNodeLogRef), userNodeLogData);

      gtmEvent("Interaction", {
        customType: "NodeHide",
      });

      createActionTrack({
        action: "NodeHide",
        nodeId: thisNode.node,
      });

      setTimeout(() => {
        setNodeUpdates({
          nodeIds: [thisNode.node],
          updatedAt: new Date(),
        });
      }, 200);
    },
    [createActionTrack, db, initNodeStatusChange, selectedNotebookId, user]
  );

  const openAllChildren = useCallback(
    async (thisNode: any) => {
      devLog("OPEN_ALL_CHILDREN", { thisNode, isWritingOnDB: isWritingOnDBRef.current });
      if (isWritingOnDBRef.current) return;
      if (notebookRef.current.choosingNode || !user) return;

      let linkedNodeId = null;

      let userNodeRef = null;
      let userNodeData = null;
      const batch = writeBatch(db);

      try {
        isWritingOnDBRef.current = true;
        let childrenNotInNotebook: {
          node: string;
          label: string;
          title: string;
          type: string;
          visible?: boolean | undefined;
        }[] = [];
        thisNode.children.forEach((child: any) => {
          if (!document.getElementById(child.node)) childrenNotInNotebook.push(child);
        });

        for (const child of childrenNotInNotebook) {
          linkedNodeId = child.node as string;
          const userNodesRef = collection(db, "userNodes");
          const userNodeQuery = query(
            userNodesRef,
            where("node", "==", linkedNodeId),
            where("user", "==", user.uname),
            limit(1)
          );
          const userNodeDoc = await getDocs(userNodeQuery);

          if (userNodeDoc.docs.length > 0) {
            // if exist documents update the first
            userNodeRef = doc(db, "userNodes", userNodeDoc.docs[0].id);
            userNodeData = userNodeDoc.docs[0].data();
            // userNodeData.visible = true;
            userNodeData.notebooks = [...(userNodeData.notebooks ?? []), selectedNotebookId];
            userNodeData.expands = [...(userNodeData.expands ?? []), true];
            userNodeData.updatedAt = Timestamp.fromDate(new Date());
            delete userNodeData?.visible;
            delete userNodeData?.open;
            updateDoc(userNodeRef, userNodeData);
          } else {
            // if NOT exist documents create a document
            userNodeData = {
              changed: true,
              correct: false,
              createdAt: Timestamp.fromDate(new Date()),
              updatedAt: Timestamp.fromDate(new Date()),
              deleted: false,
              isStudied: false,
              bookmarked: false,
              node: linkedNodeId,
              // open: true,
              user: user.uname,
              // visible: true,
              wrong: false,
              notebooks: [selectedNotebookId],
              expands: [true],
            };
            addDoc(collection(db, "userNodes"), userNodeData);
          }

          const userNodeLogRef = collection(db, "userNodesLog");
          const userNodeLogData = {
            ...userNodeData,
            createdAt: Timestamp.fromDate(new Date()),
          };

          batch.set(doc(userNodeLogRef), userNodeLogData);
        }

        notebookRef.current.selectedNode = thisNode.node;

        await batch.commit();
        nodeBookDispatch({ type: "setSelectedNode", payload: thisNode.node });
        await detectHtmlElements({ ids: childrenNotInNotebook.map(c => c.node) });
        isWritingOnDBRef.current = false;
      } catch (err) {
        isWritingOnDBRef.current = false;
        console.error(err);
        const errorData = {
          nodeId: thisNode.node,
          errorMessage: err instanceof Error ? err.message : "",
        };
        addClientErrorLog(db, { title: "OPEN_ALL_CHILDREN", user: user.uname, data: errorData });
      }

      createActionTrack({
        action: "openAllChildren",
        nodeId: thisNode.node,
      });
      lastNodeOperation.current = { name: "OpenAllChildren", data: "" };
    },
    [createActionTrack, db, nodeBookDispatch, selectedNotebookId, user]
  );

  const openAllParent = useCallback(
    async (thisNode: any) => {
      if (isWritingOnDBRef.current) return;
      if (notebookRef.current.choosingNode || !user) return;

      devLog("OPEN_ALL_PARENTS", { nodeId: thisNode, isWritingOnDB: isWritingOnDBRef.current });

      let linkedNodeId = null;

      let userNodeRef = null;
      let userNodeData = null;
      const batch = writeBatch(db);

      try {
        isWritingOnDBRef.current = true;
        let parentsNotInNotebook: {
          node: string;
          label: string;
          title: string;
          type: string;
          visible?: boolean | undefined;
        }[] = [];
        thisNode.parents.forEach((parent: any) => {
          if (!document.getElementById(parent.node)) parentsNotInNotebook.push(parent);
        });
        for (const parent of parentsNotInNotebook) {
          linkedNodeId = parent.node as string;

          const userNodesRef = collection(db, "userNodes");
          const userNodeQuery = query(
            userNodesRef,
            where("node", "==", linkedNodeId),
            where("user", "==", user.uname),
            where("delete", "==", false),
            limit(1)
          );
          const userNodeDoc = await getDocs(userNodeQuery);

          if (userNodeDoc.docs.length > 0) {
            // if exist documents update the first
            userNodeRef = doc(db, "userNodes", userNodeDoc.docs[0].id);
            userNodeData = userNodeDoc.docs[0].data();
            // userNodeData.visible = true;
            userNodeData.notebooks = [...(userNodeData.notebooks ?? []), selectedNotebookId];
            userNodeData.expands = [...(userNodeData.expands ?? []), true];
            userNodeData.updatedAt = Timestamp.fromDate(new Date());
            batch.update(userNodeRef, userNodeData);
            delete userNodeData?.visible;
            delete userNodeData?.open;
          } else {
            // if NOT exist documents create a document
            userNodeData = {
              changed: true,
              correct: false,
              createdAt: Timestamp.fromDate(new Date()),
              updatedAt: Timestamp.fromDate(new Date()),
              deleted: false,
              isStudied: false,
              bookmarked: false,
              node: linkedNodeId,
              // open: true,
              user: user.uname,
              // visible: true,
              wrong: false,
              notebooks: [selectedNotebookId],
              expands: [true],
            };
            userNodeRef = await addDoc(collection(db, "userNodes"), userNodeData);
          }

          const userNodeLogRef = collection(db, "userNodesLog");
          const userNodeLogData = {
            ...userNodeData,
            createdAt: Timestamp.fromDate(new Date()),
          };

          batch.set(doc(userNodeLogRef), userNodeLogData);
        }

        notebookRef.current.selectedNode = thisNode.node;
        nodeBookDispatch({ type: "setSelectedNode", payload: thisNode.node });
        await batch.commit();
        await detectHtmlElements({ ids: parentsNotInNotebook.map(c => c.node) });
        isWritingOnDBRef.current = false;
      } catch (err) {
        isWritingOnDBRef.current = false;
        console.error(err);
        const errorData = { nodeId: thisNode.node, errorMessage: err instanceof Error ? err.message : "" };
        addClientErrorLog(db, { title: "OPEN_ALL_PARENTS", user: user.uname, data: errorData });
      }

      createActionTrack({
        action: "openAllParent",
        nodeId: thisNode.node,
      });
      lastNodeOperation.current = { name: "OpenAllParent", data: "" };
    },
    [createActionTrack, db, nodeBookDispatch, selectedNotebookId, user]
  );

  const openNodesOnNotebook = useCallback(
    async (notebookId: string, nodeIds: string[]) => {
      if (isWritingOnDBRef.current) return;
      if (notebookRef.current.choosingNode || !user) return;

      devLog("OPEN_NODES_ON_NOTEBOOK", { notebookId, nodeIds, isWritingOnDB: isWritingOnDBRef.current });

      let userNodeRef = null;
      let userNodeData = null;
      const batchArray = [writeBatch(db)];
      let batchFlags = { operationCounter: 0, batchIndex: 0 };

      const updateBatchIndexes = ({
        operationCounter: oldOperationCounter,
        batchIndex: oldBatchIndex,
      }: {
        operationCounter: number;
        batchIndex: number;
      }) => {
        let operationCounter = oldOperationCounter;
        let batchIndex = oldBatchIndex;
        if (oldOperationCounter === 499) {
          batchArray.push(writeBatch(db));
          batchIndex++;
          operationCounter = 0;
        } else {
          operationCounter++;
        }
        return { operationCounter, batchIndex };
      };

      await Promise.all(
        nodeIds.map(async nodeId => {
          const nodeRef = doc(db, "nodes", nodeId);
          const nodeDoc = await getDoc(nodeRef);

          if (!nodeDoc.exists()) return;
          const thisNode: any = { ...nodeDoc.data(), id: nodeId };

          for (let chi of thisNode.children) {
            const childNodeRef = doc(db, "nodes", chi.node);
            batchArray[batchFlags.batchIndex].update(childNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
            batchFlags = updateBatchIndexes(batchFlags);
          }

          for (let par of thisNode.parents) {
            const parentNodeRef = doc(db, "nodes", par.node);
            batchArray[batchFlags.batchIndex].update(parentNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
            batchFlags = updateBatchIndexes(batchFlags);
          }

          const userNodesRef = collection(db, "userNodes");
          const userNodeQuery = query(
            userNodesRef,
            where("node", "==", nodeId),
            where("user", "==", user.uname),
            where("delete", "==", false),
            limit(1)
          );
          const userNodeDoc = await getDocs(userNodeQuery);

          if (userNodeDoc.docs.length > 0) {
            // if exist documents update the first
            userNodeRef = doc(db, "userNodes", userNodeDoc.docs[0].id);
            userNodeData = userNodeDoc.docs[0].data();
            userNodeData.notebooks = [...(userNodeData.notebooks ?? []), notebookId];
            userNodeData.expands = [...(userNodeData.expands ?? []), true];
            userNodeData.updatedAt = Timestamp.fromDate(new Date());
            batchArray[batchFlags.batchIndex].update(userNodeRef, userNodeData);
            batchFlags = updateBatchIndexes(batchFlags);
            delete userNodeData?.visible;
            delete userNodeData?.open;
          } else {
            // if NOT exist documents create a document
            userNodeData = generateUserNode({ nodeId, uname: user.uname, notebookId });
            userNodeRef = await addDoc(collection(db, "userNodes"), userNodeData);
          }
          batchFlags = updateBatchIndexes(batchFlags);
          const userNodeLogRef = collection(db, "userNodesLog");
          const userNodeLogData = {
            ...userNodeData,
            createdAt: Timestamp.fromDate(new Date()),
          };

          batchArray[batchFlags.batchIndex].set(doc(userNodeLogRef), userNodeLogData);
          batchFlags = updateBatchIndexes(batchFlags);
        })
      );
      await Promise.all(batchArray.map(async batch => await batch.commit()));
      setSelectedNotebookId(notebookId);
      await detectHtmlElements({ ids: nodeIds });
      isWritingOnDBRef.current = false;
      createActionTrack({
        action: "openNodesOnNotebook",
      });
    },
    [db, user]
  );

  const toggleNode = useCallback(
    (event: any, thisNode: any) => {
      if (notebookRef.current.choosingNode) return;
      if (!user) return;

      notebookRef.current.selectedNode = thisNode.node; // CHECK: should we remove? the same code bellow in the setState and this doesn't have the dispatch
      const notebookIdx = (thisNode.notebooks ?? []).findIndex((cur: any) => cur === selectedNotebookId);

      const { userNodeRef } = initNodeStatusChange(thisNode.node, thisNode.userNodeId);
      updateDoc(userNodeRef, {
        // open: !thisNode.open,
        expands: (thisNode.expands ?? []).map((cur: any, idx: any) => (idx === notebookIdx ? !cur : cur)),
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
        node: thisNode.node,
        open: !Boolean((thisNode.expands ?? []).filter((cur: any, idx: any) => idx === notebookIdx)),
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

      createActionTrack({
        action: "NodeCollapse",
        nodeId: thisNode.node,
      });

      if (event) {
        event.currentTarget.blur();
      }
    },
    [createActionTrack, db, initNodeStatusChange, selectedNotebookId, user]
  );

  const openNodePart = useCallback(
    (event: any, nodeId: string, partType: any, openPart: any, setOpenPart: any) => {
      lastNodeOperation.current = { name: partType, data: "" };
      if (notebookRef.current.choosingNode?.id === nodeId) return;

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
        // if (
        //   partType === "Tags" &&
        //   notebookRef.current.selectionType !== "AcceptedProposals" &&
        //   notebookRef.current.selectionType !== "Proposals"
        // ) {
        //   // tags;
        //   setOpenRecentNodes(true);
        // }
      }
      processHeightChange(nodeId);
      nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
      notebookRef.current.selectedNode = nodeId;
      if (user) {
        createActionTrack({
          action: "openNodePart",

          nodeId: nodeId,
        });
      }
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user /*selectionType*/, processHeightChange]
  );

  const onChangeNodePart = useCallback(
    (nodeId: string, newOpenPart: OpenPart) => {
      setNodeParts(nodeId, node => {
        return { ...node, localLinkingWords: newOpenPart };
      });
    },
    [setNodeParts]
  );

  const onNodeShare = useCallback(
    (nodeId: string, platform: string) => {
      if (!user) return;
      gtmEvent("Interaction", {
        customType: "NodeShare",
      });

      createActionTrack({
        action: "NodeShare",
        nodeId: nodeId,
        platform,
      });
    },
    [db, user]
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
      if (user) {
        createActionTrack({
          action: "referenceLabelChange",

          nodeId: nodeId,
        });
      }
    },
    [setGraph]
  );

  const markStudied = useCallback(
    (event: any, nodeId: string) => {
      if (notebookRef.current.choosingNode) return;
      if (!user) return;
      setGraph(({ nodes: oldNodes, edges }) => {
        const thisNode = oldNodes[nodeId];
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        notebookRef.current.selectedNode = nodeId;

        const { userNodeRef } = initNodeStatusChange(nodeId, thisNode.userNodeId);

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

          createActionTrack({
            action: "NodeStudied",
            nodeId,
          });
        }

        setDoc(doc(userNodeLogRef), userNodeLogData);
        return { nodes: oldNodes, edges };
      });
      event.currentTarget.blur();

      createActionTrack({
        action: "markStudied",
        nodeId: nodeId,
      });
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, initNodeStatusChange]
  );

  const bookmark = useCallback(
    (event: any, nodeId: string) => {
      if (notebookRef.current.choosingNode) return;
      if (!user) return;
      setGraph(({ nodes: oldNodes, edges }) => {
        const updatedNodeIds: string[] = [];
        updatedNodeIds.push(nodeId);

        const thisNode = oldNodes[nodeId];
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        notebookRef.current.selectedNode = nodeId;

        const { userNodeRef } = initNodeStatusChange(nodeId, thisNode.userNodeId);
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

        createActionTrack({
          action: "NodeBookmark",
          nodeId,
        });
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
    async (event: any, nodeId: string) => {
      devLog("CORRECT NODE", { nodeId });
      if (notebookRef.current.choosingNode) return;

      notebookRef.current.selectedNode = nodeId;
      nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });

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
      lastNodeOperation.current = { name: "upvote", data: "" };
      // revertNodesOnGraph(); // CHECK: should we remove this?
      await Post(`/correctNode/${nodeId}`);
      setNodeParts(nodeId, node => {
        return { ...node, disableVotes: false };
      });
      if (user) {
        createActionTrack({
          action: "correctNode",
          nodeId: nodeId,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setNodeParts]
  );

  const wrongNode = useCallback(
    async (
      event: any,
      thisNode: any,
      nodeType: NodeType,
      wrong: any,
      correct: any,
      wrongs: number,
      corrects: number,
      locked: boolean,
      tagIds: string[]
    ) => {
      try {
        const nodeId = thisNode.node;

        if (notebookRef.current.choosingNode || !user) return;

        notebookRef.current.selectedNode = nodeId;
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });

        const correctChange = !wrong && correct ? -1 : 0;
        const wrongChange = wrong ? -1 : 1;
        const _corrects = corrects + correctChange;
        const _wrongs = wrongs + wrongChange;

        setNodeParts(nodeId, node => {
          return { ...node, disableVotes: true };
        });

        const { instantDelete, isInstructor }: { instantDelete: boolean; isInstructor: boolean } =
          await checkInstantDeleteForNode(tagIds, user.uname, nodeId);

        setNodeParts(nodeId, node => {
          return { ...node, disableVotes: false };
        });

        let willRemoveNode = doNeedToDeleteNode(_corrects, _wrongs, locked, instantDelete, isInstructor);
        if (willRemoveNode) {
          if (thisNode?.children.length > 0) {
            await confirmIt(
              "To be able to delete this node, you should first delete its children or move them under other parent node.",
              "Ok",
              ""
            );
            return;
          } else if (
            !(await confirmIt(
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  gap: "10px",
                }}
              >
                <DeleteForeverIcon />
                <Typography sx={{ fontWeight: "bold" }}>Do you want to delete this node?</Typography>
                <Typography>Deleting a node will permanently remove it from 1cademy.</Typography>
              </Box>,
              "Delete Node",
              "Keep Node"
            ))
          ) {
            return;
          }
        }

        setGraph(graph => {
          const updatedNodeIds: string[] = [nodeId];
          const node = graph.nodes[nodeId];
          lastNodeOperation.current = { name: "downvote", data: willRemoveNode ? "removed" : "" };

          if (node?.locked) return graph;
          if (!node) return graph;
          generateReputationSignal(db, node, user, wrongChange, "Wrong", nodeId, setReputationSignal);

          let nodes = graph.nodes;
          let edges = graph.edges;

          if (willRemoveNode) {
            edges = removeDagAllEdges(g.current, nodeId, edges, updatedNodeIds);
            nodes = removeDagNode(g.current, nodeId, nodes);

            node.parents.forEach(cur => {
              const newChildren = nodes[cur.node]?.children.filter(c => c.node !== nodeId);
              if (nodes[cur.node]) {
                nodes[cur.node].children = newChildren;
              }
            });
            node.children.forEach(cur => {
              const newParents = nodes[cur.node].parents.filter(c => c.node !== nodeId);
              nodes[cur.node].children = newParents;
            });

            notebookRef.current.selectedNode = node.parents[0]?.node ?? null;
            updatedNodeIds.push(notebookRef.current.selectedNode!);
            node.parents.forEach(c => updatedNodeIds.push(c.node));
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

          Post(`/wrongNode/${nodeId}`);

          if (!willRemoveNode) {
            setNodeParts(nodeId, node => ({ ...node, disableVotes: false }));
          } else {
            // TODO:now: check getInitialUpdateLinks
            updatedLinksRef.current = getInitialUpdateLinks();
          }

          setNodeUpdates({
            nodeIds: updatedNodeIds,
            updatedAt: new Date(),
          });
          return { nodes, edges };
        });
        if (user) {
          createActionTrack({
            action: "wrongNode",
            nodeId,
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setNodeParts, user]
  );

  /////////////////////////////////////////////////////
  // Node Improvement Functions

  /**
   * This function is called only when NODE HIGHT was changed
   */
  const changeNodeHight = useCallback(
    (nodeId: string, height: number) => {
      devLog("CHANGE 🚀", `H:${height.toFixed(1)}, nId:${nodeId}`, "WORKER");
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
      if (!ableToPropose) {
        setAbleToPropose(true);
      }
      if (user) {
        createActionTrack({
          action: "changeChoice",
          nodeId: nodeId,
        });
      }
    },
    [ableToPropose, setNodeParts]
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
      if (!ableToPropose) {
        setAbleToPropose(true);
      }
      if (user) {
        createActionTrack({
          action: "changeFeedback",
          nodeId: nodeId,
        });
      }
    },
    [ableToPropose, setNodeParts]
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
      if (!ableToPropose) {
        setAbleToPropose(true);
      }
      if (user) {
        createActionTrack({
          action: "switchChoice",
          nodeId: nodeId,
        });
      }
    },
    [ableToPropose, setNodeParts]
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
      if (!ableToPropose) {
        setAbleToPropose(true);
      }
      if (user) {
        createActionTrack({
          action: "deleteChoice",
          nodeId: nodeId,
        });
      }
    },
    [ableToPropose, setNodeParts]
  );

  const addChoice = useCallback(
    (nodeRef: any, nodeId: string) => {
      devLog("ADD CHOICE");

      setNodeParts(nodeId, (thisNode: FullNodeData) => {
        const choices = [...thisNode.choices];
        choices.push({
          choice: "",
          correct: true,
          feedback: "",
        });
        thisNode.choices = choices;
        return { ...thisNode };
      });
      if (!ableToPropose) {
        setAbleToPropose(true);
      }
      if (user) {
        createActionTrack({
          action: "addChoice",
          nodeId: nodeId,
        });
      }
    },
    [ableToPropose, setNodeParts]
  );

  /////////////////////////////////////////////////////
  // Sidebar Functions

  const closeSideBar = useMemoizedCallback(() => {
    devLog("In closeSideBar");

    // TODO: call closeSidebar every close sidebar action
    if (!user) return;
    if (!openSidebar) return;

    if (tempNodes.size || nodeChanges) revertNodesOnGraph();

    notebookRef.current.choosingNode = null;
    notebookRef.current.chosenNode = null;
    notebookRef.current.selectionType = null;
    nodeBookDispatch({ type: "setChoosingNode", payload: null });
    nodeBookDispatch({ type: "setChosenNode", payload: null });
    nodeBookDispatch({ type: "setSelectionType", payload: null });
    setSelectedUser(null);
    // nodeBookDispatch({ type: "setOpenToolbar", payload: false });
    setOpenMedia("");
    setSelectedProposalId("");
    if (nodeBookState.selectedNode && g.current.hasNode(nodeBookState.selectedNode)) {
      scrollToNode(nodeBookState.selectedNode);
    }

    const userClosedSidebarLogRef = collection(db, "userClosedSidebarLog");
    setDoc(doc(userClosedSidebarLogRef), {
      uname: user.uname,
      openSidebar,
      createdAt: Timestamp.fromDate(new Date()),
    });
    setOpenSidebar(null);
    if (user) {
      createActionTrack({
        action: "closeSideBar",
      });
    }
  }, [
    user,
    graph.nodes,
    nodeBookState.selectedNode,
    nodeBookState.selectionType,
    // nodeBookState.openToolbar,
    openMedia,
    revertNodesOnGraph,
    openSidebar,
  ]);

  /////////////////////////////////////////////////////
  // Proposals Functions

  const proposeNodeImprovement = useCallback(
    (event: any, nodeId: string = "") => {
      devLog("PROPOSE_NODE_IMPROVEMENT", nodeId);
      // event.preventDefault();
      const selectedNode = nodeId || notebookRef.current.selectedNode;
      if (!selectedNode) return;
      setEditingModeNode(true);
      setSelectedProposalId("ProposeEditTo" + selectedNode);
      revertNodesOnGraph();

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
      if (user) {
        createActionTrack({
          action: "proposeNodeImprovement",
          nodeId: nodeId,
        });
      }
    },
    [processHeightChange, revertNodesOnGraph, scrollToNode]
  );

  const proposeNewParent = useCallback(
    (event: any, parentNodeType: string = "Concept", ignoreLinks: boolean = false) => {
      // TODO: add types ChildNodeType
      if (!user) return;

      devLog("PROPOSE_NEW_PARENT", { parentNodeType });
      event && event.preventDefault();
      setSelectedProposalId("ProposeNew" + parentNodeType + "ParentNode");
      revertNodesOnGraph();
      const newNodeId = newId(db);
      setGraph(graph => {
        const updatedNodeIds: string[] = [];

        const { nodes: oldNodes, edges } = graph;
        const selectedNodeId = notebookRef.current.selectedNode!;
        if (!selectedNodeId && !ignoreLinks) return graph;

        if (!(selectedNodeId in changedNodes) && !ignoreLinks) {
          changedNodes[selectedNodeId] = copyNode(oldNodes[selectedNodeId]);
        }
        if (!tempNodes.has(newNodeId)) {
          tempNodes.add(newNodeId);
        }
        const thisNode = !ignoreLinks ? copyNode(oldNodes[selectedNodeId]) : null;

        const newParentNode: any = {
          isStudied: true,
          bookmarked: false,
          isNew: true,
          newParent: true,
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
          notebooks: [selectedNotebookId],
          expands: [true],
          versions: 1,
          viewers: 1,
          children: thisNode
            ? [{ node: selectedNodeId, label: "", title: thisNode.title, type: thisNode.nodeType }]
            : [],
          nodeType: parentNodeType,
          parents: [],
          comments: 0,
          tags: thisNode
            ? thisNode?.tags.filter(tag => tag === user.tag).length > 0
              ? thisNode.tags
              : [...thisNode.tags, user.tag]
            : [user.tag],
          tagIds: thisNode
            ? thisNode?.tagIds.filter(tagId => tagId === user.tagId).length > 0
              ? thisNode.tagIds
              : [...thisNode.tagIds, user.tagId]
            : [user.tagId],
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
          left: thisNode ? thisNode.left + NODE_WIDTH + COLUMN_GAP : 0,
          top: thisNode ? thisNode.top : 0,
        };
        if (parentNodeType === "Question") {
          newParentNode.choices = [
            {
              choice: "",
              correct: true,
              feedback: "",
            },
          ];
        }

        const newNodes = setDagNode(
          g.current,
          newNodeId,
          newParentNode,
          { ...oldNodes },
          { ...allTags },
          settings.showClusterOptions,
          () => {}
        );
        if (!selectedNodeId) return { nodes: newNodes, edges };
        let newEdges = edges;
        if (!ignoreLinks) {
          newEdges = setDagEdge(g.current, newNodeId, selectedNodeId, { label: "" }, { ...edges });
        }

        updatedNodeIds.push(selectedNodeId, newNodeId);

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
      if (user) {
        createActionTrack({
          action: "proposeNewParent",
          nodeId: notebookRef.current.selectedNode || "",
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, revertNodesOnGraph, db, allTags, settings.showClusterOptions, nodeBookDispatch, scrollToNode]
  );

  const onSelectNode = useCallback(
    ({ chosenType, nodeId, nodeType }: OnSelectNodeInput) => {
      // (event: any, nodeId: string, chosenType: "Proposals" | "Citations", nodeType: any) => {
      devLog("SELECT_NODE", { nodeId, chosenType, nodeType, openSidebar });
      if (notebookRef.current.choosingNode) return;

      if (
        notebookRef.current.selectionType === "AcceptedProposals" ||
        notebookRef.current.selectionType === "Proposals"
      ) {
        setSelectedProposalId("");
        notebookRef.current.selectionType = null;
        revertNodesOnGraph();
      }

      if (chosenType === "Proposals") {
        setOpenSidebar("PROPOSALS");
        setSelectedNodeType(nodeType);
        notebookRef.current.selectedNode = nodeId;
        nodeBookDispatch({ type: "setSelectionType", payload: chosenType });
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        return;
      }

      if (chosenType === "Citations") {
        if (openSidebar === "CITATIONS") {
          setOpenSidebar(null);
          notebookRef.current.selectionType = null;
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
        // setOpenPendingProposals(false);
        // setOpenChat(false);
        // setOpenNotifications(false);
        // notebookRef.current.openToolbar = false;
        // nodeBookDispatch({ type: "setOpenToolbar", payload: false });
        // setOpenSearch(false);
        // setOpenRecentNodes(false);
        // setOpenTrends(false);
        setOpenMedia("");
        updatedLinksRef.current = getInitialUpdateLinks();
        setOpenSidebar(null);
      } else {
        setOpenSidebar("PROPOSALS");
        setSelectedNodeType(nodeType);
        notebookRef.current.selectionType = chosenType;
        notebookRef.current.selectedNode = nodeId;
        nodeBookDispatch({ type: "setSelectionType", payload: chosenType });
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
      }
      if (user) {
        createActionTrack({
          action: "selectNode",
          nodeId: notebookRef.current.selectedNode || "",
        });
      }
    },
    [openSidebar, revertNodesOnGraph, nodeBookDispatch]
  );

  const referenceConfirmation: any = useCallback(
    async (selectedNodeId: string) => {
      let referencesOK: any = true;

      let currentNode = graph.nodes[selectedNodeId];

      if (
        currentNode?.nodeType &&
        ["Concept", "Relation", "Question", "News"].includes(currentNode.nodeType) &&
        currentNode.references.length === 0
      ) {
        referencesOK = await confirmIt(
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: "10px",
            }}
          >
            <MenuBookIcon sx={{ color: "#f9a825", fontSize: "40px" }} />
            <Typography>You are proposing a node without any reference. Are you sure?</Typography>
          </Box>,
          "Yes",
          "cancel"
        );
      }
      return referencesOK;
    },
    [graph.nodes]
  );

  const saveProposedImprovement = useCallback(
    async (summary: string, reason: string, tagIds: string[], onFail: () => void) => {
      if (!notebookRef.current.selectedNode) return;
      if (!user) return;

      let postData: any = {};
      try {
        const selectedNodeId = notebookRef.current.selectedNode!;
        notebookRef.current.chosenNode = null;
        notebookRef.current.choosingNode = null;
        nodeBookDispatch({ type: "setChosenNode", payload: null });
        nodeBookDispatch({ type: "setChoosingNode", payload: null });

        let referencesOK = await referenceConfirmation(selectedNodeId);
        if (!referencesOK) return;

        const {
          isInstructor,
          instantApprove,
        }: { courseExist: boolean; isInstructor: boolean; instantApprove: boolean } =
          await shouldInstantApprovalForProposal({
            tagIds,
            uname: user.uname,
          });

        setUpdatedLinks(updatedLinks => {
          setGraph(graph => {
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
                confirmIt("You've not changed anything yet!", "Ok", "");
              });
              return graph;
            }

            postData = {
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

            const willBeApproved = isVersionApproved({
              corrects: 1,
              wrongs: 0,
              nodeData: newNode,
              instantApprove,
              isInstructor,
            });

            lastNodeOperation.current = { name: "ProposeProposals", data: willBeApproved ? "accepted" : "notAccepted" };

            if (willBeApproved) {
              const newParentIds: string[] = newNode.parents.map(parent => parent.node);
              const newChildIds: string[] = newNode.children.map(child => child.node);
              const oldParentIds: string[] = oldNode.parents.map(parent => parent.node);
              const oldChildIds: string[] = oldNode.children.map(child => child.node);
              // const newTagsIds: string[] = newNode.parents.map(parent => parent.node);
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

            const flashcard = postData.flashcard;
            delete postData.flashcard;
            const loadingEvent = new CustomEvent("proposed-node-loading");
            window.dispatchEvent(loadingEvent);
            ProposeNodeImprovement({ postData, flashcard });
            updatedLinksRef.current = getInitialUpdateLinks();
            notebookRef.current.selectionType = null;
            nodeBookDispatch({ type: "setSelectionType", payload: null });
            let oldNodes = graph.nodes;
            let oldEdges = graph.edges;
            if (willBeApproved) {
              oldNodes = {
                ...graph.nodes,
                [selectedNodeId]: { ...graph.nodes[selectedNodeId], editable: false, simulated: true }, // e3
              };
            } else {
              // revertNodesOnGraph()
              const { newChangedNodes, newEdges, newNodes, newTempNodes, updatedNodeIds } = revertNodeChanges({
                g: g.current,
                changedNodeIds: [selectedNodeId],
                changedNodes,
                oldEdges: graph.edges,
                oldNodes: graph.nodes,
                tempNodeIds: [],
                tempNodes,
                showClusterOptions: settings.showClusterOptions,
                allTags,
                resetUpdateLink,
              });

              replaceTemporalNode(newTempNodes);
              replaceChangedNodes(newChangedNodes);
              oldNodes = newNodes;
              oldEdges = newEdges;
              setTimeout(() => {
                setNodeUpdates({
                  nodeIds: updatedNodeIds,
                  updatedAt: new Date(),
                });
              }, 200);
            }

            window.dispatchEvent(new CustomEvent("next-flashcard"));

            setTimeout(() => {
              scrollToNode(selectedNodeId);
            }, 200);

            return {
              nodes: oldNodes,
              edges: oldEdges,
            };
          });

          return updatedLinks;
        });
        if (user) {
          createActionTrack({
            action: "saveProposedImprovement",
            nodeId: notebookRef.current.selectedNode || "",
          });
        }
      } catch (err) {
        console.error(err);
        const errorData = {
          postData,
          errorMessage: err instanceof Error ? err.message : "",
        };
        addClientErrorLog(db, { title: "SAVE_PROPOSED_IMPROVEMENT", user: user.uname, data: errorData });
      }
    },
    [db, nodeBookDispatch, revertNodesOnGraph, scrollToNode, user, referenceConfirmation]
  );

  const ProposeNodeImprovement = async ({ postData, flashcard }: any) => {
    const response: any = await Post("/proposeNodeImprovement", postData);
    setGraph(graph => {
      const oldNodes = {
        ...graph.nodes,
        [postData.id]: { ...graph.nodes[postData.id], editable: false, simulated: false }, // e3
      };
      return {
        nodes: oldNodes,
        edges: graph.edges,
      };
    });
    if (!response) return;
    window.dispatchEvent(
      new CustomEvent("propose-flashcard", {
        detail: {
          node: response.node,
          proposal: response.proposal,
          flashcard,
          proposedType: "Improvement",
          token: await getIdToken(),
        },
      })
    );
  };

  const proposeNewChild = useCallback(
    (event: any, childNodeType: string) => {
      // TODO: add types ChildNodeType
      if (!user) return;

      devLog("PROPOSE_NEW_CHILD", { childNodeType });
      event && event.preventDefault();
      setSelectedProposalId("ProposeNew" + childNodeType + "ChildNode");
      revertNodesOnGraph();
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
          notebooks: [selectedNotebookId],
          expands: [true],
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
              choice: "",
              correct: true,
              feedback: "",
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
      if (user) {
        createActionTrack({
          action: "proposeNewChild",
          nodeId: notebookRef.current.selectedNode || "",
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, revertNodesOnGraph, db, allTags, settings.showClusterOptions, nodeBookDispatch, scrollToNode]
  );

  const onNodeTitleBlur = useCallback(
    async (newTitle: string) => {
      setOpenSidebar("SEARCHER_SIDEBAR");

      notebookRef.current.nodeTitleBlured = true;
      notebookRef.current.searchQuery = newTitle;
      nodeBookDispatch({ type: "setNodeTitleBlured", payload: true });
      nodeBookDispatch({ type: "setSearchQuery", payload: newTitle });
    },
    [nodeBookDispatch]
  );

  const saveProposedParentNode = useCallback(
    async (newNodeId: string, summary: string, reason: string, tagIds: string[], onComplete: () => void) => {
      let postData: any = {};
      if (!user) return;
      try {
        if (!selectedNotebookId) return;

        devLog("SAVE_PROPOSED_PARENT_NODE", { selectedNotebookId, newNodeId, summary, reason });
        notebookRef.current.choosingNode = null;
        notebookRef.current.chosenNode = null;
        nodeBookDispatch({ type: "setChoosingNode", payload: null });
        nodeBookDispatch({ type: "setChosenNode", payload: null });

        const newNode = graph.nodes[newNodeId];

        if (
          newNode?.nodeType &&
          ["Concept", "Relation", "Question", "News"].includes(newNode.nodeType) &&
          newNode.references.length === 0
        ) {
          let referencesOK = await confirmIt(
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "10px",
              }}
            >
              <MenuBookIcon sx={{ color: "#f9a825", fontSize: "40px" }} />
              <Typography>You are proposing a node without any reference. Are you sure?</Typography>
            </Box>,
            "Yes",
            "Cancel"
          );
          if (!referencesOK) {
            return;
          }
        }

        const { isInstructor, instantApprove } = await shouldInstantApprovalForProposal({
          tagIds,
          uname: user.uname,
        });

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

          if (newNode.tags.length == 0) {
            setTimeout(() => {
              confirmIt("Please add relevant tag(s) to your proposed node.", "Ok", "");
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

          postData = {
            ...newNode,
            summary: summary,
            proposal: reason,
            versionNodeId: newNodeId,
            notebookId: selectedNotebookId,
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

          let willBeApproved = isInstructor && instantApprove;

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
            // if (changedNodes.hasOwnProperty(newNode.parents[0].node)) {
            //   delete changedNodes[newNode.parents[0].node];
            // }
            nodePartChanges.unaccepted = false;
            nodePartChanges.simulated = true;
          }

          nodes = { ...nodes, [newNodeId]: { ...nodes[newNodeId], changedAt: new Date(), ...nodePartChanges } };

          const flashcard = postData.flashcard;
          delete postData.flashcard;
          const loadingEvent = new CustomEvent("proposed-node-loading");
          window.dispatchEvent(loadingEvent);

          if (!willBeApproved) revertNodesOnGraph();
          notebookRef.current.selectionType = null;
          nodeBookDispatch({ type: "setSelectionType", payload: null });
          proposeParentNode({ postData, flashcard });
          // proposeParentNode("/proposeParentNode", postData, !willBeApproved).then(async (response: any) => {});

          window.dispatchEvent(new CustomEvent("next-flashcard"));

          setTimeout(() => onComplete(), 200);
          setNodeUpdates({
            nodeIds: updatedNodeIds,
            updatedAt: new Date(),
          });
          scrollToNode(newNodeId);
          return { nodes, edges };
        });
        if (user) {
          createActionTrack({
            action: "saveProposedParentNode",
            nodeId: notebookRef.current.selectedNode || "",
          });
        }
      } catch (err) {
        console.error(err);
        const errorData = {
          postData,
          errorMessage: err instanceof Error ? err.message : "",
        };
        addClientErrorLog(db, { title: "SAVE_PROPOSED_PARENT_NODE", user: user.uname, data: errorData });
      }
    },
    [user, selectedNotebookId, nodeBookDispatch, revertNodesOnGraph, scrollToNode, graph, db]
  );

  const proposeParentNode = async ({ postData, flashcard }: any) => {
    const response: any = await Post("/proposeParentNode", postData);
    if (!response) return;
    // save flashcard data
    if (postData.nodeType !== "Question") {
      window.dispatchEvent(
        new CustomEvent("propose-flashcard", {
          detail: {
            node: response.node,
            proposal: response.proposal,
            flashcard,
            proposedType: "Parent",
            token: await getIdToken(),
          },
        })
      );
    }
    if (postData.nodeType === "Question") {
      window.dispatchEvent(new CustomEvent("question-node-proposed"));
    }
  };

  const saveProposedChildNode = useCallback(
    async (newNodeId: string, summary: string, reason: string, onComplete: () => void) => {
      if (!selectedNotebookId) return;
      if (!user) return;

      let postData: any = {};
      try {
        devLog("SAVE_PROPOSED_CHILD_NODE", { selectedNotebookId, newNodeId, summary, reason });
        notebookRef.current.choosingNode = null;
        notebookRef.current.chosenNode = null;
        nodeBookDispatch({ type: "setChoosingNode", payload: null });
        nodeBookDispatch({ type: "setChosenNode", payload: null });

        const firstParentId = graph.nodes[newNodeId].parents[0].node;
        if (!firstParentId) throw Error("This node has not parent");
        const tagIds = graph.nodes[firstParentId].tagIds ?? [];
        const newNode = graph.nodes[newNodeId];

        if (
          newNode?.nodeType &&
          ["Concept", "Relation", "Question", "News"].includes(newNode.nodeType) &&
          newNode.references.length === 0
        ) {
          let referencesOK = await confirmIt(
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "10px",
              }}
            >
              <MenuBookIcon sx={{ color: "#f9a825", fontSize: "40px" }} />
              <Typography>You are proposing a node without any reference. Are you sure?</Typography>
            </Box>,
            "Yes",
            "Cancel"
          );
          if (!referencesOK) {
            return;
          }
        }

        const { isInstructor, instantApprove } = await shouldInstantApprovalForProposal({
          tagIds,
          uname: user.uname,
        });

        setGraph(graph => {
          // const updatedNodeIds: string[] = [newNodeId];
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

          if (newNode.tags.length == 0) {
            setTimeout(() => {
              setTimeout(() => {
                confirmIt("Please add relevant tag(s) to your proposed node.", "Ok", "");
              });
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

          let { nodes } = graph;

          postData = {
            ...newNode,
            parentId: newNode.parents[0]?.node || "",
            parentType: graph.nodes[newNode.parents[0]?.node]?.nodeType || "",
            summary: summary,
            proposal: reason,
            versionNodeId: newNodeId,
            notebookId: selectedNotebookId,
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

          const willBeApproved = isVersionApproved({
            corrects: 1,
            wrongs: 0,
            nodeData: parentNode,
            instantApprove,
            isInstructor,
          });

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

          let oldNodes = { ...nodes, [newNodeId]: { ...nodes[newNodeId], changedAt: new Date(), ...nodePartChanges } };
          let oldEdges = { ...graph.edges };
          let updatedNodeIds: string[] = [];

          notebookRef.current.selectionType = null;
          nodeBookDispatch({ type: "setSelectionType", payload: null });
          if (!willBeApproved) {
            // revertNodesOnGraph();
            const {
              newChangedNodes,
              newEdges,
              newNodes,
              newTempNodes,
              updatedNodeIds: newUpdatedNodeIds,
            } = revertNodeChanges({
              g: g.current,
              changedNodeIds: [firstParentId],
              changedNodes,
              oldEdges: oldEdges,
              oldNodes: oldNodes,
              tempNodeIds: [newNodeId],
              tempNodes,
              showClusterOptions: settings.showClusterOptions,
              allTags,
              resetUpdateLink,
            });
            replaceTemporalNode(newTempNodes);
            replaceChangedNodes(newChangedNodes);
            oldNodes = newNodes;
            oldEdges = newEdges;
            updatedNodeIds = [...updatedNodeIds, ...newUpdatedNodeIds];
          }
          proposeChildNode({ postData });

          window.dispatchEvent(new CustomEvent("next-flashcard"));

          setTimeout(() => {
            onComplete();
          }, 200);
          setNodeUpdates({
            nodeIds: updatedNodeIds,
            updatedAt: new Date(),
          });
          scrollToNode(newNodeId);
          return { nodes: oldNodes, edges: oldEdges };
        });
      } catch (err) {
        console.error(err);
        const errorData = {
          postData,
          errorMessage: err instanceof Error ? err.message : "",
        };
        addClientErrorLog(db, { title: "SAVE_PROPOSED_CHILD_NODE", user: user.uname, data: errorData });
      }
      if (user) {
        createActionTrack({
          action: "saveProposedChildNode",
          nodeId: notebookRef.current.selectedNode || "",
        });
      }
    },
    [selectedNotebookId, user, nodeBookDispatch, graph.nodes, scrollToNode, settings.showClusterOptions, allTags, db]
  );

  const proposeChildNode = async ({ postData }: any) => {
    await Post("/proposeChildNode", postData);
  };

  /////////////////////////////////////////////////////
  // Inner functions
  const onSelectProposal = useMemoizedCallback(
    (event, proposal, newNodeId: string) => {
      if (proposalTimer.current) {
        clearTimeout(proposalTimer.current);
      }
      proposalTimer.current = setTimeout(async () => {
        if (!proposal) {
          setSelectedProposalId("");
          revertNodesOnGraph();
          notebookRef.current.selectionType = null;
          return;
        }
        await openNodeHandler(proposal.node);
        devLog("ON_SELECT_PROPOSAL", { proposal, newNodeId });
        if (!user?.uname) return;
        event.preventDefault();
        notebookRef.current.selectionType = "Proposals";
        setSelectedProposalId(proposal.id);
        revertNodesOnGraph();
        await delay(1000); // INFO: this is required to give some time to update correctly the consecutive setGraph states (1.reload permanent graph, 2. setGraph)

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
              notebooks: [selectedNotebookId],
              expands: [true],
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
              nodeImage: proposal.nodeImage || "",
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
              versionId: proposal.id,
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
            const newChildren = childrenParentsDifferences(thisNode.children, proposal.children);
            const newParents = childrenParentsDifferences(thisNode.parents, proposal.parents);
            const newTags = tagsRefDifferences(thisNode.tagIds, proposal.tagIds);
            const newReferences = tagsRefDifferences(thisNode.referenceIds, proposal.referenceIds);

            thisNode.nodeType = proposal.nodeType || thisNode.nodeType;
            thisNode.title = showDifferences(thisNode.title, proposal.title); /* proposal.title */
            thisNode.content = showDifferences(thisNode.content, proposal.content) /* proposal.content */;
            thisNode.nodeVideo = proposal.nodeVideo;
            thisNode.nodeVideoStartTime = proposal.nodeVideoStartTime;
            thisNode.nodeVideoEndTime = proposal.nodeVideoEndTime;
            thisNode.nodeImage = proposal.nodeImage;
            thisNode.children = [...thisNode.children, ...newChildren.added];
            thisNode.addedChildren = newChildren.added;
            thisNode.removedChildren = newChildren.removed;
            thisNode.parents = [...thisNode.parents, ...newParents.added];
            thisNode.addedParents = newParents.added;
            thisNode.removedParents = newParents.removed;
            thisNode.addedTags = newTags.added;
            thisNode.removedTags = newTags.removed;
            thisNode.references = Array.from(new Set([...thisNode.references, ...proposal.references]));
            thisNode.referenceIds = Array.from(new Set([...thisNode.referenceIds, ...proposal.referenceIds]));
            thisNode.tags = Array.from(new Set([...thisNode.tags, ...proposal.tags]));
            thisNode.tagIds = Array.from(new Set([...thisNode.tagIds, ...proposal.tagIds]));
            thisNode.referenceLabels = ["", ""];
            thisNode.addedReferences = newReferences.added;
            thisNode.removedReferences = newReferences.removed;

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
      if (user) {
        createActionTrack({
          action: "onSelectProposal",

          nodeId: notebookRef.current.selectedNode || "",
        });
      }
    },
    [user?.uname, nodeBookState.selectedNode, allTags, revertNodesOnGraph, settings.showClusterOptions]
  );

  const deleteProposal = useCallback(
    async (event: any, proposals: any, setProposals: any, proposalId: string, proposalIdx: number) => {
      if (!nodeBookState.choosingNode) {
        if (!nodeBookState.selectedNode) return;
        revertNodesOnGraph();
        const postData = {
          versionId: proposalId,
          nodeType: selectedNodeType,
          nodeId: nodeBookState.selectedNode,
        };
        // setIsSubmitting(true);
        await Post("/deleteVersion", postData);

        let proposalsTemp = [...proposals];
        proposalsTemp.splice(proposalIdx, 1);
        setProposals(proposalsTemp);
        // setIsSubmitting(false);
        scrollToNode(nodeBookState.selectedNode);
      }
      if (user) {
        createActionTrack({
          action: "deleteProposal",

          nodeId: notebookRef.current.selectedNode || "",
        });
      }
    },
    [nodeBookState.choosingNode, nodeBookState.selectedNode, revertNodesOnGraph, scrollToNode, selectedNodeType]
  );
  const mapContentMouseOver = useCallback((event: any) => {
    const isPartOfNodeComponent = event.target?.parentNode?.parentNode?.getAttribute("id") !== "MapContent";
    setMapHovered(isPartOfNodeComponent);
  }, []);

  const onMouseClick = useCallback((e: any) => {
    if (e.button !== 1) return; // is not mouse well

    e.preventDefault();
  }, []);

  const uploadNodeImage = useCallback(
    async (
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
        if (!image && !image?.type) {
          confirmIt(
            "Oops! Something went wrong with the image upload. Please try uploading a different image. We appologize for the inconvenience! If the issue persists, please contact iman@honor.education",
            "Ok",
            ""
          );
        } else if (
          image.type !== "image/jpg" &&
          image.type !== "image/jpeg" &&
          image.type !== "image/gif" &&
          image.type !== "image/png"
        ) {
          confirmIt("We only accept JPG, JPEG, PNG, or GIF images. Please upload another image.", "Ok", "");
        } else {
          let fullname = await promptIt(
            "Consent that you have all the rights to upload this image and the image does not violate any laws.",
            "I Consent",
            "",
            `${user?.fName} ${user?.lName}`
          );

          if (fullname != `${user?.fName} ${user?.lName}`) {
            confirmIt("Entered full name is not correct", "Ok", "");
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
              confirmIt(
                "There is an error with uploading your image. Please upload it again! If the problem persists, please try another image.",
                "Ok",
                ""
              );
            },
            async function complete() {
              const imageGeneratedUrl = await getDownloadURL(storageRef);
              setIsSubmitting(false);
              setIsUploading(false);
              await imageLoaded(imageGeneratedUrl);
              if (imageGeneratedUrl && imageGeneratedUrl !== "") {
                setNodeParts(nodeId, (thisNode: any) => {
                  thisNode.nodeImage = imageGeneratedUrl;
                  return { ...thisNode };
                });
              }
              setPercentageUploaded(100);
            }
          );
        }
        if (user) {
          createActionTrack({
            action: "uploadNodeImage",
            nodeId,
          });
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
    async ({
      proposals,
      setProposals,
      userVotesOnProposals,
      setUserVotesOnProposals,
      proposalId,
      proposalIdx,
      correct,
      wrong,
      award,
      newNodeId,
    }: RateProposal) => {
      if (!selectedNotebookId) return;
      if (!user) return;
      if (!nodeBookState.selectedNode) return;
      if (!selectedNodeType) return;
      setRatingProposal(true);
      devLog("RATE_PROPOSAL", {
        proposals,
        setProposals,
        proposalId,
        userVotesOnProposals,
        proposalIdx,
        correct,
        wrong,
        award,
        newNodeId,
      });
      if (!userVotesOnProposals[proposalId]) {
        userVotesOnProposals[proposalId] = {
          correct: false,
          wrong: false,
        };
      }
      if (!nodeBookState.choosingNode) {
        const proposalsTemp = [...proposals];
        let interactionValue = 0;
        let voteType: string = "";
        if (correct) {
          interactionValue += userVotesOnProposals[proposalId].correct ? -1 : 1;
          if (!userVotesOnProposals[proposalId].correct) {
            voteType = "Correct";
          }
          proposalsTemp[proposalIdx].wrongs += userVotesOnProposals[proposalId].wrong ? -1 : 0;
          userVotesOnProposals[proposalId].wrong = false;
          proposalsTemp[proposalIdx].corrects += userVotesOnProposals[proposalId].correct ? -1 : 1;
          userVotesOnProposals[proposalId].correct = !proposalsTemp[proposalIdx].correct;
        } else if (wrong) {
          if (!proposalsTemp[proposalIdx].wrong) {
            voteType = "Wrong";
          }
          interactionValue += userVotesOnProposals[proposalId].wrong ? 1 : -1;
          proposalsTemp[proposalIdx].corrects += userVotesOnProposals[proposalId].correct ? -1 : 0;
          userVotesOnProposals[proposalId].correct = false;
          proposalsTemp[proposalIdx].wrongs += userVotesOnProposals[proposalId].wrong ? -1 : 1;
          userVotesOnProposals[proposalId].wrong = !proposalsTemp[proposalIdx].wrong;
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
          notebookId: selectedNotebookId,
        };

        const updatedNodeIds: string[] = [nodeBookState.selectedNode!, newNodeId];

        const {
          courseExist,
          instantApprove,
          isInstructor,
        }: { courseExist: boolean; instantApprove: boolean; isInstructor: boolean } =
          await checkInstantApprovalForProposalVote(nodeBookState.selectedNode, user.uname, proposalId);

        let willBeApproved: boolean = isVersionApproved({
          corrects: proposalsTemp[proposalIdx].corrects,
          wrongs: proposalsTemp[proposalIdx].wrongs,
          nodeData: graph.nodes[nodeBookState.selectedNode],
          instantApprove: instantApprove && correct,
          isInstructor,
        });

        setRatingProposal(false);

        if (willBeApproved) {
          const res = await confirmIt(
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "10px",
                borderRadius: "40px",
              }}
            >
              <NextImage width={"22px"} height={"22px"} src={EditIcon} alt="search icon" />
              <Typography sx={{ fontWeight: "bold" }}>Approve Proposal</Typography>
              <Typography>Are you sure you want to approve this proposal?</Typography>
            </Box>,
            "Yes",
            "Cancel"
          );
          if (!res) return;
        }

        devLog("COURSEEXIST, INSTANTAPPROVE", { courseExist, instantApprove });
        setGraph(({ nodes: oldNodes, edges }) => {
          if (!nodeBookState.selectedNode) return { nodes: oldNodes, edges };

          if (willBeApproved) {
            proposalsTemp[proposalIdx].accepted = true;
            if (changedNodes.hasOwnProperty(nodeBookState.selectedNode)) {
              delete changedNodes[nodeBookState.selectedNode];
            }

            if (proposalsTemp[proposalIdx].hasOwnProperty("childType") && proposalsTemp[proposalIdx].childType) {
              const previewNode = Object.values(oldNodes).find((node: any) => node.versionId === proposalId);
              if (previewNode) {
                oldNodes[newNodeId] = { ...oldNodes[previewNode.node], unaccepted: false, simulated: true };
              }
              if (tempNodes.has(newNodeId)) {
                tempNodes.delete(newNodeId);
              }
            } else {
              oldNodes[nodeBookState.selectedNode].title = proposalsTemp[proposalIdx].title;
              oldNodes[nodeBookState.selectedNode].content = proposalsTemp[proposalIdx].content;
              oldNodes[nodeBookState.selectedNode].tags = proposalsTemp[proposalIdx].tags;
              oldNodes[nodeBookState.selectedNode].referenceIds = proposalsTemp[proposalIdx].referenceIds;
              oldNodes[nodeBookState.selectedNode].referenceLabels = proposalsTemp[proposalIdx].referenceLabels;
              // oldNodes[nodeBookState.selectedNode].children = proposalsTemp[proposalIdx].children;
              oldNodes[nodeBookState.selectedNode].tagIds = proposalsTemp[proposalIdx].tagIds;
              oldNodes[nodeBookState.selectedNode].simulated = true;
            }
            setOpenSidebar(null);
          }
          setProposals(proposalsTemp);
          setUserVotesOnProposals(userVotesOnProposals);
          return { nodes: oldNodes, edges };
        });
        setNodeUpdates({
          nodeIds: updatedNodeIds,
          updatedAt: new Date(),
        });
        try {
          await Post("/rateVersion", postData);
          setGraph(({ nodes: oldNodes, edges }) => {
            if (oldNodes[postData.nodeId]) {
              oldNodes[postData.nodeId] = { ...oldNodes[postData.nodeId], unaccepted: false, simulated: false };
            }
            return { nodes: oldNodes, edges };
          });
        } catch (error) {
          console.error(error);
        }
      }
      if (user) {
        createActionTrack({
          action: "rateProposal",

          nodeId: newNodeId,
        });
      }
    },
    [selectedNotebookId, user, nodeBookState.selectedNode, nodeBookState.choosingNode, selectedNodeType]
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
      createActionTrack({
        action: "navigateWhenNotScrolling",
        mapInteractionValue,
      });
      return setMapInteractionValue(newMapInteractionValue);
    }
  };

  const onOpenSideBar = useCallback((sidebar: OpenLeftSidebar) => {
    setOpenSidebar(sidebar);
    if (user) {
      createActionTrack({
        action: "onOpenSideBar",
      });
    }
  }, []);

  // this method was required to cleanup editor added, removed child and parent list
  const cleanEditorLink = useCallback(() => {
    updatedLinksRef.current = getInitialUpdateLinks();
    if (user) {
      createActionTrack({
        action: "cleanEditorLink",
      });
    }
  }, []);

  const onScrollToLastNode = () => {
    if (!nodeBookState.selectedNode) return;
    scrollToNode(nodeBookState.selectedNode, true);
  };

  const onCloseSidebar = useCallback(() => {
    revertNodesOnGraph();
    if (notebookRef.current.selectedNode) scrollToNode(notebookRef.current.selectedNode);
    setOpenSidebar(null);
    if (user) {
      createActionTrack({
        action: "onCloseSidebar",
      });
    }
  }, [revertNodesOnGraph, scrollToNode]);

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
    if (user) {
      createActionTrack({
        action: "onRedrawGraph",
      });
    }
  }, [setNotebookChanges]);

  const setSelectedNode = useCallback(
    (nodeId: string) => {
      notebookRef.current.selectedNode = nodeId;
      nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
      scrollToNode(nodeId);
    },
    [nodeBookDispatch, scrollToNode]
  );

  const hideNodeContent = useMemo(() => {
    if (!user || !user.scaleThreshold) return false;
    let defaultScaleDevice = 0.45;
    if (windowWith < 400) {
      defaultScaleDevice = 0.45;
    } else if (windowWith < 600) {
      defaultScaleDevice = 0.575;
    } else if (windowWith < 1260) {
      defaultScaleDevice = 0.8;
    } else {
      defaultScaleDevice = 0.92;
    }
    const userThresholdPercentage = user.scaleThreshold;
    let userThresholdCurrentScale = 1;

    userThresholdCurrentScale = (userThresholdPercentage * defaultScaleDevice) / 100;

    return mapInteractionValue.scale < userThresholdCurrentScale;
  }, [mapInteractionValue.scale, user, windowWith]);

  // const handleCloseProgressBarMenu = useCallback(() => {
  //   setOpenProgressBarMenu(false);
  // }, []);

  const onCancelTutorial = useCallback(() => {
    if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
    setTutorial(null);
    if (user) {
      createActionTrack({
        action: "onCancelTutorial",
      });
    }
  }, [setTutorial, tutorialTargetId]);

  const onCloseTableOfContent = useCallback(() => {
    setOpenProgressBar(false);
  }, []);

  const onOnlyCloseSidebar = useCallback(() => {
    setOpenSidebar(null);
    if (user) {
      createActionTrack({
        action: "onOnlyCloseSidebar",
      });
    }
  }, [user, db]);

  const onDisplayInstructorPage = useCallback(() => {
    setDisplayDashboard(true);
    if (user) {
      createActionTrack({
        action: "onDisplayInstructorPage",
      });
    }
  }, []);

  const onSkipTutorial = useCallback(async () => {
    if (!user) return;
    if (!currentStep) return;
    if (!tutorial) return;

    const tutorialUpdated: UserTutorial = {
      ...userTutorial[tutorial.name],
      currentStep: tutorial.step,
      skipped: true,
    };

    if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);

    const userTutorialUpdated = { ...userTutorial, [tutorial.name]: tutorialUpdated };
    const wasForcedTutorial = tutorial.name === forcedTutorial;
    tutorialStateWasSetUpRef.current = false;
    setUserTutorial(userTutorialUpdated);
    setOpenSidebar(null);
    setTutorial(null);
    setDynamicTargetId("");

    if (wasForcedTutorial) setForcedTutorial(null);

    const tutorialRef = doc(db, "userTutorial", user.uname);
    const tutorialDoc = await getDoc(tutorialRef);

    if (tutorialDoc.exists()) {
      await updateDoc(tutorialRef, userTutorialUpdated);
    } else {
      await setDoc(tutorialRef, userTutorialUpdated);
    }
    if (user) {
      createActionTrack({
        action: "onSkipTutorial",
      });
    }
  }, [
    user,
    currentStep,
    tutorial,
    userTutorial,
    tutorialTargetId,
    forcedTutorial,
    setUserTutorial,
    setTutorial,
    setDynamicTargetId,
    db,
  ]);

  const onNextTutorialStep = useCallback(() => {
    if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
    onNextStep();
  }, [onNextStep, tutorialTargetId]);

  const onPreviousTutorialStep = useCallback(() => {
    if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
    onPreviousStep();
  }, [onPreviousStep, tutorialTargetId]);

  const onFinalizeTutorial = useCallback(async () => {
    if (!user) return;
    if (!currentStep) return;
    if (!tutorial) return;

    devLog(
      "ON_FINALIZE_TUTORIAL",
      { childTargetId: currentStep?.childTargetId, targetId: dynamicTargetId },
      "TUTORIAL"
    );

    if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);

    if (tutorial.name === "tmpEditNode") {
      if (currentStep.isClickable) {
        proposeNodeImprovement(null, dynamicTargetId);
      }
      setTutorial(null);
      return;
    }

    const tmpChildrenMap = new Map<TutorialTypeKeys, NodeType>();
    tmpChildrenMap.set("tmpProposalConceptChild", "Concept");
    tmpChildrenMap.set("tmpProposalRelationChild", "Relation");
    tmpChildrenMap.set("tmpProposalReferenceChild", "Reference");
    tmpChildrenMap.set("tmpProposalQuestionChild", "Question");
    tmpChildrenMap.set("tmpProposalIdeaChild", "Idea");
    tmpChildrenMap.set("tmpProposalCodeChild", "Code");

    if (tmpChildrenMap.has(tutorial.name)) {
      if (currentStep.isClickable) {
        proposeNewChild(null, tmpChildrenMap.get(tutorial.name) as string);
      }
      return;
    }

    const tmpOpenPartMap = new Map<TutorialTypeKeys, OpenPart>();
    tmpOpenPartMap.set("tmpParentsChildrenList", "LinkingWords");
    tmpOpenPartMap.set("tmpTagsReferences", "References");

    if (tmpOpenPartMap.has(tutorial.name)) {
      if (currentStep.isClickable) {
        const selectedNodeId = notebookRef.current.selectedNode!;
        if (!selectedNodeId) return;

        onChangeNodePart(selectedNodeId, tmpOpenPartMap.get(tutorial.name));
        return;
      }
    }

    if (tutorial.name === "tmpPathways") {
      if (currentStep.isClickable) {
        openNodeHandler("r98BjyFDCe4YyLA3U8ZE");
        openNodeHandler("sKukyeN58Wj1jfzuqnZJ");
      }
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
    setDynamicTargetId("");
    tutorialStateWasSetUpRef.current = false;

    if (wasForcedTutorial) setForcedTutorial(null);

    const tutorialRef = doc(db, "userTutorial", user.uname);
    const tutorialDoc = await getDoc(tutorialRef);

    if (tutorialDoc.exists()) {
      await updateDoc(tutorialRef, userTutorialUpdated);
    } else {
      await setDoc(tutorialRef, userTutorialUpdated);
    }
    if (user) {
      createActionTrack({
        action: "onFinalizeTutorial",
      });
    }
  }, [
    user,
    currentStep,
    tutorial,
    dynamicTargetId,
    tutorialTargetId,
    userTutorial,
    forcedTutorial,
    setTutorial,
    setUserTutorial,
    setDynamicTargetId,
    db,
    proposeNodeImprovement,
    proposeNewChild,
    onChangeNodePart,
    openNodeHandler,
  ]);

  const tutorialTargetCallback = useMemo(() => {
    if (!currentStep?.isClickable) return undefined;
    if (tutorial && tutorial.step !== tutorial?.steps.length) return onNextStep;
    if (forcedTutorial) return () => setShowNextTutorialStep(true);
    return onFinalizeTutorial;
  }, [currentStep?.isClickable, forcedTutorial, onFinalizeTutorial, onNextStep, tutorial]);

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
      devLog("DETECT_AND_FORCE_TUTORIAL", { tutorialName, targetId }, "TUTORIAL");

      const thisNode = graph.nodes[targetId];
      if (!targetIsValid(thisNode)) {
        if (!tutorialStateWasSetUpRef.current) {
          openNodeHandler(targetId, defaultStates, true);
          tutorialStateWasSetUpRef.current = true;
        }
        return true;
      }
      tutorialStateWasSetUpRef.current = false;

      startTutorial(tutorialName);
      setDynamicTargetId(targetId);

      nodeBookDispatch({ type: "setSelectedNode", payload: targetId });
      notebookRef.current.selectedNode = targetId;
      scrollToNode(targetId);

      setNodeUpdates({
        nodeIds: [targetId],
        updatedAt: new Date(),
      });
      if (user) {
        createActionTrack({
          action: "detectAndForceTutorial",
        });
      }
      return true;
    },

    [graph.nodes, nodeBookDispatch, openNodeHandler, scrollToNode, setDynamicTargetId, startTutorial]
  );

  const detectAndRemoveTutorial = useCallback(
    (tutorialName: TutorialTypeKeys, targetIsValid: (node: FullNodeData) => boolean) => {
      if (!tutorial) return;
      if (tutorial.name !== tutorialName) return;

      const node = graph.nodes[dynamicTargetId];
      if (!targetIsValid(node)) {
        setTutorial(null);
        setForcedTutorial(null);
      }
      if (user) {
        createActionTrack({
          action: "detectAndRemoveTutorial",
        });
      }
    },
    [graph.nodes, setTutorial, dynamicTargetId, tutorial]
  );

  const detectAndCallSidebarTutorial = useCallback(
    (tutorialName: TutorialTypeKeys, sidebar: OpenLeftSidebar) => {
      const shouldIgnore = forcedTutorial
        ? forcedTutorial !== tutorialName
        : userTutorial[tutorialName].done || userTutorial[tutorialName].skipped;
      if (shouldIgnore) return false;

      devLog(
        "DETECT_AND_CALL_SIDEBAR_TUTORIAL",
        { tutorialName, sidebar, node: nodeBookState.selectedNode },
        "TUTORIAL"
      );
      if (openSidebar !== sidebar) {
        setOpenSidebar(sidebar);
      }

      if (sidebar === null) {
        nodeBookDispatch({ type: "setIsMenuOpen", payload: true });
      }
      startTutorial(tutorialName);
      if (user) {
        createActionTrack({
          action: "detectAndCallSidebarTutorial",
        });
      }
      return true;
    },
    [db, user, forcedTutorial, nodeBookDispatch, nodeBookState.selectedNode, openSidebar, startTutorial, userTutorial]
  );

  const detectAndCallTutorial = useCallback(
    (tutorialName: TutorialTypeKeys, targetIsValid: (node: FullNodeData) => boolean) => {
      const shouldIgnore = !forcedTutorial && (userTutorial[tutorialName].done || userTutorial[tutorialName].skipped);
      if (shouldIgnore) return false;

      devLog("DETECT_AND_CALL_TUTORIAL", { tutorialName, node: nodeBookState.selectedNode }, "TUTORIAL");

      const newTargetId = nodeBookState.selectedNode ?? "";
      if (!newTargetId) return false;
      const thisNode = graph.nodes[newTargetId];
      if (!thisNode) return false;
      if (!targetIsValid(thisNode)) return false;
      startTutorial(tutorialName);
      setDynamicTargetId(newTargetId);
      if (forcedTutorial) {
        nodeBookDispatch({ type: "setSelectedNode", payload: newTargetId });
        notebookRef.current.selectedNode = newTargetId;
        scrollToNode(newTargetId);
      }
      if (user) {
        createActionTrack({
          action: "detectAndCallTutorial",
        });
      }
      return true;
    },
    [
      db,
      user,
      forcedTutorial,
      graph.nodes,
      nodeBookDispatch,
      nodeBookState.selectedNode,
      scrollToNode,
      setDynamicTargetId,
      startTutorial,
      userTutorial,
    ]
  );

  // const detectAndCallChildTutorial = useCallback(
  //   (tutorialName: TutorialTypeKeys, targetIsValid: (node: FullNodeData) => boolean) => {
  //     const tutorialsIsForced = forcedTutorial === tutorialName;
  //     const canDetect = tutorialsIsForced || (!userTutorial[tutorialName].done && !userTutorial[tutorialName].skipped);
  //     const isValidForcedTutorialChild = forcedTutorial
  //       ? forcedTutorial === tutorialName // CHECK: this probably is unrequired
  //       : ![
  //           "tmpEditNode",
  //           "tmpProposalConceptChild",
  //           "tmpProposalConceptChild",
  //           "tmpProposalRelationChild",
  //           "tmpProposalReferenceChild",
  //           "tmpProposalQuestionChild",
  //           "tmpProposalIdeaChild",
  //           "tmpProposalCodeChild",
  //         ].includes(tutorialName);

  //     if (!isValidForcedTutorialChild) return false;
  //     if (!canDetect) return false;

  //     devLog("DETECT_AND_CALL_CHILD_TUTORIAL", { tutorialName }, "TUTORIAL");

  //     const newTargetId = nodeBookState.selectedNode ?? "";
  //     if (!newTargetId) return false;

  //     const thisNode = graph.nodes[newTargetId]; // this is the child node
  //     if (!thisNode) return false;
  //     if (!targetIsValid(thisNode)) return false;

  //     startTutorial(tutorialName);
  //     setDynamicTargetId(newTargetId);
  //     if (forcedTutorial) {
  //       nodeBookDispatch({ type: "setSelectedNode", payload: newTargetId });
  //       notebookRef.current.selectedNode = newTargetId;
  //       scrollToNode(newTargetId);
  //     }
  //     return true;
  //   },
  //   [
  //     forcedTutorial,
  //     graph.nodes,
  //     nodeBookDispatch,
  //     nodeBookState.selectedNode,
  //     scrollToNode,
  //     setDynamicTargetId,
  //     startTutorial,
  //     userTutorial,
  //   ]
  // );

  const parentWithMostChildren = useCallback(() => {
    const frequencies = Object.keys(graph.edges)
      .map(edge => edge.split("-")[0])
      .reduce((acc: { [key: string]: number }, edge: string) => {
        acc[edge] = acc[edge] ? acc[edge] + 1 : 1;
        return acc;
      }, {});
    const maxNode = Object.entries(frequencies).reduce(
      (max: { edge: string; children: number }, [edge, children]: [string, number]) => {
        return children > max.children ? { edge, children } : max;
      },
      { edge: "", children: 0 }
    );

    return maxNode;
  }, [graph.edges]);

  const parentWithChildren = useCallback(
    (parentId: string) => {
      const frequency = Object.keys(graph.edges)
        .map(edge => edge.split("-")[0])
        .reduce((acc: number, edge: string) => {
          return edge === parentId ? acc + 1 : acc;
        }, 0);

      return frequency;
    },
    [graph.edges]
  );

  // const getGraphOpenedNodes = useCallback((): number => {
  //   const nodesOpened = Object.values(graph.nodes).reduce((acc: number, node: FullNodeData) => {
  //     return node.open ? acc + 1 : acc;
  //   }, 0);

  //   return nodesOpened;
  // }, [graph.nodes]);

  useEffect(() => {
    /**
     * This useEffect will detect conditions to call a tutorial
     * we need selected node over required node
     * This useEffect executed 2 times when we force tutorial
     * 1. first time will set up required states
     * 2. second time will run tutorial
     */
    const detectTriggerTutorial = () => {
      if (!userTutorialLoaded) return;
      if (firstLoading) return;
      if (tutorial) return;
      if (focusView.isEnabled) return;

      devLog(
        "USE_EFFECT: DETECT_TRIGGER_TUTORIAL",
        { userTutorial, tutorialStateWasSetUpRef: tutorialStateWasSetUpRef.current },
        "TUTORIAL"
      );

      // --------------------------

      if ((!userTutorial.navigation.done && !userTutorial.navigation.skipped) || forcedTutorial === "navigation") {
        startTutorial("navigation");
        // TODO: force 1cademy node  if there isn't nodes
        return;
      }

      // --------------------------

      if (hideNodeContent) return;

      // --------------------------

      const nodesTutorialIsValid = (node: FullNodeData) => Boolean(node && node.open && !node.editable && !node.isNew);

      if (forcedTutorial === "nodes" || !forcedTutorial) {
        const result = detectAndCallTutorial("nodes", nodesTutorialIsValid);
        if (result) return;
      }

      if (forcedTutorial === "nodes") {
        const defaultStates = { open: true };
        const newTargetId = "r98BjyFDCe4YyLA3U8ZE";
        const thisNode = graph.nodes[newTargetId];
        if (!nodesTutorialIsValid(thisNode)) {
          if (!tutorialStateWasSetUpRef.current) {
            openNodeHandler(newTargetId, defaultStates);
            tutorialStateWasSetUpRef.current = true;
          }
          return;
        }
        tutorialStateWasSetUpRef.current = false;
        nodeBookDispatch({ type: "setSelectedNode", payload: newTargetId });
        notebookRef.current.selectedNode = newTargetId;
        startTutorial("nodes");
        setDynamicTargetId(newTargetId);

        setNodeUpdates({
          nodeIds: [newTargetId],
          updatedAt: new Date(),
        });

        return;
      }

      // --------------------------

      const nodesTutorialIsCompleted = () => userTutorial["nodes"].done || userTutorial["nodes"].skipped;

      if (!userTutorial["knowledgeGraph"].done && !userTutorial["knowledgeGraph"].skipped && !forcedTutorial) {
        if (nodesTutorialIsCompleted()) return startTutorial("knowledgeGraph");
      }

      if (forcedTutorial === "knowledgeGraph") {
        startTutorial("knowledgeGraph");
        return;
      }

      // --------------------------

      if (forcedTutorial === "nodeInteractions") {
        startTutorial("nodeInteractions");
        return;
      }

      // --------------------------

      if (/* !forcedTutorial || */ forcedTutorial === "tagsReferences") {
        const result = detectAndCallTutorial("tagsReferences", node =>
          Boolean(node && node.open && !node.editable && node.localLinkingWords === "References")
        );
        if (result) return;
      }

      if (forcedTutorial === "tagsReferences") {
        const result = detectAndForceTutorial("tmpTagsReferences", "r98BjyFDCe4YyLA3U8ZE", node =>
          Boolean(node && node.open && !node.editable && node.localLinkingWords !== "References")
        );
        if (result) return;
      }
      // --------------------------

      const parentsChildrenListTutorialIsValid = (node: FullNodeData) =>
        Boolean(node && node.open && !node.editable && !node.isNew && node.localLinkingWords === "LinkingWords");

      if (forcedTutorial === "parentsChildrenList" /*  || !forcedTutorial */) {
        const result = detectAndCallTutorial("parentsChildrenList", parentsChildrenListTutorialIsValid);
        if (result) return;
      }

      if (forcedTutorial === "parentsChildrenList") {
        const result = detectAndForceTutorial("tmpParentsChildrenList", "r98BjyFDCe4YyLA3U8ZE", (node: FullNodeData) =>
          Boolean(node && node.open && !node.editable && node.localLinkingWords !== "LinkingWords")
        );
        if (result) return; /* (lastNodeOperation.current?.name = "LinkingWords"); */
      }

      // --------------------------

      if (forcedTutorial === "toolbox" || userTutorial["nodes"].done || userTutorial["nodes"].skipped) {
        const shouldIgnore = forcedTutorial
          ? forcedTutorial !== "toolbox"
          : userTutorial["toolbox"].done || userTutorial["toolbox"].skipped;
        if (!shouldIgnore) {
          setToolboxExpanded(true);
          startTutorial("toolbox");
          return;
        }
      }

      // --------------------------

      if (forcedTutorial === "proposal" /*  || !forcedTutorial */) {
        const result = detectAndCallTutorial("proposal", (thisNode: FullNodeData) =>
          Boolean(
            thisNode && thisNode.open && thisNode.editable && !thisNode.isNew && thisNode.nodeType !== "Reference"
          )
        );
        if (result) return;
      }

      // --------------------------

      if (forcedTutorial === "proposalCode" /*  || !forcedTutorial */) {
        const codeProposalTutorialIsValid = (node: FullNodeData) =>
          Boolean(node && node.open && node.editable && node.nodeType === "Code");
        const result = detectAndCallTutorial("proposalCode", codeProposalTutorialIsValid);
        if (result) return;
      }

      // --------------------------

      if (forcedTutorial === "proposalConcept" /* || !forcedTutorial */) {
        const conceptProposalTutorialIsValid = (node: FullNodeData) =>
          Boolean(node && node.open && node.editable && node.nodeType === "Concept");

        const result = detectAndCallTutorial("proposalConcept", conceptProposalTutorialIsValid);
        if (result) return;
      }

      // --------------------------

      const relationProposalTutorialIsValid = (node: FullNodeData) =>
        Boolean(node && node.open && node.editable && node.nodeType === "Relation");

      if (forcedTutorial === "proposalRelation" /*  || !forcedTutorial */) {
        const relationProposalTutorialLaunched = detectAndCallTutorial(
          "proposalRelation",
          relationProposalTutorialIsValid
        );
        if (relationProposalTutorialLaunched) return;
      }

      // --------------------------

      const referenceProposalTutorialIsValid = (node: FullNodeData) =>
        Boolean(node && node.open && node.editable && node.nodeType === "Reference");

      if (forcedTutorial === "proposalReference" /*  || !forcedTutorial */) {
        const referenceProposalTutorialLaunched = detectAndCallTutorial(
          "proposalReference",
          referenceProposalTutorialIsValid
        );
        if (referenceProposalTutorialLaunched) return;
      }

      // --------------------------

      const questionProposalTutorialIsValid = (node: FullNodeData) =>
        Boolean(node && node.open && node.editable && node.nodeType === "Question");

      if (forcedTutorial === "proposalQuestion" /*  || !forcedTutorial */) {
        const result = detectAndCallTutorial("proposalQuestion", questionProposalTutorialIsValid);
        if (result) return;
      }

      // --------------------------

      const ideaProposalTutorialIsValid = (node: FullNodeData) =>
        Boolean(node && node.open && node.editable && node.nodeType === "Idea");

      if (forcedTutorial === "proposalIdea" /* || !forcedTutorial */) {
        const result = detectAndCallTutorial("proposalIdea", ideaProposalTutorialIsValid);
        if (result) return;
      }

      // --------------------------

      const conceptTutorialIsValid = (thisNode: FullNodeData) =>
        Boolean(thisNode && thisNode.open && thisNode.nodeType === "Concept");

      if (forcedTutorial === "concept" /* || !forcedTutorial */) {
        const result = detectAndCallTutorial("concept", conceptTutorialIsValid);
        if (result) return;
      }

      if (forcedTutorial === "concept") {
        const conceptForcedTutorialLaunched = detectAndForceTutorial(
          "concept",
          "r98BjyFDCe4YyLA3U8ZE",
          conceptTutorialIsValid
        );
        if (conceptForcedTutorialLaunched) return;
      }
      // --------------------------

      const relationTutorialIsValid = (thisNode: FullNodeData) =>
        Boolean(thisNode && thisNode.open && thisNode.nodeType === "Relation");

      if (forcedTutorial === "relation" /*  || !forcedTutorial */) {
        const result = detectAndCallTutorial("relation", relationTutorialIsValid);
        if (result) return;
      }

      if (forcedTutorial === "relation") {
        const relationForcedTutorialLaunched = detectAndForceTutorial(
          "relation",
          "zYYmaXvhab7hH2uRI9Up",
          relationTutorialIsValid
        );
        if (relationForcedTutorialLaunched) return;
      }

      // --------------------------
      const referenceTutorialIsValid = (thisNode: FullNodeData) =>
        Boolean(thisNode && thisNode.open && thisNode.nodeType === "Reference");

      if (forcedTutorial === "reference" /* || !forcedTutorial */) {
        const result = detectAndCallTutorial("reference", referenceTutorialIsValid);
        if (result) return;
      }

      if (forcedTutorial === "reference") {
        const referenceForcedTutorialLaunched = detectAndForceTutorial(
          "reference",
          "P631lWeKsBtszZRDlmsM",
          referenceTutorialIsValid
        );
        if (referenceForcedTutorialLaunched) return;
      }

      // --------------------------

      const questionTutorialIsValid = (thisNode: FullNodeData) =>
        Boolean(thisNode && thisNode.open && thisNode.nodeType === "Question");

      if (forcedTutorial === "question" /*  || !forcedTutorial */) {
        const result = detectAndCallTutorial("question", questionTutorialIsValid);
        if (result) return;
      }

      if (forcedTutorial === "question") {
        const questionForcedTutorialLaunched = detectAndForceTutorial(
          "question",
          "qO9uK6UdYRLWm4Olihlw",
          questionTutorialIsValid
        );
        if (questionForcedTutorialLaunched) return;
      }

      // --------------------------

      const ideaTutorialIsValid = (thisNode: FullNodeData) =>
        Boolean(thisNode && thisNode.open && thisNode.nodeType === "Idea");

      if (forcedTutorial === "idea" /*  || !forcedTutorial */) {
        const result = detectAndCallTutorial("idea", ideaTutorialIsValid);
        if (result) return;
      }

      if (forcedTutorial === "idea") {
        const ideaForcedTutorialLaunched = detectAndForceTutorial("idea", "v9wGPxRCI4DRq11o7uH2", ideaTutorialIsValid);
        if (ideaForcedTutorialLaunched) return;
      }

      // --------------------------

      const codeTutorialIsValid = (thisNode: FullNodeData) =>
        Boolean(thisNode && thisNode.open && thisNode.nodeType === "Code");

      if (forcedTutorial === "code" /*  || !forcedTutorial */) {
        const result = detectAndCallTutorial("code", codeTutorialIsValid);
        if (result) return;
      }

      if (forcedTutorial === "code") {
        const codeForcedTutorialLaunched = detectAndForceTutorial("code", "E1nIWQ7RIC3pRLvk0Bk5", codeTutorialIsValid);
        if (codeForcedTutorialLaunched) return;
      }

      // ------------------------

      // if (forcedTutorial === "childProposal" || !forcedTutorial) {
      //   const result = detectAndCallChildTutorial("childProposal", (node: FullNodeData) =>
      //     Boolean(node && Boolean(node.isNew) && node.open && node.editable)
      //   );
      //   if (result) return;
      // }

      // //------------------------

      // if (forcedTutorial === "childConcept" || !forcedTutorial) {
      //   const childConceptProposalIsValid = (node: FullNodeData) =>
      //     Boolean(node && Boolean(node.isNew) && node.open && node.editable && node.nodeType === "Concept");
      //   const result = detectAndCallChildTutorial("childConcept", childConceptProposalIsValid);
      //   if (result) return;
      // }

      // //------------------------

      // if (forcedTutorial === "childRelation" || !forcedTutorial) {
      //   const relationChildProposalIsValid = (node: FullNodeData) =>
      //     Boolean(node && Boolean(node.isNew) && node.open && node.editable && node.nodeType === "Relation");
      //   const result = detectAndCallChildTutorial("childRelation", relationChildProposalIsValid);
      //   if (result) return;
      // }

      // // ------------------------

      // if (forcedTutorial === "childReference" || !forcedTutorial) {
      //   const referenceChildProposalIsValid = (node: FullNodeData) =>
      //     Boolean(node && Boolean(node.isNew) && node.open && node.editable && node.nodeType === "Reference");
      //   const result = detectAndCallChildTutorial("childReference", referenceChildProposalIsValid);
      //   if (result) return;
      // }

      // // ------------------------

      // if (forcedTutorial === "childQuestion" || !forcedTutorial) {
      //   const questionChildProposalIsValid = (node: FullNodeData) =>
      //     Boolean(node && Boolean(node.isNew) && node.open && node.editable && node.nodeType === "Question");
      //   const result = detectAndCallChildTutorial("childQuestion", questionChildProposalIsValid);
      //   if (result) return;
      // }

      // // ------------------------

      // if (forcedTutorial === "childIdea" || !forcedTutorial) {
      //   const ideaChildProposalIsValid = (node: FullNodeData) =>
      //     Boolean(node && Boolean(node.isNew) && node.open && node.editable && node.nodeType === "Idea");
      //   const result = detectAndCallChildTutorial("childIdea", ideaChildProposalIsValid);
      //   if (result) return;
      // }

      // // ------------------------

      // if (forcedTutorial === "childCode" || !forcedTutorial) {
      //   const codeChildProposalIsValid = (node: FullNodeData) =>
      //     Boolean(node && Boolean(node.isNew) && node.open && node.editable && node.nodeType === "Code");
      //   const result = detectAndCallChildTutorial("childCode", codeChildProposalIsValid);
      //   if (result) return;
      // }

      // // -----------------------

      // if (forcedTutorial && ["childProposal", "childConcept"].includes(forcedTutorial)) {
      //   const proposalConceptChildLaunched = detectAndCallTutorial("tmpProposalConceptChild", (node: FullNodeData) =>
      //     Boolean(node && node.open && node.editable && !Boolean(node.isNew))
      //   );
      //   if (proposalConceptChildLaunched) return;
      // }

      // // ------------------------

      // if (forcedTutorial === "childRelation") {
      //   const proposalRelationChildLaunched = detectAndCallTutorial("tmpProposalRelationChild", (node: FullNodeData) =>
      //     Boolean(node && node.open && node.editable && !Boolean(node.isNew))
      //   );
      //   if (proposalRelationChildLaunched) return;
      // }

      // // ------------------------

      // if (forcedTutorial === "childReference") {
      //   const proposalReferenceChildLaunched = detectAndCallTutorial(
      //     "tmpProposalReferenceChild",
      //     (node: FullNodeData) => Boolean(node && node.open && node.editable && !Boolean(node.isNew))
      //   );
      //   if (proposalReferenceChildLaunched) return;
      // }

      // // ------------------------

      // if (forcedTutorial === "childQuestion") {
      //   const proposalQuestionChildLaunched = detectAndCallTutorial("tmpProposalQuestionChild", (node: FullNodeData) =>
      //     Boolean(node && node.open && node.editable && !Boolean(node.isNew))
      //   );
      //   if (proposalQuestionChildLaunched) return;
      // }

      // // ------------------------

      // if (forcedTutorial === "childIdea") {
      //   const proposalIdeaChildLaunched = detectAndCallTutorial("tmpProposalIdeaChild", (node: FullNodeData) =>
      //     Boolean(node && node.open && node.editable && !Boolean(node.isNew))
      //   );
      //   if (proposalIdeaChildLaunched) return;
      // }

      // // ------------------------

      // if (forcedTutorial === "childCode") {
      //   const proposalCodeChildLaunched = detectAndCallTutorial("tmpProposalCodeChild", (node: FullNodeData) =>
      //     Boolean(node && node.open && node.editable && !Boolean(node.isNew))
      //   );
      //   if (proposalCodeChildLaunched) return;
      // }

      // // ------------------------

      const tmpEditNodeIsValid = (node: FullNodeData) => Boolean(node && node.open && !node.editable);

      const proposalForcedValues = new Map<
        TutorialTypeKeys,
        { targetId: string; validator: (node: FullNodeData) => boolean }
      >();
      proposalForcedValues.set("proposal", {
        targetId: "r98BjyFDCe4YyLA3U8ZE",
        validator: (node: FullNodeData) => tmpEditNodeIsValid(node),
      });
      proposalForcedValues.set("proposalConcept", {
        targetId: "r98BjyFDCe4YyLA3U8ZE",
        validator: (node: FullNodeData) => tmpEditNodeIsValid(node) && node.nodeType === "Concept",
      });
      proposalForcedValues.set("proposalCode", {
        targetId: "E1nIWQ7RIC3pRLvk0Bk5",
        validator: (node: FullNodeData) => tmpEditNodeIsValid(node) && node.nodeType === "Code",
      });
      proposalForcedValues.set("proposalRelation", {
        targetId: "zYYmaXvhab7hH2uRI9Up",
        validator: (node: FullNodeData) => tmpEditNodeIsValid(node) && node.nodeType === "Relation",
      });
      proposalForcedValues.set("proposalReference", {
        targetId: "P631lWeKsBtszZRDlmsM",
        validator: (node: FullNodeData) => tmpEditNodeIsValid(node) && node.nodeType === "Reference",
      });
      proposalForcedValues.set("proposalQuestion", {
        targetId: "qO9uK6UdYRLWm4Olihlw",
        validator: (node: FullNodeData) => tmpEditNodeIsValid(node) && node.nodeType === "Question",
      });
      proposalForcedValues.set("proposalIdea", {
        targetId: "v9wGPxRCI4DRq11o7uH2",
        validator: (node: FullNodeData) => tmpEditNodeIsValid(node) && node.nodeType === "Idea",
      });

      if (forcedTutorial && proposalForcedValues.has(forcedTutorial)) {
        const tt = proposalForcedValues.get(forcedTutorial);
        if (!tt) return;

        const { targetId, validator } = tt;
        const result = detectAndForceTutorial("tmpEditNode", targetId, validator);
        if (result) return;
      }

      // // ------------------------

      // const childTypes: TutorialTypeKeys[] = [
      //   "childProposal",
      //   "childConcept",
      //   "childRelation",
      //   "childReference",
      //   "childQuestion",
      //   "childIdea",
      //   "childCode",
      // ];

      // if (forcedTutorial && childTypes.includes(forcedTutorial)) {
      //   const result = detectAndForceTutorial("tmpEditNode", "r98BjyFDCe4YyLA3U8ZE", tmpEditNodeIsValid);
      //   if (result) return;
      // }

      // ------------------------

      if (
        forcedTutorial === "reconcilingAcceptedProposal" /*  ||
        (lastNodeOperation.current &&
          lastNodeOperation.current.name === "ProposeProposals" &&
          lastNodeOperation.current.data === "accepted") */
      ) {
        const acceptedProposalLaunched = detectAndCallTutorial(
          "reconcilingAcceptedProposal",
          node =>
            !!node &&
            !!node.open &&
            isVersionApproved({ corrects: 1, wrongs: 0, nodeData: node, isInstructor: false, instantApprove: false })
        );
        if (acceptedProposalLaunched) return;
      }
      if (forcedTutorial === "reconcilingAcceptedProposal") {
        const result = detectAndForceTutorial("reconcilingAcceptedProposal", "zYYmaXvhab7hH2uRI9Up", node =>
          Boolean(node && node.open)
        );
        if (result) return;
      }
      // ------------------------

      if (
        forcedTutorial === "reconcilingNotAcceptedProposal" /* ||
        (lastNodeOperation.current &&
          lastNodeOperation.current.name === "ProposeProposals" &&
          lastNodeOperation.current.data === "notAccepted") */
      ) {
        const notAcceptedProposalLaunched = detectAndCallTutorial("reconcilingNotAcceptedProposal", node =>
          Boolean(
            node &&
              node.open &&
              !isVersionApproved({ corrects: 1, wrongs: 0, nodeData: node, isInstructor: false, instantApprove: false })
          )
        );
        setOpenSidebar("PROPOSALS");
        // setDynamicTargetId('')
        if (notAcceptedProposalLaunched) return;
      }

      if (forcedTutorial === "reconcilingNotAcceptedProposal") {
        const result = detectAndForceTutorial("reconcilingNotAcceptedProposal", "r98BjyFDCe4YyLA3U8ZE", node =>
          Boolean(node && node.open)
        );
        if (result) return;
      }

      // --------------------------

      if (forcedTutorial === "upVote" /*  || !forcedTutorial */) {
        const shouldIgnore =
          (!forcedTutorial && !userTutorial["nodes"].done && !userTutorial["nodes"].skipped) ||
          userTutorial["upVote"].done ||
          userTutorial["upVote"].skipped;
        if (!shouldIgnore) {
          const upvoteLaunched = detectAndCallTutorial("upVote", node => Boolean(node && node.open));
          if (upvoteLaunched) return;
        }
      }

      if (forcedTutorial === "upVote") {
        const result = detectAndForceTutorial("upVote", "r98BjyFDCe4YyLA3U8ZE", node => Boolean(node && node.open));
        if (result) return;
      }

      // --------------------------

      if (forcedTutorial === "downVote" /* || !forcedTutorial */) {
        const shouldIgnore =
          (!forcedTutorial && !userTutorial["nodes"].done && !userTutorial["nodes"].skipped) ||
          userTutorial["downVote"].done ||
          userTutorial["downVote"].skipped;
        if (!shouldIgnore) {
          const upvoteLaunched = detectAndCallTutorial("downVote", node => Boolean(node && node.open));
          if (upvoteLaunched) return;
        }
      }

      if (forcedTutorial === "downVote") {
        const result = detectAndForceTutorial("downVote", "r98BjyFDCe4YyLA3U8ZE", node => Boolean(node && node.open));
        if (result) return;
      }

      // --------------------------

      if (forcedTutorial === "searcher" /*  || openSidebar === "SEARCHER_SIDEBAR" */) {
        const result = detectAndCallSidebarTutorial("searcher", "SEARCHER_SIDEBAR");
        if (result) return;
      }

      if (forcedTutorial === "userSettings" /* || openSidebar === "USER_SETTINGS" */) {
        const result = detectAndCallSidebarTutorial("userSettings", "USER_SETTINGS");
        if (result) return;
      }
      // --------------------------

      if (forcedTutorial === "notifications" /*  || openSidebar === "NOTIFICATION_SIDEBAR" */) {
        const result = detectAndCallSidebarTutorial("notifications", "NOTIFICATION_SIDEBAR");
        if (result) return;
      }

      // --------------------------

      if (forcedTutorial === "bookmarks" /*  || openSidebar === "BOOKMARKS_SIDEBAR" */) {
        const result = detectAndCallSidebarTutorial("bookmarks", "BOOKMARKS_SIDEBAR");
        if (result) return;
      }

      // --------------------------

      if (forcedTutorial === "pendingProposals" /* || openSidebar === "PENDING_PROPOSALS" */) {
        const result = detectAndCallSidebarTutorial("pendingProposals", "PENDING_PROPOSALS");
        if (result) return;
      }

      // --------------------------

      if (openSidebar === "USER_INFO") {
        const result = detectAndCallSidebarTutorial("userInfo", "USER_INFO");
        if (result) return;
      }
      if (forcedTutorial === "userInfo") {
        nodeBookDispatch({
          type: "setSelectedUser",
          payload: {
            username: "1man",
            chooseUname: true,
            fullName: "Iman",
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F1man_Thu%2C%2006%20Feb%202020%2016%3A26%3A40%20GMT.png?alt=media&token=94459dbb-81f9-462a-83ef-62d1129f5851",
          },
        });
        const result = detectAndCallSidebarTutorial("userInfo", "USER_INFO");
        if (result) return;
      }

      // // --------------------------

      // const hideDescendantsTutorialIsValid = (node: FullNodeData) =>
      //   node && !node.editable && parentWithChildren(node.node) >= 2;
      // if (!forcedTutorial || forcedTutorial === "hideDescendants") {
      //   const result = detectAndCallTutorial("hideDescendants", hideDescendantsTutorialIsValid);
      //   if (result) return;
      // }

      // const hideDescendantsTutorialForcedIsValid = (node: FullNodeData) => node && !node.editable;
      // if (forcedTutorial === "hideDescendants") {
      //   const result = detectAndForceTutorial(
      //     "hideDescendants",
      //     "r98BjyFDCe4YyLA3U8ZE",
      //     hideDescendantsTutorialForcedIsValid
      //   );
      //   if (result && parentWithChildren("r98BjyFDCe4YyLA3U8ZE") < 2) {
      //     openNodeHandler("LrUBGjpxuEV2W0shSLXf", {}, false);
      //     openNodeHandler("rWYUNisPIVMBoQEYXgNj", {}, false);

      //     return;
      //   }
      // }
      // // --------------------------

      // const nodesTutorialCompleted = userTutorial["nodes"].done || userTutorial["nodes"].skipped;

      // // --------------------------

      // const closeNodeTutorialIsValid = (node: FullNodeData) => Boolean(Boolean(node) && node.open);
      // const openedNodes = getGraphOpenedNodes();
      // if (openedNodes >= 2 && !forcedTutorial) {
      //   const firstOpenedNode = Object.values(graph.nodes).find(node => node.open);
      //   const collapseNodeTaken = userTutorial["collapseNode"].skipped || userTutorial["collapseNode"].done;
      //   const shouldIgnore = collapseNodeTaken || !nodesTutorialCompleted;
      //   if (firstOpenedNode && !shouldIgnore) {
      //     // const takeOver = nodeBookState.selectedNode ?? firstOpenedNode.node;
      //     const result = detectAndCallTutorial("collapseNode", closeNodeTutorialIsValid);
      //     if (result) return;
      //   }
      // }
      // if (forcedTutorial === "collapseNode") {
      //   const result = detectAndForceTutorial("collapseNode", "r98BjyFDCe4YyLA3U8ZE", closeNodeTutorialIsValid);
      //   if (result) return;
      // }

      // // --------------------------

      // const expandNodeTutorialIsValid = (node: FullNodeData) => Boolean(node) && !node.open;
      // if (Object.keys(graph.nodes).length > openedNodes && !forcedTutorial) {
      //   const firstClosedNode = Object.values(graph.nodes).find(node => !node.open);
      //   const expandNodeTaken = userTutorial["expandNode"].skipped || userTutorial["expandNode"].done;
      //   const shouldIgnore = expandNodeTaken || !nodesTutorialCompleted;
      //   if (firstClosedNode && !shouldIgnore) {
      //     // const takeOver = nodeBookState.selectedNode ?? firstClosedNode.node;
      //     const result = detectAndCallTutorial("expandNode", expandNodeTutorialIsValid);
      //     if (result) return;
      //   }
      // }

      // if (forcedTutorial === "expandNode") {
      //   const result = detectAndForceTutorial("expandNode", "r98BjyFDCe4YyLA3U8ZE", expandNodeTutorialIsValid, {
      //     open: false,
      //   });
      //   if (result) return;
      // }

      // // --------------------------

      // const hideTutorialIsValid = (node: FullNodeData) => Boolean(node);
      // const hasRequiredNodes = Object.values(graph.nodes).length >= 2;
      // const shouldIgnore =
      //   userTutorial["hideNode"].skipped ||
      //   userTutorial["hideNode"].done ||
      //   (!userTutorial["nodes"].done && !userTutorial["nodes"].skipped);
      // if (hasRequiredNodes && !shouldIgnore) {
      //   const result = detectAndCallTutorial("hideNode", hideTutorialIsValid);
      //   if (result) return;
      // }

      // if (forcedTutorial === "hideNode") {
      //   const result = detectAndForceTutorial("hideNode", "r98BjyFDCe4YyLA3U8ZE", hideTutorialIsValid);
      //   if (result) return;
      // }

      // // --------------------------

      // // const proposalNodesComplete = userTutorial["proposal"].done || userTutorial["proposal"].skipped;
      // const knowledgeGraphTutorialCompleted =
      //   userTutorial["knowledgeGraph"].done || userTutorial["knowledgeGraph"].skipped;
      // const isNotProposingNodes = tempNodes.size + Object.keys(changedNodes).length === 0;

      // // --------------------------

      if (
        forcedTutorial === "leaderBoard" /* ||
        (knowledgeGraphTutorialCompleted && isNotProposingNodes && openSidebar === null) */
      ) {
        const result = detectAndCallSidebarTutorial("leaderBoard", null);
        if (result) return;
      }

      // // --------------------------

      // if (
      //   user?.livelinessBar === "reputation" &&
      //   (forcedTutorial === "reputationLivenessBar" ||
      //     (knowledgeGraphTutorialCompleted && isNotProposingNodes && openLivelinessBar))
      // ) {
      //   const shouldIgnore = forcedTutorial
      //     ? forcedTutorial !== "reputationLivenessBar"
      //     : userTutorial["reputationLivenessBar"].done || userTutorial["reputationLivenessBar"].skipped;
      //   if (!shouldIgnore) {
      //     if (!openLivelinessBar) setOpenLivelinessBar(true);
      //     startTutorial("reputationLivenessBar");
      //     return;
      //   }
      // }

      // // --------------------------

      // if (
      //   user?.livelinessBar === "interaction" &&
      //   (forcedTutorial === "interactionLivenessBar" ||
      //     (knowledgeGraphTutorialCompleted && isNotProposingNodes && openLivelinessBar))
      // ) {
      //   const shouldIgnore = forcedTutorial
      //     ? forcedTutorial !== "interactionLivenessBar"
      //     : userTutorial["interactionLivenessBar"].done || userTutorial["interactionLivenessBar"].skipped;
      //   if (!shouldIgnore) {
      //     if (!openLivelinessBar) setOpenLivelinessBar(true);
      //     startTutorial("interactionLivenessBar");
      //     return;
      //   }
      // }

      // // --------------------------

      // if (
      //   forcedTutorial === "communityLeaderBoard" ||
      //   (knowledgeGraphTutorialCompleted && isNotProposingNodes && comLeaderboardOpen)
      // ) {
      //   const shouldIgnore = forcedTutorial
      //     ? forcedTutorial !== "communityLeaderBoard"
      //     : userTutorial["communityLeaderBoard"].done || userTutorial["communityLeaderBoard"].skipped;
      //   if (!shouldIgnore) {
      //     if (!comLeaderboardOpen) setComLeaderboardOpen(true);
      //     startTutorial("communityLeaderBoard");
      //     return;
      //   }
      // }

      // // --------------------------

      if (forcedTutorial === "pathways" /* || knowledgeGraphTutorialCompleted */) {
        const shouldIgnore = forcedTutorial
          ? forcedTutorial !== "pathways"
          : userTutorial["pathways"].done || userTutorial["pathways"].skipped;
        if (!shouldIgnore) {
          if (pathway.node) {
            setDynamicTargetId(pathway.node);
            nodeBookDispatch({ type: "setSelectedNode", payload: pathway.node });
            notebookRef.current.selectedNode = pathway.node;
            scrollToNode(pathway.node);
            startTutorial("pathways");
            return;
          }
        }
      }
      if (forcedTutorial === "pathways") {
        const result = detectAndForceTutorial("tmpPathways", "rWYUNisPIVMBoQEYXgNj", node =>
          Boolean(node && node.open)
        );
        if (result) return;
      }
      if (user) {
        createActionTrack({
          action: "detectTriggerTutorial",
        });
      }
    };

    detectTriggerTutorial();
  }, [
    db,
    user,
    detectAndCallSidebarTutorial,
    detectAndCallTutorial,
    detectAndForceTutorial,
    firstLoading,
    focusView.isEnabled,
    forcedTutorial,
    graph.nodes,
    hideNodeContent,
    nodeBookDispatch,
    openNodeHandler,
    openSidebar,
    pathway,
    pathway.node,
    scrollToNode,
    setDynamicTargetId,
    startTutorial,
    tutorial,
    userTutorial,
    userTutorialLoaded,
  ]);

  useEffect(() => {
    if (!userTutorialLoaded) return;
    if (firstLoading) return;
    if (!tutorial) return;
    if (!currentStep) return;

    if (focusView.isEnabled || (hideNodeContent && tutorial.name !== "navigation")) {
      setTutorial(null);
      setForcedTutorial(null);
      return;
    }

    devLog("USE_EFFECT: DETECT_TO_REMOVE_TUTORIAL", tutorial, "TUTORIAL");

    if (tutorial.name === "nodes") {
      const nodesTutorialIsValid = (node: FullNodeData) => node && node.open; // TODO: add other validations check parentsChildrenList
      const node = graph.nodes[dynamicTargetId];
      if (!nodesTutorialIsValid(node)) {
        setTutorial(null);
        setForcedTutorial(null);
      }
    }

    // --------------------------

    if (tutorial.name === "parentsChildrenList") {
      const nodesTutorialIsValid = (node: FullNodeData) =>
        node && node.open && !node.editable && !node.isNew && node.localLinkingWords === "LinkingWords";
      const node = graph.nodes[dynamicTargetId];
      if (!nodesTutorialIsValid(node)) {
        setTutorial(null);
        setForcedTutorial(null);
      }
    }

    // --------------------------

    if (tutorial.name === "hideDescendants") {
      const hideDescendantsNodeTutorialIsValid = (node: FullNodeData) => Boolean(node) && !node.editable;
      const node = graph.nodes[dynamicTargetId];
      if (!hideDescendantsNodeTutorialIsValid(node)) {
        setTutorial(null);
        setForcedTutorial(null);
      }
    }

    // --------------------------

    if (tutorial.name === "collapseNode") {
      const collapseNodeTutorialIsValid = (node: FullNodeData) =>
        Boolean(node) && (forcedTutorial ? true : node.open) && !node.editable;
      const node = graph.nodes[dynamicTargetId];
      if (!collapseNodeTutorialIsValid(node)) {
        setTutorial(null);
        setForcedTutorial(null);
      }
    }

    // --------------------------

    if (tutorial.name === "expandNode") {
      const expandNodeTutorialIsValid = (node: FullNodeData) =>
        Boolean(node) && (forcedTutorial ? true : !node.open) && !node.editable;
      const node = graph.nodes[dynamicTargetId];
      if (!expandNodeTutorialIsValid(node)) {
        setTutorial(null);
        setForcedTutorial(null);
      }
    }

    // --------------------------

    if (tutorial.name === "hideNode") {
      const HideNodeTutorialIsValid = (node: FullNodeData) => (forcedTutorial ? true : Boolean(node));
      const node = graph.nodes[dynamicTargetId];
      if (!HideNodeTutorialIsValid(node)) {
        setTutorial(null);
        setForcedTutorial(null);
      }
    }

    // --------------------------

    const conceptTutorialIsValid = (thisNode: FullNodeData) =>
      Boolean(thisNode && thisNode.open && thisNode.nodeType === "Concept");
    detectAndRemoveTutorial("concept", conceptTutorialIsValid);

    // --------------------------
    const relationTutorialIsValid = (thisNode: FullNodeData) =>
      Boolean(thisNode && thisNode.open && thisNode.nodeType === "Relation");
    detectAndRemoveTutorial("relation", relationTutorialIsValid);

    // --------------------------
    const referenceTutorialIsValid = (thisNode: FullNodeData) =>
      Boolean(thisNode && thisNode.open && thisNode.nodeType === "Reference");
    detectAndRemoveTutorial("reference", referenceTutorialIsValid);

    // --------------------------
    const questionTutorialIsValid = (thisNode: FullNodeData) =>
      Boolean(thisNode && thisNode.open && thisNode.nodeType === "Question");
    detectAndRemoveTutorial("question", questionTutorialIsValid);

    // --------------------------
    const ideaTutorialIsValid = (thisNode: FullNodeData) =>
      Boolean(thisNode && thisNode.open && thisNode.nodeType === "Idea");
    detectAndRemoveTutorial("idea", ideaTutorialIsValid);

    // --------------------------

    const codeTutorialIsValid = (thisNode: FullNodeData) =>
      Boolean(thisNode && thisNode.open && thisNode.nodeType === "Code");
    detectAndRemoveTutorial("code", codeTutorialIsValid);

    // --------------------------

    const proposalTutorialIsValid = (thisNode: FullNodeData) => Boolean(thisNode && thisNode.open && thisNode.editable);
    detectAndRemoveTutorial("proposal", proposalTutorialIsValid);

    // --------------------------

    const conceptProposalTutorialIsValid = (thisNode: FullNodeData) =>
      Boolean(thisNode && thisNode.open && thisNode.editable && thisNode.nodeType === "Concept");
    detectAndRemoveTutorial("proposalConcept", conceptProposalTutorialIsValid);

    // --------------------------

    const relationProposalTutorialIsValid = (thisNode: FullNodeData) =>
      Boolean(thisNode && thisNode.open && thisNode.editable && thisNode.nodeType === "Relation");
    detectAndRemoveTutorial("proposalRelation", relationProposalTutorialIsValid);

    // --------------------------

    const referenceProposalTutorialIsValid = (thisNode: FullNodeData) =>
      Boolean(thisNode && thisNode.open && thisNode.editable && thisNode.nodeType === "Reference");
    detectAndRemoveTutorial("proposalReference", referenceProposalTutorialIsValid);

    // --------------------------

    const questionProposalTutorialIsValid = (thisNode: FullNodeData) =>
      Boolean(thisNode && thisNode.open && thisNode.editable && thisNode.nodeType === "Question");
    detectAndRemoveTutorial("proposalQuestion", questionProposalTutorialIsValid);

    // --------------------------

    const ideaProposalTutorialIsValid = (thisNode: FullNodeData) =>
      Boolean(thisNode && thisNode.open && thisNode.editable && thisNode.nodeType === "Idea");
    detectAndRemoveTutorial("proposalIdea", ideaProposalTutorialIsValid);

    // --------------------------

    const codeProposalTutorialIsValid = (thisNode: FullNodeData) =>
      Boolean(thisNode && thisNode.open && thisNode.editable && thisNode.nodeType === "Code");
    detectAndRemoveTutorial("proposalCode", codeProposalTutorialIsValid);

    // --------------------------

    if (tutorial.name === "childConcept") {
      const childConceptProposalIsValid = (node: FullNodeData) =>
        Boolean(node && Boolean(node.isNew) && node.open && node.editable && node.nodeType === "Concept");

      const node = graph.nodes[dynamicTargetId];
      if (!childConceptProposalIsValid(node)) {
        setTutorial(null);
        setForcedTutorial(null);
      }
    }

    // --------------------------

    if (tutorial.name === "tmpEditNode") {
      const tmpEditNodeIsValid = (node: FullNodeData) => Boolean(node && node.open && !node.editable);
      const node = graph.nodes[dynamicTargetId];
      if (!tmpEditNodeIsValid(node)) {
        setTutorial(null);
        if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
        if (node && node.editable) return;

        setForcedTutorial(null);
      }
    }

    // --------------------------

    if (
      tutorial.name === "tmpProposalConceptChild" ||
      tutorial.name === "tmpProposalQuestionChild" ||
      tutorial.name === "tmpProposalRelationChild" ||
      tutorial.name === "tmpProposalReferenceChild" ||
      tutorial.name === "tmpProposalIdeaChild" ||
      tutorial.name === "tmpProposalCodeChild"
    ) {
      const isValid = (node: FullNodeData) => node && node.open && node.editable && !Boolean(node.isNew);
      const node = graph.nodes[dynamicTargetId];
      if (!isValid(node)) {
        setTutorial(null);
        if (node && !node.editable) return;
        setForcedTutorial(null);
      }
    }

    // --------------------------

    if (tutorial.name === "tmpParentsChildrenList") {
      const isValid = (node: FullNodeData) =>
        node && node.open && !node.editable && !Boolean(node.isNew) && node.localLinkingWords !== "LinkingWords";
      const node = graph.nodes[dynamicTargetId];
      if (!isValid(node)) {
        setTutorial(null);
        if (node && node.localLinkingWords === "LinkingWords") return;
        setForcedTutorial(null);
        if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
      }
    }
    // --------------------------

    if (tutorial.name === "tmpTagsReferences") {
      const isValid = (node: FullNodeData) =>
        node && node.open && !node.editable && !Boolean(node.isNew) && node.localLinkingWords !== "References";
      const node = graph.nodes[dynamicTargetId];
      if (!isValid(node)) {
        setTutorial(null);

        if (node && node.localLinkingWords === "References") return;
        setForcedTutorial(null);
        if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
      }
    }
    // --------------------------

    if (tutorial.name === "pathways") {
      const isValid = (node: FullNodeData) =>
        node && !node.editable && !Boolean(node.isNew) && pathway.child && pathway.parent;
      const node = graph.nodes[dynamicTargetId];
      if (!isValid(node)) {
        setTutorial(null);
        setForcedTutorial(null);
        // pathwayRef.current = { node: "", parent: "", child: "" };
        if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
      }
    }
    // --------------------------

    if (tutorial.name === "tmpPathways") {
      const isValid = (node: FullNodeData) =>
        node && !node.editable && !Boolean(node.isNew) && !pathway.child && !pathway.parent;
      const node = graph.nodes[dynamicTargetId];
      if (!isValid(node)) {
        setTutorial(null);
      }
    }
    // --------------------------

    if (tutorial.name === "toolbox") {
      if (!toolboxExpanded) {
        setTutorial(null);
        setForcedTutorial(null);
      }
    }

    // --------------------------

    if (tutorial.name === "reconcilingAcceptedProposal") {
      const reconcilingAcceptedProposalIsValid = (node: FullNodeData) =>
        node &&
        node.open &&
        isVersionApproved({
          corrects: 1,
          wrongs: 0,
          nodeData: node,
          isInstructor: false,
          instantApprove: false,
        });

      const node = graph.nodes[dynamicTargetId];
      if (!reconcilingAcceptedProposalIsValid(node)) {
        setTutorial(null);
        setForcedTutorial(null);
      }
    }

    // --------------------------

    if (tutorial.name === "reconcilingNotAcceptedProposal") {
      const reconcilingNotAcceptedProposalIsValid = (node: FullNodeData) =>
        node &&
        node.open &&
        !isVersionApproved({ corrects: 1, wrongs: 0, nodeData: node, isInstructor: false, instantApprove: false }) &&
        openSidebar === "PROPOSALS";

      const node = graph.nodes[dynamicTargetId];
      if (!reconcilingNotAcceptedProposalIsValid(node)) {
        setOpenSidebar(null);
        setTutorial(null);
        setForcedTutorial(null);
      }
    }

    // --------------------------

    if (tutorial.name === "upVote") {
      const upvoteIsValid = (node: FullNodeData) => node && node.open;
      const node = graph.nodes[dynamicTargetId];
      if (!upvoteIsValid(node)) {
        setTutorial(null);
        setForcedTutorial(null);
      }
    }

    // --------------------------

    if (tutorial.name === "downVote") {
      const downvoteIsValid = (node: FullNodeData) => node && node.open;
      const node = graph.nodes[dynamicTargetId];
      if (!downvoteIsValid(node)) {
        setTutorial(null);
        setForcedTutorial(null);
      }
    }
    // --------------------------

    if (tutorial.name === "userSettings") {
      if (openSidebar === "USER_SETTINGS") return;
      setTutorial(null);
      setForcedTutorial(null);
      if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
    }

    // --------------------------

    if (tutorial.name === "searcher") {
      if (openSidebar === "SEARCHER_SIDEBAR") return;
      setTutorial(null);
      setForcedTutorial(null);
      if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
    }

    // --------------------------

    if (tutorial.name === "notifications") {
      if (openSidebar === "NOTIFICATION_SIDEBAR") return;
      setTutorial(null);
      setForcedTutorial(null);
      if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
    }

    // --------------------------

    if (tutorial.name === "bookmarks") {
      if (openSidebar === "BOOKMARKS_SIDEBAR") return;
      setTutorial(null);
      setForcedTutorial(null);
      if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
    }

    // --------------------------

    if (tutorial.name === "pendingProposals") {
      if (openSidebar === "PENDING_PROPOSALS") return;
      setTutorial(null);
      setForcedTutorial(null);
      if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
    }

    // --------------------------

    if (tutorial.name === "leaderBoard") {
      if (openSidebar === null) return;
      setTutorial(null);
      setForcedTutorial(null);
      if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
    }

    // --------------------------

    // if (tutorial.name === "notebooks") {
    //   if (openSidebar === null) return;
    //   setTutorial(null);
    //   setForcedTutorial(null);
    //   if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
    // }

    // --------------------------

    if (tutorial.name === "reputationLivenessBar") {
      if (openLivelinessBar) return;
      setTutorial(null);
      setForcedTutorial(null);
      if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
    }

    // --------------------------

    if (tutorial.name === "interactionLivenessBar") {
      if (openLivelinessBar) return;
      setTutorial(null);
      setForcedTutorial(null);
      if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
    }

    // --------------------------

    if (tutorial.name === "communityLeaderBoard") {
      if (comLeaderboardOpen) return;
      setTutorial(null);
      setForcedTutorial(null);
      if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
    }

    // --------------------------

    if (tutorial.name === "userInfo") {
      if (openSidebar === "USER_INFO") return;
      setTutorial(null);
      setForcedTutorial(null);
      if (tutorialTargetId) removeStyleFromTarget(tutorialTargetId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    comLeaderboardOpen,
    currentStep,
    detectAndRemoveTutorial,
    firstLoading,
    focusView.isEnabled,
    graph.nodes,
    hideNodeContent,
    nodeBookState.selectedNode,
    openLivelinessBar,
    openProgressBar,
    openSidebar,
    pathway,
    setTutorial,
    dynamicTargetId,
    toolboxExpanded,
    tutorial,
    userTutorialLoaded,
  ]);

  useEffect(() => {
    if (!tutorial) return;
    if (tutorial.name === "childProposal") {
      const thisNode = graph.nodes[dynamicTargetId];
      if (!thisNode) return;

      const childTargetId = thisNode.children.map(cur => cur.node).find(cur => tempNodes.has(cur));
      if (!childTargetId) return;

      setDynamicTargetId(childTargetId);
    }
  }, [graph.nodes, setDynamicTargetId, dynamicTargetId, tutorial]);

  const tutorialGroup = useMemo(() => {
    return getGroupTutorials({ livelinessBar: (user?.livelinessBar as LivelinessBar) ?? null });
  }, [user?.livelinessBar]);

  const tutorialProgress = useMemo(() => {
    const tutorialsOfTOC = tutorialGroup.flatMap(cur => cur.tutorials);
    let tutorialsComplete = 0;
    tutorialsOfTOC.forEach(cur => {
      const tutorialKey = cur.tutorialSteps?.tutorialKey;
      if (!tutorialKey) return;
      const tutorialComplete = userTutorial[tutorialKey].done || userTutorial[tutorialKey].skipped;
      tutorialsComplete += tutorialComplete ? 1 : 0;
    });
    return { tutorialsComplete, totalTutorials: tutorialsOfTOC.length };
  }, [tutorialGroup, userTutorial]);

  // ------------------------ useEffects

  // detect root from url to open practice tool automatically
  useEffect(() => {
    if (!user) return;
    if (!user.role) return;

    // const notebook = router.query.nb as string;
    const root = router.query.root as string;
    if (!root) return;

    setRootQuery(root);
    setDisplayDashboard(true);
  }, [displayDashboard, router.query.nb, router.query.root, user]);

  // useEffect(() => {
  //   if ("serviceWorker" in navigator) {
  //     navigator.serviceWorker.addEventListener("message", event => {
  //       if (event.data && event.data.type === "PERFORM_ACTION") {
  //         const data = event.data.data;
  //         console.log(data, "data-from-notification-worker");
  //       }
  //     });
  //   }
  // }, []);

  useEffect(() => {
    if (!user) return;
    const onSynchronize = (changes: channelsChange[]) => {
      setChannels((prev: any) => changes.reduce(synchronizeStuff, [...prev]));
    };
    const killSnapshot = getChannelsSnapshot(db, { username: user.uname }, onSynchronize);
    return () => killSnapshot();
  }, [db, user]);

  useEffect(() => {
    if (!user) return;
    const onSynchronize = (changes: conversationChange[]) => {
      setConversations((prev: any) => changes.reduce(synchronizeStuff, [...prev]));
    };
    const killSnapshot = getConversationsSnapshot(db, { username: user.uname }, onSynchronize);
    return () => killSnapshot();
  }, [db, user]);

  useEffect(() => {
    const duplicateNotebookFromParams = async () => {
      const nb = router.query.nb as string;
      if (!nb) return;
      if (!user) return;

      const userNotebooks: INotebook[] = [];
      const q = query(collection(db, "notebooks"), where("owner", "==", user.uname));
      const queryDocs = await getDocs(q);
      queryDocs.forEach(c => userNotebooks.push({ id: c.id, ...(c.data() as NotebookDocument) }));

      // validate if notebook was duplicated previously
      const notebookFromParams = userNotebooks.find(cur => cur.duplicatedFrom === nb);
      if (notebookFromParams) return setSelectedNotebookId(notebookFromParams.id);

      const notebookRef = doc(db, "notebooks", nb);
      const notebookDoc = await getDoc(notebookRef);
      if (notebookDoc.exists()) {
        const notebookData = { id: nb, ...(notebookDoc.data() as NotebookDocument) };
        const sameDuplications = userNotebooks.filter(cur => cur.duplicatedFrom === notebookData.id);
        const copyNotebook: NotebookDocument = {
          owner: user.uname,
          ownerImgUrl: user.imageUrl ?? NO_USER_IMAGE,
          ownerChooseUname: Boolean(user.chooseUname),
          ownerFullName: user.fName ?? "",
          title: `${notebookData.title} (${sameDuplications.length + 2})`,
          duplicatedFrom: notebookData.id,
          isPublic: notebookData.isPublic,
          users: [],
          usersInfo: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          defaultTagId: notebookData.defaultTagId ?? user.tagId ?? "",
          defaultTagName: notebookData.defaultTagName ?? user.tag ?? "",
          type: notebookData.type ?? "default",
        };

        const notebooksRef = collection(db, "notebooks");
        const docRef = await addDoc(notebooksRef, copyNotebook);
        const q = query(
          collection(db, "userNodes"),
          where("user", "==", notebookData.owner),
          where("notebooks", "array-contains", notebookData.id),
          where("deleted", "==", false)
        );
        const userNodesDocs = await getDocs(q);
        const nodeIds: string[] = [];
        userNodesDocs.forEach(doc => nodeIds.push(doc.data().node));
        await openNodesOnNotebook(docRef.id, nodeIds);
      } else {
        console.warn(`Notebook with id: ${nb} from params doesn't exist`);
      }
    };

    duplicateNotebookFromParams();
  }, [db, onChangeNotebook, openNodesOnNotebook, router.query.nb, user]);

  useEffect(() => {
    const listener = (e: any) => {
      const detail: IAssistantEventDetail = e.detail || {};
      if (detail.type === "SELECT_NOTEBOOK") {
        onChangeNotebook(detail.notebookId);
      } else if (detail.type === "SEARCH_NODES") {
        setOpenSidebar("SEARCHER_SIDEBAR");
        setQueryParentChildren({ query: detail.query, forced: true });
        nodeBookDispatch({ type: "setSearchQuery", payload: detail.query });
        nodeBookDispatch({ type: "setNodeTitleBlured", payload: true });
      } else if (detail.type === "OPEN_NODE") {
        openLinkedNode(detail.nodeId, "Searcher");
      } else if (detail.type === "IMPROVEMENT") {
        setQueryParentChildren({ query: detail.flashcard.title, forced: true });
        setOpenSidebar(null);
        notebookRef.current.choosingNode = null;
        nodeBookDispatch({ type: "setChoosingNode", payload: null });
        notebookRef.current.choosingNode = null;
        proposeNodeImprovement(null, detail.selectedNode.id);
        // to apply assistant potential improvement on node editor
        setTimeout(() => {
          setGraph(graph => {
            let newGraph = {
              ...graph,
              nodes: { ...graph.nodes },
            };
            let newNode = { ...newGraph.nodes[detail.selectedNode.id] };
            newNode.title = detail.title;
            newNode.content = detail.content;
            newNode.flashcard = detail.flashcard;
            newNode.open = true;

            if (detail.referenceNode) {
              // adding reference of book
              newNode.referenceIds = newNode.referenceIds || [];
              newNode.referenceLabels = newNode.referenceLabels || [];
              newNode.references = newNode.references || [];

              const existingReference = newNode.referenceLabels.find(
                referenceLabel => referenceLabel === detail.bookUrl
              );
              if (!existingReference) {
                newNode.referenceIds.push(detail.referenceNode.id);
                newNode.referenceLabels.push(detail.bookUrl);
                newNode.references.push(detail.referenceNode.title);
              }
            }

            newGraph.nodes[detail.selectedNode.id] = newNode;

            return newGraph;
          });
          setAbleToPropose(true);
          setNodeUpdates({
            nodeIds: [detail.selectedNode.id],
            updatedAt: new Date(),
          });
        }, 1000);
      } else if (detail.type === "CHILD") {
        setQueryParentChildren({ query: detail.flashcard.title, forced: true });
        setOpenSidebar(null);
        notebookRef.current.choosingNode = null;
        nodeBookDispatch({ type: "setChoosingNode", payload: null });
        notebookRef.current.choosingNode = null;
        notebookRef.current.selectedNode = detail.selectedNode.id;
        nodeBookDispatch({ type: "setSelectedNode", payload: detail.selectedNode.id });
        proposeNewChild(null, detail.flashcard.type);
        // to apply assistant potential improvement on node editor
        setTimeout(() => {
          const selectedNodeId = notebookRef.current.selectedNode!;

          setGraph(graph => {
            let newGraph = {
              ...graph,
              nodes: { ...graph.nodes },
            };
            let newNode = { ...newGraph.nodes[selectedNodeId] };

            newNode.title = detail.title;
            newNode.content = detail.content;
            newNode.flashcard = detail.flashcard;
            if (detail.choices) {
              newNode.choices = detail.choices;
            }
            if (detail.referenceNode) {
              // adding reference of book
              newNode.referenceIds = newNode.referenceIds || [];
              newNode.referenceLabels = newNode.referenceLabels || [];
              newNode.references = newNode.references || [];

              const existingReference = newNode.referenceLabels.find(
                referenceLabel => referenceLabel === detail.bookUrl
              );
              if (!existingReference) {
                newNode.referenceIds.push(detail.referenceNode.id);
                newNode.referenceLabels.push(detail.bookUrl);
                newNode.references.push(detail.referenceNode.title);
              }
            }

            newGraph.nodes[selectedNodeId] = newNode;

            return newGraph;
          });
          setAbleToPropose(true);
          setNodeUpdates({
            nodeIds: [selectedNodeId],
            updatedAt: new Date(),
          });
        }, 1000);
        if (detail.choices) window.dispatchEvent(new CustomEvent("stop-loader"));
      } else if (detail.type === "PARENT") {
        setQueryParentChildren({ query: detail.flashcard.title, forced: true });
        setOpenSidebar(null);
        notebookRef.current.choosingNode = null;
        nodeBookDispatch({ type: "setChoosingNode", payload: null });
        notebookRef.current.choosingNode = null;
        notebookRef.current.selectedNode = detail.selectedNode.id;
        nodeBookDispatch({ type: "setSelectedNode", payload: detail.selectedNode.id });
        proposeNewParent(null, detail.flashcard.type);
        // to apply assistant potential improvement on node editor
        setTimeout(() => {
          const selectedNodeId = notebookRef.current.selectedNode!;

          setGraph(graph => {
            let newGraph = {
              ...graph,
              nodes: { ...graph.nodes },
            };
            let newNode = { ...newGraph.nodes[selectedNodeId] };

            newNode.title = detail.title;
            newNode.content = detail.content;
            newNode.flashcard = detail.flashcard;
            if (detail.choices) {
              newNode.choices = detail.choices;
            }
            if (detail.referenceNode) {
              // adding reference of book
              newNode.referenceIds = newNode.referenceIds || [];
              newNode.referenceLabels = newNode.referenceLabels || [];
              newNode.references = newNode.references || [];

              const existingReference = newNode.referenceLabels.find(
                referenceLabel => referenceLabel === detail.bookUrl
              );
              if (!existingReference) {
                newNode.referenceIds.push(detail.referenceNode.id);
                newNode.referenceLabels.push(detail.bookUrl);
                newNode.references.push(detail.referenceNode.title);
              }
            }

            newGraph.nodes[selectedNodeId] = newNode;

            return newGraph;
          });
          setAbleToPropose(true);
          setNodeUpdates({
            nodeIds: [selectedNodeId],
            updatedAt: new Date(),
          });
        }, 1000);
        if (detail.choices) window.dispatchEvent(new CustomEvent("stop-loader"));
      } else if (detail.type === "CLEAR") {
        nodeBookDispatch({ type: "setChoosingNode", payload: null });
        notebookRef.current.choosingNode = null;
        nodeBookDispatch({ type: "setChosenNode", payload: null });
        notebookRef.current.chosenNode = null;
        // reloadPermanentGraph();
        // setOpenSidebar(null);
      }
    };
    window.addEventListener("assistant", listener);
    return () => window.removeEventListener("assistant", listener);
  }, [
    proposeNodeImprovement,
    nodeBookDispatch,
    onChangeNotebook,
    setOpenSidebar,
    setGraph,
    openNodeHandler,
    proposeNewChild,
    revertNodesOnGraph,
  ]);

  // set up event delegation to manage click event on target elements from tutorial
  useEffect(() => {
    if (!tutorialTargetCallback) return;
    if (!tutorialTargetId) return;

    const mapContainerHtml = document.getElementById("map-container");
    if (!mapContainerHtml) return console.warn("this #map-container doesn't exist");

    const clickHandler = (event: any) => {
      if (
        event.target?.id === tutorialTargetId ||
        event.target?.parentNode?.id === tutorialTargetId ||
        event.target?.parentNode?.parentNode?.id === tutorialTargetId ||
        event.currentTarget?.id === tutorialTargetId
      ) {
        tutorialTargetCallback();
      }
    };
    mapContainerHtml.addEventListener("click", clickHandler);

    return () => {
      if (mapContainerHtml) mapContainerHtml.removeEventListener("click", clickHandler);
    };
  }, [tutorialTargetCallback, tutorialTargetId]);

  useEffect(() => {
    if (!user) return;
    const onSynchronize = (changes: channelNotificationChange[]) => {
      setNotificationsMessages((prev: any) =>
        changes.reduce(
          (prev: (any & { id: string })[], change: any) => {
            const docType = change.type;
            const curData = change.data as any & { id: string };

            const prevIdx = prev.findIndex((m: any & { id: string }) => m.id === curData.id);
            if (docType === "added" && prevIdx === -1) {
              prev.push({ ...curData, doc: change.doc });
            }
            if (docType === "modified" && prevIdx !== -1) {
              prev[prevIdx] = { ...curData, doc: change.doc };
            }

            if (docType === "removed" && prevIdx !== -1) {
              prev.splice(prevIdx, 1);
            }
            prev.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
            return prev;
          },
          [...prev]
        )
      );
    };
    const killSnapshot = getchatNotificationsSnapshot(db, { username: user.uname }, onSynchronize);
    return () => killSnapshot();
  }, [db, user]);

  useEffect(() => {
    if (!user) return;
    const onSynchronize = (changes: channelNotificationChange[]) => {
      setCommentNotifications((prev: any) =>
        changes.reduce(
          (prev: (any & { id: string })[], change: any) => {
            const docType = change.type;
            const curData = change.data as any & { id: string };

            const prevIdx = prev.findIndex((m: any & { id: string }) => m.id === curData.id);
            if (docType === "added" && prevIdx === -1) {
              prev.push({ ...curData, doc: change.doc });
            }
            if (docType === "modified" && prevIdx !== -1) {
              prev[prevIdx] = { ...curData, doc: change.doc };
            }

            if (docType === "removed" && prevIdx !== -1) {
              prev.splice(prevIdx, 1);
            }
            prev.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
            return prev;
          },
          [...prev]
        )
      );
    };
    const killSnapshot = getCommentNotificationsSnapshot(db, { username: user.uname }, onSynchronize);
    return () => killSnapshot();
  }, [db, user]);

  useEffect(() => {
    const handleUserActivity = () => {
      setLastInteractionDate(new Date(Date.now()));
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    if (process.env.NODE_ENV === "development") return;
    const checkIfDifferentDay = async () => {
      const userRef = doc(db, "users", user?.uname);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        console.error("User document does not exist");
        return;
      }
      const userData = userDoc.data();
      const lastDeployment: any = await Post("/getLastDeployment");
      const lastCommitTimestamp = new Date(lastDeployment.lastCommitTime);
      const lastUserReload = userData?.lastReload ? userData?.lastReload.toDate() : lastCommitTimestamp;
      const lastCommitTime = lastCommitTimestamp.getTime() + 1000 * 60 * 30;
      const today = new Date();
      if (
        today.getDate() !== lastInteractionDate.getDate() ||
        today.getMonth() !== lastInteractionDate.getMonth() ||
        today.getFullYear() !== lastInteractionDate.getFullYear() ||
        (lastCommitTime > lastUserReload.getTime() && today.getTime() > lastCommitTime)
      ) {
        await updateDoc(userRef, { lastReload: today });
        window.location.reload();
      }
    };

    const intervalId = setInterval(checkIfDifferentDay, 1000 * 60 * 5);

    return () => clearInterval(intervalId);
  }, [user, lastInteractionDate]);

  const findDescendantNodes = useCallback(
    (selectedNode: string, searchNode: string) => {
      const node = graph.nodes[selectedNode] as INode;
      if (node?.children?.some(child => child.node === searchNode)) {
        return true;
      }

      for (const child of node?.children || []) {
        if (findDescendantNodes(child.node, searchNode)) {
          return true;
        }
      }

      return false;
    },
    [graph.nodes]
  );

  const findAncestorNodes = useCallback(
    (selectedNode: string, searchNode: string) => {
      const node = graph.nodes[selectedNode] as INode;
      if (node?.parents?.some(parent => parent.node === searchNode)) {
        return true;
      }

      for (const parent of node?.parents || []) {
        if (findAncestorNodes(parent.node, searchNode)) {
          return true;
        }
      }

      return false;
    },
    [graph.nodes]
  );

  const openComments = useCallback(
    (refId: string, type: string, proposal?: any) => {
      const sidebarInfo = { type, id: refId, ...(type === "version" && { proposal }) };
      setCommentSidebarInfo(sidebarInfo);
      setOpenSidebar("COMMENT");
    },
    [graph.nodes]
  );

  return (
    <div id="map-container" className="MapContainer" style={{ overflow: "hidden" }}>
      {currentStep?.anchor && (
        <Portal anchor="portal">
          {tutorial && (
            <TooltipTutorial
              tutorialStep={currentStep}
              tutorial={tutorial}
              targetClientRect={targetClientRect}
              // handleCloseProgressBarMenu={handleCloseProgressBarMenu}
              onSkip={onSkipTutorial}
              onFinalize={onFinalizeTutorial}
              onNextStep={onNextTutorialStep}
              onPreviousStep={onPreviousTutorialStep}
              stepsLength={tutorial.steps.length}
              node={graph.nodes[dynamicTargetId]}
              forcedTutorial={forcedTutorial}
              groupTutorials={tutorialGroup}
              onForceTutorial={setForcedTutorial}
              tutorialProgress={tutorialProgress}
              showNextTutorialStep={showNextTutorialStep}
              setShowNextTutorialStep={setShowNextTutorialStep}
              isOnPortal
            />
          )}
        </Portal>
      )}
      <Box
        id="Map"
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
        {/* {isWritingOnDB && <NotebookPopup showIcon={false}>Writing DB</NotebookPopup>} */}
        {Object.keys(graph.nodes).length === 0 && !firstLoading && (
          <NotebookPopup showIcon={false}>This notebook has no nodes</NotebookPopup>
        )}

        {nodeBookState.choosingNode?.type && (
          <NotebookPopup
            onClose={() => {
              notebookRef.current.choosingNode = null;
              notebookRef.current.selectedNode = null;
              notebookRef.current.chosenNode = null;
              nodeBookDispatch({ type: "setChoosingNode", payload: null });
              nodeBookDispatch({ type: "setSelectedNode", payload: null });
              nodeBookDispatch({ type: "setChosenNode", payload: null });
            }}
          >
            Cancel Adding a {nodeBookState.choosingNode.type}
          </NotebookPopup>
        )}

        {nodeBookState.previousNode && (
          <Box
            sx={{
              height: "40px",
              display: "flex",
              position: "absolute",
              left: "50%",
              bottom: "35px",
              transform: "translateX(-50%)",
              zIndex: "4",
              backgroundColor: ({ palette: { mode } }) =>
                mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
              borderRadius: "4px",
            }}
          >
            <Button
              onClick={() => {
                notebookRef.current.selectedNode = nodeBookState.previousNode;
                nodeBookDispatch({ type: "setSelectedNode", payload: nodeBookState.previousNode });
                nodeBookDispatch({ type: "setPreviousNode", payload: null });
                scrollToNode(nodeBookState.previousNode);
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                ":hover": {
                  backgroundColor: ({ palette: { mode } }) =>
                    mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray200,
                },
              }}
            >
              <UndoIcon
                sx={{
                  color: theme =>
                    theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.baseWhite : DESIGN_SYSTEM_COLORS.gray800,
                }}
              />
              <Typography
                sx={{
                  color: theme =>
                    theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray25 : DESIGN_SYSTEM_COLORS.gray800,
                }}
              >
                Return to previous node
              </Typography>
            </Button>
            <Divider
              orientation="vertical"
              sx={{
                borderColor: ({ palette: { mode } }) =>
                  mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray300,
              }}
            />
            <Button
              sx={{
                minWidth: "30px!important",
                ":hover": {
                  backgroundColor: ({ palette: { mode } }) =>
                    mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray200,
                },
              }}
              onClick={() => {
                nodeBookDispatch({ type: "setPreviousNode", payload: null });
              }}
            >
              <CloseIcon
                fontSize="small"
                sx={{
                  color: theme =>
                    theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray400,
                }}
              />
            </Button>
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
                <div className="CenteredLoadingImageContainer">
                  <Image className="CenteredLoadingImage" src={LoadingImg} alt="Loading" width={250} height={250} />
                </div>
              )}
            </Suspense>
          </Box>
        )}
        <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
          {user && reputation && (userTutorial.navigation.done || userTutorial.navigation.skipped) && (
            <Box
              sx={{
                "& .GainedPoint, & .LostPoint": {
                  borderRadius: "50%",
                },
              }}
            >
              <MemoizedToolbarSidebar
                notebookRef={notebookRef}
                open={true}
                onClose={onOnlyCloseSidebar}
                reloadPermanentGrpah={revertNodesOnGraph}
                user={user}
                reputationSignal={reputationSignal}
                reputation={reputation}
                theme={settings.theme}
                setOpenSideBar={onOpenSideBar}
                openSidebar={openSidebar}
                mapRendered={true}
                selectedUser={selectedUser}
                uncheckedNotificationsNum={uncheckedNotificationsNum}
                bookmarkUpdatesNum={bookmarkUpdatesNum}
                pendingProposalsNum={pendingProposals.length || 0}
                windowHeight={windowHeight}
                onlineUsers={onlineUsers}
                usersOnlineStatusLoaded={usersOnlineStatusLoaded}
                disableToolbar={Boolean(["TutorialStep"].includes("TOOLBAR"))}
                // setCurrentTutorial={setCurrentTutorial}
                userTutorial={userTutorial}
                dispatch={dispatch}
                notebooks={notebooks}
                onChangeNotebook={onChangeNotebook}
                selectedNotebook={selectedNotebookId}
                openNodesOnNotebook={openNodesOnNotebook}
                setNotebooks={setNotebooks}
                onDisplayInstructorPage={onDisplayInstructorPage}
                onChangeTagOfNotebookById={onChangeTagOfNotebookById}
                isHovered={toolbarIsHovered}
                toolbarRef={toolbarRef}
                newMessages={notificationsMessages.length}
              />

              {openSidebar === "BOOKMARKS_SIDEBAR" && (
                <MemoizedBookmarksSidebar
                  theme={settings.theme}
                  openLinkedNode={openLinkedNode}
                  username={user.uname}
                  open={true}
                  onClose={() => setOpenSidebar(null)}
                  sidebarWidth={sidebarWidth()}
                  innerHeight={innerHeight}
                  innerWidth={windowWith}
                  bookmark={bookmark}
                />
              )}
              {openSidebar === "CHAT" && (
                <MemoizedChatSidebar
                  user={user}
                  settings={settings}
                  theme={settings.theme}
                  openLinkedNode={openLinkedNode}
                  username={user.uname}
                  open={true}
                  onClose={() => setOpenSidebar(null)}
                  sidebarWidth={sidebarWidth()}
                  innerHeight={innerHeight}
                  innerWidth={windowWith}
                  bookmark={bookmark}
                  nodeBookDispatch={nodeBookDispatch}
                  notebookRef={notebookRef}
                  nodeBookState={nodeBookState}
                  notebooks={notebooks}
                  onChangeNotebook={onChangeNotebook}
                  onChangeTagOfNotebookById={onChangeTagOfNotebookById}
                  dispatch={dispatch}
                  selectedNotebook={selectedNotebook}
                  onlineUsers={onlineUsers}
                  notifications={notificationsMessages}
                  openUserInfoSidebar={openUserInfoSidebar}
                  channels={channels}
                  conversations={conversations}
                  openChatByNotification={openChatByNotification}
                  setOpenChatByNotification={setOpenChatByNotification}
                />
              )}
              {openSidebar === "COMMENT" && (
                <MemoizedCommentsSidebar
                  user={user}
                  theme={settings.theme}
                  open={true}
                  onClose={() => setOpenSidebar(null)}
                  sidebarWidth={sidebarWidth()}
                  innerHeight={innerHeight}
                  innerWidth={windowWith}
                  nodeBookDispatch={nodeBookDispatch}
                  notebookRef={notebookRef}
                  nodeBookState={nodeBookState}
                  onlineUsers={onlineUsers}
                  commentSidebarInfo={commentSidebarInfo}
                />
              )}
              {openSidebar === "SEARCHER_SIDEBAR" && (
                <MemoizedSearcherSidebar
                  notebookRef={notebookRef}
                  openLinkedNode={openLinkedNode}
                  open={true}
                  onClose={() => setOpenSidebar(null)}
                  sidebarWidth={sidebarWidth()}
                  innerHeight={innerHeight}
                  innerWidth={windowWith}
                  enableElements={[]}
                  //preLoadNodes={onPreLoadNodes}
                  user={user}
                />
              )}
              {openSidebar === "NOTIFICATION_SIDEBAR" && (
                <MemoizedNotificationSidebar
                  openLinkedNode={openLinkedNode}
                  username={user.uname}
                  open={true}
                  onClose={() => setOpenSidebar(null)}
                  sidebarWidth={sidebarWidth()}
                  innerHeight={innerHeight}
                  setOpenSidebar={setOpenSidebar}
                  setCommentSidebarInfo={setCommentSidebarInfo}
                />
              )}
              {openSidebar === "PENDING_PROPOSALS" && (
                <MemoizedPendingProposalSidebar
                  theme={settings.theme}
                  openLinkedNode={openLinkedNode}
                  username={user.uname}
                  tagId={user.tagId}
                  open={true}
                  onClose={() => onCloseSidebar()}
                  sidebarWidth={sidebarWidth()}
                  innerHeight={innerHeight}
                  pendingProposals={pendingProposals}
                  openComments={openComments}
                  commentNotifications={commentNotifications}
                  // innerWidth={windowWith}
                />
              )}
              {openSidebar === "USER_INFO" && (
                <MemoizedUserInfoSidebar
                  theme={settings.theme}
                  openLinkedNode={openLinkedNode}
                  username={user.uname}
                  open={true}
                  onClose={() => setOpenSidebar(null)}
                  selectedUser={nodeBookState.selectedUser}
                  onlineUsers={onlineUsers}
                />
              )}

              {openSidebar === "PROPOSALS" &&
                !["Reference", "Tag", "Parent", "Child"].includes(nodeBookState.choosingNode?.type ?? "") && (
                  <MemoizedProposalsSidebar
                    theme={settings.theme}
                    open={true}
                    onClose={() => {
                      onCloseSidebar();
                      setEditingModeNode(false);
                    }}
                    clearInitialProposal={clearInitialProposal}
                    initialProposal={nodeBookState.initialProposal}
                    nodeLoaded={graph.nodes.hasOwnProperty(String(nodeBookState.selectedNode))}
                    proposeNodeImprovement={proposeNodeImprovement}
                    selectedNode={nodeBookState.selectedNode}
                    rateProposal={rateProposal}
                    ratingProposal={ratingProposal}
                    selectProposal={onSelectProposal}
                    deleteProposal={deleteProposal}
                    proposeNewChild={proposeNewChild}
                    openProposal={selectedProposalId}
                    db={db}
                    sidebarWidth={sidebarWidth()}
                    innerHeight={innerHeight}
                    innerWidth={windowWith}
                    username={user.uname}
                    openComments={openComments}
                    commentNotifications={commentNotifications}
                  />
                )}

              {openSidebar === "USER_SETTINGS" && (
                <MemoizedUserSettingsSidebar
                  notebookRef={notebookRef}
                  openLinkedNode={openLinkedNode}
                  theme={settings.theme}
                  open={true}
                  onClose={() => setOpenSidebar(null)}
                  dispatch={dispatch}
                  nodeBookDispatch={nodeBookDispatch}
                  nodeBookState={nodeBookState}
                  userReputation={reputation}
                  user={user}
                  scrollToNode={scrollToNode}
                  settings={settings}
                  selectedNotebookId={selectedNotebookId}
                  onChangeNotebook={onChangeNotebook}
                  onChangeTagOfNotebookById={onChangeTagOfNotebookById}
                  notebookOwner={selectedNotebook?.owner ?? ""}
                  onlineUsers={onlineUsers}
                />
              )}
              {nodeBookState.selectedNode && openSidebar === "CITATIONS" && (
                <CitationsSidebar
                  open={true}
                  onClose={() => setOpenSidebar(null)}
                  openLinkedNode={openLinkedNode}
                  identifier={nodeBookState.selectedNode}
                  sidebarWidth={sidebarWidth()}
                  innerHeight={innerHeight}
                  innerWidth={windowWith}
                />
              )}

              {nodeBookState.choosingNode?.type === "Reference" && (
                <ReferencesSidebarMemoized
                  open={true}
                  username={user.uname}
                  onClose={() => {
                    nodeBookDispatch({ type: "setChoosingNode", payload: null });
                    notebookRef.current.choosingNode = null;
                  }}
                  onChangeChosenNode={onChangeChosenNode}
                  // preLoadNodes={onPreLoadNodes}
                />
              )}

              {nodeBookState.choosingNode?.type === "Tag" && (
                <TagsSidebarMemoized
                  open={true}
                  username={user.uname}
                  onClose={() => {
                    nodeBookDispatch({ type: "setChoosingNode", payload: null });
                    notebookRef.current.choosingNode = null;
                  }}
                  onChangeChosenNode={onChangeChosenNode}
                  // preLoadNodes={onPreLoadNodes}
                  notebookRef={notebookRef}
                />
              )}
              {(nodeBookState.choosingNode?.type === "Parent" ||
                nodeBookState.choosingNode?.type === "Child" ||
                nodeBookState.choosingNode?.type === "Node" ||
                nodeBookState.choosingNode?.type === "Improvement") && (
                <ParentsSidebarMemoized
                  notebookRef={notebookRef}
                  title={
                    nodeBookState.choosingNode?.type === "Parent"
                      ? "Parents to Link"
                      : nodeBookState.choosingNode?.type === "Child"
                      ? "Children to Link"
                      : "Nodes to Improve"
                  }
                  open={true}
                  onClose={() => {
                    nodeBookDispatch({ type: "setChoosingNode", payload: null });
                    notebookRef.current.choosingNode = null;
                  }}
                  linkMessage={nodeBookState.choosingNode?.type === "Improvement" ? "Choose to improve" : "Link it"}
                  onChangeChosenNode={onChangeChosenNode}
                  // preLoadNodes={onPreLoadNodes}
                  setQueryParentChildren={setQueryParentChildren}
                  queryParentChildren={queryParentChildren}
                  username={user.uname}
                  findAncestorNodes={findAncestorNodes}
                  findDescendantNodes={findDescendantNodes}
                />
              )}
            </Box>
          )}

          <MemoizedCommunityLeaderboard
            userTagId={user?.tagId ?? ""}
            pendingProposalsLoaded={pendingProposalsLoaded}
            comLeaderboardOpen={comLeaderboardOpen}
            setComLeaderboardOpen={setComLeaderboardOpen}
          />

          <MemoizedToolbox
            expanded={toolboxExpanded}
            setExpanded={setToolboxExpanded}
            isLoading={isQueueWorking}
            sx={{
              position: "absolute",
              right: { xs: "8px", sm: "8px" },
              top: {
                xs: openSidebar ? `${innerHeight * 0.25 + 7}px!important` : "7px!important",
                sm: "7px!important",
              },
            }}
          >
            <>
              {" "}
              {user?.role === "INSTRUCTOR" && (
                <Tooltip title="Create a new Parent Node" placement="bottom">
                  <IconButton
                    id="toolbox-scroll-to-node"
                    color="secondary"
                    onClick={(e: any) => proposeNewParent(e, "Concept", true)}
                    // disabled={!nodeBookState.selectedNode ? true : false}
                    sx={{
                      ":hover": {
                        background: theme.palette.mode === "dark" ? "#404040" : "#EAECF0",
                      },
                      padding: { xs: "2px", sm: "8px" },
                    }}
                  >
                    <AddIcon
                      sx={{
                        color: theme =>
                          theme.palette.mode === "dark"
                            ? theme.palette.common.notebookG100
                            : theme.palette.common.gray500,
                      }}
                    />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Scroll to last Selected Node" placement="bottom">
                <IconButton
                  id="toolbox-scroll-to-node"
                  color="secondary"
                  onClick={onScrollToLastNode}
                  disabled={!nodeBookState.selectedNode ? true : false}
                  sx={{
                    ":hover": {
                      background: theme.palette.mode === "dark" ? "#404040" : "#EAECF0",
                    },
                    opacity: !nodeBookState.selectedNode ? 0.5 : undefined,
                    padding: { xs: "2px", sm: "8px" },
                  }}
                >
                  <MyLocationIcon
                    sx={{
                      color: theme =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.notebookG100
                          : theme.palette.common.gray500,
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip
                title="Redraw graph"
                placement="bottom"
                sx={{
                  ":hover": {
                    background: theme.palette.mode === "dark" ? "#404040" : "#EAECF0",
                    // borderRadius: "8px",
                  },
                  padding: { xs: "2px", sm: "8px" },
                }}
              >
                <IconButton id="toolbox-redraw-graph" color="secondary" onClick={() => onRedrawGraph()}>
                  <AutoFixHighIcon
                    sx={{
                      color: theme =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.notebookG100
                          : theme.palette.common.gray500,
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip
                title="Start tutorial"
                placement="bottom"
                sx={{
                  ":hover": {
                    background: theme.palette.mode === "dark" ? "#404040" : "#EAECF0",
                    // borderRadius: "8px",
                  },
                  padding: { xs: "2px", sm: "8px" },
                }}
              >
                <IconButton
                  id="toolbox-table-of-contents"
                  color="error"
                  onClick={() => {
                    setOpenProgressBar(prev => !prev);
                  }}
                >
                  <HelpCenterIcon
                    sx={{
                      color: theme =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.notebookG100
                          : theme.palette.common.gray500,
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip
                title="Focused view for selected node"
                placement="bottom"
                sx={{
                  ":hover": {
                    background: theme.palette.mode === "dark" ? "#404040" : "#EAECF0",
                    borderRadius: "8px",
                  },
                  padding: { xs: "2px", sm: "8px" },
                }}
              >
                <IconButton
                  id="toolbox-focus-mode"
                  color="secondary"
                  onClick={() => {
                    setFocusView({ isEnabled: true, selectedNode: nodeBookState.selectedNode || "" });
                    setOpenProgressBar(false);
                  }}
                  disabled={!nodeBookState.selectedNode ? true : false}
                  sx={{
                    opacity: !nodeBookState.selectedNode ? 0.5 : undefined,
                  }}
                >
                  <CenterFocusStrongIcon
                    sx={{
                      color: theme =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.notebookG100
                          : theme.palette.common.gray500,
                    }}
                  />
                </IconButton>
              </Tooltip>
            </>
          </MemoizedToolbox>

          {/* end Data from map */}

          {/* {window.innerHeight > 399 && user?.livelinessBar === "relativeInteractions" && (
            <MemoizedRelativeLivelinessBar
              onToggleDisplay={() => setOpenLivelinessBar(prev => !prev)}
              onlineUsers={onlineUsers}
              open={openLivelinessBar}
              openUserInfoSidebar={openUserInfoSidebar}
              user={user}
              variant="relativeInteractions"
            />
          )}

          {window.innerHeight > 399 && user?.livelinessBar === "relativeReputations" && (
            <MemoizedRelativeLivelinessBar
              onToggleDisplay={() => setOpenLivelinessBar(prev => !prev)}
              onlineUsers={onlineUsers}
              open={openLivelinessBar}
              openUserInfoSidebar={openUserInfoSidebar}
              user={user}
              variant="relativeReputations"
            />
          )}

          {window.innerHeight > 399 && user?.livelinessBar === "interaction" && (
            <MemoizedLivelinessBar
              authEmail={user?.email}
              openUserInfoSidebar={openUserInfoSidebar}
              open={openLivelinessBar}
              onlineUsers={onlineUsers}
              variant="absoluteInteractions"
              onToggleDisplay={() => setOpenLivelinessBar(prev => !prev)}
            />
          )}

          {window.innerHeight > 399 && user?.livelinessBar === "reputation" && (
            <MemoizedLivelinessBar
              authEmail={user?.email}
              openUserInfoSidebar={openUserInfoSidebar}
              onlineUsers={onlineUsers}
              open={openLivelinessBar}
              variant="absoluteReputations"
              onToggleDisplay={() => setOpenLivelinessBar(prev => !prev)}
            />
          )} */}

          {focusView.isEnabled && (
            <MemoizedFocusedNotebook
              setSelectedNode={setSelectedNode}
              db={db}
              graph={graph}
              onCloseFocusMode={() => setFocusView({ isEnabled: false, selectedNode: "" })}
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
                {/* origin used to measure the the relative position of each node to the ViewPort */}
                {/* used in onNodeInViewport Callback */}
                <Box
                  id="map-interaction-origin"
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                ></Box>
                {!currentStep?.anchor && tutorial && (
                  <TooltipTutorial
                    tutorial={tutorial}
                    tutorialStep={currentStep}
                    targetClientRect={targetClientRect}
                    // handleCloseProgressBarMenu={handleCloseProgressBarMenu}
                    onSkip={onSkipTutorial}
                    onFinalize={onFinalizeTutorial}
                    onNextStep={onNextTutorialStep}
                    onPreviousStep={onPreviousTutorialStep}
                    stepsLength={tutorial.steps.length}
                    node={graph.nodes[dynamicTargetId]}
                    forcedTutorial={forcedTutorial}
                    groupTutorials={tutorialGroup}
                    onForceTutorial={setForcedTutorial}
                    parent={graph.nodes[pathway.parent]}
                    child={graph.nodes[pathway.child]}
                    tutorialProgress={tutorialProgress}
                    showNextTutorialStep={showNextTutorialStep}
                    setShowNextTutorialStep={setShowNextTutorialStep}
                  />
                )}
                {settings.showClusterOptions && settings.showClusters && (
                  <MemoizedClustersList clusterNodes={clusterNodes} />
                )}
                <MemoizedLinksList
                  edgeIds={edgeIds}
                  edges={graph.edges}
                  onForceRecalculateGraph={onForceRecalculateGraph}
                />
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
                  hideDescendants={hideDescendants}
                  toggleNode={toggleNode}
                  openNodePart={openNodePart}
                  onNodeShare={onNodeShare}
                  selectNode={onSelectNode}
                  correctNode={correctNode}
                  wrongNode={wrongNode}
                  uploadNodeImage={uploadNodeImage}
                  removeImage={removeImage}
                  setOpenMedia={(imgUrl: string) => {
                    setOpenMedia(imgUrl);
                  }}
                  changeNodeHight={changeNodeHight}
                  changeChoice={changeChoice}
                  changeFeedback={changeFeedback}
                  switchChoice={switchChoice}
                  deleteChoice={deleteChoice}
                  addChoice={addChoice}
                  onNodeTitleBlur={onNodeTitleBlur}
                  // setOpenSearch={setOpenSearch}
                  saveProposedChildNode={saveProposedChildNode}
                  saveProposedParentNode={saveProposedParentNode}
                  saveProposedImprovement={saveProposedImprovement}
                  closeSideBar={closeSideBar}
                  reloadPermanentGraph={revertNodesOnGraph}
                  setNodeParts={setNodeParts}
                  citations={citations}
                  setOpenSideBar={setOpenSidebar}
                  proposeNodeImprovement={proposeNodeImprovement}
                  proposeNewChild={proposeNewChild}
                  proposeNewParent={proposeNewParent}
                  scrollToNode={scrollToNode}
                  openSidebar={openSidebar}
                  setOperation={setOperation}
                  openUserInfoSidebar={openUserInfoSidebar}
                  disabledNodes={[]}
                  enableChildElements={[]}
                  // showProposeTutorial={!(userTutorial.proposal.done || userTutorial.proposal.skipped)}
                  // setCurrentTutorial={setCurrentTutorial}
                  ableToPropose={ableToPropose}
                  setAbleToPropose={setAbleToPropose}
                  setOpenPart={onChangeNodePart}
                  // selectedNotebookId={selectedNotebookId}
                  hideNode={hideNodeContent}
                  setAssistantSelectNode={setAssistantSelectNode}
                  assistantSelectNode={assistantSelectNode}
                  onForceRecalculateGraph={onForceRecalculateGraph}
                  setSelectedProposalId={setSelectedProposalId}
                  onChangeChosenNode={onChangeChosenNode}
                  editingModeNode={editingModeNode}
                  setEditingModeNode={setEditingModeNode}
                  displayParentOptions={user?.role === "INSTRUCTOR"}
                  findDescendantNodes={findDescendantNodes}
                  findAncestorNodes={findAncestorNodes}
                  lockedNodes={lockedNodes}
                  onlineUsers={onlineUsers}
                  openComments={openComments}
                  commentNotifications={commentNotifications}
                />
              </MapInteractionCSS>

              {showRegion && (
                <Box
                  id="region-stn"
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
                  onClose={() => setOpenMedia("")}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Paper>
                    <CloseIcon
                      sx={{
                        position: "absolute",
                        top: "60px",
                        right: "50px",
                        zIndex: "99",
                        height: "40px",
                        width: "40px",
                        color: "white",
                        backgroundColor: theme =>
                          theme.palette.mode === "dark"
                            ? DESIGN_SYSTEM_COLORS.notebookMainBlack
                            : DESIGN_SYSTEM_COLORS.notebookMainBlack,
                        borderRadius: "50%",
                        cursor: "pointer",
                        ":hover": {
                          backgroundColor: "grey",
                          color: "white",
                        },
                      }}
                      onClick={() => setOpenMedia("")}
                    />
                    <MapInteractionCSS>
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
                        <Image
                          src={openMedia}
                          alt="Node image"
                          className="responsive-img"
                          layout="fill"
                          objectFit="contain"
                        />
                      </Paper>
                    </MapInteractionCSS>
                  </Paper>
                </Modal>
                {(isSubmitting || (!queueFinished && firstLoading)) && (
                  <div className="CenteredLoadingImageContainer">
                    <Image
                      className="CenteredLoadingImage"
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

          {openProgressBar && (
            <MemoizedTutorialTableOfContent
              open={openProgressBar}
              reloadPermanentGraph={revertNodesOnGraph}
              handleCloseProgressBar={onCloseTableOfContent}
              groupTutorials={tutorialGroup}
              userTutorialState={userTutorial}
              onCancelTutorial={onCancelTutorial}
              onForceTutorial={tutorialKey => {
                setForcedTutorial(tutorialKey);
                tutorialStateWasSetUpRef.current = false;
              }}
              tutorialProgress={tutorialProgress}
            />
          )}
        </Box>

        {/*
        ------------------------------------->
        ABSOLUTE ELEMENTS
        <-------------------------------------
        */}

        {/* stop voice assistant button */}
        {voiceAssistant.questionNode && !startPractice && (
          <Tooltip title="Stop the voice interactions" placement="left">
            <IconButton
              onClick={() => setVoiceAssistant(prev => ({ ...prev, questionNode: null }))}
              sx={{
                position: "absolute",
                right: "8px",
                zIndex: 999,
                top: "76px",
                width: "60px",
                height: "60px",
                color: DESIGN_SYSTEM_COLORS.primary600,
                borderRadius: "8px",
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
                ":hover": {
                  backgroundColor: theme =>
                    theme.palette.mode === "dark"
                      ? DESIGN_SYSTEM_COLORS.notebookMainBlack
                      : DESIGN_SYSTEM_COLORS.gray50,
                },
              }}
            >
              <VolumeUpIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* instructor/student dashboard */}
        {user && displayDashboard && (
          <DashboardWrapper
            ref={assistantRef}
            voiceAssistant={voiceAssistant}
            setVoiceAssistant={setVoiceAssistant}
            // voiceAssistantRef={voiceAssistantRef.current}
            user={user}
            onClose={() => {
              setDisplayDashboard(false);
              setRootQuery(undefined);
              router.replace(router.pathname);
              setVoiceAssistant(prev => ({ ...prev, questionNode: null }));
            }}
            openNodeHandler={openLinkedNode}
            sx={{ position: "absolute", inset: "0px", zIndex: Z_INDEX["dashboard"] }}
            root={rootQuery}
            startPractice={startPractice}
            setStartPractice={setStartPractice}
            setDisplayRightSidebar={setDisplaySidebar}
            setUserIsAnsweringPractice={setUserIsAnsweringPractice}
            confirmIt={confirmIt}
          />
        )}

        {/* assistant */}
        {voiceAssistant.tagId && (
          <Box sx={{ position: "absolute", bottom: "10px", right: "50px", zIndex: Z_INDEX["dashboard"] }}>
            <Assistant
              voiceAssistant={voiceAssistant}
              assistantRef={assistantRef}
              openNodesOnNotebook={openNodesOnNotebook}
              scrollToNode={scrollToNode}
              selectedNotebookId={selectedNotebookId}
              setDisplayDashboard={setDisplayDashboard}
              setRootQuery={setRootQuery}
              setVoiceAssistant={setVoiceAssistant}
              startPractice={startPractice}
              uname={user?.uname ?? ""}
              userIsAnsweringPractice={userIsAnsweringPractice}
            />
          </Box>
        )}

        {user && voiceAssistant.tagId && (
          <>
            {/* leaderBoard */}
            <Box
              sx={{
                position: "absolute",
                width: "350px",
                top: "0px",
                bottom: "0px",
                right: displaySidebar === "LEADERBOARD" ? "0px" : "-350px",
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
                borderRadius: "16px 0px 0px 0px",
                transition: "right 0.4s",
                zIndex: Z_INDEX["dashboard"],
              }}
            >
              <IconButton
                sx={{
                  position: "absolute",
                  top: "17px",
                  right: "17px",
                  p: "4px",
                  color: theme => (theme.palette.mode === "dark" ? undefined : DESIGN_SYSTEM_COLORS.notebookG200),
                }}
                onClick={() => {
                  setDisplaySidebar(null);
                }}
              >
                <CloseIcon />
              </IconButton>
              <Leaderboard semesterId={voiceAssistant.tagId} />
            </Box>

            {/* userStatus */}
            <Box
              sx={{
                position: "absolute",
                width: "350px",
                top: "0px",
                bottom: "0px",
                right: displaySidebar === "USER_STATUS" ? "0px" : "-350px",
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
                borderRadius: "16px 0px 0px 0px",
                transition: "right 0.4s",
                zIndex: Z_INDEX["dashboard"],
              }}
            >
              <IconButton
                sx={{
                  position: "absolute",
                  top: "17px",
                  right: "17px",
                  p: "4px",
                  color: theme => (theme.palette.mode === "dark" ? undefined : DESIGN_SYSTEM_COLORS.notebookG200),
                }}
                onClick={() => {
                  setDisplaySidebar(null);
                }}
              >
                <CloseIcon />
              </IconButton>
              <UserStatus semesterId={voiceAssistant.tagId} user={user} />
            </Box>
          </>
        )}

        {process.env.NODE_ENV === "development" && (
          <Tooltip title={"Watch geek data"} placement="bottom">
            <IconButton
              onClick={() => setOpenDeveloperMenu(!openDeveloperMenu)}
              sx={{
                padding: { xs: "2px", sm: "8px" },
                position: "absolute",
                bottom: "12px",
                left: "70px",
                color: "white",
                background: "royalBlue",
                zIndex: Z_INDEX["devtools"],
                ":hover": {
                  background: "#3352af",
                  // borderRadius: "8px",
                },
              }}
            >
              <CodeIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Develop sidebar: don't REMOVE, add in required section a button if you need to print console */}
        {openDeveloperMenu && (
          <ClickAwayListener onClickAway={() => setOpenDeveloperMenu(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "0px",
                bottom: "0px",
                right: "0px",
                maxWidth: "300px",
                p: "10px",
                display: "grid",
                rowGap: "20px",
                overflowY: "auto",
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.baseBlack : DESIGN_SYSTEM_COLORS.baseWhite,
                zIndex: Z_INDEX["devtools"],
              }}
            >
              <Box>
                User: <b>{user?.uname}</b> with [{Object.entries(graph.nodes).length}] Nodes in Notebook:
                <b>{notebooks.find(c => c.id === selectedNotebookId)?.title ?? "--"}</b> with Id:{" "}
                <b>{selectedNotebookId}</b>
              </Box>

              <Paper>
                <Divider>Global states</Divider>
                <Button onClick={() => console.info(nodeBookState)}>nodeBookState</Button>
                <Button onClick={() => console.info(graph.nodes)}>nodes</Button>
                <Button onClick={() => console.info(graph.edges)}>edges</Button>
                <Button onClick={() => console.info("DAGGER", g)}>Dagre</Button>
                <Button onClick={() => console.info(allTags)}>allTags</Button>
                <Button onClick={() => console.info(notebookRef)}>notebookRef</Button>
                <Divider />
                <Button onClick={() => console.info(user)}>user</Button>
                <Button onClick={() => console.info(settings)}>setting</Button>
                <Button onClick={() => console.info(reputation)}>reputation</Button>
              </Paper>

              <Paper>
                <Divider>Local states</Divider>
                <Button onClick={() => console.info(selectedNotebookId)}>selectedNotebookId</Button>
                <Button onClick={() => console.info(selectedPreviousNotebookIdRef.current)}>
                  selectedPreviousNotebookIdRef
                </Button>
                <Button onClick={() => console.info(preLoadedNodesRef.current)}>Pre Loaded Nodes</Button>
                <Button onClick={() => console.info(citations)}>citations</Button>
                <Button onClick={() => console.info(clusterNodes)}>clusterNodes</Button>
                <Button onClick={() => console.info(graph.nodes[nodeBookState.selectedNode ?? ""])}>
                  SelectedNode
                </Button>
                <Button onClick={() => console.info({ lastOperation: lastNodeOperation.current })}>
                  lastNodeOperation
                </Button>
                <Button onClick={() => console.info(isWritingOnDBRef.current)}>isWritingOnDBRef</Button>
                <Button onClick={() => console.info(openSidebar)}>openSidebar</Button>
                <Button onClick={() => console.info(displaySidebar)}>displaySidebar</Button>
                <Button onClick={() => console.info(selectedProposalId)}>openProposal</Button>
              </Paper>

              <Paper>
                <Divider>Proposals</Divider>
                <Button onClick={() => console.info(tempNodes)}>tempNodes</Button>
                <Button onClick={() => console.info({ ...changedNodes })}>changedNodes</Button>
                <Button onClick={() => console.info({ updatedLinks: updatedLinksRef.current })}>updatedLinks</Button>
              </Paper>

              <Paper>
                <Divider>Render</Divider>
                <Button onClick={() => console.info(nodeChanges)}>node changes</Button>
                <Button onClick={() => console.info(mapRendered)}>map rendered</Button>
                <Button onClick={() => console.info(userNodeChanges)}>user node changes</Button>
              </Paper>

              <Paper>
                <Divider>Reputation</Divider>
                <Button
                  onClick={() => setReputationSignal([{ uname: "1man", reputation: 1, type: ["All Time", "Weekly"] }])}
                >
                  Test Increment Reputation
                </Button>
                <Button
                  onClick={() => setReputationSignal([{ uname: "1man", reputation: -1, type: ["All Time", "Weekly"] }])}
                >
                  Test Decrement Reputation
                </Button>
              </Paper>

              <Paper>
                <Divider>Assistant</Divider>
                <Button onClick={() => console.info({ voiceAssistant })}>voiceAssistant</Button>
                <Button onClick={() => console.info({ startPractice })}>startPractice</Button>
              </Paper>

              <Paper>
                <Divider>Tutorial</Divider>
                <Button onClick={() => console.info(tutorial)}>Tutorial</Button>
                <Button onClick={() => console.info(userTutorial)}>userTutorial</Button>
                <Button onClick={() => console.info({ currentStep })}>currentStep</Button>
                <Button onClick={() => console.info(dynamicTargetId)}>dynamicTargetId</Button>
                <Button onClick={() => console.info(tutorialTargetId)}>tutorialTargetId</Button>
                <Button onClick={() => console.info(forcedTutorial)}>forcedTutorial</Button>
                <Button onClick={() => console.info({ tutorialStateWasSetUpRef: tutorialStateWasSetUpRef.current })}>
                  tutorialStateWasSetUpRef
                </Button>
              </Paper>

              <Paper>
                <Divider>Functions</Divider>
                <Button onClick={() => console.info(parentWithMostChildren())}>Most Parent</Button>
                <Button onClick={() => console.info(parentWithChildren("r98BjyFDCe4YyLA3U8ZE"))}>hisParent</Button>
                <Button onClick={() => nodeBookDispatch({ type: "setSelectionType", payload: "Proposals" })}>
                  Toggle Open proposals
                </Button>
                <Button onClick={() => nodeBookDispatch({ type: "setSelectionType", payload: "Proposals" })}>
                  Open Proposal
                </Button>
                <OpenNode onOpenNode={openNodeHandler} />
                <Button onClick={() => setShowRegion(prev => !prev)}>Show Region</Button>
                <Button onClick={() => console.info({ openSidebar })}>Open Sidebar</Button>
              </Paper>
            </Box>
          </ClickAwayListener>
        )}
        {ConfirmDialog}
      </Box>
    </div>
  );
};

const NodeBook = () => (
  <NodeBookProvider>
    <Notebook />
  </NodeBookProvider>
);
export default withAuthUser({
  shouldRedirectToLogin: true,
  shouldRedirectToHomeIfAuthenticated: false,
})(NodeBook);

const OpenNode = ({ onOpenNode }: { onOpenNode: (nodeId: string) => void }) => {
  const [nodeId, setNodeId] = useState("");
  return (
    <Stack spacing={"12px"} direction={"row"}>
      <Input value={nodeId} onChange={e => setNodeId(e.target.value)} fullWidth />
      <Button onClick={() => onOpenNode(nodeId)} variant="contained">
        Open
      </Button>
    </Stack>
  );
};

type RevertNodeChangesInput = {
  g: dagre.graphlib.Graph<{}>;
  oldNodes: FullNodesData;
  oldEdges: EdgesData;
  tempNodeIds: string[];
  changedNodeIds: string[];
  tempNodes: Set<string>;
  changedNodes: any;
  showClusterOptions: boolean;
  allTags: any;
  resetUpdateLink: () => void;
};

type RevertNodeChangesOutput = {
  newNodes: FullNodesData;
  newEdges: EdgesData;
  newTempNodes: Set<string>;
  newChangedNodes: any;
  updatedNodeIds: string[];
};

const revertNodeChanges = ({
  g,
  oldNodes,
  oldEdges,
  changedNodes,
  changedNodeIds,
  tempNodeIds,
  tempNodes,
  showClusterOptions,
  allTags,
  resetUpdateLink,
}: RevertNodeChangesInput): RevertNodeChangesOutput => {
  const updatedNodeIds: string[] = [];
  if (!tempNodes.size && !Object.keys(changedNodes).length)
    return {
      newChangedNodes: changedNodes,
      newEdges: oldEdges,
      newNodes: oldNodes,
      newTempNodes: tempNodes,
      updatedNodeIds,
    };
  let newNodes = { ...oldNodes };
  let newEdges = { ...oldEdges };

  tempNodeIds.forEach(localTempNode => {
    newEdges = removeDagAllEdges(g, localTempNode, newEdges, updatedNodeIds);
    newNodes = removeDagNode(g, localTempNode, newNodes);
    updatedNodeIds.push(localTempNode);
    tempNodes.delete(localTempNode); // IMPROVE
  });

  changedNodeIds.forEach(cId => {
    const changedNode = changedNodes[cId];
    if (cId in newNodes) {
      newEdges = compareAndUpdateNodeLinks(g, newNodes[cId], cId, changedNode, newEdges);
    } else {
      newEdges = setNewParentChildrenEdges(g, cId, changedNode, newEdges);
    }
    newNodes = setDagNode(g, cId, copyNode(changedNode), newNodes, allTags, showClusterOptions, null);
    updatedNodeIds.push(cId);
    delete changedNodes[cId];
  });

  resetUpdateLink();

  return { newChangedNodes: changedNodes, newEdges, newNodes, newTempNodes: tempNodes, updatedNodeIds };
};

const synchronizeStuff = (prev: (any & { id: string })[], change: any) => {
  const docType = change.type;
  const curData = change.data as any & { id: string };

  const prevIdx = prev.findIndex((m: any & { id: string }) => m.id === curData.id);
  if (docType === "added" && prevIdx === -1) {
    prev.push(curData);
  }
  if (docType === "modified" && prevIdx !== -1) {
    prev[prevIdx] = curData;
  }

  if (docType === "removed" && prevIdx !== -1) {
    prev.splice(prevIdx, 1);
  }
  prev.sort((a, b) => b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime());
  return prev;
};
