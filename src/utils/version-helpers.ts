import { admin, checkRestartBatchWriteCounts, commitBatch, db, TWriteOperation } from "../lib/firestoreServer/admin";
import axios from "axios";
import { google } from "googleapis";

import {
  arrayToChunks,
  convertToTGet,
  getNode,
  getTypedCollections,
  initializeNewReputationData,
  isVersionApproved,
  retrieveAndsignalAllUserNodesChanges,
  tagsAndCommPoints,
  updateReputation,
} from ".";
import { NodeType } from "src/types";
import { IPendingPropNum } from "src/types/IPendingPropNum";
import { IQuestionChoice } from "src/types/IQuestionChoice";
import { detach, getNodeTypesFromNode } from "./helpers";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";
import { IInstitution } from "src/types/IInstitution";
import { getTypesenseClient, typesenseDocumentExists } from "@/lib/typesense/typesense.config";
import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Timestamp,
  Transaction,
  WriteBatch,
} from "firebase-admin/firestore";
import { INodeVersion } from "src/types/INodeVersion";
import { TypesenseNodeSchema } from "@/lib/schemas/node";
import { INodeType } from "src/types/INodeType";
import { IComReputationUpdates } from "./reputations";
import { IUserNodeVersion } from "src/types/IUserNodeVersion";
import { getNodePageWithDomain } from "@/lib/utils/utils";
import { IPractice } from "src/types/IPractice";
import { getCourseIdsFromTagIds, getSemesterIdsFromTagIds } from "./course-helpers";
import { ISemester } from "src/types/ICourse";

export const comPointTypes = [
  "comPoints",
  "comMonthlyPoints",
  "comWeeklyPoints",
  "comOthersPoints",
  "comOthMonPoints",
  "comOthWeekPoints",
];

export const repPointTypes = [
  "reputations",
  "monthlyReputations",
  "weeklyReputations",
  "othersReputations",
  "othMonReputations",
  "othWeekReputations",
];

export const schoolPointTypes = [
  "schoolPoints",
  "schoolMonthlyPoints",
  "schoolWeeklyPoints",
  "schoolOthersPoints",
  "schoolOthMonPoints",
  "schoolOthWeekPoints",
];
export const reputationTypes = [
  "reputations",
  "monthlyReputations",
  "weeklyReputations",
  "othersReputations",
  "othMonReputations",
  "othWeekReputations",
];

