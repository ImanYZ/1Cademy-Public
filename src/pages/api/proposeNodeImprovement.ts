import { NextApiRequest, NextApiResponse } from "next";

import {
  admin,
  checkRestartBatchWriteCounts,
  db,
} from "../../lib/firestoreServer/admin";
import {
  getNode,
  getTypedCollections,
  initializeNewReputationData,
  retrieveAndsignalAllUserNodesChanges,
  tagsAndCommPoints,
  updateReputation
} from '../../utils';

const reputationTypes = [
  "reputations",
  "monthlyReputations",
  "weeklyReputations",
  "othersReputations",
  "othMonReputations",
  "othWeekReputations",
];

const NODE_TYPES = [
  "Concept",
  "Code",
  "Relation",
  "Question",
  "Profile",
  "Sequel",
  "Advertisement",
  "Reference",
  "News",
  "Idea",
];

const improvementTypes = [
  "addedChoices",
  "deletedChoices",
  "changedChoices",
  "changedTitle",
  "changedContent",
  "addedImage",
  "deletedImage",
  "changedImage",
  "addedVideo",
  "deletedVideo",
  "changedVideo",
  "addedAudio",
  "deletedAudio",
  "changedAudio",
  "addedReferences",
  "deletedReferences",
  "changedReferences",
  "addedTags",
  "deletedTags",
  "changedTags",
  "addedParents",
  "addedChildren",
  "removedParents",
  "removedChildren",
];

