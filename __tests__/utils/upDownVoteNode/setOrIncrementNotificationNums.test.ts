import { commitBatch, db } from "../../../src/lib/firestoreServer/admin";
import { setOrIncrementNotificationNums } from "../../../src/utils/upDownVoteNode";
import { notificationNumsData } from "../../../testUtils/mockCollections";

describe("setOrIncrementNotificationNums", () => {
  beforeEach(async () => {
    await notificationNumsData.populate();
  });

  afterEach(async () => {
    await notificationNumsData.clean();
  });

  it("Should create a new notificationNum document and set nNum to 1 when the document does not exits.", async () => {
    const writeCounts = 0;
    const batch = db.batch();

    const proposer = "does_not_exist";

    const [newBatch] = await setOrIncrementNotificationNums({ writeCounts, batch, proposer });

    await commitBatch(newBatch);

    const notificationNumDoc = await db.collection("notificationNums").doc(proposer).get();
    const notificationNumData = notificationNumDoc.data()!;
    expect(notificationNumDoc.exists).toBe(true);
    expect(notificationNumData.nNum).toEqual(1);
  });

  it("Should increment the nNum field fo the document when it exists previously.", async () => {
    const writeCounts = 0;
    const batch = db.batch();

    const proposer = "1man";

    const notificationNumRef = db.collection("notificationNums").doc(proposer);

    const beforeNotificationNumDoc = await notificationNumRef.get();
    const beforeNotificationNumData = beforeNotificationNumDoc.data()!;

    const [newBatch] = await setOrIncrementNotificationNums({ writeCounts, batch, proposer });
    await commitBatch(newBatch);

    const afterNotificationNumDoc = await notificationNumRef.get();
    const afterNotificationNumData = afterNotificationNumDoc.data()!;

    expect(beforeNotificationNumDoc.exists).toBe(true);
    expect(afterNotificationNumData.nNum).toEqual(beforeNotificationNumData.nNum + 1);
  });
});
