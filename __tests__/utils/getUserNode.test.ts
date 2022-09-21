import { DocumentReference } from "firebase-admin/firestore";

import { getUserNode } from "../../src/utils/getUserNode";
import { nodesData, userNodesData } from "../../testUtils/mockCollections";

describe("getUserNode", () => {
  beforeEach(async () => {
    await Promise.all([nodesData, userNodesData].map(collect => collect.populate()));
  });

  afterEach(async () => {
    await Promise.all([nodesData, userNodesData].map(collect => collect.clean()));
  });

  it("Should be able to get user-node if it already exist", async () => {
    const _userNodeData = userNodesData.getData();

    const userNode = await getUserNode({
      nodeId: _userNodeData[0].node,
      uname: _userNodeData[0].uname,
    });

    expect(userNode.userNodeData).not.toBeNull();
    expect(userNode.userNodeRef).not.toBeNull();
    expect(userNode.userNodeRef instanceof DocumentReference).toBeTruthy();
  });

  it("Should be able to get user-node ref if user-node doesn't exist", async () => {
    const _userNodeData = userNodesData.getData();

    const userNode = await getUserNode({
      nodeId: "011Y1p6nPmPvfHuhkAyw", // this node exist in db but, not against user
      uname: _userNodeData[0].uname,
    });

    expect(userNode.userNodeData).toBeNull();
    expect(userNode.userNodeRef).not.toBeNull();
    expect(userNode.userNodeRef instanceof DocumentReference).toBeTruthy();
  });
});
