import { admin, commitBatch, db } from "../../../src/lib/firestoreServer/admin";
import { createPractice } from "../../../src/utils";
import { MockData } from "../../../testUtils/mockCollections";
import { nodesData, usersData, userVersionsData } from "../../../testUtils/mockCollections";

describe("createPractice", () => {
  const collects = [userVersionsData, nodesData, usersData, new MockData([], "courses")];

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("should perform createPractice action on specifc nodeType", async () => {
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    let batch = db.batch();
    let writeCounts = 0;
    let nodeDoc: any = await db.collection("nodes").doc("GJfzAY1zbgQs9jU5XeEL").get();

    for (const tagId of nodeDoc.data().tagIds) {
      const courseRef = db.collection("semesters").doc(tagId);
      await courseRef.set({
        tagId,
      });
    }

    [batch, writeCounts] = await createPractice({
      batch,
      tagIds: nodeDoc.data().tagIds,
      nodeId: nodeDoc.data().title,
      parentId: nodeDoc.data().parents?.[0]?.node || "",
      unames: ["1man"],
      currentTimestamp,
      writeCounts,
    });
    await commitBatch(batch);
    const practiceDocs: any = await db.collection("practice").where("user", "==", "1man").get();
    expect(practiceDocs.docs.length).toBeGreaterThan(0);
    expect(practiceDocs.docs[0].data()).toBeDefined();
  });
});
