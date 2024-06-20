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
  getTypedCollections,
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

// Logic
// - getting versionsColl, userVersionsColl based on nodeType
// - processing versionCreateUpdate based on nodeType
//   - if version is not deleted then user can perform vote
//    - calling updating reputation method
//      - updating reputation and community increment basaed on tag ids
//    - getting user version based on nodeType, versionID, uname and voter
//    - checking is version approved based on wrongs and corrects
//    - if versionData is accepted
//      - getting newMaxVersionRating, adminPoints, nodeAdmin, aImgUrl, aFullname, aChooseUname from getCumulativeProposerVersionRatingsOnNode method
//      - proposal was accepted previously, not accepted just now
//        - schoolPoints, schoolMonthlyPoints, schoolWeeklyPoints, schoolOthersPoints, schoolOthMonPoints, schoolOthWeekPoints (not implemented)
//     - {nodeType}Versions, {nodeType}VersionComments (comments not implemented)
//     - nodes where this user is Admin

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

    let { addedParents, addedChildren, removedParents, removedChildren } = data || {};

    // remove ambiguous removedParents (if they exist in addedParents)
    if (Array.isArray(addedParents) && Array.isArray(removedParents)) {
      const addedParentIds = addedParents.filter((nodeLink: INodeLink) => String(nodeLink.node));
      const removedParentIds = removedParents.filter((nodeLink: INodeLink) => String(nodeLink.node));
      addedParents = addedParents.filter((addedParent: INodeLink) => removedParentIds.indexOf(addedParent.node) === -1);
      removedParents = removedParents.filter(
        (removedParent: INodeLink) => addedParentIds.indexOf(removedParent.node) === -1
      );
    }

    // remove ambiguous removedChildren (if they exist in addedChildren)
    if (Array.isArray(addedChildren) && Array.isArray(removedChildren)) {
      const addedChildIds = addedChildren.filter((nodeLink: INodeLink) => String(nodeLink.node));
      const removedChildIds = removedChildren.filter((nodeLink: INodeLink) => String(nodeLink.node));
      addedChildren = addedChildren.filter((addedChild: INodeLink) => removedChildIds.indexOf(addedChild.node) === -1);
      removedChildren = removedChildren.filter(
        (removedChild: INodeLink) => addedChildIds.indexOf(removedChild.node) === -1
      );
    }

    const { userData } = user || {};
    let batch = db.batch();
    let writeCounts = 0;

    let { referenceIds, references, referenceLabels } = data || {};
    if (references.length && typeof references[0] === "object") {
      referenceIds = references.map((_reference: INodeLink) => _reference.node);
      referenceLabels = references.map((_reference: INodeLink) => _reference.label);
      references = references.map((_reference: INodeLink) => _reference.title);
    }
    if (!Array.isArray(referenceIds)) {
      referenceIds = [];
    }
    if (!Array.isArray(references)) {
      references = [];
    }
    if (!Array.isArray(referenceLabels)) {
      referenceLabels = [];
    }

    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
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

    const { versionsColl, userVersionsColl }: any = getTypedCollections();

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
    if (nodeType !== nodeData.nodeType) {
      versionData.changedNodeType = true;
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

    // From here on, we specify the type of the changes that the user is proposing on this node
    // using some boolean fields to be added to the version.
    if (nodeType === "Question" && versionData.choices) {
      if (versionData?.choices?.length > nodeData?.choices?.length) {
        versionData.addedChoices = true;
      } else if (versionData?.choices?.length < nodeData?.choices?.length) {
        versionData.deletedChoices = true;
      }
      if (!compareChoices({ node1: data, node2: nodeData })) {
        versionData.changedChoices = true;
      }
    }

    if (nodeType !== nodeData.nodeType) {
      const _nodeTypes: string[] = nodeData.nodeTypes || [];
      _nodeTypes.push(nodeData.nodeType);
      const nodeTypes = new Set<string>(_nodeTypes);
      nodeTypes.add(nodeType);

      batch.update(nodeRef, {
        nodeTypes: Array.from(nodeTypes),
      });
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }

    if (title.trim() !== nodeData.title.trim()) {
      versionData.changedTitle = true;
    }
    if (content.trim() !== nodeData.content.trim()) {
      versionData.changedContent = true;
    }
    if (nodeImage !== "" && nodeData.nodeImage === "") {
      versionData.addedImage = true;
    } else if (nodeImage === "" && nodeData.nodeImage !== "") {
      versionData.deletedImage = true;
    } else if (nodeImage !== nodeData.nodeImage) {
      versionData.changedImage = true;
    }
    if (nodeVideo !== "" && nodeData.nodeVideo === "") {
      versionData.addedVideo = true;
    } else if (nodeVideo === "" && nodeData.nodeVideo !== "") {
      versionData.deletedVideo = true;
    } else if (nodeVideo !== nodeData.nodeVideo) {
      versionData.changedVideo = true;
    }
    if (nodeAudio !== "" && nodeData.nodeAudio === "") {
      versionData.addedAudio = true;
    } else if (nodeAudio === "" && nodeData.nodeAudio !== "") {
      versionData.deletedAudio = true;
    } else if (nodeAudio !== nodeData.nodeAudio) {
      versionData.changedAudio = true;
    }
    if (versionData.referenceIds.length > nodeData.referenceIds.length) {
      versionData.addedReferences = true;
    } else if (versionData.referenceIds.length < nodeData.referenceIds.length) {
      versionData.deletedReferences = true;
    }
    if (
      !compareFlatLinks({ links1: referenceIds, links2: nodeData.referenceIds }) ||
      !compareFlatLinks({ links1: referenceLabels, links2: nodeData.referenceLabels })
    ) {
      versionData.changedReferences = true;
    }
    if (versionData.tagIds.length > nodeData.tagIds.length) {
      versionData.addedTags = true;
    } else if (versionData.tagIds.length < nodeData.tagIds.length) {
      versionData.deletedTags = true;
    }
    if (!compareFlatLinks({ links1: tagIds, links2: nodeData.tagIds })) {
      versionData.changedTags = true;
    }
    if (addedParents.length > 0) {
      versionData.addedParents = true;
    }
    if (addedChildren.length > 0) {
      versionData.addedChildren = true;
    }
    if (removedParents.length > 0) {
      versionData.removedParents = true;
    }
    if (removedChildren.length > 0) {
      versionData.removedChildren = true;
    }
    batch.set(versionRef, versionData);
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

    const userVersionRef = userVersionsColl.doc();
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
    await detach(async () => {
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
    await detach(async () => {
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

    // TODO: move these to queue
    await detach(async () => {
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
    await detach(async () => {
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
