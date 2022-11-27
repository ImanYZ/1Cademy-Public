import { NextApiRequest, NextApiResponse } from "next";
import { INode } from "src/types/INode";
import { INodeType } from "src/types/INodeType";
import { INodeVersion } from "src/types/INodeVersion";
import { detach, isVersionApproved } from "src/utils/helpers";
import { signalNodeToTypesense, updateNodeContributions } from "src/utils/version-helpers";

import { admin, db } from "../../lib/firestoreServer/admin";
import fbAuth from "../../middlewares/fbAuth";
import {
  addToPendingPropsNumsExcludingVoters,
  arrayToChunks,
  createUpdateUserVersion,
  getNode,
  getUserVersion,
  getVersion,
  setOrIncrementNotificationNums,
  versionCreateUpdate,
} from "../../utils";

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

export type IRateVersionPayload = {
  nodeId: string;
  versionNodeId?: string;
  versionId: string;
  nodeType: INodeType;
  uname?: string; // its removed from req as its coming from auth now
  award: boolean;
  correct: boolean;
  wrong: boolean;
};

// TODO: not checking if ids are invalid (Line no. 116)
// TODO: we are only deleting user node version for voter on accepting and ignoring others
// Logic
// calculate removed parents, removed children and added parents, added children
// calculate correct and wrong (not doing properly .i.e -1,1, -1, 1, )
// then run versionCreateUpdate
// - if version was previously accepted
//   - select admin based on maxRating
//   - update node if admin was changed or/and maxVersionRating was changed
//   - single a user nodes with major=false
// - if version getting accepted now
//   - if its an improvement
//     - select admin based on maxRating
//     - update node props (admin and props that are present in version)
//     - generateTagsData
//     - create/set delete=false on tag doc that was tagged in this node and communities reputation docs
//     - if node title has been changed, change it every where title can be present (tags, nodes.children[x].title, nodes.parents[x].title, community docs and reputation docs)
//     - add {node id,title,nodeType} in parentNode.children and signal all parent nodes as major=true
//     - add {node id, title, nodeType} in childNode.parents and signal all child nodes as major=true
//     - remove {node id,title,nodeType} from removedParentNode.children and signal all removed parent nodes as major=true
//     - remove {node id,title,nodeType} from removedChildNode.parents and signal all removed child nodes as major=true
//     - *signal all users related to improved node as major=true (missing logic - we are sending single using changeNodeTitle when title changes)
//   - if its not an improvement and a child node
//     - create a new node
//     - select admin based on maxRating
//     - add parent node (node where this new node was proposed as version) in new node
//     - generateTagsData
//     - create version for new node that is accepted
//     - create user version in relative nodeType user version collection
//     - create practice if childType was Question (we are not testing it right now)
//     - signal user nodes where child was proposed as major=true
// if version is approved and it has childType
//   - flag version as deleted
//   - flag user version as deleted
// createUpdateUserVersion
// create notification
// - if version was previously accepted oType=AccProposal
//   - if not then set oType=Proposal
// - aType values according voting action
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { uname } = req.body?.data?.user?.userData;
    const tWriteOperations: { objRef: any; data: any; operationType: string }[] = [];

    let writeCounts = 0;
    let nodeData: INode, nodeRef, versionData: INodeVersion, versionRef, correct: number, wrong: number, award;
    let accepted: boolean, isApproved: boolean;
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());

    let newUpdates: any = {};

    await db.runTransaction(async t => {
      const addedParents = [];
      const addedChildren = [];
      const removedParents = [];
      const removedChildren = [];

      ({ nodeData, nodeRef } = await getNode({ nodeId: req.body.nodeId, t }));
      ({ versionData, versionRef } = await getVersion({
        versionId: req.body.versionId,
        nodeType: req.body.nodeType,
        t,
      }));

      const previouslyAccepted = versionData.accepted;
      let childType = "childType" in versionData ? versionData.childType : false;

      for (let parent of versionData.parents) {
        if (nodeData.parents.findIndex((p: any) => p.node === parent.node) === -1) {
          addedParents.push(parent.node);
        }
      }

      // In proposeNodeImprovement, we were getting addedParents, removedParents, addedChildren,
      // and removedChildren from the clientside because a version was being created.
      // In this function, we have to manually generate them.
      for (let parent of nodeData.parents) {
        if (versionData.parents.findIndex((p: any) => p.node === parent.node) === -1) {
          removedParents.push(parent.node);
        }
      }

      for (let child of versionData.children) {
        if (nodeData.children.findIndex((c: any) => c.node === child.node) === -1) {
          addedChildren.push(child.node);
        }
      }
      for (let child of nodeData.children) {
        if (versionData.children.findIndex((c: any) => c.node === child.node) === -1) {
          removedChildren.push(child.node);
        }
      }

      let { userVersionData, userVersionRef } = await getUserVersion({
        versionId: req.body.versionId,
        nodeType: req.body.nodeType,
        uname,
        t,
      });

      if (req.body.correct) {
        correct = userVersionData?.correct ? -1 : 1;
        wrong = !userVersionData?.correct && userVersionData?.wrong ? -1 : 0;
      } else {
        correct = !userVersionData?.wrong && userVersionData?.correct ? -1 : 0;
        wrong = userVersionData?.wrong ? -1 : 1;
      }

      award = nodeData.admin === uname && versionData.proposer !== uname && req.body.award ? 1 : 0;

      // it version was previously approved
      accepted = versionData.accepted;
      // if its going to approve now
      isApproved = isVersionApproved({
        corrects: versionData.corrects + correct,
        wrongs: versionData.wrongs + wrong,
        nodeData,
      });

      //  if user already has an interaction with the version
      await versionCreateUpdate({
        versionNodeId: req.body.versionNodeId,
        nodeId: req.body.nodeId,
        nodeData,
        nodeRef,
        nodeType: req.body.nodeType,
        versionId: req.body.versionId,
        versionData,
        newVersion: false,
        childType,
        voter: uname,
        correct,
        wrong,
        award,
        addedParents,
        addedChildren,
        removedParents,
        removedChildren,
        currentTimestamp,
        newUpdates,
        writeCounts,
        t,
        tWriteOperations,
      });

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
      };

      // If the userVersion document does not already exist in the database,
      // i.e., if the user has not had previous interactions, like votes, on the version.
      if (!userVersionData) {
        userVersionData = {
          award: award === 1,
          correct: correct === 1,
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp,
          version: req.body.versionId,
          user: uname,
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

      /*
      if the proposal is a child node proposal, as soon as it gets accepted
      we need to delete the proposal from the original colleciton and create
      a copy of it under the version collection of the child type.
      we should do the same thing for the user version.
    */
      if (versionData.accepted && childType) {
        versionUpdates.deleted = true;
        userVersionData.deleted = true;
      }

      tWriteOperations.push({ objRef: versionRef, data: versionUpdates, operationType: "update" });

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
      });

      let notificationData = {
        proposer: versionData.proposer,
        uname,
        imageUrl: req.body.data.user.userData.imageUrl,
        fullname: req.body.data.user.userData.fName + " " + req.body.data.user.userData.lName,
        chooseUname: req.body.data.user.userData.chooseUname,
        nodeId: req.body.nodeId,
        title: versionData.accepted ? versionData.title : nodeData.title,
        // Origin type
        oType: "Proposal",
        aType: "",
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
        await addToPendingPropsNumsExcludingVoters({
          nodeType: childType ? childType : req.body.nodeType,
          versionId: req.body.versionId,
          tagIds: versionData.tagIds,
          value: -1,
          writeCounts,
          t,
          tWriteOperations,
        });
      }

      if (notificationData.aType !== "") {
        const notificationRef = db.collection("notifications").doc();

        tWriteOperations.push({
          objRef: notificationRef,
          data: notificationData,
          operationType: "set",
        });

        await setOrIncrementNotificationNums({
          proposer: versionData.proposer,
          writeCounts,
          t,
          tWriteOperations,
        });
      }
    });

    const chunkedArray = arrayToChunks(tWriteOperations);

    for (let chunk of chunkedArray) {
      await db.runTransaction(async t => {
        for (let operation of chunk) {
          const { objRef, data, operationType } = operation;
          switch (operationType) {
            case "update":
              t.update(objRef, data);
              break;
            case "set":
              t.set(objRef, data);
              break;
            case "delete":
              t.delete(objRef);
              break;
          }
        }
      });
    }

    // we need update contributors, contribNames, institNames, institutions
    // TODO: move these to queue
    await detach(async () => {
      let contribution: number = req.body.correct ? correct : wrong;
      if (!accepted && isApproved) {
        contribution = versionData.corrects + correct - (versionData.wrongs + wrong);
      }
      await updateNodeContributions({
        nodeId: versionData.node,
        uname: versionData.proposer,
        accepted: accepted || isApproved,
        contribution,
      });
      if (accepted || isApproved) {
        await signalNodeToTypesense({
          nodeId: versionData.childType ? newUpdates.nodeId : versionData.node,
          currentTimestamp,
          versionData: versionData.childType ? newUpdates.versionData : versionData,
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
