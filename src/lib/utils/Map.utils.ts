import dagre from "dagre";

import { FullNodeData } from "../../noteBookTypes";

export const MIN_CHANGE = 4; // The minimum change on the map to initiate a setstate.
export const MAP_RIGHT_GAP = 730; // The gap on the right side of the map for the sidebar area.
export const NODE_WIDTH = 580; // Default node width
export const NODE_HEIGHT = 97; // Default node height
export const NODE_GAP = 19; // The minimum gap between the stacked nodes.
export const COLUMN_GAP = 190; // The minimum gap between the node columns.
export const XOFFSET = 580; // Default X offset to shift all the nodes and relations.
export const YOFFSET = 160; // Default Y offset to shift all the nodes and relations.

// export const visibleNodes = new Set();
// set of ids of changedNodes: for example (proposal nodes)
export const tempNodes = new Set<string>();
// all nodes that have been modified
export const changedNodes: any = {};
// object of sets
// keys: reference node ids
// values: set of node ids that are citing this reference
// export const citations = {};
// set of all ids of allTags nodes

const firstWeekDay = (thisDate?: any) => {
  let today = new Date();
  if (thisDate) {
    today = new Date(thisDate.getTime());
  }
  const daysDiff = today.getDate() - today.getDay();
  let firstWeekDay = new Date(today.setDate(daysDiff));
  return firstWeekDay.getMonth() + 1 + "-" + firstWeekDay.getDate() + "-" + firstWeekDay.getFullYear();
};

const firstMonthDay = (thisDate?: any) => {
  let today = new Date();
  if (thisDate) {
    today = new Date(thisDate.getTime());
  }
  return today.getMonth() + 1 + "-" + 1 + "-" + today.getFullYear();
};

export const loadReputationsData = (
  db: any,
  isCommunity: any,
  reputationType: any,
  tagId: any,
  setReputationsDict: any,
  setReputationsLoaded: any
) => {
  const reputationsDictTemp: any = {};
  let reputationsQuery;

  if (isCommunity) {
    if (reputationType === "All Time") {
      reputationsQuery = db.collection("comPoints");
    } else if (reputationType === "Monthly") {
      reputationsQuery = db.collection("comMonthlyPoints").where("firstMonthDay", "==", firstMonthDay());
    } else if (reputationType === "Weekly") {
      reputationsQuery = db.collection("comWeeklyPoints").where("firstWeekDay", "==", firstWeekDay());
    } else if (reputationType === "Others") {
      reputationsQuery = db.collection("comOthersPoints");
    } else if (reputationType === "Others Monthly") {
      reputationsQuery = db.collection("comOthMonPoints").where("firstMonthDay", "==", firstMonthDay());
    }
  } else {
    if (reputationType === "All Time") {
      reputationsQuery = db.collection("reputations").where("tagId", "==", tagId);
    } else if (reputationType === "Monthly") {
      reputationsQuery = db
        .collection("monthlyReputations")
        .where("tagId", "==", tagId)
        .where("firstMonthDay", "==", firstMonthDay());
    } else if (reputationType === "Weekly") {
      //  return here and change tag to tagId, after updating values in database
      reputationsQuery = db
        .collection("weeklyReputations")
        .where("tagId", "==", tagId)
        .where("firstWeekDay", "==", firstWeekDay());
    } else if (reputationType === "Others") {
      reputationsQuery = db.collection("othersReputations").where("tagId", "==", tagId);
    } else if (reputationType === "Others Monthly") {
      reputationsQuery = db
        .collection("othMonReputations")
        .where("tagId", "==", tagId)
        .where("firstMonthDay", "==", firstMonthDay());
    }
  }
  const reputationsSnapshot = reputationsQuery.onSnapshot(function (snapshot: any) {
    const docChanges = snapshot.docChanges();
    if (docChanges.length > 0) {
      for (let change of docChanges) {
        const reputationData = change.doc.data();
        let uname, isAdmin, admin, adminPoints, aImgUrl, aFullname, aChooseUname;
        if (isCommunity) {
          admin = reputationData.admin;
          adminPoints = reputationData.adminPoints;
          aImgUrl = reputationData.aImgUrl;
          aFullname = reputationData.aFullname;
          aChooseUname = reputationData.aChooseUname;
          delete reputationData.admin;
          delete reputationData.adminPoints;
          delete reputationData.aImgUrl;
          delete reputationData.aFullname;
          delete reputationData.aChooseUname;
        } else {
          uname = reputationData.uname;
          isAdmin = reputationData.isAdmin;
          delete reputationData.uname;
          delete reputationData.isAdmin;
        }

        if (change.type === "added" || change.type === "modified") {
          if (isCommunity) {
            reputationsDictTemp[reputationData.tagId] = {
              ...reputationData,
              tagId: reputationData.tagId,
              admin,
              adminPoints,
              aImgUrl,
              aFullname,
              aChooseUname,
            };
          } else {
            reputationsDictTemp[uname] = {
              ...reputationData,
              isAdmin,
            };
          }
        }
      }
      setReputationsDict({ ...reputationsDictTemp });
    }
    setReputationsLoaded(true);
  });
  return () => reputationsSnapshot();
};

