import { db } from "../../../src/lib/firestoreServer/admin";
import { compareChoices } from "../../../src/utils";
import { nodesData } from "../../../testUtils/mockCollections";

describe("compareChoices.test", () => {
  beforeEach(async () => {
    await nodesData.populate();
  });

  afterEach(async () => {
    await nodesData.clean();
  });

  it("should compare nodes choices", async () => {
    const nodes = await db.collection("nodes").get();
    let compareChoice = compareChoices({ node1: nodes.docs[0], node2: nodes.docs[2] });
    expect(compareChoice).toBe(true);
  });
});
