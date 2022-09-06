import { db } from "../../../src/lib/firestoreServer/admin";
import { UpDownVoteNode } from "../../../src/utils/upDownVoteNode";
import { nodesData, statusData, userNodesData, usersData } from "../../../testUtils/mockCollections";

describe("UpDownVoteNode", () => {
  beforeEach(async () => {
    await usersData.populate();
    await nodesData.populate();
    await userNodesData.populate();
    await statusData.populate();
  });

  afterEach(async () => {
    await usersData.clean();
    // await nodesData.clean();
    await userNodesData.clean();
    await statusData.clean();
  });

  it("Should set deleted = true on the node if the correct votes are less than wrong votes.", async () => {
    const nodeId = "00NwvYhgES9mjNQ9LRhG";

    const userData = usersData.getData()[0];
    const nodeRef = db.collection("nodes").doc(nodeId);
    await nodeRef.update({ wrongs: 10, corrects: 0 });

    const params = {
      fullname: `${userData.fname} ${userData.lname}`,
      uname: userData.uname,
      imageUrl: userData.imageUrl,
      chooseUname: userData.chooseUname,
      nodeId,
      actionType: "Correct",
    };
    await UpDownVoteNode(params);

    const nodeDoc = await nodeRef.get();

    expect(nodeDoc.data()!.deleted).toBe(true);
    // if the new change fields node with more downvotes than upvotes, delete
  });
});