// setting the node type and visibility of a parent node inside a child
export const setTypeVisibilityOfParentInsideChild = (oldNodes: any, nodeId: string, childId: string) => {
  if (childId in oldNodes) {
    // signal to React that something has changed in oldNodes[childId]
    oldNodes[childId] = {
      ...oldNodes[childId],
      parents: [...oldNodes[childId].parents],
    };
    const parentIdx = oldNodes[childId].parents.findIndex((p: any) => p.node === nodeId);
    oldNodes[childId].parents[parentIdx] = {
      ...oldNodes[childId].parents[parentIdx],
      visible: true,
    };
  }
};

// setting the node type and visibility of a child node inside a parent
export const setTypeVisibilityOfChildInsideParent2 = (
  nodeParent: any,
  oldNodes: any,
  nodeId: string
  /*   parentId: string */
) => {
  // const oldNodesCopy = { ...oldNodes }
  let parentCopy = copyNode(nodeParent);
  // parentCopy = { ...parentCopy, children: [...parentCopy.children] }
  const childIdx = parentCopy.children.findIndex((c: any) => c.node === nodeId);
  parentCopy.children[childIdx] = { ...parentCopy.children[childIdx], visible: true };
  return parentCopy;

  // if (parentId in oldNodesCopy) {
  //   oldNodes[parentId] = {
  //     ...oldNodes[parentId],
  //     children: [...oldNodes[parentId].children]
  //   };
  //   const childIdx = oldNodes[parentId].children.findIndex((c: any) => c.node === nodeId);
  //   oldNodes[parentId].children[childIdx] = {
  //     ...oldNodes[parentId].children[childIdx],
  //     visible: true
  //   };
  // }
};

// setting the node type and visibility of a child node inside a parent
export const setTypeVisibilityOfChildInsideParent = (oldNodes: any, nodeId: string, parentId: string) => {
  if (parentId in oldNodes) {
    oldNodes[parentId] = {
      ...oldNodes[parentId],
      children: [...oldNodes[parentId].children],
    };
    const childIdx = oldNodes[parentId].children.findIndex((c: any) => c.node === nodeId);
    oldNodes[parentId].children[childIdx] = {
      ...oldNodes[parentId].children[childIdx],
      visible: true,
    };
  }
};

// for every node downloaded from the database
// export const addReference = (nodeId, nodeData) => {
//   if (nodeData.nodeType === "Reference") {
//     if (!(nodeId in citations)) {
//       citations[nodeId] = new Set();
//     }
//   }
//   // for listing the set of nodes that cite this reference
//   for (let refObj of nodeData.references) {
//     const refNode = refObj.node;
//     // if reference does not exist in citations then add it
//     if (!(refNode in citations)) {
//       citations[refNode] = new Set();
//     }
//     // add nodeId to the set of nodes that are citing the reference node
//     citations[refNode].add(nodeId);
//   }
// };

// ???
export const getDependentNodes = (dependents: any[], necessaryNodeIds: string[], dependentNodeIds: string[]) => {
  for (let dependent of dependents) {
    if (!necessaryNodeIds.includes(dependent.node) && !dependentNodeIds.includes(dependent.node)) {
      dependentNodeIds.push(dependent.node);
    }
  }
};

// adds a node to the dagre object and the list of nodes that should be visible on the map (oldNodes is updated)
// used for adding new nodes to map
// nodeId: nodeId of the node we want to add
// node: data of the node we want to add
// oldNodes: current value of nodesState in Map.js
// callback: called after oldNodes is updated and the new node is added to the dagre object
export const setDagNode = (
  g: dagre.graphlib.Graph<{}>,
  nodeId: string,
  node: any,
  oldNodes: any,
  allTags: any,
  callback?: any
) => {
  let newNode: any = {};
  // 10
  // unde
  // 0
  node.width ? node.width : NODE_WIDTH; // 10 // NODE_ // NODE
  if ("width" in node) {
    newNode.width = node.width;
  } else {
    newNode.width = NODE_WIDTH;
  }
  if ("height" in node) {
    newNode.height = node.height;
  } else {
    newNode.height = NODE_HEIGHT;
  }
  if ("left" in node) {
    newNode.left = node.left;
  }
  if ("top" in node) {
    newNode.top = node.top;
  }
  if ("x" in node) {
    newNode.x = node.x;
  }
  if ("y" in node) {
    newNode.y = node.y;
  }
  // add newNode data to dagre object with the id: nodeId
  g.setNode(nodeId, newNode);
  // if the node has at least one tag, check if the nodeId of the tag is in allTags
  // (clusters are based on nodes' first tags)
  if ("tagIds" in node && node.tagIds.length !== 0 && node.tagIds[0] in allTags) {
    // setParent sets a cluster for the node with node Id
    // node.tags[0].node: node Id of the first tag from the node data
    // dag1[0].setParent(nodeId, "Tag" + node.tagIds[0]); // <---- CHECK: this line was commented
  }
  console.log(" --> before callback");
  if (callback) {
    console.log(" ----------------> execute callback");
    callback();
  }
  // ***************************************************************
  // Candidate for removal!
  // copyNode: creates copy of the object
  // copies the other attributes of the node (attributes not necessary for dagre object)
  newNode = copyNode(node);
  // ***************************************************************
  // id is deleted because nodeId will be used as key in oldNodes
  if ("id" in newNode) {
    delete newNode.id;
  }
  // adding the newNode to oldNodes
  oldNodes[nodeId] = newNode;
  return oldNodes;
};

