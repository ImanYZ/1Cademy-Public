import { admin, commitBatch, db } from "../../../src/lib/firestoreServer/admin";
import { proposalNotification } from "../../../src/utils";
import { getTypedCollections } from "../../../src/utils/getTypedCollections";
import {
  conceptVersionsData,
  nodesData,
  notificationNumsData,
  notificationsData,
  usersData,
} from "../../../testUtils/mockCollections";

describe("proposalNotification", () => {
  let node = "OR8UsmsxmeExHG8ekkIY";
  beforeEach(async () => {
    await conceptVersionsData.populate();
    await nodesData.populate();
    await usersData.populate();
    await notificationsData.populate();
    await notificationNumsData.populate();
  });

  afterEach(async () => {
    await conceptVersionsData.clean();
    await nodesData.clean();
    await usersData.clean();
    await notificationsData.clean();
    await notificationNumsData.clean();
  });

  it("should perform proposalNotification action on specifc nodeType", async () => {
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    let batch = db.batch();
    let writeCounts = 0;
    let { versionsColl }: any = getTypedCollections({
      nodeType: "Concept",
    });
    let nodeDoc: any = await db.collection("nodes").doc("FJfzAX7zbgQS8jU5XcEk").get();
    const versionsDocs: any = await versionsColl.where("node", "==", node).get();
    const versionData = versionsDocs.docs[0].data();
    if (!versionData.accepted) {
      [batch, writeCounts] = await proposalNotification({
        batch,
        nodeId: nodeDoc.id,
        nodeTitle: nodeDoc.title,
        uname: "Iman",
        versionData,
        currentTimestamp,
        writeCounts,
      });
      await commitBatch(batch);
      const notificationNumsDocs: any = await db.collection("notificationNums").doc("A_wei").get();
      expect(writeCounts).toBeGreaterThan(0);
      expect(notificationNumsDocs.data().nNum).toEqual(1);
    }
  });
});
