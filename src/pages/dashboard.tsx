import { Button, Drawer, Modal } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import dagre from "dagre";
import {
  collection,
  doc,
  DocumentChange,
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
import { useCallback, useEffect, useRef, useState } from "react";
/* eslint-disable */
// @ts-ignore
import { MapInteractionCSS } from "react-map-interaction";
import { boolean } from "yup";

/* eslint-enable */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAuth } from "@/context/AuthContext";
import { useTagsTreeView } from "@/hooks/useTagsTreeView";

import { LinksList } from "../components/map/LinksList";
import NodesList from "../components/map/NodesList";
import { MemoizedSidebar } from "../components/map/Sidebar/Sidebar";
import { NodeBookProvider, useNodeBook } from "../context/NodeBookContext";
import { useMemoizedCallback } from "../hooks/useMemoizedCallback";
import { NodeChanges } from "../knowledgeTypes";
import { idToken } from "../lib/firestoreClient/auth";
import { postWithToken } from "../lib/mapApi";
import { dagreUtils } from "../lib/utils/dagre.util";
import { getTypedCollections } from "../lib/utils/getTypedCollections";
import { JSONfn } from "../lib/utils/jsonFn";
import {
  changedNodes,
  compare2Nodes,
  compareAndUpdateNodeLinks,
  compareChoices,
  compareFlatLinks,
  compareLinks,
  compareProperty,
  copyNode,
  createOrUpdateNode,
  // dag1,
  hideNodeAndItsLinks,
  makeNodeVisibleInItsLinks,
  MAP_RIGHT_GAP,
  MIN_CHANGE,
  NODE_HEIGHT,
  NODE_WIDTH,
  removeDagAllEdges,
  removeDagNode,
  setDagEdge,
  setDagNode,
  setNewParentChildrenEdges,
  tempNodes,
  XOFFSET,
  YOFFSET,
} from "../lib/utils/Map.utils";
import { newId } from "../lib/utils/newid";
import { ChoosingType, OpenPart, UserNodes, UserNodesData } from "../nodeBookTypes";
import { FullNodeData, NodeFireStore, NodesData, UserNodeChanges } from "../noteBookTypes";
import { NodeType } from "../types";

type DashboardProps = {};

/**
 * 1. NODES CHANGES - LISTENER with SNAPSHOT
 *      Type: useEffect
 *     - Get UserNodesData (userNodeChanges)
 *     - Get NodeData for every userNode
 *     - Build Full Nodes (Merge nodeData and userNodeData)
 *     - SYNCHRONIZATION: merge FullNodes into Nodes
 *         Type: useEffect
 *         Flag: nodeChanges || userNodeChanges
 *         Description: will use [nodeChanges] or [userNodeChanges] to get [nodes] updated
 *
 *  --- render nodes, every node will call NODE CHANGED
 *
 *  4. NODE CHANGED: (n)
 *      Type: function
 *
 *  3. WORKER: (n)
 *      Type: useEffect
 *      Flag: mapChanged
 *      Description: will calculate the [nodes] and [edges] positions
 *
 *  --- render nodes, every node will call NODE CHANGED
 */
