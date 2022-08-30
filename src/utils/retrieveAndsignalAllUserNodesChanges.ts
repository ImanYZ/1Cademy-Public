import { getAllUserNodes, signalAllUserNodesChanges } from '.';

export const retrieveAndsignalAllUserNodesChanges = async ({
  batch,
  linkedId,
  nodeChanges,
  major,
  currentTimestamp,
  writeCounts
}: any) => {
  let newBatch = batch;
  const { userNodesRefs, userNodesData } = await getAllUserNodes({ linkedId });
  //  update adminsList, we need every admin of every node in userLinkedData
  [newBatch, writeCounts] = await signalAllUserNodesChanges({
    newBatch,
    userNodesRefs,
    userNodesData,
    nodeChanges,
    major,
    deleted: false,
    currentTimestamp,
    writeCounts
  });

  return [newBatch, writeCounts];
};