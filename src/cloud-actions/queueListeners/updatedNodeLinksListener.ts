import { Timestamp } from "firebase-admin/firestore";
import { UpdatedNodeLinksJob } from "src/types/IQueue";
import { getNode, retrieveAndsignalAllUserNodesChanges } from "src/utils";

import { checkRestartBatchWriteCounts, commitBatch, db } from "@/lib/firestoreServer/admin";

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
  for (const addedParent of addedParents) {
    const linkedNode = await getNode({ nodeId: addedParent });
    const linkedNodeChanges = {
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
  for (const addedChild of addedChildren) {
    const linkedNode = await getNode({ nodeId: addedChild });
    const linkedNodeChanges = {
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
  for (const removedParent of removedParents) {
    const linkedNode = await getNode({ nodeId: removedParent });
    const linkedNodeChanges = {
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
  for (const removedChild of removedChildren) {
    const linkedNode = await getNode({ nodeId: removedChild });
    const linkedNodeChanges = {
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
};
