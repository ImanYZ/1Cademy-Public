import CloseIcon from "@mui/icons-material/Close";
import CodeIcon from "@mui/icons-material/Code";
import { Masonry } from "@mui/lab";
import { Button, Container, Divider, Drawer, IconButton, Modal, Paper, Tooltip, Typography } from "@mui/material";
import { Box } from "@mui/system";
// import axios from "axios";
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

import withAuthUser from "@/components/hoc/withAuthUser";
import { MemoizedCommunityLeaderboard } from "@/components/map/CommunityLeaderboard/CommunityLeaderboard";
import { MasonryNodes } from "@/components/MasonryNodes";
import { NodeItem } from "@/components/NodeItem";
/* eslint-enable */
import { useAuth } from "@/context/AuthContext";
import { useTagsTreeView } from "@/hooks/useTagsTreeView";
import { addSuffixToUrlGMT } from "@/lib/utils/string.utils";

import LoadingImg from "../../public/animated-icon-1cademy.gif";
import { MemoizedLinksList } from "../components/map/LinksList";
import { MemoizedNodeList } from "../components/map/NodesList";
import { MemoizedSidebar } from "../components/map/Sidebar/Sidebar";
import { NodeItemDashboard } from "../components/NodeItemDashboard";
import { NodeBookProvider, useNodeBook } from "../context/NodeBookContext";
import { useMemoizedCallback } from "../hooks/useMemoizedCallback";
import { useWorkerQueue } from "../hooks/useWorkerQueue";
import { NodeChanges } from "../knowledgeTypes";
import { idToken } from "../lib/firestoreClient/auth";
import { Post, postWithToken } from "../lib/mapApi";
import { dagreUtils } from "../lib/utils/dagre.util";
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
  // getSelectionText,
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
import { imageLoaded } from "../lib/utils/utils";
import { ChoosingType, EdgesData, FullNodeData, FullNodesData, UserNodes, UserNodesData } from "../nodeBookTypes";
// import { ClusterNodes, FullNodeData } from "../noteBookTypes";
import { NodeType, SimpleNode2 } from "../types";

