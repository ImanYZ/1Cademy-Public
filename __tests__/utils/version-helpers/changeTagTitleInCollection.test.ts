import { commitBatch, db } from "../../../src/lib/firestoreServer/admin";
import { changeTagTitleInCollection } from "../../../src/utils";
import { usersData } from "../../../testUtils/mockCollections";

describe("changeTagTitleInCollection", () => {
  beforeEach(async () => {
    await usersData.populate();
  });

  afterEach(async () => {
    await usersData.clean();
  });

  it("should perform changeTagTitleInCollection action on users collection", async () => {
    let batch = db.batch();
    let writeCounts = 0;
    [batch, writeCounts] = await changeTagTitleInCollection({
      batch,
      collectionName: "users",
      nodeId: "FJfzAX7zbgQS8jU5XcEk",
      newTitle: "Test 1Academy",
      writeCounts,
    });
    await commitBatch(batch);
    const userDocs: any = await db.collection("users").where("tagId", "==", "FJfzAX7zbgQS8jU5XcEk").get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(userDocs.docs[0].data()).toMatchObject({ tag: "Test 1Academy" });
  });
});
