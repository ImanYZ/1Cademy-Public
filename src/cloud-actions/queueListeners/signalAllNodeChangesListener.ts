import { Timestamp } from "firebase-admin/firestore";
import { SignalAllNodesJob } from "src/types/IQueue";
import { retrieveAndsignalAllUserNodesChanges } from "src/utils";

import { commitBatch, db } from "@/lib/firestoreServer/admin";

export const signalAllNodeChangesListener = async ({ nodeId, nodeChanges, major }: SignalAllNodesJob["payload"]) => {
  let batch = db.batch();
  let writeCounts = 0;
  [batch, writeCounts] = await retrieveAndsignalAllUserNodesChanges({
    batch,
    linkedId: nodeId,
    nodeChanges,
    major,
    currentTimestamp: Timestamp.now(),
    writeCounts,
  });
  await commitBatch(batch);
};
