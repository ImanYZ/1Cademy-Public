import {
  admin,
  checkRestartBatchWriteCounts,
  commitBatch,
  db,
  MIN_ACCEPTED_VERSION_POINT_WEIGHT,
} from "../lib/firestoreServer/admin";
import { WriteBatch } from "firebase-admin/firestore";
import {
  deleteTagCommunityAndTagsOfTags,
  getAllUserNodes,
  getNode,
  getTypedCollections,
  getUserNode,
  retrieveAndsignalAllUserNodesChanges,
  signalAllUserNodesChanges,
  updateReputation,
} from ".";

export const setOrIncrementNotificationNums = async ({
  batch,
  proposer,
  writeCounts,
}: {
  batch: WriteBatch;
  proposer: string;
  writeCounts: number;
}): Promise<[WriteBatch, number]> => {
  let newBatch = batch;
  const notificationNumRef = db.collection("notificationNums").doc(proposer);
  const notificationNumDoc = await notificationNumRef.get();
  if (notificationNumDoc.exists) {
    newBatch.update(notificationNumRef, { nNum: admin.firestore.FieldValue.increment(1) });
  } else {
    newBatch.set(notificationNumRef, { nNum: 1 });
  }
  [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  return [newBatch, writeCounts];
};

// Cases
// - Upvote
// - Downvote
// - Upvote and Remove Downvote
// - Remove Upvote and Downvote
// - Remove Upvote
// - Remove Downvote

// Sub Logics
// - increase corrects/wrongs on active proposals by this formula (currentProposalNetVote/maxProposalNetVote) + upvoteOrDownVote
// - Delete node if downvotes are more than upvotes
//   - flag all user nodes as delete related to node
//   - remove it from parents (for each) -> children property and signal all usernodes for each parent for nodeChanges
//   - remove it from children (for each) -> parents property and signal all usernodes for each child for nodeChanges
//   - if node is a tag
//     - remove its id from tagIds of every node that has tagged this node
//     - remove reputation documents (weekly, monthly and all-time) that related to this community (missing logic)
//     - remove community points (weekly, monthly and all-time) documents related to this community
//   - if node type is reference
//     - remove node id (references, referenceIds and referenceLabels) from each node that this node's id in referenceIds
//     - mark isStudied=false for each node that had reference of this node
// - if node is not deleted then update votes data in each user node related to this node
//   - if deleted then signal all usernodes that node is deleted and
// - increase notifications count for proposers
// - create notification that has data for actionType
// - create userNodeLog (it stores all actions of Wrongs and Corrects)

//  Up/down-votes nodes
export const UpDownVoteNode = async ({ uname, nodeId, fullname, imageUrl, actionType, chooseUname }: any) => {
  let correct = false;
  let wrong = false;
  let deleteNode = false;
  let correctChange = 0;
  let wrongChange = 0;
  const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());

  let batch = db.batch();

  let writeCounts = 0;
  let { nodeData, nodeRef, nodeExists } = await getNode({ nodeId });
  // restricting voting for nodes that already exists
  if (!nodeExists) {
    throw new Error("Node doesn't exists.");
  }
  let { userNodeData, userNodeRef }: any = await getUserNode({ nodeId, uname });
  let { userNodesRefs, userNodesData }: any = await getAllUserNodes({ nodeId });
  let maxVersionRating = nodeData.maxVersionRating;
  // if user already voted on this node
  if (userNodeData) {
    correct = userNodeData.correct;
    wrong = userNodeData.wrong;
  }

  if (actionType === "Correct") {
    //  if upvoted, remove the upvote
    correctChange = correct ? -1 : 1;
    //  if downvoted, remove downvote, add upvote
    wrongChange = !correct && wrong ? -1 : 0;
  } else if (actionType === "Wrong") {
    //  exact opposite of correct
    correctChange = !wrong && correct ? -1 : 0;
    wrongChange = wrong ? -1 : 1;
  }
  //  if the new change yields node with more downvotes than upvotes, DELETE
  if (nodeData.corrects + correctChange < nodeData.wrongs + wrongChange) {
    deleteNode = true;
    [batch, writeCounts] = await signalAllUserNodesChanges({
      batch,
      userNodesRefs,
      userNodesData,
      nodeChanges: {},
      major: true,
      deleted: deleteNode,
      currentTimestamp,
      writeCounts,
    });

    // Delete the node from the list of children of each parent node
    for (let parentLink of nodeData.parents) {
      const parentId = parentLink.node;
      const parentNode = await getNode({ nodeId: parentId });
      //  filter out node to be deleted
      const newChildren = parentNode.nodeData.children.filter((l: any) => l.node !== nodeId);
      const nodeChanges = {
        children: newChildren,
        changedAt: currentTimestamp,
        updatedAt: currentTimestamp,
      };
      batch.update(parentNode.nodeRef, nodeChanges);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
        batch,
        linkedId: parentId,
        nodeChanges,
        major: true,
        currentTimestamp,
        writeCounts,
      });
    }
    // Delete the node from the list of parents of each child node
    for (let childLink of nodeData.children) {
      const childId = childLink.node;
      const childNode: any = await getNode({ nodeId: childId });
      //  filter out node to be deleted
      const newParents = childNode.nodeData.parents.filter((l: any) => l.node !== nodeId);
      const nodeChanges = {
        parents: newParents,
        changedAt: currentTimestamp,
        updatedAt: currentTimestamp,
      };
      batch.update(childNode.nodeRef, nodeChanges);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
        batch,
        linkedId: childId,
        nodeChanges,
        major: true,
        currentTimestamp,
        writeCounts,
      });
    }
    //  retrieve all the nodes that are tagging this current node, then remove current node from their list of tags
    if (nodeData.isTag) {
      const taggedNodesRefs = db.collection("nodes").where("tagIds", "array-contains", nodeId);
      const taggedNodesDocs = await taggedNodesRefs.get();
      //  Delete tag from the list of nodes that contain it
      for (let taggedNodeDoc of taggedNodesDocs.docs) {
        const taggedNodeRef = db.collection("nodes").doc(taggedNodeDoc.id);
        const taggedNodeData = taggedNodeDoc.data();
        //  remove tag from node
        const tagIdx = taggedNodeData.tagIds.findIndex((tagId: any) => tagId === nodeId);
        if (tagIdx !== -1) {
          taggedNodeData.tagIds.splice(tagIdx, 1);
          taggedNodeData.tags.splice(tagIdx, 1);
          const nodeChanges = {
            tagIds: taggedNodeData.tagIds,
            tags: taggedNodeData.tags,
            changedAt: currentTimestamp,
            updatedAt: currentTimestamp,
          };
          batch.update(taggedNodeRef, nodeChanges);
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
          [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
            batch,
            linkedId: taggedNodeDoc.id,
            nodeChanges,
            major: true,
            currentTimestamp,
            writeCounts,
          });
        }
      }
      [batch, writeCounts] = await deleteTagCommunityAndTagsOfTags({ batch, nodeId, writeCounts });
    }
    //  Iterate through tags in nodeData and obtain other nodes with the same tag that are not deleted
    //  if such nodes exist, set isTag property to false
    for (let tagId of nodeData.tagIds) {
      const taggedNodeDocs = await db
        .collection("nodes")
        .where("tagIds", "array-contains", tagId)
        .where("deleted", "==", false)
        .get();
      if (taggedNodeDocs.docs.length <= 1) {
        [batch, writeCounts] = await deleteTagCommunityAndTagsOfTags({ batch, nodeId: tagId, writeCounts });
        const tagNodeRef = db.collection("nodes").doc(tagId);
        batch.update(tagNodeRef, { isTag: false, updatedAt: currentTimestamp });
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      }
    }
    //  query all the nodes that are referencing current node with nodeId
    if (nodeData.nodeType === "Reference") {
      const citingNodesRefs = db.collection("nodes").where("referenceIds", "array-contains", nodeId);
      const citingNodesDocs = await citingNodesRefs.get();

      for (let citingNodeDoc of citingNodesDocs.docs) {
        const citingNodeRef = db.collection("nodes").doc(citingNodeDoc.id);
        const citingNodeData = citingNodeDoc.data();
        const referenceIdx = citingNodeData.referenceIds.findIndex(nodeId);
        if (referenceIdx !== -1) {
          citingNodeData.references.splice(referenceIdx, 1);
          citingNodeData.referenceLabels.splice(referenceIdx, 1);
          citingNodeData.referenceIds.splice(referenceIdx, 1);
          const nodeChanges = {
            references: citingNodeData.references,
            referenceLabels: citingNodeData.referenceLabels,
            referenceIds: citingNodeData.referenceIds,
            changedAt: currentTimestamp,
            updatedAt: currentTimestamp,
          };
          batch.update(citingNodeRef, nodeChanges);
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
          [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
            batch,
            linkedId: citingNodeDoc.id,
            nodeChanges,
            major: true,
            currentTimestamp,
            writeCounts,
          });
        }
      }
    }
  }

  //  query versions in order to update the upvotes / downvotes in addition to reputations
  const { versionsColl }: any = getTypedCollections({ nodeType: nodeData.nodeType });
  const versionsQuery = versionsColl
    .where("node", "==", nodeId)
    .where("accepted", "==", true)
    .where("deleted", "==", false);

  let versionsDocs = await versionsQuery.get();
  //  there may be more than one proposal on a node, only one reputation change per user.
  //  which means proposer is the key to the dictionary
  let changedProposers: any = {};

  let maxVersionNetVotes = 1;
  // finding max net vote from active proposals
  for (let versionDoc of versionsDocs.docs) {
    const versionData = versionDoc.data();
    const versionNetVote = versionData.corrects - versionData.wrongs || 0;
    if (maxVersionNetVotes < versionNetVote) {
      maxVersionNetVotes = versionNetVote;
    }
  }

  for (let versionDoc of versionsDocs.docs) {
    const versionData = versionDoc.data();
    let versionRatingChange =
      Math.max(MIN_ACCEPTED_VERSION_POINT_WEIGHT, versionData.corrects - versionData.wrongs) / maxVersionNetVotes;
    // edge case if node has 0 up-down votes
    if (nodeData.corrects === 0 && nodeData.wrongs === 0) {
      versionRatingChange = 1;
    }
    const correctVal = Math.round((correctChange * versionRatingChange + Number.EPSILON) * 100) / 100;
    const wrongVal = Math.round((wrongChange * versionRatingChange + Number.EPSILON) * 100) / 100;

    // Updating the accepted version points.
    const versionRef = versionsColl.doc(versionDoc.id);
    const versionChanges = {
      //  minimum value 0, for number of correct or wrongs on each version
      wrongs: Math.max(0, versionData.wrongs + wrongVal),
      corrects: Math.max(0, versionData.corrects + correctVal),
      updatedAt: currentTimestamp,
    };
    batch.update(versionRef, versionChanges);
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

    // Update the maxVersionRating correspondingly.
    const versionRating = versionChanges.corrects - versionChanges.wrongs;
    if (versionRating > maxVersionRating && versionRating >= 1) {
      maxVersionRating = versionRating;
    }
    //  if proposer not already in the dictionary
    if (!(versionData.proposer in changedProposers)) {
      //  finding to what extend the upvote or downvote will affect the reputation of the specific proposer
      //  MIN_ACCEPTED_VERSION_POINT_WEIGHT defines the minimum affect a single upvote or downvote will have on a given proposer's reputation
      //  due to a specific version that they proposed that is accepted.

      //  Math.max disallows negative values. Therefore, a proposal with many negative votes will still cause proposer to lose reputation
      //  We also do not want 0 value, which will cause upvote or downvote to have no affect on proposal's points and its proposer's reputation.
      //  Number.EPSILON * 100 then dividing by 100 ensures two decimal places.

      changedProposers[versionData.proposer] = {
        imageUrl: versionData.imageUrl,
        fullname: versionData.fullname,
        chooseUname: versionData.chooseUname,
        correctVal,
        wrongVal,
      };
    } else {
      //  if proposer already in dictionary, accumulate values
      changedProposers[versionData.proposer] = {
        ...changedProposers[versionData.proposer],
        correctVal: changedProposers[versionData.proposer].correctVal + correctVal,
        wrongVal: changedProposers[versionData.proposer].wrongVal + wrongVal,
      };
    }
  }

  for (let proposer in changedProposers) {
    // Updating the proposer reputation points.
    [batch, writeCounts] = await updateReputation({
      batch,
      uname: proposer,
      imageUrl: changedProposers[proposer].imageUrl,
      fullname: changedProposers[proposer].fullname,
      chooseUname: changedProposers[proposer].chooseUname,
      tagIds: nodeData.tagIds,
      tags: nodeData.tags,
      nodeType: nodeData.nodeType,
      correctVal: changedProposers[proposer].correctVal,
      wrongVal: changedProposers[proposer].wrongVal,
      instVal: 0,
      ltermVal: 0,
      ltermDayVal: 0,
      voter: uname,
      writeCounts,
    });
    // Notifying the proposer about gaining or losing a point.
    const notificationRef = db.collection("notifications").doc();
    const notificationData = {
      proposer,
      uname,
      imageUrl,
      fullname,
      chooseUname,
      nodeId,
      title: nodeData.title,
      // Origin type
      oType: "Node",
      // Action type
      aType: "",
      checked: false,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
    };
    if (deleteNode) {
      notificationData.aType = "Delete";
    } else {
      if (actionType === "Correct") {
        if (correct) {
          notificationData.aType = "CorrectRM";
        } else {
          notificationData.aType = "Correct";
        }
      } else if (actionType === "Wrong") {
        if (wrong) {
          notificationData.aType = "WrongRM";
        } else {
          notificationData.aType = "Wrong";
        }
      }
    }
    if (notificationData.aType !== "") {
      batch.set(notificationRef, notificationData);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      [batch, writeCounts] = await setOrIncrementNotificationNums({ batch, proposer, writeCounts });
    }
  }
  // Updating the node document accordingly.
  const nodeChanges: any = {
    updatedAt: currentTimestamp,
    maxVersionRating: maxVersionRating,
    wrongs: nodeData.wrongs + wrongChange,
    corrects: nodeData.corrects + correctChange,
  };
  if (deleteNode) {
    nodeChanges.deleted = true;
  } else {
    [batch, writeCounts] = await signalAllUserNodesChanges({
      batch,
      userNodesRefs,
      userNodesData,
      nodeChanges,
      major: false,
      deleted: false,
      currentTimestamp,
      writeCounts,
    });
  }
  batch.update(nodeRef, nodeChanges);
  [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

  let newuserNodeObj: any = {};
  if (userNodeData) {
    newuserNodeObj.changed = false;
    if (actionType === "Correct") {
      newuserNodeObj.correct = !correct;
      if (newuserNodeObj.correct) {
        newuserNodeObj.wrong = false;
      }
    } else {
      newuserNodeObj.wrong = !wrong;
      if (newuserNodeObj.wrong) {
        newuserNodeObj.correct = false;
      }
    }
    if (deleteNode) {
      newuserNodeObj.deleted = true;
    }
    newuserNodeObj = {
      ...userNodeData,
      ...newuserNodeObj,
    };
  } else {
    // Create a reference to a document that doesn't exist yet, it has a random id
    newuserNodeObj = {
      changed: false,
      correct: actionType === "Correct",
      createdAt: currentTimestamp,
      deleted: deleteNode,
      isStudied: false,
      bookmarked: false,
      node: nodeId,
      open: true,
      user: uname,
      visible: true,
      wrong: actionType === "Wrong",
    };
  }
  const userNodeLogRef = db.collection("userNodesLog").doc();
  batch.set(userNodeLogRef, newuserNodeObj);
  [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
  newuserNodeObj.updatedAt = currentTimestamp;
  batch.set(userNodeRef, newuserNodeObj);

  await commitBatch(batch);
};
