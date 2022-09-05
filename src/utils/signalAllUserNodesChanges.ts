import { deleteField } from "firebase/firestore";

import { checkRestartBatchWriteCounts, db } from "../lib/firestoreServer/admin";
import { convertToTGet } from "./";

export const signalAllUserNodesChanges = async ({
  batch,
  userNodesRefs,
  userNodesData,
  nodeChanges,
  major,
  deleted,
  currentTimestamp,
  writeCounts,
  t,
  tWriteOperations,
}: any) => {
  let newBatch = batch;
  //  change / isStudied determine the color border of a node
  for (let userNodeIdx = 0; userNodeIdx < userNodesRefs.length; userNodeIdx++) {
    const userNodeRef = userNodesRefs[userNodeIdx];
    const userNodeData = userNodesData[userNodeIdx];
    const uname = userNodeData.user;
    const changedUserNode: any = {};
    const userStatus = await convertToTGet(db.collection("status").doc(uname), t);
    const userStatusData: any = userStatus.data();
    const last_online = new Date(userStatusData.last_online);
    if (userStatusData.state === "online" || last_online.getTime() + 24 * 60 * 60 > new Date().getTime()) {
      changedUserNode.nodeChanges = nodeChanges;
    } else if ("nodeChanges" in changedUserNode) {
      changedUserNode.nodeChanges = deleteField();
    }
    if (major) {
      changedUserNode.isStudied = false;
    }
    if (deleted) {
      changedUserNode.deleted = true;
    }
    if (Object.keys(changedUserNode).length > 0) {
      changedUserNode.updatedAt = currentTimestamp;
      if (t) {
        tWriteOperations.push({
          objRef: userNodeRef,
          data: changedUserNode,
          operationType: "update",
        });
      } else {
        newBatch.update(userNodeRef, changedUserNode);
        [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      }
    }
  }
  return [newBatch, writeCounts];
};
