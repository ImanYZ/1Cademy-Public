import { admin, commitBatch, db } from "../../../src/lib/firestoreServer/admin";
import { deleteTagFromNodeTagCommunityAndTagsOfTags } from "../../../src/utils";
import { conceptVersionsData, nodesData, tagsData, usersData } from "../../../testUtils/mockCollections";

describe("deleteTagFromNodeTagCommunityAndTagsOfTags", () => {
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

  it("should perform deleteTagFromNodeTagCommunityAndTagsOfTags action on tags collection", async () => {
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    const tagDoc: any = await db.collection("tags").doc("kAyHgnb1ou6YNfv36K6a").get();
    let batch = db.batch();
    let writeCounts = 0;
    [batch, writeCounts] = await deleteTagFromNodeTagCommunityAndTagsOfTags({
      batch,
      tagNodeId: tagDoc.data().node,
      currentTimestamp: currentTimestamp,
      writeCounts,
    });
    await commitBatch(batch);
    const tagDocs: any = await db.collection("tags").doc("kAyHgnb1ou6YNfv36K6a").get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(tagDocs.data()).toMatchObject({ nodesNum: 0 });
  });
});
