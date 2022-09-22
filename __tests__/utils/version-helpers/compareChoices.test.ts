import { db } from "../../../src/lib/firestoreServer/admin";
import { compareChoices } from "../../../src/utils";
import { nodesData } from "../../../testUtils/mockCollections";

describe("compareChoices", () => {
  beforeEach(async () => {
    await nodesData.populate();
  });

  afterEach(async () => {
    await nodesData.clean();
  });

  it("should compare nodes choices", async () => {
    const nodes = await db.collection("nodes").get();
    let compareChoice = compareChoices({ node1: nodes.docs[0].data(), node2: nodes.docs[2].data() });
    expect(compareChoice).toBe(true);
  });
});
