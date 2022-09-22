import { commitBatch,db } from "../../../src/lib/firestoreServer/admin";
import { addToPendingPropsNums } from "../../../src/utils";
import { getTypedCollections } from "../../../src/utils/getTypedCollections";
import { conceptVersionsData, pendingPropsNumsData, usersData } from "../../../testUtils/mockCollections";

describe("addToPendingPropsNums", () => {
  let node = "OR8UsmsxmeExHG8ekkIY";
  beforeEach(async () => {
    await conceptVersionsData.populate();
    await pendingPropsNumsData.populate();
    await usersData.populate();
  });

  afterEach(async () => {
    await conceptVersionsData.clean();
    await pendingPropsNumsData.clean();
    await usersData.clean();
  });

  it("should perform addToPendingPropsNums action on specifc nodeType", async () => {
    let batch = db.batch();
    let writeCounts = 0;
    let { versionsColl }: any = getTypedCollections({
      nodeType: "Concept",
    });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
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
        expect(writeCounts).toBeGreaterThan(0);
        await commitBatch(batch);
        const pendingPropsNumsDocs: any = await db.collection("pendingPropsNums").where("uname", "==", "1man").get();
        expect(writeCounts).toBeGreaterThan(0);
        expect(pendingPropsNumsDocs.docs[0].data()).toBeDefined();
      }
    }
  });
});
