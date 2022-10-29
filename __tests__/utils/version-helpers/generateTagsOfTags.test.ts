import { db } from "../../../src/lib/firestoreServer/admin";
import { generateTagsOfTags } from "../../../src/utils";
import { conceptVersionsData, nodesData, tagsData, usersData } from "../../../testUtils/mockCollections";

describe("generateTagsOfTags", () => {
  beforeEach(async () => {
    await usersData.populate();
    await nodesData.populate();
    await tagsData.populate();
    await conceptVersionsData.populate();
  });

  afterEach(async () => {
    await usersData.clean();
    await nodesData.clean();
    await tagsData.clean();
    await conceptVersionsData.clean();
  });

  it("should perform generateTagsOfTags action on tags collection", async () => {
    let nodeDoc: any = await db.collection("nodes").doc("KdPekc9A2cxMVDuI8Vsr").get();
    let { tagIds, tags } = await generateTagsOfTags({
      nodeId: nodeDoc.id,
      tagIds: nodeDoc.data().tagIds,
      tags: nodeDoc.data().tags,
      nodeUpdates: {},
    });
    expect(tagIds).toEqual(["9BVhNniLS940DBVqKbFR", "011Y1p6nPmPvfHuhkAyw", "ti7rc0S0nv7RkTIGSkWc"]);
    expect(tags).toEqual(["Data Science & something", "Haroon"]);
  });
});
