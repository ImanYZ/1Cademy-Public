import { NextApiRequest, NextApiResponse } from "next"

import { admin, db } from "../../lib/firestoreServer/admin"
import fbAuth from "../../middlewares/fbAuth"
import {
  addToPendingPropsNumsExcludingVoters,
  createUpdateUserVersion,
  getNode,
  getUserVersion,
  getVersion,
  setOrIncrementNotificationNums,
  versionCreateUpdate,
} from "../../utils"

/*
  This function gets invoked when the user clicks on the 
  "correct", "Wrong" or the "Award" button on a proposal.

  This end-points is called when a user clicks the correct/wrong mark on a
  version (proposal) of a node.
  - It updates the number of corrects/wrongs in the version.
  - It divides the number of corrects/wrongs on this version by the 
    maxVersionRating of the node and gives the calculated positive or 
    negative points to the proposer of the version.
  - Then, if the updated total corrects minus wrongs on this proposal is 
    greater than the corresponding node maxVersionRating, it updates the 
    maxVersionRating on the node.
  - If the version is a pending proposal, if the updated corrects minus
    wrongs on the version is greater than or equal to the corrents minus 
    wrongs on the corresponding node, it "approves" the version and does 
    the following:
    - If the version is proposing an edit/improvement to the node, it:
      - Replaces the exiting title, content, parents, children, ... of the 
        nodes with the proposed ones.
      - Marks the proposal as "accepted"
    - If the version is proposing to create a new child node under the
      node, It:
      - Creates the new child node based on the "childType"
      - Creates a new version docuemnt in the version collection 
        corresponding to the "childType" and specifies its "node" the
        new child node id, and its first parent as the original node.
      - Deletes the original version document
      - Reduces the number of versions in the original node document.
  Note that all of these should be done through a single transaction 
  because the number of corrects, wrongs, proposer's reputation points, 
  ... all depend on their previous values. We cannot do these updates 
  as simple Firestore updates nor batch updates. We cannot use Cloud 
  Function triggers for these transactions either. They should be all 
  done as an atomic transaction.
*/

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await db.runTransaction(async t => {
      let writeCounts = 0
      let nodeData, nodeRef, versionData, versionRef, correct, wrong, award
      const addedParents = []
      const addedChildren = []
      const removedParents = []
      const removedChildren = []
      const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date())

      const tWriteOperations: { doc: any; data: any; operationType: string }[] = []

      ;({ nodeData, nodeRef } = await getNode({ nodeId: req.body.nodeId, t }))
      ;({ versionData, versionRef } = await getVersion({
        versionId: req.body.versionId,
        nodeType: req.body.nodeType,
        t,
      }))

      const previouslyAccepted = versionData.accepted
      let childType = "childType" in versionData ? versionData.childType : false

      for (let parent of versionData.parents) {
        if (!nodeData.parents.some((p: any) => p.node === parent.node)) {
          addedParents.push(parent.node)
        }
      }

      // In proposeNodeImprovement, we were getting addedParents, removedParents, addedChildren,
      // and removedChildren from the clientside because a version was being created.
      // In this function, we have to manually generate them.
      for (let parent of nodeData.parents) {
        if (!versionData.parents.some((p: any) => p.node === parent.node)) {
          removedParents.push(parent.node)
        }
      }

      for (let child of versionData.children) {
        if (!nodeData.children.some((c: any) => c.node === child.node)) {
          addedChildren.push(child.node)
        }
      }
      for (let child of nodeData.children) {
        if (!versionData.children.some((c: any) => c.node === child.node)) {
          removedChildren.push(child.node)
        }
      }

      let { userVersionData, userVersionRef } = await getUserVersion({
        versionId: req.body.versionId,
        nodeType: req.body.nodeType,
        uname: req.body.uname,
        t,
      })

      correct = req.body.correct ? 1 : 0
      wrong = req.body.wrong ? 1 : 0

      award = nodeData.admin === req.body.uname && versionData.proposer !== req.body.uname && req.body.award ? 1 : 0

      //  if user already has an interaction with the version
      await versionCreateUpdate({
        nodeId: req.body.nodeId,
        nodeData,
        nodeRef,
        nodeType: req.body.nodeType,
        versionId: req.body.versionId,
        versionData,
        newVersion: false,
        childType,
        voter: req.body.uname,
        correct,
        wrong,
        award,
        addedParents,
        addedChildren,
        removedParents,
        removedChildren,
        currentTimestamp,
        writeCounts,
        t,
        tWriteOperations,
      })

      // let choices: any[] = [];
      // if ((!childType && req.body.nodeType === "Question") || childType === "Question") {
      //   choices = versionData.choices;
      // }
      const versionUpdates: any = {
        accepted: versionData.accepted ? true : previouslyAccepted,
        corrects: versionData.corrects + correct,
        wrongs: versionData.wrongs + wrong,
        awards: versionData.awards + award,
        updatedAt: currentTimestamp,
      }

      // If the userVersion document does not already exist in the database,
      // i.e., if the user has not had previous interactions, like votes, on the version.
      if (!userVersionData) {
        userVersionData = {
          award: award === 1,
          correct: correct === 1,
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp,
          version: req.body.versionId,
          user: req.body.uname,
          wrong: wrong === 1,
        }
      } else {
        userVersionData = {
          ...userVersionData,
          correct: correct === 1 ? true : correct === 0 ? userVersionData.correct : false,
          wrong: wrong === 1 ? true : wrong === 0 ? userVersionData.wrong : false,
          award: award === 1 ? true : award === 0 ? userVersionData.award : false,
          updatedAt: currentTimestamp,
        }
      }

      /*
      if the proposal is a child node proposal, as soon as it gets accepted
      we need to delete the proposal from the original colleciton and create
      a copy of it under the version collection of the child type.
      we should do the same thing for the user version.
    */
      if (versionData.accepted && childType) {
        versionUpdates.deleted = true
        userVersionData.deleted = true
      }

      tWriteOperations.push({ doc: versionRef, data: versionUpdates, operationType: "update" })

      // Even if this is a child proposal that is being accepted, there were previously
      // a version and its corresponding userVersion on the parent node that the voter is
      // voting on. So, regardless of whether the version is for a new child or improvement,
      // we need to update the votes on the old version.
      await createUpdateUserVersion({
        userVersionRef,
        userVersionData,
        nodeType: req.body.nodeType,
        writeCounts,
        t,
        tWriteOperations,
      })

      let notificationData = {
        proposer: versionData.proposer,
        uname: req.body.uname,
        imageUrl: req.user.userData.imageUrl,
        fullname: req.user.userData.fName + " " + req.user.userData.lName,
        chooseUname: req.user.userData.chooseUname,
        nodeId: req.body.nodeId,
        title: versionData.accepted ? versionData.title : nodeData.title,
        // Origin type
        oType: "Proposal",
        aType: "",
        checked: false,
        createdAt: currentTimestamp,
      }

      if (previouslyAccepted || !versionData.accepted) {
        if (previouslyAccepted) {
          notificationData.oType = "AccProposal"
        }
        // Action type
        notificationData.aType = ""
        if (correct === 1) {
          notificationData.aType = "Correct"
        } else if (correct === -1) {
          notificationData.aType = "CorrectRM"
        } else if (wrong === 1) {
          notificationData.aType = "Wrong"
        } else if (wrong === -1) {
          notificationData.aType = "WrongRM"
        } else if (award === 1) {
          notificationData.aType = "Award"
        } else if (award === -1) {
          notificationData.aType = "AwardRM"
        }
      } else {
        // A proposal that is just getting accepted.
        notificationData.aType = "Accept"
        // This was a pending proposal for a child/improvement that just got accepted. So, we need to decrement the number of pending proposals for all the members of this community.
        await addToPendingPropsNumsExcludingVoters({
          nodeType: childType ? childType : req.body.nodeType,
          versionId: req.body.versionId,
          tagIds: versionData.tagIds,
          value: -1,
          writeCounts,
          t,
          tWriteOperations,
        })
      }

      if (notificationData.aType !== "") {
        const notificationRef = db.collection("notifications").doc()

        tWriteOperations.push({
          doc: notificationRef,
          data: notificationData,
          operationType: "set",
        })

        await setOrIncrementNotificationNums({
          proposer: versionData.proposer,
          writeCounts,
          t,
          tWriteOperations,
        })
      }

      for (let operation of tWriteOperations) {
        const { doc, data, operationType } = operation
        switch (operationType) {
          case "update":
            t.update(doc, data)
            break
          case "set":
            t.set(doc, data)
            break
          case "delete":
            t.delete(doc)
            break
        }
      }
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ err, success: false })
  }
}

export default fbAuth(handler)