// removes a node from the map
export const removeDagNode = (g: dagre.graphlib.Graph<{}>, nodeId: string, oldNodes: any) => {
  // removes nodeId from dagre object
  g.removeNode(nodeId);
  // removes nodeId from oldNodes
  if (nodeId in oldNodes) {
    delete oldNodes[nodeId];
  }
  return oldNodes;
};

// adds edge to dagre object and oldEdges
// from: node id of source of the new edge
// to: node id of destination of the new edge
// edge: data of the new edge
export const setDagEdge = (g: dagre.graphlib.Graph<{}>, from: string, to: string, edge: any, oldEdges: any) => {
  // checks that the from and to nodes exist in map
  if (g.hasNode(from) && g.hasNode(to)) {
    const edgeId = from + "-" + to;
    const newEdge = { ...edge };
    g.setEdge(from, to, newEdge);
    // adds newEdge to oldEdges
    oldEdges[edgeId] = newEdge;
  }
  return oldEdges;
};

// removes edge from dagre object and oldEdges
export const removeDagEdge = (g: dagre.graphlib.Graph<{}>, from: string, to: string, oldEdges: any) => {
  g.removeEdge(from, to);
  const edgeId = from + "-" + to;
  if (edgeId in oldEdges) {
    delete oldEdges[edgeId];
  }
  return oldEdges;
};

// hides all edges for the node with nodeId
export const removeDagAllEdges = (g: dagre.graphlib.Graph<{}>, nodeId: string, edges: any) => {
  const oldEdges = { ...edges };
  // debugger
  // nodeEdges: array of all edges connected to nodeId or null (if there are no edges)
  // CHECK: commented this because nodeEdges dont exist in dagre
  // g.nodes().forEach(function (v) {
  // });
  // g.edges().forEach(function (e) {
  // });

  const graphEdges = g.edges();
  const nodeEdges = graphEdges.filter(cur => cur.v === nodeId || cur.w === nodeId);
  // const nodeEdges = g.nodeEdges(nodeId);

  if (nodeEdges) {
    for (let edge of nodeEdges) {
      // remove edge from dagre object
      // from: edge.v, to: edge.w
      g.removeEdge(edge.v, edge.w);
      const edgeId = edge.v + "-" + edge.w;
      // removes edge from oldEdges
      if (edgeId in oldEdges) {
        delete oldEdges[edgeId];
      }
    }
  }
  return oldEdges;
};

// for hiding nodes in the map
export const hideNodeAndItsLinks = (g: dagre.graphlib.Graph<{}>, nodeId: string, oldNodes: any, oldEdges: any) => {
  // for every parent
  for (let parent of oldNodes[nodeId].parents) {
    // if parent is visible on map
    if (parent.node in oldNodes) {
      // find index of nodeId in list of children of parent
      const childIdx = oldNodes[parent.node].children.findIndex((c: any) => c.node === nodeId);
      // copy list of children for parent node in oldNodes
      oldNodes[parent.node] = {
        ...oldNodes[parent.node],
        children: [...oldNodes[parent.node].children],
      };
      // update the child node of the parent node and make its visibility false
      oldNodes[parent.node].children[childIdx] = {
        ...oldNodes[parent.node].children[childIdx],
        visible: false,
        nodeType: oldNodes[nodeId].nodeType,
      };
    }
  }
  // for every child
  for (let child of oldNodes[nodeId].children) {
    // if child is visible on map
    if (child.node in oldNodes) {
      // find index of nodeId in list of parents of child
      const parentIdx = oldNodes[child.node].parents.findIndex((p: any) => p.node === nodeId);
      // copy list of parents for child node in oldNodes
      oldNodes[child.node] = {
        ...oldNodes[child.node],
        parents: [...oldNodes[child.node].parents],
      };
      // update the parent node of the child node and make its visibility false
      oldNodes[child.node].parents[parentIdx] = {
        ...oldNodes[child.node].parents[parentIdx],
        visible: false,
        nodeType: oldNodes[nodeId].nodeType,
      };
    }
  }

  // remove edges from this node to every other node
  oldEdges = removeDagAllEdges(g, nodeId, { ...oldEdges });
  // removes the node itself
  oldNodes = removeDagNode(g, nodeId, oldNodes);
  return { oldNodes, oldEdges };
};

