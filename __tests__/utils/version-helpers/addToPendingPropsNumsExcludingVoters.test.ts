import { commitBatch, db } from "@/lib/firestoreServer/admin";

import { addToPendingPropsNumsExcludingVoters } from "../../../src/utils";
import { getQueryCollections } from "../../../src/utils/getTypedCollections";
import { pendingPropsNumsData, usersData, userVersionsData, versionsData } from "../../../testUtils/mockCollections";

describe("addToPendingPropsNumsExcludingVoters", () => {
  beforeEach(async () => {
    await usersData.populate();
    await versionsData.populate();
    await userVersionsData.populate();
    await pendingPropsNumsData.populate();
  });

  afterEach(async () => {
    await usersData.clean();
    await versionsData.clean();
    await userVersionsData.clean();
    await pendingPropsNumsData.clean();
  });

  it("should perform action on  addToPendingPropsNumsExcludingVoters", async () => {
    let { versionsColl }: any = getQueryCollections();
    let batch = db.batch();
    let writeCounts = 0;
    const versionDoc = await versionsColl.doc("bkZvknixyiO1Ue7K9htZ").get();
    [batch, writeCounts] = await addToPendingPropsNumsExcludingVoters({
      batch,
      versionId: "bkZvknixyiO1Ue7K9htZ",
      nodeType: "Concept",
      tagIds: versionDoc.data().tagIds,
      value: 1,
      writeCounts,
      t: null,
      tWriteOperations: [],
    });

    await commitBatch(batch);
    const pendingPropsNumsDocs: any = await db.collection("pendingPropsNums").where("uname", "==", "1man").get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(pendingPropsNumsDocs.docs[0].data()).toMatchObject({ pNum: 1 });
  });
});
