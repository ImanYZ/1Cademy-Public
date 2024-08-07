import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IActionTrack } from "src/types/IActionTrack";
import { INode } from "src/types/INode";
import { INodeLink } from "src/types/INodeLink";
import { INodeType } from "src/types/INodeType";
import { IQuestionChoice } from "src/types/IQuestionChoice";
import { IUser } from "src/types/IUser";
import { IUserNode } from "src/types/IUserNode";
import { shouldInstantApprovalForProposal, updateStatsOnProposal } from "src/utils/course-helpers";
import { detach } from "src/utils/helpers";
import { IComReputationUpdates } from "src/utils/reputations";
import { generateTagsOfTagsWithNodes, signalNodeToTypesense, updateNodeContributions } from "src/utils/version-helpers";

import { admin, checkRestartBatchWriteCounts, commitBatch, db } from "../../lib/firestoreServer/admin";
import {
  addToPendingPropsNums,
  createPractice,
  generateTagsData,
  getAllUserNodes,
  getNode,
  getTypedCollections,
  proposalNotification,
  signalAllUserNodesChanges,
  updateReputation,
} from "../../utils";

export type IProposeParentNodePayload = {
  data: {
    childId?: string;
    notebookId: string;
    versionNodeId?: string;
    nodeType: INodeType;
    children: INodeLink[];
    title: string;
    content: string;
    nodeImage?: string;
    nodeVideo?: string;
    nodeVideoStartTime?: string;
    nodeVideoEndTime?: string;
    nodeAudio?: string;
    parents: INodeLink[];
    proposal: string;
    referenceIds: string[];
    references: string[];
    referenceLabels: string[];
    summary: string;
    subType?: string | null; // not implemented yet
    tagIds: string[];
    tags: string[];
    choices?: IQuestionChoice[]; // only comes with NodeType=Question
  };
};