// for showing a hidden node
export const makeNodeVisibleInItsLinks = (uNodeData: any, oldNodes: any, oldEdges: any /*, oldAllNodes: any*/) => {
  // copy list of the node's children to modify userNode object
  uNodeData.children = [...uNodeData.children];
  // for each child
  for (let childIdx = 0; childIdx < uNodeData.children.length; childIdx++) {
    // determines whether children are shown or hidden on map for setting child icons green or orange
    const child = uNodeData.children[childIdx];
    // change the visible attribute for each child node
    uNodeData.children[childIdx] = {
      ...uNodeData.children[childIdx],
      // whether the child is currently visible on the map
      // visible: child.node in oldAllNodes && "visible" in oldAllNodes[child.node] && oldAllNodes[child.node].visible
      visible: child.node in oldNodes && "visible" in oldNodes[child.node] && oldNodes[child.node].visible,
    };
  }
  uNodeData.parents = [...uNodeData.parents];
  for (let parentIdx = 0; parentIdx < uNodeData.parents.length; parentIdx++) {
    // determines whether parents are shown or hidden on map for setting parent icons green or orange
    const parent = uNodeData.parents[parentIdx];
    // change the visible attribute for each parent node
    uNodeData.parents[parentIdx] = {
      ...uNodeData.parents[parentIdx],
      // whether the parent is currently visible on the map
      visible: parent.node in oldNodes && "visible" in oldNodes[parent.node] && oldNodes[parent.node].visible,
    };
  }
  // for every child
  for (let child of uNodeData.children) {
    // if child is visible on map
    if (child.node in oldNodes) {
      // find index of nodeId in list of parents of child
      const parentIdx = oldNodes[child.node].parents.findIndex((p: any) => p.node === uNodeData.id);
      // copy list of parents for child node in oldNodes
      oldNodes[child.node] = {
        ...oldNodes[child.node],
        parents: [...oldNodes[child.node].parents],
      };
      // update the parent node of the child node and make its visibility true
      oldNodes[child.node].parents[parentIdx] = {
        ...oldNodes[child.node].parents[parentIdx],
        visible: true,
        nodeType: uNodeData.nodeType,
      };
    }
  }
  // for every parent
  for (let parent of uNodeData.parents) {
    // if parent is visible on map
    if (parent.node in oldNodes) {
      // find index of nodeId in list of children of parent
      const childIdx = oldNodes[parent.node].children.findIndex((c: any) => c.node === uNodeData.id);
      // copy list of children for parent node in oldNodes
      oldNodes[parent.node] = {
        ...oldNodes[parent.node],
        children: [...oldNodes[parent.node].children],
      };
      // update the child node of the parent node and make its visibility true
      oldNodes[parent.node].children[childIdx] = {
        ...oldNodes[parent.node].children[childIdx],
        visible: true,
        nodeType: uNodeData.nodeType,
      };
    }
  }
  return { uNodeData, oldNodes, oldEdges };
};

// for proposing links to existing parent/child nodes or creating new child nodes
// or the database signals that new parent/child links are added to a node
// nodeId: id of node that is being proposed on
// newNode: data of the node that is being proposed on
// called when any node from the database is loaded in order to create links from the node to existing nodes on the map
export const setNewParentChildrenEdges = (g: dagre.graphlib.Graph<{}>, nodeId: string, newNode: any, oldEdges: any) => {
  for (let child of newNode.children) {
    // checks whether the dagre object doesn't have any edge defined from nodeId to id of the child
    // should not add another edge if edge already exists
    if (!g.hasEdge(nodeId, child.node)) {
      // adds edge from nodeId to child to oldEdges
      oldEdges = setDagEdge(g, nodeId, child.node, { label: child.label }, oldEdges);
    }
  }
  for (let parent of newNode.parents) {
    // checks whether the dagre object doesn't have any edge defined from nodeId to id of the parent
    // should not add another edge if edge already exists
    if (!g.hasEdge(parent.node, nodeId)) {
      // adds edge from nodeId to parent to oldEdges
      oldEdges = setDagEdge(g, parent.node, nodeId, { label: parent.label }, oldEdges);
    }
  }
  return oldEdges;
};

// node: data of the node that is visible on the map
// newNode: the updated data of the node that should be changed on the map
// compares the links in node with newNode and if there is a difference, update oldEdges and dagre object
export const compareAndUpdateNodeLinks = (
  g: dagre.graphlib.Graph<{}>,
  node: any,
  nodeId: string,
  newNode: any,
  oldEdges: any
) => {
  // Put everything in CompareLinks.
  // for loops look at existing parent/child links of node
  // for each child of node on the map
  for (let child of node.children) {
    // check whether child of node is a child of newNode
    const newLink = linkExists(newNode.children, child);
    // if false, this child link is on the map but in updated data from database, it doesn't exist anymore
    if (newLink === false) {
      // child link should be removed from map
      oldEdges = removeDagEdge(g, nodeId, child.node, oldEdges);
      // indicates that some properties of the child link need to be updated
    } else if (newLink !== true) {
      oldEdges = setDagEdge(g, nodeId, child.node, newLink, oldEdges);
    }
  }
  // for each parent of node on the map
  for (let parent of node.parents) {
    // check whether parent of node is a parent of newNode
    const newLink = linkExists(newNode.parents, parent);
    // if false, this parent link is on the map but in updated data from database, it doesn't exist anymore
    if (newLink === false) {
      // parent link should be removed from map
      oldEdges = removeDagEdge(g, parent.node, nodeId, oldEdges);
      // indicates that some properties of the parent link need to be updated
    } else if (newLink !== true) {
      oldEdges = setDagEdge(g, parent.node, nodeId, newLink, oldEdges);
    }
  }
  // looks at new parent/child links that never existed before to node with nodeId
  return setNewParentChildrenEdges(g, nodeId, newNode, oldEdges);
};

