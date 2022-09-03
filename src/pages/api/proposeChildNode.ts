import { NextApiRequest, NextApiResponse } from "next";

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

async function handler(req: NextApiRequest, res: NextApiResponse) {
  let nodeRef, nodeData, userNodesData, userNodesRefs;
  const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
  let writeCounts = 0;
  let batch = db.batch();
  try {
    ({ nodeData, nodeRef } = await getNode({ nodeId: req.body.data.parentId }));
    ({ userNodesData, userNodesRefs } = await getAllUserNodes({ nodeId: req.body.data.parentId }));
    const newVersion: any = {
      awards: 0,
      children: req.body.data.children,
      title: req.body.data.title,
      content: req.body.data.content,
      nodeImage: req.body.data.nodeImage,
      nodeVideo: req.body.data.nodeVideo,
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
      tagIds: req.body.data.tagIds,
      tags: req.body.data.tags,
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
    const { versionsColl, userVersionsColl }: any = getTypedCollections({ nodeType: req.body.data.parentType });
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
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;
