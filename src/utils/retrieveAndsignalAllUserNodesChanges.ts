import { getAllUserNodes, signalAllUserNodesChanges } from ".";

export const retrieveAndsignalAllUserNodesChanges = async ({
  batch,
  linkedId,
  nodeChanges,
  major,
  currentTimestamp,
  writeCounts,
  t,
  tWriteOperations,
  onlyVisible,
}: any) => {
  let newBatch = batch;
  const { userNodesRefs, userNodesData } = await getAllUserNodes({ nodeId: linkedId, t, onlyVisible });
  //  update adminsList, we need every admin of every node in userLinkedData
  [newBatch, writeCounts] = await signalAllUserNodesChanges({
    batch: newBatch,
    userNodesRefs,
    userNodesData,
    nodeChanges,
    major,
    deleted: false,
    currentTimestamp,
    writeCounts,
    t,
    tWriteOperations,
  });

  return [newBatch, writeCounts];
};
