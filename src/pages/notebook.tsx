import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CloseIcon from "@mui/icons-material/Close";
import CodeIcon from "@mui/icons-material/Code";
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
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
/* eslint-disable */ //This wrapper comments it to use react-map-interaction without types
// @ts-ignore
import { MapInteractionCSS } from "react-map-interaction";
/* eslint-enable */
import { INotificationNum } from "src/types/INotification";

import withAuthUser from "@/components/hoc/withAuthUser";
import { MemoizedCommunityLeaderboard } from "@/components/map/CommunityLeaderboard/CommunityLeaderboard";
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

import LoadingImg from "../../public/animated-icon-1cademy.gif";
import { MemoizedClustersList } from "../components/map/ClustersList";
import { MemoizedLinksList } from "../components/map/LinksList";
import { MemoizedNodeList } from "../components/map/NodesList";
import { MemoizedToolbarSidebar } from "../components/map/Sidebar/SidebarV2/ToolbarSidebar";
import { NodeItemDashboard } from "../components/NodeItemDashboard";
import { NodeBookProvider, useNodeBook } from "../context/NodeBookContext";
import { useMemoizedCallback } from "../hooks/useMemoizedCallback";
import { useWindowSize } from "../hooks/useWindowSize";
import { useWorkerQueue } from "../hooks/useWorkerQueue";
import { NodeChanges } from "../knowledgeTypes";
import { idToken, retrieveAuthenticatedUser } from "../lib/firestoreClient/auth";
import { Post, postWithToken } from "../lib/mapApi";
import { createGraph, dagreUtils } from "../lib/utils/dagre.util";
import { devLog } from "../lib/utils/develop.util";
import { getTypedCollections } from "../lib/utils/getTypedCollections";
import {
  changedNodes,
  citations,
  COLUMN_GAP,
  compare2Nodes,
  compareAndUpdateNodeLinks,
  compareChoices,
  compareFlatLinks,
  compareLinks,
  compareProperty,
  copyNode,
  createOrUpdateNode,
  getSelectionText,
  hideNodeAndItsLinks,
  makeNodeVisibleInItsLinks,
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
import { buildFullNodes, getNodes, getUserNodeChanges } from "../lib/utils/nodesSyncronization.utils";
import { imageLoaded, isValidHttpUrl } from "../lib/utils/utils";
import { ChoosingType, EdgesData, FullNodeData, FullNodesData, UserNodes, UserNodesData } from "../nodeBookTypes";
import { NodeType, SimpleNode2 } from "../types";
import { doNeedToDeleteNode, isVersionApproved } from "../utils/helpers";

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
  const [graph, setGraph] = useState<{ nodes: FullNodesData; edges: EdgesData }>({ nodes: {}, edges: {} });
  // this allNodes is DEPRECATED
  const [allNodes, setAllNodes] = useState<FullNodesData>({});
  // as map grows, width and height grows based on the nodes shown on the map
  const [mapWidth, setMapWidth] = useState(700);
  const [mapHeight, setMapHeight] = useState(400);

  // mapRendered: flag for first time map is rendered (set to true after first time)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mapRendered, setMapRendered] = useState(false);

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
  const [addedParents, setAddedParents] = useState<string[]>([]);
  const [addedChildren, setAddedChildren] = useState<string[]>([]);
  const [removedParents, setRemovedParents] = useState<string[]>([]);
  const [removedChildren, setRemovedChildren] = useState<string[]>([]);

  const [firstLoading, setFirstLoading] = useState(true);
  const [pendingProposalsLoaded /* , setPendingProposalsLoaded */] = useState(true);

  const previousLengthNodes = useRef(0);
  const previousLengthEdges = useRef(0);
  const g = useRef(dagreUtils.createGraph());

  //Notifications
  const [uncheckedNotificationsNum, setUncheckedNotificationsNum] = useState(0);
  const [bookmarkUpdatesNum, setBookmarkUpdatesNum] = useState(0);
  const [pendingProposalsNum, setPendingProposalsNum] = useState(0);

  const lastNodeOperation = useRef<string>("");
  const proposalTimer = useRef<any>(null);

  // Scroll to node configs

  const { width: windowWith, height: windowHeight } = useWindowSize();
  const windowInnerTop = windowWith < 899 ? 360 : 50;
  const windowInnerLeft = (windowWith * 10) / 100 + (windowWith > 899 ? (openSidebar ? 430 : 80) : 10);
  const windowInnerRight = (windowWith * 10) / 100;
  const windowInnerBottom = 50;
  const [showRegion, setShowRegion] = useState<boolean>(false);

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
          if (onNodeInViewport(nodeId) && !isSearcher) return;

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
    [onNodeInViewport]
  );

  const onCompleteWorker = useCallback(() => {
    if (!nodeBookState.selectedNode) return;

    scrollToNode(nodeBookState.selectedNode);
  }, [nodeBookState.selectedNode, scrollToNode]);

  const setOperation = useCallback((operation: string) => {
    lastNodeOperation.current = operation;
  }, []);

  const { addTask, queue, isQueueWorking, queueFinished } = useWorkerQueue({
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

  // flag for whether users' nodes data is downloaded from server
  const [userNodesLoaded, setUserNodesLoaded] = useState(false);

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
  const openNodeHandler = useMemoizedCallback(
    async (nodeId: string) => {
      devLog("open_Node_Handler", nodeId);
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
            userNodeData = userNodeDoc.docs[0].data() as UserNodesData;
            userNodeData.visible = true;
            userNodeData.updatedAt = Timestamp.fromDate(new Date());
            batch.update(userNodeRef, userNodeData);
          } else {
            // if NOT exist documents create a document
            userNodeRef = collection(db, "userNodes");

            userNodeData = {
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

          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        } catch (err) {
          console.error(err);
        }
      }
    },
    [user, allTags]
  );

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
      nodeBookDispatch({ type: "setSelectedNode", payload: noodeIdFromDashboard });
      scrollToNode(noodeIdFromDashboard);
    }, 1000);
  }, [firstScrollToNode, graph.nodes, nodeBookDispatch, openNodeHandler, scrollToNode]);

  //  bd => state (first render)
  useEffect(() => {
    setTimeout(() => {
      if (user?.sNode === nodeBookState.selectedNode) return;
      if (!firstScrollToNode && queueFinished && urlNodeProcess) {
        if (!user?.sNode) return;
        const selectedNode = graph.nodes[user?.sNode];
        if (!selectedNode) return;
        if (selectedNode.top === 0) return;
        nodeBookDispatch({ type: "setSelectedNode", payload: user.sNode });
        scrollToNode(user.sNode);
        setFirstScrollToNode(true);
        setIsSubmitting(false);
        if (queueFinished) {
          setFirstLoading(false);
        }
      }
    }, 1000);
  }, [
    firstScrollToNode,
    graph.nodes,
    isQueueWorking,
    nodeBookDispatch,
    nodeBookState.selectedNode,
    queue.length,
    queueFinished,
    scrollToNode,
    urlNodeProcess,
    user?.sNode,
    userNodesLoaded,
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

  const snapshot = useCallback(
    (q: Query<DocumentData>) => {
      const fillDagre = (fullNodes: FullNodeData[], currentNodes: any, currentEdges: any, withClusters: boolean) => {
        return fullNodes.reduce(
          (acu: { newNodes: { [key: string]: any }; newEdges: { [key: string]: any } }, cur) => {
            let tmpNodes = {};
            let tmpEdges = {};

            if (cur.nodeChangeType === "added") {
              const { uNodeData, oldNodes, oldEdges } = makeNodeVisibleInItsLinks(cur, acu.newNodes, acu.newEdges);
              const res = createOrUpdateNode(g.current, uNodeData, cur.node, oldNodes, oldEdges, allTags, withClusters);
              tmpNodes = res.oldNodes;
              tmpEdges = res.oldEdges;
            }
            if (cur.nodeChangeType === "modified" && cur.visible) {
              const node = acu.newNodes[cur.node];
              if (!node) {
                const res = createOrUpdateNode(
                  g.current,
                  cur,
                  cur.node,
                  acu.newNodes,
                  acu.newEdges,
                  allTags,
                  withClusters
                );
                tmpNodes = res.oldNodes;
                tmpEdges = res.oldEdges;
              } else {
                const currentNode: FullNodeData = {
                  ...cur,
                  left: node.left,
                  top: node.top,
                }; // <----- IMPORTANT: Add positions data from node into cur.node to not set default position into center of screen

                if (!compare2Nodes(cur, node)) {
                  const res = createOrUpdateNode(
                    g.current,
                    currentNode,
                    cur.node,
                    acu.newNodes,
                    acu.newEdges,
                    allTags,
                    withClusters
                  );
                  tmpNodes = res.oldNodes;
                  tmpEdges = res.oldEdges;
                }
              }
            }
            // so the NO visible nodes will come as modified and !visible
            if (cur.nodeChangeType === "removed" || (cur.nodeChangeType === "modified" && !cur.visible)) {
              if (g.current.hasNode(cur.node)) {
                g.current.nodes().forEach(function () {});
                g.current.edges().forEach(function () {});
                // PROBABLY you need to add hideNodeAndItsLinks, to update children and parents nodes

                // !IMPORTANT, Don't change the order, first remove edges then nodes
                tmpEdges = removeDagAllEdges(g.current, cur.node, acu.newEdges);
                tmpNodes = removeDagNode(g.current, cur.node, acu.newNodes);
              } else {
                // remove edges
                const oldEdges = { ...acu.newEdges };

                Object.keys(oldEdges).forEach(key => {
                  if (key.includes(cur.node)) {
                    delete oldEdges[key];
                  }
                });

                tmpEdges = oldEdges;
                // remove node
                const oldNodes = acu.newNodes;
                if (cur.node in oldNodes) {
                  delete oldNodes[cur.node];
                }
                // tmpEdges = {acu.newEdges,}
                tmpNodes = { ...oldNodes };
              }
            }

            return {
              newNodes: { ...tmpNodes },
              newEdges: { ...tmpEdges },
            };
          },
          { newNodes: { ...currentNodes }, newEdges: { ...currentEdges } }
        );
      };

      const mergeAllNodes = (newAllNodes: FullNodeData[], currentAllNodes: FullNodesData): FullNodesData => {
        return newAllNodes.reduce(
          (acu, cur) => {
            if (cur.nodeChangeType === "added" || cur.nodeChangeType === "modified") {
              return { ...acu, [cur.node]: cur };
            }
            if (cur.nodeChangeType === "removed") {
              const tmp = { ...acu };
              delete tmp[cur.node];
              return tmp;
            }
            return acu;
          },
          { ...currentAllNodes }
        );
      };

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
              if (tmpNode && tmpNode.hasOwnProperty("simulated")) {
                delete tmpNode["simulated"];
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
            const { newNodes, newEdges } = fillDagre(visibleFullNodesMerged, nodes, edges, settings.showClusterOptions);

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

  useEffect(() => {
    if (openSidebar !== "PROPOSALS") {
      setOpenProposal("");
    }
  }, [openSidebar]);

  useEffect(() => {
    if (!db) return;
    if (!user?.uname) return;
    if (!allTagsLoaded) return;

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
  }, [allTagsLoaded, db, snapshot, user?.uname, settings.showClusterOptions, notebookChanged]);
  useEffect(() => {
    if (!db) return;
    if (!user?.uname) return;
    if (!allTagsLoaded) return;

    const userNodesRef = collection(db, "userNodes");
    const q = query(
      userNodesRef,
      where("user", "==", user.uname),
      where("bookmarked", "==", true),
      where("isStudied", "==", false),
      where("deleted", "==", false)
    );
    const bookmarkSnapshot = onSnapshot(q, async snapshot => {
      // console.log("on snapshot");
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
  }, [allTagsLoaded, db, user?.uname]);
  useEffect(() => {
    if (!db) return;
    if (!user?.uname) return;
    if (!user?.tagId) return;
    if (!allTagsLoaded) return;

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
  }, [allTagsLoaded, db, user?.tagId, user?.uname]);
  useEffect(() => {
    if (!db) return;
    if (!user?.uname) return;
    if (!allTagsLoaded) return;
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
  }, [db, user?.uname, allTagsLoaded]);

  useEffect(() => {
    const currentLengthNodes = Object.keys(graph.nodes).length;
    if (currentLengthNodes < previousLengthNodes.current) {
      devLog("CHANGE NH 🚀", "recalculate");
      addTask(null);
    }
    previousLengthNodes.current = currentLengthNodes;
  }, [addTask, graph.nodes]);

  useEffect(() => {
    g.current = createGraph();
    setGraph({ nodes: {}, edges: {} });
    devLog("CHANGE NH 🚀", { showClusterOptions: settings.showClusterOptions });
  }, [settings.showClusterOptions]);

  useEffect(() => {
    const currentLengthEdges = Object.keys(graph.edges).length;
    if (currentLengthEdges !== previousLengthEdges.current) {
      devLog("CHANGE NH 🚀", "recalculate");
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
  const reloadPermanentGraph = useMemoizedCallback(() => {
    devLog("RELOAD PERMANENT GRAPH");

    let oldNodes = graph.nodes;
    let oldEdges = graph.edges;
    if (tempNodes.size > 0 || Object.keys(changedNodes).length > 0) {
      oldNodes = { ...oldNodes };
      oldEdges = { ...oldEdges };
    }

    tempNodes.forEach(tempNode => {
      oldEdges = removeDagAllEdges(g.current, tempNode, oldEdges);
      oldNodes = removeDagNode(g.current, tempNode, oldNodes);
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
      delete changedNodes[cId];
    }
    setGraph({ nodes: oldNodes, edges: oldEdges });
  }, [graph, allTags, settings.showClusterOptions]);

  const resetAddedRemovedParentsChildren = useCallback(() => {
    // CHECK: this could be improve merging this 4 states in 1 state object
    // so we reduce the rerenders, also we can set only the empty array here
    setAddedParents(oldAddedParents => (oldAddedParents.length > 0 ? oldAddedParents : []));
    setAddedChildren(oldAddedChildren => (oldAddedChildren.length > 0 ? oldAddedChildren : []));
    setRemovedParents(oldRemovedParents => (oldRemovedParents.length > 0 ? oldRemovedParents : []));
    setRemovedChildren(oldRemovedChildren => (oldRemovedChildren.length > 0 ? oldRemovedChildren : []));
  }, []);

  const getMapGraph = useCallback(
    async (mapURL: string, postData: any = false, resetGraph: boolean = true) => {
      if (resetGraph) {
        reloadPermanentGraph();
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

  const chosenNodeChanged = useCallback(
    (nodeId: string) => {
      setGraph(({ nodes: oldNodes, edges: oldEdges }) => {
        if (!nodeBookState.choosingNode || !nodeBookState.chosenNode) return { nodes: oldNodes, edges: oldEdges };
        if (nodeId !== nodeBookState.choosingNode.id) return { nodes: oldNodes, edges: oldEdges };

        const thisNode = copyNode(oldNodes[nodeId]);
        const chosenNodeObj = copyNode(oldNodes[nodeBookState.chosenNode.id]);

        let newEdges = oldEdges;

        const validLink =
          (nodeBookState.choosingNode.type === "Reference" &&
            thisNode.referenceIds.filter(l => l === nodeBookState.chosenNode?.id).length === 0 &&
            nodeBookState.chosenNode.id !== nodeId &&
            chosenNodeObj.nodeType === nodeBookState.choosingNode.type) ||
          (nodeBookState.choosingNode.type === "Tag" &&
            thisNode.tagIds.filter(l => l === nodeBookState.chosenNode?.id).length === 0) ||
          (nodeBookState.choosingNode.type === "Parent" &&
            nodeBookState.choosingNode.id !== nodeBookState.chosenNode.id &&
            thisNode.parents.filter((l: any) => l.node === nodeBookState.chosenNode?.id).length === 0) ||
          (nodeBookState.choosingNode.type === "Child" &&
            nodeBookState.choosingNode.id !== nodeBookState.chosenNode.id &&
            thisNode.children.filter((l: any) => l.node === nodeBookState.chosenNode?.id).length === 0);

        if (validLink) {
          if (nodeBookState.choosingNode.type === "Reference") {
            thisNode.references = [...thisNode.references, chosenNodeObj.title];
            thisNode.referenceIds = [...thisNode.referenceIds, nodeBookState.chosenNode.id];
            thisNode.referenceLabels = [...thisNode.referenceLabels, ""];
          } else if (nodeBookState.choosingNode.type === "Tag") {
            thisNode.tags = [...thisNode.tags, chosenNodeObj.title];
            thisNode.tagIds = [...thisNode.tagIds, nodeBookState.chosenNode.id];
          } else if (nodeBookState.choosingNode.type === "Parent") {
            thisNode.parents = [
              ...thisNode.parents,
              {
                node: nodeBookState.chosenNode.id,
                title: chosenNodeObj.title,
                label: "",
                type: chosenNodeObj.nodeType,
              },
            ];
            if (!(nodeBookState.chosenNode.id in changedNodes)) {
              changedNodes[nodeBookState.chosenNode.id] = copyNode(oldNodes[nodeBookState.chosenNode.id]);
            }
            chosenNodeObj.children = [
              ...chosenNodeObj.children,
              {
                node: nodeBookState.choosingNode.id,
                title: thisNode.title,
                label: "",
                type: chosenNodeObj.nodeType,
              },
            ];
            const chosenNodeId = nodeBookState.chosenNode.id;
            if (removedParents.includes(nodeBookState.chosenNode.id)) {
              setRemovedParents(removedParents.filter((nId: string) => nId !== chosenNodeId));
            } else {
              setAddedParents(oldAddedParents => [...oldAddedParents, chosenNodeId]);
            }

            if (nodeBookState.chosenNode && nodeBookState.choosingNode) {
              newEdges = setDagEdge(
                g.current,
                nodeBookState.chosenNode.id,
                nodeBookState.choosingNode.id,
                { label: "" },
                { ...oldEdges }
              );
            }
          } else if (nodeBookState.choosingNode.type === "Child") {
            thisNode.children = [
              ...thisNode.children,
              {
                node: nodeBookState.chosenNode.id,
                title: chosenNodeObj.title,
                label: "",
                type: chosenNodeObj.nodeType,
              },
            ];
            if (!(nodeBookState.chosenNode.id in changedNodes)) {
              changedNodes[nodeBookState.chosenNode.id] = copyNode(oldNodes[nodeBookState.chosenNode.id]);
            }
            chosenNodeObj.parents = [
              ...chosenNodeObj.parents,
              {
                node: nodeBookState.choosingNode.id,
                title: thisNode.title,
                label: "",
                type: chosenNodeObj.nodeType,
              },
            ];
            if (nodeBookState.chosenNode && nodeBookState.choosingNode) {
              newEdges = setDagEdge(
                g.current,
                nodeBookState.choosingNode.id,
                nodeBookState.chosenNode.id,
                { label: "" },
                { ...oldEdges }
              );
            }
            if (removedChildren.includes(nodeBookState.chosenNode.id)) {
              const chosenNodeId = nodeBookState.choosingNode.id;
              setRemovedChildren(removedChildren.filter(nId => nId !== chosenNodeId));
            } else {
              setAddedChildren([...addedChildren, nodeBookState.chosenNode.id]);
            }
          }

          const chosenNode = nodeBookState.chosenNode.id;
          nodeBookDispatch({ type: "setChoosingNode", payload: null });
          nodeBookDispatch({ type: "setChosenNode", payload: null });

          const newNodes = {
            ...oldNodes,
            [nodeId]: thisNode,
            [chosenNode]: chosenNodeObj,
          };
          return { nodes: newNodes, edges: newEdges };
        }
        return { nodes: oldNodes, edges: oldEdges };
      });
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodeBookState.choosingNode, nodeBookState.chosenNode, removedParents, addedParents, removedChildren, addedChildren]
  );

  const deleteLink = useCallback(
    (nodeId: string, linkIdx: number, linkType: ChoosingType) => {
      setGraph(({ nodes, edges }) => {
        let oldNodes = { ...nodes };
        let newEdges = { ...edges };
        const thisNode = copyNode(oldNodes[nodeId]);

        if (linkType === "Parent") {
          let parentNode = null;
          const parentId = thisNode.parents[linkIdx].node;
          thisNode.parents = [...thisNode.parents];
          thisNode.parents.splice(linkIdx, 1);
          if (addedParents.includes(parentId)) {
            setAddedParents(addedParents.filter(nId => nId !== parentId));
          } else {
            setRemovedParents(oldRemovedParents => [...oldRemovedParents, parentId]);
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
          if (addedChildren.includes(childId)) {
            setAddedChildren(addedChildren.filter(nId => nId !== childId));
          } else {
            setRemovedChildren([...removedChildren, childId]);
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
        return { nodes: oldNodes, edges: newEdges };
      });
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addedParents, removedParents, addedChildren, removedChildren]
  );

  const nodeClicked = useCallback(
    (event: any, nodeId: string, nodeType: any, setOpenPart: any) => {
      devLog("node Clicked");
      if (nodeBookState.selectionType !== "AcceptedProposals" && nodeBookState.selectionType !== "Proposals") {
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        setSelectedNodeType(nodeType);
        setOpenPart("LinkingWords");
      }
    },
    [nodeBookDispatch, nodeBookState.selectionType]
  );

  const setNodeParts = useCallback((nodeId: string, innerFunc: (thisNode: FullNodeData) => FullNodeData) => {
    setGraph(({ nodes: oldNodes, edges }) => {
      setSelectedNodeType(oldNodes[nodeId].nodeType);
      const thisNode = { ...oldNodes[nodeId] };
      const newNode = { ...oldNodes, [nodeId]: innerFunc(thisNode) };
      return { nodes: newNode, edges };
    });
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
    async nodeId => {
      if (!nodeBookState.choosingNode && user) {
        const offsprings = recursiveOffsprings(nodeId);
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
          let oldNodes = { ...graph.nodes };
          let oldEdges = { ...graph.edges };
          for (let offspring of offsprings) {
            ({ oldNodes, oldEdges } = hideNodeAndItsLinks(g.current, offspring, oldNodes, oldEdges));
          }
        } catch (err) {
          console.error(err);
        }
      }
    },
    [nodeBookState.choosingNode, graph, recursiveOffsprings]
  );

  const openLinkedNode = useCallback(
    (linkedNodeID: string, typeOperation?: string) => {
      devLog("open Linked Node", { linkedNodeID });
      if (!nodeBookState.choosingNode) {
        let linkedNode = document.getElementById(linkedNodeID);
        if (typeOperation) {
          lastNodeOperation.current = "Searcher";
        }
        if (linkedNode) {
          nodeBookDispatch({ type: "setSelectedNode", payload: linkedNodeID });
          setTimeout(() => {
            scrollToNode(linkedNodeID);
          }, 1500);
        } else {
          openNodeHandler(linkedNodeID, "Searcher");
        }
      }
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodeBookState.choosingNode, openNodeHandler]
  );

  const getNodeUserNode = useCallback(
    (nodeId: string, userNodeId: string) => {
      const nodeRef = doc(db, "nodes", nodeId);
      const userNodeRef = doc(db, "userNodes", userNodeId);
      return { nodeRef, userNodeRef };
    },
    [db]
  );

  const initNodeStatusChange = useCallback(
    (nodeId: string, userNodeId: string) => {
      return getNodeUserNode(nodeId, userNodeId);
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [/*resetAddedRemovedParentsChildren, reloadPermanentGraph,*/ getNodeUserNode]
  );

  const hideNodeHandler = useCallback(
    async (nodeId: string) => {
      /**
       * changes in DB
       * change userNode
       * change node
       * create userNodeLog
       */

      const batch = writeBatch(db);
      const username = user?.uname;
      if (!nodeBookState.choosingNode) {
        const parentNode = getFirstParent(nodeId);

        if (username) {
          const thisNode = graph.nodes[nodeId];
          const { nodeRef, userNodeRef } = initNodeStatusChange(nodeId, thisNode.userNodeId);

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
        }

        nodeBookDispatch({ type: "setSelectedNode", payload: parentNode });
      }
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodeBookState.choosingNode, user, graph, initNodeStatusChange /*navigateToFirstParent*/]
  );
  const openAllChildren = useMemoizedCallback(
    async (nodeId: string) => {
      if (!nodeBookState.choosingNode && user) {
        let linkedNode = null;
        let linkedNodeId = null;
        let linkedNodeRef = null;
        let userNodeRef = null;
        let userNodeData = null;
        const batch = writeBatch(db);
        const thisNode = graph.nodes[nodeId];
        try {
          for (let child of thisNode.children) {
            linkedNodeId = child.node as string;
            linkedNode = document.getElementById(linkedNodeId);
            if (!linkedNode) {
              const nodeRef = doc(db, "nodes", linkedNodeId);
              const nodeDoc = await getDoc(nodeRef);
              if (nodeDoc.exists()) {
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
            }
          }
          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
          await batch.commit();
        } catch (err) {
          console.error(err);
        }
      }
      lastNodeOperation.current = "OpenAllChildren";
    },
    [nodeBookState.choosingNode, graph]
  );
  const toggleNode = useCallback(
    (event: any, nodeId: string) => {
      if (!nodeBookState.choosingNode) {
        lastNodeOperation.current = "ToggleNode";
        setGraph(({ nodes: oldNodes, edges }) => {
          const thisNode = oldNodes[nodeId];

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
          return { nodes: oldNodes, edges };
        });
      }
      if (event) {
        event.currentTarget.blur();
      }
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodeBookState.choosingNode, user, initNodeStatusChange]
  );

  const openNodePart = useCallback(
    (event: any, nodeId: string, partType: any, openPart: any, setOpenPart: any) => {
      lastNodeOperation.current = partType;
      if (!nodeBookState.choosingNode) {
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
            nodeBookState.selectionType !== "AcceptedProposals" &&
            nodeBookState.selectionType !== "Proposals"
          ) {
            // tags;
            setOpenRecentNodes(true);
          }
        }
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
      }
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, nodeBookState.choosingNode /*selectionType*/]
  );

  const referenceLabelChange = useCallback(
    (newLabel: string, nodeId: string, referenceIdx: number) => {
      devLog("REFERENCE_LABEL_CHANGE", { newLabel, nodeId, referenceIdx });

      const thisNode = { ...graph.nodes[nodeId] };
      let referenceLabelsCopy = [...thisNode.referenceLabels];
      referenceLabelsCopy[referenceIdx] = newLabel;
      thisNode.referenceLabels = referenceLabelsCopy;
      setGraph({
        nodes: { ...graph.nodes, [nodeId]: thisNode },
        edges: graph.edges,
      });
    },
    [graph]
  );

  const markStudied = useCallback(
    (event: any, nodeId: string) => {
      if (!nodeBookState.choosingNode) {
        setGraph(({ nodes: oldNodes, edges }) => {
          const thisNode = oldNodes[nodeId];
          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
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
          setDoc(doc(userNodeLogRef), userNodeLogData);
          return { nodes: oldNodes, edges };
        });
      }
      event.currentTarget.blur();
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodeBookState.choosingNode, user, initNodeStatusChange]
  );

  const bookmark = useCallback(
    (event: any, nodeId: string) => {
      if (!nodeBookState.choosingNode) {
        setGraph(({ nodes: oldNodes, edges }) => {
          const thisNode = oldNodes[nodeId];
          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
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
          return { nodes: oldNodes, edges };
        });
      }
      event.currentTarget.blur();
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodeBookState.choosingNode, user, initNodeStatusChange]
  );

  const correctNode = useCallback(
    (event: any, nodeId: string) => {
      devLog("CORRECT NODE", { nodeId });
      if (!nodeBookState.choosingNode) {
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        getMapGraph(`/correctNode/${nodeId}`);
        setNodeParts(nodeId, node => {
          const correct = node.correct;
          const wrong = node.wrong;

          const correctChange = correct ? -1 : 1;
          const wrongChange = !correct && wrong ? -1 : 0;
          const corrects = node.corrects + correctChange;
          const wrongs = node.wrongs + wrongChange;

          return { ...node, correct: !correct, wrong: false, corrects, wrongs };
        });
      }
      event.currentTarget.blur();
    },
    [nodeBookState.choosingNode, nodeBookDispatch, getMapGraph, setNodeParts]
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
      if (!nodeBookState.choosingNode) {
        let deleteOK = true;
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });

        const correctChange = !wrong && correct ? -1 : 0;
        const wrongChange = wrong ? -1 : 1;
        const _corrects = corrects + correctChange;
        const _wrongs = wrongs + wrongChange;

        const willRemoveNode = doNeedToDeleteNode(_corrects, _wrongs, locked);
        if (willRemoveNode) {
          deleteOK = window.confirm("You are going to permanently delete this node by downvoting it. Are you sure?");
        }
        if (deleteOK) {
          await idToken();
          getMapGraph(`/wrongNode/${nodeId}`);

          setNodeParts(nodeId, node => {
            return { ...node, wrong: !wrong, correct: false, wrongs: _wrongs, corrects: _corrects };
          });
          const nNode = graph.nodes[nodeId];
          if (nNode?.locked) return;

          if (willRemoveNode) {
            setGraph(({ nodes, edges }) => {
              const tmpEdges = removeDagAllEdges(g.current, nodeId, edges);
              const tmpNodes = removeDagNode(g.current, nodeId, nodes);
              return { nodes: tmpNodes, edges: tmpEdges };
            });
          }
        }
      }
    },
    [nodeBookState.choosingNode, nodeBookDispatch, getMapGraph, setNodeParts, graph.nodes]
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
    (event: any) => {
      devLog("PROPOSE_NODE_IMPROVEMENT");
      event.preventDefault();
      if (!nodeBookState.selectedNode) return;

      setOpenProposal("ProposeEditTo" + nodeBookState.selectedNode);
      reloadPermanentGraph();

      setGraph(({ nodes: oldNodes, edges }) => {
        if (!nodeBookState.selectedNode) return { nodes: oldNodes, edges };

        if (!(nodeBookState.selectedNode in changedNodes)) {
          changedNodes[nodeBookState.selectedNode] = copyNode(oldNodes[nodeBookState.selectedNode]);
        }
        const thisNode = { ...oldNodes[nodeBookState.selectedNode] };
        thisNode.editable = true;
        const newNodes = {
          ...oldNodes,
          [nodeBookState.selectedNode]: thisNode,
        };

        return { nodes: newNodes, edges };
      });
      setOpenSidebar(null);
      scrollToNode(nodeBookState.selectedNode);
    },
    [nodeBookState.selectedNode, reloadPermanentGraph, scrollToNode]
  );

  const selectNode = useCallback(
    (event: any, nodeId: string, chosenType: any, nodeType: any) => {
      devLog("SELECT_NODE", { choosingNode: nodeBookState.choosingNode, nodeId, chosenType, nodeType, openSidebar });
      if (!nodeBookState.choosingNode) {
        if (nodeBookState.selectionType === "AcceptedProposals" || nodeBookState.selectionType === "Proposals") {
          reloadPermanentGraph();
        }

        if (chosenType === "Proposals") {
          if (openSidebar === "PROPOSALS" && nodeId === nodeBookState.selectedNode) {
            setOpenSidebar(null);
          } else {
            setOpenSidebar("PROPOSALS");
            setSelectedNodeType(nodeType);
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
          nodeBookDispatch({ type: "setSelectionType", payload: chosenType });
          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });

          return;
        }
        if (nodeBookState.selectedNode === nodeId && nodeBookState.selectionType === chosenType) {
          nodeBookDispatch({ type: "setSelectionType", payload: null });
          setSelectedNodeType(null);
          setOpenPendingProposals(false);
          setOpenChat(false);
          setOpenNotifications(false);
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
          nodeBookDispatch({ type: "setSelectionType", payload: chosenType });
          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        }
      }
    },
    [
      nodeBookState.choosingNode,
      nodeBookState.selectionType,
      nodeBookState.selectedNode,
      reloadPermanentGraph,
      openSidebar,
      nodeBookDispatch,
      resetAddedRemovedParentsChildren,
    ]
  );

  const saveProposedImprovement = useMemoizedCallback(
    (summary: any, reason: any, onFail: any) => {
      if (!nodeBookState.selectedNode) return;

      nodeBookDispatch({ type: "setChosenNode", payload: null });
      nodeBookDispatch({ type: "setChoosingNode", payload: null });
      let referencesOK = true;

      if (
        (graph.nodes[nodeBookState.selectedNode].nodeType === "Concept" ||
          graph.nodes[nodeBookState.selectedNode].nodeType === "Relation" ||
          graph.nodes[nodeBookState.selectedNode].nodeType === "Question" ||
          graph.nodes[nodeBookState.selectedNode].nodeType === "News") &&
        graph.nodes[nodeBookState.selectedNode].references.length === 0
      ) {
        referencesOK = window.confirm("You are proposing a node without any reference. Are you sure?");
      }
      if (referencesOK) {
        const newNode = { ...graph.nodes[nodeBookState.selectedNode] };
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
        const keyFound = Object.keys(allNodes).find(key => allNodes[key].node === nodeBookState.selectedNode);
        if (!keyFound) return;
        const oldNode = allNodes[keyFound];
        let isTheSame =
          newNode.title === oldNode.title &&
          newNode.content === oldNode.content &&
          newNode.nodeType === oldNode.nodeType;
        isTheSame = isTheSame && compareProperty(oldNode, newNode, "nodeImage");
        isTheSame = compareFlatLinks(oldNode.tagIds, newNode.tagIds, isTheSame); // CHECK: O checked only ID changes
        isTheSame = compareFlatLinks(oldNode.referenceIds, newNode.referenceIds, isTheSame); // CHECK: O checked only ID changes
        isTheSame = compareLinks(oldNode.parents, newNode.parents, isTheSame, false);
        isTheSame = compareLinks(oldNode.children, newNode.children, isTheSame, false);

        isTheSame = compareChoices(oldNode, newNode, isTheSame);
        if (isTheSame) {
          onFail();
          window.alert("You've not changed anything yet!");
        } else {
          const postData: any = {
            ...newNode,
            id: nodeBookState.selectedNode,
            summary: summary,
            proposal: reason,
            addedParents,
            addedChildren,
            removedParents,
            removedChildren,
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
          if (changedNodes.hasOwnProperty(nodeBookState.selectedNode)) {
            delete changedNodes[nodeBookState.selectedNode];
          }
          setNodeParts(nodeBookState.selectedNode, node => ({ ...node, editable: false }));
          getMapGraph("/proposeNodeImprovement", postData, !willBeApproved);
          scrollToNode(nodeBookState.selectedNode);
        }
      }
    },
    [graph.nodes, nodeBookState.selectedNode, addedParents, addedChildren, removedParents, removedChildren, getMapGraph]
  );

  const proposeNewChild = useMemoizedCallback(
    (event, childNodeType: string) => {
      if (!user) return;

      devLog("PROPOSE_NEW_CHILD", { childNodeType });
      event.preventDefault();
      setOpenProposal("ProposeNew" + childNodeType + "ChildNode");
      reloadPermanentGraph();
      const newNodeId = newId(db);
      setGraph(graph => {
        const { nodes: oldNodes, edges } = graph;
        if (!nodeBookState.selectedNode) return { nodes: oldNodes, edges }; // CHECK: I added this to validate

        if (!(nodeBookState.selectedNode in changedNodes)) {
          changedNodes[nodeBookState.selectedNode] = copyNode(oldNodes[nodeBookState.selectedNode]);
        }
        if (!tempNodes.has(newNodeId)) {
          tempNodes.add(newNodeId);
        }
        const thisNode = copyNode(oldNodes[nodeBookState.selectedNode]);

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
          parents: [{ node: nodeBookState.selectedNode, label: "", title: thisNode.title, type: thisNode.nodeType }],
          comments: 0,
          tags: [user.tag],
          tagIds: [user.tagId],
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
        if (!nodeBookState.selectedNode) return { nodes: newNodes, edges };
        const newEdges = setDagEdge(g.current, nodeBookState.selectedNode, newNodeId, { label: "" }, { ...edges });

        nodeBookDispatch({ type: "setSelectedNode", payload: newNodeId });
        setTimeout(() => {
          scrollToNode(newNodeId);
        }, 3500);
        return { nodes: newNodes, edges: newEdges };
      });
    },
    [user, nodeBookState.selectedNode, allTags, reloadPermanentGraph, graph, settings.showClusterOptions]
  );

  const onNodeTitleBlur = useCallback(
    async (newTitle: string) => {
      setOpenSidebar("SEARCHER_SIDEBAR");

      nodeBookDispatch({ type: "setNodeTitleBlured", payload: true });
      nodeBookDispatch({ type: "setSearchQuery", payload: newTitle });
    },
    [nodeBookDispatch]
  );

  const saveProposedChildNode = useMemoizedCallback(
    (newNodeId, summary, reason, onComplete) => {
      devLog("save Proposed Child Node", { newNodeId, summary, reason });
      nodeBookDispatch({ type: "setChoosingNode", payload: null });
      nodeBookDispatch({ type: "setChosenNode", payload: null });

      const newNode = graph.nodes[newNodeId];

      if (!newNode.title) return console.error("title required");
      if (newNode.nodeType === "Question" && !Boolean(newNode.choices.length)) return console.error("choices required");

      if (newNodeId) {
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
        if (referencesOK) {
          if (newNode.title !== "" && newNode.title !== "Replace this new node title!" && newNode.tags.length !== 0) {
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
            console.log("willBeApproved", graph.nodes[newNodeId]);
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
            console.log(nodePartChanges, "nodePartChanges");
            setNodeParts(newNodeId, node => ({ ...node, changedAt: new Date(), ...nodePartChanges }));

            getMapGraph("/proposeChildNode", postData, !willBeApproved);
            scrollToNode(newNodeId);
          }
        }

        onComplete();
      }
    },
    [graph.nodes, getMapGraph]
  );

  const fetchProposals = useCallback(
    async (
      setIsAdmin: (value: boolean) => void,
      setIsRetrieving: (value: boolean) => void,
      setProposals: (value: any) => void
    ) => {
      if (!user) return;
      if (!selectedNodeType) return;
      setIsRetrieving(true);
      setGraph(({ nodes: oldNodes, edges }) => {
        if (nodeBookState.selectedNode && nodeBookState.selectedNode in oldNodes) {
          setIsAdmin(oldNodes[nodeBookState.selectedNode].admin === user.uname);
        }
        return { nodes: oldNodes, edges };
      });
      const { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl } = getTypedCollections(
        db,
        selectedNodeType
      );

      if (!versionsColl || !userVersionsColl || !versionsCommentsColl || !userVersionsCommentsColl) return;

      const versionsQuery = query(
        versionsColl,
        where("node", "==", nodeBookState.selectedNode),
        where("deleted", "==", false)
      );

      const versionsData = await getDocs(versionsQuery);
      const versions: any = {};
      let versionId;
      const versionIds: string[] = [];
      const comments: any = {};
      const userVersionsRefs: Query<DocumentData>[] = [];
      const versionsCommentsRefs: Query<DocumentData>[] = [];
      const userVersionsCommentsRefs: Query<DocumentData>[] = [];

      versionsData.forEach(versionDoc => {
        versionIds.push(versionDoc.id);
        const versionData = versionDoc.data();

        versions[versionDoc.id] = {
          ...versionData,
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
      Object.values(comments).forEach((comment: any) => {
        versionId = comment.version;
        delete comment.version;
        versions[versionId].comments.push(comment);
      });
      const proposalsTemp = Object.values(versions);
      const orderedProposals = proposalsTemp.sort(
        (a: any, b: any) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
      );
      setProposals(orderedProposals);
      setIsRetrieving(false);
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
        devLog("SELECT PROPOSAL", { proposal });
        if (!user?.uname) return;
        event.preventDefault();
        setOpenProposal(proposal.id);
        reloadPermanentGraph();
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
              studied: 1,
              choices: [],
              // If we define it as false, then the users will be able to up/down vote on unaccepted proposed nodes!
              editable: false,
              width: NODE_WIDTH,
              node: newNodeId,
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
            thisNode.title = proposal.title;
            thisNode.content = proposal.content;
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
        setIsSubmitting(true);
        await postWithToken("/deleteVersion", postData);

        let proposalsTemp = [...proposals];
        proposalsTemp.splice(proposalIdx, 1);
        setProposals(proposalsTemp);
        setIsSubmitting(false);
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
      if (!isUploading && !nodeBookState.choosingNode) {
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
      }
    },
    [user, nodeBookState.choosingNode, setNodeParts]
  );

  const rateProposal = useCallback(
    async (
      event: any,
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
        if (correct) {
          proposalsTemp[proposalIdx].wrongs += proposalsTemp[proposalIdx].wrong ? -1 : 0;
          proposalsTemp[proposalIdx].wrong = false;
          proposalsTemp[proposalIdx].corrects += proposalsTemp[proposalIdx].correct ? -1 : 1;
          proposalsTemp[proposalIdx].correct = !proposalsTemp[proposalIdx].correct;
        } else if (wrong) {
          proposalsTemp[proposalIdx].corrects += proposalsTemp[proposalIdx].correct ? -1 : 0;
          proposalsTemp[proposalIdx].correct = false;
          proposalsTemp[proposalIdx].wrongs += proposalsTemp[proposalIdx].wrong ? -1 : 1;
          proposalsTemp[proposalIdx].wrong = !proposalsTemp[proposalIdx].wrong;
        } else if (award) {
          proposalsTemp[proposalIdx].awards += proposalsTemp[proposalIdx].award ? -1 : 1;
          proposalsTemp[proposalIdx].award = !proposalsTemp[proposalIdx].award;
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
      }
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, nodeBookState.choosingNode, selectedNodeType, reloadPermanentGraph]
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
    setAddedParents([]);
    setAddedChildren([]);
    setRemovedParents([]);
    setRemovedChildren([]);
  }, [setAddedParents, setAddedChildren, setRemovedParents, setRemovedChildren]);

  const onScrollToLastNode = () => {
    if (!nodeBookState.selectedNode) return;
    scrollToNode(nodeBookState.selectedNode);
  };

  const onCloseSidebar = () => {
    reloadPermanentGraph();
    if (nodeBookState.selectedNode) scrollToNode(nodeBookState.selectedNode);
    setOpenSidebar(null);
  };

  const onRedrawGraph = () => {
    setGraph(() => {
      return { nodes: {}, edges: {} };
    });
    g.current = createGraph();
    setTimeout(() => {
      setNotebookChanges({ updated: true });
    }, 200);
  };

  return (
    <div className="MapContainer" style={{ overflow: "hidden" }}>
      <Box
        id="Map"
        sx={{
          overflow: "hidden",
          background:
            settings.background === "Color"
              ? theme =>
                  settings.theme === "Dark" ? theme.palette.common.darkGrayBackground : theme.palette.common.white
              : undefined,
        }}
      >
        {nodeBookState.choosingNode && <div id="ChoosingNodeMessage">Click the node you'd like to link to...</div>}
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
                <Button onClick={() => console.log(user)}>user</Button>
                <Button onClick={() => console.log(settings)}>setting</Button>
                <Button onClick={() => console.log(reputation)}>reputation</Button>
              </Box>
              <Box>
                <Button onClick={() => console.log(nodeChanges)}>node changes</Button>
                <Button onClick={() => console.log(mapRendered)}>map rendered</Button>
                {/* <Button onClick={() => console.log(mapChanged)}>map changed</Button> */}
                <Button onClick={() => console.log(userNodeChanges)}>user node changes</Button>
                <Button onClick={() => console.log(nodeBookState)}>show global state</Button>
              </Box>
              <Box>
                <Button onClick={() => console.log(tempNodes)}>tempNodes</Button>
                <Button onClick={() => console.log(changedNodes)}>changedNodes</Button>
              </Box>

              <Divider />

              <Box>
                <Button onClick={() => console.log(allNodes)}>All Nodes</Button>
                <Button onClick={() => console.log(citations)}>citations</Button>
                <Button onClick={() => console.log(clusterNodes)}>clusterNodes</Button>
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
                <Button onClick={() => openNodeHandler("PvKh56yLmodMnUqHar2d")}>Open Node Handler</Button>
                <Button onClick={() => setShowRegion(prev => !prev)}>Show Region</Button>
              </Box>
            </Drawer>
          }
          {user && reputation && (
            <Box>
              <MemoizedToolbarSidebar
                open={!openSidebar}
                onClose={() => setOpenSidebar(null)}
                reloadPermanentGrpah={reloadPermanentGraph}
                user={user}
                reputation={reputation}
                theme={settings.theme}
                setOpenSideBar={onOpenSideBar}
                mapRendered={true}
                selectedUser={selectedUser}
                uncheckedNotificationsNum={uncheckedNotificationsNum}
                bookmarkUpdatesNum={bookmarkUpdatesNum}
                pendingProposalsNum={pendingProposalsNum}
                openSidebar={openSidebar}
              />
              <MemoizedBookmarksSidebar
                theme={settings.theme}
                openLinkedNode={openLinkedNode}
                username={user.uname}
                open={openSidebar === "BOOKMARKS_SIDEBAR"}
                onClose={() => setOpenSidebar(null)}
              />
              <MemoizedSearcherSidebar
                openLinkedNode={openLinkedNode}
                open={openSidebar === "SEARCHER_SIDEBAR"}
                onClose={() => setOpenSidebar(null)}
              />
              <MemoizedBookmarksSidebar
                theme={settings.theme}
                openLinkedNode={openLinkedNode}
                username={user.uname}
                open={openSidebar === "BOOKMARKS_SIDEBAR"}
                onClose={() => setOpenSidebar(null)}
              />
              <MemoizedSearcherSidebar
                openLinkedNode={openLinkedNode}
                open={openSidebar === "SEARCHER_SIDEBAR"}
                onClose={() => setOpenSidebar(null)}
              />
              <MemoizedNotificationSidebar
                theme={settings.theme}
                openLinkedNode={openLinkedNode}
                username={user.uname}
                open={openSidebar === "NOTIFICATION_SIDEBAR"}
                onClose={() => setOpenSidebar(null)}
              />
              <MemoizedPendingProposalSidebar
                theme={settings.theme}
                openLinkedNode={openLinkedNode}
                username={user.uname}
                tagId={user.tagId}
                open={openSidebar === "PENDING_PROPOSALS"}
                onClose={() => onCloseSidebar()}
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
                proposeNodeImprovement={proposeNodeImprovement}
                fetchProposals={fetchProposals}
                selectedNode={nodeBookState.selectedNode}
                rateProposal={rateProposal}
                selectProposal={selectProposal}
                deleteProposal={deleteProposal}
                proposeNewChild={proposeNewChild}
                openProposal={openProposal}
                db={db}
              />

              <MemoizedUserSettingsSidebar
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
                />
              )}
            </Box>
          )}

          <MemoizedCommunityLeaderboard userTagId={user?.tagId ?? ""} pendingProposalsLoaded={pendingProposalsLoaded} />
          {isQueueWorking && (
            <CircularProgress
              size={46}
              sx={{
                position: "fixed",
                top: "7px",
                right: "7px",
                zIndex: "1300",
              }}
            />
          )}
          {nodeBookState.selectedNode && (
            <Tooltip
              title="Scroll to last Selected Node"
              placement="left"
              sx={{
                position: "fixed",
                top: { xs: openSidebar ? `${window.innerHeight * 0.5 + 10}px` : `10px`, md: "10px" },
                right: "10px",
                zIndex: "1300",
                background: theme => (theme.palette.mode === "dark" ? "#1f1f1f" : "#f0f0f0"),
                transition: "all 1s ease",
              }}
            >
              <IconButton color="secondary" onClick={onScrollToLastNode}>
                <MyLocationIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip
            title="Redraw graph"
            placement="left"
            sx={{
              position: "fixed",
              top: "60px",
              right: "10px",
              zIndex: "1300",
              background: theme => (theme.palette.mode === "dark" ? "#1f1f1f" : "#f0f0f0"),
            }}
          >
            <IconButton color="secondary" onClick={onRedrawGraph}>
              <AutoFixHighIcon />
            </IconButton>
          </Tooltip>
          {process.env.NODE_ENV === "development" && (
            <Tooltip
              title={"Watch geek data"}
              sx={{
                position: "fixed",
                top: { xs: openSidebar ? `${window.innerHeight * 0.5 + 120}px` : `110px`, md: "110px" },
                right: "10px",
                zIndex: "1300",
                background: theme => (theme.palette.mode === "dark" ? "#1f1f1f" : "#f0f0f0"),
                transition: "all 1s ease",
              }}
            >
              {/* DEVTOOLS */}
              <IconButton onClick={() => setOpenDeveloperMenu(!openDeveloperMenu)}>
                <CodeIcon />
              </IconButton>
            </Tooltip>
          )}
          {/* end Data from map */}

          {settings.view === "Graph" && (
            <Box
              id="MapContent"
              className={scrollToNodeInitialized.current ? "ScrollToNode" : undefined}
              onMouseOver={mapContentMouseOver}
              onTouchStart={mapContentMouseOver}
            >
              <MapInteractionCSS
                textIsHovered={mapHovered}
                /*identifier={'xdf'}*/
                value={mapInteractionValue}
                onChange={navigateWhenNotScrolling}
              >
                {settings.showClusterOptions && settings.showClusters && (
                  <MemoizedClustersList clusterNodes={clusterNodes} />
                )}
                <MemoizedLinksList edgeIds={edgeIds} edges={graph.edges} selectedRelation={selectedRelation} />
                <MemoizedNodeList
                  nodes={graph.nodes}
                  bookmark={bookmark}
                  markStudied={markStudied}
                  chosenNodeChanged={chosenNodeChanged}
                  referenceLabelChange={referenceLabelChange}
                  deleteLink={deleteLink}
                  cleanEditorLink={cleanEditorLink}
                  openLinkedNode={openLinkedNode}
                  openAllChildren={openAllChildren}
                  hideNodeHandler={hideNodeHandler}
                  hideOffsprings={hideOffsprings}
                  toggleNode={toggleNode}
                  openNodePart={openNodePart}
                  selectNode={selectNode}
                  nodeClicked={nodeClicked} // CHECK when is used
                  correctNode={correctNode}
                  wrongNode={wrongNode}
                  uploadNodeImage={uploadNodeImage}
                  removeImage={removeImage}
                  setOpenMedia={(imgUrl: string | boolean) => {
                    console.log("first", imgUrl);
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