export const NODE_TYPES: NodeType[] = [
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

export const improvementTypes = [
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
  "changedNodeType",
];

type VersionParams = {
  versionId: string;
  nodeData: INode;
  t?: any;
};
export const getVersion = async ({
  versionId,
  nodeData,
  t = false,
}: VersionParams): Promise<{
  versionData: INodeVersion;
  versionRef: DocumentReference<DocumentData>;
  nodeType: INodeType;
}> => {
  const nodeTypes = getNodeTypesFromNode(nodeData);
  let versionRef!: DocumentReference<DocumentData>;
  let versionDoc!: DocumentSnapshot<DocumentData>;
  let _nodeType!: INodeType;

  for (const nodeType of nodeTypes) {
    _nodeType = nodeType;
    const { versionsColl }: any = getTypedCollections({ nodeType });
    versionRef = versionsColl.doc(versionId);
    versionDoc = t ? await t.get(versionRef) : await versionRef.get();
    if (versionDoc.exists) {
      break;
    }
  }
  return { versionData: { ...versionDoc.data(), id: versionId } as any, versionRef, nodeType: _nodeType };
};

export const setOrIncrementNotificationNums = async ({ batch, proposer, writeCounts, t, tWriteOperations }: any) => {
  let newBatch = batch;
  const notificationNumRef = db.collection("notificationNums").doc(proposer);
  const notificationNumDoc = await convertToTGet(notificationNumRef, t);
  if (notificationNumDoc.exists) {
    const notificationUpdate = { nNum: admin.firestore.FieldValue.increment(1) };
    if (t) {
      tWriteOperations.push({
        objRef: notificationNumRef,
        data: notificationUpdate,
        operationType: "update",
      });
    } else {
      newBatch.update(notificationNumRef, notificationUpdate);
    }
  } else {
    const notificationData = { nNum: 1 };
    if (t) {
      tWriteOperations.push({
        objRef: notificationNumRef,
        data: notificationData,
        operationType: "set",
      });
    } else {
      newBatch.set(notificationNumRef, notificationData);
    }
  }
  if (!t) {
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  }

  return [newBatch, writeCounts];
};

export const compareChoices = ({ node1, node2 }: any) => {
  if (!("choices" in node1) && !("choices" in node2)) {
    return true;
  }
  if (("choices" in node1 && !("choices" in node2)) || (!("choices" in node1) && "choices" in node2)) {
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

export const addToPendingPropsNums = async ({
  batch,
  tagIds,
  value,
  voters,
  writeCounts,
  t,
  tWriteOperations,
}: any) => {
  let newBatch = batch;
  for (let tagId of tagIds) {
    const communityUsersDocs = await convertToTGet(db.collection("users").where("tagId", "==", tagId), t);
    const pendingPropsNumsDocs = await convertToTGet(db.collection("pendingPropsNums").where("tagId", "==", tagId), t);
    const processedUnames = [];
    // updating exisintg docs
    for (let pendingPropsNumsDoc of pendingPropsNumsDocs.docs) {
      const pendingPropsNumsDocData = pendingPropsNumsDoc.data() as IPendingPropNum;
      processedUnames.push(pendingPropsNumsDocData.uname);
      // We should not increment the pendingPropsNums for the users who have already voted the pending proposal.
      if (!voters.includes(pendingPropsNumsDocData.uname)) {
        const pendingPropsNumsRef = db.collection("pendingPropsNums").doc(pendingPropsNumsDoc.id);
        const pendingPropsUpdate = {
          pNum: pendingPropsNumsDocData.pNum == 0 && value < 0 ? 0 : admin.firestore.FieldValue.increment(value),
        };
        if (t) {
          tWriteOperations.push({
            objRef: pendingPropsNumsRef,
            data: pendingPropsUpdate,
            operationType: "update",
          });
        } else {
          newBatch.update(pendingPropsNumsRef, pendingPropsUpdate);
          [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
        }
      }
    }
    // create missing pending prop nums for users
    for (let communityUserDoc of communityUsersDocs.docs) {
      if (~processedUnames.indexOf(communityUserDoc.id)) continue;

      const pendingPropsNumsRef = db.collection("pendingPropsNums").doc();
      const pendingProposalData = {
        uname: communityUserDoc.id,
        tagId,
        pNum: value < 0 ? 0 : value,
      };
      if (t) {
        tWriteOperations.push({
          objRef: pendingPropsNumsRef,
          data: pendingProposalData,
          opertaionType: "set",
        });
      } else {
        newBatch.set(pendingPropsNumsRef, pendingProposalData);
        [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      }
    }
  }
  return [newBatch, writeCounts];
};

export const proposalNotification = async ({
  batch,
  nodeId,
  nodeTitle,
  uname,
  versionData,
  currentTimestamp,
  writeCounts,
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
      writeCounts,
    });
  }
  return [newBatch, writeCounts];
};

export const compareFlatLinks = ({ links1, links2 }: any) => {
  if (typeof links2 === "undefined" && typeof links1 !== "undefined") {
    return false;
  }
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

export const indexNodeChange = async (nodeId: string, nodeTitle: string, actionType: "NEW" | "UPDATE" | "DELETE") => {
  // don't send request on dev and prod
  if (process.env.ONECADEMYCRED_PROJECT_ID !== "onecademy-1") return;
  const nodeUrl = getNodePageWithDomain(nodeTitle, nodeId);

  try {
    await axios.get(
      `https://www.bing.com/indexnow?url=${encodeURIComponent(nodeUrl)}&key=${process.env.INDEXNOW_API_KEY}`
    );
  } catch (e) {
    console.log(e, "BING_INDEX_ERROR");
  }

  const jwtClient = new google.auth.JWT(
    process.env.ONECADEMYCRED_CLIENT_EMAIL,
    undefined,
    process.env.ONECADEMYCRED_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/indexing"],
    undefined
  );
  const tokens = await jwtClient.authorize();
  try {
    await axios.post(
      "https://indexing.googleapis.com/v3/urlNotifications:publish",
      {
        url: nodeUrl,
        type: actionType === "DELETE" ? "URL_DELETED" : "URL_UPDATED",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + tokens.access_token,
        },
      }
    );
  } catch (e) {
    console.log(e, "GOOGLE_INDEX_ERROR");
  }
};

export const createPractice = async ({
  batch,
  unames,
  tagIds,
  nodeId,
  parentId,
  currentTimestamp,
  writeCounts,
  t,
  tWriteOperations,
}: any) => {
  let newBatch = batch;
  let practiceRef;
  if (!parentId) {
    return [newBatch, writeCounts];
  }
  const semesterIds = await getSemesterIdsFromTagIds(tagIds);
  for (const tagId of semesterIds) {
    const userIds: string[] = [];
    if (unames && Array.isArray(unames)) {
      userIds.push(...unames);
    } else {
      const semesterDoc = await db.collection("semesters").doc(tagId).get();
      const semester = semesterDoc.data() as ISemester;
      semester.students.forEach(student => userIds.push(student.uname));
    }
    for (const userId of userIds) {
      // TODO: update this helper to use batch and memo of request data to fix data replacement issue
      let _batch = db.batch();
      const practices = await db
        .collection("practice")
        .where("user", "==", userId)
        .where("tagId", "==", tagId)
        .where("node", "==", parentId)
        .limit(1)
        .get();
      if (practices.docs.length) {
        const practiceRef = db.collection("practice").doc(practices.docs[0].id);
        const questionNodes: string[] = practices.docs[0].data()?.questionNodes || [];
        if (!questionNodes.includes(nodeId)) {
          questionNodes.push(nodeId);
        }
        _batch.update(practiceRef, {
          questionNodes,
        });
        await _batch.commit();
        continue;
      }
      practiceRef = db.collection("practice").doc();
      const practiceData = {
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
        eFactor: 2.5,
        iInterval: 0,
        lastCompleted: null,
        lastPresented: null,
        nextDate: currentTimestamp,
        node: parentId,
        q: 0,
        tagId,
        questionNodes: [nodeId],
        user: userId,
      } as IPractice;
      _batch.set(practiceRef, practiceData);
      await _batch.commit();
    }
  }
  return [newBatch, writeCounts];
};

export const getTagRefData = async (nodeId: string, t = false) => {
  let tagRef: any = db.collection("tags").where("node", "==", nodeId);
  const tagDoc = await convertToTGet(tagRef, t);
  let tagData = null;
  if (tagDoc.docs.length > 0) {
    tagRef = db.collection("tags").doc(tagDoc.docs[0].id);
    tagData = tagDoc.docs[0].data();
  } else {
    tagRef = db.collection("tags").doc();
  }
  return { tagRef, tagData };
};

// Subtract the union of descendents of tags from the direct list of tags on the node.
// The result will be used for the list of tags on the corresponding tag.
export const getDirectTags = async ({ nodeTagIds, nodeTags, tagsOfNodes = null }: any) => {
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

export const changeTagTitleInCollection = async ({
  batch,
  collectionName,
  nodeId,
  newTitle,
  writeCounts,
  t,
  tWriteOperations,
}: any) => {
  let newBatch = batch;
  const linkedRefs = db.collection(collectionName).where("tagId", "==", nodeId);
  const linkedDocs = await convertToTGet(linkedRefs, t);
  for (let linkedDoc of linkedDocs.docs) {
    const linkedRef = db.collection(collectionName).doc(linkedDoc.id);

    const linkedUpdate = { tag: newTitle };
    if (t) {
      tWriteOperations.push({
        objRef: linkedRef,
        data: linkedUpdate,
        operationType: "update",
      });
    } else {
      newBatch.update(linkedRef, linkedUpdate);
      [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    }
  }
  return [newBatch, writeCounts];
};

export const changeNodeTitle = async ({
  batch,
  nodeData,
  nodeId,
  newTitle,
  nodeType,
  currentTimestamp,
  writeCounts,
  t,
  tWriteOperations,
}: any) => {
  let newBatch = batch;
  let linkedDataChanges = {};
  for (let parent of nodeData.parents) {
    const linkedRef = db.collection("nodes").doc(parent.node);
    const linkedDoc = await convertToTGet(linkedRef, t);
    const linkedData: any = linkedDoc.data();
    const newChildren = linkedData.children.filter((child: any) => child.node !== nodeId);
    newChildren.push({ title: newTitle, node: nodeId, label: "", type: nodeType });
    linkedDataChanges = {
      children: newChildren,
      updatedAt: currentTimestamp,
    };
    if (t) {
      tWriteOperations.push({
        objRef: linkedRef,
        data: linkedDataChanges,
        operationType: "update",
      });
    } else {
      newBatch.update(linkedRef, linkedDataChanges);
      [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    }
    await detach(async () => {
      let batch = db.batch();
      let writeCounts = 0;
      [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
        batch,
        linkedId: parent.node,
        nodeChanges: linkedDataChanges,
        major: false,
        currentTimestamp,
        writeCounts,
      });
      await commitBatch(batch);
    });
  }
  for (let child of nodeData.children) {
    const linkedRef = db.collection("nodes").doc(child.node);
    const linkedDoc = await convertToTGet(linkedRef, t);
    const linkedData: any = linkedDoc.data();
    const newParents = linkedData.parents.filter((parent: any) => parent.node !== nodeId);
    newParents.push({ title: newTitle, node: nodeId, label: "", type: nodeType });
    linkedDataChanges = {
      parents: newParents,
      updatedAt: currentTimestamp,
    };

    if (t) {
      tWriteOperations.push({
        objRef: linkedRef,
        data: linkedDataChanges,
        operationType: "update",
      });
    } else {
      newBatch.update(linkedRef, linkedDataChanges);
      [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    }
    await detach(async () => {
      let batch = db.batch();
      let writeCounts = 0;
      [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
        batch,
        linkedId: child.node,
        nodeChanges: linkedDataChanges,
        major: false,
        currentTimestamp,
        writeCounts,
      });
      await commitBatch(batch);
    });
  }
  if (nodeData.isTag) {
    const taggedNodesDocs = await convertToTGet(db.collection("nodes").where("tagIds", "array-contains", nodeId), t);
    for (let taggedNodeDoc of taggedNodesDocs.docs) {
      const linkedRef = db.collection("nodes").doc(taggedNodeDoc.id);
      const linkedData = taggedNodeDoc.data();
      const tagIdx = linkedData.tagIds.indexOf(nodeId);
      linkedData.tags[tagIdx] = newTitle;
      linkedDataChanges = {
        tags: linkedData.tags,
        updatedAt: currentTimestamp,
      };

      if (t) {
        tWriteOperations.push({
          objRef: linkedRef,
          data: linkedDataChanges,
          operationType: "update",
        });
      } else {
        newBatch.update(linkedRef, linkedDataChanges);
        [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      }

      await detach(async () => {
        let batch = db.batch();
        let writeCounts = 0;
        await retrieveAndsignalAllUserNodesChanges({
          batch,
          linkedId: taggedNodeDoc.id,
          nodeChanges: linkedDataChanges,
          major: false,
          currentTimestamp,
          writeCounts,
        });
        await commitBatch(batch);
      });
    }

    await tagsAndCommPoints({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      nodeId,
      callBack: async ({ collectionName, tagRef, tagDoc }: any) => {
        if (tagDoc) {
          const tagUpdates: any = {
            updatedAt: currentTimestamp,
          };
          if (collectionName === "tags") {
            tagUpdates.title = newTitle;
          } else {
            tagUpdates.tag = newTitle;
          }
          if (t) {
            tWriteOperations.push({
              objRef: tagRef,
              data: tagUpdates,
              operationType: "update",
            });
          } else {
            newBatch.update(tagRef, tagUpdates);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }
        }
      },
      t,
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
        writeCounts,
        t,
        tWriteOperations,
      });
    }
    for (let nodeType of NODE_TYPES) {
      const { versionsColl }: any = getTypedCollections({ nodeType });
      const versionsQuery = versionsColl.where("tagIds", "array-contains", nodeId);
      const versionsDocs = await convertToTGet(versionsQuery, t);
      for (let versionDoc of versionsDocs.docs) {
        const linkedRef = versionsColl.doc(versionDoc.id);
        const linkedData = versionDoc.data();
        const tagIdx = linkedData.tagIds.indexOf(nodeId);
        linkedData.tags[tagIdx] = newTitle;
        linkedDataChanges = {
          tags: linkedData.tags,
          updatedAt: currentTimestamp,
        };
        if (t) {
          tWriteOperations.push({
            objRef: linkedRef,
            data: linkedDataChanges,
            operationType: "update",
          });
        } else {
          newBatch.update(linkedRef, linkedDataChanges);
          [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
        }
      }
    }
  }
  if (nodeData.nodeType === "Reference") {
    const citingNodesDocs = await convertToTGet(
      db.collection("nodes").where("referenceIds", "array-contains", nodeId),
      t
    );
    for (let citingNodeDoc of citingNodesDocs.docs) {
      const linkedRef = db.collection("nodes").doc(citingNodeDoc.id);
      const linkedData = citingNodeDoc.data();
      const theRefIdx = linkedData.referenceIds.indexOf(nodeId);
      linkedData.references[theRefIdx] = newTitle;
      linkedDataChanges = {
        references: linkedData.references,
        updatedAt: currentTimestamp,
      };
      if (t) {
        tWriteOperations.push({
          objRef: linkedRef,
          data: linkedDataChanges,
          operationType: "update",
        });
      } else {
        newBatch.update(linkedRef, linkedDataChanges);
        [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      }
      await detach(async () => {
        let batch = db.batch();
        let writeCounts = 0;
        await retrieveAndsignalAllUserNodesChanges({
          batch,
          linkedId: citingNodeDoc.id,
          nodeChanges: linkedDataChanges,
          major: false,
          currentTimestamp,
          writeCounts,
        });
        await commitBatch(batch);
      });
    }
  }
  const notificationsDocs = await convertToTGet(db.collection("notifications").where("nodeId", "==", nodeId), t);
  for (let notificationDoc of notificationsDocs.docs) {
    const notificationRef = db.collection("notifications").doc(notificationDoc.id);
    const notificationUpdates = { title: newTitle };
    if (t) {
      tWriteOperations.push({
        objRef: notificationRef,
        data: notificationUpdates,
        operationType: "updates",
      });
    } else {
      newBatch.update(notificationRef, notificationUpdates);
      [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    }
  }
  return [newBatch, writeCounts];
};

// Push the new or updated tag and comPoints documents to linkedNodesRefs and linkedNodesData
// Should be called when adding a tag to a node.
// Logic
// find node in tags, comPoints, comMonthlyPoints, comWeeklyPoints, comOthersPoints, comOthMonPoints and comOthWeekPoints
// - if docs already present then
//   - set deleted=false
//   - increase nodesNum by 1 if its tags collection
//   - set isTag=true in node doc
// - if docs not exists already
//   - if its a tag collection, fetch direct tags (it skip nested tags that are linked with tag's children nodes)
//   - if its a tag collection, set isTag=true in node doc
//   - if its not tag collection initialize community points doc with given admin attributes
export const addTagCommunityAndTagsOfTags = async ({
  batch,
  tagNodeId,
  tagTitle,
  proposer,
  aImgUrl,
  aFullname,
  aChooseUname,
  currentTimestamp,
  writeCounts,
  t,
  tWriteOperations,
}: any) => {
  let newBatch = batch;
  await tagsAndCommPoints({
    nodeId: tagNodeId,

    callBack: async ({ collectionName, tagRef, tagDoc, tagData }: any) => {
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
          if (t) {
            tWriteOperations.push({
              objRef: tagNodeRef,
              data: {
                isTag: true,
                updatedAt: currentTimestamp,
              },
              operationType: "update",
            });
          } else {
            await newBatch.update(tagNodeRef, {
              isTag: true,
              updatedAt: currentTimestamp,
            });
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }
          tagNewData = {
            ...getDirectTags({ nodeTagIds: tagNodeData.tagIds, nodeTags: tagNodeData.tags, tagsOfNodes: null }),
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
          tagNewData = initializeNewReputationData(tagNodeId, tagTitle, currentTimestamp, currentTimestamp);
          tagNewData = { ...tagNewData, adminPoints: 1, admin: proposer, aImgUrl, aFullname, aChooseUname };
          delete tagNewData.isAdmin;
        }
      }
      if (t) {
        tWriteOperations.push({
          objRef: tagRef,
          data: tagNewData,
          operationType: "set",
        });
      } else {
        await newBatch.set(tagRef, tagNewData);
        [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      }
    },
  });
  return [newBatch, writeCounts];
};

// Should be called when deleting a tag from a node.
// Logic
// set shouldRemove=true if nodesNum went 0 for tag document (against given nodeId that is tag)
// if shouldRemove=true
// - flag tag document as deleted
// - flag comPoints, comMonthlyPoints, comWeeklyPoints, comOthersPoints, comOthMonPoints, comOthWeekPoints as deleted for this node id that is tag
// - set isTag=false for this node
// - fetch all tag docs that this node id present in tagIds prop
//   - splice/remove tagId from tagIds array
export const deleteTagFromNodeTagCommunityAndTagsOfTags = async ({
  batch,
  tagNodeId,
  currentTimestamp,
  writeCounts,
  t,
  tWriteOperations,
}: any) => {
  let newBatch = batch;
  let shouldRemove = false;
  // Delete the corresponding tag document from the tags collection.
  await tagsAndCommPoints({
    nodeId: tagNodeId,
    callBack: async ({ collectionName, tagRef, tagDoc, tagData }: any) => {
      if (tagDoc && !tagData.deleted) {
        const tagUpdates: any = {};
        // Only delete the tag document. Later, in the update time, we'll delete the corresponding comPoints documents.
        if (collectionName === "tags") {
          tagUpdates.nodesNum = tagData.nodesNum && tagData.nodesNum > 0 ? tagData.nodesNum - 1 : 0;
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

        // when nothing needs to be done
        if (Object.keys(tagUpdates).length === 0) {
          return;
        }

        if (t) {
          tWriteOperations.push({
            objRef: tagRef,
            data: tagUpdates,
            operationType: "update",
          });
        } else {
          if (Object.keys(tagUpdates).length > 0) {
            newBatch.update(tagRef, tagUpdates);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }
        }
      }
    },
    t,
  });

  if (shouldRemove) {
    const nodeRef = db.collection("nodes").doc(tagNodeId);
    if (t) {
      tWriteOperations.push({
        objRef: nodeRef,
        data: {
          updatedAt: currentTimestamp,
          isTag: false,
        },
        operationType: "update",
      });
    } else {
      newBatch.update(nodeRef, {
        updatedAt: currentTimestamp,
        isTag: false,
      });
      [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    }

    // Delete the corresponding tag of tags documents from the tags collection.
    const taggingtagDocs = await db.collection("tags").where("tagIds", "array-contains", tagNodeId).get();
    //  For every taggingtagDoc, remove the tag corresponding to tagNodeId from its list of tags.
    for (let taggingtagDoc of taggingtagDocs.docs) {
      const taggingtagRef = db.collection("tags").doc(taggingtagDoc.id);
      const taggingtagData = taggingtagDoc.data();
      const tagNodeIdx = taggingtagData.tagIds.findIndex((tId: any) => tId === tagNodeId);
      taggingtagData.tagIds.splice(tagNodeIdx, 1);
      taggingtagData.tags.splice(tagNodeIdx, 1);
      if (t) {
        tWriteOperations.push({
          objRef: taggingtagRef,
          data: {
            tagIds: taggingtagData.tagIds,
            tags: taggingtagData.tags,
          },
          operationType: "update",
        });
      } else {
        newBatch.update(taggingtagRef, {
          tagIds: taggingtagData.tagIds,
          tags: taggingtagData.tags,
        });
        [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      }
    }
  }
  return [newBatch, writeCounts];
};

// Returns true if the node results in a cycle, otherwise returns false.
export const hasCycle = ({ tagsOfNodes, nodeId, path = [] }: any) => {
  return path.includes(nodeId)
    ? true
    : (tagsOfNodes?.[nodeId]?.tagIds || []).some((tagId: any) => {
        return hasCycle({ tagsOfNodes, nodeId: tagId, path: [...path, nodeId] });
      });
};

export const loadNodeByIds = async (
  nodeIds: string[],
  nodes: {
    [nodeId: string]: INode;
  }
) => {
  const _nodeIds = arrayToChunks(
    nodeIds.filter(nodeId => nodeId).filter(nodeId => !nodes[nodeId]),
    10
  );
  for (const nodeIds of _nodeIds) {
    const _nodes = await db.collection("nodes").where("__name__", "in", nodeIds).get();
    for (const node of _nodes.docs) {
      nodes[node.id] = node.data() as INode;
    }
  }
};

export const loadRecursiveTagIdsFromNode = async (
  nodeIds: string[],
  nodes: {
    [nodeId: string]: INode;
  }
) => {
  await loadNodeByIds(nodeIds, nodes);

  for (const nodeId of nodeIds) {
    // if node is removed
    if (!nodes[nodeId] || nodes[nodeId].deleted) continue;
    if (nodes[nodeId].tagIds && nodes[nodeId].tagIds.length) {
      await loadRecursiveTagIdsFromNode(nodes[nodeId].tagIds, nodes);
    }
  }
};

type TGenerateTagsOfTagsWithNodesParam = {
  tagIds: string[];
  nodeId: string;
  nodes: {
    [nodeId: string]: INode;
  };
  nodeUpdates: {
    tagIds: string[];
    tags: string[];
  };
  visitedNodeIds: string[];
};
export const generateTagsOfTagsWithNodes = async ({
  nodeId,
  tagIds,
  nodes,
  nodeUpdates,
  visitedNodeIds,
}: TGenerateTagsOfTagsWithNodesParam) => {
  // push current node id as visited if not already present
  if (!visitedNodeIds.includes(nodeId)) {
    visitedNodeIds.push(nodeId);
  }

  // for proposing child node, we pass nodeId as ""
  if (!nodes[nodeId]) {
    nodes[nodeId] = {
      tagIds: [],
      tags: [],
    } as any;
  }

  // loading tagIds in nodes list
  await loadNodeByIds([...tagIds, nodeId], nodes);
  // loading recursive tag ids to match cycle
  await loadRecursiveTagIdsFromNode(tagIds, nodes);

  const _tagIds: string[] = [];
  // storing these to restore tags and tagIds
  let __tagIds: string[] = [...nodes[nodeId].tagIds];
  let __tags: string[] = [...nodes[nodeId].tags];

  nodes[nodeId].tagIds = [];
  nodes[nodeId].tags = [];

  for (const tagId of tagIds) {
    visitedNodeIds.push(tagId);
    // if given tag is deleted we don't want it to be present in tag lists
    // or if already validated cycle for this tag id and its present under nodeUpdates.tagIds
    if (nodes[tagId].deleted || nodeUpdates.tagIds.includes(tagId)) {
      continue;
    }

    // temp push tagId to check cycle
    nodes[nodeId].tagIds.push(tagId);
    nodes[nodeId].tags.push(nodes[tagId].title);

    // if given tag is already present in visited nodes that means its a cycle
    if (
      hasCycle({
        tagsOfNodes: nodes,
        nodeId,
        path: [],
      })
    ) {
      // removing temp tagId
      nodes[nodeId].tagIds.splice(nodes[nodeId].tagIds.length - 1, 1);
      nodes[nodeId].tags.splice(nodes[nodeId].tags.length - 1, 1);
      continue;
    }

    // pushing in _tagIds to process them after loop for next recursion
    _tagIds.push(tagId);

    // only push tag to tagIds if it not already present
    if (!nodeUpdates.tagIds.includes(tagId)) {
      nodeUpdates.tagIds.push(tagId);
      nodeUpdates.tags.push(nodes[tagId].title);
    }
  }

  // loading more higher communities
  for (const tagId of _tagIds) {
    await generateTagsOfTagsWithNodes({
      nodeId: tagId,
      tagIds: nodes[tagId].tagIds,
      nodes,
      nodeUpdates,
      visitedNodeIds,
    });
  }

  // restoring old state of node
  nodes[nodeId].tagIds = __tagIds;
  nodes[nodeId].tags = __tags;
};

//  recusively generate tags starting from a given node (top down)
//  starting from a node, iterate through all of its tags and re-call the function for each node.
//  this will continue to occur until the base case where there are no more tags of tags to be generated for the given node
//  each of these tags will be added to tags array and will be returned
//  tags, at the end of the function, will be populated with a hierarchy of tags that the current node is a part of
export const generateTagsOfTags = async ({ nodeId, tagIds, tags, nodeUpdates }: any) => {
  let tagsChanged = false;
  for (let tagId of tagIds) {
    if (tagId !== nodeId && tagIds.length !== 0 && !hasCycle({ tagsOfNodes: tagIds, nodeId, path: [] })) {
      const { tagData } = await getTagRefData(tagId);
      const generatedTags = await generateTagsOfTags({
        nodeId: tagId,
        tagIds: tagData?.tagIds || [],
        tags: tagData?.tags || [],
        nodeUpdates,
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
export const generateTagsData = async ({
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
  writeCounts,
  t,
  tWriteOperations,
}: any) => {
  let newBatch = batch;
  let nodeTagRef, nodeTagData;
  if (isTag) {
    // Get the ref and data to the tag corresponding to this original node.
    const { tagRef, tagData } = await getTagRefData(nodeId, t);
    nodeTagRef = tagRef;
    nodeTagData = tagData;
    if (nodeTagData && !nodeTagData.tags) {
      nodeTagData.tags = [];
      nodeTagData.tagIds = [];
    }
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
        writeCounts,
        t,
        tWriteOperations,
      });
      if (nodeTagData) {
        // Remove the tag from the list of tags on nodeTag (the tag corresponding to nodeId).
        const tagNodeIdx = (nodeTagData.tagIds || []).findIndex((tId: any) => tId === tagId);
        if (tagNodeIdx !== -1) {
          nodeTagData.tagIds.splice(tagNodeIdx, 1);
          nodeTagData.tags.splice(tagNodeIdx, 1);
        }
      }
      // Remove the tag from the list of tags on the node.
      const nodeTagIdx = (nodeTagIds || []).findIndex((tId: any) => tId === tagId);
      if (nodeTagIdx !== -1) {
        nodeTagIds.splice(nodeTagIdx, 1);
        nodeTags.splice(nodeTagIdx, 1);
      }
    }
  }
  const tagUpdates = {
    tagIds: nodeTagData ? nodeTagData.tagIds : [],
    tags: nodeTagData ? nodeTagData.tags : [],
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
          writeCounts,
          t,
          tWriteOperations,
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
            },
          });
        }
      }
    }
  }

  if (isTag && Object.keys(tagUpdates).length > 0) {
    if (nodeTagData) {
      if (t) {
        tWriteOperations.push({
          objRef: nodeTagRef,
          data: tagUpdates,
          operationType: "update",
        });
      } else {
        await newBatch.update(nodeTagRef, tagUpdates);
      }
    } else {
      const node = await db.collection("nodes").doc(nodeId).get();
      const nodeData: any = node.data();
      if (t) {
        tWriteOperations.push({
          objRef: nodeTagRef,
          data: {
            ...tagUpdates,
            title: nodeData.title,
            node: node.id,
          },
          operationType: "set",
        });
      } else {
        await newBatch.set(nodeTagRef, {
          ...tagUpdates,
          title: nodeData.title,
          node: node.id,
        });
        [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      }
    }
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  }
  return [newBatch, writeCounts];
};

export const getUserVersion = async ({ versionId, nodeType, uname, t = false }: any) => {
  const { userVersionsColl }: any = getTypedCollections({ nodeType });
  const userVersionQuery = userVersionsColl.where("version", "==", versionId).where("user", "==", uname).limit(1);
  const userVersionDoc = t ? await t.get(userVersionQuery) : await userVersionQuery.get();
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

export const updateProposersReputationsOnNode = ({
  proposersReputationsOnNode,
  versionData,
  versionRating,
  newMaxVersionRating,
  adminPoints,
  adminNode,
  aImgUrl,
  aFullname,
  aChooseUname,
}: any) => {
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

export const getCumulativeProposerVersionRatingsOnNode = async ({
  nodeId,
  nodeType,
  nodeDataAdmin,
  aImgUrl,
  aFullname,
  aChooseUname,
  updatingVersionId = null,
  updatingVersionData = null,
  updatingVersionRating = null,
  updatingVersionNotAccepted = null,
  t,
}: any) => {
  let adminPoints = 0;
  let newMaxVersionRating = 1;
  let nodeAdmin = nodeDataAdmin;
  let name = aFullname;
  let imageUrl = aImgUrl;
  let userName = aChooseUname;
  const proposersReputationsOnNode = {};
  const { versionsColl }: any = getTypedCollections({ nodeType });
  const versionDocs = await convertToTGet(versionsColl.where("node", "==", nodeId).where("accepted", "==", true), t);
  for (let versionDoc of versionDocs.docs) {
    const versionData = versionDoc.data();
    let versionRating = versionData.corrects - versionData.wrongs;
    if (updatingVersionId && updatingVersionId === versionDoc.id) {
      versionRating = updatingVersionRating;
    }
    const { newVersionRating, points, adminNode, aImgUrl, aFullname, aChooseUname } = updateProposersReputationsOnNode({
      proposersReputationsOnNode,
      versionData,
      versionRating,
      newMaxVersionRating,
      adminPoints,
      adminNode: nodeAdmin,
      aImgUrl: imageUrl,
      aFullname: name,
      aChooseUname: userName,
    });
    newMaxVersionRating = newVersionRating;
    adminPoints = points;
    nodeAdmin = adminNode;
    name = aFullname;
    imageUrl = aImgUrl;
    userName = aChooseUname;
  }
  if (updatingVersionId && updatingVersionNotAccepted) {
    const { newVersionRating, points, adminNode, aImgUrl, aFullname, aChooseUname } = updateProposersReputationsOnNode({
      proposersReputationsOnNode,
      versionData: updatingVersionData,
      versionRating: updatingVersionRating,
      newMaxVersionRating,
      adminPoints,
      aImgUrl: imageUrl,
      aFullname: name,
      aChooseUname: userName,
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

export const createUpdateUserVersion = async ({
  batch,
  userVersionRef,
  userVersionData,
  nodeType,
  writeCounts,
  t,
  tWriteOperations,
}: any) => {
  let newBatch = batch;
  if (t) {
    tWriteOperations.push({
      objRef: userVersionRef,
      data: userVersionData,
      operationType: "set",
    });
  } else {
    newBatch.set(userVersionRef, userVersionData);
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  }

  const userVersionLogRef = db.collection("userVersionsLog").doc();
  delete userVersionData.updatedAt;
  userVersionData.nodeType = nodeType;

  if (t) {
    tWriteOperations.push({
      objRef: userVersionLogRef,
      data: userVersionData,
      operationType: "set",
    });
  } else {
    newBatch.set(userVersionLogRef, userVersionData);
    [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
  }
  return [newBatch, writeCounts];
};

type IUpdateNodeContributionParam = {
  nodeId: string;
  uname: string;
  accepted: boolean;
  contribution: number;
};
export const updateNodeContributions = async ({
  nodeId,
  uname,
  accepted,
  contribution,
}: IUpdateNodeContributionParam) => {
  let batch = db.batch();
  let writeCounts: number = 0;

  const nodeDoc = await db.collection("nodes").doc(nodeId).get();
  const nodeRef = db.collection("nodes").doc(nodeDoc.id);
  const nodeData = nodeDoc.data() as INode;

  const userDoc = await db.collection("users").doc(uname).get();
  const userRef = db.collection("users").doc(userDoc.id);
  const userData = userDoc.data() as IUser;

  const _institutations = await db.collection("institutions").where("name", "==", userData.deInstit).limit(1).get();
  const institutionRef = db.collection("institutions").doc(_institutations.docs[0].id);
  const institutionData = _institutations.docs[0].data() as IInstitution;

  // if version is not accepted we don't need to calculate anything
  if (!accepted) {
    return;
  }

  // update contributors
  const contribNames: string[] = nodeData.contribNames || [];
  if (contribNames.indexOf(userData.uname) === -1) {
    contribNames.push(userData.uname);
  }

  const contributors: {
    [uname: string]: {
      chooseUname: boolean;
      fullname: string;
      imageUrl: string;
      reputation: number;
    };
  } = nodeData.contributors || {};
  if (!contributors.hasOwnProperty(userData.uname)) {
    contributors[userData.uname] = {
      chooseUname: userData.chooseUname,
      fullname: `${userData.fName} ${userData.lName}`,
      imageUrl: userData.imageUrl,
      reputation: 0,
    };
  }
  contributors[userData.uname].reputation += contribution;

  // update institutions
  const institNames: string[] = nodeData.institNames || [];
  if (institNames.indexOf(userData.deInstit) === -1) {
    institNames.push(userData.deInstit);
  }

  const institutions: {
    [institutionName: string]: {
      reputation: number;
    };
  } = nodeData.institutions || {};
  if (!institutions.hasOwnProperty(userData.deInstit)) {
    institutions[userData.deInstit] = {
      reputation: 0,
    };
  }
  institutions[userData.deInstit].reputation += contribution;

  batch.update(nodeRef, {
    contributors,
    contribNames,
    institutions,
    institNames,
  });
  [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

  // user totalPoints
  batch.update(userRef, {
    totalPoints: userData.totalPoints + contribution,
  });
  [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

  // institution totalPoints
  batch.update(institutionRef, {
    totalPoints: institutionData.totalPoints + contribution,
  });
  [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

  await commitBatch(batch);
};

export const signalNodeDeleteToTypesense = async ({ nodeId }: { nodeId: string }) => {
  const typesense = getTypesenseClient();
  if (await typesenseDocumentExists("nodes", nodeId)) {
    await typesense.collections("nodes").documents(nodeId).delete();
  }
  if (await typesenseDocumentExists("processedReferences", nodeId)) {
    await typesense.collections("processedReferences").documents(nodeId).delete();
  }
};

export const signalNodeVoteToTypesense = async ({
  nodeId,
  corrects,
  wrongs,
}: {
  nodeId: string;
  corrects: number;
  wrongs: number;
}) => {
  const typesense = getTypesenseClient();

  const tsNodeData = {
    corrects: corrects,
    wrongs: wrongs,
    netVotes: corrects - wrongs,
    mostHelpful: corrects - wrongs,
  };
  if (await typesenseDocumentExists("nodes", nodeId)) {
    await typesense.collections("nodes").documents(nodeId).update(tsNodeData);
  }
};

export const signalNodeToTypesense = async ({
  nodeId,
  currentTimestamp,
  versionData,
}: {
  nodeId: string;
  currentTimestamp: Timestamp;
  versionData: INodeVersion;
}) => {
  const typesense = getTypesenseClient();
  const nodeData = (await db.collection("nodes").doc(nodeId).get()).data() as INode;
  const institutions = Object.entries(nodeData.institutions || {})
    .map(cur => ({ name: cur[0], reputation: cur[1].reputation || 0 }))
    .sort((a, b) => b.reputation - a.reputation)
    .map(institution => ({ name: institution.name }));

  const contributors = Object.entries(nodeData.contributors || {})
    .map(cur => ({ uname: cur[0], ...cur[1] }))
    .sort((a, b) => b.reputation - a.reputation);

  if (!(await typesense.collections("nodes").exists())) {
    await typesense.collections().create({
      name: "nodes",
      fields: TypesenseNodeSchema,
    });
  }

  const tsNodeData = {
    updatedAt: currentTimestamp.toMillis(),
    changedAt: currentTimestamp.toDate().toISOString(),
    changedAtMillis: currentTimestamp.toMillis(),
    choices: versionData.choices ? versionData.choices : [],
    content: versionData.content,
    contribNames: nodeData.contribNames,
    institNames: nodeData.institNames || [],
    contributors: contributors || [],
    contributorsNames: nodeData.contribNames || [],
    corrects: nodeData.corrects,
    wrongs: nodeData.wrongs,
    netVotes: nodeData.corrects - nodeData.wrongs,
    mostHelpful: nodeData.corrects - nodeData.wrongs,
    id: nodeId,
    labelsReferences: nodeData.referenceLabels || [],
    institutions,
    institutionsNames: nodeData.institNames || [],
    nodeImage: nodeData.nodeImage || "",
    nodeType: nodeData.nodeType,
    isTag: nodeData.isTag || false,
    tags: nodeData.tags,
    title: nodeData.title,
    titlesReferences: nodeData.references,
    versions: nodeData.versions + 1,
  };
  if (await typesenseDocumentExists("nodes", nodeId)) {
    await typesense.collections("nodes").documents(nodeId).update(tsNodeData);
  } else {
    await typesense.collections("nodes").documents().create(tsNodeData);
  }

  if (nodeData.nodeType === "Reference") {
    if (await typesenseDocumentExists("processedReferences", nodeId)) {
      await typesense.collections("processedReferences").documents(nodeId).update({
        id: nodeId,
        title: nodeData.title,
        data: [],
      });
    } else {
      await typesense.collections("processedReferences").documents().create({
        id: nodeId,
        title: nodeData.title,
        data: [],
      });
    }
  }
};

type ITransferUserVersionsToNewNode = {
  versionId: string;
  versionType: INodeType;
  childType: INodeType;
  newVersionId: string;
  skipUnames: string[];
  batch: WriteBatch;
  writeCounts: number;
  t: FirebaseFirestore.Transaction;
  tWriteOperations: TWriteOperation[];
};

// helper to transfer user versions (votes) from old node to newely created node on approval
export const transferUserVersionsToNewNode = async ({
  versionId,
  versionType,
  childType,
  newVersionId,
  skipUnames,
  batch,
  writeCounts,
  t,
  tWriteOperations,
}: ITransferUserVersionsToNewNode) => {
  const { userVersionsColl: oldUserVersionsColl } = getTypedCollections({
    nodeType: versionType,
  });
  const { userVersionsColl } = getTypedCollections({
    nodeType: childType,
  });

  const oldUserVersions = await oldUserVersionsColl.where("version", "==", versionId).get();
  for (const oldUserVersion of oldUserVersions.docs) {
    const oldUserVersionData = oldUserVersion.data() as IUserNodeVersion;
    if (skipUnames.includes(oldUserVersionData.user)) {
      continue;
    }

    const newUserVersionData = { ...oldUserVersionData };
    newUserVersionData.version = newVersionId;

    const oldUserVersionRef = db.collection(oldUserVersionsColl.id).doc(oldUserVersion.id);
    const newUserVersionRef = db.collection(userVersionsColl.id).doc();

    if (t) {
      tWriteOperations.push({
        objRef: newUserVersionRef,
        data: newUserVersionData,
        operationType: "set",
      });
      tWriteOperations.push({
        objRef: oldUserVersionRef,
        data: {
          deleted: true,
        },
        operationType: "update",
      });
    } else {
      batch.set(newUserVersionRef, newUserVersionData);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

      batch.update(oldUserVersionRef, {
        deleted: true,
      });
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }
  }

  return [batch, writeCounts];
};

export const versionCreateUpdate = async ({
  versionNodeId,
  notebookId, // optional string
  batch,
  nodeId,
  nodeData,
  nodeRef,
  nodeType,
  instantApprove,
  courseExist,
  isInstructor,
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
  newUpdates,
  writeCounts,
  t,
  tWriteOperations,
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

  let newBatch = batch;

  // If the version is deleted, the user should have not been able to vote on it.
  if (!deleted) {
    const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
    const comReputationUpdates: IComReputationUpdates = {};

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
      writeCounts,
      comReputationUpdates,
      t,
      tWriteOperations,
    });

    for (const tagId in comReputationUpdates) {
      for (const reputationType of reputationTypes) {
        if (!comReputationUpdates[tagId][reputationType]) continue;

        if (t) {
          tWriteOperations.push({
            objRef: comReputationUpdates[tagId][reputationType].docRef,
            data: comReputationUpdates[tagId][reputationType].docData,
            operationType: comReputationUpdates[tagId][reputationType].isNew ? "set" : "update",
          });
        } else {
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

    let { userVersionData } = await getUserVersion({ versionId, nodeType, uname: voter, t });
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

    if (courseExist || isInstructor) {
      versionData.accepted = instantApprove;
    } else {
      versionData.accepted = isVersionApproved({ corrects: versionCorrects, wrongs: versionWrongs, nodeData })
        ? true
        : false;
    }

    // If the version was accepted previously, accepted === true.
    // If the version is determined to be approved right now, versionData.accepted === true.

    if (versionData.accepted || (accepted && !courseExist)) {
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
          updatingVersionNotAccepted: !accepted,
          t,
          tWriteOperations,
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
        nodeType,
        updatedAt: currentTimestamp,
      };

      //  proposal was accepted previously, not accepted just now
      if (accepted) {
        // When someone votes on an accepted proposal of a node, that person has definitely studied it.
        // So, if previously isStudied was false, we should increment the number of studied and later set isStudied to true for the user.
        if (
          // (voterNodeData && !voterNodeData.isStudied) ||
          nodeAdmin !== nodeData.admin ||
          newMaxVersionRating !== nodeData.maxVersionRating
        ) {
          if (t) {
            tWriteOperations.push({
              objRef: nodeRef,
              data: nodeUpdates,
              operationType: "update",
            });
          } else {
            newBatch.update(nodeRef, nodeUpdates);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }
        }
        // TODO: move these to queue
        await detach(async () => {
          let batch = db.batch();
          let writeCounts = 0;
          await retrieveAndsignalAllUserNodesChanges({
            batch,
            linkedId: nodeId,
            nodeChanges: nodeUpdates,
            major: false,
            currentTimestamp,
            writeCounts,
          });
          await commitBatch(batch);
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
            ...nodeUpdates, // admin related fields and maxVersionRating
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
            nodeUpdates.choices = versionData.choices;
          }
          [newBatch, writeCounts] = await generateTagsData({
            batch: newBatch,
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
            writeCounts,
            t,
            tWriteOperations,
          });

          if (t) {
            tWriteOperations.push({
              objRef: nodeRef,
              data: nodeUpdates,
              operationType: "update",
            });
          } else {
            newBatch.update(nodeRef, nodeUpdates);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }

          if (nodeData.title !== title || versionData.changedNodeType) {
            [newBatch, writeCounts] = await changeNodeTitle({
              batch: newBatch,
              nodeData,
              nodeId,
              newTitle: title,
              nodeType,
              currentTimestamp,
              writeCounts,
              t,
              tWriteOperations,
            });
          }

          // signal search about improvement or new node
          await indexNodeChange(nodeId, title, "UPDATE");

          // TODO: move these to queue
          await detach(async () => {
            let linkedNode, linkedNodeChanges;
            let batch = db.batch();
            let writeCounts = 0;
            for (let addedParent of addedParents) {
              linkedNode = await getNode({ nodeId: addedParent });
              linkedNodeChanges = {
                children: [...linkedNode.nodeData.children, { node: nodeId, title, label: "", type: nodeType }],
                studied: 0,
                changedAt: currentTimestamp,
                updatedAt: currentTimestamp,
              };

              batch.update(linkedNode.nodeRef, linkedNodeChanges);
              [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

              [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
                batch,
                linkedId: addedParent,
                nodeChanges: linkedNodeChanges,
                major: true,
                currentTimestamp,
                writeCounts,
              });
            }
            for (let addedChild of addedChildren) {
              linkedNode = await getNode({ nodeId: addedChild });
              linkedNodeChanges = {
                parents: [...linkedNode.nodeData.parents, { node: nodeId, title, label: "", type: nodeType }],
                studied: 0,
                changedAt: currentTimestamp,
                updatedAt: currentTimestamp,
              };

              batch.update(linkedNode.nodeRef, linkedNodeChanges);
              [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

              [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
                batch,
                linkedId: addedChild,
                nodeChanges: linkedNodeChanges,
                major: true,
                currentTimestamp,
                writeCounts,
              });
            }
            for (let removedParent of removedParents) {
              linkedNode = await getNode({ nodeId: removedParent });
              linkedNodeChanges = {
                children: linkedNode.nodeData.children.filter((l: any) => l.node !== nodeId),
                studied: 0,
                changedAt: currentTimestamp,
                updatedAt: currentTimestamp,
              };

              batch.update(linkedNode.nodeRef, linkedNodeChanges);
              [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

              [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
                batch,
                linkedId: removedParent,
                nodeChanges: linkedNodeChanges,
                major: true,
                currentTimestamp,
                writeCounts,
              });
            }
            for (let removedChild of removedChildren) {
              linkedNode = await getNode({ nodeId: removedChild });
              linkedNodeChanges = {
                parents: linkedNode.nodeData.parents.filter((l: any) => l.node !== nodeId),
                studied: 0,
                changedAt: currentTimestamp,
                updatedAt: currentTimestamp,
              };

              batch.update(linkedNode.nodeRef, linkedNodeChanges);
              [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

              [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
                batch,
                linkedId: removedChild,
                nodeChanges: linkedNodeChanges,
                major: true,
                currentTimestamp,
                writeCounts,
              });
            }
            await commitBatch(batch);
          });
          //  just accepted a proposal for a new child node (not an improvement)
        } else {
          let childNodeRef = db.collection("nodes").doc();
          if (versionNodeId && !(await db.collection("nodes").doc(versionNodeId).get()).exists) {
            childNodeRef = db.collection("nodes").doc(versionNodeId);
          }
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
            childNode.choices = versionData.choices;
          }
          const { versionsColl, userVersionsColl }: any = getTypedCollections({ nodeType: childType });
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
          if (t) {
            tWriteOperations.push({
              objRef: versionRef,
              data: childVersion,
              operationType: "set",
            });
          } else {
            newBatch.set(versionRef, childVersion);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }

          newUpdates.versionId = versionRef.id;
          newUpdates.nodeId = childNodeRef.id;
          newUpdates.versionData = childVersion;

          // signal search about improvement or new node
          await indexNodeChange(newUpdates.nodeId, title, "NEW");

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
            writeCounts,
            t,
            tWriteOperations,
          });

          [newBatch, writeCounts] = await transferUserVersionsToNewNode({
            batch: newBatch,
            writeCounts,
            childType,
            newVersionId: versionRef.id,
            versionId,
            skipUnames: [voter],
            t,
            tWriteOperations,
            versionType: nodeType,
          });

          // userNode for voter
          const newUserNodeObj: any = {
            correct: correct === 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
            deleted: false,
            isStudied: true,
            bookmarked: false,
            changed: false,
            node: childNodeRef.id,
            open: true,
            user: voter,
            visible: true,
            wrong: wrong === 1,
          };

          if (notebookId) {
            newUserNodeObj.notebooks = [notebookId];
            newUserNodeObj.expands = [true];
          }

          const userNodeRef = db.collection("userNodes").doc();
          if (t) {
            tWriteOperations.push({
              objRef: userNodeRef,
              data: newUserNodeObj,
              operationType: "set",
            });
          } else {
            batch.set(userNodeRef, { ...newUserNodeObj });
            [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
          }
          const userNodeLogRef = db.collection("userNodesLog").doc();
          delete newUserNodeObj.updatedAt;
          if (t) {
            tWriteOperations.push({
              objRef: userNodeLogRef,
              data: newUserNodeObj,
              operationType: "set",
            });
          } else {
            batch.set(userNodeLogRef, newUserNodeObj);
            [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
          }

          //  Delete the old version on the parent.
          const { versionsCommentsColl }: any = getTypedCollections({ nodeType });

          let versionsCommentsRef = versionsCommentsColl
            .where("version", "==", versionId)
            .where("deleted", "==", false);
          const versionsCommentsDocs = await convertToTGet(versionsCommentsRef, t);
          for (let versionCommentDoc of versionsCommentsDocs.docs) {
            const versionCommentId = versionCommentDoc.Id;
            const versionCommentData = versionCommentDoc.data();
            versionsCommentsRef = versionsCommentsColl.doc(versionCommentId);
            // In this case, we don't need to create a new version.
            // We can just change the version id from the old version to the new version on the child node.
            const versionCommentUpdate = {
              ...versionCommentData,
              version: versionRef.id,
              updatedAt: currentTimestamp,
            };
            if (t) {
              tWriteOperations.push({
                objRef: versionsCommentsRef,
                data: versionCommentUpdate,
                operatoinType: "set",
              });
            } else {
              newBatch.set(versionsCommentsRef, versionCommentUpdate);
              [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
            }
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
            writeCounts,
            t,
            tWriteOperations,
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

          if (t) {
            tWriteOperations.push({
              objRef: childNodeRef,
              data: childNode,
              operationType: "set",
            });
          } else {
            newBatch.set(childNodeRef, childNode);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }

          nodeUpdates = {
            ...nodeUpdates, // admin related props
            changedAt: currentTimestamp,
            children: [...nodeData.children, { node: childNodeRef.id, title: title, label: "", type: childType }],
            // For the proposer and the voter, it's marked as studied.
            // studied: 2,
            studied: 0,
          };

          // it will only update admin
          if (t) {
            tWriteOperations.push({
              objRef: nodeRef,
              data: nodeUpdates,
              operationType: "update",
            });
          } else {
            newBatch.update(nodeRef, nodeUpdates);
            [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
          }

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
              parentId: childNode.parents?.[0]?.node || "",
              currentTimestamp,
              writeCounts,
              t,
              tWriteOperations,
            });
          }
        }

        // TODO: move these to queue
        await detach(async () => {
          let batch = db.batch();
          let writeCounts = 0;
          // In both cases of accepting an improvement proposal and a child proposal,
          // we need to signal all the users that it's changed.
          await retrieveAndsignalAllUserNodesChanges({
            batch,
            linkedId: nodeId,
            nodeChanges: nodeUpdates,
            major: true,
            currentTimestamp,
            writeCounts,
          });
          await commitBatch(batch);
        });
      }
    }
  }

  return [newBatch, writeCounts];
};

export const addToPendingPropsNumsExcludingVoters = async ({
  batch,
  nodeType,
  versionId,
  tagIds,
  value,
  writeCounts,
  t,
  tWriteOperations,
}: any) => {
  let newBatch = batch;
  const { userVersionsColl }: any = getTypedCollections({ nodeType: nodeType as INodeType });
  const userVersionsDocs = await convertToTGet(userVersionsColl.where("version", "==", versionId), t);
  const voters = [];
  for (let userVersionDoc of userVersionsDocs.docs) {
    const userVersionData = userVersionDoc.data();
    voters.push(userVersionData.user);
  }

  [newBatch, writeCounts] = await addToPendingPropsNums({
    batch: newBatch,
    tagIds,
    value,
    voters,
    writeCounts,
    t,
    tWriteOperations,
  });
  return [newBatch, writeCounts];
};

export const signalFlashcardChanges = async ({ nodeId, batch, writeCounts, currentTimestamp }: any) => {
  let newBatch = batch;

  const nodeDoc = await db.collection("nodes").doc(nodeId).get();
  const nodeData = nodeDoc.data();
  if (nodeData && nodeData.hasOwnProperty("linkedFlashcards")) {
    const linkedFlashcards = nodeData.linkedFlashcards;
    for (let linkedF of linkedFlashcards) {
      const tempFlashcardRef = db.collection("tempFlashcards").doc(linkedF.documentId);
      const tempFlashcardDoc = await tempFlashcardRef.get();
      const tempFlashcardData = tempFlashcardDoc.data();
      const flashcards = tempFlashcardData?.flashcards;
      let needUpdate = false;
      flashcards.forEach((flashcard: any) => {
        if (flashcard.nodeId === nodeId) {
          needUpdate = true;
          flashcard.proposed = false;
          flashcard.nodeId = "";
        }
      });
      console.log("signalFlashcardChanges", needUpdate, flashcards);
      if (needUpdate) {
        newBatch.update(tempFlashcardRef, { flashcards, updatedAt: currentTimestamp });
        [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      }
    }
  }
  return [newBatch, writeCounts];
};
