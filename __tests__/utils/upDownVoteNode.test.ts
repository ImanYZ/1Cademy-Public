import { UpDownVoteNode } from "../../src/utils/upDownVoteNode";
import { nodesData, userNodesData, usersData } from "../../testUtils/mockData";

describe("UpDownVoteNode", () => {
  beforeEach(async () => {
    await usersData.populate();
    await nodesData.populate();
    await userNodesData.populate();
  });
  it("should up vote the node", async () => {
    const userData = usersData.getData()[0];
    // await UpDownVoteNode({
    //   fullname: `${userData.fname} ${userData.lname}`,
    //   uname: userData.uname,
    //   imageUrl: userData.imageUrl,
    //   chooseUname: userData.chooseUname,
    //   nodeId: "FJfzAX7zbgQS8jU5XcEk",
    //   actionType: "Correct",
    // });
  });

  afterEach(async () => {
    await usersData.clean();
    await nodesData.clean();
    await userNodesData.clean();
  });
});
