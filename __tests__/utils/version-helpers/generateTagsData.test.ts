import { admin, commitBatch, db } from "../../../src/lib/firestoreServer/admin";
import { generateTagsData, getTypedCollections } from "../../../src/utils";
import { conceptVersionsData, MockData, nodesData, tagsData, usersData } from "../../../testUtils/mockCollections";

describe("generateTagsData", () => {
  const collects = [usersData, nodesData, tagsData, conceptVersionsData];

  collects.push(new MockData([], "comMonthlyPoints"));
  collects.push(new MockData([], "comOthMonPoints"));
  collects.push(new MockData([], "comOthWeekPoints"));
  collects.push(new MockData([], "comOthersPoints"));
  collects.push(new MockData([], "comPoints"));
  collects.push(new MockData([], "comWeeklyPoints"));

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.clean()));
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("should perform generateTagsData action with same tagIds on tags collection", async () => {
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    let nodeDoc: any = await db.collection("nodes").doc("9BVhNniLS940DBVqKbFR").get();
    const prevTagDocs: any = await db.collection("tags").where("node", "==", nodeDoc.id).get();
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", nodeDoc.id).get();
    let versionData = versionsDocs.docs[0].data();
    const proposer = versionData.proposer;
    let batch = db.batch();
    let writeCounts = 0;
    [batch, writeCounts] = await generateTagsData({
      batch,
      nodeId: nodeDoc.id,
      isTag: true,
      nodeUpdates: nodeDoc.data(),
      nodeTagIds: nodeDoc.data().tagIds,
      nodeTags: nodeDoc.data().tags,
      versionTagIds: versionData.tagIds,
      versionTags: versionData.tags,
      proposer,
      aImgUrl: nodeDoc.data().aImgUrl,
      aFullname: nodeDoc.data().aFullname,
      aChooseUname: nodeDoc.data().aChooseUname,
      currentTimestamp: currentTimestamp,
      writeCounts,
    });
    await commitBatch(batch);
    const tagDocs: any = await db.collection("tags").where("node", "==", nodeDoc.id).get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(tagDocs?.docs[0].data()).toMatchObject({ tagIds: prevTagDocs?.docs[0].data()?.tagIds });
  });

  it("should perform generateTagsData action without same tagIds on tags collection", async () => {
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    let nodeDoc: any = await db.collection("nodes").doc("iUex43wFn3yzFcDbma04").get();
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", nodeDoc.id).get();
    let versionData = versionsDocs.docs[0].data();
    const proposer = versionData.proposer;
    let batch = db.batch();
    let writeCounts = 0;
    [batch, writeCounts] = await generateTagsData({
      batch,
      nodeId: nodeDoc.id,
      isTag: true,
      nodeUpdates: nodeDoc.data(),
      nodeTagIds: nodeDoc.data().tagIds,
      nodeTags: nodeDoc.data().tags,
      versionTagIds: versionData.tagIds,
      versionTags: versionData.tags,
      proposer,
      aImgUrl: nodeDoc.data().aImgUrl,
      aFullname: nodeDoc.data().aFullname,
      aChooseUname: nodeDoc.data().aChooseUname,
      currentTimestamp: currentTimestamp,
      writeCounts,
    });
    await commitBatch(batch);
    const tagDocs: any = await db.collection("tags").where("node", "==", nodeDoc.id).get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(tagDocs?.docs[0].data()).toMatchObject({ tagIds: [nodeDoc.id] });
  });
});
