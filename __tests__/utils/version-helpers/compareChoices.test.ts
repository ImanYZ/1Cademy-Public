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

  it("should compare nodes choices with same choices", async () => {
    const node1 = await db.collection("nodes").doc("iUex43wFn3yzFcDbma04").get();
    const node2 = await db.collection("nodes").doc("9BVhNniLS940DBVqKbFR").get();
    let compareChoice = compareChoices({ node1: node1.data(), node2: node2.data() });
    expect(compareChoice).toBe(true);
  });

  it("should compare nodes choices without same choices", async () => {
    const node1 = await db.collection("nodes").doc("iUex43wFn3yzFcDbma04").get();
    const node2 = await db.collection("nodes").doc("FJfzAX7zbgQS8jU5XcEk").get();
    let compareChoice = compareChoices({ node1: node1.data(), node2: node2.data() });
    expect(compareChoice).toBe(false);
  });
});
