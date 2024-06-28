import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "../../middlewares/fbAuth";

import { admin, checkRestartBatchWriteCounts, commitBatch, db } from "../../lib/firestoreServer/admin";
import {
  addToPendingPropsNums,
  compareChoices,
  compareFlatLinks,
  convertToTGet,
  createUpdateUserVersion,
  getNode,
  getQueryCollections,
  proposalNotification,
  versionCreateUpdate,
} from "../../utils";
import { INodeLink } from "src/types/INodeLink";
import { detach } from "src/utils/helpers";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";
import { IInstitution } from "src/types/IInstitution";
import { generateTagsOfTagsWithNodes, signalNodeToTypesense, updateNodeContributions } from "src/utils/version-helpers";
import { getTypesenseClient, typesenseDocumentExists } from "@/lib/typesense/typesense.config";
import { INodeVersion } from "src/types/INodeVersion";
import { IActionTrack } from "src/types/IActionTrack";
import { shouldInstantApprovalForProposal, updateStatsOnProposal } from "src/utils/course-helpers";
import { addToQueue } from "./queue/queue";

// Logic
// - getting versionsColl, userVersionsColl based on nodeType
// - processing versionCreateUpdate based on nodeType
//   - if version is not deleted then user can perform vote
//    - calling updating reputation method
//      - updating reputation and community increment baaed on tag ids
//    - getting user version based on nodeType, versionID, uname and voter
//    - checking is version approved based on wrongs and corrects
//    - if versionData is accepted
//      - getting newMaxVersionRating, adminPoints, nodeAdmin, aImgUrl, aFullname, aChooseUname from getCumulativeProposerVersionRatingsOnNode method
//      - proposal was accepted previously, not accepted just now
//        - schoolPoints, schoolMonthlyPoints, schoolWeeklyPoints, schoolOthersPoints, schoolOthMonPoints, schoolOthWeekPoints (not implemented)
//     - {nodeType}Versions, {nodeType}VersionComments (comments not implemented)
//     - nodes where this user is Admin
function removeAmbiguousLinks(addedLinks: INodeLink[], removedLinks: INodeLink[]) {
  if (Array.isArray(addedLinks) && Array.isArray(removedLinks)) {
    const addedIds = new Set(addedLinks.map((nodeLink: INodeLink) => String(nodeLink.node)));
    const removedIds = new Set(removedLinks.map((nodeLink: INodeLink) => String(nodeLink.node)));

    addedLinks = addedLinks.filter((link: INodeLink) => !removedIds.has(String(link.node)));
    removedLinks = removedLinks.filter((link: INodeLink) => !addedIds.has(String(link.node)));
  }
  return [addedLinks, removedLinks];
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data } = req.body || {};
    const {
      id,
      user,
      title,
      children,
      content,
      nodeType,
      nodeImage,
      nodeVideo,
      nodeVideoStartTime,
      nodeVideoEndTime,
      nodeAudio,
      parents,
      tagIds,
      tags,
      subType,
      proposal,
      summary,
      choices,
    } = data || {};
    /* whet you need to call this endpoint  */
    let { addedParents, addedChildren, removedParents, removedChildren } = data || {};
    const { userData } = user || {};
    let { referenceIds, references, referenceLabels } = data || {};
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());

    // remove ambiguous removedParents (if they exist in addedParents)
    [addedParents, removedParents] = removeAmbiguousLinks(addedParents, removedParents);
    // remove ambiguous removedChildren (if they exist in addedChildren)
    [addedChildren, removedChildren] = removeAmbiguousLinks(addedChildren, removedChildren);

    let batch = db.batch();
    let writeCounts = 0;

    // Check if 'references' is an array with at least one element and each element is an object
    if (references.length && typeof references[0] === "object") {
      // Extract 'node' property from each object in 'references' and store in 'referenceIds'
      referenceIds = references.map((_reference: INodeLink) => _reference.node);
      // Extract 'label' property from each object in 'references' and store in 'referenceLabels'
      referenceLabels = references.map((_reference: INodeLink) => _reference.label);
      // Extract 'title' property from each object in 'references' and store in 'references' (overwriting the original)
      references = references.map((_reference: INodeLink) => _reference.title);
    }

    // If 'referenceIds' is not already an array, initialize it as an empty array
    if (!Array.isArray(referenceIds)) {
      referenceIds = [];
    }

    // If 'references' is not already an array, initialize it as an empty array
    if (!Array.isArray(references)) {
      references = [];
    }

    // If 'referenceLabels' is not already an array, initialize it as an empty array
    if (!Array.isArray(referenceLabels)) {
      referenceLabels = [];
    }

    const { nodeData, nodeRef } = await getNode({ nodeId: id });

    // remove ambiguous addedParents (if they exist in nodeData)
    if (Array.isArray(addedParents)) {
      const currentParentIds: string[] = nodeData.parents.filter((parent: any) => parent?.node);
      addedParents = addedParents.filter((nodeLink: INodeLink) => currentParentIds.indexOf(nodeLink.node) === -1);
    }

    // remove ambiguous addedChildren (if they exist in nodeData)
    if (Array.isArray(addedChildren)) {
      const currentChildIds: string[] = nodeData.children.filter((children: any) => children?.node);
      addedChildren = addedChildren.filter((nodeLink: INodeLink) => currentChildIds.indexOf(nodeLink.node) === -1);
    }

    const { versionsColl, userVersionsColl }: any = getQueryCollections();

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
      nodeId: id,
      tagIds,
      nodeUpdates: tagUpdates,
      nodes: nodesMap,
      visitedNodeIds,
    });

    const versionRef = versionsColl.doc();
    const versionData: INodeVersion = {
      node: id,
      title,
      children,
      content,
      nodeImage,
      nodeVideo,
      nodeVideoStartTime,
      nodeVideoEndTime,
      nodeAudio,
      parents,
      referenceIds,
      referenceLabels,
      references: references,
      tagIds: tagUpdates.tagIds,
      tags: tagUpdates.tags,
      proposer: userData.uname,
      imageUrl: userData.imageUrl,
      fullname: userData.fullname,
      chooseUname: userData.chooseUname,
      subType,
      proposal,
      summary,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      viewers: 1,
      corrects: 0,
      wrongs: 0,
      awards: 0,
      deleted: false,
      accepted: false,
      nodeType,
    };
    if (nodeType === "Question") {
      versionData.choices = choices;
    }

    const { isInstructor, courseExist, instantApprove } = await shouldInstantApprovalForProposal(
      tagUpdates.tagIds || [],
      userData.uname
    );

    [batch, writeCounts] = await versionCreateUpdate({
      batch,
      nodeId: id,
      nodeData,
      nodeRef,
      nodeType: nodeType,
      instantApprove,
      courseExist,
      isInstructor,
      versionId: versionRef.id,
      versionData,
      newVersion: true,
      childType: "",
      voter: userData.uname,
      correct: 1,
      wrong: 0,
      award: 0,
      addedParents,
      addedChildren,
      removedParents,
      removedChildren,
      currentTimestamp,
      newUpdates: {},
      writeCounts,
      tWriteOperations: null,
      t: null,
      versionNodeId: "",
      notebookId: "",
    });

    versionData.corrects = 1;

    const userVersionRef = userVersionsColl.doc();
    //user versions have the logs of votes on each version
    //we add the current user vote on his own proposal
    const userVersionData = {
      award: false,
      correct: true,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      version: versionRef.id,
      user: userData.uname,
      wrong: false,
      node: id,
    };
    [batch, writeCounts] = await createUpdateUserVersion({
      batch,
      userVersionRef,
      userVersionData,
      nodeType,
      writeCounts,
    });
    await commitBatch(batch);
    //  If the proposal is not approved, we do not directly update the node document inside versionCreateUpdate function,
    //  so we have to set nodeData.versions + 1 here
    addToQueue(async () => {
      let batch = db.batch();
      let writeCounts: number = 0;
      if (!versionData.accepted) {
        batch.update(nodeRef, {
          versions: nodeData.versions + 1,
          updatedAt: currentTimestamp,
        });
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        [batch, writeCounts] = await addToPendingPropsNums({
          batch,
          tagIds: nodeData.tagIds,
          value: 1,
          voters: [userData.uname],
          writeCounts,
        });
      }

      [batch, writeCounts] = await proposalNotification({
        batch,
        nodeId: id,
        nodeTitle: versionData.accepted ? title : nodeData.title,
        uname: userData.uname,
        versionData,
        currentTimestamp,
        writeCounts,
      });
      await commitBatch(batch);
    });

    // TODO: move these to queue
    // action tracks
    addToQueue(async () => {
      console.log("created actionTracks");
      const actionRef = db.collection("actionTracks").doc();
      actionRef.create({
        accepted: !!versionData.accepted,
        type: "Improvement",
        imageUrl: userData.imageUrl,
        action: versionRef.id,
        createdAt: currentTimestamp,
        doer: versionData.proposer,
        chooseUname: userData.chooseUname,
        fullname: `${userData.fName} ${userData.lName}`,
        nodeId: versionData.node,
        receivers: [userData.uname],
        email: userData.email,
        bitch: "created actionTracks",
      } as IActionTrack);

      const rateActionRef = db.collection("actionTracks").doc();
      rateActionRef.create({
        accepted: !!versionData.accepted,
        type: "RateVersion",
        imageUrl: userData.imageUrl,
        action: "Correct-" + versionRef.id,
        createdAt: currentTimestamp,
        doer: versionData.proposer,
        chooseUname: userData.chooseUname,
        fullname: `${userData.fName} ${userData.lName}`,
        nodeId: versionData.node,
        receivers: [userData.uname],
        email: userData.email,
      } as IActionTrack);
    });
    addToQueue(async () => {
      await updateStatsOnProposal({
        approved: !!versionData.accepted,
        isChild: false,
        linksUpdated: !!(
          versionData.addedParents ||
          versionData.addedChildren ||
          versionData.removedParents ||
          versionData.removedChildren
        ),
        nodeType,
        proposer: versionData.proposer,
        tagIds: versionData.tagIds,
      });
    });

    // update typesense record for node
    // we need update contributors, contribNames, institNames, institutions
    // TODO: move these to queue
    addToQueue(async () => {
      await updateNodeContributions({
        nodeId: versionData.node,
        uname: userData.uname,
        accepted: versionData.accepted,
        contribution: 1,
      });
      if (versionData.accepted) {
        await signalNodeToTypesense({
          nodeId: versionData.node,
          currentTimestamp,
          versionData,
        });
      }
    });

    return res.status(200).json({
      node: versionData.node,
      proposal: versionRef.id,
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default fbAuth(handler);