export const createOrUpdateNode = (
  g: dagre.graphlib.Graph<{}>,
  newNode: any,
  nodeId: string,
  oldNodes: any,
  oldEdges: any,
  allTags: any
) => {
  // CHECK: object.children was node by I changed with newNode
  for (let childIdx = 0; childIdx < newNode.children.length; childIdx++) {
    const child = newNode.children[childIdx];
    // specify the visibility and type of the child nodes
    if (oldNodes[nodeId]) {
      // CHECK: this condition was added to ensure can access to oldNodes
      oldNodes[nodeId].children[childIdx] = {
        ...oldNodes[nodeId].children[childIdx],
        visible: child.node in oldNodes,
      };
      setTypeVisibilityOfParentInsideChild(oldNodes, nodeId, child.node);
    }
  }
  // CHECK: object.parents was node by I changed with newNode
  for (let parentIdx = 0; parentIdx < newNode.parents.length; parentIdx++) {
    const parent = newNode.parents[parentIdx];
    if (oldNodes[nodeId]) {
      oldNodes[nodeId].parents[parentIdx] = {
        ...oldNodes[nodeId].parents[parentIdx],
        visible: parent.node in oldNodes,
      };
    }
    setTypeVisibilityOfChildInsideParent(oldNodes, nodeId, parent.node);
  }
  let newNodeData;
  // set height to default node height
  // let height = NODE_HEIGHT;
  // height needs to continually be set to account for variation in node title, content, and image
  // if node is currently hidden on the map
  if (!(nodeId in oldNodes)) {
    newNodeData = {
      ...newNode,
      editable: false,
      // width: NODE_WIDTH,
      // height,
    };
    // adds newNode to dagre object and to oldNodes
    // null: no callback
    oldNodes = setDagNode(g, nodeId, newNodeData, oldNodes, allTags, null);
    // creates edges from newNode to children nodes
    for (let child of newNode.children) {
      oldEdges = setDagEdge(g, nodeId, child.node, { label: child.label }, oldEdges);
    }
    // creates edges from parent nodes to newNode
    for (let parent of newNode.parents) {
      oldEdges = setDagEdge(g, parent.node, nodeId, { label: parent.label }, oldEdges);
    }
    // if node is currently visible
  } else {
    const node = oldNodes[nodeId];
    // check whether any attributes of node from the map has changed from the attributes of the node stored in the database
    if (!compare2Nodes(newNode, node)) {
      // updates node links
      oldEdges = compareAndUpdateNodeLinks(g, node, nodeId, newNode, oldEdges);
      // if (
      //   "open" in newNode &&
      //   newNode.open &&
      //   "height" in newNode &&
      //   Number(newNode.height)
      // ) {
      //   height = Number(newNode.height);
      // } else if (
      //   "open" in newNode &&
      //   !newNode.open &&
      //   "closedHeight" in newNode &&
      //   Number(newNode.closedHeight)
      // ) {
      //   height = Number(newNode.closedHeight);
      // }
      newNodeData = {
        ...node,
        ...newNode,
        editable: false,
        // width: NODE_WIDTH,
        // height,
      };
      // if ("height" in newNode && newNode.height) {
      //   newNodeData.openHeight = newNode.height;
      // }
      oldNodes = setDagNode(g, nodeId, newNodeData, oldNodes, allTags, null);
    }
  }
  return { oldNodes, oldEdges };
};

// CHECK: this function is was working with objects
// but need to be modified to work with new arrays
// this works correctly in dashboard with array but,
// dont work in worker
export const copyNode = (node: FullNodeData): FullNodeData => {
  let newNode = { ...node };
  newNode.parents = [];
  for (let parent of node.parents) {
    newNode.parents.push({ ...parent });
  }
  newNode.children = [];
  for (let child of node.children) {
    newNode.children.push({ ...child });
  }
  // newNode.tagIds = [...node.tagIds];
  // newNode.tags = [...node.tags];
  newNode.tagIds = [];
  for (let tagId of node.tagIds) {
    // newNode.tagIds.push({ ...tagId });
    newNode.tagIds.push(tagId);
  }
  newNode.tags = [];
  for (let tag of node.tags) {
    // newNode.tags.push({ ...tag });
    newNode.tags.push(tag);
  }
  newNode.referenceIds = [];
  for (let referenceId of node.referenceIds) {
    // newNode.referenceIds.push({ ...referenceId });
    newNode.referenceIds.push(referenceId);
  }
  newNode.references = [];
  for (let reference of node.references) {
    // newNode.references.push({ ...reference });
    newNode.references.push(reference);
  }
  newNode.referenceLabels = [];
  if (node.referenceLabels) {
    for (let referenceLabel of node.referenceLabels) {
      // newNode.referenceLabels.push({ ...referenceLabel });
      newNode.referenceLabels.push(referenceLabel);
    }
  }

  if (newNode.nodeType === "Question") {
    newNode.choices = [];
    for (let choice of node.choices) {
      newNode.choices.push({ ...choice });
    }
  }
  return newNode;
};

export const copyGraph = (graph: any) => {
  let nodes = [];
  let edges = [];
  for (let node of graph.nodes) {
    let nod = { ...node };
    nod.parents = [];
    for (let parent of node.parents) {
      nod.parents.push({ ...parent });
    }
    nod.children = [];
    for (let child of node.children) {
      nod.children.push({ ...child });
    }
    nod.tags = [];
    for (let tag of node.tags) {
      nod.tags.push({ ...tag });
    }
    nod.references = [];
    for (let reference of node.references) {
      nod.references.push({ ...reference });
    }
    if (nod.nodeType === "Question") {
      nod.choices = [];
      for (let choice of node.choices) {
        nod.choices.push({ ...choice });
      }
    }
    nodes.push(nod);
  }
  for (let edge of graph.edges) {
    edges.push({ ...edge });
  }
  return { nodes, edges };
};

