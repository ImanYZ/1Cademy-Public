import { admin,commitBatch, db } from "../../../src/lib/firestoreServer/admin";
import { changeNodeTitle } from "../../../src/utils";
import { nodesData, notificationsData,usersData } from "../../../testUtils/mockCollections";

describe("changeNodeTitle", () => {
  beforeEach(async () => {
    await usersData.populate();
    await nodesData.populate();
    await notificationsData.populate();
  });

  afterEach(async () => {
    await usersData.clean();
    await nodesData.clean();
    await notificationsData.clean();
  });

  it("should perform changeNodeTitle action on nodes collection", async () => {
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    let nodeDoc: any = await db.collection("nodes").doc("FJfzAX7zbgQS8jU5XcEk").get();
    let batch = db.batch();
    let writeCounts = 0;
    [batch, writeCounts] = await changeNodeTitle({
      batch,
      nodeData: nodeDoc.data(),
      nodeId: nodeDoc.id,
      newTitle: "Test 1Academy",
      nodeType: "Concept",
      currentTimestamp: currentTimestamp,
      writeCounts,
    });
    await commitBatch(batch);
    const nodeDocs: any = await db.collection("nodes").doc("FJfzAX7zbgQS8jU5XcEk").get();
    const notificationDocs: any = await db.collection("notifications").where("nodeId", "==", nodeDocs.id).get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(nodeDocs.data().tags).toEqual(expect.arrayContaining(["Test 1Academy"]));
    expect(notificationDocs.docs[0].data()).toMatchObject({ title: "Test 1Academy" });
  });
});