// TODO: why we are increasing reputation in parentType instead of nodeType (line no. 125)
// TODO: passing parentType from payload (line no. 288)
// TODO: version-helpers.ts, odd logic at line no. 924 (function only return possible tags and tagIds and haven't used those values)
// TODO: find out why we are sending version proposer as admin to generateTagData function (line no. 210)
// TODO: check if given node type is valid
// TODO: check if parent node even exists
// Logic
// child node version should have choices array if child's nodeType=Question
// check if version is approved ( versionNetVote (its child node in this case) >= parentNodeNetVote / 2 )
// - if its not approved then
//   - increase reputation of proposer and add nodeId, accepted=false and childType=payload.nodeType
//   - increment versions count of parent node
//   - increment notification count (pendingPropsNums) for each community member beside who is proposing version
// - if its approved then
//   - increase reputation of proposer and add nodeId (new node id), accepted=true and nodeType=payload.nodeType
//   - create new node with given data
//   - new node should have choices property if its NodeType=Question and createPractice (skipping practice test for now as its not implemented)
//   - add child in children array of parent node
//   - single all user nodes for parent node and flag them isStudied=false because, its a major change
//   - create user node for new node and set user=proposer, isStudied=true, correct=true, open=true, visible=true
//   - create user node log for new node
// - create version doc (if approved it would be under new node and if not it would be under parent node with childType)
// - create user node version for proposer and set correct=true
// - create user node version log for proposer
// - create notification for proposer, should have aType=newChild and set oType=Propo if version not get accepted and oType=PropoAccept if version get accepted
// - increment notificationNums +1 for proposer
async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Propose parent node");
  let nodeRef, nodeData, userNodesData: any, userNodesRefs: any;

  const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
  let writeCounts = 0;
  let batch = db.batch();

  const userData = req.body.data.user.userData as IUser;
  const payload = req.body.data as any;

  const inststructorDoc = await db.collection("instructors").where("uname", "==", userData.uname).get();

  if (inststructorDoc.docs.length === 0) {
    return res.status(403).json({ error: "You are not an instructor", success: false });
  }
  try {
    const { versionNodeId, nodeVideoStartTime, nodeVideoEndTime } = req?.body?.data;

    if (payload.childId) {
      //if we are proposing the first parent of a knowledge graph, we don't have a childId
      ({ nodeData, nodeRef } = await getNode({ nodeId: payload.childId }));
      ({ userNodesData, userNodesRefs } = await getAllUserNodes({ nodeId: payload.childId }));
    }

    // adding missing tags/tagIds
    let tagUpdates = {
      tags: [],
      tagIds: [],
    };
    const nodesMap: {
      [nodeId: string]: INode;
    } = {};
    const visitedNodeIds: string[] = [];
    await generateTagsOfTagsWithNodes({
      nodeId: "", // newer node don't have node id
      tagIds: payload.tagIds || [],
      nodeUpdates: tagUpdates,
      nodes: nodesMap,
      visitedNodeIds,
    });

    const newVersion: any = {
      awards: 0,
      children: payload.children,
      title: payload.title,
      content: payload.content,
      nodeImage: payload.nodeImage || "",
      nodeVideo: payload.nodeVideo || "",
      nodeVideoStartTime: nodeVideoStartTime || "",
      nodeVideoEndTime: nodeVideoEndTime || "",
      nodeAudio: payload.nodeAudio || "",
      corrects: 1,
      createdAt: currentTimestamp,
      deleted: false,
      proposer: userData.uname,
      imageUrl: userData.imageUrl,
      fullname: userData.fName + " " + userData.lName,
      chooseUname: userData.chooseUname,
      parents: payload.parents,
      proposal: payload.proposal,
      referenceIds: payload.referenceIds,
      references: payload.references,
      referenceLabels: payload.referenceLabels,
      summary: payload.summary,
      newChild: true,
      subType: payload.subType || "",
      tagIds: tagUpdates.tagIds,
      tags: tagUpdates.tags,
      updatedAt: currentTimestamp,
      viewers: 1,
      wrongs: 0,
    };

    console.log({ newVersion });
    if (payload.nodeType === "Question") {
      newVersion.choices = payload.choices;
    }
    const { isInstructor, courseExist, instantApprove } = await shouldInstantApprovalForProposal(
      newVersion?.tagIds || [],
      userData.uname
    );
    console.log("1");
    let childNodeData = null;
    if (courseExist) {
      childNodeData = instantApprove ? nodeData : null;
    } else if (isInstructor) {
      childNodeData = nodeData;
    }
    console.log("2");
    // TODO: i think we should run transaction here
    const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
    const comReputationUpdates: IComReputationUpdates = {};

    if (!childNodeData && nodeRef) {
      await detach(async () => {
        let batch = db.batch();
        [batch, writeCounts] = await updateReputation({
          batch,
          uname: userData.uname,
          imageUrl: userData.imageUrl,
          fullname: userData.fName + " " + userData.lName,
          chooseUname: userData.chooseUname,
          tagIds: newVersion.tagIds,
          tags: newVersion.tags,
          nodeType: payload.parentType,
          correctVal: 1,
          wrongVal: 0,
          instVal: 0,
          ltermVal: 0,
          ltermDayVal: 0,
          voter: userData.uname,
          writeCounts,
          comReputationUpdates,
          t: null,
          tWriteOperations: [],
        });
      });
      newVersion.childType = payload.nodeType;
      newVersion.node = payload.childtId;
      newVersion.accepted = false;

      // Update the parent node by incrementing the number of versions on it.
      batch.update(nodeRef, {
        updatedAt: currentTimestamp,
        versions: nodeData.versions + 1,
      });
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

      [batch, writeCounts] = await addToPendingPropsNums({
        batch,
        tagIds: nodeData.tagIds,
        value: 1,
        voters: [userData.uname],
        writeCounts,
      });
    } else {
      console.log("else");
      await detach(async () => {
        let batch = db.batch();
        let writeCounts = 0;
        [batch, writeCounts] = await updateReputation({
          batch,
          uname: userData.uname,
          imageUrl: userData.imageUrl,
          fullname: userData.fName + " " + userData.lName,
          chooseUname: userData.chooseUname,
          tagIds: payload.tagIds,
          tags: payload.tags,
          nodeType: payload.nodeType,
          correctVal: 1,
          wrongVal: 0,
          instVal: 0,
          ltermVal: 0,
          ltermDayVal: 0,
          voter: userData.uname,
          writeCounts,
          comReputationUpdates,
          t: null,
          tWriteOperations: [],
        });
        await commitBatch(batch);
      });

      let nodeRef = db.collection("nodes").doc();
      if (versionNodeId && !(await db.collection("nodes").doc(versionNodeId).get()).exists) {
        nodeRef = db.collection("nodes").doc(versionNodeId);
      }
      newVersion.node = nodeRef.id;
      console.log("newVersion.node", newVersion.node);
      newVersion.accepted = true;
      const newNode: any = {
        admin: userData.uname,
        aImgUrl: userData.imageUrl,
        aFullname: userData.fName + " " + userData.lName,
        aChooseUname: userData.chooseUname,
        maxVersionRating: 1,
        changedAt: currentTimestamp,
        children: payload.children,
        comments: 0,
        content: payload.content,
        nodeImage: payload.nodeImage || "",
        nodeVideo: payload.nodeVideo || "",
        nodeAudio: payload.nodeAudio || "",
        corrects: 1,
        createdAt: currentTimestamp,
        deleted: false,
        nodeType: payload.nodeType,
        subType: payload.subType,
        parents: payload.parents,
        referenceIds: payload.referenceIds,
        references: payload.references,
        referenceLabels: payload.referenceLabels,
        studied: 1,
        tagIds: tagUpdates.tagIds,
        tags: tagUpdates.tags,
        title: payload.title,
        updatedAt: currentTimestamp,
        versions: 1,
        viewers: 1,
        wrongs: 0,
        isTag: false,
      };
      console.log("newNode", newNode);

      if (nodeVideoStartTime) {
        newNode.nodeVideoStartTime = nodeVideoStartTime;
      }
      if (nodeVideoEndTime) {
        newNode.nodeVideoEndTime = nodeVideoEndTime;
      }
      // If a question node gets accepted, it should be added to the practice tool for all
      // users in the communities with the tags that are used on this node.
      // That's why we need to get the list of all members of each of these tags (communities).
      if (payload.nodeType === "Question") {
        newNode.choices = payload.choices;
        [batch, writeCounts] = await createPractice({
          batch,
          unames: [],
          tagIds: payload.tagIds,
          nodeId: nodeRef.id,
          parentId: payload.parents[0].id,
          currentTimestamp,
          writeCounts,
        });
      }
      console.log("3");
      // A child node is being created. So, based on the tags on the node, we should make
      // the corresponding changes in the tags collection. At this point, we generate tagsData
      // to prepare for the changes.
      // The new child node id does not exist, so we just pass "1RandomID".
      [batch, writeCounts] = await generateTagsData({
        batch: batch,
        nodeId: nodeRef.id,
        isTag: false,
        nodeUpdates: newNode,
        nodeTagIds: [],
        nodeTags: [],
        versionTagIds: payload.tagIds,
        versionTags: payload.tags,
        proposer: userData.uname,
        aImgUrl: userData.imageUrl,
        aFullname: userData.fName + " " + userData.lName,
        aChooseUname: userData.chooseUname,
        currentTimestamp,
        writeCounts,
      });
      console.log("nodeRef", nodeRef.id);
      batch.set(nodeRef, newNode);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      if (payload.childId) {
        const childNodeRef = db.doc(`/nodes/${payload.childId}`);
        const ChildNodeChanges = {
          changedAt: currentTimestamp,
          updatedAt: currentTimestamp,
          parents: [
            ...childNodeData.parents,
            { node: nodeRef.id, title: payload.title, label: "", type: payload.nodeType },
          ],
          studied: 0,
        };
        batch.update(childNodeRef, ChildNodeChanges);

        // Signal all userNodes for all the users who have had some kind of interaction with the child
        // node that a child is being added to it.
        await detach(async () => {
          let batch = db.batch();
          let writeCounts = 0;
          [batch, writeCounts] = await signalAllUserNodesChanges({
            batch,
            userNodesRefs,
            userNodesData,
            nodeChanges: ChildNodeChanges,
            major: true,
            deleted: false,
            currentTimestamp,
            writeCounts,
          });
          await commitBatch(batch);
        });
      }

      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      console.log("4");

      const newUserNodeObj: IUserNode = {
        correct: true,
        createdAt: currentTimestamp as unknown as Date,
        updatedAt: currentTimestamp as unknown as Date,
        deleted: false,
        isStudied: true,
        bookmarked: false,
        changed: false,
        node: nodeRef.id,
        open: true,
        user: userData.uname,
        visible: true,
        wrong: false,
        nodeChanges: {},
        notebooks: [payload.notebookId],
        expands: [true],
      };
      console.log({
        correct: true,
        createdAt: currentTimestamp as unknown as Date,
        updatedAt: currentTimestamp as unknown as Date,
        deleted: false,
        isStudied: true,
        bookmarked: false,
        changed: false,
        node: nodeRef.id,
        open: true,
        user: userData.uname,
        visible: true,
        wrong: false,
        nodeChanges: {},
        notebooks: [payload.notebookId],
        expands: [true],
      });
      const userNodeRef = db.collection("userNodes").doc();
      batch.set(userNodeRef, newUserNodeObj);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      const userNodeLogRef = db.collection("userNodesLog").doc();
      delete (newUserNodeObj as unknown as any).updatedAt;
      batch.set(userNodeLogRef, newUserNodeObj);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      console.log("5");
      // create user nodes for new node
      // TODO: move these to queue
      await detach(async () => {
        if (!payload.notebookId) return;

        let batch = db.batch();
        let writeCounts = 0;
        const nodesUserNodes = await db
          .collection("userNodes")
          .where("node", "==", payload.parentId)
          .where("notebooks", "array-contains", payload.notebookId)
          .get();
        for (const userNode of nodesUserNodes.docs) {
          const userNodeData = userNode.data() as IUserNode;
          if (userNodeData.user === userData.uname || userNodeData.deleted) {
            continue;
          }
          const userNodeRef = db.collection("userNodes").doc();
          const newUserNode = { ...newUserNodeObj };
          newUserNode.correct = false;
          newUserNode.user = userNodeData.user;
          newUserNode.isStudied = false;
          batch.set(userNodeRef, newUserNode);
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }

        await commitBatch(batch);
      });
    }
    console.log("6");

    for (const tagId in comReputationUpdates) {
      for (const reputationType of reputationTypes) {
        if (!comReputationUpdates[tagId][reputationType]) continue;

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
    console.log("7");
    const { versionsColl, userVersionsColl }: any = getTypedCollections();
    // Now we have all the data we need in newVersion, so we can set the document.
    const versionRef = versionsColl.doc();
    batch.set(versionRef, newVersion);
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

    const newUserVersion: any = {
      award: false,
      correct: true,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      version: versionRef.id,
      user: userData.uname,
      wrong: false,
      deleted: false,
    };
    const userVersionRef = userVersionsColl.doc();
    batch.set(userVersionRef, newUserVersion);
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

    const userVersionLogRef = db.collection("userVersionsLog").doc();
    delete newUserVersion.updatedAt;
    newUserVersion.nodeType = payload.nodeType;
    batch.set(userVersionLogRef, newUserVersion);

    if (payload.childId) {
      [batch, writeCounts] = await proposalNotification({
        batch,
        nodeId: payload.childId,
        nodeTitle: newVersion.accepted ? payload.title : nodeData.title,
        uname: userData.uname,
        versionData: newVersion,
        currentTimestamp,
        writeCounts,
      });
    }

    console.log("8");

    await commitBatch(batch);

    // TODO: move these to queue
    // action tracks
    await detach(async () => {
      const actionRef = db.collection("actionTracks").doc();
      actionRef.create({
        accepted: !!newVersion.accepted,
        type: "ParentNode",
        imageUrl: userData.imageUrl,
        action: versionRef.id,
        createdAt: currentTimestamp,
        doer: newVersion.proposer,
        chooseUname: userData.chooseUname,
        fullname: `${userData.fName} ${userData.lName}`,
        nodeId: newVersion.node,
        receivers: [userData.uname],
        email: userData.email,
      } as IActionTrack);

      const rateActionRef = db.collection("actionTracks").doc();
      rateActionRef.create({
        accepted: !!newVersion.accepted,
        type: "RateVersion",
        imageUrl: userData.imageUrl,
        action: "Correct-" + versionRef.id,
        createdAt: currentTimestamp,
        doer: newVersion.proposer,
        chooseUname: userData.chooseUname,
        fullname: `${userData.fName} ${userData.lName}`,
        nodeId: newVersion.node,
        receivers: [userData.uname],
        email: userData.email,
      } as IActionTrack);
    });
    console.log("9", {
      approved: !!newVersion.accepted,
      isChild: true,
      linksUpdated: true,
      nodeType: payload.nodeType,
      proposer: newVersion.proposer,
      tagIds: newVersion.tagIds,
    });
    // TODO: move these to queue
    await detach(async () => {
      await updateStatsOnProposal({
        approved: !!newVersion.accepted,
        isChild: true,
        linksUpdated: true,
        nodeType: payload.nodeType,
        proposer: newVersion.proposer,
        tagIds: newVersion.tagIds,
      });
    });

    // we need update contributors, contribNames, institNames, institutions
    // TODO: move these to queue
    console.log({
      nodeId: newVersion.node,
      uname: newVersion.proposer,
      accepted: newVersion,
      contribution: 1,
    });
    await detach(async () => {
      await updateNodeContributions({
        nodeId: newVersion.node,
        uname: newVersion.proposer,
        accepted: newVersion.accepted,
        contribution: 1,
      });
      if (newVersion.accepted) {
        await signalNodeToTypesense({
          nodeId: newVersion.node,
          currentTimestamp,
        });
      }
    });
    console.log("first reached", {
      node: newVersion.node,
      proposal: versionRef.id,
      success: true,
    });
    return res.status(200).json({
      node: newVersion.node,
      proposal: versionRef.id,
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default fbAuth(handler);