const setOrIncrementNotificationNums = async ({ batch, proposer, writeCounts }: any) => {
  let newBatch = batch;
  const notificationNumRef = db.collection("notificationNums").doc(proposer);
  const notificationNumDoc = await notificationNumRef.get();
  if (notificationNumDoc.exists) {
    newBatch.update(notificationNumRef, { nNum: admin.firestore.FieldValue.increment(1) });
  } else {
    newBatch.set(notificationNumRef, { nNum: 1 });
  }
  [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  return [newBatch, writeCounts];
};

const compareChoices = ({ node1, node2 }: any) => {
  if (!("choices" in node1) && !("choices" in node2)) {
    return true;
  }
  if (
    ("choices" in node1 && !("choices" in node2)) ||
    (!("choices" in node1) && "choices" in node2)
  ) {
    return false;
  }
  if (node1.choices.length !== node2.choices.length) {
    return false;
  }
  for (let i = 0; i < node1.choices.length; i++) {
    if (
      node1.choices[i].choice !== node2.choices[i].choice ||
      node1.choices[i].correct !== node2.choices[i].correct ||
      node1.choices[i].feedback !== node2.choices[i].feedback
    ) {
      return false;
    }
  }
  return true;
};

const addToPendingPropsNums = async ({ batch, tagIds, value, voters, writeCounts }: any) => {
  let newBatch = batch;
  for (let tagId of tagIds) {
    const communityUsersDocs = await db
      .collection("users")
      .where("tagIds", "array-contains", tagId)
      .get();
    for (let communityUserDoc of communityUsersDocs.docs) {
      // We should not increment the pendingPropsNums for the users who have already voted the pending proposal.
      if (!voters.includes(communityUserDoc.id)) {
        const pendingPropsNumsDocs = await db
          .collection("pendingPropsNums")
          .where("uname", "==", communityUserDoc.id)
          .where("tagId", "==", tagId)
          .get();
        if (pendingPropsNumsDocs.docs.length > 0) {
          const pendingPropsNumsRef = db
            .collection("pendingPropsNums")
            .doc(pendingPropsNumsDocs.docs[0].id);
          newBatch.update(pendingPropsNumsRef, {
            pNums: admin.firestore.FieldValue.increment(value),
          });
        } else if (value > 0) {
          const pendingPropsNumsRef = db.collection("pendingPropsNums").doc();
          newBatch.set(pendingPropsNumsRef, {
            uname: communityUserDoc.id,
            tagId,
            pNum: value,
          });
        }
        [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      }
    }
  }
  return [newBatch, writeCounts];
};

const proposalNotification = async ({
  batch,
  nodeId,
  nodeTitle,
  uname,
  versionData,
  currentTimestamp,
  writeCounts
}: any) => {
  let newBatch = batch;
  let notificationData: any = {
    uname: uname,
    proposer: versionData.proposer,
    imageUrl: versionData.imageUrl,
    fullname: versionData.fullname,
    chooseUname: versionData.chooseUname,
    nodeId,
    title: nodeTitle,
    // Origin type
    oType: "Propo",
    checked: false,
    createdAt: currentTimestamp,
  };
  if (versionData.accepted) {
    notificationData.oType = "PropoAccept";
  }
  // Action type
  notificationData.aType = "";
  if (versionData.newChild) {
    notificationData.aType = "newChild";
  } else {
    notificationData.aType = [];
    for (let improvementType of improvementTypes) {
      if (versionData[improvementType]) {
        notificationData.aType.push(improvementType);
      }
    }
  }
  if (notificationData.aType.length !== 0) {
    const notificationRef = db.collection("notifications").doc();
    newBatch.set(notificationRef, notificationData);
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    [newBatch, writeCounts] = await setOrIncrementNotificationNums({
      batch: newBatch,
      proposer: versionData.proposer,
      writeCounts
    });
  }
  return [newBatch, writeCounts];
};

const compareFlatLinks = ({ links1, links2 }: any) => {
  if (links1.length !== links2.length) {
    return false;
  }
  for (let i = 0; i < links1.length; i++) {
    if (links1[i] !== links2[i]) {
      return false;
    }
  }
  return true;
};

const createPractice = async ({ batch, tagIds, nodeId, currentTimestamp, writeCounts }: any) => {
  let newBatch = batch;
  let usersRef, usersDocs, practiceRef;
  for (let tagId of tagIds) {
    usersRef = db.collection("users").where("tagId", "==", tagId);
    usersDocs = await usersRef.get();
    for (let userDoc of usersDocs.docs) {
      practiceRef = db.collection("practice").doc();
      newBatch.set(practiceRef, {
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
        eFactor: 2.5,
        iInterval: 0,
        lastCompleted: null,
        lastPresented: null,
        nextDate: currentTimestamp,
        node: nodeId,
        q: 0,
        tagId,
        tag: null,
        user: userDoc.id,
      });
      [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    }
  }
  return [newBatch, writeCounts];
};

const getTagRefData = async (nodeId: string) => {
  let tagRef: any = db.collection("tags").where("node", "==", nodeId);
  const tagDoc = await tagRef.get();
  let tagData = null;
  if (tagDoc.docs.length > 0) {
    tagRef = db.collection("tags").doc(tagDoc.docs[0].id);
    tagData = tagDoc.data();
  } else {
    tagRef = db.collection("tags");
  }
  return { tagRef, tagData };
};

// Subtract the union of descendents of tags from the direct list of tags on the node.
// The result will be used for the list of tags on the corresponding tag.
const getDirectTags = async ({ nodeTagIds, nodeTags, tagsOfNodes = null }: any) => {
  let tagIds;
  let unionOfIndirectTagIds: any[] = [];
  for (let tagId of nodeTagIds) {
    if (tagsOfNodes) {
      tagIds = tagsOfNodes[tagId].tagIds;
    } else {
      const tagNodeDoc = await db.collection("nodes").doc(tagId).get();
      const tagNodeData: any = tagNodeDoc.data();
      tagIds = tagNodeData.tagIds;
    }
    for (let indirectTagId of tagIds) {
      if (!unionOfIndirectTagIds.includes(indirectTagId)) {
        unionOfIndirectTagIds.push(indirectTagId);
      }
    }
  }
  tagIds = [];
  const tags = [];
  for (let tagIdx = 0; tagIdx < nodeTagIds.length; tagIdx++) {
    if (!unionOfIndirectTagIds.includes(nodeTagIds[tagIdx])) {
      tagIds.push(nodeTagIds[tagIdx]);
      tags.push(nodeTags[tagIdx]);
    }
  }
  return { tags, tagIds };
};

const changeTagTitleInCollection = async ({ batch, collectionName, nodeId, newTitle, writeCounts }: any) => {
  let newBatch = batch;
  const linkedRefs = db.collection(collectionName).where("tagId", "==", nodeId);
  const linkedDocs = await linkedRefs.get();
  for (let linkedDoc of linkedDocs.docs) {
    const linkedRef = db.collection(collectionName).doc(linkedDoc.id);
    newBatch.update(linkedRef, { tag: newTitle });
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  }
  return [newBatch, writeCounts];
};

const changeNodeTitle = async ({
  batch,
  nodeData,
  nodeId,
  newTitle,
  nodeType,
  currentTimestamp,
  writeCounts
}: any) => {
  let newBatch = batch;
  let linkedDataChanges = {};
  for (let parent of nodeData.parents) {
    const linkedRef = db.collection("nodes").doc(parent.node);
    const linkedDoc = await linkedRef.get();
    const linkedData: any = linkedDoc.data();
    const newChildren = linkedData.children.filter((child: any) => child.node !== nodeId);
    newChildren.push({ title: newTitle, node: nodeId, label: "", type: nodeType });
    linkedDataChanges = {
      children: newChildren,
      updatedAt: currentTimestamp,
    };
    newBatch.update(linkedRef, linkedDataChanges);
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    [newBatch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
      newBatch,
      linkedId: parent.node,
      nodeChanges: linkedDataChanges,
      major: false,
      currentTimestamp,
      writeCounts
    });
  }
  for (let child of nodeData.children) {
    const linkedRef = db.collection("nodes").doc(child.node);
    const linkedDoc = await linkedRef.get();
    const linkedData: any = linkedDoc.data();
    const newParents = linkedData.parents.filter((parent: any) => parent.node !== nodeId);
    newParents.push({ title: newTitle, node: nodeId, label: "", type: nodeType });
    linkedDataChanges = {
      ...linkedDataChanges,
      parents: newParents,
      updatedAt: currentTimestamp,
    };
    newBatch.update(linkedRef, linkedDataChanges);
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    [newBatch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
      batch: newBatch,
      linkedId: child.node,
      nodeChanges: linkedDataChanges,
      major: false,
      currentTimestamp,
      writeCounts
    });
  }
  if (nodeData.isTag) {
    const taggedNodesDocs = await db
      .collection("nodes")
      .where("tagIds", "array-contains", nodeId)
      .get();
    for (let taggedNodeDoc of taggedNodesDocs.docs) {
      const linkedRef = db.collection("nodes").doc(taggedNodeDoc.id);
      const linkedData = taggedNodeDoc.data();
      const tagIdx = linkedData.tagIds.findIndex(nodeId);
      linkedData.tags[tagIdx] = newTitle;
      linkedDataChanges = {
        tags: linkedData.tags,
        updatedAt: currentTimestamp,
      };
      newBatch.update(linkedRef, linkedDataChanges);
      [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      [newBatch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
        batch: newBatch,
        linkedId: taggedNodeDoc.id,
        nodeChanges: linkedDataChanges,
        major: false,
        currentTimestamp,
        writeCounts
      });
    }

    await tagsAndCommPoints({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      nodeId, callBack: async ({ collectionName, tagRef, tagDoc, tagData }: any) => {
        if (tagDoc) {
          const tagUpdates: any = {
            updatedAt: currentTimestamp
          };
          if (collectionName === "tags") {
            tagUpdates.title = newTitle;
          } else {
            tagUpdates.tag = newTitle;
          }
          newBatch.update(tagRef, tagUpdates);
          [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
        }
      }
    });
    const collectionNames = [
      ...reputationTypes,
      "credits",
      "messages",
      "practice",
      "practiceCompletion",
      "practiceLog",
      "presentations",
      "users",
    ];
    for (let collectionName of collectionNames) {
      [newBatch, writeCounts] = await changeTagTitleInCollection({
        batch: newBatch,
        collectionName,
        nodeId,
        newTitle,
        writeCounts
      });
    }
    for (let nodeType of NODE_TYPES) {
      const { versionsColl }: any = getTypedCollections(nodeType);
      const versionsQuery = versionsColl.where("tagIds", "array-contains", nodeId);
      const versionsDocs = await versionsQuery.get();
      for (let versionDoc of versionsDocs.docs) {
        const linkedRef = versionsColl.doc(versionDoc.id);
        const linkedData = versionDoc.data();
        const tagIdx = linkedData.tagIds.findIndex(nodeId);
        linkedData.tags[tagIdx] = newTitle;
        linkedDataChanges = {
          tags: linkedData.tags,
          updatedAt: currentTimestamp,
        };
        newBatch.update(linkedRef, linkedDataChanges);
        [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      }
    }
  }
  if (nodeData.nodeType === "Reference") {
    const citingNodesDocs = await db
      .collection("nodes")
      .where("referenceIds", "array-contains", nodeId)
      .get();
    for (let citingNodeDoc of citingNodesDocs.docs) {
      const linkedRef = db.collection("nodes").doc(citingNodeDoc.id);
      const linkedData = citingNodeDoc.data();
      const theRefIdx = linkedData.referenceIds.findIndex(nodeId);
      linkedData.references[theRefIdx] = newTitle;
      linkedDataChanges = {
        references: linkedData.references,
        updatedAt: currentTimestamp,
      };
      newBatch.update(linkedRef, linkedDataChanges);
      [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      [newBatch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
        batch: newBatch,
        linkedId: citingNodeDoc.id,
        nodeChanges: linkedDataChanges,
        major: false,
        currentTimestamp,
        writeCounts
      });
    }
  }
  const notificationsDocs = await db
    .collection("notifications")
    .where("nodeId", "==", nodeId)
    .get();
  for (let notificationDoc of notificationsDocs.docs) {
    const notificationRef = db.collection("notifications").doc(notificationDoc.id);
    newBatch.update(notificationRef, { title: newTitle });
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  }
  return [newBatch, writeCounts];
};

// Push the new or updated tag and comPoints documents to linkedNodesRefs and linkedNodesData
// Should be called when adding a tag to a node.
const addTagCommunityAndTagsOfTags = async ({
  batch,
  tagNodeId,
  tagTitle,
  proposer,
  aImgUrl,
  aFullname,
  aChooseUname,
  currentTimestamp,
  writeCounts
}: any) => {
  let newBatch = batch;
  await tagsAndCommPoints({
    nodeId: tagNodeId, callback: async ({ collectionName, tagRef, tagDoc, tagData }: any) => {
      let tagNewData;
      // If the tag or comPoints document already exists in the corresponding collection:
      if (tagDoc) {
        tagNewData = { ...tagData };
        if (tagData.deleted) {
          tagNewData.deleted = false;
        }
        // If it's a tag doc:
        if (collectionName === "tags") {
          tagNewData.nodesNum = tagNewData.nodesNum + 1;
          tagNewData.updatedAt = currentTimestamp;
        }
      } else {
        // If it's a tag doc:
        if (collectionName === "tags") {
          const tagNodeRef = db.collection("nodes").doc(tagNodeId);
          const tagNodeDoc = await tagNodeRef.get();
          const tagNodeData: any = tagNodeDoc.data();
          await newBatch.update(tagNodeRef, {
            isTag: true,
            updatedAt: currentTimestamp,
          });
          [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          tagNewData = {
            ...getDirectTags({ nodeTagIds: tagNodeData.tagsIds, nodeTags: tagNodeData.tags, tagsOfNodes: null }),
            // Number of the nodes tagging this tag.
            nodesNum: 1,
            node: tagNodeId,
            title: tagTitle,
            deleted: false,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
          };
          // If we need to create different types of community point documents:
        } else {
          tagNewData = initializeNewReputationData(
            tagNodeId,
            tagTitle,
            currentTimestamp,
            currentTimestamp
          );
          tagNewData = { ...tagNewData, adminPoints: 1, admin: proposer, aImgUrl, aFullname, aChooseUname };
          delete tagNewData.isAdmin;
        }
      }
      await newBatch.set(tagRef, tagNewData);
      [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    }
  });
  return [newBatch, writeCounts];
};

// Should be called when deleting a tag from a node.
const deleteTagFromNodeTagCommunityAndTagsOfTags = async ({
  batch,
  tagNodeId,
  currentTimestamp,
  writeCounts
}: any) => {
  let newBatch = batch;
  let shouldRemove = false;
  // Delete the corresponding tag document from the tags collection.
  await tagsAndCommPoints({
    nodeId: tagNodeId, callback: async ({ collectionName, tagRef, tagDoc, tagData }: any) => {
      if (tagDoc && !tagData.deleted) {
        const tagUpdates: any = {};
        // Only delete the tag document. Later, in the update time, we'll delete the corresponding comPoints documents.
        if (collectionName === "tags") {
          tagUpdates.nodesNum = tagData.nodesNum - 1;
          tagUpdates.updatedAt = currentTimestamp;
          if (tagUpdates.nodesNum === 0) {
            shouldRemove = true;
            tagUpdates.deleted = true;
          }
        }
        // If this is a comPoints document, it should be deleted because its corresponding tag is being deleted.
        // This is helpful when we retrieve the comPoint documents to display them on the leaderboard,
        // we don't retrieve those communities that should have been deleted.
        // Because tags will be the very first collection in the for loop, we will identify the value of shouldRemove
        // before continuing with the comPoints collections. So, if shouldRemove, we should delete the corresponding comPoints.
        else {
          if (shouldRemove) {
            tagUpdates.deleted = true;
            tagUpdates.updatedAt = currentTimestamp;
          }
        }
        newBatch.update(tagRef, tagUpdates);
        [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      }
    }
  });

  if (shouldRemove) {
    const nodeRef = db.collection("nodes").doc(tagNodeId);
    await newBatch.update(nodeRef, {
      updatedAt: currentTimestamp,
      isTag: false,
    });
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);

    // Delete the corresponding tag of tags documents from the tags collection.
    const taggingtagDocs = await db
      .collection("tags")
      .where("tagIds", "array-contains", tagNodeId)
      .get();
    //  For every taggingtagDoc, remove the tag corresponding to tagNodeId from its list of tags.
    for (let taggingtagDoc of taggingtagDocs.docs) {
      const taggingtagRef = db.collection("tags").doc(taggingtagDoc.id);
      const taggingtagData = taggingtagDoc.data();
      const tagNodeIdx = taggingtagData.tagIds.findIndex((tId: any) => tId === tagNodeId);
      taggingtagData.tagIds.splice(tagNodeIdx, 1);
      taggingtagData.tags.splice(tagNodeIdx, 1);
      newBatch.update(taggingtagRef, {
        tagIds: taggingtagData.tagIds,
        tags: taggingtagData.tags,
      });
      [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    }
  }
  return [newBatch, writeCounts];
};

// Returns true if the node results in a cycle, otherwise returns false.
const hasCycle = ({ tagsOfNodes, nodeId, path = [] }: any) =>
  path.includes(nodeId)
    ? true
    : ((nodeId in tagsOfNodes && tagsOfNodes[nodeId].tagIds) || []).some((tagId: any) =>
      hasCycle({ tagsOfNodes, nodeId: tagId, path: [...path, nodeId] })
    );

//  recusively generate tags starting from a given node (top down)
//  starting from a node, iterate through all of its tags and re-call the function for each node.
//  this will continue to occur until the base case where there are no more tags of tags to be generated for the given node
//  each of these tags will be added to tags array and will be returned
//  tags, at the end of the function, will be populated with a hierarchy of tags that the current node is a part of
const generateTagsOfTags = async ({ nodeId, tagIds, tags, nodeUpdates }: any) => {
  let tagsChanged = false;
  for (let tagId of tagIds) {
    if (tagId !== nodeId && tagIds.length !== 0 && !hasCycle({ tagsOfNodes: tagIds, nodeId, path: [] })) {
      const { tagData } = await getTagRefData(tagId);
      const generatedTags = await generateTagsOfTags({
        nodeId: tagId,
        tagIds: tagData.tagIds,
        tags: tagData.tags,
        nodeUpdates
      });
      for (let gTagIdx = 0; gTagIdx < generatedTags.tagIds.length; gTagIdx++) {
        const gTagId = generatedTags.tagIds[gTagIdx];
        const gTag = generatedTags.tags[gTagIdx];
        if (!tagIds.includes(gTagId)) {
          tagIds.push(gTagId);
          tags.push(gTag);
          if (hasCycle({ tagsOfNodes: tagIds, nodeId, path: [] })) {
            tagIds.pop();
            tags.pop();
            console.log({ state: "Removed", [nodeId]: gTagId });
          } else {
            tagsChanged = true;
          }
        }
      }
    }
  }
  if (tagsChanged) {
    nodeUpdates.tags = tags;
    nodeUpdates.tagIds = tagIds;
  }
  return { tagIds, tags };
};

// Compares existing nodeTags and the new versionTags.
// If a tag exists in nodeTags but does not exist in versionTags, it initializes deleting it.
// If a tag does not exist in nodeTags but exists in versionTags, it initializes adding it.
// Adds list of tags to tagsData, if it does not exist, pushes null value.
const generateTagsData = async ({
  batch,
  nodeId,
  isTag,
  // We accumulate all the updates to the node in this dictionary and finally we update the node
  // document in the database outside of this function.
  nodeUpdates,
  // The list of tags on the current version of the node.
  nodeTagIds,
  nodeTags,
  // The list of tags on the NEW version of the node.
  versionTagIds,
  versionTags,
  proposer,
  aImgUrl,
  aFullname,
  aChooseUname,
  currentTimestamp,
  writeCounts
}: any) => {
  let newBatch = batch;
  let nodeTagRef, nodeTagData;
  if (isTag) {
    // Get the ref and data to the tag corresponding to this original node.
    const { tagRef, tagData } = await getTagRefData(nodeId);
    nodeTagRef = tagRef;
    nodeTagData = tagData;
  }
  // For the case where there is a tag in the old version of the node that does not exist on its new version.
  for (let tagIdx = 0; tagIdx < nodeTagIds.length; tagIdx++) {
    const tagId = nodeTagIds[tagIdx];
    // const tag = nodeTags[tagIdx];
    //  if there is a tag on the node that doesn't exist in the new verison of the node then remove it
    if (!versionTagIds.includes(tagId)) {
      // Update the tags and comPoints documents to reflect that nodeId is not tagging them anymore.
      [newBatch, writeCounts] = await deleteTagFromNodeTagCommunityAndTagsOfTags({
        batch: newBatch,
        tagNodeId: tagId,
        currentTimestamp,
        writeCounts
      });
      if (nodeTagData) {
        // Remove the tag from the list of tags on nodeTag (the tag corresponding to nodeId).
        const tagNodeIdx = nodeTagData.tagIds.findIndex((tId: any) => tId === tagId);
        nodeTagData.tagIds.splice(tagNodeIdx, 1);
        nodeTagData.tags.splice(tagNodeIdx, 1);
      }
      // Remove the tag from the list of tags on the node.
      const nodeTagIdx = nodeTagIds.findIndex((tId: any) => tId === tagId);
      nodeTagIds.splice(nodeTagIdx, 1);
      nodeTags.splice(nodeTagIdx, 1);
    }
  }
  const tagUpdates = {
    tagIds: nodeTagData.tagIds,
    tags: nodeTagData.tags,
  };

  const newTagIdsSoFar = [];
  // For the case where there is a tag in the new version of the node that does or does not exist on its old version.
  for (let tagIdx = 0; tagIdx < versionTagIds.length; tagIdx++) {
    const tagId = versionTagIds[tagIdx];
    const tag = versionTags[tagIdx];
    // then if it does not exist in list of tags in current version of the node
    // do add to tags
    if (!nodeTagIds.includes(tagId)) {
      newTagIdsSoFar.push(tagId);
      const tagHasCycle = await hasCycle({ tagsOfNodes: newTagIdsSoFar, nodeId, path: [] });
      if (tagHasCycle) {
        newTagIdsSoFar.pop();
      }
      // If the tag does not create a cycle,
      else {
        [newBatch, writeCounts] = await addTagCommunityAndTagsOfTags({
          batch: newBatch,
          tagNodeId: tagId,
          tagTitle: tag,
          proposer,
          aImgUrl,
          aFullname,
          aChooseUname,
          currentTimestamp,
          writeCounts
        });
        if (nodeTagData) {
          // Add the tag to the list of tags on nodeTag (the tag corresponding to nodeId).
          const { tagIds, tags } = await getDirectTags({
            tagsOfNodes: null,
            nodeTags: [...nodeTagData.tags, tag],
            nodeTagIds: [...nodeTagData.tagIds, tagId],
          });
          tagUpdates.tags = tags;
          tagUpdates.tagIds = tagIds;
          await generateTagsOfTags({
            nodeId,
            tagIds,
            tags,
            nodeUpdates: {
              ...nodeUpdates,
              tags: nodeTags,
              tagIds: nodeTagIds,
            }
          });
        }
      }
    }
  }
  if (isTag && Object.keys(tagUpdates).length > 0) {
    await newBatch.update(nodeTagRef, tagUpdates);
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  }
  return [newBatch, writeCounts];
};

const getUserVersion = async ({ versionId, nodeType, uname }: any) => {
  const { userVersionsColl }: any = getTypedCollections(nodeType);
  const userVersionQuery = userVersionsColl
    .where("version", "==", versionId)
    .where("user", "==", uname)
    .limit(1);
  const userVersionDoc = await userVersionQuery.get();
  let userVersionData = null;
  let userVersionRef = null;
  if (userVersionDoc.docs.length > 0) {
    userVersionData = {
      ...userVersionDoc.docs[0].data(),
      id: userVersionDoc.docs[0].id,
    };
    userVersionRef = userVersionsColl.doc(userVersionDoc.docs[0].id);
  } else {
    userVersionRef = userVersionsColl.doc();
  }
  return { userVersionData, userVersionRef };
};

const isVersionApproved = async ({ corrects, wrongs, nodeData }: any) => {
  try {
    const nodeRating = nodeData.corrects - nodeData.wrongs;
    const versionRating = corrects - wrongs;
    if (versionRating >= nodeRating / 2) {
      return nodeData;
    }
    return false;
  } catch (err) {
    console.error(err);
    return err;
  }
};

const updateProposersReputationsOnNode = ({
  proposersReputationsOnNode,
  versionData,
  versionRating,
  newMaxVersionRating,
  adminPoints
}: any) => {
  let adminNode, aImgUrl, aFullname, aChooseUname;
  let newVersionRating = newMaxVersionRating;
  let points = adminPoints;
  if (versionData.proposer in proposersReputationsOnNode) {
    proposersReputationsOnNode[versionData.proposer] += versionRating;
  } else {
    proposersReputationsOnNode[versionData.proposer] = versionRating;
  }
  if (proposersReputationsOnNode[versionData.proposer] > adminPoints) {
    points = proposersReputationsOnNode[versionData.proposer];
    adminNode = versionData.proposer;
    aImgUrl = versionData.imageUrl;
    aFullname = versionData.fullname;
    aChooseUname = versionData.chooseUname;
  }
  if (versionRating > newMaxVersionRating) {
    newVersionRating = versionRating;
  }
  return {
    newVersionRating,
    points,
    adminNode,
    aImgUrl,
    aFullname,
    aChooseUname,
  };
};

const getCumulativeProposerVersionRatingsOnNode = async ({
  nodeId,
  nodeType,
  nodeDataAdmin,
  aImgUrl,
  aFullname,
  aChooseUname,
  updatingVersionId = null,
  updatingVersionData = null,
  updatingVersionRating = null,
  updatingVersionNotAccepted = null
}: any) => {
  let adminPoints = 0;
  let newMaxVersionRating = 1;
  let nodeAdmin = nodeDataAdmin;
  let name = aFullname;
  let imageUrl = aImgUrl;
  let userName = aChooseUname;
  const proposersReputationsOnNode = {};
  const { versionsColl }: any = getTypedCollections(nodeType);
  const versionDocs = await versionsColl
    .where("node", "==", nodeId)
    .where("accepted", "==", true)
    .get();
  for (let versionDoc of versionDocs.docs) {
    const versionData = versionDoc.data();
    let versionRating = versionData.corrects - versionData.wrongs;
    if (updatingVersionId && updatingVersionId === versionDoc.id) {
      versionRating = updatingVersionRating;
    }
    const { newVersionRating, points, adminNode, aImgUrl, aFullname, aChooseUname } =
      updateProposersReputationsOnNode({
        proposersReputationsOnNode,
        versionData,
        versionRating,
        newMaxVersionRating,
        adminPoints
      });
    newMaxVersionRating = newVersionRating;
    adminPoints = points;
    nodeAdmin = adminNode;
    name = aFullname;
    imageUrl = aImgUrl;
    userName = aChooseUname;
  }
  if (updatingVersionId && updatingVersionNotAccepted) {
    const { newVersionRating, points, adminNode, aImgUrl, aFullname, aChooseUname } =
      updateProposersReputationsOnNode({
        proposersReputationsOnNode,
        versionData: updatingVersionData,
        versionRating: updatingVersionRating,
        newMaxVersionRating,
        adminPoints
      });
    newMaxVersionRating = newVersionRating;
    adminPoints = points;
    nodeAdmin = adminNode;
    name = aFullname;
    imageUrl = aImgUrl;
    userName = aChooseUname;
  }
  return {
    newMaxVersionRating,
    adminPoints,
    nodeAdmin,
    aImgUrl: imageUrl,
    aFullname: name,
    aChooseUname: userName,
  };
};

const createUpdateUserVersion = async ({
  batch,
  userVersionRef,
  userVersionData,
  nodeType,
  writeCounts
}: any) => {
  let newBatch = batch;
  newBatch.set(userVersionRef, userVersionData);
  [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  const userVersionLogRef = db.collection("userVersionsLog").doc();
  delete userVersionData.updatedAt;
  userVersionData.nodeType = nodeType;
  newBatch.set(userVersionLogRef, userVersionData);
  [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  return [newBatch, writeCounts];
};

const versionCreateUpdate = async ({
  batch,
  nodeId,
  nodeData,
  nodeRef,
  nodeType,
  versionId,
  versionData,
  // Boolean
  newVersion,
  // False if proposal to improve, and indicates the type if proposal for a new child.
  childType,
  voter,
  correct,
  wrong,
  award,
  addedParents,
  addedChildren,
  removedParents,
  removedChildren,
  currentTimestamp,
  writeCounts
}: any) => {
  const {
    title,
    children,
    content,
    nodeImage,
    nodeVideo,
    nodeAudio,
    parents,
    referenceIds,
    referenceLabels,
    references,
    tagIds,
    tags,
    proposer,
    imageUrl,
    fullname,
    chooseUname,
    subType,
    proposal,
    summary,
    createdAt,
    viewers,
    corrects,
    wrongs,
    awards,
    deleted,
    accepted,
  } = versionData;
  let choices;
  let newBatch = batch;
  if (nodeType === "Question") {
    choices = versionData.choices;
  }
  // If the version is deleted, the user should have not been able to vote on it.
  if (!deleted) {
    //  proposer and voters are the same user, automatic self-vote
    [newBatch, writeCounts] = await updateReputation({
      batch: newBatch,
      uname: proposer,
      imageUrl,
      fullname,
      chooseUname,
      tagIds,
      tags,
      nodeType,
      correctVal: correct,
      wrongVal: wrong,
      instVal: award,
      ltermVal: 0,
      ltermDayVal: 0,
      voter,
      writeCounts
    });
    let { userVersionData } = await getUserVersion({ versionId, nodeType, uname: voter });
    // Mark the userNode for the voter as isStudied = true and changed = false,
    // otherwise, they would not have voted on the version of the node.
    // let voterNodeData, proposerNodeData;
    // [voterNodeData, newBatch, writeCounts] = await createUserNodeOrMarkStudied(
    //   newBatch,
    //   voter,
    //   nodeId,
    //   currentTimestamp,
    //   writeCounts
    // );
    const versionCorrects = corrects + correct;
    const versionWrongs = wrongs + wrong;
    const versionRatings = versionCorrects - versionWrongs;
    //  corrects and wrongs are 0 since this was just created
    // The data of the original node that an improvement proposal is on it, or
    // the parent node where the pending proposal for the child node exists.
    const nodeDataDoc = await isVersionApproved({ corrects: versionCorrects, wrongs: versionWrongs, nodeData });
    versionData.accepted = nodeDataDoc ? true : false;
    // If the version was accepted previously, accepted === true.
    // If the version is determined to be approved right now, versionData.accepted === true.
    if (versionData.accepted || accepted) {
      const { newMaxVersionRating, adminPoints, nodeAdmin, aImgUrl, aFullname, aChooseUname } =
        await getCumulativeProposerVersionRatingsOnNode({
          nodeId,
          nodeType: nodeData.nodeType,
          nodeDataAdmin: nodeData.admin,
          aImgUrl: nodeData.aImgUrl,
          aFullname: nodeData.aFullname,
          aChooseUname: nodeData.aChooseUname,
          updatingVersionId: versionId,
          updatingVersionData: versionData,
          updatingVersionRating: versionRatings,
          updatingVersionNotAccepted: !accepted
        });
      let nodeUpdates: any = {
        // Number of users who have marked the node as studied.
        // studied: nodeData.studied + (voterNodeData && !voterNodeData.isStudied ? 1 : 0),
        adminPoints,
        admin: nodeAdmin,
        aImgUrl,
        aFullname,
        aChooseUname,
        maxVersionRating: newMaxVersionRating,
        updatedAt: currentTimestamp,
      };
      //  proposal was accepted previously, not accepted just now
      if (accepted) {
        // When someone votes on an accepted proposal of a node, that person has definitely studied it.
        // So, if previously isStudied was false, we should increment the number of studied and later set isStudied to true for the user.
        if (
          // (voterNodeData && !voterNodeData.isStudied) ||
          admin !== nodeData.admin ||
          newMaxVersionRating !== nodeData.maxVersionRating
        ) {
          newBatch.update(nodeRef, nodeUpdates);
          [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
        }
        [newBatch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
          batch: newBatch,
          linkedId: nodeId,
          nodeChanges: nodeUpdates,
          major: false,
          currentTimestamp,
          writeCounts
        });
        //  the version we are dealing with is just accepted (nodeDataDoc is not null)
        //  this was a pending proposal that was just accepted
      } else {
        // const selfVote = proposer === voter;
        // if (!selfVote) {
        // Mark the userNode for the proposer as isStudied = true and changed = false,
        // otherwise, they would not have proposed the version of the node.
        // [proposerNodeData, newBatch, writeCounts] = await createUserNodeOrMarkStudied(
        //   newBatch,
        //   proposer,
        //   nodeId,
        //   currentTimestamp,
        //   writeCounts
        // );
        // }
        // //////////////////////////IMPORTANT/////////////////////////////////
        // For an improvement, the version and userVersion documents should be created and changed outside of this function.
        // For a child proposal, the version and userVersion documents should be updated inside this function.
        // ////////////////////////////////////////////////////////////////////
        //  if proposal is an improvement
        if (!childType) {
          nodeUpdates = {
            ...nodeUpdates,
            children,
            content,
            nodeImage,
            nodeVideo,
            nodeAudio,
            title,
            parents,
            referenceIds,
            references,
            referenceLabels,
            tagIds,
            tags,
            // studied: selfVote ? 1 : 2,
            studied: 0,
            subType,
            changedAt: currentTimestamp,
            versions: nodeData.versions + (newVersion ? 1 : 0),
          };
          if (nodeType === "Question") {
            nodeUpdates.choices = choices;
          }
          [batch, writeCounts] = await generateTagsData({
            batch,
            nodeId,
            isTag: nodeData.isTag,
            nodeUpdates,
            nodeTagIds: nodeData.tagIds,
            nodeTags: nodeData.tags,
            versionTagIds: tagIds,
            versionTags: tags,
            proposer,
            imageUrl,
            fullname,
            chooseUname,
            currentTimestamp,
            writeCounts
          });
          newBatch.update(nodeRef, nodeUpdates);
          [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          if (nodeData.title !== title) {
            [newBatch, writeCounts] = await changeNodeTitle({
              batch: newBatch,
              nodeData,
              nodeId,
              newTitle: title,
              nodeType,
              currentTimestamp,
              writeCounts
            });
          }
          let linkedNode, linkedNodeChanges;
          for (let addedParent of addedParents) {
            linkedNode = await getNode(addedParent);
            linkedNodeChanges = {
              children: [
                ...linkedNode.nodeData.children,
                { node: nodeId, title, label: "", type: nodeType },
              ],
              studied: 0,
              changedAt: currentTimestamp,
              updatedAt: currentTimestamp,
            };
            newBatch.update(linkedNode.nodeRef, linkedNodeChanges);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
            [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
              batch,
              linkedId: addedParent,
              nodeChanges: linkedNodeChanges,
              major: true,
              currentTimestamp,
              writeCounts
            });
          }
          for (let addedChild of addedChildren) {
            linkedNode = await getNode(addedChild);
            linkedNodeChanges = {
              parents: [
                ...linkedNode.nodeData.parents,
                { node: nodeId, title, label: "", type: nodeType },
              ],
              studied: 0,
              changedAt: currentTimestamp,
              updatedAt: currentTimestamp,
            };
            newBatch.update(linkedNode.nodeRef, linkedNodeChanges);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
            [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
              batch,
              linkedId: addedChild,
              nodeChanges: linkedNodeChanges,
              major: true,
              currentTimestamp,
              writeCounts
            });
          }
          for (let removedParent of removedParents) {
            linkedNode = await getNode(removedParent);
            linkedNodeChanges = {
              children: linkedNode.nodeData.children.filter((l: any) => l.node !== nodeId),
              studied: 0,
              changedAt: currentTimestamp,
              updatedAt: currentTimestamp,
            };
            newBatch.update(linkedNode.nodeRef, linkedNodeChanges);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
            [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
              batch,
              linkedId: removedParent,
              nodeChanges: linkedNodeChanges,
              major: true,
              currentTimestamp,
              writeCounts
            });
          }
          for (let removedChild of removedChildren) {
            linkedNode = await getNode(removedChild);
            linkedNodeChanges = {
              parents: linkedNode.nodeData.parents.filter((l: any) => l.node !== nodeId),
              studied: 0,
              changedAt: currentTimestamp,
              updatedAt: currentTimestamp,
            };
            newBatch.update(linkedNode.nodeRef, linkedNodeChanges);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
            [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
              batch,
              linkedId: removedChild,
              nodeChanges: linkedNodeChanges,
              major: true,
              currentTimestamp,
              writeCounts
            });
          }
          //  just accepted a proposal for a new child node (not an improvement)
        } else {
          const childNodeRef = db.collection("nodes").doc();
          let childNode: any = {
            children,
            content,
            nodeImage,
            nodeVideo,
            nodeAudio,
            deleted: false,
            subType,
            parents: [{ node: nodeId, title: nodeData.title, label: "", type: nodeData.nodeType }],
            referenceIds,
            references,
            referenceLabels,
            tagIds,
            tags,
            title,
            updatedAt: currentTimestamp,
          };
          if (childType === "Question") {
            childNode.choices = choices;
          }
          const { versionsColl, userVersionsColl }: any = getTypedCollections(childType);
          const versionRef = versionsColl.doc();
          //  before setting childNode version, need to obtain the correct corresponding collection in the database
          const childVersion = {
            ...childNode,
            proposer,
            imageUrl,
            fullname,
            chooseUname,
            proposal,
            summary,
            newChild: true,
            accepted: true,
            corrects: versionCorrects,
            wrongs: versionWrongs,
            awards,
            viewers,
            node: childNodeRef.id,
            createdAt,
          };
          newBatch.set(versionRef, childVersion);
          [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);

          // Because it's a child version, the old version that was proposed on the parent node should be
          // removed. So, we should create a new version and a new userVersion document that use the data of the previous one.
          const newUserVersionRef = userVersionsColl.doc();

          // If the userVersion document (of the parent node) does not exist in the database,
          // i.e., if the user has never had interactions with it, like votes, on the version.
          if (!userVersionData) {
            userVersionData = {
              award: false,
              correct: correct === 1,
              createdAt: currentTimestamp,
              updatedAt: currentTimestamp,
              version: versionRef.id,
              user: voter,
              wrong: wrong === 1,
            };
          } else {
            //  do not need to set the nodeType, unique collection per each node, unlike userVersionsLog
            userVersionData = {
              award: userVersionData.award,
              correct: correct === 1 ? true : correct === 0 ? userVersionData.correct : false,
              createdAt: userVersionData.createdAt,
              updatedAt: currentTimestamp,
              version: versionRef.id,
              user: voter,
              wrong: wrong === 1 ? true : wrong === 0 ? userVersionData.wrong : false,
            };
          }
          [newBatch, writeCounts] = await createUpdateUserVersion({
            batch: newBatch,
            userVersionRef: newUserVersionRef,
            userVersionData,
            nodeType: childType,
            writeCounts
          });

          //  Delete the old version on the parent.
          const { versionsCommentsColl }: any = getTypedCollections(nodeType);

          let versionsCommentsRef = versionsCommentsColl
            .where("version", "==", versionId)
            .where("deleted", "==", false);
          const versionsCommentsDocs = await versionsCommentsRef.get();
          for (let versionCommentDoc of versionsCommentsDocs.docs) {
            const versionCommentId = versionCommentDoc.Id;
            const versionCommentData = versionCommentDoc.data();
            versionsCommentsRef = versionsCommentsColl.doc(versionCommentId);
            // In this case, we don't need to create a new version.
            // We can just change the version id from the old version to the new version on the child node.
            newBatch.set(versionsCommentsRef, {
              ...versionCommentData,
              version: versionRef.id,
              updatedAt: currentTimestamp,
            });
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }
          [batch, writeCounts] = await generateTagsData({
            batch,
            nodeId: childNodeRef.id,
            isTag: false,
            nodeUpdates: childNode,
            nodeTagIds: [],
            nodeTags: [],
            versionTagIds: tagIds,
            versionTags: tags,
            proposer,
            aImgUrl: imageUrl,
            aFullname: fullname,
            aChooseUname: chooseUname,
            currentTimestamp,
            writeCounts
          });
          childNode = {
            ...childNode,
            nodeType: childType,
            corrects: correct === 1 ? 1 : 0,
            wrongs: wrong === 1 ? 1 : 0,
            awards: 0,
            versions: 1,
            viewers: 1,
            // For the proposer and the voter, it should be marked as studied.
            studied: 2,
            adminPoints: versionRatings,
            admin: proposer,
            aImgUrl: imageUrl,
            aFullname: fullname,
            aChooseUname: chooseUname,
            maxVersionRating: versionRatings > 1 ? versionRatings : 1,
            comments: versionsCommentsDocs.docs.length,
            createdAt: currentTimestamp,
            changedAt: currentTimestamp,
            updatedAt: currentTimestamp,
          };
          newBatch.set(childNodeRef, childNode);
          [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);

          nodeUpdates = {
            ...nodeUpdates,
            changedAt: currentTimestamp,
            children: [
              ...nodeData.children,
              { node: childNodeRef.id, title: title, label: "", type: childType },
            ],
            // For the proposer and the voter, it's marked as studied.
            // studied: 2,
            studied: 0,
          };
          newBatch.update(nodeRef, nodeUpdates);
          [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);

          // Mark the userNode for the proposer and voter as isStudied = true and changed = false,
          // otherwise, they would not have proposed the version or voted on the version of the node.
          // [proposerNodeData, newBatch, writeCounts] = await createUserNodeOrMarkStudied(
          //   newBatch,
          //   proposer,
          //   childNodeRef.id,
          //   currentTimestamp,
          //   writeCounts
          // );
          // [voterNodeData, newBatch, writeCounts] = await createUserNodeOrMarkStudied(
          //   newBatch,
          //   voter,
          //   childNodeRef.id,
          //   currentTimestamp,
          //   writeCounts
          // );

          //  add this question to the practice tool for every user with the same default tag
          if (childType === "Question") {
            [batch, writeCounts] = await createPractice({
              batch,
              tagIds,
              nodeId: childNodeRef.id,
              currentTimestamp,
              writeCounts
            });
          }
        }
        // In both cases of accepting an improvement proposal and a child proposal,
        // we need to signal all the users that it's changed.
        [newBatch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
          batch: newBatch,
          linkedId: nodeId,
          nodeChanges: nodeUpdates,
          major: true,
          currentTimestamp,
          writeCounts
        });
      }
    }
  }
  return [newBatch, writeCounts];
};

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
      nodeAudio,
      parents,
      referenceIds,
      referenceLabels,
      references,
      tagIds,
      tags,
      subType,
      proposal,
      summary,
      choices,
      addedParents,
      addedChildren,
      removedParents,
      removedChildren
    } = data || {};
    const { userData } = user || {};
    let batch = db.batch();
    let writeCounts = 0;

    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    const { nodeData, nodeRef } = await getNode(id);
    const { versionsColl, userVersionsColl }: any = getTypedCollections(nodeType);
    const versionRef = versionsColl.doc();
    const versionData: any = {
      node: id,
      title,
      children,
      content,
      nodeImage,
      nodeVideo,
      nodeAudio,
      parents,
      referenceIds,
      referenceLabels,
      references,
      tagIds,
      tags,
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
      corrects: 1,
      wrongs: 0,
      awards: 0,
      deleted: false,
      accepted: false,
    };
    if (nodeType === "Question") {
      versionData.choices = choices;
    }
    [batch, writeCounts] = await versionCreateUpdate({
      batch,
      nodeId: id,
      nodeData,
      nodeRef,
      nodeType: nodeType,
      versionId: versionRef.id,
      versionData,
      newVersion: true,
      childType: false,
      voter: userData.uname,
      correct: 1,
      wrong: 0,
      award: 0,
      addedParents,
      addedChildren,
      removedParents,
      removedChildren,
      currentTimestamp,
      writeCounts
    });
    // From here on, we specify the type of the changes that the user is proposing on this node
    // using some boolean fields to be added to the version.
    if (nodeType === "Question") {
      if (versionData.choices.length > nodeData.choices.length) {
        versionData.addedChoices = true;
      } else if (versionData.choices.length < nodeData.choices.length) {
        versionData.deletedChoices = true;
      }
      if (!compareChoices({ node1: data, node2: nodeData })) {
        versionData.changedChoices = true;
      }
    }
    if (title !== nodeData.title) {
      versionData.changedTitle = true;
    }
    if (content !== nodeData.content) {
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
    };
    [batch, writeCounts] = await createUpdateUserVersion({
      batch,
      userVersionRef,
      userVersionData,
      nodeType,
      writeCounts
    });

    //  If the proposal is not approved, we do not directly update the node document inside versionCreateUpdate function,
    //  so we have to set nodeData.versions + 1 here
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
        writeCounts
      });
    }

    [batch, writeCounts] = await proposalNotification({
      batch,
      nodeId: id,
      nodeTitle: versionData.accepted ? title : nodeData.title,
      uname: userData.uname,
      versionData,
      currentTimestamp,
      writeCounts
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;