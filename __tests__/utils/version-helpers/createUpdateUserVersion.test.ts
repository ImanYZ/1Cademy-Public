import { commitBatch, db } from "@/lib/firestoreServer/admin";

import { createUpdateUserVersion } from "../../../src/utils";
import { getQueryCollections } from "../../../src/utils/getTypedCollections";
import { MockData, userVersionsData } from "../../../testUtils/mockCollections";

describe("createUpdateUserVersion", () => {
  const collects = [userVersionsData];

  collects.push(new MockData([], "userVersionsLog"));

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("should perform createUpdateUserVersion action sepecifc nodeType", async () => {
    let batch = db.batch();
    let writeCounts = 0;
    let { userVersionsColl }: any = getQueryCollections();
    const versionsRef = await userVersionsColl.doc("ehViCqDju0mysa6kgwD1");
    const versionsData = await versionsRef.get();
    let data = { node: versionsData.node, ...versionsData.data() };
    data["user"] = "1man 1cademy";
    [batch, writeCounts] = await createUpdateUserVersion({
      batch,
      userVersionRef: versionsRef,
      userVersionData: data,
      nodeType: "Concept",
      writeCounts,
    });
    await commitBatch(batch);
    const versionDoc = await userVersionsColl.doc("ehViCqDju0mysa6kgwD1").get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(versionDoc.data()).toMatchObject({ user: "1man 1cademy" });
  });
});
