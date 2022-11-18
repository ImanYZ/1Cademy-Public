import { checkRestartBatchWriteCounts, commitBatch, db } from "@/lib/firestoreServer/admin";
import { Timestamp, WriteBatch } from "firebase-admin/firestore";
import { INode } from "src/types/INode";
import { INodeLink } from "src/types/INodeLink";
import { getAllUserNodes } from "./getAllUserNodes";
import { detach } from "./helpers";
import { retrieveAndsignalAllUserNodesChanges } from "./retrieveAndsignalAllUserNodesChanges";
import { signalAllUserNodesChanges } from "./signalAllUserNodesChanges";

export const searchAvailableUnameByEmail = async (email: string) => {
  let parts = email.match(/^[^@]+/) || ["-"];
  let baseUname = parts[0].replace(/([\/\.]|__)/g, "");
  if (!(await db.collection("users").doc(baseUname).get()).exists) {
    return baseUname;
  }
  let i = 1;
  while (true) {
    let selectedUname = `${baseUname}${i}`;
    if (!(await db.collection("users").doc(selectedUname).get()).exists) {
      return selectedUname;
    }
    i++;
  }
};

type DeleteNodeParams = {
  nodeId: string;
  batch: WriteBatch;
  writeCounts: number;
};
export const deleteNode = async ({
  nodeId,
  batch,
  writeCounts,
}: DeleteNodeParams): Promise<[batch: WriteBatch, writeCounts: number]> => {
  const nodeRef = db.collection("nodes").doc(nodeId);
  const nodeData = (await nodeRef.get()).data() as INode;
  // if node not exists
  if (!nodeData) {
    return [batch, writeCounts];
  }

  const parents = nodeData.parents || ([] as INodeLink[]);
  for (const parent of parents) {
    const parentRef = db.collection("nodes").doc(parent.node);
    const parentNodeData = (await parentRef.get()).data() as INode;
    if (!parentNodeData) {
      continue;
    }

    const children = parentNodeData.children.filter(child => child.node !== nodeId);
    let nodeChanges = {
      children,
      changedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    batch.update(parentRef, {
      children,
      changedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    // TODO: move these to queue
    await detach(async () => {
      let batch = db.batch();
      let writeCounts = 0;
      [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
        batch,
        linkedId: parentRef.id,
        nodeChanges,
        major: true,
        currentTimestamp: Timestamp.now(),
        writeCounts,
      });
      await commitBatch(batch);
    });
  }

  const children = nodeData.children || ([] as INodeLink[]);
  for (const child of children) {
    const childRef = db.collection("nodes").doc(child.node);
    const childNodeData = (await childRef.get()).data() as INode;
    if (!childNodeData) {
      continue;
    }

    const parents = childNodeData.parents.filter(parent => parent.node !== nodeId);
    let nodeChanges = {
      parents,
      changedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    batch.update(childRef, nodeChanges);
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

    // TODO: move these to queue
    await detach(async () => {
      let batch = db.batch();
      let writeCounts = 0;
      [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
        batch,
        linkedId: childRef.id,
        nodeChanges,
        major: true,
        currentTimestamp: Timestamp.now(),
        writeCounts,
      });
      await commitBatch(batch);
    });
  }

  batch.update(nodeRef, {
    deleted: true,
  });
  [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
  // TODO: move these to queue
  await detach(async () => {
    let batch = db.batch();
    let writeCounts = 0;
    let { userNodesRefs, userNodesData }: any = await getAllUserNodes({ nodeId });
    [batch, writeCounts] = await signalAllUserNodesChanges({
      batch,
      userNodesRefs,
      userNodesData,
      nodeChanges: {},
      major: true,
      deleted: true,
      currentTimestamp: Timestamp.now(),
      writeCounts,
    });
    await commitBatch(batch);
  });

  if (!nodeData.isTag) {
    return [batch, writeCounts];
  }

  const taggedNodes = await db
    .collection("nodes")
    .where("deleted", "==", false)
    .where("tagIds", "array-contains", nodeId)
    .get();
  for (const taggedNodeDoc of taggedNodes.docs) {
    const taggedNodeRef = db.collection("nodes").doc(taggedNodeDoc.id);
    const taggedNodeData = (await taggedNodeRef.get()).data() as INode;
    const tagIdx = taggedNodeData.tagIds.indexOf(nodeId);
    if (tagIdx === -1) continue;
    taggedNodeData.tagIds.splice(tagIdx, 1);
    taggedNodeData.tags.splice(tagIdx, 1);
    let nodeChanges = {
      tags: taggedNodeData.tags,
      tagIds: taggedNodeData.tagIds,
      changedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    batch.update(taggedNodeRef, nodeChanges);
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    // TODO: move these to queue
    await detach(async () => {
      let batch = db.batch();
      let writeCounts = 0;
      [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
        batch,
        onlyVisible: true,
        linkedId: taggedNodeDoc.id,
        nodeChanges,
        major: true,
        currentTimestamp: Timestamp.now(),
        writeCounts,
      });
      await commitBatch(batch);
    });
  }

  return [batch, writeCounts];
};
