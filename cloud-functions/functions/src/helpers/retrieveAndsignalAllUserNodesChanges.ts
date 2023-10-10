import { getAllUserNodes } from "./getAllUserNodes";
import { signalAllUserNodesChanges } from "./signalAllUserNodesChanges";

export const retrieveAndsignalAllUserNodesChanges = async ({
  linkedId,
  nodeChanges,
  major,
  currentTimestamp,
  onlyVisible,
}: any) => {
  const { userNodesRefs, userNodesData } = await getAllUserNodes({ nodeId: linkedId, onlyVisible });
  //  update adminsList, we need every admin of every node in userLinkedData
  await signalAllUserNodesChanges({
    userNodesRefs,
    userNodesData,
    nodeChanges,
    major,
    deleted: false,
    currentTimestamp,
  });
};
