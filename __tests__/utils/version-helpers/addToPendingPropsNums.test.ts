import { commitBatch, db } from "../../../src/lib/firestoreServer/admin";
import { addToPendingPropsNums } from "../../../src/utils";
import { getQueryCollections } from "../../../src/utils/getTypedCollections";
import { nodesData, pendingPropsNumsData, usersData, versionsData } from "../../../testUtils/mockCollections";

describe("addToPendingPropsNums", () => {
  beforeEach(async () => {
    await nodesData.populate();
    await versionsData.populate();
    await pendingPropsNumsData.populate();
    await usersData.populate();
  });

  afterEach(async () => {
    await nodesData.clean();
    await versionsData.clean();
    await pendingPropsNumsData.clean();
    await usersData.clean();
  });

  it("should perform addToPendingPropsNums action on specifc nodeType", async () => {
    let batch = db.batch();
    let writeCounts = 0;
    let nodeDoc: any = await db.collection("nodes").doc("VnXTRolBGyHF3q8EvxS3").get();
    let { versionsColl }: any = getQueryCollections();
    const versionsDocs = await versionsColl.where("node", "==", nodeDoc.id).get();
    for (let versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();
      if (!versionData.accepted) {
        [batch, writeCounts] = await addToPendingPropsNums({
          batch,
          tagIds: versionData.tagIds,
          value: 1,
          voters: ["Iman"],
          writeCounts,
        });
        await commitBatch(batch);
        const pendingPropsNumsDocs: any = await db.collection("pendingPropsNums").where("uname", "==", "1man").get();
        expect(writeCounts).toBeGreaterThan(0);
        expect(pendingPropsNumsDocs.docs[0].data()).toBeDefined();
      }
    }
  });
});
