import { commitBatch, db } from "../../src/lib/firestoreServer/admin";
import { deleteTagCommunityAndTagsOfTags } from "../../src/utils/deleteTagCommunityAndTagsOfTags";
import { tagsData } from "../../testUtils/mockData";

describe("deleteTagCommunityAndTagsOfTags", () => {
  const nodeId = "FJfzAX7zbgQS8jU5XcEk";
  beforeEach(async () => {
    await tagsData.populate();
  });

  afterEach(async () => {
    await tagsData.clean();
  });

  it("should Delete all the tag Community and Tags of Tags ", async () => {
    let writeCounts = 0;
    const batch = db.batch();
    const [newBatch] = await deleteTagCommunityAndTagsOfTags({
      batch,
      writeCounts,
      nodeId,
    });

    await commitBatch(newBatch);
  });
});
