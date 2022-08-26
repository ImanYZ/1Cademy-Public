import { NextApiRequest, NextApiResponse } from "next";

import {
  admin,
  checkRestartBatchWriteCounts,
  db,
} from "../../lib/firestoreServer/admin";
import {
  addToPendingPropsNumsExcludingVoters,
  createUpdateUserVersion,
  getNode,
  getUserVersion,
  getVersion,
  setOrIncrementNotificationNums,
  versionCreateUpdate
} from '../../utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let batch = db.batch();
    let writeCounts = 0;
    let nodeData, nodeRef, versionData, versionRef, correct, wrong, award;
    const addedParents = [];
    const addedChildren = [];
    const removedParents = [];
    const removedChildren = [];
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    ({ nodeData, nodeRef } = await getNode({ nodeId: req.body.data.nodeId }));
    ({ versionData, versionRef } = await getVersion({ versionId: req.body.data.versionId, nodeType: req.body.data.nodeType }));
    const previouslyAccepted = versionData.accepted;
    let childType = "childType" in versionData ? versionData.childType : false;
    // let choices: any[] = [];
    // if ((!childType && req.body.data.nodeType === "Question") || childType === "Question") {
    //   choices = versionData.choices;
    // }
    //  In proposeNodeImprovement, we were getting addedParents, removedParents, addedChildren,
    // and removedChildren from the clientside because a version was being created.
    // In this function, we have to manually generate them.
    for (let parent of versionData.parents) {
      if (!nodeData.parents.some((p: any) => p.node === parent.node)) {
        addedParents.push(parent.node);
      }
    }
    for (let parent of nodeData.parents) {
      if (!versionData.parents.some((p: any) => p.node === parent.node)) {
        removedParents.push(parent.node);
      }
    }
    for (let child of versionData.children) {
      if (!nodeData.children.some((c: any) => c.node === child.node)) {
        addedChildren.push(child.node);
      }
    }
    for (let child of nodeData.children) {
      if (!versionData.children.some((c: any) => c.node === child.node)) {
        removedChildren.push(child.node);
      }
    }
    let { userVersionData, userVersionRef } = await getUserVersion({
      versionId: req.body.data.versionId,
      nodeType: req.body.data.nodeType,
      uname: req.body.data.user.userData.uname
    });
    correct = req.body.data.correct ? 1 : 0;
    wrong = req.body.data.wrong ? 1 : 0;
    award =
      nodeData.admin === req.body.data.user.userData.uname &&
        versionData.proposer !== req.body.data.user.userData.uname &&
        req.body.data.award
        ? 1
        : 0;
    //  if user already has an interaction with the version
    if (userVersionData) {
      if (req.body.data.correct) {
        correct = userVersionData.correct ? -1 : 1;
        wrong = !userVersionData.correct && userVersionData.wrong ? -1 : 0;
      } else if (req.body.data.wrong) {
        correct = !userVersionData.wrong && userVersionData.correct ? -1 : 0;
        wrong = userVersionData.wrong ? -1 : 1;
      } else if (award === 1) {
        award = userVersionData.award ? -1 : 1;
      }
    }
    [batch, writeCounts] = await versionCreateUpdate({
      batch,
      nodeId: req.body.data.nodeId,
      nodeData,
      nodeRef,
      nodeType: req.body.data.nodeType,
      versionId: req.body.data.versionId,
      versionData,
      newVersion: false,
      childType,
      voter: req.body.data.user.userData.uname,
      correct,
      wrong,
      award,
      addedParents,
      addedChildren,
      removedParents,
      removedChildren,
      currentTimestamp,
      writeCounts
    });

    const versionUpdates: any = {
      accepted: versionData.accepted ? true : previouslyAccepted,
      corrects: versionData.corrects + correct,
      wrongs: versionData.wrongs + wrong,
      awards: versionData.awards + award,
      updatedAt: currentTimestamp,
    };
    // If the userVersion document does not already exist in the database,
    // i.e., if the user has not had previous interactions, like votes, on the version.
    if (!userVersionData) {
      userVersionData = {
        award: award === 1,
        correct: correct === 1,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
        version: req.body.data.versionId,
        user: req.body.data.user.userData.uname,
        wrong: wrong === 1,
      };
    } else {
      userVersionData = {
        ...userVersionData,
        correct: correct === 1 ? true : correct === 0 ? userVersionData.correct : false,
        wrong: wrong === 1 ? true : wrong === 0 ? userVersionData.wrong : false,
        award: award === 1 ? true : award === 0 ? userVersionData.award : false,
        updatedAt: currentTimestamp,
      };
    }
    if (versionData.accepted && childType) {
      versionUpdates.deleted = true;
      userVersionData.deleted = true;
    }
    batch.update(versionRef, versionUpdates);
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    // Even if this is a child proposal that is being accepted, there were previously
    // a version and its corresponding userVersion on the parent node that the voter is
    // voting on. So, regardless of whether the version is for a new child or improvement,
    // we need to update the votes on the old version.
    [batch, writeCounts] = await createUpdateUserVersion({
      batch,
      userVersionRef,
      userVersionData,
      nodeType: req.body.data.nodeType,
      writeCounts
    });

    let notificationData = {
      proposer: versionData.proposer,
      uname: req.body.data.user.userData.uname,
      imageUrl: req.body.data.user.userData.imageUrl,
      fullname: req.body.data.user.userData.fName + " " + req.body.data.user.userData.lName,
      chooseUname: req.body.data.user.userData.chooseUname,
      nodeId: req.body.data.nodeId,
      title: versionData.accepted ? versionData.title : nodeData.title,
      // Origin type
      oType: "Proposal",
      aType: '',
      checked: false,
      createdAt: currentTimestamp,
    };
    if (previouslyAccepted || !versionData.accepted) {
      if (previouslyAccepted) {
        notificationData.oType = "AccProposal";
      }
      // Action type
      notificationData.aType = "";
      if (correct === 1) {
        notificationData.aType = "Correct";
      } else if (correct === -1) {
        notificationData.aType = "CorrectRM";
      } else if (wrong === 1) {
        notificationData.aType = "Wrong";
      } else if (wrong === -1) {
        notificationData.aType = "WrongRM";
      } else if (award === 1) {
        notificationData.aType = "Award";
      } else if (award === -1) {
        notificationData.aType = "AwardRM";
      }
    } else {
      // A proposal that is just getting accepted.
      notificationData.aType = "Accept";
      // This was a pending proposal for a child/improvement that just got accepted. So, we need to decrement the number of pending proposals for all the members of this community.
      [batch, writeCounts] = await addToPendingPropsNumsExcludingVoters({
        batch,
        nodeType: childType ? childType : req.body.data.nodeType,
        versionId: req.body.data.versionId,
        tagIds: versionData.tagIds,
        value: -1,
        writeCounts
      });
    }
    if (notificationData.aType !== "") {
      const notificationRef = db.collection("notifications").doc();
      batch.set(notificationRef, notificationData);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      [batch, writeCounts] = await setOrIncrementNotificationNums({
        batch,
        proposer: versionData.proposer,
        writeCounts
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;