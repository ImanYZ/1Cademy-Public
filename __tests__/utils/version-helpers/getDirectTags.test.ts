import { db } from "../../../src/lib/firestoreServer/admin";
import { getDirectTags } from "../../../src/utils";
import { nodesData } from "../../../testUtils/mockCollections";

describe("getDirectTags", () => {
  beforeEach(async () => {
    await nodesData.populate();
  });

  afterEach(async () => {
    await nodesData.clean();
  });

  it("should get direct tags against specific node", async () => {
    const nodes: any = await db.collection("nodes").get();
    let tags = nodes.docs[0].data().tags;
    let tagIds = nodes.docs[0].data().tagIds;
    let compareChoice = await getDirectTags({ nodeTagIds: tagIds, nodeTags: tags, tagsOfNodes: null });
    expect(compareChoice).toBeDefined();
  });
});
