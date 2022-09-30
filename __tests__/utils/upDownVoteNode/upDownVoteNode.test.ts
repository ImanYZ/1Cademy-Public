import { db } from "../../../src/lib/firestoreServer/admin";
import { UpDownVoteNode } from "../../../src/utils/upDownVoteNode";
import { nodesData, statusData, userNodesData, usersData } from "../../../testUtils/mockCollections";

describe("UpDownVoteNode", () => {
  const mockCollections = [usersData, nodesData, userNodesData, statusData];
  beforeEach(async () => {
    await Promise.all(mockCollections.map(col => col.populate()));
  });

  afterEach(async () => {
    await Promise.all(mockCollections.map(col => col.clean()));
  });

  // Cases
  // - Upvote
  // - Downvote
  // - Upvote and Remove Downvote
  // - Remove Upvote and Downvote
  // - Remove Upvote
  // - Remove Downvote

  // Sub Logics
  // - increase corrects/wrongs on active proposals by this formula (currentProposalNetVote/maxProposalNetVote) + upvoteOrDownVote
  // - Delete node if downvotes are more than upvotes
  //   - flag all user nodes as delete related to node
  //   - remove it from parents (for each) -> children property
  //   - remove it from children (for each) -> parents property
  //   - if node is a tag
  //     - remove its id from tagIds of every node that has tagged this node
  //     - remove reputation documents (weekly, monthly and all-time) that related to this community (missing logic)
  //     - remove community points (weekly, monthly and all-time) documents related to this community
  //   - if node type is reference
  //     - remove node id (references, referenceIds and referenceLabels) from each node that this node's id in referenceIds
  //     - mark isStudied=false for each node that had reference of this node
  // - update votes data in each user node related to this node
  // - increase notifications count for proposers
  // - create notification that has data for actionType
  // - create userNodeLog (it stores all actions of Wrongs and Corrects)

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

  /* it("Should set deleted = true on the node if the correct votes are less than wrong votes.", async () => {
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
  }); */
});
