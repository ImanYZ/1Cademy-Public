import {
  deleteTagCommunityAndTagsOfTags,
  getAllUserNodes,
  getNode,
  retrieveAndsignalAllUserNodesChanges,
  signalAllUserNodesChanges,
} from "src/utils";

import { batchUpdate, commitBatch, db } from "./utils/admin";

type INodeDeletedUpdates = {
  nodeId: string;
  nodeData: any;
};
export const nodeDeletedUpdates = async ({ nodeId, nodeData }: INodeDeletedUpdates) => {
  const currentTimestamp = new Date();
  let { userNodesRefs, userNodesData }: any = await getAllUserNodes({ nodeId });
  await signalAllUserNodesChanges({
    userNodesRefs,
    userNodesData,
    nodeChanges: {},
    major: true,
    deleted: true,
    currentTimestamp,
  });
  // Delete the node from the list of children of each parent node
  for (let parentLink of nodeData.parents) {
    const parentId = parentLink.node;
    const parentNode = await getNode({ nodeId: parentId });
    //  filter out node to be deleted
    const newChildren = parentNode.nodeData.children.filter((l: any) => l.node !== nodeId);
    const nodeChanges = {
      children: newChildren,
      changedAt: currentTimestamp,
      updatedAt: currentTimestamp,
    };
    await batchUpdate(parentNode.nodeRef, nodeChanges);
    await retrieveAndsignalAllUserNodesChanges({
      linkedId: parentId,
      nodeChanges,
      major: true,
      currentTimestamp,
    });
  }

  // Delete the node from the list of parents of each child node
  for (let childLink of nodeData.children) {
    const childId = childLink.node;
    const childNode: any = await getNode({ nodeId: childId });
    //  filter out node to be deleted
    const newParents = childNode.nodeData.parents.filter((l: any) => l.node !== nodeId);
    const nodeChanges = {
      parents: newParents,
      changedAt: currentTimestamp,
      updatedAt: currentTimestamp,
    };
    batchUpdate(childNode.nodeRef, nodeChanges);

    await retrieveAndsignalAllUserNodesChanges({
      linkedId: childId,
      nodeChanges,
      major: true,
      currentTimestamp,
    });
  }

  //  retrieve all the nodes that are tagging this current node, then remove current node from their list of tags
  if (nodeData.isTag) {
    const taggedNodesRefs = db.collection("nodes").where("tagIds", "array-contains", nodeId);
    const taggedNodesDocs = await taggedNodesRefs.get();
    //  Delete tag from the list of nodes that contain it
    for (let taggedNodeDoc of taggedNodesDocs.docs) {
      const taggedNodeRef = db.collection("nodes").doc(taggedNodeDoc.id);
      const taggedNodeData = taggedNodeDoc.data();
      //  remove tag from node
      const tagIdx = taggedNodeData.tagIds.findIndex((tagId: any) => tagId === nodeId);
      if (tagIdx !== -1) {
        taggedNodeData.tagIds.splice(tagIdx, 1);
        taggedNodeData.tags.splice(tagIdx, 1);
        const nodeChanges = {
          tagIds: taggedNodeData.tagIds,
          tags: taggedNodeData.tags,
          changedAt: currentTimestamp,
          updatedAt: currentTimestamp,
        };
        batchUpdate(taggedNodeRef, nodeChanges);
        await retrieveAndsignalAllUserNodesChanges({
          linkedId: taggedNodeDoc.id,
          nodeChanges,
          major: true,
          currentTimestamp,
        });
      }
    }
    await deleteTagCommunityAndTagsOfTags({
      nodeId,
    });
  }

  //  Iterate through tags in nodeData and obtain other nodes with the same tag that are not deleted
  //  if such nodes exist, set isTag property to false

  for (let tagId of nodeData.tagIds) {
    const taggedNodeDocs = await db
      .collection("nodes")
      .where("tagIds", "array-contains", tagId)
      .where("deleted", "==", false)
      .limit(2)
      .get();
    if (taggedNodeDocs.docs.length <= 1) {
      await deleteTagCommunityAndTagsOfTags({
        nodeId: tagId,
      });
      const tagNodeRef = db.collection("nodes").doc(tagId);
      batchUpdate(tagNodeRef, { deleted: true, updatedAt: currentTimestamp });
    }
  }

  //  query all the nodes that are referencing current node with nodeId
  if (nodeData.nodeType === "Reference") {
    const citingNodesRefs = db.collection("nodes").where("referenceIds", "array-contains", nodeId);
    const citingNodesDocs = await citingNodesRefs.get();

    for (let citingNodeDoc of citingNodesDocs.docs) {
      const citingNodeRef = db.collection("nodes").doc(citingNodeDoc.id);
      const citingNodeData = citingNodeDoc.data();
      const referenceIdx = citingNodeData.referenceIds.indexOf(nodeId);
      if (referenceIdx !== -1) {
        citingNodeData.references.splice(referenceIdx, 1);
        citingNodeData.referenceLabels.splice(referenceIdx, 1);
        citingNodeData.referenceIds.splice(referenceIdx, 1);
        const nodeChanges = {
          references: citingNodeData.references,
          referenceLabels: citingNodeData.referenceLabels,
          referenceIds: citingNodeData.referenceIds,
          changedAt: currentTimestamp,
          updatedAt: currentTimestamp,
        };
        batchUpdate(citingNodeRef, nodeChanges);
        await retrieveAndsignalAllUserNodesChanges({
          linkedId: citingNodeDoc.id,
          nodeChanges,
          major: true,
          currentTimestamp,
        });
      }
    }
  }
  await commitBatch();
};
