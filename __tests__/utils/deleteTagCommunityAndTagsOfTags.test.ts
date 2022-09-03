import { commitBatch, db } from "../../src/lib/firestoreServer/admin";
import { deleteTagCommunityAndTagsOfTags } from "../../src/utils/deleteTagCommunityAndTagsOfTags";
import { tagsData } from "../../testUtils/mockData";

describe("deleteTagCommunityAndTagsOfTags", () => {
  const nodeId = "r98BjyFDCe4YyLA3U8ZE";
  beforeEach(async () => {
    await tagsData.populate();
  });

  afterEach(async () => {
    await tagsData.clean();
  });

  it("Should set delete = true, on all the tags where node = nodeId", async () => {
    let writeCounts = 0;
    const batch = db.batch();
    const [newBatch] = await deleteTagCommunityAndTagsOfTags({
      batch,
      writeCounts,
      nodeId,
    });
    await commitBatch(newBatch);

    const tags = await db.collection("tags").where("node", "==", nodeId).get();

    tags.docs.forEach(tagRef => {
      const tagData = tagRef.data();
      expect(tagData.deleted).toEqual(true);
    });
  });

  it("Should remove the nodeId from tag of tags documents", async () => {
    const taggedtagDocsBefore = await db.collection("tags").where("tagIds", "array-contains", nodeId).get();

    let writeCounts = 0;
    const batch = db.batch();
    const [newBatch] = await deleteTagCommunityAndTagsOfTags({
      batch,
      writeCounts,
      nodeId,
    });
    await commitBatch(newBatch);

    for (let i = 0; i < taggedtagDocsBefore.docs.length; ++i) {
      const prevTagDoc = taggedtagDocsBefore.docs[i];
      const prevTagData = prevTagDoc.data();

      const indexOfTheNode = prevTagData.tagIds.findIndex((_id: string) => _id === nodeId);
      const nodeTtile = prevTagData.tags[indexOfTheNode];

      const newTagDoc = await db.collection("tags").doc(prevTagDoc.id).get();
      const newTagData = newTagDoc.data();

      // should not have that node title anymore
      expect(newTagData?.tagIds?.includes(nodeId)).toBe(false);

      // should not have that nodeId in tagIds anymore.
      expect(newTagData?.tags.includes(nodeTtile)).toBe(false);
    }
  });
});
