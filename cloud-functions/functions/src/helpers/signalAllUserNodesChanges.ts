import { db, batchUpdate } from "../admin";

export const signalAllUserNodesChanges = async ({
  userNodesRefs,
  userNodesData,
  nodeChanges,
  major,
  deleted,
  currentTimestamp,
}: any) => {
  //  change / isStudied determine the color border of a node
  for (let userNodeIdx = 0; userNodeIdx < userNodesRefs.length; userNodeIdx++) {
    const userNodeRef = userNodesRefs[userNodeIdx];
    const userNodeData = userNodesData[userNodeIdx];
    const uname = userNodeData.user;
    const changedUserNode: any = {};
    const userStatus = await db.collection("status").doc(uname).get();
    const userStatusData: any = userStatus.data();
    const last_online =
      userStatusData && userStatusData?.last_online ? new Date(userStatusData.last_online) : new Date();
    if (userStatusData?.state === "online" || last_online.getTime() + 24 * 60 * 60 > new Date().getTime()) {
      changedUserNode.nodeChanges = nodeChanges;
    } else if ("nodeChanges" in changedUserNode) {
      delete changedUserNode.nodeChanges;
    }
    if (major) {
      // console.log(changedUserNode.nodeChanges, "nodeChanges");
      changedUserNode.isStudied = false;
    }
    if (deleted) {
      changedUserNode.deleted = true;
      changedUserNode.notebooks = [];
      changedUserNode.expands = [];
    }
    if (Object.keys(changedUserNode).length > 0) {
      changedUserNode.updatedAt = currentTimestamp;

      await batchUpdate(userNodeRef, changedUserNode);
    }
  }
};
