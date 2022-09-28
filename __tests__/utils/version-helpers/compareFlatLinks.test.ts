import { db } from "../../../src/lib/firestoreServer/admin";
import { compareFlatLinks } from "../../../src/utils";
import { nodesData } from "../../../testUtils/mockCollections";

describe("compareFlatLinks", () => {
  beforeEach(async () => {
    await nodesData.populate();
  });

  afterEach(async () => {
    await nodesData.clean();
  });

  it("should compare nodes links", async () => {
    const nodes: any = await db.collection("nodes").get();
    let compareChoice = compareFlatLinks({ links1: nodes.docs[0].data().tagIds, links2: nodes.docs[1].data().tagIds });
    expect(compareChoice).toBe(true);
  });
});
