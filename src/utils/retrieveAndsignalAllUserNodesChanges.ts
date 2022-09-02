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
}: any) => {
  let newBatch = batch;
  const { userNodesRefs, userNodesData } = await getAllUserNodes({ linkedId, t });
  //  update adminsList, we need every admin of every node in userLinkedData
  [newBatch, writeCounts] = await signalAllUserNodesChanges({
    newBatch,
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
