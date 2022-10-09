import { admin, commitBatch, db } from "@/lib/firestoreServer/admin";

import { versionCreateUpdate } from "../../../src/utils";
import { getTypedCollections } from "../../../src/utils/getTypedCollections";
import {
  conceptVersionCommentsData,
  conceptVersionsData,
  MockData,
  nodesData,
  userConceptVersionsData,
} from "../../../testUtils/mockCollections";

describe("versionCreateUpdate", () => {

  const collects = [
    conceptVersionCommentsData,
    conceptVersionsData,
    nodesData,
    userConceptVersionsData,
  ];

  collects.push(new MockData([], "comMonthlyPoints"))
  collects.push(new MockData([], "comOthMonPoints"))
  collects.push(new MockData([], "comOthWeekPoints"))
  collects.push(new MockData([], "comOthersPoints"))
  collects.push(new MockData([], "comPoints"))
  collects.push(new MockData([], "comWeeklyPoints"))
  collects.push(new MockData([], "monthlyReputations"))
  collects.push(new MockData([], "othMonReputations"))
  collects.push(new MockData([], "othWeekReputations"))
  collects.push(new MockData([], "othersReputations"))
  collects.push(new MockData([], "reputations"))
  collects.push(new MockData([], "tags"))
  collects.push(new MockData([], "weeklyReputations"))

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("should perform versionCreateUpdate action with accepted version", async () => {
    let batch = db.batch();
    let writeCounts = 0;
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    let nodeRef: any = await db.collection("nodes").doc("tKxTypLrxds");
    let nodeDoc: any = await nodeRef.get();
    let { versionsColl, userVersionsColl }: any = getTypedCollections({
      nodeType: "Concept",
    });
    const versionsData = await versionsColl.doc("bkZvknixyiO1Ue7K9htZ").get();
    let data = versionsData.data();
    const userVersionsDoc = await userVersionsColl.where("node", "==", data.node).get();
    let userVersionsData = userVersionsDoc.docs[0].data();
    [batch, writeCounts] = await versionCreateUpdate({
      batch,
      nodeId: nodeDoc.id,
      nodeData: nodeDoc.data(),
      nodeRef: nodeRef,
      nodeType: "Concept",
      versionId: versionsData.id,
      versionData: data,
      newVersion: true,
      childType: false,
      voter: userVersionsData.version,
      correct: 1,
      wrong: 0,
      award: 0,
      addedParents: [],
      addedChildren: [],
      removedParents: [],
      removedChildren: [],
      currentTimestamp,
      writeCounts,
    });
    await commitBatch(batch);
    let updatedNodeDoc: any = await await db.collection("nodes").doc("tKxTypLrxds").get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(updatedNodeDoc.data()).toMatchObject({ adminPoints: 2, admin: "1man" });
  });

  it("should perform versionCreateUpdate action with not accepted version", async () => {
    let batch = db.batch();
    let writeCounts = 0;
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    let nodeRef: any = db.collection("nodes").doc("GJfzAY1zbgQs9jU5XeEL");
    let nodeDoc: any = await nodeRef.get();
    let { versionsColl, userVersionsColl }: any = getTypedCollections({
      nodeType: "Concept",
    });
    const versionsData = await versionsColl.doc("bkYvkniwziO1Ue6K1gtN").get();
    let data = versionsData.data();
    const userVersionsDoc = await userVersionsColl.where("node", "==", data.node).get();
    let userVersionsData = userVersionsDoc.docs[0].data();
    [batch, writeCounts] = await versionCreateUpdate({
      batch,
      nodeId: nodeDoc.id,
      nodeData: nodeDoc.data(),
      nodeRef: nodeRef,
      nodeType: "Concept",
      versionId: userVersionsData.version,
      versionData: data,
      newVersion: true,
      childType: false,
      voter: "1man",
      correct: 1,
      wrong: 0,
      award: 0,
      addedParents: [],
      addedChildren: [],
      removedParents: [],
      removedChildren: [],
      currentTimestamp,
      writeCounts,
    });
    await commitBatch(batch);
    let updatedNodeDoc: any = await db.collection("nodes").doc("GJfzAY1zbgQs9jU5XeEL").get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(updatedNodeDoc.data()).toMatchObject({
      versions: nodeDoc.data().versions + 1,
      adminPoints: 2,
      admin: "A_wei",
      studied: 0,
    });
  });
});
