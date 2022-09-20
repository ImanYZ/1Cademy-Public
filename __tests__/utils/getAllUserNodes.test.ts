import { getAllUserNodes } from "../../src/utils/getAllUserNodes";
import { statusData, userNodesData as userNodesMockData, usersData } from "../../testUtils/mockCollections";

describe("signalAllUserNodesChanges", () => {
  const nodeId = "FJfzAX7zbgQS8jU5XcEk";

  beforeEach(async () => {
    await usersData.populate();
    await userNodesMockData.populate();
    await statusData.populate();
  });

  afterEach(async () => {
    await usersData.clean();
    await userNodesMockData.clean();
    await statusData.clean();
  });

  it("Should return nodeRef and nodeData of a user", async () => {
    let { userNodesRefs, userNodesData }: any = await getAllUserNodes({ nodeId });
    expect(userNodesData).toEqual(expect.arrayContaining([expect.objectContaining({ node: nodeId })]));
    for (let userNodeRef of userNodesRefs) {
      const userNodeData = (await userNodeRef.get()).data();
      expect(userNodeData).toMatchObject({ node: nodeId });
    }
  });
});