export const compareProperty = (obj1: any, obj2: any, propName: string) => {
  if ((propName in obj1 && !(propName in obj2)) || (!(propName in obj1) && propName in obj2)) {
    return false;
  }
  if (!(propName in obj1) && !(propName in obj2)) {
    return true;
  }
  if (obj1[propName] !== obj2[propName]) {
    return false;
  }
  return true;
};

export const compareFirestoreTimestamp = (obj1: any, obj2: any, propName: string) => {
  if ((propName in obj1 && !(propName in obj2)) || (!(propName in obj1) && propName in obj2)) {
    return false;
  }
  if (!(propName in obj1) && !(propName in obj2)) {
    return true;
  }
  if (obj1[propName].getTime() !== obj2[propName].getTime()) {
    return false;
  }
  return true;
};

export const compareLinks = (
  links1: any,
  links2: any,
  isTheSame: boolean,
  // if true, check type and visibility
  checkTypesVisibility: boolean
) => {
  if (links1.length !== links2.length) {
    return false;
  }
  // iterating through and comparing each of the links
  for (let i = 0; i < links1.length && isTheSame; i++) {
    if (
      links1[i].node !== links2[i].node ||
      links1[i].title !== links2[i].title ||
      !compareProperty(links1[i], links2[i], "label") ||
      (checkTypesVisibility &&
        (!compareProperty(links1[i], links2[i], "type") || !compareProperty(links1[i], links2[i], "visible")))
    ) {
      return false;
    }
  }
  return isTheSame;
};

export const compareFlatLinks = (links1: any, links2: any, isTheSame: boolean) => {
  if (links1.length !== links2.length) {
    return false;
  }
  for (let i = 0; i < links1.length; i++) {
    if (links1[i] !== links2[i]) {
      return false;
    }
  }
  return isTheSame;
};

export const compareChoices = (node1: any, node2: any, isTheSame: boolean) => {
  if (!("choices" in node1) && !("choices" in node2)) {
    return isTheSame;
  }
  if (("choices" in node1 && !("choices" in node2)) || (!("choices" in node1) && "choices" in node2)) {
    return false;
  }
  if (node1.choices.length !== node2.choices.length) {
    return false;
  }
  for (let i = 0; i < node1.choices.length && isTheSame; i++) {
    if (
      node1.choices[i].choice !== node2.choices[i].choice ||
      node1.choices[i].correct !== node2.choices[i].correct ||
      node1.choices[i].feedback !== node2.choices[i].feedback
    ) {
      return false;
    }
  }
  return isTheSame;
};

export const compare2Nodes = (node1: any, node2: any) => {
  if (Object.keys(node1).length !== Object.keys(node2).length) {
    return false;
  }
  if (
    node1.identifier !== node2.identifier ||
    node1.selectionType !== node2.selectionType ||
    node1.nodeType !== node2.nodeType ||
    node1.admin !== node2.admin ||
    node1.aImgUrl !== node2.aImgUrl ||
    node1.aFullname !== node2.aFullname ||
    node1.aChooseUname !== node2.aChooseUname ||
    node1.left !== node2.left ||
    node1.top !== node2.top ||
    node1.width !== node2.width ||
    node1.open !== node2.open ||
    node1.editable !== node2.editable ||
    node1.unaccepted !== node2.unaccepted ||
    node1.isNew !== node2.isNew ||
    node1.isTag !== node2.isTag ||
    node1.title !== node2.title ||
    node1.content !== node2.content ||
    node1.viewers !== node2.viewers ||
    node1.corrects !== node2.corrects ||
    node1.correct !== node2.correct ||
    node1.wrongs !== node2.wrongs ||
    node1.wrong !== node2.wrong ||
    node1.comments !== node2.comments ||
    node1.versions !== node2.versions ||
    node1.studied !== node2.studied ||
    node1.isStudied !== node2.isStudied ||
    node1.changed !== node2.changed ||
    !compareFirestoreTimestamp(node1, node2, "changedAt") ||
    !compareFirestoreTimestamp(node1, node2, "createdAt") ||
    !compareFirestoreTimestamp(node1, node2, "updatedAt") ||
    !compareFirestoreTimestamp(node1, node2, "firstVisit") ||
    !compareFirestoreTimestamp(node1, node2, "lastVisit") ||
    node1.bookmarked !== node2.bookmarked ||
    node1.bookmarks !== node2.bookmarks ||
    !compareFlatLinks(node1.referenceIds, node2.referenceIds, true) ||
    !compareFlatLinks(node1.references, node2.references, true) ||
    !compareFlatLinks(node1.referenceLabels, node2.referenceLabels, true) ||
    !compareFlatLinks(node1.tagIds, node2.tagIds, true) ||
    !compareFlatLinks(node1.tags, node2.tags, true) ||
    !compareLinks(node1.parents, node2.parents, true, true) ||
    !compareLinks(node1.children, node2.children, true, true) ||
    !compareChoices(node1, node2, true) ||
    !compareProperty(node1, node2, "nodeImage") ||
    node1.bookmark !== node2.bookmark ||
    node1.markStudied !== node2.markStudied ||
    node1.nodeChanged !== node2.nodeChanged ||
    node1.chosenNodeChanged !== node2.chosenNodeChanged ||
    node1.referenceLabelChange !== node2.referenceLabelChange ||
    node1.deleteLink !== node2.deleteLink ||
    node1.openLinkedNode !== node2.openLinkedNode ||
    node1.openAllChildren !== node2.openAllChildren ||
    node1.hideNodeHandler !== node2.hideNodeHandler ||
    node1.hideOffsprings !== node2.hideOffsprings ||
    node1.toggleNode !== node2.toggleNode ||
    node1.openNodePart !== node2.openNodePart ||
    node1.selectNode !== node2.selectNode ||
    node1.nodeClicked !== node2.nodeClicked ||
    node1.correctNode !== node2.correctNode ||
    node1.wrongNode !== node2.wrongNode ||
    node1.uploadNodeImage !== node2.uploadNodeImage ||
    node1.removeImage !== node2.removeImage ||
    node1.changeChoice !== node2.changeChoice ||
    node1.changeFeedback !== node2.changeFeedback ||
    node1.switchChoice !== node2.switchChoice ||
    node1.deleteChoice !== node2.deleteChoice ||
    node1.addChoice !== node2.addChoice
  ) {
    return false;
  }
  return true;
};