const Dashboard = ({}: DashboardProps) => {
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // GLOBAL STATES
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  const { nodeBookState, nodeBookDispatch } = useNodeBook();
  const [{ user }] = useAuth();
  const [allTags, , allTagsLoaded] = useTagsTreeView();
  const db = getFirestore();
  // node that user is currently selected (node will be highlighted)
  const [sNode, setSNode] = useState(null); //<--- this was with recoil
  // id of node that will be modified by improvement proposal when entering state of selecting specific node (for tags, references, child and parent links)
  const [choosingNode, setChoosingNode] = useState(null); //<--- this was with recoil
  // // node that is in focus (highlighted)
  // const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // LOCAL STATES
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  // used for triggering useEffect after nodes or usernodes change
  const [userNodeChanges, setUserNodeChanges] = useState<UserNodes[]>([]);
  const [nodeChanges, setNodeChanges] = useState<NodeChanges[]>([]);
  const [mapChanged, setMapChanged] = useState(false);
  // two collections (tables) in database, nodes and usernodes
  // nodes: collection of all data of each node
  // usernodes: collection of all data about each interaction between user and node
  // (ex: node open, hidden, closed, hidden, etc.) (contains every user with every node interacted with)
  // nodes: dictionary of all nodes visible on map for specific user
  const [nodes, setNodes] = useState<{ [key: string]: FullNodeData }>({});
  // edges: dictionary of all edges visible on map for specific user
  const [edges, setEdges] = useState<{ [key: string]: any }>({});
  // const [nodeTypeVisibilityChanges, setNodeTypeVisibilityChanges] = useState([]);

  const nodeRef = useRef<{ [key: string]: FullNodeData } | null>(null);
  const edgesRef = useRef<{ [key: string]: any } | null>(null);

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
  const [clusterNodes, setClusterNodes] = useState({});

  // flag for when scrollToNode is called
  const [scrollToNodeInitialized, setScrollToNodeInitialized] = useState(false);

  // link that is currently selected
  const [selectedRelation, setSelectedRelation] = useState<string | null>(null);

  // node type that is currently selected
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType | null>(null);

  // selectedUser is the user whose profile is in sidebar (such as through clicking a user icon through leaderboard or on nodes)
  const [selectedUser, setSelectedUser] = useState(null);

  // proposal id of open proposal (proposal whose content and changes reflected on the map are shown)
  const [openProposal, setOpenProposal] = useState<string | boolean>(false);

  // when proposing improvements, lists of added/removed parent/child links
  const [addedParents, setAddedParents] = useState<string[]>([]);
  const [addedChildren, setAddedChildren] = useState<string[]>([]);
  const [removedParents, setRemovedParents] = useState<string[]>([]);
  const [removedChildren, setRemovedChildren] = useState<string[]>([]);

  const g = useRef(dagreUtils.createGraph());

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
  const [openProposals, setOpenProposals] = useState(false);

  // flag for if pending proposals for a selected node is open
  const [openPendingProposals, setOpenPendingProposals] = useState(false);

  // flag for if chat is open
  const [openChat, setOpenChat] = useState(false);

  // flag for if notifications is open
  const [openNotifications, setOpenNotifications] = useState(false);

  // flag for if presentations is open
  const [openPresentations, setOpenPresentations] = useState(false);

  // flag for is search is open
  const [openToolbar, setOpenToolbar] = useState(false);

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

  const [nodeToImprove,setNodeToImprove] = useState<FullNodeData|null>(null);

  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // FUNCTIONS
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  useEffect(() => {
    if (!db) return;
    if (!user) return;
    if (!allTagsLoaded) return;

    const userNodesRef = collection(db, "userNodes");
    const q = query(
      userNodesRef,
      where("user", "==", user.uname),
      where("visible", "==", true),
      where("deleted", "==", false)
    );

    const killSnapshot = snapshot(q, nodes);
    return () => {
      killSnapshot();
    };
  }, [allTags, allTagsLoaded, db, user]);

  const snapshot = useCallback(
    (q: Query<DocumentData>, node: any) => {
      const getUserNodeChanges = (docChanges: DocumentChange<DocumentData>[]): UserNodeChanges[] => {
        // const docChanges = snapshot.docChanges();
        // if (!docChanges.length) return null

        return docChanges.map(change => {
          const userNodeData: UserNodesData = change.doc.data() as UserNodesData;
          return {
            cType: change.type,
            uNodeId: change.doc.id,
            uNodeData: userNodeData,
          };
        });
      };

      const getNodes = async (nodeIds: string[]): Promise<NodesData[]> => {
        console.log("[GET NODES]");
        const nodeDocsPromises = nodeIds.map((nodeId, idx) => {
          const nodeRef = doc(db, "nodes", nodeId);
          return getDoc(nodeRef);
        });

        const nodeDocs = await Promise.all(nodeDocsPromises);

        return nodeDocs.map(nodeDoc => {
          if (!nodeDoc.exists()) return null;

          const nData: NodeFireStore = nodeDoc.data() as NodeFireStore;
          if (nData.deleted) return null;

          return {
            cType: "added",
            nId: nodeDoc.id,
            nData,
          };
        });
      };

      const buildFullNodes = (userNodesChanges: UserNodeChanges[], nodesData: NodesData[]): FullNodeData[] => {
        console.log("[BUILD FULL NODES]");
        const findNodeDataById = (id: string) => nodesData.find(cur => cur && cur.nId === id);
        const res = userNodesChanges
          .map(cur => {
            const nodeDataFound = findNodeDataById(cur.uNodeData.node);

            if (!nodeDataFound) return null;

            const fullNodeData: FullNodeData = {
              ...cur.uNodeData, // User node data
              ...nodeDataFound.nData, // Node Data
              userNodeId: cur.uNodeId,
              nodeChangeType: cur.cType,
              userNodeChangeType: nodeDataFound.cType,
              editable: false,
              left: 0,
              top: 0,
              firstVisit: cur.uNodeData.createdAt.toDate(),
              lastVisit: cur.uNodeData.updatedAt.toDate(),
              changedAt: nodeDataFound.nData.changedAt.toDate(),
              createdAt: nodeDataFound.nData.createdAt.toDate(),
              updatedAt: nodeDataFound.nData.updatedAt.toDate(),
              references: nodeDataFound.nData.references || [],
              referenceIds: nodeDataFound.nData.referenceIds || [],
              referenceLabels: nodeDataFound.nData.referenceLabels || [],
              tags: nodeDataFound.nData.tags || [],
              tagIds: nodeDataFound.nData.tagIds || [],
            };
            if (nodeDataFound.nData.nodeType !== "Question") {
              fullNodeData.choices = [];
            }
            fullNodeData.bookmarked = cur.uNodeData?.bookmarked || false;
            fullNodeData.nodeChanges = cur.uNodeData?.nodeChanges || null;

            return fullNodeData;
          })
          .flatMap(cur => cur || []);

        return res;
      };

      const fillDagre = (fullNodes: FullNodeData[], currentNodes: FullNodeData, currentEdges: any) => {
        console.log("[FILL DAGRE]", { currentNodes, currentEdges });
        // debugger
        return fullNodes.reduce(
          (acu: { newNodes: { [key: string]: any }; newEdges: { [key: string]: any } }, cur, idx) => {
            let tmpNodes = {};
            let tmpEdges = {};

            if (cur.nodeChangeType === "added") {
              const res = createOrUpdateNode(g.current, cur, cur.node, acu.newNodes, acu.newEdges, allTags);
              tmpNodes = res.oldNodes;
              tmpEdges = res.oldEdges;
            }
            if (cur.nodeChangeType === "modified") {
              const node = acu.newNodes[cur.node];
              // console.log('current node', node)
              const currentNode = {
                ...cur,
                left: node.left,
                top: node.top,
              }; // <----- IMPORTANT: Add positions data from node into cur.node to not set default position into center of screen
              // console.log('currentNode', currentNode)
              if (!compare2Nodes(cur, node)) {
                const res = createOrUpdateNode(g.current, currentNode, cur.node, acu.newNodes, acu.newEdges, allTags);
                tmpNodes = res.oldNodes;
                tmpEdges = res.oldEdges;
              }
            }
            if (cur.nodeChangeType === "removed") {
              if (g.current.hasNode(cur.node)) {
                g.current.nodes().forEach(function (v) {});
                g.current.edges().forEach(function (e) {});
                // PROBABLIY yoou need to add hideNodeAndItsLinks, to update children and parents nodes

                // !IMPORTANT, Don't change the order, first remove edges then nodes
                tmpEdges = removeDagAllEdges(g.current, cur.node, acu.newEdges);
                tmpNodes = removeDagNode(g.current, cur.node, acu.newNodes);
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
      const userNodesSnapshot = onSnapshot(q, async snapshot => {
        const docChanges = snapshot.docChanges();
        if (!docChanges.length) return null;

        const userNodeChanges = getUserNodeChanges(docChanges);
        const nodeIds = userNodeChanges.map(cur => cur.uNodeData.node);
        const nodesData = await getNodes(nodeIds);
        const fullNodes = buildFullNodes(userNodeChanges, nodesData);
        const { newNodes, newEdges } = fillDagre(fullNodes, nodeRef.current, edgesRef.current);
        setNodes(newNodes);
        setEdges(newEdges);
        console.log("userNodesSnapshot:", { userNodeChanges, nodeIds, nodesData, fullNodes });
        setUserNodesLoaded(true);
      });
      return () => userNodesSnapshot();
    },
    [db, allTags]
  );

  useEffect(() => {
    nodeRef.current = nodes;
  }, [nodes]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const reloadPermanentGrpah = useMemoizedCallback(() => {
    console.log("[RELOAD PERMANENT GRAPH]");
    // debugger
    let oldNodes = nodes;
    let oldEdges = edges;
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
    setEdges(oldEdges);
    setNodes(oldNodes);
    setMapChanged(true);
  }, [nodes, edges, allTags]);

  const resetAddedRemovedParentsChildren = useCallback(() => {
    // CHECK: this could be improve merging this 4 states in 1 state object
    // so we reduce the rerenders, also we can set only the empty array here
    setAddedParents(oldAddedParents => (oldAddedParents === [] ? oldAddedParents : []));
    setAddedChildren(oldAddedChildren => (oldAddedChildren === [] ? oldAddedChildren : []));
    setRemovedParents(oldRemovedParents => (oldRemovedParents === [] ? oldRemovedParents : []));
    setRemovedChildren(oldRemovedChildren => (oldRemovedChildren === [] ? oldRemovedChildren : []));
  }, []);

  const getMapGraph = useCallback(
    async (mapURL: string, postData: any = false) => {
      reloadPermanentGrpah();

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
          await postWithToken(mapURL, { ...postData, test: "test" });
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
  const scrollToNode = useCallback(
    (nodeId: string) => {
      if (!scrollToNodeInitialized) {
        setTimeout(() => {
          const originalNode = document.getElementById(nodeId);
          if (
            originalNode &&
            "offsetLeft" in originalNode &&
            originalNode.offsetLeft !== 0 &&
            "offsetTop" in originalNode &&
            originalNode.offsetTop !== 0
          ) {
            setScrollToNodeInitialized(true);
            setTimeout(() => {
              setScrollToNodeInitialized(false);
            }, 1300);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            setMapInteractionValue(oldValue => {
              // const translateLeft =
              //   (XOFFSET - originalNode.offsetLeft) * oldValue.scale;
              // const translateTop =
              //   (YOFFSET - originalNode.offsetTop) * oldValue.scale;
              return {
                scale: 0.94,
                translation: {
                  x: (window.innerWidth / 3.4 - originalNode.offsetLeft) * 0.94,
                  y: (window.innerHeight / 3.4 - originalNode.offsetTop) * 0.94,
                },
              };
            });
          } else {
            scrollToNode(nodeId);
          }
        }, 400);
      }
    },
    [scrollToNodeInitialized]
  );

  // // loads user nodes
  // // downloads all records of userNodes collection where user is authenticated user
  // // sets userNodeChanges
  // useEffect(() => {
  //   // if (firebase && allTagsLoaded && username) {
  //   const username = user?.uname;
  //   if (db && allTagsLoaded && username) {
  //     // Create the query to load the userNodes and listen for modifications.
  //     // const nodeRef = doc(db, "userNodes");

  //     const userNodesRef = collection(db, "userNodes");
  //     const q = query(
  //       userNodesRef,
  //       where("user", "==", username),
  //       where("visible", "==", true),
  //       where("deleted", "==", false)
  //     );

  //     const userNodesSnapshot = onSnapshot(q, snapshot => {
  //       setUserNodeChanges(oldUserNodeChanges => {
  //         let newUserNodeChanges: UserNodes[] = [...oldUserNodeChanges];
  //         const docChanges = snapshot.docChanges();
  //         if (docChanges.length > 0) {
  //           for (let change of docChanges) {

  //             const userNodeData: UserNodesData = change.doc.data() as UserNodesData;
  //             // only used for useEffect above
  //             newUserNodeChanges = [
  //               ...newUserNodeChanges,
  //               {
  //                 cType: change.type,
  //                 uNodeId: change.doc.id,
  //                 uNodeData: userNodeData
  //               }
  //             ];
  //           }
  //         }
  //         return newUserNodeChanges;
  //       });
  //     });

  //     // const userNodesQuery = db
  //     //   .collection("userNodes")
  //     //   .where("user", "==", username)
  //     //   .where("visible", "==", true)
  //     //   .where("deleted", "==", false);

  //     // // called whenever something changes and downloads the changes between the database and query
  //     // const userNodesSnapshot = userNodesQuery.onSnapshot(function (snapshot) {
  //     //   setUserNodeChanges((oldUserNodeChanges) => {
  //     //     const docChanges = snapshot.docChanges();
  //     //     if (docChanges.length > 0) {
  //     //       let newUserNodeChanges = [...oldUserNodeChanges];
  //     //       for (let change of docChanges) {
  //     //         const userNodeData = change.doc.data();
  //     //         // only used for useEffect above
  //     //         newUserNodeChanges.push({
  //     //           cType: change.type,
  //     //           uNodeId: change.doc.id,
  //     //           uNodeData: userNodeData,
  //     //         });
  //     //       }
  //     //     }
  //     //     return oldUserNodeChanges;
  //     //   });
  //     // });
  //     // before calling useEffect again or exiting useEffect
  //     return () => userNodesSnapshot();
  //   }
  //   // }, [allTagsLoaded, username]);
  // }, [allTagsLoaded, user]);

  // // SYNC NODES FUNCTION
  // // READ THIS!!!
  // // nodeChanges, userNodeChanges useEffect
  // useEffect(() => {

  //   const nodeUserNodeChangesFunc = async () => {
  //     // dictionary of all nodes visible on the user's map view
  //     let oldNodes: any = { ...nodes };
  //     // dictionary of all links/edges on the user's map view
  //     let oldEdges: any = { ...edges };
  //     // let typeVisibilityChanges = nodeTypeVisibilityChanges;
  //     // flag for if there are any changes to map
  //     let oldMapChanged = mapChanged;
  //     if (nodeChanges.length > 0) {
  //       for (let change of nodeChanges) {
  //         const nodeId = change.nId;
  //         let nodeData = change.nData;
  //         delete nodeData.deleted;
  //         if (nodeData.nodeType !== "Question") {
  //           nodeData.choices = [];
  //         }
  //         // addReference(nodeId, nodeData);
  //         if (change.cType === "added") {
  //           // debugger
  //           ({ oldNodes, oldEdges } = createOrUpdateNode(nodeData, nodeId, oldNodes, oldEdges, allTags));
  //           oldMapChanged = true;
  //         } else if (change.cType === "modified") {
  //           const node = oldNodes[nodeId];
  //           {
  //             // let isTheSame =
  //             //   node.changedAt.getTime() === nodeData.changedAt.toDate().getTime() &&
  //             //   node.admin === nodeData.admin &&
  //             //   node.aImgUrl === nodeData.aImgUrl &&
  //             //   node.fullname === nodeData.fullname &&
  //             //   node.chooseUname === nodeData.chooseUname &&
  //             //   node.comments === nodeData.comments &&
  //             //   node.title === nodeData.title &&
  //             //   node.content === nodeData.content &&
  //             //   node.corrects === nodeData.corrects &&
  //             //   node.maxVersionRating === nodeData.maxVersionRating &&
  //             //   node.nodeType === nodeData.nodeType &&
  //             //   node.studied === nodeData.studied &&
  //             //   node.bookmarks === nodeData.bookmarks &&
  //             //   node.versions === nodeData.versions &&
  //             //   node.viewers === nodeData.viewers &&
  //             //   node.wrongs === nodeData.wrongs;
  //             // // isTheSame = compareImages(nodeData, node, isTheSame);
  //             // isTheSame = isTheSame && compareProperty(nodeData, node, "nodeImage");
  //             // isTheSame = compareLinks(nodeData.tags, node.tags, isTheSame, false);
  //             // isTheSame = compareLinks(nodeData.references, node.references, isTheSame, false);
  //             // const childrenComparison = compareLinks(
  //             //   nodeData.children,
  //             //   node.children,
  //             //   true,
  //             //   false
  //             // );
  //             // const parentsComparison = compareLinks(nodeData.parents, node.parents, true, false);
  //             // isTheSame =
  //             //   childrenComparison &&
  //             //   parentsComparison &&
  //             //   compareChoices(nodeData, node, isTheSame);
  //           }
  //           if (!compare2Nodes(nodeData, node)) {
  //             nodeData = {
  //               ...node,
  //               ...nodeData,
  //               id: nodeId,
  //               createdAt: nodeData?.createdAt?.toDate(), //CHECK: I added thios vailadtion
  //               changedAt: nodeData.changedAt.toDate(),
  //               updatedAt: nodeData.updatedAt.toDate()
  //             };
  //             ({ oldNodes, oldEdges } = createOrUpdateNode(nodeData, nodeId, oldNodes, oldEdges, allTags));
  //             oldMapChanged = true;
  //           }
  //         }
  //       }
  //     }
  //     // We can take care of some userNodes from userNodeChanges,
  //     // but we should postpone some others to
  //     // handle them after we retrieve their corresponding node documents.
  //     // We store those that we handle in this round in this array.
  //     const handledUserNodeChangesIds: string[] = [];
  //     const nodeIds: string[] = [];

  //     if (userNodeChanges && userNodeChanges.length > 0) {
  //       let userNodeData: UserNodesData;
  //       // iterating through every change
  //       for (let userNodeChange of userNodeChanges) {
  //         // data of the userNode that is changed
  //         userNodeData = userNodeChange.uNodeData;
  //         // nodeId of userNode that is changed
  //         const nodeId = userNodeData.node;
  //         // debugger
  //         if (!userNodesLoaded) {
  //           nodeIds.push(nodeId);
  //         } else {
  //           handledUserNodeChangesIds.push(userNodeChange.uNodeId); // CHECK: move this line
  //           // if row is removed
  //           if (userNodeChange.cType === "removed") {
  //             // if graph includes nodeId, remove it
  //             if (g.current.hasNode(nodeId)) {
  //               oldEdges = removeDagAllEdges(nodeId, oldEdges);
  //               oldNodes = removeDagNode(nodeId, oldNodes);
  //               oldMapChanged = true;
  //             }
  //           } else {

  //             // change can be addition or modification (not removal) of document for the query on userNode table
  //             // modify change for allUserNodes
  //             userNodeData = {
  //               ...userNodeData, // CHECK: I Added this to complete all fields
  //               userNodeId: userNodeChange.uNodeId,
  //               correct: userNodeData.correct,
  //               wrong: userNodeData.wrong,
  //               isStudied: userNodeData.isStudied,
  //               // bookmarks were added later, so check if "bookmarked" exists
  //               bookmarked: "bookmarked" in userNodeData ? userNodeData.bookmarked : false,
  //               open: userNodeData.open,
  //               nodeChanges: "nodeChanges" in userNodeData ? userNodeData.nodeChanges : null,
  //               // toDate() converts firestore timestamp to JavaScript date object
  //               firstVisit: userNodeData.createdAt.toDate(),
  //               lastVisit: userNodeData.updatedAt.toDate(),
  //             };
  //             // specific for addition (in addition to code from 617-632)
  //             if (userNodeChange.cType === "added") {
  //               {
  //                 // if nodeId is already in allUserNodes but not in database
  //                 // for deleting duplicates
  //                 // ********************************************************
  //                 // An issue here needs to be investigated with deleting all userNodes or duplicating nodes.
  //                 // ********************************************************
  //                 // if (!realoadingAll && nodeId in oldAllUserNodes) {
  //                 //   // document just added to database
  //                 //   const userNodeDocs = await firebase.db
  //                 //     .collection("userNodes")
  //                 //     .where("node", "==", nodeId)
  //                 //     .where("user", "==", username)
  //                 //     .get();
  //                 //   if (userNodeDocs.docs.length > 1) {
  //                 //     let userNodeRef = firebase.db
  //                 //       .collection("userNodes")
  //                 //       .doc(userNodeDocs.docs[0].id);
  //                 //     // checks if "userNodeId" is already in allUserNodes, it would be a duplicate and deletes in the database
  //                 //     if (
  //                 //       "userNodeId" in oldAllUserNodes[nodeId] &&
  //                 //       oldAllUserNodes[nodeId].userNodeId &&
  //                 //       userNodeDocs.docs[0].id !== oldAllUserNodes[nodeId].userNodeId
  //                 //     ) {
  //                 //       // (older) document in database referring to same nodeId
  //                 //       userNodeRef = firebase.db
  //                 //         .collection("userNodes")
  //                 //         .doc(oldAllUserNodes[nodeId].userNodeId);
  //                 //       oldAllUserNodes = { ...oldAllUserNodes };
  //                 //     }
  //                 //     userNodeRef.delete();
  //                 //   }
  //                 //   // if added but not a duplicate
  //                 // } else {
  //               }
  //               // checks whether map is loaded then make changes
  //               if (mapRendered && g.current.hasNode(nodeId)) {
  //                 setTimeout(() => {
  //                   // scrolls to node if map is loaded
  //                   scrollToNode(nodeId);
  //                 }, 1000);
  //               }
  //               // }
  //             }

  //             // for both addition and modifications
  //             if (userNodeChange.cType === "added" || userNodeChange.cType === "modified") {
  //               // if data for the node is not loaded yet, do nothing
  //               if (!(nodeId in oldNodes)) {
  //                 nodeIds.push(nodeId);
  //                 continue;
  //               }
  //               // Compare the updatedAt attribute of this node in nodes state with updatedAt in nodeChanges,
  //               // and if the latter is greater, update nodeChanges.
  //               if (userNodeData.nodeChanges && userNodeData.nodeChanges.updatedAt > oldNodes[nodeId].updatedAt) {
  //                 setNodeChanges(oldNodeChanges => {
  //                   let newNodeChanges = [...oldNodeChanges];
  //                   newNodeChanges.push({
  //                     cType: "modified",
  //                     nId: userNodeData.node,
  //                     nData: userNodeData.nodeChanges
  //                   });
  //                   return newNodeChanges;
  //                 });
  //               }
  //               if (
  //                 // left: current state of userNode
  //                 // right: new state of userNode from the database
  //                 // checks whether any userNode attributes on map are different from corresponding userNode attributes from database
  //                 oldNodes[nodeId].correct !== userNodeData.correct ||
  //                 oldNodes[nodeId].wrong !== userNodeData.wrong ||
  //                 oldNodes[nodeId].isStudied !== userNodeData.isStudied ||
  //                 oldNodes[nodeId].bookmarked !== userNodeData.bookmarked ||
  //                 oldNodes[nodeId].open !== userNodeData.open
  //                 // oldNodes[nodeId].firstVisit !== userNodeData.firstVisit || // CHECK: I commented this
  //                 // oldNodes[nodeId].lastVisit !== userNodeData.lastVisit // CHECK: I commented this
  //               ) {
  //                 oldNodes[nodeId] = {
  //                   // load all data corresponsponding to the node on the map and userNode data from the database and add userNodeId for the change documentation
  //                   ...oldNodes[nodeId],
  //                   ...userNodeData
  //                 };
  //                 oldMapChanged = true;
  //               }
  //             }
  //           }
  //           // handledUserNodeChangesIds.push(userNodeChange.uNodeId);
  //         }
  //       }
  //     }
  //     // debugger
  //     if (!userNodesLoaded) {
  //       await getNodesData(nodeIds);
  //       // setTimeout is used for when the user proposes a child node and the proposal gets accepted, data for the created node and userNode come from the database to the client at the same time
  //       // setTimeout(() => {
  //       setUserNodesLoaded(true);
  //       // }, 400);
  //     } else {
  //       if (nodeIds.length > 0) {
  //         // Get the data for the nodes that are not loaded yet but their corresponding userNodes are loaded.
  //         // update nodeChanges (collection: nodes)-> it calls the worker -> it call the dagre -> we update the nodes
  //         await getNodesData(nodeIds);
  //       }
  //       if (handledUserNodeChangesIds.length > 0) {
  //         let oldUserNodeChanges = userNodeChanges.filter(uNObj => !handledUserNodeChangesIds.includes(uNObj.uNodeId));
  //         setUserNodeChanges(oldUserNodeChanges);
  //       }
  //       if (nodeChanges.length > 0 || handledUserNodeChangesIds.length > 0) {
  //         setNodes(oldNodes);
  //         setEdges(oldEdges);
  //         //  map changed fires another use effect that calls dagr
  //         //  which calculates the new location of nodes and errors
  //         // setMapChanged(oldMapChanged); // CHECK: I commented this to not call worker after render
  //         if (nodeChanges.length > 0) {
  //           // setNodeTypeVisibilityChanges(typeVisibilityChanges);
  //           setNodeChanges([]);
  //         }
  //       }
  //     }
  //   };

  //   if (nodeChanges.length > 0 || (userNodeChanges && userNodeChanges.length > 0)) {
  //     nodeUserNodeChangesFunc();
  //   }
  // }, [
  //   nodeChanges,
  //   userNodeChanges,
  //   // allNodes,
  //   allTags,
  //   // allUserNodes,
  //   user,
  //   userNodesLoaded,
  //   nodes,
  //   edges,
  //   // nodeTypeVisibilityChanges, // this was comment in iman code
  //   mapChanged
  // ]);

  // fire if map changed; responsible for laying out the knowledge map
  useEffect(() => {
    {
      // g.edges().map((e, idx) => {
      //   const edgeE = g.edge(e);
      //   const from = edgeE.points[0];
      //   const to = edgeE.points[2];
      //   const edgeIndex = edges.findIndex(edge => edge.from === e.v && edge.to === e.w);
      //   const newFromX = from.x + XOFFSET;
      //   const newFromY = from.y + YOFFSET;
      //   const newToX = to.x + XOFFSET;
      //   const newToY = to.y + YOFFSET;
      //   if (Math.abs(edges[edgeIndex].fromX - newFromX) >= MIN_CHANGE ||
      //       Math.abs(edges[edgeIndex].fromY - newFromY) >= MIN_CHANGE ||
      //       Math.abs(edges[edgeIndex].toX - newToX) >= MIN_CHANGE ||
      //       Math.abs(edges[edgeIndex].toY - newToY) >= MIN_CHANGE) {
      //     somethingChanged = true;
      //   }
      //   edges[edgeIndex].fromX = newFromX;
      //   edges[edgeIndex].fromY = newFromY;
      //   edges[edgeIndex].toX = newToX;
      //   edges[edgeIndex].toY = newToY;
      //   return null;
      // })
    }
console.log('[WORKER]',{
  mapChanged ,
  nodeChanges:nodeChanges.length === 0 ,
  userNodeChanges:userNodeChanges.length === 0 ,
  userNodesLoaded ,
  EdgesSync:Object.keys(edges).length === g.current.edgeCount(),
});
    if (
      mapChanged &&
      nodeChanges.length === 0 &&
      userNodeChanges.length === 0 &&
      // nodeTypeVisibilityChanges.length === 0 &&
      // (necessaryNodesLoaded && !mapRendered) ||
      userNodesLoaded &&
      // Object.keys(nodes).length + Object.keys(allTags).length === g.current.nodeCount() &&
      Object.keys(edges).length === g.current.edgeCount()
    ) {
      let mapChangedFlag = true;
      const oldClusterNodes = {};
      let oldMapWidth = mapWidth;
      let oldMapHeight = mapHeight;
      let oldNodes = { ...nodes };
      let oldEdges = { ...edges };

      const worker: Worker = new Worker(new URL("../workers/MapWorker.ts", import.meta.url));
      worker.postMessage({
        mapChangedFlag,
        oldClusterNodes,
        oldMapWidth,
        oldMapHeight,
        oldNodes,
        oldEdges,
        allTags,
        XOFFSET,
        YOFFSET,
        MIN_CHANGE,
        MAP_RIGHT_GAP,
        NODE_WIDTH,
        graph: dagreUtils.mapGraphToObject(g.current),
      });
      // worker.onerror = (err) => err;
      worker.onmessage = e => {
        const { mapChangedFlag, oldClusterNodes, oldMapWidth, oldMapHeight, oldNodes, oldEdges, graph } = e.data;
        const gg = dagreUtils.mapObjectToGraph(graph);
        console.log(" -- Dager updated by worker:", gg);

        worker.terminate();
        g.current = gg;
        setMapWidth(oldMapWidth);
        setMapHeight(oldMapHeight);
        setClusterNodes(oldClusterNodes);
        setNodes(oldNodes);
        setEdges(oldEdges);
        setMapChanged(mapChangedFlag);
        // setMapChanged(false)
        if (!mapRendered) {
          setTimeout(() => {
            let nodeToNavigateTo = null;
            if (
              "location" in window &&
              "pathname" in window.location &&
              window.location.pathname.length > 1 &&
              window.location.pathname[0] === "/"
            ) {
              const pathParts = window.location.pathname.split("/");
              if (pathParts.length === 4) {
                nodeToNavigateTo = pathParts[3];
              }
            }
            // navigate to node that is identified in the URL
            if (nodeToNavigateTo) {
              openLinkedNode(nodeToNavigateTo);
              // Navigate to node that the user interacted with the last time they used 1Cademy.
            } else if (sNode) {
              openLinkedNode(sNode);
            } else {
              //  redirect to the very first node that is loaded
              scrollToNode(Object.keys(nodes)[0]);
            }
            setMapRendered(true);
            // setMap
          }, 10);
        }
      };
    }
  }, [
    // necessaryNodesLoaded,
    // nodeTypeVisibilityChanges,
    userNodesLoaded,
    mapChanged,
    allTags,
    nodes,
    edges,
    mapWidth,
    mapHeight,
    userNodeChanges,
    nodeChanges,
  ]);

  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // NODE FUNCTIONS
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  //  useMemoizedCallback is used to solve nested setStates in react.
  //  allows for function memoization and most updated values
  // CHECK: mapRendered removed as flag
  const nodeChanged = useMemoizedCallback(
    (
      nodeRef: any,
      nodeId: string,
      content: string | null,
      title: string | null,
      imageLoaded: boolean,
      openPart: OpenPart
    ) => {
      console.log("[NODE_CHANGED]",nodeId);
      let currentHeight = NODE_HEIGHT;
      let newHeight = NODE_HEIGHT;
      let nodesChanged = false;
      if (/*mapRendered &&*/ nodeRef.current || content !== null || title !== null) {
        setNodes(oldNodes => {
          const node: any = { ...oldNodes[nodeId] };
          if (content !== null && node.content !== content) {
            node.content = content;
            nodesChanged = true;
          }
          if (title !== null && node.title !== title) {
            node.title = title;
            nodesChanged = true;
          }
          if (nodeRef.current) {
            const { current } = nodeRef;
            newHeight = current.offsetHeight;
            if ("height" in node && Number(node.height)) {
              currentHeight = Number(node.height);
            }
            if (
              (Math.abs(currentHeight - newHeight) >= MIN_CHANGE && (node.nodeImage === "" || imageLoaded)) ||
              ("open" in node && node.open && !node.openHeight) ||
              ("open" in node && !node.open && !node.closedHeight)
            ) {
              if (node.open) {
                node.height = newHeight;
                if (openPart === null) {
                  node.openHeight = newHeight;
                }
              } else {
                node.height = newHeight;
                node.closedHeight = newHeight;
              }
              nodesChanged = true;
            }
          }
          if (nodesChanged) {
            // console.log('node added in dag', { node })
            return setDagNode(g.current, nodeId, node, { ...oldNodes }, () => setMapChanged(true));
          } else {
            return oldNodes;
          }
        });
        setMapChanged(true);

        // CHECK
        // READ: the mapChangedFlag dont guaranty the worker execution execution
        // if some worker dont finish dont will change the
      }
    },
    //  referenced by pointer, so when these variables change, it will be updated without having to redefine the function
    [, /*mapRendered*/ allTags]
  );

  const chosenNodeChanged = useCallback(
    (nodeId: string) => {
      // if (!nodeBookState.choosingNode) return

      // if (nodeId === nodeBookState.choosingNode?.id && nodeBookState.chosenNode) {
      console.log("[CHOSEN_NODE_CHANGED]");
      setNodes(oldNodes => {
        // debugger
        if (!nodeBookState.choosingNode || !nodeBookState.chosenNode) return oldNodes;
        if (nodeId !== nodeBookState.choosingNode.id) return oldNodes;

        const thisNode = copyNode(oldNodes[nodeId]);
        const chosenNodeObj = copyNode(oldNodes[nodeBookState.chosenNode.id]);

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
            //   {
            //     node: nodeBookState.chosenNode.id,
            //     title: chosenNodeObj.title,
            //   },
            // ];
          } else if (nodeBookState.choosingNode.type === "Parent") {
            thisNode.parents = [
              ...thisNode.parents,
              {
                node: nodeBookState.chosenNode.id,
                title: chosenNodeObj.title,
                label: "",
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
              },
            ];
            if (removedParents.includes(nodeBookState.chosenNode.id)) {
              const chosenNodeId = nodeBookState.chosenNode.id;
              setRemovedParents(removedParents.filter((nId: string) => nId !== chosenNodeId));
            } else {
              const choosingNodeId = nodeBookState.choosingNode.id;
              setAddedParents(oldAddedParents => [...oldAddedParents, choosingNodeId]);
            }
            setEdges(oldEdges => {
              if (!nodeBookState.chosenNode || !nodeBookState.choosingNode) return oldEdges;
              return setDagEdge(
                g.current,
                nodeBookState.chosenNode.id,
                nodeBookState.choosingNode.id,
                { label: "" },
                { ...oldEdges }
              );
            });
          } else if (nodeBookState.choosingNode.type === "Child") {
            thisNode.children = [
              ...thisNode.children,
              {
                node: nodeBookState.chosenNode.id,
                title: chosenNodeObj.title,
                label: "",
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
              },
            ];
            setEdges(oldEdges => {
              if (!nodeBookState.chosenNode || !nodeBookState.choosingNode) return oldEdges;
              return setDagEdge(
                g.current,
                nodeBookState.choosingNode.id,
                nodeBookState.chosenNode.id,
                { label: "" },
                { ...oldEdges }
              );
            });
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
          scrollToNode(nodeId);
          setMapChanged(true);

          const res = {
            ...oldNodes,
            [nodeId]: thisNode,
            [chosenNode]: chosenNodeObj,
          };
          console.log("===>", { oldNodes, thisNode, chosenNodeObj, res });
          return {
            ...oldNodes,
            [nodeId]: thisNode,
            [chosenNode]: chosenNodeObj,
          };
        } else {
          return oldNodes;
        }
      });
    },
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
      console.log("[DELETE LINK]");
      setNodes(oNodes => {
        let oldNodes = { ...oNodes };
        const thisNode = copyNode(oldNodes[nodeId]);
        console.log("thisNode", thisNode);
        // debugger
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
            setEdges(oldEdges => {
              return removeDagEdge(g.current, parentId, nodeId, { ...oldEdges });
            });
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
            setEdges(oldEdges => {
              return removeDagEdge(g.current, nodeId, childId, { ...oldEdges });
            });
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
        scrollToNode(nodeId);
        oldNodes[nodeId] = thisNode;
        return oldNodes;
      });
    },
    [addedParents, removedParents, addedChildren, removedChildren]
  );

  const setNodeParts = useMemoizedCallback((nodeId, innerFunc:(thisNode:FullNodeData)=>FullNodeData) => {
    // console.log("In setNodeParts");
    setNodes(oldNodes => {
      // setSelectedNode(nodeId);
      setSelectedNodeType(oldNodes[nodeId].nodeType);
      const thisNode = { ...oldNodes[nodeId] };
      return {
        ...oldNodes,
        [nodeId]: innerFunc(thisNode),
      };
    });
  }, []);

  const recursiveOffsprings = useCallback((nodeId: string): any[] => {
    // CHECK: this could be improve changing recursive function to iterative
    // because the recursive has a limit of call in stack memory
    // debugger
    const children = g.current.successors(nodeId);
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
        setIsSubmitting(true);
        const offsprings = recursiveOffsprings(nodeId);
        // debugger
        const batch = writeBatch(db);
        try {
          for (let offsp of offsprings) {
            const thisNode = nodes[offsp];
            const { nodeRef, userNodeRef } = initNodeStatusChange(offsp, thisNode.userNodeId);
            const userNodeData = {
              changed: thisNode.changed,
              correct: thisNode.correct,
              createdAt: Timestamp.fromDate(thisNode.firstVisit),
              updatedAt: Timestamp.fromDate(new Date()),
              deleted: false,
              isStudied: thisNode.isStudied,
              bookmarked: "bookmarked" in thisNode ? thisNode.bookmarked : false,
              node: offsp,
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
            // await firebase.batchUpdate(nodeRef, changeNode);
            batch.update(nodeRef, changeNode);
            const userNodeLogRef = collection(db, "userNodesLog");
            // await firebase.batchSet(userNodeLogRef, userNodeLogData);
            batch.set(doc(userNodeLogRef), userNodeLogData);
          }
          // await firebase.commitBatch();
          await batch.commit();
          let oldNodes = { ...nodes };
          let oldEdges = edges;
          for (let offsp of offsprings) {
            ({ oldNodes, oldEdges } = hideNodeAndItsLinks(g.current, offsp, oldNodes, oldEdges));
          }
          // CHECK: I commented this because in the SYNC function it will update nodes and edges
          // setNodes(oldNodes);
          // setEdges(oldEdges);
        } catch (err) {
          console.error(err);
        }
        scrollToNode(nodeId);
        setIsSubmitting(false);
      }
    },
    [nodeBookState.choosingNode, nodes, recursiveOffsprings]
  );

  const openNodeHandler = useMemoizedCallback(
    async (nodeId: string) => {
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
            // console.log(' ---->> userNodeId', userNodeRef, userNodeId)
            userNodeData = {
              changed: true,
              correct: false,
              createdAt: Timestamp.fromDate(new Date()),
              updatedAt: Timestamp.fromDate(new Date()),
              // firstVisit: Timestamp.fromDate(new Date()),//CHECK
              // lastVisit: Timestamp.fromDate(new Date()),//CHECK
              // userNodeId: newId(),
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

          let oldNodes: { [key: string]: any } = { ...nodes };
          let oldEdges: { [key: string]: any } = { ...edges };
          // let oldAllNodes: any = { ...nodes };
          // let oldAllUserNodes: any = { ...nodeChanges };
          // if data for the node is loaded
          let uNodeData = {
            // load all data corresponsponding to the node on the map and userNode data from the database and add userNodeId for the change documentation
            ...nodes[nodeId],
            ...thisNode, // CHECK <-- I added this to have children, parents, tags properties
            ...userNodeData,
            open: true,
          };

          uNodeData[userNodeId] = userNodeId;
          ({ uNodeData, oldNodes, oldEdges } = makeNodeVisibleInItsLinks(
            // modify nodes and edges
            uNodeData,
            oldNodes,
            oldEdges
            // oldAllNodes
          ));

          // debugger
          ({ oldNodes, oldEdges } = createOrUpdateNode(
            // modify dagger
            g.current,
            uNodeData,
            nodeId,
            oldNodes,
            { ...oldEdges },
            allTags
          ));

          // CHECK: need to update the nodes and edges
          // to get the last changes from:
          //  makeNodeVisibleInItsLinks and createOrUpdateNode
          // setNodes(oldNodes)
          // setEdges(oldEdges)

          // oldAllNodes[nodeId] = uNodeData;
          // setNodes(oldAllNodes)
          // setNodes(oldNodes => ({ ...oldNodes, oldNodes[nodeId]}))
          // oldAllUserNodes = {
          //   ...oldAllUserNodes,
          //   [nodeId]: userNodeData,
          // };
          // await firebase.commitBatch();
          await batch.commit();
          scrollToNode(nodeId);
          //  there are some places when calling scroll to node but we are not selecting that node
          setTimeout(() => {
            nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
            // setSelectedNode(nodeId);
          }, 400);
        } catch (err) {
          console.error(err);
        }
      }
    },
    // CHECK: I commented allNode, I did'nt found where is defined
    [user, nodes, edges /*allNodes*/, , allTags /*allUserNodes*/]
  );

  const openLinkedNode = useCallback(
    (linkedNodeID: string) => {
      if (!nodeBookState.choosingNode) {
        let linkedNode = document.getElementById(linkedNodeID);
        if (linkedNode) {
          scrollToNode(linkedNodeID);
          setTimeout(() => {
            nodeBookDispatch({ type: "setSelectedNode", payload: linkedNodeID });
            // setSelectedNode(linkedNodeID);
          }, 400);
        } else {
          openNodeHandler(linkedNodeID);
        }
      }
    },
    [nodeBookState.choosingNode, openNodeHandler]
  );

  const getNodeUserNode = useCallback((nodeId: string, userNodeId: string) => {
    const nodeRef = doc(db, "nodes", nodeId);
    // const userNodeRef = doc(db, "userNodes", userNodeId);
    // let userNodeRef: DocumentReference<DocumentData> | null = null
    const userNodeRef = doc(db, "userNodes", userNodeId);
    // if (userNodeId) {
    // }//CHECK:We commented this
    return { nodeRef, userNodeRef };
  }, []);

  const initNodeStatusChange = useCallback(
    (nodeId: string, userNodeId: string) => {
      // setSelectedNode(nodeId);
      nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
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
      // reloadPermanentGrpah();
      return getNodeUserNode(nodeId, userNodeId);
    },
    [/*resetAddedRemovedParentsChildren, reloadPermanentGrpah,*/ getNodeUserNode]
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
        if (username) {
          // try {

          const thisNode = nodes[nodeId];
          const { nodeRef, userNodeRef } = initNodeStatusChange(nodeId, thisNode.userNodeId);

          const userNodeData = {
            changed: thisNode.changed || false,
            correct: thisNode.corrects,
            createdAt: Timestamp.fromDate(thisNode.firstVisit),
            updatedAt: Timestamp.fromDate(new Date()),
            deleted: false,
            isStudied: thisNode.studied,
            bookmarked: "bookmarked" in thisNode ? thisNode.bookmarked : false,
            node: nodeId,
            open: false,
            user: username,
            visible: false,
            wrong: thisNode.wrongs,
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
          // dagerInfo()
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
      }
    },
    [nodeBookState.choosingNode, user, nodes, edges, initNodeStatusChange /*navigateToFirstParent*/]
  );

  const toggleNode = useCallback(
    (event: any, nodeId: string) => {
      console.log("[TOGGLE_NODE]");

      // debugger
      if (!nodeBookState.choosingNode) {
        setNodes(oldNodes => {
          const thisNode = oldNodes[nodeId];
          console.log("[TOGGLE_NODE]", thisNode);
          const { nodeRef, userNodeRef } = initNodeStatusChange(nodeId, thisNode.userNodeId);
          const changeNode: any = {
            updatedAt: Timestamp.fromDate(new Date()),
          };
          if (thisNode.open && "openHeight" in thisNode) {
            changeNode.height = thisNode.openHeight;
          } else if ("closedHeight" in thisNode) {
            changeNode.closedHeight = thisNode.closedHeight;
          }
          console.log("update node");
          updateDoc(nodeRef, changeNode);
          // nodeRef.update(changeNode);
          console.log("update user node");
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
          console.log("update user node log");
          setDoc(doc(userNodeLogRef), userNodeLogData);
          return oldNodes;
        });
      }
      if (event) {
        event.currentTarget.blur();
      }
    },
    [nodeBookState.choosingNode, user, initNodeStatusChange]
  );

  const openNodePart = useCallback(
    (event: any, nodeId: string, partType: any, openPart: any, setOpenPart: any, tags: any) => {
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
          //   //i commented this two line untile we define the right states
          //   // selectionType !== "AcceptedProposals" &&
          //   // selectionType !== "Proposals"
          // ) {
          //   // setSelectedTags(tags);
          //   // setOpenRecentNodes(true);
          // }
        }
      }
    },
    [user, nodeBookState.choosingNode /*selectionType*/]
  );

  /**
   * This will update reference label and will update the required node
   * without call sync or worker (thats good)
   */
  const referenceLabelChange = useCallback(
    (event: any, nodeId: string, referenceIdx: number) => {
      console.log("[REFERENCE_LABEL_CHANGE]", { event, nodeId, referenceIdx });
      event.persist();
      const thisNode = { ...nodes[nodeId] };
      let referenceLabelsCopy = [...thisNode.referenceLabels];
      referenceLabelsCopy[referenceIdx] = event.target.value;
      thisNode.referenceLabels = referenceLabelsCopy;
      setNodes({ ...nodes, [nodeId]: thisNode });

      // setNodes((oldNodes) => {
      //   const thisNode = { ...oldNodes[nodeId] };
      //   thisNode.references = [...thisNode.references];
      //   thisNode.references[referenceIdx] = {
      //     // ...thisNode.references[referenceIdx],
      //     label: event.target.value,
      //   };
      //   return {
      //     ...oldNodes,
      //     [nodeId]: { ...thisNode },
      //   };
      // });
    },
    [nodes /*setNodeParts*/]
  );

  const markStudied = useCallback(
    (event: any, nodeId: string) => {
      if (!nodeBookState.choosingNode) {
        setNodes(oldNodes => {
          const thisNode = oldNodes[nodeId];
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
          return oldNodes;
        });
      }
      event.currentTarget.blur();
    },
    [nodeBookState.choosingNode, user, initNodeStatusChange]
  );

  const bookmark = useCallback(
    (event: any, nodeId: string) => {
      if (!nodeBookState.choosingNode) {
        setNodes(oldNodes => {
          const thisNode = oldNodes[nodeId];
          const { nodeRef, userNodeRef } = initNodeStatusChange(nodeId, thisNode.userNodeId);
          let bookmarks = 0;
          if ("bookmarks" in thisNode) {
            bookmarks = thisNode.bookmarks;
          }
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
          return oldNodes;
        });
      }
      event.currentTarget.blur();
    },
    [nodeBookState.choosingNode, user, initNodeStatusChange]
  );

  const correctNode = useCallback(
    (event: any, nodeId: string, nodeType: NodeType) => {
      if (!choosingNode) {
        // setSelectedNode(nodeId);
        nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
        // setSelectedNodeType(nodeType);
        setIsSubmitting(true);
        getMapGraph(`/correctNode/${nodeId}`);
      }
      event.currentTarget.blur();
    },
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
      // console.log('---------------> Event:',event);
      // event.currentTarget.blur(); // CHECK: I comment this, the current target is null
    },
    [nodeBookState.choosingNode, getMapGraph]
  );

  /////////////////////////////////////////////////////
  // Node Improvement Functions

  const changeTitle = useCallback(
    (nodeRef:any, nodeId:string, value:string) => {
      console.log("[CHANGE CHOICE]");
      setNodeParts(nodeId, (thisNode:FullNodeData) => {
        // const choices = [...thisNode.choices];
        // const choice = { ...choices[choiceIdx] };
        // choice.choice = value;
        // choices[choiceIdx] = choice;
        thisNode.title = value;
        return { ...thisNode };
      });
      // CHECK: I commented this and 
      // add dependency choices.length in Node to recall worker
      // adjustNodeHeight(nodeRef, nodeId)
    },
    [setNodeParts/*, adjustNodeHeight*/]
  );

  const changeChoice = useCallback(
    (nodeRef:any, nodeId:string, value:string, choiceIdx:number) => {
      console.log("[CHANGE CHOICE]");
      setNodeParts(nodeId, (thisNode:FullNodeData) => {
        const choices = [...thisNode.choices];
        const choice = { ...choices[choiceIdx] };
        choice.choice = value;
        choices[choiceIdx] = choice;
        thisNode.choices = choices;
        return { ...thisNode };
      });
      // CHECK: I commented this and 
      // add dependency choices.length in Node to recall worker
      // adjustNodeHeight(nodeRef, nodeId)
    },
    [setNodeParts/*, adjustNodeHeight*/]
  );

  const changeFeedback = useCallback(
    (nodeRef:any, nodeId:string, value:string, choiceIdx:number) => {
      console.log("[CHANGE FEEDBACK]");
      setNodeParts(nodeId, (thisNode:FullNodeData) => {
        const choices = [...thisNode.choices];
        const choice = { ...choices[choiceIdx] };
        choice.feedback = value;
        choices[choiceIdx] = choice;
        thisNode.choices = choices;
        return { ...thisNode };
      });
      // CHECK: I commented this and 
      // add dependency choices.length in Node to recall worker
      // adjustNodeHeight(nodeRef, nodeId)
    },
    [setNodeParts/*, adjustNodeHeight*/]
  );

  const switchChoice = useCallback(
    (nodeId:string, choiceIdx:number) => {
      console.log("[SWITCH CHOICE]");
      setNodeParts(nodeId, (thisNode:FullNodeData) => {
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
    (nodeRef:any, nodeId:string, choiceIdx:number) => {
      console.log("[DELETE CHOICE]");
      setNodeParts(nodeId, (thisNode:FullNodeData) => {
        const choices = [...thisNode.choices];
        choices.splice(choiceIdx, 1);
        thisNode.choices = choices;
        return { ...thisNode };
      });
      // CHECK: I commented this and 
      // add dependency choices.length in Node to recall worker
      // adjustNodeHeight(nodeRef, nodeId)
    },
    [setNodeParts/* adjustNodeHeight*/]
  );

  const addChoice = useCallback(
    (nodeRef:any, nodeId:string) => {
      console.log("[ADD CHOICE]");
      setNodeParts(nodeId, (thisNode:FullNodeData) => {
        const choices = [...thisNode.choices];
        choices.push({
          choice: "Replace this with the choice.",
          correct: true,
          feedback: "Replace this with the choice-specific feedback.",
        });
        thisNode.choices = choices;
        return { ...thisNode };
      });
      // CHECK: I commented this and 
      // add dependency choices.length in Node to recall worker
      // adjustNodeHeight(nodeRef, nodeId)
    },
    [setNodeParts/*, adjustNodeHeight*/]
  );

  /////////////////////////////////////////////////////
  // Sidebar Functions

  const closeSideBar = useMemoizedCallback(() => {
    console.log("In closeSideBar");

    if (!user) return;

    setNodeToImprove(null); // CHECK: I added this to compare then

    if (
      nodeBookState.selectionType === "AcceptedProposals" ||
      nodeBookState.selectionType === "Proposals" ||
      (nodeBookState.selectedNode && "selectedNode" in nodes && nodes[selectedNode].editable)
    ) {
      reloadPermanentGrpah();
    }
    console.log("After reloadPermanentGrpah");
    let sidebarType: any = nodeBookState.selectionType;
    if (openPendingProposals) {
      sidebarType = "PendingProposals";
    } else if (openChat) {
      sidebarType = "Chat";
    } else if (openNotifications) {
      sidebarType = "Notifications";
    } else if (openPresentations) {
      sidebarType = "Presentations";
    } else if (openToolbar) {
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
    setOpenToolbar(false);
    setOpenSearch(false);
    setOpenBookmarks(false);
    setOpenRecentNodes(false);
    setOpenTrends(false);
    setOpenMedia(false);
    if (
      nodeBookState.selectedNode &&
      nodeBookState.selectedNode !== "" &&
      g.current.hasNode(nodeBookState.selectedNode)
    ) {
      scrollToNode(nodeBookState.selectedNode);
    }
    console.log("After scrollToNode");
    // CHECK: I commented this, please uncomment
    // const userClosedSidebarLogRef = firebase.db.collection("userClosedSidebarLog").doc();
    // userClosedSidebarLogRef.set({
    //   uname: user.uname,
    //   sidebarType,
    //   createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
    // });
  }, [
    user,
    nodes,
    nodeBookState.selectedNode,
    nodeBookState.selectionType,
    openPendingProposals,
    openChat,
    openNotifications,
    openPresentations,
    openToolbar,
    openSearch,
    openBookmarks,
    openRecentNodes,
    openTrends,
    openMedia,
    reloadPermanentGrpah,
  ]);

  /////////////////////////////////////////////////////
  // Proposals Functions

  const proposeNodeImprovement = useCallback(
    (event: any) => {
      console.log("[PROPOSE_NODE_IMPROVEMENT]");
      event.preventDefault();
      if (!nodeBookState.selectedNode) return;

      setOpenProposal("ProposeEditTo" + nodeBookState.selectedNode);
      reloadPermanentGrpah();

      // CHECK: Improve this making the operations out of setNode, when have nodes with new data
      // update with setNodes
      setNodes(oldNodes => {
        if (!nodeBookState.selectedNode) return oldNodes;

        if (!(nodeBookState.selectedNode in changedNodes)) {
          changedNodes[nodeBookState.selectedNode] = copyNode(oldNodes[nodeBookState.selectedNode]);
        }
        const thisNode = { ...oldNodes[nodeBookState.selectedNode] };
        setNodeToImprove(thisNode); // CHECK: I added this to compare then
        thisNode.editable = true;
        setMapChanged(true);
        return {
          ...oldNodes,
          [nodeBookState.selectedNode]: thisNode,
        };
      });
      scrollToNode(nodeBookState.selectedNode);
    },
    [nodeBookState.selectedNode, reloadPermanentGrpah]
  );

  const selectNode = useCallback(
    (event: any, nodeId: string, chosenType: any, nodeType: any) => {
      console.log("[SELECT_NODE]");
      if (!nodeBookState.choosingNode) {
        if (nodeBookState.selectionType === "AcceptedProposals" || nodeBookState.selectionType === "Proposals") {
          console.log("[select node]: will call reload permanet graph");
          reloadPermanentGrpah();
        }
        if (nodeBookState.selectedNode === nodeId && nodeBookState.selectionType === chosenType) {
          console.log("[select node]: reset all");
          // setSelectedNode(null);
          // setSelectionType(null);
          nodeBookDispatch({ type: "setSelectedNode", payload: null });
          nodeBookDispatch({ type: "setSelectionType", payload: null });
          setSelectedNodeType(null);
          setOpenPendingProposals(false);
          setOpenChat(false);
          setOpenNotifications(false);
          setOpenToolbar(false);
          setOpenSearch(false);
          setOpenRecentNodes(false);
          setOpenTrends(false);
          setOpenMedia(false);
          resetAddedRemovedParentsChildren();
          event.currentTarget.blur();
        } else {
          console.log("[select node]: set NodeId");
          setSelectedNodeType(nodeType);
          nodeBookDispatch({ type: "setSelectionType", payload: chosenType });
          nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
          // setSelectedNode(nodeId);
        }
      }
    },
    [
      choosingNode,
      nodeBookState.selectionType,
      nodeBookState.selectedNode,
      // selectedNode,
      // selectionType,
      reloadPermanentGrpah,
      // proposeNodeImprovement,
      resetAddedRemovedParentsChildren,
    ]
  );

  const saveProposedImprovement = useMemoizedCallback(
    (summary:any, reason:any) => {
      if(!nodeBookState.selectedNode) return;

      nodeBookDispatch({type:'setChosenNode',payload:null});
      nodeBookDispatch({type:'setChoosingNode',payload:null});
      // setChoosingNode(false)
      // setChosenNode(null)
      // setChosenNodeTitle(null)
      // console.log("In saveProposedImprovement");
      let referencesOK = true;

      if (
        (nodes[nodeBookState.selectedNode].nodeType === "Concept" ||
          nodes[nodeBookState.selectedNode].nodeType === "Relation" ||
          nodes[nodeBookState.selectedNode].nodeType === "Question" ||
          nodes[nodeBookState.selectedNode].nodeType === "News") &&
        nodes[nodeBookState.selectedNode].references.length === 0
      ) {
        referencesOK = window.confirm("You are proposing a node without any reference. Are you sure?");
      }
      if (referencesOK) {
        const newNode = { ...nodes[nodeBookState.selectedNode] };
        if (newNode.children.length > 0) {
          const newChildren = [];
          for (let child of newNode.children) {
            newChildren.push({
              node: child.node,
              title: child.title,
              label: child.label,
              // type: child.nodeType, // CHECK: I commented this
            });
          }
          newNode.children = newChildren;
          const newParents = [];
          for (let parent of newNode.parents) {
            newParents.push({
              node: parent.node,
              title: parent.title,
              label: parent.label,
              // type: parent.nodeType, // CHECK: I commented this
            });
          }
          newNode.parents = newParents;
        }
        // const oldNode = allNodes[nodeBookState.selectedNode]
        const oldNode = {...nodeToImprove};
        console.log({newNode,oldNode});
        let isTheSame =
          newNode.title === oldNode.title &&
          newNode.content === oldNode.content &&
          newNode.nodeType === oldNode.nodeType;
        // isTheSame = compareImages(oldNode, newNode, isTheSame);
        isTheSame = isTheSame && compareProperty(oldNode, newNode, "nodeImage");
        // isTheSame = compareLinks(oldNode.tags, newNode.tags, isTheSame, false)
        // isTheSame = compareLinks(oldNode.references, newNode.references, isTheSame, false)
        isTheSame = compareFlatLinks(oldNode.tagIds, newNode.tagIds, isTheSame);  // CHECK: O checked only ID changes
        isTheSame = compareFlatLinks(oldNode.referenceIds, newNode.referenceIds, isTheSame);  // CHECK: O checked only ID changes
        isTheSame = compareLinks(oldNode.parents, newNode.parents, isTheSame, false);
        isTheSame = compareLinks(oldNode.children, newNode.children, isTheSame, false);

        isTheSame = compareChoices(oldNode, newNode, isTheSame);
        if (isTheSame) {
          window.alert("You've not changed anything yet!");
        } else {
          setIsSubmitting(true);
          const postData:any = {
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
      nodes,
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

      console.log("[PROPOSE_NEW_CHILD]");
      event.preventDefault();
      setOpenProposal("ProposeNew" + childNodeType + "ChildNode");
      reloadPermanentGrpah();
      const newNodeId = newId();
      console.log("[propose new child]:", 0);
      setNodes(oldNodes => {
        console.log("set Nodes", nodeBookState.selectedNode);
        if (!nodeBookState.selectedNode) return oldNodes; // CHECK: I added this to validate

        if (!(nodeBookState.selectedNode in changedNodes)) {
          changedNodes[nodeBookState.selectedNode] = copyNode(oldNodes[nodeBookState.selectedNode]);
        }
        if (!tempNodes.has(newNodeId)) {
          tempNodes.add(newNodeId);
        }

        console.log("[propose new child]:", 1);
        const thisNode = copyNode(oldNodes[nodeBookState.selectedNode]);
        console.log("[propose new child]:", 2);
        const newChildNode: any = {
          isStudied: true,
          bookmarked: false,
          isNew: true,
          id: newNodeId,
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
          tagIds: [user.tagId], // CHECK: I added this
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

        console.log("[propose new child]:", 3, newChildNode);
        // debugger
        return setDagNode(g.current, newNodeId, newChildNode, { ...oldNodes }, { ...allTags }, () => {
          // console.log('setDagNode')
          setEdges(oldEdges => {
            // console.log('setEdges')
            if (!nodeBookState.selectedNode) return oldEdges; //CHECK: I add this to validate
            return setDagEdge(g.current, nodeBookState.selectedNode, newNodeId, { label: "" }, { ...oldEdges });
          });
          setMapChanged(true);
          scrollToNode(newNodeId);
        });
      });
    },
    [user, nodeBookState.selectedNode, allTags, reloadPermanentGrpah]
  );

  const fetchProposals = useCallback(
    async (
      setIsAdmin: (value: boolean) => void,
      setIsRetrieving: (value: boolean) => void,
      setProposals: (value: any) => void
    ) => {
      console.log("[FETCH PROPOSALS]");
      if (!user) return;
      if (!selectedNodeType) return;
      console.log("[fetch proposals]");
      // console.log("In fetchProposals");
      setIsRetrieving(true);
      setNodes(oldNodes => {
        // if (selectedNode && "selectedNode" in oldNodes) {
        if (nodeBookState.selectedNode && nodeBookState.selectedNode in oldNodes) {
          // setIsAdmin(oldNodes[selectedNode].admin === username);
          setIsAdmin(oldNodes[nodeBookState.selectedNode].admin === user.uname);
        }
        return oldNodes;
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

      console.log("[fetch proposals]: versionsData, userVersionsRefs, versionsCommentsRefs");
      versionsData.forEach(versionDoc => {
        versionIds.push(versionDoc.id);
        const versionData = versionDoc.data();
        console.log("version data", versionData);
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

      console.log("[fetch proposals]: get userVersionsRefs");

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

      console.log("[fetch proposals]: get versionsCommentsRefs");

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

        console.log("[fetch proposals]: get userVersionsCommentsRefs");

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
      const orderredProposals = proposalsTemp.sort(
        (a: any, b: any) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
      );

      console.log("orderredProposals", orderredProposals);
      setProposals(orderredProposals);
      setIsRetrieving(false);
    },
    [user?.uname, nodeBookState.selectedNode, selectedNodeType]
  );

  /////////////////////////////////////////////////////
  // Inner functions

  const mapContentMouseOver = useCallback((event: any) => {
    if (
      // event.target.getAttribute('data-hoverable') ||
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
      console.log("[UPLOAD NODE IMAGES]");
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
            // const rootURL = "https://storage.googleapis.com/onecademy-dev.appspot.com/"
            const picturesFolder = "UploadedImages/";
            const imageNameSplit = image.name.split(".");
            const imageExtension = imageNameSplit[imageNameSplit.length - 1];
            // let imageFileName = user.userId + "/" + new Date().toUTCString() + "." + imageExtension
            let imageFileName = "jjjj" + imageExtension;

            console.log("picturesFolder + imageFileName", picturesFolder + imageFileName);
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
                console.log("storageRef", storageRef);
                const imageGeneratedUrl = await getDownloadURL(storageRef);
                console.log("---> imageGeneratedUrl", imageGeneratedUrl);
                setIsSubmitting(false);
                setIsUploading(false);
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
    async (event, proposals, setProposals, proposalId, proposalIdx, correct, wrong, award) => {
      console.log('[RATE PROPOSAL]');
      if (!choosingNode) {
        // reloadPermanentGrpah();
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
        let responseObj;
        try {
          await idToken();
          responseObj = await axios.post("/rateVersion", postData);
        } catch (err) {
          console.error(err);
          // window.location.reload();
        }
        // setNodes(oldNodes => {
        //   if (
        //     proposalsTemp[proposalIdx].corrects - proposalsTemp[proposalIdx].wrongs >=
        //     (oldNodes[sNode.id].corrects - oldNodes[sNode].wrongs) / 2
        //   ) {
        //     proposalsTemp[proposalIdx].accepted = true
        //     if ("childType" in proposalsTemp[proposalIdx] && proposalsTemp[proposalIdx].childType !== "") {
        //       reloadPermanentGrpah()
        //     }
        //   }
        //   setProposals(proposalsTemp)
        //   return oldNodes
        // })
        // setIsSubmitting(false)
        // scrollToNode(sNode)
      }
      // event.currentTarget.blur();
    },
    [choosingNode, selectedNodeType, sNode, reloadPermanentGrpah]
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

  const edgeIds = Object.keys(edges);

  return (
    <div className="MapContainer">
      <div id="Map">
        {nodeBookState.choosingNode && <div id="ChoosingNodeMessage">Click the node you'd like to link to...</div>}
        <Box sx={{ width: "100vw", height: "100vh" }}>
          <Drawer anchor={"right"} open={openDeveloperMenu} onClose={() => setOpenDeveloperMenu(false)}>
            {/* Data from map, DONT REMOVE */}
            <Box>
              Interaction map from '{user?.uname}' with [{Object.entries(nodes).length}] Nodes
            </Box>
            <Box>
              <Button onClick={() => console.log(nodes)}>nodes</Button>
              <Button onClick={() => console.log(edges)}>edges</Button>
              <Button onClick={() => console.log(allTags)}>allTags</Button>
            </Box>
            <Box>
              <Button onClick={() => console.log("DAGGER", g)}>Dager</Button>
              <Button onClick={() => console.log(nodeBookState)}>nodeBookState</Button>
              <Button onClick={() => console.log(user)}>user</Button>
            </Box>
            <Box>
              <Button onClick={() => console.log(nodeChanges)}>node changes</Button>
              <Button onClick={() => console.log(mapRendered)}>map rendered</Button>
              <Button onClick={() => console.log(mapChanged)}>map changed</Button>
              <Button onClick={() => console.log(userNodeChanges)}>user node changes</Button>
              <Button onClick={() => console.log(nodeBookState)}>show global state</Button>
            </Box>
            <Box>
              <Button onClick={() => console.log(nodeToImprove)}>nodeToImprove</Button>
            </Box>
            <Box>
              <Button onClick={() => nodeBookDispatch({ type: "setSelectionType", payload: "Proposals" })}>
                Toggle Open proposals
              </Button>
              <Button onClick={() => openNodeHandler("0FQjO6yByNeXOiYlRMvN")}>Open Node Handler</Button>
            </Box>
          </Drawer>
          <MemoizedSidebar
            proposeNodeImprovement={proposeNodeImprovement}
            fetchProposals={fetchProposals}
            rateProposal={rateProposal}
            selectProposal={() => console.log("selectProposal")}
            deleteProposal={() => console.log("deleteProposal")}
            closeSideBar={closeSideBar}
            proposeNewChild={proposeNewChild}
            selectionType={nodeBookState.selectionType}
            setSNode={setSNode}
          />
          <Box sx={{ position: "fixed", bottom: "10px", right: "10px", zIndex: "1300", background: "#123" }}>
            <Button variant="contained" onClick={() => setOpenDeveloperMenu(!openDeveloperMenu)}>
              {"X"}
            </Button>
          </Box>

          {/* end Data from map */}
          <Box
            id="MapContent"
            className={scrollToNodeInitialized ? "ScrollToNode" : undefined}
            onMouseOver={mapContentMouseOver}
          >
            <MapInteractionCSS textIsHovered={mapHovered} /*identifier={'xdf'}*/>
              {/* show clusters */}

              <LinksList edgeIds={edgeIds} edges={edges} selectedRelation={selectedRelation} />
              <NodesList
                nodes={nodes}
                nodeChanged={nodeChanged}
                bookmark={bookmark}
                markStudied={markStudied}
                chosenNodeChanged={chosenNodeChanged}
                referenceLabelChange={referenceLabelChange}
                deleteLink={deleteLink}
                openLinkedNode={openLinkedNode}
                openAllChildren={() => console.log("open all children")}
                hideNodeHandler={hideNodeHandler}
                hideOffsprings={hideOffsprings}
                toggleNode={toggleNode}
                openNodePart={openNodePart}
                selectNode={selectNode}
                nodeClicked={() => console.log("nodeClicked")}
                correctNode={correctNode}
                wrongNode={wrongNode}
                uploadNodeImage={uploadNodeImage}
                removeImage={removeImage}
                setOpenMedia={(imgUrl: string | boolean) => {
                  console.log("first", imgUrl);
                  setOpenMedia(imgUrl);
                }}
                changeTitle={changeTitle}
                changeChoice={changeChoice}
                changeFeedback={changeFeedback}
                switchChoice={switchChoice}
                deleteChoice={deleteChoice}
                addChoice={addChoice}
                onNodeTitleBlur={() => console.log("onNodeTitleBlur")}
                saveProposedChildNode={() => console.log("saveProposedChildNod")}
                saveProposedImprovement={saveProposedImprovement}
                closeSideBar={closeSideBar}
                reloadPermanentGrpah={() => console.log("reloadPermanentGrpah")}
              />
            </MapInteractionCSS>

            <Modal
              open={Boolean(openMedia)}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <MapInteractionCSS>
                <img src={openMedia} alt="Node image" className="responsive-img" />
              </MapInteractionCSS>
            </Modal>
            {/* // <Modal onClick={closedSidebarClick("Media")}>
              //   <MapInteractionCSS>
              //     <img src={openMedia} alt="Node image" className="responsive-img" />
              //   </MapInteractionCSS>
            </Modal> */}
          </Box>
        </Box>
      </div>
    </div>
  );
};

const NodeBook = () => (
  <NodeBookProvider>
    <Dashboard />
  </NodeBookProvider>
);

export default NodeBook;
