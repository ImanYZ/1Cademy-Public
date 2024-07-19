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
  isVersionApproved,
  proposalNotification,
  signalAllUserNodesChanges,
  updateReputation,
} from "../../utils";
import { generateAlias } from "@/lib/utils/utils";

export type IProposeChildNodePayload = {
  data: {
    versionNodeId: string;
    notebookId?: string;
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
    paragraphsIds: string[][];
    summary: string;
    subType?: string | null; // not implemented yet
    tagIds: string[];
    tags: string[];
    choices?: IQuestionChoice[]; // only comes with NodeType=Question
  };
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  let parentNodeRef: any, parentNodeData: any, userNodesParentData: any, userNodesParentRefs: any;
  const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
  let writeCounts = 0;
  let batch = db.batch();

  const userData = req.body.data.user.userData as IUser;
  const {
    parentId,
    tagIds,
    children,
    content,
    nodeImage,
    nodeVideo,
    title,
    parents,
    proposal,
    referenceIds,
    references,
    referenceLabels,
    summary,
    nodeType,
    choices,
    parentType,
    tags,
    notebookId,
  } = req?.body?.data;
  try {
    const { versionNodeId, nodeVideoStartTime, nodeVideoEndTime } = req?.body?.data;
    console.log(req?.body?.data, "versionNodeId==>");
    console.log("parentId", {
      parentId,
      tagIds,
      children,
      content,
      nodeImage,
      nodeVideo,
      title,
      parents,
      proposal,
      referenceIds,
      references,
      referenceLabels,
      summary,
      nodeType,
      choices,
      parentType,
      tags,
      notebookId,
    });

    ({ nodeData: parentNodeData, nodeRef: parentNodeRef } = await getNode({ nodeId: parentId }));

    ({ userNodesData: userNodesParentData, userNodesRefs: userNodesParentRefs } = await getAllUserNodes({
      nodeId: parentId,
    }));

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
      tagIds: tagIds || [],
      nodeUpdates: tagUpdates,
      nodes: nodesMap,
      visitedNodeIds,
    });
    //new version node

    const { instantApprove, isInstructor } = await shouldInstantApprovalForProposal(
      parentNodeData?.tagIds || [],
      userData.uname
    );

    const accepted = isVersionApproved({
      corrects: 1,
      wrongs: 0,
      nodeData: parentNodeData,
      instantApprove,
      isInstructor,
    });
    //build the new version
    const newVersion: any = {
      awards: 0,
      children: children,
      title: title,
      content: content,
      nodeImage: nodeImage,
      nodeVideo: nodeVideo,
      nodeVideoStartTime,
      nodeVideoEndTime,
      corrects: 1,
      createdAt: currentTimestamp,
      deleted: false,
      proposer: userData.uname,
      imageUrl: userData.imageUrl,
      fullname: userData.fName + " " + userData.lName,
      chooseUname: userData.chooseUname,
      parents: parents,
      proposal: proposal,
      referenceIds: referenceIds,
      references: references,
      referenceLabels: referenceLabels,
      summary: summary,
      newChild: true,
      tagIds: tagUpdates.tagIds,
      tags: tagUpdates.tags,
      updatedAt: currentTimestamp,
      viewers: 1,
      wrongs: 0,
      node: parentId,
      accepted,
      ...(nodeType === "Question" && { choices: choices }),
      ...(!accepted && { childType: nodeType }),
    };

    let ParentNodeChanges = {};
    let newNode = {};
    // to check if the node or version document already exist or not
    let nodeAlreadyCreated = false;
    let versionAlreadyCreated = false;
    // if the node gets accepted transaction for creating a new node document to make sure we are not creating duplicates
    if (accepted) {
      await db.runTransaction(async t => {
        // Check if node with versionNodeId already exists
        let newNodeRef = db.collection("nodes").doc(versionNodeId);
        const newNodeDoc = await t.get(newNodeRef);
        if (newNodeDoc.exists) {
          // If node exists, set flag and return early
          nodeAlreadyCreated = true;
          return;
        }

        // Construct the new node object
        const newNode = {
          admin: userData.uname,
          aImgUrl: userData.imageUrl,
          aFullname: userData.fName + " " + userData.lName,
          aChooseUname: userData.chooseUname,
          maxVersionRating: 1,
          changedAt: currentTimestamp,
          children: children,
          comments: 0,
          content: content,
          nodeImage: nodeImage,
          nodeSlug: generateAlias(title),
          nodeVideo: nodeVideo,
          corrects: 1,
          createdAt: currentTimestamp,
          deleted: false,
          nodeType: nodeType,
          parents: parents,
          referenceIds: referenceIds,
          references: references,
          referenceLabels: referenceLabels,
          studied: 1,
          tagIds: tagUpdates.tagIds,
          tags: tagUpdates.tags,
          title: title,
          updatedAt: currentTimestamp,
          versions: 1,
          viewers: 1,
          wrongs: 0,
          isTag: false,
          ...(nodeType === "Question" && { choices: choices }),
          ...(nodeVideoStartTime && { nodeVideoStartTime }),
          ...(nodeVideoEndTime && { nodeVideoEndTime }),
          contribNames: [userData.uname],
          contributors: {
            [userData.uname]: {
              reputation: 1,
              fullname: userData.fName + " " + userData.lName,
              imageUrl: userData.imageUrl,
              chooseUname: userData.chooseUname,
            },
          },
          institNames: [userData.deInstit],
          institutions: {
            [userData.deInstit]: {
              reputation: 1,
            },
          },
        };

        // Set the new node in the transaction
        t.set(newNodeRef, newNode);

        // Update parent node with changes
        const ParentNodeChanges = {
          changedAt: currentTimestamp,
          updatedAt: currentTimestamp,
          children: [...parentNodeData.children, { node: versionNodeId, title: title, label: "", type: nodeType }],
          studied: 0,
        };
        t.update(parentNodeRef, ParentNodeChanges);

        // Construct and set new user node object
        const newUserNodeObj: any = {
          correct: true,
          createdAt: currentTimestamp as unknown as Date,
          updatedAt: currentTimestamp as unknown as Date,
          deleted: false,
          isStudied: true,
          bookmarked: false,
          changed: false,
          node: newNodeRef.id,
          open: true,
          user: userData.uname,
          wrong: false,
          nodeChanges: {},
          notebooks: [notebookId],
          expands: [true],
        };
        const userNodeRef = db.collection("userNodes").doc();
        t.set(userNodeRef, newUserNodeObj);

        // Log the user node
        const userNodeLogRef = db.collection("userNodesLog").doc();
        delete newUserNodeObj.updatedAt; // Remove updatedAt before logging
        t.set(userNodeLogRef, newUserNodeObj);
      });

      await signalNodeToTypesense({
        nodeId: versionNodeId,
        currentTimestamp,
        versionData: newVersion,
      });
    }
    // transaction for creating a new version document to make sure we are not creating duplicates
    await db.runTransaction(async t => {
      // Fetching the firestore query
      const { versionsColl, userVersionsColl }: any = getTypedCollections();

      // Check if the version document already exists
      console.log("ceated versionNodeId", versionNodeId);
      let versionRef = versionsColl.doc(versionNodeId);
      const versionDoc: any = await t.get(versionRef);
      if (versionDoc.exists) {
        // If the version document exists, set flag and exit transaction
        versionAlreadyCreated = true;
        return;
      }

      // Determine node type based on conditions
      newVersion.nodeType = newVersion.accepted ? nodeType : parentType;

      // Set the new version document in the 'versionsColl' collection
      t.set(versionRef, newVersion);

      // Prepare data for user versions collection
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

      // Set the new user version document in the 'userVersionsColl' collection
      const userVersionRef = userVersionsColl.doc();
      t.set(userVersionRef, newUserVersion);

      // Prepare data for user versions log collection
      const userVersionLogRef = db.collection("userVersionsLog").doc();
      // Modify newUserVersion before setting in the log collection
      delete newUserVersion.updatedAt; // Remove updatedAt field
      newUserVersion.nodeType = nodeType; // Update nodeType field
      t.set(userVersionLogRef, newUserVersion);
    });

    if (!accepted) {
      await db.runTransaction(async t => {
        let parentNodeRef = db.collection("nodes").doc(parentId);
        const parentNodeDoc = await t.get(parentNodeRef);
        const parentNodeData: any = parentNodeDoc.data();
        // Update the parent node by incrementing the number of versions on it.
        t.update(parentNodeRef, {
          versions: parentNodeData.versions + 1,
        });
      });
    }

    //TO:DO detached action that need to be done in queue
    await detach(async () => {
      let batch = db.batch();
      let writeCounts = 0;
      [batch, writeCounts] = await proposalNotification({
        batch,
        nodeId: newVersion.accepted ? parentNodeRef.id : parentId,
        nodeTitle: newVersion.accepted ? title : parentNodeData.title,
        uname: userData.uname,
        versionData: newVersion,
        currentTimestamp,
        writeCounts,
      });
      await commitBatch(batch);
    });

    // TODO: move these to queue
    // action tracks
    if (!versionAlreadyCreated) {
      await detach(async () => {
        const actionRef = db.collection("actionTracks").doc();
        actionRef.create({
          accepted: !!newVersion.accepted,
          type: "ChildNode",
          imageUrl: userData.imageUrl,
          action: versionNodeId,
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
          action: "Correct-" + versionNodeId,
          createdAt: currentTimestamp,
          doer: newVersion.proposer,
          chooseUname: userData.chooseUname,
          fullname: `${userData.fName} ${userData.lName}`,
          nodeId: newVersion.node,
          receivers: [userData.uname],
          email: userData.email,
        } as IActionTrack);
      });
    }
    if (!versionAlreadyCreated) {
      // TODO: move these to queue
      await detach(async () => {
        await updateStatsOnProposal({
          approved: !!newVersion.accepted,
          isChild: true,
          linksUpdated: true,
          nodeType: nodeType,
          proposer: newVersion.proposer,
          tagIds: newVersion.tagIds,
        });
      });
    }

    // we need update contributors, contribNames, institNames, institutions
    // TODO: move these to queue
    await detach(async () => {
      await updateNodeContributions({
        nodeId: newVersion.node,
        uname: newVersion.proposer,
        accepted: newVersion.accepted,
        contribution: 1,
      });
    });

    await detach(async () => {
      let batch = db.batch();
      let writeCounts: number = 0;
      if (!accepted) {
        [batch, writeCounts] = await addToPendingPropsNums({
          batch,
          tagIds: parentNodeData.tagIds,
          value: 1,
          voters: [userData.uname],
          writeCounts,
        });
      }
      /*  */
      if (accepted) {
        // If a question node gets accepted, it should be added to the practice tool for all
        // users in the communities with the tags that are used on this node.
        // That's why we need to get the list of all members of each of these tags (communities).
        if (nodeType === "Question") {
          [batch, writeCounts] = await createPractice({
            batch,
            tagIds: tagIds,
            nodeId: parentNodeRef.id,
            parentId: parents[0].id,
            currentTimestamp,
            writeCounts,
          });
        }
      }
      /*  */
      // A child node is being created. So, based on the tags on the node, we should make
      // the corresponding changes in the tags collection. At this point, we generate tagsData
      // to prepare for the changes.
      // The new child node id does not exist, so we just pass "1RandomID".
      if (accepted && !nodeAlreadyCreated) {
        [batch, writeCounts] = await generateTagsData({
          batch: batch,
          nodeId: parentNodeRef.id,
          isTag: false,
          nodeUpdates: newNode,
          nodeTagIds: [],
          nodeTags: [],
          versionTagIds: tagIds,
          versionTags: tags,
          proposer: userData.uname,
          aImgUrl: userData.imageUrl,
          aFullname: userData.fName + " " + userData.lName,
          aChooseUname: userData.chooseUname,
          currentTimestamp,
          writeCounts,
        });
      }

      /*  */

      // Signal all userNodes for all the users who have had some kind of interaction with the parent
      // node that a child is being added to it.
      if (accepted && !nodeAlreadyCreated) {
        [batch, writeCounts] = await signalAllUserNodesChanges({
          batch,
          userNodesRefs: userNodesParentRefs,
          userNodesData: userNodesParentData,
          nodeChanges: ParentNodeChanges,
          major: true,
          deleted: false,
          currentTimestamp,
          writeCounts,
        });
      }

      /*  */
      if (!versionAlreadyCreated || !nodeAlreadyCreated) {
        const reputationTypes: string[] = [
          "All Time",
          "Monthly",
          "Weekly",
          "Others",
          "Others Monthly",
          "Others Weekly",
        ];
        const comReputationUpdates: IComReputationUpdates = {};

        [batch, writeCounts] = await updateReputation({
          batch,
          uname: userData.uname,
          imageUrl: userData.imageUrl,
          fullname: userData.fName + " " + userData.lName,
          chooseUname: userData.chooseUname,
          tagIds: accepted ? tagIds : parentNodeData.tagIds,
          tags: accepted ? tags : parentNodeData.tags,
          nodeType: accepted ? nodeType : parentType,
          correctVal: 1,
          wrongVal: 0,
          instVal: 0,
          ltermVal: 0,
          ltermDayVal: 0,
          voter: userData.uname,
          writeCounts,
          comReputationUpdates,
        });

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
      }

      await commitBatch(batch);
    });

    return res.status(200).json({
      node: newVersion.node,
      proposal: versionNodeId,
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default fbAuth(handler);

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
