import { commitBatch, db } from "@/lib/firestoreServer/admin";

import { addToPendingPropsNumsExcludingVoters } from "../../../src/utils";
import { getTypedCollections } from "../../../src/utils/getTypedCollections";
import {
  conceptVersionsData,
  pendingPropsNumsData,
  userConceptVersionsData,
  usersData,
} from "../../../testUtils/mockCollections";

describe("addToPendingPropsNumsExcludingVoters", () => {
  beforeEach(async () => {
    await usersData.populate();
    await conceptVersionsData.populate();
    await userConceptVersionsData.populate();
    await pendingPropsNumsData.populate();
  });

  afterEach(async () => {
    await usersData.clean();
    await conceptVersionsData.clean();
    await userConceptVersionsData.clean();
    await pendingPropsNumsData.clean();
  });

  it("should perform action on  addToPendingPropsNumsExcludingVoters", async () => {
    let { versionsColl }: any = getTypedCollections({
      nodeType: "Concept",
    });
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
    });
    await commitBatch(batch);
    const pendingPropsNumsDocs: any = await db.collection("pendingPropsNums").where("uname", "==", "1man").get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(pendingPropsNumsDocs.docs[0].data()).toMatchObject({ pNums: 1 });
  });
});
