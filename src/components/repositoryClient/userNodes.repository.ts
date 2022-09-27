import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  limit,
  query,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";

import { UserNodesData } from "../../nodeBookTypes";

type CreateUserNode = {
  db: Firestore;
  nodeId: string;
  userName: string;
};

// TODO: remove this unused function, this is an example to use repository pattern in every firebase function

/**
 * update nodes (children and parents)
 * update or create userNode
 * update nodes again
 * create log
 */
export const createUserNodeWithBatch = async ({ db, nodeId, userName }: CreateUserNode) => {
  const nodeRef = doc(db, "nodes", nodeId);
  const nodeDoc = await getDoc(nodeRef);

  if (!nodeDoc.exists() || !userName) return;

  let userNodeData = null;
  const batch = writeBatch(db);
  const thisNode: any = { ...nodeDoc.data(), id: nodeId };

  try {
    for (let child of thisNode.children) {
      const linkedNodeRef = doc(db, "nodes", child.node);
      batch.update(linkedNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
    }
    for (let parent of thisNode.parents) {
      const linkedNodeRef = doc(db, "nodes", parent.node);
      batch.update(linkedNodeRef, { updatedAt: Timestamp.fromDate(new Date()) });
    }
    const userNodesRef = collection(db, "userNodes");
    const q = query(userNodesRef, where("node", "==", nodeId), where("user", "==", userName), limit(1));
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
      const userNodeRef = collection(db, "userNodes");
      // userNodeId = userNodeRef.id;
      // console.log(' ---->> userNodeId', userNodeRef, userNodeId)
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
        user: userName,
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

    // let oldNodes: { [key: string]: any } = { ...nodes };
    // let oldEdges: { [key: string]: any } = { ...edges };
    // // let oldAllNodes: any = { ...nodes };
    // // let oldAllUserNodes: any = { ...nodeChanges };
    // // if data for the node is loaded
    // let uNodeData = {
    //   // load all data corresponding to the node on the map and userNode data from the database and add userNodeId for the change documentation
    //   ...nodes[nodeId],
    //   ...thisNode, // CHECK <-- I added this to have children, parents, tags properties
    //   ...userNodeData,
    //   open: true,
    // };

    // if (userNodeId) {
    //   // TODO: I added this validation
    //   uNodeData[userNodeId] = userNodeId;
    // }
    // ({ uNodeData, oldNodes, oldEdges } = makeNodeVisibleInItsLinks(
    //   // modify nodes and edges
    //   uNodeData,
    //   oldNodes,
    //   oldEdges
    //   // oldAllNodes
    // ));

    // // debugger
    // ({ oldNodes, oldEdges } = createOrUpdateNode(
    //   // modify dagger
    //   g.current,
    //   uNodeData,
    //   nodeId,
    //   oldNodes,
    //   { ...oldEdges },
    //   allTags
    // ));

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
    console.log("------------ before batch commit");
    await batch.commit();
    console.log("------------ after batch commit");
    // TODO: I comment this, move to the correct side
    // scrollToNode(nodeId);
    // //  there are some places when calling scroll to node but we are not selecting that node
    // setTimeout(() => {
    //   nodeBookDispatch({ type: "setSelectedNode", payload: nodeId });
    //   // setSelectedNode(nodeId);
    // }, 400);
  } catch (err) {
    console.error(err);
  }

  userNodeRef = collection(db, "userNodes");
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
};