type DashboardProps = {};

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
  const [{ user, reputation, settings }] = useAuth();
  const { allTags, allTagsLoaded } = useTagsTreeView();
  const db = getFirestore();
  // node that user is currently selected (node will be highlighted)
  // const [sNode, setSNode] = useState<string | null>(null); //<--- this was with recoil
  // id of node that will be modified by improvement proposal when entering state of selecting specific node (for tags, references, child and parent links)
  const [choosingNode] = useState(null); //<--- this was with recoil
  // // node that is in focus (highlighted)
  // const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // LOCAL STATES
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  // used for triggering useEffect after nodes or usernodes change
  const [userNodeChanges /*setUserNodeChanges*/] = useState<UserNodes[]>([]);
  const [nodeChanges /*setNodeChanges*/] = useState<NodeChanges[]>([]);
  // const [mapChanged, setMapChanged] = useState(false);
  // two collections (tables) in database, nodes and usernodes
  // nodes: collection of all data of each node
  // usernodes: collection of all data about each interaction between user and node
  // (ex: node open, hidden, closed, hidden, etc.) (contains every user with every node interacted with)

  // nodes: dictionary of all nodes visible on map for specific user
  // edges: dictionary of all edges visible on map for specific user
  const [graph, setGraph] = useState<{ nodes: FullNodesData; edges: EdgesData }>({ nodes: {}, edges: {} });
  // const [nodeTypeVisibilityChanges, setNodeTypeVisibilityChanges] = useState([]);

  const [allNodes, setAllNodes] = useState<FullNodesData>({});

  // as map grows, width and height grows based on the nodes shown on the map
  const [mapWidth, setMapWidth] = useState(700);
  const [mapHeight, setMapHeight] = useState(400);

  // mapRendered: flag for first time map is rendered (set to true after first time)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mapRendered, setMapRendered] = useState(false);

  // scale and translation of the viewport over the map for the map interactions module
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mapInteractionValue, setMapInteractionValue] = useState({
    scale: 1,
    translation: { x: 0, y: 0 },
  });

  // object of cluster boundaries
  // const [clusterNodes, setClusterNodes] = useState({});

  // flag for when scrollToNode is called
  // const [scrollToNodeInitialized, setScrollToNodeInitialized] = useState(false);
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
  const [pendingProposalsLoaded, setPendingProposalsLoaded] = useState(true);

  const previousLengthNodes = useRef(0);
  const g = useRef(dagreUtils.createGraph());

  const scrollToNode = useCallback((nodeId: string, tries = 0) => {
    devLog("scroll To Node", { nodeId, tries });
    if (tries === 10) return;

    if (!scrollToNodeInitialized.current) {
      setTimeout(() => {
        // const currentNode = graph.nodes[nodeId];
        // if(currentNode.height===NODE_HEIGHT)
        const originalNode = document.getElementById(nodeId);

        if (
          originalNode &&
          "offsetLeft" in originalNode &&
          originalNode.offsetLeft !== 0 &&
          "offsetTop" in originalNode &&
          originalNode.offsetTop !== 0
          // currentNode?.height !== NODE_HEIGHT &&
          // queueFinished
        ) {
          // setScrollToNodeInitialized(true);
          scrollToNodeInitialized.current = true;
          setTimeout(() => {
            scrollToNodeInitialized.current = false;
            // setScrollToNodeInitialized(false);
          }, 1300);

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          setMapInteractionValue(() => {
            return {
              scale: 0.94,
              translation: {
                x: (window.innerWidth / 3.4 - originalNode.offsetLeft) * 0.94,
                y: (window.innerHeight / 3.4 - originalNode.offsetTop) * 0.94,
              },
            };
          });
        } else {
          scrollToNode(nodeId, tries + 1);
        }
      }, 400);
    }
  }, []);

  const onCompleteWorker = useCallback(() => {
    if (!nodeBookState.selectedNode) return;

    scrollToNode(nodeBookState.selectedNode);
  }, [nodeBookState.selectedNode, scrollToNode]);

  const { addTask, queue, isQueueWorking, queueFinished, /* setTasksToWait, */ didWork } = useWorkerQueue({
    g,
    graph,
    setGraph,
    setMapWidth,
    setMapHeight,
    // setClusterNodes,
    // setMapChanged,
    mapWidth,
    mapHeight,
    allTags,
    onComplete: onCompleteWorker,
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
  const [isSubmitting, setIsSubmitting] = useState(true);

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

  // temporal state with value from node to improve
  // when click in improve Node the copy of original Node is here
  // when you cancel you need to restore the node (copy nodeToImprove in the node modified)
  // const [nodeToImprove, setNodeToImprove] = useState<FullNodeData | null>(null);

  //

  // const [showClusters, setShowClusters] = useState(false);
  const [firstScrollToNode, setFirstScrollToNode] = useState(false);

  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // FUNCTIONS
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  //  bd => state (first render)
  useEffect(() => {
    setTimeout(() => {
      if (user?.sNode === nodeBookState.selectedNode) return;

      if (!firstScrollToNode && queueFinished) {
        if (!user?.sNode) return;
        const selectedNode = graph.nodes[user?.sNode];
        if (!selectedNode) return;
        if (selectedNode.top === 0) return;

        nodeBookDispatch({ type: "setSelectedNode", payload: user.sNode });

        scrollToNode(user.sNode);
        setFirstScrollToNode(true);
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
    user?.sNode,
    userNodesLoaded,
  ]);

  useEffect(() => {
    // this will set is submiting to false when dont found nodes
    if (didWork) return;

    const intervalIdentifier = setTimeout(() => {
      setIsSubmitting(false);
      console.log("--->>> to false");
      // TODO: add mesage to sat we dont found nodes
    }, 20000);
    return () => clearInterval(intervalIdentifier);
  }, [didWork]);

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
      const fillDagre = (fullNodes: FullNodeData[], currentNodes: any, currentEdges: any) => {
        return fullNodes.reduce(
          (acu: { newNodes: { [key: string]: any }; newEdges: { [key: string]: any } }, cur) => {
            let tmpNodes = {};
            let tmpEdges = {};

            if (cur.nodeChangeType === "added") {
              const { uNodeData, oldNodes, oldEdges } = makeNodeVisibleInItsLinks(cur, acu.newNodes, acu.newEdges);
              // const res = createOrUpdateNode(g.current, cur, cur.node, acu.newNodes, acu.newEdges, allTags);
              const res = createOrUpdateNode(g.current, uNodeData, cur.node, oldNodes, oldEdges, allTags);
              tmpNodes = res.oldNodes;
              tmpEdges = res.oldEdges;
            }
            if (cur.nodeChangeType === "modified" && cur.visible) {
              const node = acu.newNodes[cur.node];
              if (!node) {
                // <---  CHECK I change this from nodes
                const res = createOrUpdateNode(g.current, cur, cur.node, acu.newNodes, acu.newEdges, allTags);
                tmpNodes = res.oldNodes;
                tmpEdges = res.oldEdges;
              } else {
                const currentNode: FullNodeData = {
                  ...cur,
                  left: node.left,
                  top: node.top,
                }; // <----- IMPORTANT: Add positions data from node into cur.node to not set default position into center of screen

                if (!compare2Nodes(cur, node)) {
                  const res = createOrUpdateNode(g.current, currentNode, cur.node, acu.newNodes, acu.newEdges, allTags);
                  tmpNodes = res.oldNodes;
                  tmpEdges = res.oldEdges;
                }
              }
            }
            // I changed the reference from snapshot
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
              // newNodes: { ...acu.newNodes, ...tmpNodes },
              // newEdges: { ...acu.newEdges, ...tmpEdges },
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
            // if (cur.nodeChangeType === "modified") {
            //   return {...acu,[cur.node]:cur}
            //   // return acu.map(c => (c.userNodeId === cur.userNodeId ? cur : c));
            // }
            if (cur.nodeChangeType === "removed") {
              // delete acu['sdsds']
              const tmp = { ...acu };
              delete tmp[cur.node];
              return tmp;
              // return acu.filter(c => c.userNodeId !== cur.userNodeId);
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

          // console.log("first:docChanges", { docChanges, pW: snapshot.metadata.hasPendingWrites });
          if (!docChanges.length) return null;
          // setIsSubmitting(true);
          const docChangesFromServer = docChanges.filter(cur => !cur.doc.metadata.fromCache);
          console.log("docChangesFromServer", docChangesFromServer);
          if (!docChangesFromServer.length) return null;

          const userNodeChanges = getUserNodeChanges(docChangesFromServer);

          const nodeIds = userNodeChanges.map(cur => cur.uNodeData.node);
          const nodesData = await getNodes(db, nodeIds);

          // nodesData.forEach(cur => {
          //   if (!cur?.nData.nodeType || !cur.nData.references) return;
          //   addReference(cur.nId, cur.nData);
          // });

          const fullNodes = buildFullNodes(userNodeChanges, nodesData);

          // const newFullNodes = fullNodes.reduce((acu, cur) => ({ ...acu, [cur.node]: cur }), {});
          // here set All Full Nodes to use in bookmarks
          // here set visible Full Nodes to draw Nodes in notebook
          const visibleFullNodes = fullNodes.filter(cur => cur.visible || cur.nodeChangeType === "modified");
          // const mergedVisibleFullNodes = visibleFullNodes.map(cur=>{
          //   const {lef} = nodes[cur.node]
          //   {...cur,left:}
          // })
          // const { newNodes, newEdges } = fillDagre(visibleFullNodes, nodeRef.current, edgesRef.current);

          setAllNodes(oldAllNodes => mergeAllNodes(fullNodes, oldAllNodes));
          // setNodes(newNodes);
          // setEdges(newEdges);
          // setNodes(nodes => {
          //   const { newNodes, newEdges } = fillDagre(visibleFullNodes, nodes, edgesRef.current);
          //   setEdges(newEdges);
          //   return newNodes;
          //   // setEdges(edges=>{
          //   // })
          // });
          setGraph(({ nodes, edges }) => {
            // Here we are merging with previous nodes left and top
            const visibleFullNodesMerged = visibleFullNodes.map(cur => {
              const tmpNode = nodes[cur.node];

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

            // const fixPositionByParentFullNodes = visibleFullNodesMerged.map(cur=>{
            //   if(cur.nodeChangeType==='modified' &&)
            // })
            // here we are filling dagger
            const { newNodes, newEdges } = fillDagre(visibleFullNodesMerged, nodes, edges);
            // setTasksToWait(visibleFullNodesMerged.length);
            return { nodes: newNodes, edges: newEdges };
          });
          // setEdges(edges => {
          //   setNodes(newNodes);
          //   return newEdges;
          // });
          // setIsSubmitting(false);
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
    [allTags, db /* setTasksToWait */]
  );

  useEffect(
    () => {
      if (!db) return;
      if (!user?.uname) return;
      if (!allTagsLoaded) return;

      const userNodesRef = collection(db, "userNodes");
      const q = query(
        userNodesRef,
        where("user", "==", user.uname),
        // IMPORTANT: I commented this to call all
        // visible: used to drag nodes in Notebook
        // visible and invisible to show bookmarks
        where("visible", "==", true),
        where("deleted", "==", false)
      );
      const killSnapshot = snapshot(q);
      return () => {
        //   // TODO: here we need to remove nodes cause will come node again
        killSnapshot();
      };
    },
    [allTagsLoaded, db, snapshot, user?.uname]
    // [allTags, allTagsLoaded, db, user?.uname]
  );

  useEffect(() => {
    const currentLengthNodes = Object.keys(graph.nodes).length;
    if (currentLengthNodes < previousLengthNodes.current) {
      // call worker to rerender all
      devLog("CHANGE NH 🚀", "recalculate");
      addTask(null);
    }
    previousLengthNodes.current = currentLengthNodes;
  }, [addTask, graph.nodes]);
  //called whenever isSubmitting changes
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

      // if (user?.uname) {
      // const userRef = db.collection("users").doc(username);
      const usersRef = collection(db, "users");
      const userRef = doc(usersRef, user.uname);

      await updateDoc(userRef, { sNode: nodeBookState.selectedNode });
      // setSNode(nodeBookState.selectedNode);

      const userNodeSelectLogRef = collection(db, "userNodeSelectLog");
      setDoc(doc(userNodeSelectLogRef), {
        nodeId: nodeBookState.selectedNode,
        uname: user.uname,
        createdAt: Timestamp.fromDate(new Date()),
      });
      // await userRef.update({ sNode: selectedNode });
      // const userNodeSelectLogRef = firebase.db.collection("userNodeSelectLog").doc();
      // userNodeSelectLogRef.set({
      //   nodeId: selectedNode,
      //   uname: username,
      //   createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      // });
      // }
    };
    changeSelectedNode();
  }, [db, nodeBookState.selectedNode, user?.sNode, user?.uname]);

  // useEffect(() => {
  //   if (!db) return;
  //   if (!user?.uname) return;
  //   if (!allTagsLoaded) return;

  //   const userNodesRef = collection(db, "userNodes");
  //   const q = query(
  //     userNodesRef,
  //     where("user", "==", user.uname),
  //     // IMPORTANT: I commented this to call all
  //     // visible: used to drag nodes in Notebook
  //     // visible and invisible to show bookmarks
  //     // where("visible", "==", true),
  //     where("deleted", "==", false)
  //   );

  //   const killSnapshot = snapshot(q);
  //   return () => {
  //     killSnapshot();
  //   };
  // }, [allTags, allTagsLoaded, db, snapshot, user?.uname]);

  /**
   * Will revert the graph from last changes (temporal Nodes or other changes)
   */
  const reloadPermanentGraph = useMemoizedCallback(() => {
    devLog("RELOAD PERMANENT GRAPH");
    // debugger;
    let oldNodes = graph.nodes;
    let oldEdges = graph.edges;
    if (tempNodes.size > 0 || Object.keys(changedNodes).length > 0) {
      oldNodes = { ...oldNodes };
      oldEdges = { ...oldEdges };
    }
    // for (let tempNode of tempNodes) {
    //   oldEdges = removeDagAllEdges(tempNode, oldEdges);
    //   oldNodes = removeDagNode(tempNode, oldNodes);
    //   tempNodes.delete(tempNode);
    // }

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
      oldNodes = setDagNode(g.current, cId, copyNode(changedNode), oldNodes, allTags, null);
      delete changedNodes[cId];
    }
    // setEdges(oldEdges);
    // setNodes(oldNodes);
    setGraph({ nodes: oldNodes, edges: oldEdges });
    // setMapChanged(true);
  }, [graph, allTags]);

  const resetAddedRemovedParentsChildren = useCallback(() => {
    // CHECK: this could be improve merging this 4 states in 1 state object
    // so we reduce the rerenders, also we can set only the empty array here
    setAddedParents(oldAddedParents => (oldAddedParents.length > 0 ? oldAddedParents : []));
    setAddedChildren(oldAddedChildren => (oldAddedChildren.length > 0 ? oldAddedChildren : []));
    setRemovedParents(oldRemovedParents => (oldRemovedParents.length > 0 ? oldRemovedParents : []));
    setRemovedChildren(oldRemovedChildren => (oldRemovedChildren.length > 0 ? oldRemovedChildren : []));
  }, []);

  const getMapGraph = useCallback(
    async (mapURL: string, postData: any = false) => {
      reloadPermanentGraph();

      try {
        await postWithToken(mapURL, postData);
        // // await firebase.idToken();
        // if (postData) {
        //   // await axios.post(mapURL, postData);
        // } else {
        //   await axios.post(mapURL);
        // }
      } catch (err) {
        console.error(err);
        try {
          await idToken();
          await postWithToken(mapURL, { ...postData });
          // if (postData) {
          //   await axios.post(mapURL, postData);
          // } else {
          //   await axios.post(mapURL);
          // }
        } catch (err) {
          console.error(err);
          // window.location.reload();
        }
      }
      setSelectedRelation(null);
      // setSelectedNode(null);
      // CHECK:I commented this ------ >>>
      // setSelectedNodeType(null);
      // setSelectionType(null);
      // setOpenPendingProposals(false);
      // setOpenChat(false);
      // setOpenNotifications(false);
      // setOpenToolbar(false);
      // setOpenSearch(false);
      // setOpenBookmarks(false);
      // setOpenRecentNodes(false);
      // setOpenTrends(false);
      // setOpenMedia(false);
      //  <<< -------   -----   ------
      resetAddedRemovedParentsChildren();
      setIsSubmitting(false);
    },
    // TODO: check dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetAddedRemovedParentsChildren]
  );

  // const getNodesData = useCallback(
  //   async (nodeIds: string[]) => {
  //     if (nodeIds.length > 0) {
  //       let oldNodeChanges = [...nodeChanges];
  //       const nodeDocsPromises = [];
  //       for (let nodeId of nodeIds) {
  //         const nodeRef = doc(db, "nodes", nodeId);

  //         nodeDocsPromises.push(getDoc(nodeRef));
  //       }
  //       await Promise.all(nodeDocsPromises)
  //         .then((nodeDocs: any[]) => {
  //           for (let nodeDoc of nodeDocs) {
  //             if (nodeDoc.exists) {
  //               const nData: NodeFireStore = nodeDoc.data() as NodeFireStore;
  //               if (!nData.deleted) {
  //                 oldNodeChanges.push({
  //                   cType: "added",
  //                   nId: nodeDoc.id,
  //                   nData
  //                 });
  //               }
  //             }
  //           }
  //           setNodeChanges(oldNodeChanges);
  //         })
  //         .catch(function (error) {
  //         });
  //     }
  //   },
  //   [nodeChanges]
  // );

  // const navigateToFirstParent = useCallback(
  //   (nodeId: string) => {
  //     const parents: any = g.current.predecessors(nodeId);
  //     console.log("navigateToFirstParent", parents);
  //     if (!parents.length) return;
  //     setTimeout(() => {
  //       scrollToNode(parents[0]);
  //       // // setSelectedNode(parents[0]);
  //       nodeBookDispatch({ type: "setSelectedNode", payload: parents[0] });
  //     }, 1500);
  //   },
  //   [nodeBookDispatch, scrollToNode]
  // );

  const getFirstParent = (childId: string) => {
    const parents: any = g.current.predecessors(childId);

    if (!parents) return null;
    if (!parents.length) return null;
    return parents[0];
  };

  // DEPRECATED: LOAD USER NODES, check new improvement flow, please
  // useEffect(() => {})

  // DEPRECATED: SYNC NODES FUNCTION, check new improvement flow, please
  // useEffect(() => {})

  // fire if map changed; responsible for laying out the knowledge map

  // const recalculateGraphWithWorker = useCallback(
  //   (nodesToRecalculate: FullNodesData, edgesToRecalculate: EdgesData) => {
  //     console.log("[recalculateGraphWithWorker]", { nodesToRecalculate, edgesToRecalculate });
  //     let mapChangedFlag = true;
  //     const oldClusterNodes: ClusterNodes = {};
  //     let oldMapWidth = mapWidth;
  //     let oldMapHeight = mapHeight;
  //     let oldNodes = { ...nodesToRecalculate };
  //     let oldEdges = { ...edgesToRecalculate };

  //     const worker: Worker = new Worker(new URL("../workers/MapWorker.ts", import.meta.url));
  //     worker.postMessage({
  //       mapChangedFlag,
  //       oldClusterNodes,
  //       oldMapWidth,
  //       oldMapHeight,
  //       oldNodes,
  //       oldEdges,
  //       allTags,
  //       XOFFSET,
  //       YOFFSET,
  //       MIN_CHANGE,
  //       MAP_RIGHT_GAP,
  //       NODE_WIDTH,
  //       graph: dagreUtils.mapGraphToObject(g.current),
  //     });
  //     // worker.onerror = (err) => err;
  //     worker.onmessage = e => {
  //       const { mapChangedFlag, oldClusterNodes, oldMapWidth, oldMapHeight, oldNodes, oldEdges, graph } = e.data;
  //       const gg = dagreUtils.mapObjectToGraph(graph);

  //       worker.terminate();
  //       g.current = gg;
  //       setMapWidth(oldMapWidth);
  //       setMapHeight(oldMapHeight);
  //       setClusterNodes(oldClusterNodes);
  //       setNodes(oldNodes);
  //       setEdges(oldEdges);
  //       setMapChanged(mapChangedFlag);
  //       // setMapChanged(false)
  //       // // if (!mapRendered) {
  //       // //   setTimeout(() => {
  //       // //     let nodeToNavigateTo = null;
  //       // //     if (
  //       // //       "location" in window &&
  //       // //       "pathname" in window.location &&
  //       // //       window.location.pathname.length > 1 &&
  //       // //       window.location.pathname[0] === "/"
  //       // //     ) {
  //       // //       const pathParts = window.location.pathname.split("/");
  //       // //       if (pathParts.length === 4) {
  //       // //         nodeToNavigateTo = pathParts[3];
  //       // //       }
  //       // //     }
  //       // //     // navigate to node that is identified in the URL
  //       // //     if (nodeToNavigateTo) {
  //       // //       openLinkedNode(nodeToNavigateTo);
  //       // //       // Navigate to node that the user interacted with the last time they used 1Cademy.
  //       // //     } else if (sNode) {
  //       // //       openLinkedNode(sNode);
  //       // //     } else {
  //       // //       //  redirect to the very first node that is loaded
  //       // //       scrollToNode(Object.keys(nodes)[0]);
  //       // //     }
  //       // //     setMapRendered(true);
  //       // //     // setMap
  //       // //   }, 10);
  //       // // }
  //     };
  //   },
  //   [allTags, mapHeight, mapWidth]
  // );

  // useEffect(() => {
  //   console.log("[WORKER]", {
  //     mapChanged,
  //     nodeChanges: nodeChanges.length === 0,
  //     userNodeChanges: userNodeChanges.length === 0,
  //     userNodesLoaded,
  //     EdgesSync: Object.keys(edges).length === g.current.edgeCount(),
  //   });
  //   if (
  //     mapChanged &&
  //     nodeChanges.length === 0 &&
  //     userNodeChanges.length === 0 &&
  //     // nodeTypeVisibilityChanges.length === 0 &&
  //     // (necessaryNodesLoaded && !mapRendered) ||
  //     userNodesLoaded &&
  //     // Object.keys(nodes).length + Object.keys(allTags).length === g.current.nodeCount() &&
  //     Object.keys(edges).length === g.current.edgeCount()
  //   ) {
  //     recalculateGraphWithWorker(nodes, edges);
  //   }
  // }, [
  //   // necessaryNodesLoaded,
  //   // nodeTypeVisibilityChanges,
  //   userNodesLoaded,
  //   mapChanged,
  //   allTags,
  //   nodes,
  //   edges,
  //   mapWidth,
  //   mapHeight,
  //   userNodeChanges,
  //   nodeChanges,
  //   recalculateGraphWithWorker,
  // ]);

  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // NODE FUNCTIONS
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  // deprecated: NODE_CHANGED, check improvement flow please
  // const nodeChanged = useMemoizedCallback()=>{}

  const chosenNodeChanged = useCallback(
    (nodeId: string) => {
      // if (!nodeBookState.choosingNode) return

      // if (nodeId === nodeBookState.choosingNode?.id && nodeBookState.chosenNode) {

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
            // thisNode.references = [
            //   ...thisNode.references,
            //   {
            //     node: nodeBookState.chosenNode.id,
            //     title: chosenNodeObj.title,
            //     label: "",
            //   },
            // ];
          } else if (nodeBookState.choosingNode.type === "Tag") {
            thisNode.tags = [...thisNode.tags, chosenNodeObj.title];
            thisNode.tagIds = [...thisNode.tagIds, nodeBookState.chosenNode.id];
            // thisNode.tags = [
            //   ...thisNode.tags,
            //   {<Button onClick={() => console.log(nodeChanges)}>node changes</Button>
            //     node: nodeBookState.chosenNode.id,
            //     title: chosenNodeObj.title,
            //   },
            // ];<Button onClick={() => console.log(nodeChanges)}>node changes</Button>
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
            if (removedParents.includes(nodeBookState.chosenNode.id)) {
              const chosenNodeId = nodeBookState.chosenNode.id;
              setRemovedParents(removedParents.filter((nId: string) => nId !== chosenNodeId));
            } else {
              const choosingNodeId = nodeBookState.choosingNode.id;
              setAddedParents(oldAddedParents => [...oldAddedParents, choosingNodeId]);
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
          // nodeBookDispatch({ type: 'setChoosingType', payload: null })
          // setChoosingNode(false);
          // setChosenNode(null);
          // setChosenNodeTitle(null);
          // setChoosingType(null);
          // setTimeout(() => {
          //   scrollToNode(nodeId);
          // }, 1500);
          // setMapChanged(true);

          const newNodes = {
            ...oldNodes,
            [nodeId]: thisNode,
            [chosenNode]: chosenNodeObj,
          };
          return { nodes: newNodes, edges: newEdges };
        }
        return { nodes: oldNodes, edges: oldEdges };
      });

      // setNodes(oldNodes => {
      //   // debugger
      // });
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      nodeBookState.choosingNode,
      nodeBookState.chosenNode,
      // nodeBookState.choosingType,
      // choosingNode,
      // chosenNode,
      // choosingType,
      removedParents,
      addedParents,
      removedChildren,
      addedChildren,
    ]
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
        // setTimeout(() => {
        //   scrollToNode(nodeId);
        // }, 1500);
        scrollToNode(nodeId);
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
      if (nodeBookState.selectionType !== "AcceptedProposals" && nodeBookState.selectionType !== "Proposals") {
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        // nodeBookDispatch({type:'setSelectedNode',payload:nodeId)
        // setSelectedNode(nodeId);
        setSelectedNodeType(nodeType);
        setOpenPart("LinkingWords");
      }
    },
    [nodeBookDispatch, nodeBookState.selectionType]
  );

  const setNodeParts = useMemoizedCallback((nodeId, innerFunc: (thisNode: FullNodeData) => FullNodeData) => {
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
    // debugger
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
        // setIsHiding(true);
        // setIsSubmitting(true);
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
            // await firebase.batchUpdate(nodeRef, changeNode);
            batch.update(nodeRef, changeNode);

            const userNodeLogRef = collection(db, "userNodesLog");
            // await firebase.batchSet(userNodeLogRef, userNodeLogData);
            batch.set(doc(userNodeLogRef), userNodeLogData);
          }
          // await firebase.commitBatch();

          await batch.commit();
          let oldNodes = { ...graph.nodes };
          let oldEdges = { ...graph.edges };
          for (let offspring of offsprings) {
            ({ oldNodes, oldEdges } = hideNodeAndItsLinks(g.current, offspring, oldNodes, oldEdges));
          }

          // CHECK: I commented this because in the SYNC function it will update nodes and edges
          // setNodes(oldNodes);
          // setEdges(oldEdges);
        } catch (err) {
          console.error(err);
        }
        // setTimeout(() => {
        //   scrollToNode(nodeId);
        // }, 1500);
        // setIsSubmitting(false);
      }
    },
    [nodeBookState.choosingNode, graph, recursiveOffsprings]
  );

  // /**
  //  * get Node data
  //  * iterate over children and update updatedAt field
  //  * iterate over parents and update updatedAt field
  //  * get userNode data
  //  *  - if exist: update visible and updatedAt field
  //  *  - else: create
  //  * build fullNode then call makeNodeVisibleInItsLinks and createOrUpdateNode
  //  * scroll
  //  * update selectedNode
  //  */
  // const openNodeHandler = useMemoizedCallback(
  //   async (nodeId: string) => {
  //     // setFlag(!flag)
  //     let linkedNodeRef;
  //     let userNodeRef = null;
  //     let userNodeData: UserNodesData | null = null;

  //     const nodeRef = doc(db, "nodes", nodeId);
  //     const nodeDoc = await getDoc(nodeRef);

  //     const batch = writeBatch(db);
  //     // const nodeRef = firebase.db.collection("nodes").doc(nodeId);
  //     // const nodeDoc = await nodeRef.get();
  //     if (nodeDoc.exists() && user) {
  //       //CHECK: added user
  //       const thisNode: any = { ...nodeDoc.data(), id: nodeId };
  //       try {
  //         for (let child of thisNode.children) {
  //           linkedNodeRef = doc(db, "nodes", child.node);

  //           // linkedNodeRef = db.collection("nodes").doc(child.node);

  //           batch.update(linkedNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
  //           // await firebase.batchUpdate(linkedNodeRef, { updatedAt: firebase.firestore.Timestamp.fromDate(new Date()) });
  //         }
  //         for (let parent of thisNode.parents) {
  //           // linkedNodeRef = firebase.db.collection("nodes").doc(parent.node);
  //           linkedNodeRef = doc(db, "nodes", parent.node);
  //           // do a batch r
  //           batch.update(linkedNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
  //           // await firebase.batchUpdate(linkedNodeRef, {
  //           //   updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
  //           // });
  //         }
  //         const userNodesRef = collection(db, "userNodes");
  //         const q = query(userNodesRef, where("node", "==", nodeId), where("user", "==", user.uname), limit(1));
  //         const userNodeDoc = await getDocs(q);
  //         let userNodeId = null;
  //         if (userNodeDoc.docs.length > 0) {
  //           // if exist documents update the first
  //           userNodeId = userNodeDoc.docs[0].id;
  //           // userNodeRef = firebase.db.collection("userNodes").doc(userNodeId);
  //           const userNodeRef = doc(db, "userNodes", userNodeId);
  //           userNodeData = userNodeDoc.docs[0].data() as UserNodesData;
  //           userNodeData.visible = true;
  //           userNodeData.updatedAt = Timestamp.fromDate(new Date());
  //           batch.update(userNodeRef, userNodeData);
  //         } else {
  //           // if NOT exist documents create a document
  //           userNodeRef = collection(db, "userNodes");
  //           // userNodeId = userNodeRef.id;
  //           // console.log(' ---->> userNodeId', userNodeRef, userNodeId)
  //           userNodeData = {
  //             changed: true,
  //             correct: false,
  //             createdAt: Timestamp.fromDate(new Date()),
  //             updatedAt: Timestamp.fromDate(new Date()),
  //             // firstVisit: Timestamp.fromDate(new Date()),//CHECK
  //             // lastVisit: Timestamp.fromDate(new Date()),//CHECK
  //             // userNodeId: newId(),
  //             deleted: false,
  //             isStudied: false,
  //             bookmarked: false,
  //             node: nodeId,
  //             open: true,
  //             user: user.uname,
  //             visible: true,
  //             wrong: false,
  //           };
  //           batch.set(doc(userNodeRef), userNodeData); // CHECK: changed with batch
  //           // const docRef = await addDoc(userNodeRef, userNodeData);
  //           // userNodeId = docRef.id; // CHECK: commented this
  //         }
  //         batch.update(nodeRef, {
  //           viewers: thisNode.viewers + 1,
  //           updatedAt: Timestamp.fromDate(new Date()),
  //         });
  //         const userNodeLogRef = collection(db, "userNodesLog");

  //         const userNodeLogData = {
  //           ...userNodeData,
  //           createdAt: Timestamp.fromDate(new Date()),
  //         };

  //         // const id = userNodeLogRef.id
  //         batch.set(doc(userNodeLogRef), userNodeLogData);

  //         let oldNodes: { [key: string]: any } = { ...nodes };
  //         let oldEdges: { [key: string]: any } = { ...edges };
  //         // let oldAllNodes: any = { ...nodes };
  //         // let oldAllUserNodes: any = { ...nodeChanges };
  //         // if data for the node is loaded
  //         let uNodeData = {
  //           // load all data corresponding to the node on the map and userNode data from the database and add userNodeId for the change documentation
  //           ...nodes[nodeId],
  //           ...thisNode, // CHECK <-- I added this to have children, parents, tags properties
  //           ...userNodeData,
  //           open: true,
  //         };

  //         if (userNodeId) {
  //           // TODO: I added this validation
  //           uNodeData[userNodeId] = userNodeId;
  //         }
  //         ({ uNodeData, oldNodes, oldEdges } = makeNodeVisibleInItsLinks(
  //           // modify nodes and edges
  //           uNodeData,
  //           oldNodes,
  //           oldEdges
  //           // oldAllNodes
  //         ));

  //         // debugger
  //         ({ oldNodes, oldEdges } = createOrUpdateNode(
  //           // modify dagger
  //           g.current,
  //           uNodeData,
  //           nodeId,
  //           oldNodes,
  //           { ...oldEdges },
  //           allTags
  //         ));

  //         // CHECK: need to update the nodes and edges
  //         // to get the last changes from:
  //         //  makeNodeVisibleInItsLinks and createOrUpdateNode
  //         // setNodes(oldNodes)
  //         // setEdges(oldEdges)

  //         // oldAllNodes[nodeId] = uNodeData;
  //         // setNodes(oldAllNodes)
  //         // setNodes(oldNodes => ({ ...oldNodes, oldNodes[nodeId]}))
  //         // oldAllUserNodes = {
  //         //   ...oldAllUserNodes,
  //         //   [nodeId]: userNodeData,
  //         // };
  //         // await firebase.commitBatch();
  //         await batch.commit();
  //         scrollToNode(nodeId);
  //         //  there are some places when calling scroll to node but we are not selecting that node
  //         setTimeout(() => {
  //           nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
  //           // setSelectedNode(nodeId);
  //         }, 400);
  //       } catch (err) {
  //         console.error(err);
  //       }
  //     }
  //   },
  //   // CHECK: I commented allNode, I did'nt found where is defined
  //   [user, nodes, edges /*allNodes*/, , allTags /*allUserNodes*/]
  // );

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
      // setFlag(!flag)
      let linkedNodeRef;
      let userNodeRef = null;
      let userNodeData: UserNodesData | null = null;

      const nodeRef = doc(db, "nodes", nodeId);
      const nodeDoc = await getDoc(nodeRef);

      const batch = writeBatch(db);
      // const nodeRef = firebase.db.collection("nodes").doc(nodeId);
      // const nodeDoc = await nodeRef.get();
      if (nodeDoc.exists() && user) {
        //CHECK: added user
        const thisNode: any = { ...nodeDoc.data(), id: nodeId };
        try {
          for (let child of thisNode.children) {
            linkedNodeRef = doc(db, "nodes", child.node);

            // linkedNodeRef = db.collection("nodes").doc(child.node);

            batch.update(linkedNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
            // await firebase.batchUpdate(linkedNodeRef, { updatedAt: firebase.firestore.Timestamp.fromDate(new Date()) });
          }
          for (let parent of thisNode.parents) {
            // linkedNodeRef = firebase.db.collection("nodes").doc(parent.node);
            linkedNodeRef = doc(db, "nodes", parent.node);
            // do a batch r
            batch.update(linkedNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
            // await firebase.batchUpdate(linkedNodeRef, {
            //   updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
            // });
          }
          const userNodesRef = collection(db, "userNodes");
          const q = query(userNodesRef, where("node", "==", nodeId), where("user", "==", user.uname), limit(1));
          const userNodeDoc = await getDocs(q);
          let userNodeId = null;
          if (userNodeDoc.docs.length > 0) {
            // if exist documents update the first
            userNodeId = userNodeDoc.docs[0].id;
            // userNodeRef = firebase.db.collection("userNodes").doc(userNodeId);
            const userNodeRef = doc(db, "userNodes", userNodeId);
            userNodeData = userNodeDoc.docs[0].data() as UserNodesData;
            userNodeData.visible = true;
            userNodeData.updatedAt = Timestamp.fromDate(new Date());
            batch.update(userNodeRef, userNodeData);
          } else {
            // if NOT exist documents create a document
            userNodeRef = collection(db, "userNodes");
            // userNodeId = userNodeRef.id;

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
            batch.set(doc(userNodeRef), userNodeData); // CHECK: changed with batch
            // const docRef = await addDoc(userNodeRef, userNodeData);
            // userNodeId = docRef.id; // CHECK: commented this
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

          // const id = userNodeLogRef.id
          batch.set(doc(userNodeLogRef), userNodeLogData);
          await batch.commit();

          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        } catch (err) {
          console.error(err);
        }
      }
    },
    // CHECK: I commented allNode, I did'nt found where is defined
    [user /*allNodes*/, , allTags /*allUserNodes*/]
  );

  const openLinkedNode = useCallback(
    (linkedNodeID: string) => {
      devLog("open Linked Node", { linkedNodeID });
      if (!nodeBookState.choosingNode) {
        let linkedNode = document.getElementById(linkedNodeID);
        if (linkedNode) {
          nodeBookDispatch({ type: "setSelectedNode", payload: linkedNodeID });
          scrollToNode(linkedNodeID);
        } else {
          openNodeHandler(linkedNodeID);
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
      // const userNodeRef = doc(db, "userNodes", userNodeId);
      // let userNodeRef: DocumentReference<DocumentData> | null = null
      const userNodeRef = doc(db, "userNodes", userNodeId);
      // if (userNodeId) {
      // }//CHECK:We commented this
      return { nodeRef, userNodeRef };
    },
    [db]
  );

  const initNodeStatusChange = useCallback(
    (nodeId: string, userNodeId: string) => {
      // setSelectedNode(nodeId);
      // nodeBookDispatch({ type: "setSelectedNode", payload: nodeId }); // CHECK this
      // setSelectedNodeType(null);
      // setSelectionType(null);
      // setOpenPendingProposals(false);
      // setOpenChat(false);
      // setOpenNotifications(false);
      // setOpenToolbar(false);
      // setOpenSearch(false);
      // setOpenBookmarks(false);
      // setOpenRecentNodes(false);
      // setOpenTrends(false);
      // setOpenMedia(false);
      // resetAddedRemovedParentsChildren();
      // reloadPermanentGraph();
      return getNodeUserNode(nodeId, userNodeId);
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [/*resetAddedRemovedParentsChildren, reloadPermanentGraph,*/ getNodeUserNode]
  );

  const hideNodeHandler = useCallback(
    async (nodeId: string /*setIsHiding: any*/) => {
      /**
       * changes in DB
       * change userNode
       * change node
       * create userNodeLog
       */

      const batch = writeBatch(db);
      const username = user?.uname;
      if (!nodeBookState.choosingNode) {
        // setIsHiding(true);

        // navigateToFirstParent(nodeId);
        const parentNode = getFirstParent(nodeId);

        if (username) {
          // try {

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
            open: false,
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

          // CHECK: I commented this, because the SYNC will call hideNodeAndItsLinks
          // const { oldNodes: newNodes, oldEdges: newEdges } = hideNodeAndItsLinks(nodeId, { ...nodes }, { ...edges })
          // setNodes(newNodes);
          // setEdges(newEdges);

          /*
          let oldNodes = { ...nodes };
          let oldEdges = { ...edges };
          */
          //} catch (err) {
          //console.error(err);
          //}
        }

        nodeBookDispatch({ type: "setSelectedNode", payload: parentNode });
        // setTimeout(() => {
        //   scrollToNode(parentNode);
        // }, 1500);
        // // setSelectedNode(parents[0]);
      }
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodeBookState.choosingNode, user, graph, initNodeStatusChange /*navigateToFirstParent*/]
  );
  const openAllChildren = useMemoizedCallback(
    async (nodeId: string) => {
      if (!choosingNode && user) {
        // setIsSubmitting(true);
        let linkedNode = null;
        let linkedNodeId = null;
        let linkedNodeRef = null;
        let userNodeRef = null;
        let userNodeData = null;
        const batch = writeBatch(db);
        const thisNode = graph.nodes[nodeId];
        try {
          // let oldNodes = { ...graph.nodes };
          // let oldEdges = { ...graph.edges };
          // let oldAllNodes: any = { ...allNodes };
          // let oldAllUserNodes = { ...allUserNodes };
          for (let child of thisNode.children) {
            linkedNodeId = child.node as string;
            linkedNode = document.getElementById(linkedNodeId);
            if (!linkedNode) {
              // const nodeRef = firebase.db.collection("nodes").doc(linkedNodeId);
              const nodeRef = doc(db, "nodes", linkedNodeId);
              const nodeDoc = await getDoc(nodeRef);
              if (nodeDoc.exists()) {
                const thisNode: any = { ...nodeDoc.data(), id: linkedNodeId };
                for (let chi of thisNode.children) {
                  // linkedNodeRef = firebase.db.collection("nodes").doc(chi.node);
                  linkedNodeRef = doc(db, "nodes", chi.node);
                  // await firebase.batchUpdate(linkedNodeRef, {
                  //   updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                  // });
                  batch.update(linkedNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
                }
                for (let parent of thisNode.parents) {
                  // linkedNodeRef = firebase.db.collection("nodes").doc(parent.node);
                  linkedNodeRef = doc(db, "nodes", parent.node);
                  // await firebase.batchUpdate(linkedNodeRef, {
                  //   updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                  // });
                  batch.update(linkedNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
                }
                // const userNodeQuery = firebase.db
                //   .collection("userNodes")
                //   .where("node", "==", linkedNodeId)
                //   .where("user", "==", username)
                //   .limit(1);
                const userNodesRef = collection(db, "userNodes");
                const userNodeQuery = query(
                  userNodesRef,
                  where("node", "==", linkedNodeId),
                  where("user", "==", user.uname),
                  limit(1)
                );
                // const userNodeDoc = await userNodeQuery.get();
                const userNodeDoc = await getDocs(userNodeQuery);
                // let userNodeId = null;
                if (userNodeDoc.docs.length > 0) {
                  // userNodeId = userNodeDoc.docs[0].id;
                  // userNodeRef = firebase.db.collection("userNodes").doc(userNodeDoc.docs[0].id);
                  userNodeRef = doc(db, "userNodes", userNodeDoc.docs[0].id);
                  userNodeData = userNodeDoc.docs[0].data();
                  userNodeData.visible = true;
                  userNodeData.updatedAt = Timestamp.fromDate(new Date());
                  // await firebase.batchUpdate(userNodeRef, userNodeData);
                  batch.update(userNodeRef, userNodeData);
                } else {
                  // userNodeRef = firebase.db.collection("userNodes").doc();
                  // userNodeId = userNodeRef.id;
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
                  // userNodeRef.set(userNodeData);
                  userNodeRef = await addDoc(collection(db, "userNodes"), userNodeData);
                }
                // await firebase.batchUpdate(nodeRef, {
                //   viewers: thisNode.viewers + 1,
                //   updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                // });
                batch.update(nodeRef, {
                  viewers: thisNode.viewers + 1,
                  updatedAt: Timestamp.fromDate(new Date()),
                });
                // const userNodeLogRef = firebase.db.collection("userNodesLog").doc();
                // const userNodeLogData = {
                //   ...userNodeData,
                //   createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
                // };
                // await firebase.batchSet(userNodeLogRef, userNodeLogData);
                const userNodeLogRef = collection(db, "userNodesLog");
                const userNodeLogData = {
                  ...userNodeData,
                  createdAt: Timestamp.fromDate(new Date()),
                };

                batch.set(doc(userNodeLogRef), userNodeLogData);
                // if data for the node is loaded
                // let uNodeData = {
                //   // load all data corresponsponding to the node on the map and userNode data from the database and add userNodeId for the change documentation
                //   ...oldAllNodes[linkedNodeId],
                //   ...userNodeData,
                //   open: true,
                // };
                // if (userNodeId) {
                //   uNodeData[userNodeId] = userNodeId;
                // }
                // ({ uNodeData, oldNodes, oldEdges } = makeNodeVisibleInItsLinks(
                //   uNodeData,
                //   oldNodes,
                //   oldEdges,
                //   oldAllNodes
                // ));
                // ({ oldNodes, oldEdges } = createOrUpdateNode(
                //   uNodeData,
                //   linkedNodeId,
                //   oldNodes,
                //   { ...oldEdges },
                //   allTags
                // ));
                // oldAllNodes[linkedNodeId] = uNodeData;
                // oldAllUserNodes = {
                //   ...oldAllUserNodes,
                //   [linkedNodeId]: userNodeData,
                // };
              }
            }
          }
          // await firebase.commitBatch();
          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
          await batch.commit();
          // setIsSubmitting(false);
        } catch (err) {
          console.error(err);
        }
      }
    },
    [choosingNode, graph]
  );
  const toggleNode = useCallback(
    (event: any, nodeId: string) => {
      if (!nodeBookState.choosingNode) {
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
          // nodeRef.update(changeNode);

          updateDoc(userNodeRef, {
            open: !thisNode.open,
            updatedAt: Timestamp.fromDate(new Date()),
          });
          // userNodeRef.update({
          //   open: !thisNode.open,
          //   updatedAt: Timestamp.fromDate(new Date()),
          // });
          const userNodeLogRef = collection(db, "userNodesLog");
          // const userNodeLogRef = firebase.db.collection("userNodesLog").doc();
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
      if (!choosingNode) {
        if (openPart === partType) {
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
          //   //i commented this two line until we define the right states
          //   // selectionType !== "AcceptedProposals" &&
          //   // selectionType !== "Proposals"
          // ) {
          //   // setSelectedTags(tags);
          //   // setOpenRecentNodes(true);
          // }
        }
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
      }
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, nodeBookState.choosingNode /*selectionType*/]
  );

  /**
   * This will update reference label and will update the required node
   * without call sync or worker (thats good)
   */
  // const referenceLabelChange = useCallback(
  //   (event: any, nodeId: string, referenceIdx: number) => {
  //     console.log("[REFERENCE_LABEL_CHANGE]", { event, nodeId, referenceIdx });
  //     event.persist();
  //     const thisNode = { ...graph.nodes[nodeId] };
  //     let referenceLabelsCopy = [...thisNode.referenceLabels];
  //     referenceLabelsCopy[referenceIdx] = event.target.value;
  //     thisNode.referenceLabels = referenceLabelsCopy;
  //     // setNodes({ ...nodes, [nodeId]: thisNode });
  //     setGraph({
  //       nodes: { ...graph.nodes, [nodeId]: thisNode },
  //       edges: graph.edges,
  //     });
  //   },
  //   [graph /*setNodeParts*/]
  // );
  const referenceLabelChange = useCallback(
    (newLabel: string, nodeId: string, referenceIdx: number) => {
      devLog("REFERENCE_LABEL_CHANGE", { newLabel, nodeId, referenceIdx });

      // event.persist();
      const thisNode = { ...graph.nodes[nodeId] };
      let referenceLabelsCopy = [...thisNode.referenceLabels];
      referenceLabelsCopy[referenceIdx] = newLabel;
      thisNode.referenceLabels = referenceLabelsCopy;
      // setNodes({ ...nodes, [nodeId]: thisNode });
      setGraph({
        nodes: { ...graph.nodes, [nodeId]: thisNode },
        edges: graph.edges,
      });
    },
    [graph /*setNodeParts*/]
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
          // const userNodeLogRef = firebase.db.collection("userNodesLog").doc();
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
          // let bookmarks = 0;
          // if ("bookmarks" in thisNode) {
          //   bookmarks = thisNode.bookmarks;
          // }
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
      if (!choosingNode) {
        // setSelectedNode(nodeId);
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        // setSelectedNodeType(nodeType);
        setIsSubmitting(true);
        getMapGraph(`/correctNode/${nodeId}`);
      }
      event.currentTarget.blur();
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodeBookState.choosingNode, getMapGraph]
  );

  const wrongNode = useCallback(
    async (
      event: any,
      nodeId: string,
      nodeType: NodeType,
      wrong: any,
      correct: any,
      wrongs: number,
      corrects: number
    ) => {
      if (!nodeBookState.choosingNode) {
        let deleteOK = true;
        // setSelectedNode(nodeId);
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        // setSelectedNodeType(nodeType);
        if ((!wrong && wrongs >= corrects) || (correct && wrongs === corrects - 1)) {
          deleteOK = window.confirm("You are going to permanently delete this node by downvoting it. Are you sure?");
        }
        if (deleteOK) {
          setIsSubmitting(true);
          await idToken();
          getMapGraph(`/wrongNode/${nodeId}`);
        }
      }

      // event.currentTarget.blur(); // CHECK: I comment this, the current target is null
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodeBookState.choosingNode, getMapGraph]
  );

  /////////////////////////////////////////////////////
  // Node Improvement Functions

  /**
   * This function is called only when NODE HIGHT was changed
   * - editable values: values changed in proposal form
   */
  const changeNodeHight = useCallback(
    (nodeId: string, height: number) => {
      devLog("CHANGE NH 🚀", `H:${height}, nId:${nodeId}`);

      // // if (value === nodes[nodeId].title) return;
      // const nodeChanged: FullNodeData = { ...nodes[nodeId], height };

      // // console.log("nodeChanges", { nodeId, nodeChanged, nodes: { ...nodes } });
      // const oldNodes = setDagNode(g.current, nodeId, nodeChanged, { ...nodes }, { ...allTags }, null);

      // recalculateGraphWithWorker(oldNodes, edges);
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
      // CHECK: We are using changeNodeHight and is called automatically when Height change
      // adjustNodeHeight(nodeRef, nodeId)
    },
    [setNodeParts /* adjustNodeHeight*/]
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
      // CHECK: We are using changeNodeHight and is called automatically when Height change
      // adjustNodeHeight(nodeRef, nodeId)
    },
    [setNodeParts /*, adjustNodeHeight*/]
  );

  /////////////////////////////////////////////////////
  // Sidebar Functions

  const closeSideBar = useMemoizedCallback(() => {
    devLog("In closeSideBar");

    if (!user) return;

    // setNodeToImprove(null); // CHECK: I added this to compare then

    // const gg = () => {
    //   if (!graph.nodes?[nodeBookState?.selectedNode]) return null;

    //   return [nodeBookState.selectedNode].editable;
    // };
    // debugger;
    // console.log("selectionType", nodeBookState);
    // console.log(
    //   'nodeBookState.selectionType === "AcceptedProposals"',
    //   nodeBookState.selectionType === "AcceptedProposals"
    // );
    // console.log('nodeBookState.selectionType === "Proposals"', nodeBookState.selectionType === "Proposals");
    // console.log(
    //   "first",
    //   nodeBookState.selectedNode && "selectedNode" in graph.nodes && graph.nodes[nodeBookState.selectedNode].editable
    // );

    if (
      nodeBookState.selectionType === "AcceptedProposals" ||
      nodeBookState.selectionType === "Proposals" ||
      (nodeBookState.selectedNode && "selectedNode" in graph.nodes && graph.nodes[nodeBookState.selectedNode].editable)
    ) {
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
    // setChoosingNode(false);
    // setChosenNode(null);
    // setChosenNodeTitle(null);
    // setSelectionType(null);
    setSelectedUser(null);
    setOpenPendingProposals(false);
    setOpenChat(false);
    setOpenNotifications(false);
    setOpenPresentations(false);
    // setOpenToolbar(false);
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
    // userClosedSidebarLogRef.set({
    //   uname: user.uname,
    //   sidebarType,
    //   createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
    // });
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
      // console.log("[PROPOSE_NODE_IMPROVEMENT]");
      event.preventDefault();
      if (!nodeBookState.selectedNode) return;

      setOpenProposal("ProposeEditTo" + nodeBookState.selectedNode);
      reloadPermanentGraph();

      // CHECK: Improve this making the operations out of setNode,
      // when have nodes with new data
      // update with setNodes
      // console.log("set Nodes and change editable to true", nodeBookState);
      // setNodes(oldNodes => {
      //   if (!nodeBookState.selectedNode) return oldNodes;

      //   if (!(nodeBookState.selectedNode in changedNodes)) {
      //     changedNodes[nodeBookState.selectedNode] = copyNode(oldNodes[nodeBookState.selectedNode]);
      //   }
      //   const thisNode = { ...oldNodes[nodeBookState.selectedNode] };
      //   setNodeToImprove(thisNode); // CHECK: I added this to compare then
      //   thisNode.editable = true;
      //   // setMapChanged(true);
      //   return {
      //     ...oldNodes,
      //     [nodeBookState.selectedNode]: thisNode,
      //   };
      // });
      setGraph(({ nodes: oldNodes, edges }) => {
        if (!nodeBookState.selectedNode) return { nodes: oldNodes, edges };

        if (!(nodeBookState.selectedNode in changedNodes)) {
          changedNodes[nodeBookState.selectedNode] = copyNode(oldNodes[nodeBookState.selectedNode]);
        }
        const thisNode = { ...oldNodes[nodeBookState.selectedNode] };
        // setNodeToImprove(thisNode); // CHECK: I added this to compare then
        thisNode.editable = true;
        // setMapChanged(true);
        const newNodes = {
          ...oldNodes,
          [nodeBookState.selectedNode]: thisNode,
        };

        return { nodes: newNodes, edges };
      });
      scrollToNode(nodeBookState.selectedNode);
    },
    [nodeBookState, reloadPermanentGraph, scrollToNode]
  );

  const selectNode = useCallback(
    (event: any, nodeId: string, chosenType: any, nodeType: any) => {
      devLog("SELECT_NODE", { choosingNode: nodeBookState.choosingNode });

      if (!nodeBookState.choosingNode) {
        if (nodeBookState.selectionType === "AcceptedProposals" || nodeBookState.selectionType === "Proposals") {
          reloadPermanentGraph();
        }
        if (nodeBookState.selectedNode === nodeId && nodeBookState.selectionType === chosenType) {
          // setSelectedNode(null);
          // setSelectionType(null);
          nodeBookDispatch({ type: "setSelectedNode", payload: null });
          nodeBookDispatch({ type: "setSelectionType", payload: null });
          setSelectedNodeType(null);
          setOpenPendingProposals(false);
          setOpenChat(false);
          setOpenNotifications(false);
          // setOpenToolbar(false);
          nodeBookDispatch({ type: "setOpenToolbar", payload: false });
          setOpenSearch(false);
          setOpenRecentNodes(false);
          setOpenTrends(false);
          setOpenMedia(false);
          resetAddedRemovedParentsChildren();
          event.currentTarget.blur();
        } else {
          setOpenSearch(false);

          setSelectedNodeType(nodeType);
          nodeBookDispatch({ type: "setSelectionType", payload: chosenType });
          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });

          // setSelectedNode(nodeId);
        }
      }
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      choosingNode,
      nodeBookState.selectionType,
      nodeBookState.selectedNode,
      // selectedNode,
      // selectionType,
      reloadPermanentGraph,
      // proposeNodeImprovement,
      resetAddedRemovedParentsChildren,
    ]
  );

  const saveProposedImprovement = useMemoizedCallback(
    (summary: any, reason: any) => {
      if (!nodeBookState.selectedNode) return;

      nodeBookDispatch({ type: "setChosenNode", payload: null });
      nodeBookDispatch({ type: "setChoosingNode", payload: null });
      // setChoosingNode(false)
      // setChosenNode(null)
      // setChosenNodeTitle(null)
      // console.log("In saveProposedImprovement");
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
        // if (nodeBookState.selectedNode) return

        // const oldNode = allNodes[nodeBookState.selectedNode];
        // const oldNode = allNodes.find(cur => cur.node === nodeBookState.selectedNode);
        const keyFound = Object.keys(allNodes).find(key => allNodes[key].node === nodeBookState.selectedNode);
        if (!keyFound) return;
        const oldNode = allNodes[keyFound];
        // const oldNode = { ...nodeToImprove };

        let isTheSame =
          newNode.title === oldNode.title &&
          newNode.content === oldNode.content &&
          newNode.nodeType === oldNode.nodeType;
        // isTheSame = compareImages(oldNode, newNode, isTheSame);
        isTheSame = isTheSame && compareProperty(oldNode, newNode, "nodeImage");
        // isTheSame = compareLinks(oldNode.tags, newNode.tags, isTheSame, false)
        // isTheSame = compareLinks(oldNode.references, newNode.references, isTheSame, false)
        isTheSame = compareFlatLinks(oldNode.tagIds, newNode.tagIds, isTheSame); // CHECK: O checked only ID changes
        isTheSame = compareFlatLinks(oldNode.referenceIds, newNode.referenceIds, isTheSame); // CHECK: O checked only ID changes
        isTheSame = compareLinks(oldNode.parents, newNode.parents, isTheSame, false);
        isTheSame = compareLinks(oldNode.children, newNode.children, isTheSame, false);

        isTheSame = compareChoices(oldNode, newNode, isTheSame);
        if (isTheSame) {
          window.alert("You've not changed anything yet!");
        } else {
          setIsSubmitting(true);
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
          getMapGraph("/proposeNodeImprovement", postData);
          scrollToNode(nodeBookState.selectedNode);
        }
      }
    },
    [
      graph.nodes,
      // allNodes,
      nodeBookState.selectedNode,
      addedParents,
      addedChildren,
      removedParents,
      removedChildren,
      getMapGraph,
    ]
  );

  const proposeNewChild = useMemoizedCallback(
    (event, childNodeType: string) => {
      if (!user) return;

      devLog("PROPOSE_NEW_CHILD", { childNodeType });
      event.preventDefault();
      setOpenProposal("ProposeNew" + childNodeType + "ChildNode");
      reloadPermanentGraph();
      const newNodeId = newId();
      setGraph(graph => {
        const { nodes: oldNodes, edges } = graph;
        // debugger;
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
          // id: newNodeId,
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
          tagIds: [user.tagId], // CHECK: I added this, Check useUserState line 374
          title: "",
          wrongs: 0,
          corrects: 1,
          content: "",
          nodeImage: "",
          studied: 1,
          references: [],
          referenceIds: [], // CHECK: I added this
          referenceLabels: [], // CHECK: I added this
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

        // console.log(2, { newNodeId, newChildNode });
        // let newEdges = edges;

        const newNodes = setDagNode(g.current, newNodeId, newChildNode, { ...oldNodes }, { ...allTags }, () => {});
        if (!nodeBookState.selectedNode) return { nodes: newNodes, edges }; //CHECK: I add this to validate
        // console.log(3);
        const newEdges = setDagEdge(g.current, nodeBookState.selectedNode, newNodeId, { label: "" }, { ...edges });

        // setEdges(oldEdges => {
        // });
        // console.log(4, { newNodes, newEdges });
        // setMapChanged(true);
        // setTimeout(() => {
        //   console.log("call scroll", newNodeId);
        //   scrollToNode(newNodeId);
        // }, 10000);
        nodeBookDispatch({ type: "setSelectedNode", payload: newNodeId });

        return { nodes: newNodes, edges: newEdges };
      });
    },
    [user, nodeBookState.selectedNode, allTags, reloadPermanentGraph, graph]
  );

  const onNodeTitleBlur = useCallback(
    (newTitle: string) => {
      setOpenSearch(true);
      // setNodeTitleBlured(true); // this is not used in searcher
      // setSearchQuery(newTitle);
      // setSelectionType(null);
      nodeBookDispatch({ type: "setNodeTitleBlured", payload: true });
      nodeBookDispatch({ type: "setSearchQuery", payload: newTitle });
      // nodeBookDispatch({ type: "setSelectionType", payload: null });
    },
    [nodeBookDispatch]
  );

  const saveProposedChildNode = useMemoizedCallback(
    (newNodeId, summary, reason) => {
      nodeBookDispatch({ type: "setChoosingNode", payload: null });
      nodeBookDispatch({ type: "setChosenNode", payload: null });

      // setChoosingNode(false);
      // setChosenNode(null);
      // setChosenNodeTitle(null);
      const newNode = graph.nodes[newNodeId];

      if (!newNode.title) return console.log("title required");
      if (newNode.nodeType === "Question" && !Boolean(newNode.choices.length)) return console.log("choices required");

      if (/*newNode.nodeType !== "" &&*/ newNodeId) {
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
            setIsSubmitting(true);
            getMapGraph("/proposeChildNode", postData);
            scrollToNode(newNode.parents[0].node);
          }
        }
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
        // setNodes(oldNodes => {
        // if (selectedNode && "selectedNode" in oldNodes) {
        if (nodeBookState.selectedNode && nodeBookState.selectedNode in oldNodes) {
          // setIsAdmin(oldNodes[selectedNode].admin === username);
          setIsAdmin(oldNodes[nodeBookState.selectedNode].admin === user.uname);
        }
        return { nodes: oldNodes, edges };
        // });
      });
      const { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl } = getTypedCollections(
        db,
        selectedNodeType
      );
      // getTypedCollections(firebase.db, selectedNodeType);

      if (!versionsColl || !userVersionsColl || !versionsCommentsColl || !userVersionsCommentsColl) return;

      // const versionsQuery = versionsColl
      //   .where("node", "==", selectedNode)
      //   .where("deleted", "==", false);

      const versionsQuery = query(
        versionsColl,
        where("node", "==", nodeBookState.selectedNode),
        where("deleted", "==", false)
      );

      // const versionsData = await versionsQuery.get();
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
        // userVersionsRefs.push(
        //   userVersionsColl
        //   .where("version", "==", versionDoc.id)
        //   .where("user", "==", username)
        // );
        const versionsCommentsQuery = query(
          versionsCommentsColl,
          where("version", "==", versionDoc.id),
          where("deleted", "==", false)
        );
        versionsCommentsRefs.push(versionsCommentsQuery);
        // versionsCommentsRefs.push(
        //   versionsCommentsColl
        //.where("version", "==", versionDoc.id)
        //.where("deleted", "==", false)
        // );
      });

      if (userVersionsRefs.length > 0) {
        await Promise.all(
          userVersionsRefs.map(async userVersionsRef => {
            // const userVersionsDocs = await userVersionsRef.get();
            const userVersionsDocs = await getDocs(userVersionsRef);
            userVersionsDocs.forEach(userVersionsDoc => {
              const userVersion = userVersionsDoc.data();
              versionId = userVersion.version;
              delete userVersion.version;
              delete userVersion.updatedAt;
              delete userVersion.createdAt;
              delete userVersion.user;
              versions[versionId] = {
                ...versions[versionId],
                ...userVersion,
              };
            });
          })
        );
      }

      // console.log("[fetch proposals]: get versionsCommentsRefs");

      if (versionsCommentsRefs.length > 0) {
        await Promise.all(
          versionsCommentsRefs.map(async versionsCommentsRef => {
            // const versionsCommentsDocs = await versionsCommentsRef.get();
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

              // userVersionsCommentsRefs.push(
              //   userVersionsCommentsColl
              //     .where("versionComment", "==", versionsCommentsDoc.id)
              //     .where("user", "==", username)
              // );
            });
          })
        );

        // console.log("[fetch proposals]: get userVersionsCommentsRefs");

        if (userVersionsCommentsRefs.length > 0) {
          await Promise.all(
            userVersionsCommentsRefs.map(async userVersionsCommentsRef => {
              // const userVersionsCommentsDocs = await userVersionsCommentsRef.get();
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
      // for (let comment of Object.values(comments)) {
      //   versionId = comment.version;
      //   delete comment.version;
      //   versions[versionId].comments.push(comment);
      // }
      Object.values(comments).forEach((comment: any) => {
        versionId = comment.version;
        delete comment.version;
        versions[versionId].comments.push(comment);
      });
      const proposalsTemp = Object.values(versions);
      const orderedProposals = proposalsTemp.sort(
        (a: any, b: any) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
      );

      // console.log("orderedProposals", orderedProposals);
      setProposals(orderedProposals);
      setIsRetrieving(false);
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.uname, nodeBookState.selectedNode, selectedNodeType]
  );

  /////////////////////////////////////////////////////
  // Inner functions
  const selectProposal = useMemoizedCallback(
    (event, proposal) => {
      if (!user?.uname) return;
      // const selectedNode = nodeBookState.selectedNode;
      event.preventDefault();
      setOpenProposal(proposal.id);
      reloadPermanentGraph();
      // console.log("----------->> beafore graph");
      const newNodeId = newId();
      setGraph(({ nodes: oldNodes, edges }) => {
        // console.log("----------->> after graph");
        if (!nodeBookState.selectedNode) return { nodes: oldNodes, edges };
        if (!(nodeBookState.selectedNode in changedNodes)) {
          changedNodes[nodeBookState.selectedNode] = copyNode(oldNodes[nodeBookState.selectedNode]);
        }
        const thisNode = copyNode(oldNodes[nodeBookState.selectedNode]);
        // console.log("proposal", proposal);
        if ("childType" in proposal && proposal.childType !== "") {
          //here builds de child proposal and draws it
          tempNodes.add(newNodeId);
          const newChildNode: any = {
            unaccepted: true,
            isStudied: false,
            bookmarked: false,
            // id: newNodeId,
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
          // console.log("typechild", 2, newChildNode);
          let newNodes = { ...oldNodes };
          let newEdges: any = { ...edges };
          const nodeN = g.current.node(newNodeId);
          // ------------------- this is required to simulate pure function
          if (!nodeN) {
            // console.log("set dag Node", nodeN);
            newNodes = setDagNode(g.current, newNodeId, newChildNode, newNodes, allTags, null);
            newEdges = setDagEdge(g.current, nodeBookState.selectedNode, newNodeId, { label: "" }, { ...newEdges });
          } else {
            // add node
            const newNode = copyNode(newChildNode);
            newNodes[newNodeId] = newNode;

            // add edge
            const from = nodeBookState.selectedNode;
            const to = newNodeId;
            if (g.current.hasNode(from) && g.current.hasNode(to)) {
              const edgeId = from + "-" + to;
              newEdges[edgeId] = { label: "" };
            }
          }
          // << ----------------
          setTimeout(() => {
            scrollToNode(newNodeId);
          }, 1500);
          // console.log("typechild", 3, { newNodes, newEdges });
          return { nodes: newNodes, edges: newEdges };
          // return setDagNode(newNodeId, newChildNode, { ...oldNodes }, () => {
          //   setEdges(oldEdges => {
          //     return setDagEdge(selectedNode, newNodeId, { label: "" }, { ...oldEdges });
          //   });
          //   setMapChanged(true);
          // });
        } else {
          // improvments
          //here builds the proposal
          const oldEdges = compareAndUpdateNodeLinks(g.current, thisNode, nodeBookState.selectedNode, proposal, edges);
          // setEdges(oldEdges => {
          //   return compareAndUpdateNodeLinks(thisNode, selectedNode, proposal, {
          //     ...oldEdges,
          //   });
          // });
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
          // setMapChanged(true);
          const newNodes = setDagNode(g.current, nodeBookState.selectedNode, thisNode, oldNodes, allTags, null);
          // return setDagNode(selectedNode, thisNode, { ...oldNodes }, null);
          return { nodes: newNodes, edges: oldEdges };
        }
      });
      if (nodeBookState.selectedNode) scrollToNode(nodeBookState.selectedNode);
    },
    [user?.uname, nodeBookState.selectedNode, allTags, reloadPermanentGraph]
  );

  const deleteProposal = useCallback(
    async (event: any, proposals: any, setProposals: any, proposalId: string, proposalIdx: number) => {
      if (!choosingNode) {
        if (!nodeBookState.selectedNode) return;
        reloadPermanentGraph();
        const postData = {
          versionId: proposalId,
          nodeType: selectedNodeType,
          nodeId: nodeBookState.selectedNode,
        };
        setIsSubmitting(true);
        await postWithToken("/deleteVersion", postData);
        // let responseObj;
        // try {
        //   await firebase.idToken();
        //   responseObj = await axios.post("/deleteVersion", postData);
        // } catch (err) {
        //   console.error(err);
        //   // window.location.reload();
        // }
        let proposalsTemp = [...proposals];
        proposalsTemp.splice(proposalIdx, 1);
        setProposals(proposalsTemp);
        setIsSubmitting(false);
        scrollToNode(nodeBookState.selectedNode);
      }
      // event.currentTarget.blur();
    },
    [choosingNode, nodeBookState.selectedNode, reloadPermanentGraph, scrollToNode, selectedNodeType]
  );
  const mapContentMouseOver = useCallback((event: any) => {
    if (
      // event.target.tagName.toLowerCase() === "input" || // CHECK <-- this was commented
      // event.target.tagName.toLowerCase() === "textarea" ||  // CHECK <-- this was commented
      // event.target.className.includes("EditableTextarea") ||
      // event.target.className.includes("HyperEditor") ||
      // event.target.className.includes("CodeMirror") ||
      // event.target.className.includes("cm-math") ||
      // event.target.parentNode.className.includes("CodeMirror")
      // event.target.className === "ClusterSection" || // CHECK <-- this was uncommented
      event.target?.parentNode?.parentNode?.getAttribute("id") !== "MapContent"
      // event.currentTarget.id !== "MapContent" // CHECK <-- this was uncommented
    ) {
      setMapHovered(true);
    } else {
      setMapHovered(false);
    }
  }, []);

  // const setNodeParts = useMemoizedCallback((nodeId, innerFunc) => {
  //   // console.log("In setNodeParts");
  //   setNodes(oldNodes => {
  //     // setSelectedNode(nodeId);
  //     setSelectedNodeType(oldNodes[nodeId].nodeType);
  //     const thisNode = { ...oldNodes[nodeId] };
  //     return {
  //       ...oldNodes,
  //       [nodeId]: innerFunc(thisNode),
  //     };
  //   });
  // }, []);

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
      // console.log("[UPLOAD NODE IMAGES]");
      const storage = getStorage();
      if (!isUploading && !choosingNode) {
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

            // const formData = {
            //   file: event.target.files[0],
            // };
            // const { imageUrl } = await postImageWithToken("/uploadImage", formData);
            // await imageLoaded(imageUrl);
            // setIsSubmitting(false);
            // setIsUploading(false);

            // if (imageUrl && imageUrl !== "") {
            //   setNodeParts(nodeId, (thisNode: any) => {
            //     thisNode.nodeImage = imageUrl;
            //     return { ...thisNode };
            //   });
            // }

            // const rootURL = "https://storage.googleapis.com/onecademy-dev.appspot.com/"
            const picturesFolder = "UploadedImages/";
            const imageNameSplit = image.name.split(".");
            const imageExtension = imageNameSplit[imageNameSplit.length - 1];
            let imageFileName = user.userId + "/" + new Date().toUTCString() + "." + imageExtension;

            // console.log("picturesFolder + imageFileName", picturesFolder + imageFileName);
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
                // console.log("storageRef", storageRef);
                const imageGeneratedUrl = await getDownloadURL(storageRef);
                const imageUrlFixed = addSuffixToUrlGMT(imageGeneratedUrl, "_430x1300");
                // console.log("---> imageGeneratedUrl", imageUrlFixed);
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
    [user, choosingNode, setNodeParts]
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
      award: any
    ) => {
      devLog("RATE PROPOSAL", { proposals, setProposals, proposalId, proposalIdx, correct, wrong, award });
      // console.log("[RATE PROPOSAL]");
      if (!user) return;

      if (!choosingNode) {
        // reloadPermanentGraph();
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
        };
        setIsSubmitting(true);
        // let responseObj;
        try {
          await Post("/rateVersion", postData);
        } catch (error) {
          console.error(error);
          setIsSubmitting(false);
        }
        // try {
        //   await idToken();
        //   /*responseObj = */ await axios.post("/rateVersion", postData);
        // } catch (err) {
        //   console.error(err);
        //   // window.location.reload();
        // }
        setGraph(({ nodes: oldNodes, edges }) => {
          if (!nodeBookState.selectedNode) return { nodes: oldNodes, edges };
          if (
            proposalsTemp[proposalIdx].corrects - proposalsTemp[proposalIdx].wrongs >=
            (oldNodes[nodeBookState.selectedNode].corrects - oldNodes[nodeBookState.selectedNode].wrongs) / 2
          ) {
            proposalsTemp[proposalIdx].accepted = true;
            if ("childType" in proposalsTemp[proposalIdx] && proposalsTemp[proposalIdx].childType !== "") {
              reloadPermanentGraph();
            }
          }
          setProposals(proposalsTemp);
          return { nodes: oldNodes, edges };
        });
        // setNodes(oldNodes => {
        //   if (
        //     proposalsTemp[proposalIdx].corrects - proposalsTemp[proposalIdx].wrongs >=
        //     (oldNodes[sNode.id].corrects - oldNodes[sNode].wrongs) / 2
        //   ) {
        //     proposalsTemp[proposalIdx].accepted = true;
        //     if ("childType" in proposalsTemp[proposalIdx] && proposalsTemp[proposalIdx childType !== "") {
        //       reloadPermanentGraph();
        //     }
        //   }
        //   setProposals(proposalsTemp);
        //   return oldNodes;
        // });

        setIsSubmitting(false);
        // scrollToNode(sNode);
      }
      // event.currentTarget.blur();
    },
    // TODO: CHECK dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, choosingNode, selectedNodeType, reloadPermanentGraph]
  );
  const removeImage = useCallback(
    (nodeRef: any, nodeId: string) => {
      // console.log("In removeImage");
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

  return (
    <div className="MapContainer">
      <Box
        id="Map"
        sx={{
          background:
            settings.background === "Color"
              ? theme =>
                  settings.theme === "Dark" ? theme.palette.common.darkGrayBackground : theme.palette.common.white
              : undefined,
        }}
      >
        {nodeBookState.choosingNode && <div id="ChoosingNodeMessage">Click the node you'd like to link to...</div>}
        <Box sx={{ width: "100vw", height: "100vh" }}>
          {process.env.NODE_ENV === "development" && (
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
                {/* <Button onClick={() => console.log(nodeToImprove)}>nodeToImprove</Button> */}
                <Button onClick={() => console.log(allNodes)}>All Nodes</Button>
                <Button onClick={() => console.log(citations)}>citations</Button>
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
              </Box>
            </Drawer>
          )}
          <MemoizedSidebar
            proposeNodeImprovement={proposeNodeImprovement}
            fetchProposals={fetchProposals}
            rateProposal={rateProposal}
            openLinkedNode={openLinkedNode}
            selectProposal={selectProposal}
            deleteProposal={deleteProposal}
            closeSideBar={closeSideBar}
            proposeNewChild={proposeNewChild}
            // --------------------------- others
            selectionType={nodeBookState.selectionType}
            selectedUser={selectedUser}
            reloadPermanentGrpah={reloadPermanentGraph}
            // showClusters={showClusters}
            // setShowClusters={setShowClusters}
            pendingProposalsLoaded={pendingProposalsLoaded}
            setPendingProposalsLoaded={setPendingProposalsLoaded}
            openProposal={openProposal}
            citations={citations}
            selectedNode={nodeBookState.selectedNode}
            // ------------------- flags
            setOpenPendingProposals={setOpenPendingProposals}
            openPendingProposals={openPendingProposals}
            setOpenChat={setOpenChat}
            setOpenNotifications={setOpenNotifications}
            openNotifications={openNotifications}
            setOpenPresentations={setOpenPresentations}
            setOpenToolbar={
              /*setOpenToolbar*/ (newValue: boolean) => nodeBookDispatch({ type: "setOpenToolbar", payload: newValue })
            }
            openToolbar={nodeBookState.openToolbar}
            setOpenSearch={setOpenSearch}
            openSearch={openSearch}
            setOpenBookmarks={setOpenBookmarks}
            openBookmarks={openBookmarks}
            setOpenRecentNodes={setOpenBookmarks}
            setOpenTrends={setOpenTrends}
            openTrends={openTrends}
            setOpenMedia={setOpenMedia}
            allNodes={allNodes}
            mapRendered={true}
            scrollToNode={scrollToNode}
          />
          <MemoizedCommunityLeaderboard userTagId={user?.tagId ?? ""} pendingProposalsLoaded={pendingProposalsLoaded} />
          {process.env.NODE_ENV === "development" && (
            <Box
              sx={{
                position: "fixed",
                top: "10px",
                right: "10px",
                zIndex: "1300",
                background: "#123",
                color: "white",
              }}
            >
              <Box sx={{ border: "dashed 1px royalBlue" }}>
                <Typography>Queue Workers {isQueueWorking ? "⌛" : ""}</Typography>
                {queue.map(cur => (cur ? ` 👷‍♂️ ${cur.height} ` : ` 🚜 `))}
              </Box>
              <Box sx={{ border: "dashed 1px royalBlue" }}>
                <Typography>SN: {nodeBookState.selectedNode}</Typography>
                <Typography>scrollToNodeInitialized: {scrollToNodeInitialized.current ? "T" : "F"}</Typography>
              </Box>
              {/* <Box>
                Edges:
                {Object.keys(graph.edges).map(
                  k => `${graph.edges[k].fromX},${graph.edges[k].fromY} -> ${graph.edges[k].toX},${graph.edges[k].toY}`
                )}
              </Box> */}
              <Box sx={{ float: "right" }}>
                <Tooltip title={"Watch geek data"}>
                  <>
                    <IconButton onClick={() => setOpenDeveloperMenu(!openDeveloperMenu)}>
                      <CodeIcon color="warning" />
                    </IconButton>
                  </>
                </Tooltip>
              </Box>
            </Box>
          )}

          {/* end Data from map */}
          {settings.view === "Graph" && (
            <Box
              id="MapContent"
              className={scrollToNodeInitialized.current ? "ScrollToNode" : undefined}
              onMouseOver={mapContentMouseOver}
            >
              <MapInteractionCSS
                textIsHovered={mapHovered}
                /*identifier={'xdf'}*/
                value={mapInteractionValue}
                onChange={navigateWhenNotScrolling}
              >
                {/* {showClusters && <ClustersList clusterNodes={clusterNodes} />} */}
                <MemoizedLinksList edgeIds={edgeIds} edges={graph.edges} selectedRelation={selectedRelation} />
                <MemoizedNodeList
                  nodes={graph.nodes}
                  bookmark={bookmark}
                  markStudied={markStudied}
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
                  saveProposedChildNode={saveProposedChildNode}
                  saveProposedImprovement={saveProposedImprovement}
                  closeSideBar={closeSideBar}
                  reloadPermanentGrpah={reloadPermanentGraph}
                  setNodeParts={setNodeParts}
                  citations={citations}
                />
              </MapInteractionCSS>
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
                {(isSubmitting || (!queueFinished && firstLoading && Object.keys(graph.nodes).length)) && (
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
                {!Object.keys(graph.nodes).length && (
                  <>
                    <div id="ChoosingNodeMessage">
                      <p style={{ color: "orange", textAlign: "center" }}>You don't have visible nodes yet</p>
                      <p>Please open nodes using searching bar</p>
                    </div>
                  </>
                )}
              </Suspense>

              {/* // <Modal onClick={closedSidebarClick("Media")}>
              //   <MapInteractionCSS>
              //     <img src={openMedia} alt="Node image" className="responsive-img" />
              //   </MapInteractionCSS>
            </Modal> */}
            </Box>
          )}

          {settings.view === "Masonry" && (
            <Box sx={{ height: "100vh", overflow: "auto" }}>
              <Container>
                <Masonry sx={{ my: 4, mx: { md: "0px" } }} columns={{ xm: 1, md: 2 }} spacing={4} defaultHeight={450}>
                  {/* {isLoading && renderLoadingSkeletons()} */}

                  {Object.keys(graph.nodes)
                    .map(key => graph.nodes[key])
                    .map(fullNode => {
                      console.log("fullNode", fullNode);
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