export const compareNodes = (nodes1: any, nodes2: any) => {
  if (Object.keys(nodes1).length !== Object.keys(nodes2).length) {
    return false;
  }
  for (let nId of Object.keys(nodes1)) {
    if (!compare2Nodes(nodes1[nId], nodes2[nId])) {
      return false;
    }
  }
  return true;
};

export const compareEdgeIds = (EdgeIds1: string[], EdgeIds2: string[]) => {
  if (EdgeIds1.length !== EdgeIds2.length) {
    return false;
  }
  for (let idx = 0; idx < EdgeIds1.length; idx++) {
    if (EdgeIds1[idx] !== EdgeIds2[idx]) {
      return false;
    }
  }
  return true;
};

export const compareEdges = (edges1: any, edges2: any) => {
  if (Object.keys(edges1).length !== Object.keys(edges2).length) {
    return false;
  }
  for (let eId of Object.keys(edges1)) {
    if (
      edges1[eId].label !== edges2[eId].label ||
      edges1[eId].fromX !== edges2[eId].fromX ||
      edges1[eId].fromY !== edges2[eId].fromY ||
      edges1[eId].toX !== edges2[eId].toX ||
      edges1[eId].toY !== edges2[eId].toY
    ) {
      return false;
    }
  }
  return true;
};

export const compareClusters = (clusters1: any, clusters2: any) => {
  if (Object.keys(clusters1).length !== Object.keys(clusters1).length) {
    return false;
  }
  for (let cId of Object.keys(clusters1)) {
    if (
      clusters1[cId].x !== clusters2[cId].x ||
      clusters1[cId].y !== clusters2[cId].y ||
      clusters1[cId].width !== clusters2[cId].width ||
      clusters1[cId].height !== clusters2[cId].height ||
      clusters1[cId].title !== clusters2[cId].title
    ) {
      return false;
    }
  }
  return true;
};

export const sortedEdgeIndex = (edges: any, newEdge: any) => {
  let low = 0,
    high = edges.length;

  while (low < high) {
    let mid = (low + high) >>> 1;
    if (edges[mid].from < newEdge.from || (edges[mid].from === newEdge.from && edges[mid].to < newEdge.to))
      low = mid + 1;
    else high = mid;
  }
  return low;
};

export const addNewEdge = (edges: any, from: string, to: string, label: string) => {
  const newEdge = {
    from,
    to,
    label,
    fromX: 0,
    fromY: 0,
    toX: 0,
    toY: 0,
  };
  const newEdgeIndex = sortedEdgeIndex(edges, newEdge);
  edges.splice(newEdgeIndex, 0, newEdge);
  return newEdge;
};

// verifies whether newLink exists in links array
export const linkExists = (links: any, newLink: any) => {
  for (let link of links) {
    if (link.node === newLink.node) {
      // for every other property other than node Id of newLink
      for (let key of Object.keys(newLink)) {
        // if that property does not exist in link or its value is different than in link
        if (!(key in link) || link[key] !== newLink[key]) {
          // indicates newLink exists in links but some of its properties are updated
          return newLink;
        }
      }
      // indicates newLink is in links
      return true;
    }
  }
  // indicates that no link in links has same node Id as the node Id for newLink
  return false;
};

// CHECK: this function was validated to execute build
export const getSelectionText = () => {
  var text = "";
  var activeEl = document.activeElement as HTMLInputElement;
  var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
  if (
    activeElTagName == "textarea" ||
    (activeElTagName == "input" &&
      activeEl && // CHECK <--- add this validation
      /^(?:text|search|password|tel|url)$/i.test(activeEl.type) &&
      typeof activeEl.selectionStart == "number")
  ) {
    text = activeEl.value.slice(activeEl.selectionStart || undefined, activeEl.selectionEnd || undefined);
  } else if (window?.getSelection) {
    text = (window.getSelection() || "").toString();
  }
  return text;
};

const applyTagRemove = (g: dagre.graphlib.Graph<{}>, oldAllTags: any, nodeId: string, dagreLoaded: boolean) => {
  if (nodeId in oldAllTags) {
    for (let parentTagId of oldAllTags[nodeId].tagIds) {
      oldAllTags[parentTagId].children = oldAllTags[parentTagId].children.filter((tgId: string) => tgId !== nodeId);
    }
    for (let childTagId of oldAllTags[nodeId].children) {
      oldAllTags[childTagId].tagIds = oldAllTags[childTagId].tagIds.filter((tgId: string) => tgId !== nodeId);
    }
    delete oldAllTags[nodeId];
    if (dagreLoaded && g.hasNode("Tag" + nodeId)) {
      g.removeNode("Tag" + nodeId);
    }
  }
};

