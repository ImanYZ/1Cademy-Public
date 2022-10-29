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
    let nodeTags = nodes.docs[0].data().tags;
    let nodeTagIds = nodes.docs[0].data().tagIds;
    const tagsOfNodes: any = {};
    tagsOfNodes[nodeTagIds[0]] = { tagIds: ["Tag 1", "Tag 3"] };
    let { tags, tagIds } = await getDirectTags({ nodeTagIds, nodeTags, tagsOfNodes });
    expect(tags.length).toBeGreaterThan(0);
    expect(tagIds.length).toBeGreaterThan(0);
  });
});
