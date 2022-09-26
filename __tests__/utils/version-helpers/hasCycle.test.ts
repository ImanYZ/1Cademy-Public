import { db } from "../../../src/lib/firestoreServer/admin";
import { hasCycle } from "../../../src/utils";
import { nodesData } from "../../../testUtils/mockCollections";

describe("hasCycle", () => {
  beforeEach(async () => {
    await nodesData.populate();
  });

  afterEach(async () => {
    await nodesData.clean();
  });

  it("should check node hasCycle", async () => {
    const nodes: any = await db.collection("nodes").get();
    let nodeTagIds = nodes.docs[0].data().tagIds;
    const tagsOfNodes: any = {};
    tagsOfNodes[nodeTagIds[0]] = { tagIds: ["Tag 1", "Tag 3"] };
    let hasCycleResult = hasCycle({
      tagsOfNodes: tagsOfNodes,
      nodeId: nodes.docs[0].id,
      path: [nodes.docs[0].id],
    });
    expect(hasCycleResult).toBe(true);
  });
});