export const applyAllTagChanges = (
  g: dagre.graphlib.Graph<{}>,
  oAllTags: any,
  docChanges: any,
  dagreLoaded: boolean
) => {
  let oldAllTags = { ...oAllTags };
  for (let change of docChanges) {
    const cType = change.type;
    const tagData = change.doc.data();
    const nodeId = tagData.node;
    if (tagData.deleted || cType === "removed") {
      applyTagRemove(g, oldAllTags, nodeId, dagreLoaded);
    } else {
      if (nodeId in oldAllTags) {
        oldAllTags[nodeId].title = tagData.title;
        // Handle tags change. UPDATE
        for (let tagIdx = 0; tagIdx < tagData.tagIds.length; tagIdx++) {
          const tagId = tagData.tagIds[tagIdx];
          const tag = tagData.tags[tagIdx];
          if (!oldAllTags[nodeId].tagIds.includes(tagId)) {
            oldAllTags[nodeId].tagIds.push(tagId);
            oldAllTags[nodeId].tags.push(tag);
            if (tagId in oldAllTags) {
              oldAllTags[tagId].children.push(nodeId);
            } else {
              // if not exist parent add in oldTags
              oldAllTags[tagId] = {
                nodeId: tagId,
                title: tag,
                children: [nodeId],
                checked: false,
                tags: [],
              };
            }
          }
        }
        for (let oldTagId of oldAllTags[nodeId].tagIds) {
          if (!tagData.tagIds.includes(oldTagId)) {
            oldAllTags[nodeId].tagIds = oldAllTags[nodeId].tagIds.filter((tgId: string) => tgId !== oldTagId);
            oldAllTags[oldTagId].children = oldAllTags[oldTagId].children.filter((tgId: string) => tgId !== nodeId);
          }
        }
      } else {
        // if not exist tag in oldAllTags,
        oldAllTags[nodeId] = {
          title: tagData.title,
          checked: false,
          nodeId,
          tagIds: tagData.tagIds,
          children: [],
        };
        // iterate every parent
        for (let parentTagIdx = 0; parentTagIdx < tagData.tagIds.length; parentTagIdx++) {
          const parentTagId = tagData.tagIds[parentTagIdx];
          const parentTag = tagData.tags[parentTagIdx];
          if (parentTagId in oldAllTags) {
            // if exist parent add the child
            oldAllTags[parentTagId].children.push(nodeId);
          } else {
            // if not exist parent, add parent
            oldAllTags[parentTagId] = {
              nodeId: parentTagId,
              title: parentTag,
              checked: false,
              tags: [],
              children: [nodeId],
            };
          }
        }
      }
    }
  }
  return oldAllTags;
};

{
  // const sortedNodeIndex = (nodes, newNode, attr) => {
  //   let low = 0,
  //     high = nodes.length;
  //   while (low < high) {
  //     let mid = (low + high) >>> 1;
  //     if (nodes[mid][attr] < newNode[attr]) low = mid + 1;
  //     else high = mid;
  //   }
  //   return low;
  // };
  // export const setOneNecessaryNode = (
  //   nodeId,
  //   nodeData,
  //   oldAllNodes,
  //   oldNodes,
  //   oldEdges,
  //   oldAllUserNodes,
  //   allTags
  // ) => {
  //   if (!(nodeId in oldAllNodes)) {
  //     delete nodeData.deleted;
  //     if (nodeData.isTag) {
  //       addToTags(nodeId, nodeData.title, setAllTags);
  //     }
  //     for (let tagNode of nodeData.tags) {
  //       addToTags(tagNode.node, tagNode.title, setAllTags);
  //     }
  //     addReference(nodeId, nodeData);
  //     let userNodeData = {
  //       ...nodeData,
  //       id: nodeId,
  //       visible: false,
  //       createdAt: nodeData.createdAt.toDate(),
  //       changedAt: nodeData.changedAt.toDate(),
  //       updatedAt: nodeData.updatedAt.toDate(),
  //     };
  //     if (nodeId in oldAllUserNodes) {
  //       userNodeData = {
  //         ...userNodeData,
  //         ...oldAllUserNodes[nodeId],
  //       };
  //     }
  //     if (userNodeData.nodeType !== "Question") {
  //       userNodeData.choices = [];
  //     }
  //     oldAllNodes[nodeId] = userNodeData;
  //     ({ oldNodes, oldEdges } = createOrUpdateNode(userNodeData, nodeId, oldNodes, oldEdges, allTags));
  //   }
  //   return { oldNodes, oldEdges, oldAllNodes };
  // };
  // export const compareImages = (node1, node2, isTheSame) => {
  //   if (
  //     ("nodeImage" in node1 && !("nodeImage" in node2)) ||
  //     (!("nodeImage" in node1) && ("nodeImage" in node2))
  //   ) {
  //     return false;
  //   }
  //   // if both nodes do not have nodeImage attribute
  //   if (!("nodeImage" in node1) && !("nodeImage" in node2)) {
  //     return isTheSame;
  //   }
  //   if (node1.nodeImage !== node2.nodeImage) {
  //     return false;
  //   }
  //   return isTheSame;
  // };
}
