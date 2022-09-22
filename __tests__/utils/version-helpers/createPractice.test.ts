import { admin, commitBatch,db } from "../../../src/lib/firestoreServer/admin";
import { createPractice } from "../../../src/utils";
import { conceptVersionsData, nodesData, practiceData,usersData } from "../../../testUtils/mockCollections";

describe("createPractice", () => {
  beforeEach(async () => {
    await conceptVersionsData.populate();
    await nodesData.populate();
    await usersData.populate();
    await practiceData.populate();
  });

  afterEach(async () => {
    await conceptVersionsData.clean();
    await nodesData.clean();
    await usersData.clean();
    await practiceData.clean();
  });

  it("should perform createPractice action on specifc nodeType", async () => {
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    let batch = db.batch();
    let writeCounts = 0;
    let nodeDoc: any = await db.collection("nodes").doc("FJfzAX7zbgQS8jU5XcEk").get();
    [batch, writeCounts] = await createPractice({
      batch,
      tagIds: nodeDoc.data().tagIds,
      nodeId: nodeDoc.data().title,
      uname: "Iman",
      currentTimestamp,
      writeCounts,
    });
    await commitBatch(batch);
    const practiceDocs: any = await db.collection("practice").where("user", "==", "1man").get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(practiceDocs.docs[0].data()).toBeDefined();
  });
});
