import { admin, checkRestartBatchWriteCounts, commitBatch, db, TWriteOperation } from "../lib/firestoreServer/admin";
import { DocumentData, QueryDocumentSnapshot, WriteBatch } from "firebase-admin/firestore";
import {
  getAllUserNodes,
  getNode,
  getTypedCollections,
  getUserNode,
  signalAllUserNodesChanges,
  updateReputation,
} from ".";
import { detach, doNeedToDeleteNode, getNodeTypesFromNode, MIN_ACCEPTED_VERSION_POINT_WEIGHT } from "./helpers";
import {
  indexNodeChange,
  signalNodeDeleteToTypesense,
  signalNodeVoteToTypesense,
  updateNodeContributions,
} from "./version-helpers";
import { IActionTrack } from "src/types/IActionTrack";
import { IUser } from "src/types/IUser";
import { IComReputationUpdates } from "./reputations";
import { checkInstantDeleteForNode } from "./course-helpers";

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
//   - if deleted then signal all usernodes that node is deleted
// - increase notifications count for proposers
// - create notification that has data for actionType
// - create userNodeLog (it stores all actions of Wrongs and Corrects)

//  Up/down-votes nodes
export const UpDownVoteNode = async ({
  uname,
  nodeId,
  fullname,
  imageUrl,
  actionType,
  chooseUname,
  t,
  tWriteOperations,
}: any) => {
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

  let willRemoveNode = false;
  if (wrongChange === 1) {
    const { courseExist, instantDelete } = await checkInstantDeleteForNode(nodeData?.tagIds || [], uname, nodeId);
    if (courseExist) {
      willRemoveNode = instantDelete;
    } else {
      //  if the new change yields node with more downvotes than upvotes, DELETE
      // node should not be deleted if its a locked node
      willRemoveNode = doNeedToDeleteNode(
        nodeData.corrects + correctChange,
        nodeData.wrongs + wrongChange,
        !!nodeData?.locked
      );
    }
  }

  if (willRemoveNode) {
    // signal search about deletion of node
    await detach(async () => {
      await indexNodeChange(nodeId, nodeData.title, "DELETE");
    });
    deleteNode = true;
  }

  //  query versions in order to update the upvotes / downvotes in addition to reputations
  const { versionsColl }: any = getTypedCollections();
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
  await detach(async () => {
    let batch = db.batch();
    let writeCounts = 0;
    for (const versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();
      const versionNetVote = versionData.corrects - versionData.wrongs || 0;
      if (maxVersionNetVotes < versionNetVote) {
        maxVersionNetVotes = versionNetVote;
      }
    }
    for (const versionDoc of versionsDocs.docs) {
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
      console.log("changedProposers", changedProposers);
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

    for (const proposer in changedProposers) {
      // we need update contributors, contribNames, institNames, institutions
      // TODO: move these to queue

      await updateNodeContributions({
        nodeId,
        uname: proposer,
        accepted: true,
        contribution: changedProposers[proposer].correctVal - changedProposers[proposer].wrongVal,
      });
    }
    await commitBatch(batch);
  });

  // TODO: move these to queue
  // action tracks
  await detach(async () => {
    let batch = db.batch();

    let actions: string[] = [];
    let receivers: string[] = Object.keys(changedProposers);

    if (actionType === "Correct") {
      if (correctChange === 1) {
        actions.push("Correct");
      } else if (correctChange === -1) {
        actions.push("CorrectRM");
      }

      if (wrongChange === -1) {
        actions.push("WrongRM");
      }
    } else if (actionType === "Wrong") {
      if (wrongChange === 1) {
        actions.push("Wrong");
      } else if (wrongChange === -1) {
        actions.push("WrongRM");
      }

      if (correctChange === -1) {
        actions.push("CorrectRM");
      }
    }

    for (const action of actions) {
      const user = await db.collection("users").doc(uname).get();
      const userData = user.data() as IUser;

      let actionRef = db.collection("actionTracks").doc();
      batch.set(actionRef, {
        accepted: true,
        type: "NodeVote",
        action,
        createdAt: currentTimestamp,
        doer: uname,
        chooseUname: userData.chooseUname,
        fullname: `${userData.fName} ${userData.lName}`,
        imageUrl: userData.imageUrl,
        nodeId,
        receivers,
        receiverPoints: receivers.map(
          proposer => changedProposers[proposer].correctVal - changedProposers[proposer].wrongVal
        ),
        email: userData.email,
      } as IActionTrack);
    }

    await commitBatch(batch);
  });

  const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
  const comReputationUpdates: IComReputationUpdates = {};
  console.log("==>changedProposers==>", changedProposers);
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
      comReputationUpdates,
      t,
      tWriteOperations,
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

  for (const tagId in comReputationUpdates) {
    for (const reputationType of reputationTypes) {
      if (!comReputationUpdates[tagId][reputationType]) continue;

      if (t) {
        tWriteOperations.push({
          objRef: comReputationUpdates[tagId][reputationType].docRef,
          data: comReputationUpdates[tagId][reputationType].docData,
          operationType: comReputationUpdates[tagId][reputationType].isNew ? "set" : "update",
        });
      } else {
        if (comReputationUpdates[tagId][reputationType].isNew) {
          batch.set(
            comReputationUpdates[tagId][reputationType].docRef,
            comReputationUpdates[tagId][reputationType].docData
          );
        } else {
          batch.update(
            comReputationUpdates[tagId][reputationType].docRef,
            comReputationUpdates[tagId][reputationType].docData
          );
        }
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      }
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
    // TODO: move these to queue
    await detach(async () => {
      let batch = db.batch();
      let writeCounts = 0;
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
      await commitBatch(batch);
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

  // TODO: move these to queue
  await detach(async () => {
    if (deleteNode) {
      await signalNodeDeleteToTypesense({
        nodeId,
      });
    } else {
      await signalNodeVoteToTypesense({
        nodeId,
        corrects: nodeChanges.corrects,
        wrongs: nodeChanges.wrongs,
      });
    }
  });
};
