import { admin, commitBatch, db } from "../../../src/lib/firestoreServer/admin";
import { generateTagsData, getTypedCollections } from "../../../src/utils";
import { conceptVersionsData, nodesData, tagsData, usersData } from "../../../testUtils/mockCollections";

describe("generateTagsData", () => {
  beforeEach(async () => {
    await usersData.populate();
    await nodesData.populate();
    await tagsData.populate();
    await conceptVersionsData.populate();
  });

  afterEach(async () => {
    await usersData.clean();
    await nodesData.clean();
    await tagsData.clean();
    await conceptVersionsData.clean();
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
