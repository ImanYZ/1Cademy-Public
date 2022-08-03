import { Button } from "@mui/material";
import { Box } from "@mui/system";
import { collection, doc, getDoc, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { MapInteractionCSS } from "react-map-interaction";

import { useAuth } from "@/context/AuthContext";
import { useTagsTreeView } from "@/hooks/useTagsTreeView";

import NodesList from "../components/map/NodesList";
import { compare2Nodes, createOrUpdateNode, dag1 } from "../lib/utils/Map.utils";

// type Edge = { from: string; to: string };

// type EdgeProcess = { from: Point; to: Point };
// const EDGES: EdgeProcess[] = []

type DashboardProps = {};

const Dashboard = ({}: DashboardProps) => {
  // -----------------------
  // global states
  // -----------------------

  const [{ user }] = useAuth();
  const [allTags, , allTagsLoaded] = useTagsTreeView();
  const db = getFirestore();

  // -----------------------
  // local states
  // -----------------------

  // used for triggering useEffect after nodes or usernodes change
  const [userNodeChanges, setUserNodeChanges] = useState<any[]>([]);
  const [nodeChanges, setNodeChanges] = useState<any[]>([]);
  const [mapChanged, setMapChanged] = useState(false);
  // two collections (tables) in database, nodes and usernodes
  // nodes: collection of all data of each node
  // usernodes: collection of all data about each interaction between user and node
  // (ex: node open, hidden, closed, hidden, etc.) (contains every user with every node interacted with)
  // nodes: dictionary of all nodes visible on map for specific user
  const [nodes, setNodes] = useState({});
  // edges: dictionary of all edges visible on map for specific user
  const [edges, setEdges] = useState({});
  // const [nodeTypeVisibilityChanges, setNodeTypeVisibilityChanges] = useState([]);

  // mapRendered: flag for first time map is rendered (set to true after first time)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mapRendered, setMapRendered] = useState(false);

  // scale and translation of the viewport over the map for the map interactions module
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mapInteractionValue, setMapInteractionValue] = useState({
    scale: 1,
    translation: { x: 0, y: 0 }
  });

  // flag for when scrollToNode is called
  const [scrollToNodeInitialized, setScrollToNodeInitialized] = useState(false);

  // -----------------------
  // flags
  // -----------------------

  // flag for whether all tags data is downloaded from server
  // const [allTagsLoaded, setAllTagsLoaded] = useState(false);

  // flag for whether users' nodes data is downloaded from server
  const [userNodesLoaded, setUserNodesLoaded] = useState(false);

  const getNodesData = useCallback(
    async (nodeIds: string[]) => {
      if (nodeIds.length > 0) {
        let oldNodeChanges = [...nodeChanges];
        const nodeDocsPromises = [];
        for (let nodeId of nodeIds) {
          const nodeRef = doc(db, "nodes", nodeId);

          nodeDocsPromises.push(getDoc(nodeRef));
        }
        Promise.all(nodeDocsPromises)
          .then((nodeDocs: any[]) => {
            for (let nodeDoc of nodeDocs) {
              console.log(nodeDoc.data());
              if (nodeDoc.exists) {
                const nData = nodeDoc.data();
                if (!nData.deleted) {
                  oldNodeChanges.push({
                    cType: "added",
                    nId: nodeDoc.id,
                    nData
                  });
                }
              }
            }
            setNodeChanges(oldNodeChanges);
          })
          .catch(function (error) {
            console.log("Error getting document:", error);
          });
      }
    },
    [nodeChanges]
  );
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
                  y: (window.innerHeight / 3.4 - originalNode.offsetTop) * 0.94
                }
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

  // loads user nodes
  // downloads all records of userNodes collection where user is authenticated user
  // sets userNodeChanges
  useEffect(() => {
    console.log("[GET USER NODES - SNAPSHOOT]", allTagsLoaded);
    // console.log("In allTagsLoaded useEffect");
    // if (firebase && allTagsLoaded && username) {
    const username = user?.uname;
    if (db && allTagsLoaded && username) {
      // Create the query to load the userNodes and listen for modifications.
      // const nodeRef = doc(db, "userNodes");

      const userNodesRef = collection(db, "userNodes");
      const q = query(
        userNodesRef,
        where("user", "==", username),
        where("visible", "==", true),
        where("deleted", "==", false)
      );

      const userNodesSnapshot = onSnapshot(q, snapshot => {
        setUserNodeChanges(oldUserNodeChanges => {
          let newUserNodeChanges = [...oldUserNodeChanges];
          const docChanges = snapshot.docChanges();
          if (docChanges.length > 0) {
            for (let change of docChanges) {
              const userNodeData = change.doc.data();
              // only used for useEffect above
              newUserNodeChanges = [
                ...oldUserNodeChanges,
                {
                  cType: change.type,
                  uNodeId: change.doc.id,
                  uNodeData: userNodeData
                }
              ];
            }
          }
          return newUserNodeChanges;
        });
      });

      // const userNodesQuery = db
      //   .collection("userNodes")
      //   .where("user", "==", username)
      //   .where("visible", "==", true)
      //   .where("deleted", "==", false);

      // // called whenever something changes and downloads the changes between the database and query
      // const userNodesSnapshot = userNodesQuery.onSnapshot(function (snapshot) {
      //   console.log('GET USER NODES:Snapsh')
      //   setUserNodeChanges((oldUserNodeChanges) => {
      //     const docChanges = snapshot.docChanges();
      //     if (docChanges.length > 0) {
      //       let newUserNodeChanges = [...oldUserNodeChanges];
      //       for (let change of docChanges) {
      //         const userNodeData = change.doc.data();
      //         // only used for useEffect above
      //         newUserNodeChanges.push({
      //           cType: change.type,
      //           uNodeId: change.doc.id,
      //           uNodeData: userNodeData,
      //         });
      //       }
      //     }
      //     return oldUserNodeChanges;
      //   });
      // });
      // before calling useEffect again or exiting useEffect
      return () => userNodesSnapshot();
    }
    // }, [allTagsLoaded, username]);
  }, [allTagsLoaded, user]);

  // SYNC NODES FUNCTION
  // READ THIS!!!
  // nodeChanges, userNodeChanges useEffect
  useEffect(() => {
    console.log("[SYNCHRONIZATION]");
    // debugger
    // console.log("In nodeChanges, userNodeChanges useEffect.");
    const nodeUserNodeChangesFunc = async () => {
      console.log("[synchronization]");
      // dictionary of all nodes visible on the user's map view
      let oldNodes: any = { ...nodes };
      // dictionary of all links/edges on the user's map view
      let oldEdges: any = { ...edges };
      // let typeVisibilityChanges = nodeTypeVisibilityChanges;
      // flag for if there are any changes to map
      let oldMapChanged = mapChanged;
      if (nodeChanges.length > 0) {
        console.log("1: will iterate node changes");
        for (let change of nodeChanges) {
          const nodeId = change.nId;
          let nodeData = change.nData;
          delete nodeData.deleted;
          if (nodeData.nodeType !== "Question") {
            nodeData.choices = [];
          }
          // addReference(nodeId, nodeData);
          if (change.cType === "added") {
            // debugger
            ({ oldNodes, oldEdges } = createOrUpdateNode(nodeData, nodeId, oldNodes, oldEdges, allTags));
            oldMapChanged = true;
          } else if (change.cType === "modified") {
            const node = oldNodes[nodeId];
            {
              // let isTheSame =
              //   node.changedAt.getTime() === nodeData.changedAt.toDate().getTime() &&
              //   node.admin === nodeData.admin &&
              //   node.aImgUrl === nodeData.aImgUrl &&
              //   node.fullname === nodeData.fullname &&
              //   node.chooseUname === nodeData.chooseUname &&
              //   node.comments === nodeData.comments &&
              //   node.title === nodeData.title &&
              //   node.content === nodeData.content &&
              //   node.corrects === nodeData.corrects &&
              //   node.maxVersionRating === nodeData.maxVersionRating &&
              //   node.nodeType === nodeData.nodeType &&
              //   node.studied === nodeData.studied &&
              //   node.bookmarks === nodeData.bookmarks &&
              //   node.versions === nodeData.versions &&
              //   node.viewers === nodeData.viewers &&
              //   node.wrongs === nodeData.wrongs;
              // // isTheSame = compareImages(nodeData, node, isTheSame);
              // isTheSame = isTheSame && compareProperty(nodeData, node, "nodeImage");
              // isTheSame = compareLinks(nodeData.tags, node.tags, isTheSame, false);
              // isTheSame = compareLinks(nodeData.references, node.references, isTheSame, false);
              // const childrenComparison = compareLinks(
              //   nodeData.children,
              //   node.children,
              //   true,
              //   false
              // );
              // const parentsComparison = compareLinks(nodeData.parents, node.parents, true, false);
              // isTheSame =
              //   childrenComparison &&
              //   parentsComparison &&
              //   compareChoices(nodeData, node, isTheSame);
            }
            if (!compare2Nodes(nodeData, node)) {
              nodeData = {
                ...node,
                ...nodeData,
                id: nodeId,
                createdAt: nodeData.createdAt.toDate(),
                changedAt: nodeData.changedAt.toDate(),
                updatedAt: nodeData.updatedAt.toDate()
              };
              ({ oldNodes, oldEdges } = createOrUpdateNode(nodeData, nodeId, oldNodes, oldEdges, allTags));
              oldMapChanged = true;
            }
          }
        }
      }
      // We can take care of some userNodes from userNodeChanges,
      // but we should postpone some others to
      // handle them after we retrieve their corresponding node documents.
      // We store those that we handle in this round in this array.
      const handledUserNodeChangesIds: string[] = [];
      const nodeIds: string[] = [];
      if (userNodeChanges && userNodeChanges.length > 0) {
        console.log("There is User node changes");
        let userNodeData: any;
        // iterating through every change
        for (let userNodeChange of userNodeChanges) {
          // data of the userNode that is changed
          userNodeData = userNodeChange.uNodeData;
          // nodeId of userNode that is changed
          const nodeId = userNodeData.node;
          if (!userNodesLoaded) {
            nodeIds.push(nodeId);
          } else {
            // if row is removed
            if (userNodeChange.cType === "removed") {
              // if graph includes nodeId, remove it
              if (dag1[0].hasNode(nodeId)) {
                oldEdges = removeDagAllEdges(nodeId, oldEdges);
                oldNodes = removeDagNode(nodeId, oldNodes);
                oldMapChanged = true;
              }
            } else {
              // change can be addition or modification (not removal) of document for the query on userNode table
              // modify change for allUserNodes
              userNodeData = {
                userNodeId: userNodeChange.uNodeId,
                correct: userNodeData.correct,
                wrong: userNodeData.wrong,
                isStudied: userNodeData.isStudied,
                // bookmarks were added later, so check if "bookmarked" exists
                bookmarked: "bookmarked" in userNodeData ? userNodeData.bookmarked : false,
                open: userNodeData.open,
                nodeChanges: "nodeChanges" in userNodeData ? userNodeData.nodeChanges : null,
                // toDate() converts firestore timestamp to JavaScript date object
                firstVisit: userNodeData.createdAt.toDate(),
                lastVisit: userNodeData.updatedAt.toDate()
              };
              // specific for addition (in addition to code from 617-632)
              if (userNodeChange.cType === "added") {
                {
                  // if nodeId is already in allUserNodes but not in database
                  // for deleting duplicates
                  // ********************************************************
                  // An issue here needs to be investigated with deleting all userNodes or duplicating nodes.
                  // ********************************************************
                  // if (!realoadingAll && nodeId in oldAllUserNodes) {
                  //   // document just added to database
                  //   const userNodeDocs = await firebase.db
                  //     .collection("userNodes")
                  //     .where("node", "==", nodeId)
                  //     .where("user", "==", username)
                  //     .get();
                  //   if (userNodeDocs.docs.length > 1) {
                  //     console.log("*********************************************");
                  //     console.log({ state: "Trying to delete userNodes", nodeId });
                  //     console.log("*********************************************");
                  //     let userNodeRef = firebase.db
                  //       .collection("userNodes")
                  //       .doc(userNodeDocs.docs[0].id);
                  //     // checks if "userNodeId" is already in allUserNodes, it would be a duplicate and deletes in the database
                  //     if (
                  //       "userNodeId" in oldAllUserNodes[nodeId] &&
                  //       oldAllUserNodes[nodeId].userNodeId &&
                  //       userNodeDocs.docs[0].id !== oldAllUserNodes[nodeId].userNodeId
                  //     ) {
                  //       // (older) document in database referring to same nodeId
                  //       userNodeRef = firebase.db
                  //         .collection("userNodes")
                  //         .doc(oldAllUserNodes[nodeId].userNodeId);
                  //       oldAllUserNodes = { ...oldAllUserNodes };
                  //     }
                  //     userNodeRef.delete();
                  //   }
                  //   // if added but not a duplicate
                  // } else {
                }
                // checks whether map is loaded then make changes
                if (mapRendered && dag1[0].hasNode(nodeId)) {
                  setTimeout(() => {
                    // scrolls to node if map is loaded
                    scrollToNode(nodeId);
                  }, 1000);
                }
                // }
              }
              // for both addition and modifications
              if (userNodeChange.cType === "added" || userNodeChange.cType === "modified") {
                // if data for the node is not loaded yet, do nothing
                if (!(nodeId in oldNodes)) {
                  console.log("will add in old Nodes");
                  nodeIds.push(nodeId);
                  continue;
                }
                // Compare the updatedAt attribute of this node in nodes state with updatedAt in nodeChanges,
                // and if the latter is greater, update nodeChanges.
                if (userNodeData.nodeChanges && userNodeData.nodeChanges.updatedAt > oldNodes[nodeId].updatedAt) {
                  setNodeChanges(oldNodeChanges => {
                    let newNodeChanges = [...oldNodeChanges];
                    newNodeChanges.push({
                      cType: "modified",
                      nId: userNodeData.node,
                      nData: userNodeData.nodeChanges
                    });
                    return newNodeChanges;
                  });
                }
                if (
                  // left: current state of userNode
                  // right: new state of userNode from the database
                  // checks whether any userNode attributes on map are different from corresponding userNode attributes from database
                  oldNodes[nodeId].correct !== userNodeData.correct ||
                  oldNodes[nodeId].wrong !== userNodeData.wrong ||
                  oldNodes[nodeId].isStudied !== userNodeData.isStudied ||
                  oldNodes[nodeId].bookmarked !== userNodeData.bookmarked ||
                  oldNodes[nodeId].open !== userNodeData.open ||
                  oldNodes[nodeId].firstVisit !== userNodeData.firstVisit ||
                  oldNodes[nodeId].lastVisit !== userNodeData.lastVisit
                ) {
                  oldNodes[nodeId] = {
                    // load all data corresponsponding to the node on the map and userNode data from the database and add userNodeId for the change documentation
                    ...oldNodes[nodeId],
                    ...userNodeData
                  };
                  oldMapChanged = true;
                }
              }
            }
            handledUserNodeChangesIds.push(userNodeChange.uNodeId);
          }
        }
      }
      if (!userNodesLoaded) {
        getNodesData(nodeIds);
        // setTimeout is used for when the user proposes a child node and the proposal gets accepted, data for the created node and userNode come from the database to the client at the same time
        // setTimeout(() => {
        setUserNodesLoaded(true);
        // }, 400);
      } else {
        if (nodeIds.length > 0) {
          // Get the data for the nodes that are not loaded yet but their corresponding userNodes are loaded.
          getNodesData(nodeIds);
        }
        if (handledUserNodeChangesIds.length > 0) {
          let oldUserNodeChanges = userNodeChanges.filter(uNObj => !handledUserNodeChangesIds.includes(uNObj.uNodeId));
          setUserNodeChanges(oldUserNodeChanges);
        }
        if (nodeChanges.length > 0 || handledUserNodeChangesIds.length > 0) {
          setNodes(oldNodes);
          setEdges(oldEdges);
          //  map changed fires another use effect that calls dagr
          //  which calculates the new location of nodes and errors
          setMapChanged(oldMapChanged);
          if (nodeChanges.length > 0) {
            // setNodeTypeVisibilityChanges(typeVisibilityChanges);
            setNodeChanges([]);
          }
        }
      }
    };

    console.log({ nodeChanges, userNodeChanges });
    if (nodeChanges.length > 0 || (userNodeChanges && userNodeChanges.length > 0)) {
      nodeUserNodeChangesFunc();
    }
  }, [
    nodeChanges,
    userNodeChanges,
    // allNodes,
    allTags,
    // allUserNodes,
    // username,
    userNodesLoaded,
    nodes,
    edges,
    // nodeTypeVisibilityChanges, // this was comment in iman code
    mapChanged
  ]);

  console.log(nodeChanges);
  // getNodesData(nodeIds);

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <Button
        onClick={() => {
          getNodesData(nodeIds);
        }}
      >
        TU
      </Button>
      <Button onClick={() => console.log(nodes)}>nodes</Button>
      <Button onClick={() => console.log(nodeChanges)}>node changes</Button>
      <Button onClick={() => console.log(userNodeChanges)}>user node changes</Button>
      <MapInteractionCSS>
        {/* show clusters */}
        {/* link list */}
        {/* node list */}
        Interaction map from '{user?.uname}' with [{Object.entries(nodes).length}] Nodes
        <NodesList nodes={nodes} />
      </MapInteractionCSS>
    </Box>
  );
};

export default Dashboard;
