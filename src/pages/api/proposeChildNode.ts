import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IActionTrack } from "src/types/IActionTrack";
import { INode } from "src/types/INode";
import { INodeLink } from "src/types/INodeLink";
import { INodeType } from "src/types/INodeType";
import { IQuestionChoice } from "src/types/IQuestionChoice";
import { IUser } from "src/types/IUser";
import { detach } from "src/utils/helpers";
import { generateTagsOfTagsWithNodes, signalNodeToTypesense, updateNodeContributions } from "src/utils/version-helpers";

import { admin, checkRestartBatchWriteCounts, commitBatch, db } from "../../lib/firestoreServer/admin";
import {
  addToPendingPropsNums,
  createPractice,
  generateTagsData,
  getAllUserNodes,
  getNode,
  getTypedCollections,
  isVersionApproved,
  proposalNotification,
  signalAllUserNodesChanges,
  updateReputation,
} from "../../utils";

export type IProposeChildNodePayload = {
  data: {
    versionNodeId?: string;
    parentId: string;
    parentType: INodeType;
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
  let nodeRef, nodeData, userNodesData, userNodesRefs;
  const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
  let writeCounts = 0;
  let batch = db.batch();

  const userData = req.body.data.user.userData as IUser;
  try {
    const { versionNodeId, nodeVideoStartTime, nodeVideoEndTime } = req?.body?.data;
    ({ nodeData, nodeRef } = await getNode({ nodeId: req.body.data.parentId }));
    ({ userNodesData, userNodesRefs } = await getAllUserNodes({ nodeId: req.body.data.parentId }));

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
      tagIds: req.body.data.tagIds || [],
      nodeUpdates: tagUpdates,
      nodes: nodesMap,
      visitedNodeIds,
    });

    const newVersion: any = {
      awards: 0,
      children: req.body.data.children,
      title: req.body.data.title,
      content: req.body.data.content,
      nodeImage: req.body.data.nodeImage,
      nodeVideo: req.body.data.nodeVideo,
      nodeVideoStartTime,
      nodeVideoEndTime,
      nodeAudio: req.body.data.nodeAudio,
      corrects: 1,
      createdAt: currentTimestamp,
      deleted: false,
      proposer: req.body.data.user.userData.uname,
      imageUrl: req.body.data.user.userData.imageUrl,
      fullname: req.body.data.user.userData.fName + " " + req.body.data.user.userData.lName,
      chooseUname: req.body.data.user.userData.chooseUname,
      parents: req.body.data.parents,
      proposal: req.body.data.proposal,
      referenceIds: req.body.data.referenceIds,
      references: req.body.data.references,
      referenceLabels: req.body.data.referenceLabels,
      summary: req.body.data.summary,
      newChild: true,
      subType: req.body.data.subType,
      tagIds: tagUpdates.tagIds,
      tags: tagUpdates.tags,
      updatedAt: currentTimestamp,
      viewers: 1,
      wrongs: 0,
    };
    if (req.body.data.nodeType === "Question") {
      newVersion.choices = req.body.data.choices;
    }
    const parentNodeData = await isVersionApproved({
      corrects: newVersion.corrects,
      wrongs: newVersion.wrongs,
      nodeData,
    });
    if (!parentNodeData) {
      [batch, writeCounts] = await updateReputation({
        batch,
        uname: req.body.data.user.userData.uname,
        imageUrl: req.body.data.user.userData.imageUrl,
        fullname: req.body.data.user.userData.fName + " " + req.body.data.user.userData.lName,
        chooseUname: req.body.data.user.userData.chooseUname,
        tagIds: nodeData.tagIds,
        tags: nodeData.tags,
        nodeType: req.body.data.parentType,
        correctVal: 1,
        wrongVal: 0,
        instVal: 0,
        ltermVal: 0,
        ltermDayVal: 0,
        voter: req.body.data.user.userData.uname,
        writeCounts,
      });
      newVersion.childType = req.body.data.nodeType;
      newVersion.node = req.body.data.parentId;
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
        voters: [req.body.data.user.userData.uname],
        writeCounts,
      });
    } else {
      [batch, writeCounts] = await updateReputation({
        batch,
        uname: req.body.data.user.userData.uname,
        imageUrl: req.body.data.user.userData.imageUrl,
        fullname: req.body.data.user.userData.fName + " " + req.body.data.user.userData.lName,
        chooseUname: req.body.data.user.userData.chooseUname,
        tagIds: req.body.data.tagIds,
        tags: req.body.data.tags,
        nodeType: req.body.data.nodeType,
        correctVal: 1,
        wrongVal: 0,
        instVal: 0,
        ltermVal: 0,
        ltermDayVal: 0,
        voter: req.body.data.user.userData.uname,
        writeCounts,
      });
      nodeRef = db.collection("nodes").doc();
      if (versionNodeId && !(await db.collection("nodes").doc(versionNodeId).get()).exists) {
        nodeRef = db.collection("nodes").doc(versionNodeId);
      }
      newVersion.node = nodeRef.id;
      newVersion.accepted = true;
      const newNode: any = {
        admin: req.body.data.user.userData.uname,
        aImgUrl: req.body.data.user.userData.imageUrl,
        aFullname: req.body.data.user.userData.fName + " " + req.body.data.user.userData.lName,
        aChooseUname: req.body.data.user.userData.chooseUname,
        maxVersionRating: 1,
        changedAt: currentTimestamp,
        children: req.body.data.children,
        comments: 0,
        content: req.body.data.content,
        nodeImage: req.body.data.nodeImage,
        nodeVideo: req.body.data.nodeVideo,
        nodeAudio: req.body.data.nodeAudio,
        corrects: 1,
        createdAt: currentTimestamp,
        deleted: false,
        nodeType: req.body.data.nodeType,
        subType: req.body.data.subType,
        parents: req.body.data.parents,
        referenceIds: req.body.data.referenceIds,
        references: req.body.data.references,
        referenceLabels: req.body.data.referenceLabels,
        studied: 1,
        tagIds: req.body.data.tagIds,
        tags: req.body.data.tags,
        title: req.body.data.title,
        updatedAt: currentTimestamp,
        versions: 1,
        viewers: 1,
        wrongs: 0,
        isTag: false,
      };

      if (nodeVideoStartTime) {
        newNode.nodeVideoStartTime = nodeVideoStartTime;
      }
      if (nodeVideoEndTime) {
        newNode.nodeVideoEndTime = nodeVideoEndTime;
      }
      // If a question node gets accepted, it should be added to the practice tool for all
      // users in the communities with the tags that are used on this node.
      // That's why we need to get the list of all members of each of these tags (communities).
      if (req.body.data.nodeType === "Question") {
        newNode.choices = req.body.data.choices;
        [batch, writeCounts] = await createPractice({
          batch,
          tagIds: req.body.data.tagIds,
          nodeId: nodeRef.id,
          currentTimestamp,
          writeCounts,
        });
      }
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
        versionTagIds: req.body.data.tagIds,
        versionTags: req.body.data.tags,
        proposer: req.body.data.user.userData.uname,
        aImgUrl: req.body.data.user.userData.imageUrl,
        aFullname: req.body.data.user.userData.fName + " " + req.body.data.user.userData.lName,
        aChooseUname: req.body.data.user.userData.chooseUname,
        currentTimestamp,
        writeCounts,
      });
      batch.set(nodeRef, newNode);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      const parentNodeRef = db.doc(`/nodes/${req.body.data.parentId}`);
      const ParentNodeChanges = {
        changedAt: currentTimestamp,
        updatedAt: currentTimestamp,
        children: [
          ...parentNodeData.children,
          { node: nodeRef.id, title: req.body.data.title, label: "", type: req.body.data.nodeType },
        ],
        studied: 0,
      };
      batch.update(parentNodeRef, ParentNodeChanges);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

      // Signal all userNodes for all the users who have had some kind of interaction with the parent
      // node that a child is being added to it.
      [batch, writeCounts] = await signalAllUserNodesChanges({
        batch,
        userNodesRefs,
        userNodesData,
        nodeChanges: ParentNodeChanges,
        major: true,
        deleted: false,
        currentTimestamp,
        writeCounts,
      });

      const newUserNodeObj: any = {
        correct: true,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
        deleted: false,
        isStudied: true,
        bookmarked: false,
        changed: false,
        node: nodeRef.id,
        open: true,
        user: req.body.data.user.userData.uname,
        visible: true,
        wrong: false,
      };
      const userNodeRef = db.collection("userNodes").doc();
      batch.set(userNodeRef, newUserNodeObj);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      const userNodeLogRef = db.collection("userNodesLog").doc();
      delete newUserNodeObj.updatedAt;
      batch.set(userNodeLogRef, newUserNodeObj);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }
    const { versionsColl, userVersionsColl }: any = getTypedCollections({
      nodeType: newVersion.accepted ? req.body.data.nodeType : req.body.data.parentType,
    });
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
      user: req.body.data.user.userData.uname,
      wrong: false,
      deleted: false,
    };
    const userVersionRef = userVersionsColl.doc();
    batch.set(userVersionRef, newUserVersion);
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

    const userVersionLogRef = db.collection("userVersionsLog").doc();
    delete newUserVersion.updatedAt;
    newUserVersion.nodeType = req.body.data.nodeType;
    batch.set(userVersionLogRef, newUserVersion);

    [batch, writeCounts] = await proposalNotification({
      batch,
      nodeId: newVersion.accepted ? nodeRef.id : req.body.data.parentId,
      nodeTitle: newVersion.accepted ? req.body.data.title : nodeData.title,
      uname: req.body.data.user.userData.uname,
      versionData: newVersion,
      currentTimestamp,
      writeCounts,
    });
    await commitBatch(batch);

    // TODO: move these to queue
    // action tracks
    await detach(async () => {
      const actionRef = db.collection("actionTracks").doc();
      actionRef.create({
        accepted: !!newVersion.accepted,
        type: "ChildNode",
        imageUrl: req.body.data.user.userData.imageUrl,
        action: versionRef.id,
        createdAt: currentTimestamp,
        doer: newVersion.proposer,
        chooseUname: userData.chooseUname,
        fullname: `${userData.fName} ${userData.lName}`,
        nodeId: newVersion.node,
        receivers: [req.body.data.user.userData.uname],
      } as IActionTrack);

      const rateActionRef = db.collection("actionTracks").doc();
      rateActionRef.create({
        accepted: !!newVersion.accepted,
        type: "RateVersion",
        imageUrl: req.body.data.user.userData.imageUrl,
        action: "Correct-" + versionRef.id,
        createdAt: currentTimestamp,
        doer: newVersion.proposer,
        chooseUname: userData.chooseUname,
        fullname: `${userData.fName} ${userData.lName}`,
        nodeId: newVersion.node,
        receivers: [req.body.data.user.userData.uname],
      } as IActionTrack);
    });

    // we need update contributors, contribNames, institNames, institutions
    // TODO: move these to queue
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
          versionData: newVersion,
        });
      }
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default fbAuth(handler);
