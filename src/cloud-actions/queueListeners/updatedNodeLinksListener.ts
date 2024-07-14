import { Timestamp } from "firebase-admin/firestore";
import { INode } from "src/types/INode";
import { UpdatedNodeLinksJob } from "src/types/IQueue";
import { getNode, retrieveAndsignalAllUserNodesChanges } from "src/utils";

import { commitBatch, db } from "@/lib/firestoreServer/admin";

export const updatedNodeLinksListener = async ({
  nodeId,
  title,
  nodeType,
  addedParents,
  removedParents,
  addedChildren,
  removedChildren,
}: UpdatedNodeLinksJob["payload"]) => {
  const currentTimestamp = Timestamp.now();

  let batch = db.batch();
  let writeCounts = 0;
  const updatedNodes: {
    nodeId: string;
    nodeChanges: Partial<INode>;
  }[] = [];

  for (const addedParent of addedParents) {
    await db.runTransaction(async t => {
      const linkedNode = await getNode({ nodeId: addedParent, t });
      const linkedNodeChanges = {
        children: [...linkedNode.nodeData.children, { node: nodeId, title, label: "", type: nodeType }],
        studied: 0,
        changedAt: currentTimestamp,
        updatedAt: currentTimestamp,
      };

      updatedNodes.push({
        nodeId: addedParent,
        nodeChanges: linkedNodeChanges,
      });

      t.update(linkedNode.nodeRef, linkedNodeChanges);
    });
  }
  for (const addedChild of addedChildren) {
    await db.runTransaction(async t => {
      const linkedNode = await getNode({ nodeId: addedChild, t });
      const linkedNodeChanges = {
        parents: [...linkedNode.nodeData.parents, { node: nodeId, title, label: "", type: nodeType }],
        studied: 0,
        changedAt: currentTimestamp,
        updatedAt: currentTimestamp,
      };

      updatedNodes.push({
        nodeId: addedChild,
        nodeChanges: linkedNodeChanges,
      });

      t.update(linkedNode.nodeRef, linkedNodeChanges);
    });
  }

  for (const removedParent of removedParents) {
    await db.runTransaction(async t => {
      const linkedNode = await getNode({ nodeId: removedParent, t });
      const linkedNodeChanges = {
        children: linkedNode.nodeData.children.filter((l: any) => l.node !== nodeId),
        studied: 0,
        changedAt: currentTimestamp,
        updatedAt: currentTimestamp,
      };

      updatedNodes.push({
        nodeId: removedParent,
        nodeChanges: linkedNodeChanges,
      });

      t.update(linkedNode.nodeRef, linkedNodeChanges);
    });
  }
  for (const removedChild of removedChildren) {
    await db.runTransaction(async t => {
      const linkedNode = await getNode({ nodeId: removedChild, t });
      const linkedNodeChanges = {
        parents: linkedNode.nodeData.parents.filter((l: any) => l.node !== nodeId),
        studied: 0,
        changedAt: currentTimestamp,
        updatedAt: currentTimestamp,
      };

      updatedNodes.push({
        nodeId: removedChild,
        nodeChanges: linkedNodeChanges,
      });

      t.update(linkedNode.nodeRef, linkedNodeChanges);
    });
  }

  for (const { nodeId, nodeChanges } of updatedNodes) {
    [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
      batch,
      linkedId: nodeId,
      nodeChanges,
      major: true,
      currentTimestamp,
      writeCounts,
    });
  }
  await commitBatch(batch);
};
